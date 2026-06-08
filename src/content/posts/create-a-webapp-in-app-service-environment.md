---
title: Create a WebApp in App Service Environment
date: 2020-09-29T19:30:00.000Z
description: Create a WebApp in App Service Environment
featured: false
draft: false
toc: false
thumbnailImage: /images/ase.png
thumbnailImagePosition: left
shareImage: /images/ase.png
codeMaxLines: 10
codeLineNumbers: false
figurePositionShow: true
series: App Service Environment
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
keywords: []
comments: true
showSocial: true
---
Hi Everyone!

This post is continuation of a series about Azure App Service Environment (ASE v2). Over the time, I will updated this page with links to individual posts :  

[Deploy App Service Environment in Microsoft Azure](/post/deploy-app-service-environment-v2-in-microsoft-azure)

_This Post - Create a WebApp in App Service Environment_

[Access App Service Environment Hosted WebApp from Azure Network and from On-Prem](/post/access-app-service-environment-hosted-webapp-from-azure-network-and-from-on-prem)

[Deploy a WebApp with Azure Sql in App Service Environment using Managed Identity and Private endpoint](/post/deploy-a-webapp-with-azure-sql-in-app-service-environment-using-managed-identity-and-private-endpoint)

[Add Custom Domain for App Service Environment Hosted WebApp](/post/add-custom-domain-for-app-service-environment-hosted-webapp)

In the [previous post](/post/deploy-app-service-environment-v2-in-microsoft-azure) we have deployed the ASE. In this post we will see how to create a new webapp, so let's get started. 

First thing first. We need to create a new App Service Plan to deploy a webapp. There is no special steps which is required to deploy a webapp in ASE. However, the main difference between deploying a webapp in ASE and a webapp in multi-tenant is `Region` selection. 

Also,You have to choose App Service Plan which belongs to Isolated as one of:
 - I1 210 ACU/3.5 GB RAM 
 - I2 420 ACU/7 GB RAM
 - I3 840 ACU/14 GB RAM

First Step is to login into your account and on the top search bar, type App Services and from the dropdown select "App Services".
![Select App Services](/images/ase/Select_AS.jpg)

Now, click on __Create app service__
![Create App Service](/images/ase/Create_AS.jpg)

Now, select your Subscription and Resource Group and put details as below: 

_Resource Group_ : `appservice-sandbox`

_Name_ : `sandbox`

_Publish_ : `Code`

_Runtime Stack_ : `ASP.NET V4.7`

_Operating System_ : `Windows`

_Region_ : `intranet (Newly Created ASE)`

_App Service Plan_ : `I1 (sandbox-appservice)`

_Application Insights_ : `Not Enabled`

![Create App Service](/images/ase/Create_AS_Basic.jpg)


Now, click on __Review + create__. Overview of app service should look like as below screenshot:
![Overview App Service](/images/ase/AS_Overview.jpg)

Click on __Create__ to start the deployment, it will take good amount of time. In my case, `central-india` region took 19 mins, and it varies.

Once the deployment is complete, go to Dashboard and Click on Overview tab to get the URL.
![App Service Details](/images/ase/AS_Dashboard.jpg)

Let's go to any virtual machine hosted in any vnet and hit the URL - http://sandbox.intranet.appserviceenvironment.net, seems not working.
![Unable to resolve DNS](/images/ase/unable_webapp.jpg)

Try the same from On-premise, Hmm! it is also not working. 

In the [next post](/post/access-app-service-environment-hosted-webapp-from-azure-network-and-from-on-prem), we will try to resolve this DNS issue.


