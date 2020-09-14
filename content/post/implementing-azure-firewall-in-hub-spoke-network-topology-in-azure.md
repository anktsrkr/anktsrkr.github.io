---
title: "Implementing Azure Firewall in Hub-Spoke network topology in Azure" # Title of the blog post.
date: 2020-09-10T01:00:00+05:30 # Date of post creation.
description: "Implementing Azure Firewall in Hub-Spoke network topology in Azure" # Description used for search engine.
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
tags:
  - Azure
  - Networking
  - Azure Firewall
keywords: "hub spoke,hub spoke network,hub spoke network topology,azure hub spoke,azure hub spoke network,azure hub spoke network topology
,azure firewall,connectivity between spoke,connectivity between spoke vnet using azure firewall,azure powershell,Point to Site, Site to Site,VPN"
---

Hi Everyone!

This post is continuation of how to series about Hub-Spoke network topology in Azure. Over the time, I will updated this page with links to individual posts : 

[Connect an on-premises network to a Microsoft Azure - Part 1](/post/connect-azure-with-your-on-prem-network-part-1)

[Connect an on-premises network to a Microsoft Azure - Part 2](/post/connect-azure-with-your-on-prem-network-part-2)

[Implementing Hub-Spoke network topology in Azure - Part 1](/post/implementing-hub-spoke-network-topology-in-azure-part-1)

[Implementing Hub-Spoke network topology in Azure - Part 2](/post/implementing-hub-spoke-network-topology-in-azure-part-2)

[Introducing Azure Firewall in Hub-Spoke network topology in Azure](/post/introducing-azure-firewall-in-hub-spoke-network-topology-in-azure)

_This Post - Implementing Azure Firewall in Hub-Spoke network topology in Azure_

Now we are able to connect between Hub and Spokes but there is no communication between Spokes. In this post we are going to see how Intra-Region Spokes VNET routing works. 

We will start by creating Azure Firewall. Like gateway subnet, Azure firewall also need dedicated subnet for it. Since azure firewall is shared service, we will put it in hub-vnet. Let's create a subnet called `AzurefirwallSubnet` in hub-vnet. Azure Firewall needs a `/26` subnet size because it ensures that the firewall has enough IP addresses available to provision more virtual machine instances as it scales.
{{< highlight powershell >}}
$LocationName = "centralindia"
$ResourceGroupName = "network-sandbox"

#Create AzureFirewallSubnet in Hub Vnet
$vnetName = "hub-vnet"
$azfirewallvnetAddressSpace = "10.10.10.0/26"

$hubVnet = Get-AzVirtualNetwork `
              -Name $vnetName

$azureFirewallSubnet = Add-AzVirtualNetworkSubnetConfig `
                          -Name "AzureFirewallSubnet" `
                          -AddressPrefix $azfirewallvnetAddressSpace `
                          -VirtualNetwork $hubVnet

$updateHubVnet = Set-AzVirtualNetwork `
                    -VirtualNetwork $hubVnet
{{< /highlight >}}
Once subnet is ready we will provision azure firewall. We will also need public ip for firewall. We will wait till this process is finished because we need the private ip for our next step. 
{{< highlight powershell >}}
# Get a Public IP for the firewall
$azFirewallName = "HubAzFirewall"

$firewallPip = New-AzPublicIpAddress `
                  -ResourceGroupName $ResourceGroupName `
                  -Location $LocationName `
                  -AllocationMethod Static `
                  -Sku Standard `
                  -Name "$($azFirewallName)-PublicIp"


# Create the firewall
$azFirewall = New-AzFirewall `
                 -Name $azFirewallName `
                 -ResourceGroupName $ResourceGroupName  `
                 -Location $LocationName `
                 -VirtualNetworkName $updateHubVnet.Name`
                 -PublicIpName $firewallPip.Name
{{< /highlight >}}
Once done, we will create a user defined route so that all the outbound flow first goes to azure firewall. 
{{< highlight powershell >}}
#Create route table
$spoke1ToAzFwUdr = New-AzRouteTable `
                      -Name 'Spoke1ToAzFwUdr' `
                      -ResourceGroupName $ResourceGroupName `
                      -location $LocationName

$updatedSpoke1ToAzFwUdr = $spoke1ToAzFwUdr `
                            | Add-AzRouteConfig `
                                 -Name "ToAzureFirewall" `
                                 -AddressPrefix 0.0.0.0/0 `
                                 -NextHopType "VirtualAppliance" `
                                 -NextHopIpAddress $azFirewall.IpConfigurations.privateipaddress `
                            | Set-AzRouteTable
{{< /highlight >}}
Next, we will add route table to subnet from where they need to communicate each other. In our case, `WorkloadSubnet` of `spoke1-vnet` needs to communicate with `WorkloadSubnet` of `spoke2-vnet`. So we will attach newly created UDR to both subnet.
{{< highlight powershell >}}
$subNetinspokeVnet ="WorkloadSubnet"
$spoke1VnetName = "spoke1-vnet"
                     
$spoke1Vnet = Get-AzVirtualNetwork `
                           -Name $spoke1VnetName

$WorkloadSubnetAddressSpaceForSpoke1 = "10.20.1.0/24"

$spoke1Vnet =  Set-AzVirtualNetworkSubnetConfig `
                 -VirtualNetwork $spoke1Vnet `
                 -Name $subNetinspokeVnet `
                 -AddressPrefix $WorkloadSubnetAddressSpaceForSpoke1 `
                 -RouteTable $spokeToAzFwUdr | `
              Set-AzVirtualNetwork

$spoke2VnetName = "spoke2-vnet"
                     
$spoke2Vnet = Get-AzVirtualNetwork `
                           -Name $spoke2VnetName

$WorkloadSubnetAddressSpaceForSpoke2 = "10.30.1.0/24"

$spoke1Vnet =  Set-AzVirtualNetworkSubnetConfig `
                 -VirtualNetwork $spoke2Vnet `
                 -Name $subNetinspokeVnet `
                 -AddressPrefix $WorkloadSubnetAddressSpaceForSpoke2 `
                 -RouteTable $spokeToAzFwUdr | `
              Set-AzVirtualNetwork
{{< /highlight >}}
All Set! Now _Next Hop_ for every request generating from `Spok1JumpBox` and `Spoke2JumpBox` is Azure firewall, So we just need to allow the flow from `WorkloadSubnet` of `spoke1-vnet` to `WorkloadSubnet` of `spoke2-vnet`. To do that, we will create network rule in azure firewall.
{{< highlight powershell >}}
$sourceAddress = "10.20.1.0/24"

$destinationAddress ="10.30.1.0/24"

$spoke1ToSpoke2 = New-AzFirewallNetworkRule `
                     -Name "Allow-Spoke2-Routing" `
                     -Protocol TCP `
                     -SourceAddress $sourceAddress `
                     -DestinationAddress $destinationAddress `
                     -DestinationPort *
           
$netRuleCollection = New-AzFirewallNetworkRuleCollection `
                        -Name "Spoke-to-Spoke" `
                        -Priority 1000 `
                        -Rule $spoke1ToSpoke2 `
                        -ActionType "Allow"
           
$azFirewall.NetworkRuleCollections.Add($netRuleCollection)
$updatedFirewall = Set-AzFirewall -AzureFirewall $azFirewall
{{< /highlight >}}
At this point, Spoke2JumpBox is accessible from Spoke1JumpBox!! However, Spoke1JumpBox is not accessible from Spoke2JumpBox, to enable that we just need to add a network rule, that's it!
![spoke2-vnet is reachable from spoke1-vnet](/images/hub-spoke/spoke1-to-spoke2-reachable.jpg)
Let's go to https://www.microsoft.com/ from Spoke1JumpBox. Oops! unable to reach, what happen? As I mentioned earlier, by default  all connections are denied from Azure firewall. So, create a application rule to allow google and lets see how it works.
{{< highlight powershell >}}
$allowGoogle = New-AzFirewallApplicationRule `
                  -Name "Allow-Google"  `
                  -SourceAddress $sourceAddress `
                  -Protocol http, https  `
                  -TargetFqdn www.google.com

$appRuleCollection = New-AzFirewallApplicationRuleCollection `
                        -Name "Allow-Internet" `
                        -Priority 2000 `
                        -ActionType Allow `
                        -Rule $allowGoogle `

$azFirewall.ApplicationRuleCollections.Add($appRuleCollection)
$updatedFirewall = Set-AzFirewall -AzureFirewall $azFirewall
{{< /highlight >}}
Once applied, We are able to reach Google! Yay!! 
![Filtered internet access](/images/hub-spoke/filtered-internet-access.jpg)
You can also control inbound internet traffic with Azure Firewall DNAT. Assume, your VPN is not working but you have to access HubJumpBox which only have private it. So how to access it? One of the way to access it by creating a DNAT rule.
{{< highlight powershell >}}
$rdpToHubJumpbox =  New-AzFirewallNatRule `
                       -Name "RDP To HubJumpBox" `
                       -Protocol "TCP" `
                       -SourceAddress * `
                       -DestinationAddress $firewallPip.IpAddress `
                       -DestinationPort "4500" `
                       -TranslatedAddress "10.10.1.4" `
                       -TranslatedPort "3389"


$natRuleCollection = New-AzFirewallNatRuleCollection `
                       -Name "Allow-RDP-To-HubJumpBox" `
                       -Priority 500 `
                       -Rule $rdpToHubJumpbox

$azFirewall.NatRuleCollections.Add($natRuleCollection)

$updatedFirewall = Set-AzFirewall -AzureFirewall $azFirewall
{{< /highlight >}}
Once applied, You will be able to access your RDP over firewall public ip and port `4500`!
So basically, by introducing azure firewall you just enable more security in whole architecture.
Here is the final architecture, we just implemented - 

![Updated architecture](/images/hub-spoke/final-architecture.jpg)

### Ending Note
This whole series is based on single subscription, intra-region vnet communication.This works for small companies but for enterprise, inter-region vnet integration, multiple subscriptions is very common and also Azure Expressroute will be in use for extending On-Premise network and it involves a lot of network appliances, firewall etc. So, basically it is complex but if you get the idea of whole architecture, you good to go!

