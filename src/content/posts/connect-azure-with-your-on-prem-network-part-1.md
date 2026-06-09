---
title: Connect an on-premises network to a Microsoft Azure - Part 1
date: 2020-09-04T19:30:00.000Z
description: Connect an on-premises network to a Microsoft Azure
featured: true
draft: false
toc: false
thumbnailImage: /images/azure.png
thumbnailImagePosition: left
shareImage: /images/path/share.png
codeMaxLines: 10
codeLineNumbers: false
figurePositionShow: true
series: Hub-Spoke network topology in Azure
categories:
  - Cloud
  - Azure architecture
  - Hub-Spoke Topology
tags:
  - Azure
  - Networking
keywords: []
comments: true
showSocial: true
---
Hi Everyone!

But before going into details of Hub-Spoke Topology, we will try to figure out why we need to extend an on-premise network to Microsoft Azure, then we will try to figure out what are the possible way we can establish the connection between on-premise network to Microsoft Azure. 

### Why do we need hybrid connections ?

You have on-prem datacenter and management wants to migrate the workload into cloud to optimize cost. While migrating, there will be time where some of the resources are in cloud and some of the resources are in on-prem, in such scenario these resources need to talk also due to security and many other reasons user should always access the resources as **Intranet** resources. 

Also while migrating applications to public cloud you need to extend your identity system as well because you do not want manage same users differently. So, as you can see, there are many use cases to use hybrid connections, we will not deep dive into this, I just want to set the context of this post.


### Solution for connecting On-prem and Azure

Next step to connect with On-prem network with azure virtual network. Well in this case we really don't have much choices, Either you can use VPN connection or Azure Expressroute.

#### VPN connection
This architecture is simple to configure and suitable for hybrid applications where the traffic between on-premises hardware and the cloud is likely to be light. To configure VPN gateway on-premises VPN device is required (for Site-to-Site). A VPN gateway is a type of virtual network gateway that sends encrypted traffic between an Azure virtual network and an on-prem location. The encrypted traffic goes over the public Internet. Hence there is slightly extended latency. One thing to remember here, Microsoft guarantees 99.9% availability for VPN Gateway, not for your network connection.


#### Azure ExpressRoute

Azure ExpressRoute creates private connections between Azure datacenters and infrastructure on your prem or in a colocation environment. ExpressRoute connections don't go over the public Internet and they offer more reliability, faster speeds and lower latencies than typical Internet connections. This architecture is suitable for hybrid applications running large-scale, mission-critical workloads that require a high degree of scalability. Creating an Azure ExpressRoute connection requires working with a third-party connectivity provider and can be complex to setup. The provider is responsible for provisioning the network connection. Microsoft guarantees  99.9% availability SLA across the entire connection.


> Please note, you can also combine Azure ExpressRoute and VPN connection for high availability. In case of connectivity loss in Expressroute circuit, Azure will be still reachable over VPN. Here you need to consider cost as it requires redundant hardware and a redundant Azure VPN Gateway connection.


Exactly here, Hub-Spoke network topology comes in. A hub-spoke network topology is a way to isolate workloads while sharing services such as identity and security. The hub is a virtual network in Azure that acts as a central point of connectivity to your on-premises network. The spokes are VNets that peer with the hub. Shared services are deployed in the hub, while individual workloads are deployed as spokes.

In my [next post](/post/connect-azure-with-your-on-prem-network-part-2) we will create a Hub Vnet and try to connect on-prem with Hub Vnet.


[^1]:  [Azure Architecture Reference](https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/hybrid-networking/#vpn-connection)
