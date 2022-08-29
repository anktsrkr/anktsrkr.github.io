---
title: "Introducing Azure Firewall in Hub-Spoke network topology in Azure" # Title of the blog post.
date: 2020-09-09T01:00:00+05:30 # Date of post creation.
description: "Introducing Azure Firewall in Hub-Spoke network topology in Azure" # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnailImage: "/images/azure.png" # Sets thumbnail image appearing inside card on homepage.
thumbnailImagePosition: left
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
  - Azure Firewall
keywords: "hub spoke,hub spoke network,hub spoke network topology,azure hub spoke,azure hub spoke network,azure hub spoke network topology
,azure firewall,connectivity between spoke,connectivity between spoke vnet using azure firewall,azure powershell,azure Firewall in Hub-Spoke network topology in azure,Point to Site, Site to Site,VPN"
---

Hi Everyone!

This post is continuation of how to series about Hub-Spoke network topology in Azure. Over the time, I will update this page with links to individual posts : 

[Connect an on-premises network to a Microsoft Azure - Part 1](/post/connect-azure-with-your-on-prem-network-part-1)

[Connect an on-premises network to a Microsoft Azure - Part 2](/post/connect-azure-with-your-on-prem-network-part-2)

[Implementing Hub-Spoke network topology in Azure - Part 1](/post/implementing-hub-spoke-network-topology-in-azure-part-1)

[Implementing Hub-Spoke network topology in Azure - Part 2](/post/implementing-hub-spoke-network-topology-in-azure-part-2)

_This Post - Introducing Azure Firewall in Hub-Spoke network topology in Azure_

[Implementing Azure Firewall in Hub-Spoke network topology in Azure](/post/implementing-azure-firewall-in-hub-spoke-network-topology-in-azure)

Now we are able to connect between Hub and Spokes but there is no communication between Spokes. In this post we are going to see how Intra-Region Spokes VNET routing works. 

## Ways to establish Spoke to Spoke communication 

There are three ways Spokes can talk to each other. All has it's own pros and cons.

#### 1. Leveraging ExpressRoute <cite>[^1]</cite>
 If ExpressRoute is in use to allow connectivity from on-prem locations, we can leverage the ExpressRoute circuit to provide native spoke to spoke communication. Either a default route (0.0.0.0/0) or a summary route comprising all the networks for the region VNETs can be injected via BGP across ExpressRoute.

[^1]:  [Leveraging Expressroute](https://github.com/microsoft/Common-Design-Principles-for-a-Hub-and-Spoke-VNET-Archiecture#option-1-leveraging-expressroute)

__Pros__
* By advertising a default or summary route, we provide the ability for spoke to spoke routing natively within the Azure backbone via the MSEEs(Microsoft Edge routers).
* This traffic is specifically identified within Azure and does not trigger any VNET peering costs, so it is completely free to the customer.

__Cons__
* Traffic is limited to the bandwidth of the ExpressRoute gateway SKU size and latency of hair-pinning off of the MSEEs which are in the peering location of your ExpressRoute circuit.
  _Example- If you are using the Standard Express Route Gateway SKU, and bandwidth limit of 1G. This throughput limit would also apply to spoke to spoke communications._ 


#### 2. VNET Peering <cite>[^2]</cite>
We already know that, by enabling the peering between two VNETs they can communicate. So, similar to how each Spoke is peered to the Hub, and additional VNET peer would be created between the two spokes which require communication.
 
__Pros__
* Spokes are now directly connected via the Azure backbone and have the lowest latency path possible.
* No bandwidth restrictions exist along the path, so hosts are only limited by the amount of data they can push.

__Cons__
* While spokes continue to grow, the main problem will be to scale it.  As multiple spokes are introduced behind a hub and require connectivity, a full mesh of VNET peers would be required to provide this connectivity.
* The additional cost associated with VNET peering.
 
 [^2]:  [VNET Peering](https://github.com/microsoft/Common-Design-Principles-for-a-Hub-and-Spoke-VNET-Archiecture#option-3-vnet-peering)
 

 
#### 3. Leveraging a Hub NVA <cite>[^3]</cite>
In this approach, we deploy a NVA of our choosing into the Hub and define static UDRs within each spoke to route to the NVA to get to the other spoke.

__Pros__
 * The granular control and inspection capabilities NVA comes with. Spoke to spoke traffic can now be fully inspected.
 * No longer need to worry about advertising in a default or summary route which may relieve some administrative
 * Some lower latency as we are communicating through a HUB rather than through an MSEE. In all reality, the improvement here is fairly low as the Azure backbone doesn’t add too much latency.
 * Do not have the bandwidth limitation of the ExpressRoute gateway as this is no longer in the path.

__Cons__
* Cost of deploying an NVA. Regardless of NVA chosen, there will be an additional cost for running the NVA and, typically, a throughput cost for the traffic traversing the NVA.
* NVAs have bandwidth limitations of their own, which could be a bottleneck for this traffic. Understanding the specific throughput limitations of the NVA chosen would be critical when leveraging this method
* When leveraging Option 1, the Azure fabric recognizes this data path and does not apply charges for the traffic when it traverses the VNET peerings. If using an NVA, all traffic which traverses VNET peerings to reach the NVA will incur VNET peering costs.

 [^3]:  [Leveraging a HUB NVA](https://github.com/microsoft/Common-Design-Principles-for-a-Hub-and-Spoke-VNET-Archiecture#option-2-leveraging-a-hub-nva)

In this post, we are going to leverage Hub NVA for Spoke to Spoke routing and we are going to use Azure Firewall for this purpose.

#### What is Azure Firewall?
Azure Firewall is a cloud native network security service. It offers fully stateful network and application level traffic filtering for VNet resources, with built-in high availability and cloud scalability delivered as a service. You can protect your VNets by filtering outbound, inbound, spoke-to-spoke, VPN, and ExpressRoute traffic. Connectivity policy enforcement is supported across multiple VNets and Azure subscriptions.


#### Why Azure Firewall?
* Cost! As always No upfront cost, No termination fees, Pay only for what you use. Azure Firewall pricing includes a fixed hourly cost ($1.25/firewall/hour) and a variable per GB processed cost to support auto scaling. As per Microsoft's observation, most customers save 30% – 50% in comparison to an NVA deployment model.
* You can use Azure Monitor to centrally log all events. You can archive the logs to a storage account, stream events to your Event Hub, or send them to Log Analytics or your security information and event management (SIEM) product of your choice.

In my [next post](/post/implementing-azure-firewall-in-hub-spoke-network-topology-in-azure), I will start to implement azure firewall and how it fits in Spoke to Spoke routing by user defined routing or UDR.
