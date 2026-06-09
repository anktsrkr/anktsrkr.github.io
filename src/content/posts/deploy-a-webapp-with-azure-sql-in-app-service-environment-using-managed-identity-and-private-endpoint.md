---
title: >-
  Deploy a WebApp with Azure Sql in App Service Environment using Managed
  Identity and Private endpoint
date: 2020-10-03T19:30:00.000Z
description: >-
  Deploy a WebApp with Azure Sql in App Service Environment using Managed
  Identity and Private endpoint
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
syntaxHighlighter: highlight.js
comments: true
showSocial: true
---
Hi Everyone!

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


<div class="code-title">web.config</div>

```xml
<SqlAuthenticationProviders>
    <providers>
      <add name="Active Directory Interactive" type="Microsoft.Azure.Services.AppAuthentication.SqlAppAuthenticationProvider, Microsoft.Azure.Services.AppAuthentication" />
    </providers>
  </SqlAuthenticationProviders>
```



###### Change ConnectionString


<div class="code-title">web.config</div>

```xml
<add name="MyDbConnection" connectionString= "server=tcp:cloudsandbox.database.windows.net;database=demodb;UID=AnyString;Authentication=Active Directory Interactive" providerName="System.Data.SqlClient"/>
```


Now, it's time to create system assigned user which is always WebApp name in our case `sandbox` in Azure Sql, also we will need to give required permission `db_datareader`, `db_datawriter`, `db_ddladmin`.

We need to login with _Active Directory Admin_.

![Login Azure SQL With Active Directory Admin](/images/ase/login_ada.jpg)

Then create the user and give permission.


<div class="code-title">create_user.sql</div>

```sql
CREATE USER sandbox FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER sandbox;
ALTER ROLE db_datawriter ADD MEMBER sandbox;
ALTER ROLE db_ddladmin ADD MEMBER sandbox;
GO
```



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

