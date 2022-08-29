---
title: "Deploy App Service Environment (ASE v2) in Microsoft Azure" # Title of the blog post.
date: 2020-09-26T01:00:00+05:30 # Date of post creation.
description: "Deploy App Service Environment (ASE v2) in Microsoft Azure" # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnailImage: "/images/ase.png" # Sets thumbnail image appearing inside card on homepage.
thumbnailImagePosition: left
shareImage: "/images/ase.png" # Designate a separate image for social media sharing.
codeMaxLines: 10 # Override global value for how many lines within a code block before auto-collapsing.
codeLineNumbers: false # Override global value for showing of line numbers within code block.
figurePositionShow: true # Override global value for showing the figure label.
series : "App Service Environment"
categories:
  - Cloud
  - App Service Environment
  - Hub-Spoke Topology
  - Azure SQL
tags:
  - Azure
  - App Service Environment
  - Azure Private DNS Zone
  - Azure Private link
keywords: "ase,app service, app service env, app service env v2,app service environment,app service environment v2,deploy application in app service environment,app service environment and private link, ase in hub spoke,hub spoke,hub spoke network,hub spoke network topology,azure hub spoke,azure hub spoke network,azure hub spoke network topology,app service environment and private endpoint,azure sql, azure sql and private endpoint,azure private dns zone, resolve azure internal DNS from your on prem,hub spoke dns forwarder,dns forwarder in hub spoke,dns forwarder in hub spoke network topology,dns forwarder"
---

Hi Everyone!

With this post, I'll start a new series about Azure App Service Environment (ASE v2). Over the time, I will updated this page with links to individual posts : 

_This Post - Deploy App Service Environment in Microsoft Azure_

[Create a WebApp in App Service Environment](/post/create-a-webapp-in-app-service-environment)

[Access App Service Environment Hosted WebApp from Azure Network and from On-Prem](/post/access-app-service-environment-hosted-webapp-from-azure-network-and-from-on-prem)

[Deploy a WebApp with Azure Sql in App Service Environment using Managed Identity and Private endpoint](/post/deploy-a-webapp-with-azure-sql-in-app-service-environment-using-managed-identity-and-private-endpoint)

[Add Custom Domain for App Service Environment Hosted WebApp](/post/add-custom-domain-for-app-service-environment-hosted-webapp)

Before going into deep details about App Service Environment (v2), we will first look into what is it, when to use it and what are different type of ASE exists in Microsoft Azure. Please note, _I am not reinventing the wheel_, so many of use cases and definitions are actually taken from Microsoft Docs and I have given the link reference where needed 😊. A lot of things to cover, let's get started.

## What is App Service Environment?
The Azure App Service Environment is an Azure App Service feature that provides a fully isolated and dedicated environment for securely running App Service apps at high scale. This capability can host your:
 - Windows web apps
 - Linux web apps
 - Docker containers
 - Mobile apps
 - Functions

## When to use App Service Environment?
App Service Environment is appropriate for application workloads that require:
 - Very high scale.
 - Isolation and secure network access.
 - High memory utilization.

The ASE is **dedicated exclusively to a single subscription** and can host 100 App Service Plan instances. The range can span 100 instances in a single App Service plan to 100 single-instance App Service plans, and everything in between.<cite>[^1]</cite>

An ASE is composed of front ends and workers. Front ends are responsible for HTTP/HTTPS termination and automatic load balancing of app requests within an ASE. Front ends are automatically added as the App Service plans in the ASE are scaled out.

Workers are roles that host your apps. Workers are available in three fixed sizes:
 - 1 vCPU/3.5 GB RAM 
 - 2 vCPU/7 GB RAM
 - 4 vCPU/14 GB RAM

You don't need to manage front ends and workers. All infrastructure is automatically added as you scale out your App Service plans. As App Service plans are created or scaled in an ASE, the required infrastructure is added or removed as appropriate.

An ASE always exists in a virtual network, and more precisely, within a subnet of a virtual network. You can use the security features of virtual networks to control inbound and outbound network communications for your apps, e.g Network Security Groups restrict inbound network communications to the subnet where an ASE resides.

If your apps need to access corporate resources such as internal databases and web services and if you deploy the ASE in a virtual network that has a VPN connection (regardless of whether the VPN is a site-to-site or Azure ExpressRoute VPN) to the on-premises network, the apps in the ASE can access the on-premises resources. 
## Types of ASE
There are two types of ASE provided by Microsoft Azure : 
 - External -- This is internet-facing with a public IP address
 - Internal -- This is intranet-facing with only an Azure internal load balancer (ILB) address

 In this series, we will only focus on _Internal ASE_. We will deploy internal ASE using Azure Portal but you can use ARM Template, Azure Cli. At the time of writing this post, I guess there are some restrictions with CLI you can not select VNET while creating an ASE. So, choose to go with Azure Portal for this entire series.

__Something to note here, I will assume you already have Hub-Spoke network topology in place and connection is already established with your on-premise over VPN. I will also assume, you do not have any on-premise DNS server and you have a DNS Forwarder setup in `hub-vnet`. If you are not sure about all of this I will suggest to go though my previous [posts.](/categories/hub-spoke-topology/)__

First Step is to login into your account and on the top search bar, type App Service Environments and from the dropdown select "App Service Environments".
![Select App Service Environment](/images/ase/Select_ASE.jpg)

Now, click on __Create app service environment__
![Create App Service Environment](/images/ase/Create_ASE.jpg)

Now, select your Subscription and Resource Group and put details as below: 

_Resource Group_ : `appservice-sandbox`

_App Service Environment Name_ : `intranet`

_Virtual IP_ : `Internal`

_OS Support_ : `Windows`
![Create App Service Environment](/images/ase/Create_ASE_Basic.jpg)
Something to note, though we are selecting Windows as OS support but you can add Linux apps later, but this will trigger an upgrade to the environment and will take time.

Click on _Next_ to configure vnet for your ASE.

>ASE needs a dedicated Subnet and you can not change it later once ASE is deployed. So we need to choose it wisely. ILB ASE with no App Service plans at all will use 13 addresses (In case of External ASE, it is 12) before you create an app. When you scale up or down, new roles of the appropriate size are added and then your workloads are migrated from the current size to the target size. The original VMs removed only after the workloads have been migrated. If you had an ASE with 100 ASP instances, there would be a period where you need double the number of VMs. It is for this reason that it is recommend the use of a `/24` to accommodate any changes you might require.<cite>[^2]</cite>

Our plan is to deploy ASE in `spoke1-vnet`. As, ASE required dedicated subnet, let's create it with below details: 

_Subnet Name_ : `AseSubnet`

_Virtual Network Address Block_ : `10.20.0.0/19`

_Subnet Address Block_ : `10.20.30.0/24`
![Create App Service Environment](/images/ase/ASE_Subnet.jpg)

Now, click on __Review + create__. Overview of ASE should look like as below screenshot:
![Overview App Service Environment](/images/ase/ASE_Overview.jpg)

Click on __Create__ to start the deployment, it will take good amount of time. In my case, `central-india` region took 1hr 49mins, and it varies.

Once the deployment is complete, click on __ASE Health__, everything should show as green-tick as below, if not I will suggest to check the details why it failed. 
![ASE Health](/images/ase/ASE_Health.jpg)
Okay, everything looks good here. let's click on __Properties__
![ASE Properties](/images/ase/ASE_Properties.jpg)
Here we can see two VIPs, one is Public VIP and another is Private. Let's see what are the use cases of these VIPs.

 __Public VIP__  -- It is used for inbound management traffic and as the from address when making calls from the ASE to the internet. The calls from an ASE that go to the internet leave the VNet through the VIP assigned for the ASE. The public IP of this VIP is the source IP for all calls from the ASE that go to the internet.

__Private VIP__  -- If the apps in your ASE make calls to resources in your VNet or across a VPN, the source IP is one of the IPs in the subnet used by your ASE. Because the ASE is within the VNet, it can also access resources within the VNet without any additional configuration. If the VNet is connected to your on-premises network, apps in your ASE also have access to resources there without additional configuration.


Okay, now we have the ASE ready, in my [next post](/post/create-a-webapp-in-app-service-environment)
 we will deploy a sample Web App in this environment.

[^1]:  [Introduction to the App Service Environments](https://docs.microsoft.com/en-us/azure/app-service/environment/intro)

[^2]:  [Network Info](https://docs.microsoft.com/en-us/azure/app-service/environment/network-info)

