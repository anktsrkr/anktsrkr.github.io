---
title: "Deploy a WebApp with Azure Sql in App Service Environment using Managed Identity and Private endpoint" # Title of the blog post.
date: 2020-10-04T01:00:00+05:30 # Date of post creation.
description: "Deploy a WebApp with Azure Sql in App Service Environment using Managed Identity and Private endpoint" # Description used for search engine.
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
syntaxHighlighter: "highlight.js"
---

Hi Everyone!

This post is continuation of a series about Azure App Service Environment (ASE v2). Over the time, I will updated this page with links to individual posts :  

[Deploy App Service Environment in Microsoft Azure](/post/deploy-app-service-environment-v2-in-microsoft-azure)

[Create a WebApp in App Service Environment](/post/create-a-webapp-in-app-service-environment)

[Access App Service Environment Hosted WebApp from Azure Network and from On-Prem](/post/access-app-service-environment-hosted-webapp-from-azure-network-and-from-on-prem)

_This Post - Deploy a WebApp with Azure Sql in App Service Environment using Managed Identity and Private endpoint_

[Add Custom Domain for App Service Environment Hosted WebApp](/post/add-custom-domain-for-app-service-environment-hosted-webapp)

In the [previous post](/post/access-app-service-environment-hosted-webapp-from-azure-network-and-from-on-prem) we have configured DNS, now we are able to access the website from both on-premise and azure network. 

In this blog post, we are going to migrate a on-prem User Directory application to Azure. This application is build with ASP.NET and Database is in Sql Server. Since we are moving to cloud our choice is to move the web application in WebApp hosted in ASE and we will move database in Azure SQL.

Our plan is to connect Azure SQL using private endpoint and WebApp will use system assigned managed identity, and hence no credentials stored in code. 

We will start by creating a Azure Sql instance with private endpoint enabled. First Step is to login into your account and on the top search bar, type Azure Sql and from the dropdown select "Azure SQL".
![Select Azure SQL](/images/ase/Select_Asql.jpg)

Now, click on __Create Azure SQL resource__
![Create Azure SQL](/images/ase/Create_ASQL.jpg)

Now, select your Subscription and Resource Group and put details as below: 

_Resource Group_ : `database-sandbox`

_Database Name_ : `demodb`

_Server_ : `cloudsandbox (create a new one)`

_Want to use SQL elastic pool?_ : `No`

_Compute + storage_ : `Basic`

Now click on _Next_ to configure Network. As I mentioned earlier we will go for Private Endpoint. So we need to select `Private Endpoint` as Connectivity method and configure it.

Now, click on __Review + create__ to deploy the database. 

Once done, we will have to enable _Active Directory Admin_. For this purpose, I already created a user in azure active directory, we will assign it.
![Enable Active Directory Admin](/images/ase/aad_user.jpg) 
Also, as I mentioned we will use, system assigned identity, let's go back to App Service configuration and enable `System Assigned` identity.
![Enable System assigned identity](/images/ase/enable_sys_identity.jpg)
We need to go back to our code base as well because we will need to change the connection string to support active directory interactive login. Also we need add `Microsoft.Azure.Services.AppAuthentication` nuget packages

Below are changes we will do in `web.config`.

###### Add SqlAuthenticationProviders

Add `SqlAuthenticationProviders` tag under configuration.
{{< codeblock "web.config" "xml">}}<SqlAuthenticationProviders>
    <providers>
      <add name="Active Directory Interactive" type="Microsoft.Azure.Services.AppAuthentication.SqlAppAuthenticationProvider, Microsoft.Azure.Services.AppAuthentication" />
    </providers>
  </SqlAuthenticationProviders>
{{< /codeblock >}}

###### Change ConnectionString
{{< codeblock "web.config" "xml">}}<add name="MyDbConnection" connectionString= "server=tcp:cloudsandbox.database.windows.net;database=demodb;UID=AnyString;Authentication=Active Directory Interactive" providerName="System.Data.SqlClient"/>
{{< /codeblock >}}
Now, it's time to create system assigned user which is always WebApp name in our case `sandbox` in Azure Sql, also we will need to give required permission `db_datareader`, `db_datawriter`, `db_ddladmin`.

We need to login with _Active Directory Admin_.

![Login Azure SQL With Active Directory Admin](/images/ase/login_ada.jpg)

Then create the user and give permission.
{{< codeblock "create_user.sql" "sql">}}CREATE USER sandbox FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER sandbox;
ALTER ROLE db_datawriter ADD MEMBER sandbox;
ALTER ROLE db_ddladmin ADD MEMBER sandbox;
GO
{{< /codeblock >}}

It's time to publish the WebApp using Visual Studio. To do that Right click on the solution and click on publish. A popup will come. Select `Azure` as _Target_ and click on _Next_.

![Select Azure as Target](/images/ase/select_azure.jpg)

Select _Specific target_ as `Azure App Service (Windows)` and and click on _Next_.

![Select Azure App Service (Windows) as Specific target](/images/ase/select_asp.jpg)

Select _sandbox_ WebApp as `App Service` and and click on _Finish_.
![Select App Service](/images/ase/select_appservice.jpg)

Once deployed, open Postman to check if WebApp is running correctly or not by creating a user and getting it back.
![Create a User](/images/ase/user_post.jpg)

![Get a User](/images/ase/user_get.jpg)

Everything is working! So, in this post we have migrated an application in App Service along with Azure Sql which is using Private Endpoint. Also App Service is not using any credentials to connect to Azure Sql instead it is using system assigned managed identity to secure the application. 

However, the requirement is to run the application with custom domain over https. In the [next post](/post/add-custom-domain-for-app-service-environment-hosted-webapp) we will see how we can configure custom domain for this WebApp and access it.

