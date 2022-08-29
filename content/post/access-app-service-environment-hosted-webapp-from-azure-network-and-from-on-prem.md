---
title: "Access App Service Environment Hosted WebApp from Azure Network and from On-Prem" # Title of the blog post.
date: 2020-10-01T01:00:00+05:30 # Date of post creation.
description: "Access App Service Environment Hosted WebApp from Azure Network and from On-Prem" # Description used for search engine.
featured: false # Sets if post is a featured post, making appear on the home page side bar.
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
  - Azure App Services
keywords: "dns configuration ASE,ase,app service, app service env, app service env v2,app service environment,app service environment v2,deploy application in app service environment,app service environment and private link, ase in hub spoke,hub spoke,hub spoke network,hub spoke network topology,azure hub spoke,azure hub spoke network,azure hub spoke network topology,app service environment and private endpoint,azure sql, azure sql and private endpoint,azure private dns zone, resolve azure internal DNS from your on prem,hub spoke dns forwarder,dns forwarder in hub spoke,dns forwarder in hub spoke network topology,dns forwarder"
---

Hi Everyone!

This post is continuation of a series about Azure App Service Environment (ASE v2). Over the time, I will updated this page with links to individual posts :  

[Deploy App Service Environment in Microsoft Azure](/post/deploy-app-service-environment-v2-in-microsoft-azure)

[Create a WebApp in App Service Environment](/post/create-a-webapp-in-app-service-environment)

_This Post - Access App Service Environment Hosted WebApp from Azure Network and from On-Prem_

[Deploy a WebApp with Azure Sql in App Service Environment using Managed Identity and Private endpoint](/post/deploy-a-webapp-with-azure-sql-in-app-service-environment-using-managed-identity-and-private-endpoint)

[Add Custom Domain for App Service Environment Hosted WebApp](/post/add-custom-domain-for-app-service-environment-hosted-webapp)

In the [previous post](/post/create-a-webapp-in-app-service-environment) we have deployed a webapp in the ASE, but the webapp is not accessible, more precisely we are not able to resolute the DNS name. In this post we will see how to resolute the ASE hosted webapp DNS, so let's get started. 

In general, when you are deploying any PaaS services in Microsoft Azure, it comes with routeable DNS name. So, once resource is created you can access it using url. But, in case of internal App Service Environment you have to manage your own DNS. you can do it in your own DNS server or you can leverage Azure DNS private zones. 
>Note: When you are using External ASE, apps made in your ASE are registered with Azure DNS. There are no additional steps required in an External ASE for your apps to be publicly available.

In this blog post, I will implement with _Azure DNS private zones_, however I will start with steps in case you are managing your DNS server. 

##### To configure DNS in your own DNS server
1. Create a zone for __intranet.appserviceenvironment.net__ (i.e < ASENAME >.appserviceenvironment.net)
2. Create an A record in that zone that points * to the ILB IP address i.e `10.20.30.11`
3. Create an A record in that zone that points @ to the ILB IP address i.e `10.20.30.11`
4. Create a zone in _.appserviceenvironment.net_ named __scm__
5. Create an A record in the scm zone that points * to the ILB IP address i.e `10.20.30.11`

If you are not sure about, how did I get IP and the ASE name, I would suggest to check [this post](/post/deploy-app-service-environment-v2-in-microsoft-azure).

##### To configure DNS in Azure DNS Private zones
First step will be to create a Azure DNS Private Zone with ASE domain name, to do that go to portal and search for _Azure DNS Private zones_ and deploy a new zone with below details - 

_Resource Group_ : `dns-sandbox`

_Name_ : `intranet.appserviceenvironment.net`
![Create Azure Private DNS Zone](/images/ase/azure_p_dns_basic.jpg)
Once deployed, Click on _+ Record Set_ as shown below - 
![Create Azure Private DNS Zone](/images/ase/create_record_set.jpg)
We will need to add below entires - 
- A record in that zone that points * to the ILB IP address i.e `10.20.30.11`
- A record in that zone that points @ to the ILB IP address i.e `10.20.30.11`
- A record in that zone that points *.scm to the ILB IP address i.e `10.20.30.11`

Once done, it should look like this
![DNS records for ASE](/images/ase/ase_dns_records.jpg)

Now, let's try to do `nslookup intranet.appserviceenvironment.net` from either on-premise or azure vm
![nslookup failed](/images/ase/nslookup_failed.jpg)
Oops! it still fails. That's because we missed to link this zone to virtual network. In our case we will link with `hub-vnet`. To do that Click on _Virtual Network links_ from side bar and link it. Once completed, it should look like this 
![Linked DNS Zone with hub-vent](/images/ase/asezonelinkedwithvnet.jpg)

Try to access the webapp from Azure VM and from on-prem (provided you have DNS forwarder set up correctly, in case you need help check [this post](/post/resolve-azure-internal-dns-from-your-on-prem-network/)) it started working! 

![WebApp is accessible using DNS](/images/ase/wbappaccessible.jpg)
Let's see the certificate provided by Azure, seems working! 
![WebApp is accessible using DNS](/images/ase/ssl_cert.jpg)

Also,check the scm site.
![SCM is accessible](/images/ase/scm_acessible.jpg)

All looks good finally. In the [next post](/post/deploy-a-webapp-with-azure-sql-in-app-service-environment-using-managed-identity-and-private-endpoint) we will create a new webapp with Azure Sql and deploy it through Visual Studio.



