---
title: >-
  Connect privately to Azure PaaS resources using Azure Private Endpoint from
  on-prem
date: 2020-09-14T19:30:00.000Z
description: >-
  Connect privately to a Azure PaaS resources using Azure Private Endpoint from
  on-prem
featured: true
draft: false
toc: false
thumbnailImage: /images/azure.png
thumbnailImagePosition: left
shareImage: /images/path/share.png
codeMaxLines: 10
codeLineNumbers: false
figurePositionShow: true
series: Azure Internal DNS
categories:
  - Hub-Spoke Topology
tags:
  - Azure
  - Networking
  - Azure Private DNS Zone
  - Azure Private link
keywords: []
comments: true
showSocial: true
---
Hi Everyone!

In this post we are are going to explore different ways to connect Azure PaaS resources from On-premise network privately and securely. While deploying Azure PaaS service such as Azure SQL, Azure Storage etc. it always come with public facing endpoint many customer was not happy with that because of security concerns. So Microsoft introduces `Virtual Network Service Endpoints`. This will allow customers to secure and direct connectivity to Azure services over an optimized route over the Azure backbone network. Endpoints allow you to secure your Azure resources to only your virtual networks and also it enables private IP addresses in the VNet to reach the endpoint of an Azure service without needing a public IP address on the VNet but technically Azure resources still has a Public IP - it’s just a redirection of traffic. 

Service Endpoint needs to be enable at `Subnet` level and for specific azure service, which means any resource which are in same subnet can be connected, this is security risk. One way to mitigate is to create subnet for each resource which may not be idea scenario and not feasible for enterprise. Other way to mitigate the same issue by using `Service Endpoint Policy` to filter virtual network traffic to specific Azure resources, over service endpoints. 

So, I believe you got the idea that `Service Endpoint` is defintly a way to communicate over azure backbone but this is not the best solution. So, Microsoft Azure came up with a concept of `Azure Private Endpoint`.

#### What is Private Endpoint?
>Azure Private Endpoint is a network interface that connects you privately and securely to a service powered by Azure Private Link. Private Endpoint uses a private IP address from your VNet, effectively bringing the service into your VNet. The service could be an Azure service such as Azure Storage, Azure Cosmos DB, SQL, etc.<cite>[^1]</cite>

[^1]:  [What is Azure Private Endpoint?](https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-overview)
 
 In this case Traffic between your virtual network and the azure resource travels the Microsoft backbone network. Exposing resources to the public internet is no longer necessary.

 Now let's setup a Private Endpoint for Azure Blob Storage and see how traffic follows over private ip between on-prem and spokes. I will assume you already have DNS forwarder in Azure and knows about Azure DNS Private Zone and you have hub spokes vnet setup and connected with on-prem network. If you are not sure about all of this I will suggest to go though my previous [posts](/categories/hub-spoke-topology/)

First we are going to create a `subnet` where all of our private endpoints will reside. I prefer to keep private endpoint to keep in a separate subnet but it is up to you where you want to keep that. Also my personal choice is to keep shared services private endpoints in `hub-vnet` and application specific private endpoints in `spoke-vnet`.


```powershell

#create subnet for hub
$hubvnetName = "hub-vnet"
$hubpvtlnksubnet = "10.10.29.0/24"

$hubVnet = Get-AzVirtualNetwork `
              -Name $hubvnetName

Add-AzVirtualNetworkSubnetConfig `
   -Name "PrivatelinkSubnet" `
   -AddressPrefix $hubpvtlnksubnet `
   -VirtualNetwork $hubVnet `
   -PrivateEndpointNetworkPoliciesFlag "Disabled"

Set-AzVirtualNetwork `
   -VirtualNetwork $hubVnet

#create subnet for spoke1
$spoke1vnetName = "spoke1-vnet"
$spoke1pvtlnksubnet = "10.20.29.0/24"

$spoke1Vnet = Get-AzVirtualNetwork `
              -Name $spoke1vnetName

Add-AzVirtualNetworkSubnetConfig `
   -Name "PrivatelinkSubnet" `
   -AddressPrefix $spoke1pvtlnksubnet `
   -VirtualNetwork $spoke1Vnet `
   -PrivateEndpointNetworkPoliciesFlag "Disabled"

Set-AzVirtualNetwork `
   -VirtualNetwork $spoke1Vnet
```


Next, we are going to create a Azure Blog Storage.


```powershell

$LocationName = "centralindia"
$ResourceGroupName = "storage-sandbox"

New-AzStorageAccount -ResourceGroupName $ResourceGroupName `
                     -Name "hubstorageindia" `
                     -SkuName Standard_LRS `
                     -Location $LocationName `
                     -Kind BlobStorage `
                     -AccessTier Hot `
                     -AllowBlobPublicAccess $false `
                     -NetworkRuleSet (@{defaultAction="Deny";bypass="None"}) `
                     -MinimumTlsVersion TLS1_2
```


Now, Let's create a private link for this blob storage and I am keeping this storage account in `hub-vnet`


```powershell

$blob= Get-AzStorageAccount `
          -ResourceGroupName "storage-sandbox" `
          -Name "hubstorageindia"

$LocationName = "centralindia"
$NetworkResourceGroupName = "network-sandbox"

$virtualNetwork = Get-AzVirtualNetwork `
                     -ResourceGroupName $NetworkResourceGroupName `
                     -Name "hub-vnet"  
 
$subnet = $virtualNetwork `
                | Select-Object -ExpandProperty subnets `
                | Where-Object  {$_.Name -eq 'PrivatelinkSubnet'}  

$privateEndpointConnection = New-AzPrivateLinkServiceConnection `
                                -Name "BlobPrivatLinkServiceConnection" `
                                -PrivateLinkServiceId $blob.Id `
                                -GroupId "blob"
 
$privateEndpoint = New-AzPrivateEndpoint `
                      -ResourceGroupName $NetworkResourceGroupName `
                      -Name "hubstorageindia-private-link" `
                      -Location $LocationName `
                      -Subnet  $subnet `
                      -PrivateLinkServiceConnection $privateEndpointConnection
```


Next step to create a Azure Private DNS zone this will help us to access this storage account using FQDN.


```powershell

$ResourceGroupName = "dns-sandbox"
$ZoneName ="privatelink.blob.core.windows.net"
$hubVnet = Get-AzVirtualNetwork `
              -Name "hub-vnet"

$zone = New-AzPrivateDnsZone `
           -ResourceGroupName $ResourceGroupName `
           -Name $ZoneName

$link  = New-AzPrivateDnsVirtualNetworkLink `
            -ResourceGroupName $ResourceGroupName `
            -ZoneName $ZoneName `
            -Name "LinkWithHub" `
            -VirtualNetworkId $hubVnet.Id

$config = New-AzPrivateDnsZoneConfig `
             -Name $ZoneName `
             -PrivateDnsZoneId $zone.ResourceId

$privateDnsZoneGroup = New-AzPrivateDnsZoneGroup `
                          -ResourceGroupName "network-sandbox" `
                          -PrivateEndpointName "hubstorageindia-private-link" `
                          -name "blob-zone-grp" `
                          -PrivateDnsZoneConfig $config
```


After this step, If you are accessing `hubstorageindia.blob.core.windows.net` from `hub-vnet` virtual machine it should be accessible using private ip only, because Azure DNS Private Zone is linked with `hub-vnet`. But if you try the same from on-premise network or spoke vnets using FQDN that will not work. 
To overcome this, you will need DNS forwarder in Azure and all vnets should be pointed to DNS forwarder server. But if you already have on-premise DNS server then you will have to configure Conditional Forwarding to make it work.
#### Limitation
You should know that Network Security Group (NSG) rules and User Defined Routes do not apply to Private Endpoint.
