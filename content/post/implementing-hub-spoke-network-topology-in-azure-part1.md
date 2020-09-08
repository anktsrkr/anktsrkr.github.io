---
title: "Implementing Hub-Spoke network topology in Azure - Part 1" # Title of the blog post.
date: 2020-09-05T01:00:00+05:30 # Date of post creation.
description: "Article description." # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
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
---

Hi Everyone!

With this post, I'll start a new how to series about Hub-Spoke network topology in Azure. Over the time, I will updated this page with links to individual posts : 

_This Post - Implementing Hub-Spoke network topology in Azure - Part 1_

[Implementing Hub-Spoke network topology in Azure - Part 2](/post/implementing-hub-spoke-network-topology-in-azure-part2) 

[Introducing Azure Firewall in Hub-Spoke network topology in Azure](/post/introducing-azure-firewall-in-hub-spoke-network-topology-in-azure) 

[Coming Soon - Implementing Azure Firewall in Hub-Spoke network topology in Azure](#) 

[Coming Soon - Connect your Hub with your On-Prem](#) 

Before deep dive into implementation, we need to know what Hub-Spoke topology is all about.

> The spoke-hub distribution paradigm is a form of transport topology optimization in which traffic planners organize routes as a series of "spokes" that connect outlying points to a central "hub" -- Wikipedia

To simplify, while you are using public cloud, you need a secure entry point in your cloud network to access resources and this topology does exactly same by introducing a central virtual network (Hub) which you connect from outside world and other internal virtual networks (Spokes) will connect with central hub. Benefits for this topologies are - 
 - Easier to manage shared services
 - Lower licensing costs
 - Improved segregation
 - Easy to scale

However, Please note this might be your single point of failure.

Keeping drawbacks aside, let's see the overall architecture.

## Architecture

Below diagram will give you overall idea : 
![Simplified Hub Spoke Topology](/images/hub-spoke/simple-hub-spoke-topology.jpg)

The architecture consists of the following components.

 - __Hub virtual network__ - The virtual network used as the hub in the hub-spoke topology. The hub is the central point of connectivity to your azure network, and a place to host services that can be consumed by the different workloads hosted in the spoke virtual networks.

- __Spoke virtual networks__ -  One or more virtual networks that are used as spokes in the hub-spoke topology. Spokes can be used to isolate workloads in their own virtual networks, managed separately from other spokes. Each workload might include multiple tiers, with multiple subnets connected through Azure load balancers. 

- __Virtual network peering__ - Two virtual networks can be connected using a peering connection. Peering connections are non-transitive, low latency connections between virtual networks. Once peered, the virtual networks exchange traffic by using the Azure backbone, without the need for a router. In a hub-spoke network topology, you use virtual network peering to connect the hub to each spoke. You can peer virtual networks in the same region, or different regions. For more information, [see requirements and constraints](#).<cite>[^1]
</cite>

In the above diagram, though I have shown all virtual networks are in same subscription and same region but please note it is absolutely possible to connect virtual networks from different subscription or different azure region.

In my next [post](/post/implementing-hub-spoke-network-topology-in-azure-part2) , I will start to implement the architecture.

[^1]:  [Azure Architecture Reference](https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/hybrid-networking/hub-spoke)