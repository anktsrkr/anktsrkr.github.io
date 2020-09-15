---
title: "Implementing Hub-Spoke network topology in Azure - Part 2" # Title of the blog post.
date: 2020-09-08T01:00:00+05:30 # Date of post creation.
description: "Implementing Hub-Spoke network topology in Azure" # Description used for search engine.
featured: false # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnail: "/images/azure.png" # Sets thumbnail image appearing inside card on homepage.
shareImage: "/images/path/share.png" # Designate a separate image for social media sharing.
codeMaxLines: 10 # Override global value for how many lines within a code block before auto-collapsing.
codeLineNumbers: false # Override global value for showing of line numbers within code block.
figurePositionShow: true # Override global value for showing the figure label.
series : "Hub-Spoke network topology in Azure"
categories:
  - Cloud
  - Azure architecture
  - Hub-Spoke Topology
tags:
  - Azure
  - Networking
keywords: "hub spoke,hub spoke network,hub spoke network topology,azure hub spoke,azure hub spoke network,azure hub spoke network topology
,azure firewall,connectivity between spoke,connectivity between spoke vnet using azure firewall,azure powershell,Point to Site, Site to Site,VPN"
---

Hi Everyone!

This post is continuation of how to series about Hub-Spoke network topology in Azure. Over the time, I will updated this page with links to individual posts : 

[Connect an on-premises network to a Microsoft Azure - Part 1](/post/connect-azure-with-your-on-prem-network-part-1)

[Connect an on-premises network to a Microsoft Azure - Part 2](/post/connect-azure-with-your-on-prem-network-part-2)

[Implementing Hub-Spoke network topology in Azure - Part 1](/post/implementing-hub-spoke-network-topology-in-azure-part-1)

_This Post - Implementing Hub-Spoke network topology in Azure - Part 2_

[Introducing Azure Firewall in Hub-Spoke network topology in Azure](/post/introducing-azure-firewall-in-hub-spoke-network-topology-in-azure)

[Implementing Azure Firewall in Hub-Spoke network topology in Azure](/post/implementing-azure-firewall-in-hub-spoke-network-topology-in-azure)

Now, we know the context of this topology and architecture let's start to implement it. In this post, I am going to use azure powershell module to create all azure resources. 
 
In my [second post](/post/connect-azure-with-your-on-prem-network-part-2/) of this series we have already created `hub-vnet`.

Let's create Spoke 1 Virtual Network(`spoke1-vnet`), with address space `10.20.0.0/19`. We will also create a subnet `WorkloadSubnet` under Spoke1 virtual network with address space `10.20.1.0/24`

{{< highlight powershell >}}
$LocationName = "centralindia"
$ResourceGroupName = "network-sandbox"
$vnetName = "spoke1-vnet"
$defaultSubnet = "WorkloadSubnet"
$vnetAddressSpace = "10.20.0.0/19"
$subnetvnetAddressSpace = "10.20.1.0/24"

$virtualNetwork = New-AzVirtualNetwork `
                     -ResourceGroupName $ResourceGroupName `
                     -Location $LocationName `
                     -Name $vnetName `
                     -AddressPrefix $vnetAddressSpace

$subnetConfig = Add-AzVirtualNetworkSubnetConfig `
                   -Name $defaultSubnet `
                   -AddressPrefix $subnetvnetAddressSpace `
                   -VirtualNetwork $virtualNetwork


$virtualNetwork = $virtualNetwork | Set-AzVirtualNetwork
{{< /highlight >}}


 Please note, by default DDoS protection plan as Basic is selected, but it is highly recommended to enable DDoS protection plan for your production environment and this is applicable for all of your virtual networks.

Next create Spoke 2 Virtual Network(`spoke2-vnet`), with address space `10.30.0.0/19`. We will also create a subnet `WorkloadSubnet` under Spoke1 virtual network with address space `10.30.1.0/24`


{{< highlight powershell >}}
$LocationName = "centralindia"
$ResourceGroupName = "network-sandbox"
$vnetName = "spoke2-vnet"
$defaultSubnet = "WorkloadSubnet"
$vnetAddressSpace = "10.30.0.0/19"
$subnetvnetAddressSpace ="10.30.1.0/24"

$virtualNetwork = New-AzVirtualNetwork `
                     -ResourceGroupName $ResourceGroupName `
                     -Location $LocationName `
                     -Name $vnetName `
                     -AddressPrefix $vnetAddressSpace

$subnetConfig = Add-AzVirtualNetworkSubnetConfig `
                   -Name $defaultSubnet `
                   -AddressPrefix $subnetvnetAddressSpace `
                   -VirtualNetwork $virtualNetwork

$virtualNetwork = $virtualNetwork | Set-AzVirtualNetwork
{{< /highlight >}}


Two virtual networks can not talk to each other, so by default `hub-vnet` will not be able to connect with `spoke1-vnet` and `spoke2-vnet`. So, to make it work we need to enable vnet-peering between hub and spokes.

Let's create vnet peering between hub and spokes:  

{{< highlight powershell >}}
$hubvnetName = "hub-vnet"
$hubVnet = Get-AzVirtualNetwork `
              -Name $hubvnetName

$spoke1vnetName = "spoke1-vnet"
$spoke1Vnet = Get-AzVirtualNetwork `
                 -Name $spoke1vnetName

$spoke2vnetName = "spoke2-vnet"
$spoke2Vnet = Get-AzVirtualNetwork `
                 -Name $spoke2vnetName


# Peer Hub to Spoke 1.
Add-AzVirtualNetworkPeering -Name 'LinkHubToSpoke1' `
                            -VirtualNetwork $hubVnet `
                            -RemoteVirtualNetworkId $spoke1Vnet.Id

# Peer Spoke 1 to Hub.
Add-AzVirtualNetworkPeering -Name 'LinkSpoke1ToHub' `
                            -VirtualNetwork $spoke1Vnet `
                            -RemoteVirtualNetworkId $hubVnet.Id

# Peer Hub to Spoke 2.
Add-AzVirtualNetworkPeering -Name 'LinkHubToSpoke2' `
                            -VirtualNetwork $hubVnet `
                            -RemoteVirtualNetworkId $spoke2Vnet.Id

# Peer Spoke 2 to Hub.
Add-AzVirtualNetworkPeering -Name 'LinkSpoke2ToHub' `
                            -VirtualNetwork $spoke2Vnet `
                            -RemoteVirtualNetworkId $hubVnet.Id
{{< /highlight >}}

> **_NOTE:_**  You can also provide resource id if you do not have read access to the virtual network or subscription you wish to peer with.

Once done, peering status should show as connected :

![hub-vnet to spoke1-vnet peering connected](/images/hub-spoke/hub-to-spoke1-peering-connected.jpg)

The interesting part is I have created peering between hub and spokes but not between spoke1 and spoke2, so spoke1 and spoke2 can not communicate with each other. you can ask me, can't we create peering between them? Yes! you can but you should not, I will try to explain the reason in next part and will show you how communication will be done between spokes if needed.


Now for testing purpose, we are going to create JumpBox with IIS enabled in 3 different virtual network. None of these virtual machine will have public ip also no ports are open from NSG except the communication within VNet.

{{< highlight powershell >}} 
# Create Virtual Machine
$LocationName = Read-Host `
                    -Prompt 'Enter Location'
$ResourceGroupName = Read-Host `
                         -Prompt 'Enter Resource Group Name'

$VMName = Read-Host `
              -Prompt 'Enter Virtual Machine Name'
$ComputerName = $VMName
$VMSize = "Standard_B1ms"

$NetworkName = Read-Host `
                   -Prompt 'Enter Virtual Network Name'
$SubnetName = Read-Host `
                  -Prompt 'Enter Subnet Name'
 
$NICName = "$($VMName)-Nic"

$rdpRule = New-AzNetworkSecurityRuleConfig `
              -Name Rdp-Rule `
              -Description "Allow RDP" `
              -Access Allow `
              -Protocol Tcp `
              -Direction Inbound `
              -Priority 1000 `
              -SourceAddressPrefix Internet `
              -SourcePortRange * `
              -DestinationAddressPrefix * `
              -DestinationPortRange 3389

$networkSecurityGroup = New-AzNetworkSecurityGroup `
                           -ResourceGroupName $ResourceGroupName `
                           -Location $LocationName `
                           -Name "$($VMName)-Nsg" `
                           -SecurityRules $rdpRule

$Vnet = Get-AzVirtualNetwork `
            -Name $NetworkName
$SingleSubnet = Set-AzVirtualNetworkSubnetConfig `
                   -VirtualNetwork $Vnet `
                   -Name $SubnetName `
                   -NetworkSecurityGroup $networkSecurityGroup

$Vnet = Set-AzVirtualNetwork `
           -VirtualNetwork $VNET

$SingleSubnet = Get-AzVirtualNetworkSubnetConfig `
                   -VirtualNetwork $Vnet `
                   -Name $SubnetName `

$NIC = Get-AzNetworkInterface `
          -Name $NICName
$PipRequired = Read-Host `
                   -Prompt 'Do you want to enable public ip for this virtual machine? (Press Y to Yes)'

if($PipRequired -eq "Y"){
    $Pip = New-AzPublicIpAddress `
              -ResourceGroupName $ResourceGroupName `
              -Location $LocationName `
              -AllocationMethod Dynamic `
              -Sku Basic `
              -Name "$($VMName)-PublicIp"

$ipconfig = New-AzNetworkInterfaceIpConfig `
               -Name "$($VMName)-IpConfig" `
               -Subnet $SingleSubnet -PublicIpAddress $Pip
}
else {
$ipconfig = New-AzNetworkInterfaceIpConfig `
               -Name "$($VMName)-IpConfig" `
               -Subnet $SingleSubnet
}

$NIC = New-AzNetworkInterface `
          -Name $NICName `
          -ResourceGroupName $ResourceGroupName `
          -Location $LocationName `
          -IpConfiguration $ipconfig

$Credential = Get-Credential `
                 -Message "Enter a username and password for the virtual machine"

$VirtualMachine = New-AzVMConfig `
                     -VMName $VMName `
                     -VMSize $VMSize

$VirtualMachine = Set-AzVMBootDiagnostic `
                     -VM $VirtualMachine `
                     -Disable

$VirtualMachine = Set-AzVMOperatingSystem `
                     -VM $VirtualMachine `
                     -Windows `
                     -ComputerName $ComputerName `
                     -Credential $Credential `
                     -ProvisionVMAgent `
                     -EnableAutoUpdate

$VirtualMachine = Add-AzVMNetworkInterface `
                     -VM $VirtualMachine `
                     -Id $NIC.Id
$VirtualMachine = Set-AzVMSourceImage `
                     -VM $VirtualMachine `
                     -PublisherName 'MicrosoftWindowsServer' `
                     -Offer 'WindowsServer' `
                     -Skus '2019-Datacenter' `
                     -Version latest
$VirtualMachine = Set-AzVMOSDisk `
                     -VM $VirtualMachine `
                     -Name "$($VMName)-OsDisk" `
                     -StorageAccountType "Standard_LRS" `
                     -Windows `
                     -DiskSizeInGB 127 `
                     -CreateOption FromImage 

New-AzVM `
   -ResourceGroupName $ResourceGroupName `
   -Location $LocationName `
   -VM $VirtualMachine `
   -Verbose


# Install IIS
$PublicSettings = '{"commandToExecute":"powershell Add-WindowsFeature Web-Server"}'

Set-AzVMExtension `
        -ExtensionName "IIS" `
        -ResourceGroupName $ResourceGroupName `
        -VMName $VMName `
        -Publisher "Microsoft.Compute" `
        -ExtensionType "CustomScriptExtension" -TypeHandlerVersion 1.4 `
        -SettingString $PublicSettings -Location $LocationName
{{< /highlight >}}

Once completed, Connect you VPN and let's see how data flows between hub to spokes from you local workspace.

#### Local workspace To Hub

Since, we have established the VPN connection, Hub is reachable from local workspace.

![Hub vnet reachable from Local workspace over VPN](/images/hub-spoke/over-vpn-hub-reachable.jpg)

#### Hub To Spokes

Since, we have established the peering between Hub and spokes, these spokes are reachable from hub.

![Spoke vnets are reachable from Hub vnet](/images/hub-spoke/hub-to-spokes-reachable.jpg)


#### Spokes To Hub

Hub is also reachable from both spokes.

![Hub vnet is reachable from Spoke 1 vnet](/images/hub-spoke/spoke1-to-hub-reachable.jpg)

![Hub vnet is reachable from Spoke 2 vnet](/images/hub-spoke/spoke2-to-hub-reachable.jpg)

#### Local workspace To Spokes
Spokes are not reachable from local workspaces. It supposed to work right? To make it work, you need to perform some more steps - 

1. Configure all peering connections to allow forwarded traffic.
2. Configure the peering connection in the hub to allow gateway transit.
{{< highlight powershell >}}
$resourceGroupName = "network-sandbox"
$hubvnetName = "hub-vnet"

# Update Hub to Spoke 1.
$LinkHubToSpoke1 = Get-AzVirtualNetworkPeering `
                      -VirtualNetworkName $hubvnetName `
                      -ResourceGroupName $resourceGroupName `
                      -Name "LinkHubToSpoke1"

$LinkHubToSpoke1.AllowGatewayTransit = $True
$LinkHubToSpoke1.AllowForwardedTraffic = $True

Set-AzVirtualNetworkPeering -VirtualNetworkPeering $LinkHubToSpoke1


# Update Hub to Spoke 2.
$LinkHubToSpoke2 = Get-AzVirtualNetworkPeering `
                      -VirtualNetworkName $hubvnetName `
                      -ResourceGroupName $resourceGroupName `
                      -Name "LinkHubToSpoke2"

$LinkHubToSpoke2.AllowGatewayTransit = $True
$LinkHubToSpoke2.AllowForwardedTraffic = $True

Set-AzVirtualNetworkPeering -VirtualNetworkPeering $LinkHubToSpoke2
{{< /highlight >}}

3. Configure the peering connection in each spoke to use remote gateways.
{{< highlight powershell >}}
$resourceGroupName = "network-sandbox"
# Update Spoke 1 to Hub.

$spoke1vnetName = "spoke1-vnet"
$LinkSpoke1ToHub = Get-AzVirtualNetworkPeering `
                      -VirtualNetworkName $spoke1vnetName `
                      -ResourceGroupName $resourceGroupName `
                      -Name "LinkSpoke1ToHub"

$LinkSpoke1ToHub.UseRemoteGateways = $True
$LinkSpoke1ToHub.AllowForwardedTraffic = $True

Set-AzVirtualNetworkPeering -VirtualNetworkPeering $LinkSpoke1ToHub

# Update Spoke 2 to Hub.

$spoke2vnetName = "spoke2-vnet"
$LinkSpoke2ToHub = Get-AzVirtualNetworkPeering `
                      -VirtualNetworkName $spoke2vnetName `
                      -ResourceGroupName $resourceGroupName `
                      -Name "LinkSpoke2ToHub"

$LinkSpoke2ToHub.UseRemoteGateways = $True
$LinkSpoke2ToHub.AllowForwardedTraffic = $True

Set-AzVirtualNetworkPeering -VirtualNetworkPeering $LinkSpoke2ToHub
{{< /highlight >}}

After virtual network peering is established **download and reinstall** the point-to-site package so that the point-to-site clients get the updated routes to the spoke virtual network.

![Hub vnet reachable from Local workspace over VPN](/images/hub-spoke/over-vpn-spokes-reachable.jpg)

#### Spoke To Spoke
Interesting! if you see the above screenshot, communication between spokes are not working. Why?  Let's discuss it in the [next post](/post/introducing-azure-firewall-in-hub-spoke-network-topology-in-azure/) 
!

Here is the updated architecture, we just implemented - 


![Updated architecture](/images/hub-spoke/implemented-hub-spoke-topology.jpg)
