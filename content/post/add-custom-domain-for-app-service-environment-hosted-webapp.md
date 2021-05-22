---
title: "Add Custom Domain for App Service Environment Hosted WebApp" # Title of the blog post.
date: 2021-05-22T01:00:00+05:30 # Date of post creation.
description: "Add Custom Domain for App Service Environment Hosted WebApp" # Description used for search engine.
featured: false # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnail: "/images/ase.png" # Sets thumbnail image appearing inside card on homepage.
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
  - Azure App Services
keywords: "dns configuration ASE,ase,app service, app service env, app service env v2,app service environment,app service environment v2,deploy application in app service environment,app service environment and private link, ase in hub spoke,hub spoke,hub spoke network,hub spoke network topology,azure hub spoke,azure hub spoke network,azure hub spoke network topology,app service environment and private endpoint,azure sql, azure sql and private endpoint,azure private dns zone, resolve azure internal DNS from your on prem,hub spoke dns forwarder,dns forwarder in hub spoke,dns forwarder in hub spoke network topology,dns forwarder"
---

Hi Everyone!

This post is continuation of a series about Azure App Service Environment (ASE v2). Over the time, I will updated this page with links to individual posts :  

[Deploy App Service Environment in Microsoft Azure](/post/deploy-app-service-environment-v2-in-microsoft-azure)

[Create a WebApp in App Service Environment](/post/create-a-webapp-in-app-service-environment)

[Access App Service Environment Hosted WebApp from Azure Network and from On-Prem](/post/access-app-service-environment-hosted-webapp-from-azure-network-and-from-on-prem)

[Deploy a WebApp with Azure Sql in App Service Environment using Managed Identity and Private endpoint](/post/deploy-a-webapp-with-azure-sql-in-app-service-environment-using-managed-identity-and-private-endpoint)

_This Post - Add Custom Domain for App Service Environment Hosted WebApp_

[Coming Soon - Manage SSL Certificate for App Service Environment Hosted WebApp with Custom Domain](#)

In the [previous post](/post/deploy-a-webapp-with-azure-sql-in-app-service-environment-using-managed-identity-and-private-endpoint) we have migrated a webapp in App Service we are able to access it using subdomain of ase environment.However, our requirement is to set custom domain to access the website. However we will still use ase subdomain to access kudu. Let's get started. 

We will assume, Business wants to access the website using `https://demoapp.internal.xyz`. If you already have `internal.xyz` DNS zone in your own DNS server then you can just add `demoapp` as __CNAME__ that points to `sandbox.intranet.appserviceenvironment.net` else create a DNS zone and after that add CNAME.

But, in our case we don't have On-prem DNS Server, however we have DNSForwarder, which forwards all request to Azure DNS. So, in our case we can create a Azure Private DNS Zone.

In this post, I am using Azure Portal to create Private DNS Zone. However, Please check [this](/post/resolve-azure-internal-dns-from-your-on-prem-network) post for how to create using Powershell.
![Private DNS Zone](/images/ase/internal.xyz.jpg)

Since, `hub-vnet` in our entry point to our Azure environment, we will link our newly created zone with it.

![Link to Hub Vnet](/images/ase/linktohub-internal.xyz.jpg)

At this point you can either create a _CNAME_ or _A Record_ in this zone, both will work. Please remember you will not be able to configure both using same name. You should implement either of it. My preference is to go with  _A Record_.

###### To Configure CNAME
Create a __CNAME__ which will point to `sandbox.intranet.appserviceenvironment.net`. To do that go to to your DNS Zone dashboard and Click on _+ Record Set_ and enter below details :

_Name_ : `demoapp`

_Type_ : `CNAME`

_TTL_ : `1`

_TTL Unit_ : `Hours`

_Alias_ : `sandbox.intranet.appserviceenvironment.net` 

![Configure A Record](/images/ase/configure_cname_record.jpg)

###### To Configure A Record
Create a __A Record__ which will point to your ASE ILB IP. To do that go to to your DNS Zone dashboard and Click on _+ Record Set_ and enter below details :

_Name_ : `demoapp`

_Type_ : `A`

_TTL_ : `1`

_TTL Unit_ : `Hours`

_IP Address_ : `10.20.30.11`

![Configure A Record](/images/ase/configure_a_record.jpg)

You are all set in terms of DNS settings. If you try to access the site now, you will still not be able to access it because your `sandbox` webapp does not know about your domain and the way it works is based on Host header. 

So the only left part is to re-configure your webapp. Go to settings and click on _Custom Domain_. Click on _Add custom domain_ and enter `demoapp.internal.xyz`, Click _Add custom domain_.

![Configure Custom Domain from WebApp Settings](/images/ase/add_custom_domain.jpg)

After configuring, it will show as per below image - 

![After Configure Custom Domain from WebApp Settings](/images/ase/after_add_custom_domain.jpg)


To access your app using new domain `demoapp.internal.xyz`, go to your on-prem system from where you were testing previously and Hooray!! site is now accessible.

![Site is accessible using custom domain](/images/ase/site_is_accessible.jpg)

But Wait! did you noticed that the webapp is not using `https`? which is one of our Business requirement, right? So let's fix the issue, in the next post.






