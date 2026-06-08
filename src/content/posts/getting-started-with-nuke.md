---
title: Getting Started with Nuke
date: 2022-08-28T10:07:35.000Z
description: Getting Started with Nuke.
featured: true
draft: false
toc: false
featureImage: /images/nuke/nuke_plan.png
thumbnailImage: /images/nuke/nuke_plan.png
shareImage: /images/nuke/nuke_plan.png
codeMaxLines: 10
codeLineNumbers: false
figurePositionShow: true
coverImage: /images/nuke/nuke_plan_full.png
autoThumbnailImage: true
thumbnailImagePosition: top
metaAlignment: center
categories:
  - CI/CD
  - Nuke
  - C#
  - .NET 6
  - Nuget
  - Github Action
tags:
  - nuke
  - automation
  - ci/cd
  - .net6
  - c#
  - github action
  - c#
  - aspnetcore
keywords:
  - nuke
  - automation
  - ci
  - cd
  - .net6
  - c#
  - aspnetcore
  - github action
  - nuget
  - myget
  - github nuget
comments: true
showSocial: true
---
Hi Everyone!

With this post, I am starting a new series about a build automation tool called [**<span class="hl hl-cyan">Nuke</span>**](https://nuke.build/)  . Over the time, I will updated this page with links to individual posts : 

_This Post - Getting Started with Nuke_

[Write your first building block in Nuke](/post/write-your-first-building-block-in-nuke/)

[Manage your Package Version using Nuke](/post/manage-your-package-version-using-nuke/)

[Manage your Package Release using Nuke in Github](/post/manage-your-package-release-using-nuke-in-github/)


## What we are going to build?
In this series of posts we are going to build yet another`Hello World` C# library! Sounds interesting?  😇 

No! right? Well, we are going to build,pack and deploy the library using **<span class="hl hl-cyan">Nuke!</span>** and to automate the process we are going to use **<span class="hl hl-blue">Github Actions</span>** as our workflow automation tool.

So, without further ado, lets get started!

### What is Nuke?
 **<span class="hl hl-cyan">Nuke</span>** is a build automation library that is bootstrapped with simple  **<span class="hl hl-orange">.NET console applications</span>** and build steps that are defined as regular C# properties. Some of the key features of  **<span class="hl hl-cyan">Nuke</span>** are:
  1. No Need to write any XML or YAML files for your pipeline, just annotate your Build class with attribute, Nuke will do the rest!
  2.  **<span class="hl hl-cyan">Nuke</span>** is a cross-platform build automation tool, it can be used on Windows, Linux and Mac.
  3.  **<span class="hl hl-cyan">Nuke</span>** is a C# based build automation tool, so you can use all the power of C# to write your build steps.
  4. Make your build steps reusable by creating your own building blocks.
  5.  **<span class="hl hl-cyan">Nuke</span>** takes _Fail Fast_ approach, if any of the build step fails, it will stop the execution of the build.
  6. Last but not the least,  **<span class="hl hl-cyan">Nuke</span>** has first class support for your IDE. You can use Visual Studio, Rider or VS Code to write your build steps. Features like code-completion, navigation, refactorings, and debugging are supported out-of-the-box!
 
 
### What is Github Actions?
**<span class="hl hl-blue">Github Actions</span>** is a continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline.

**<span class="hl hl-blue">Github Actions</span>** gives developers the ability to automate their workflows across issues, pull requests, and more—plus native CI/CD functionality. 

In our case, we are going to use **<span class="hl hl-blue">Github Actions</span>** to run our **<span class="hl hl-cyan">Nuke</span>** build script. 

## Getting Started
Before we start, Let us create some branches in our repository. We are going to use the following branches in our repository:

 1. **<span class="hl hl-green">main</span>** - This is our main branch, we will use this branch to publish the package in **Nuget** with actual version number for public users.

 2. **<span class="hl hl-yellow">release/**</span>** - This is our release branch, we will use this branch to publish the pre release version to **MyGet** with _beta_ tag for public users.

 3. **<span class="hl hl-red">dev</span>** - This is our development branch, we will use this branch to publish the pre release version to **Github Feed** with _alpha_ tag for internal users.



<aside class="callout callout-info callout-info callout-no-icon">
<p><strong>Github Feed</strong> is a private feed that is created by Github for each repository. We can use this feed to publish our package to our internal users.</p>
</aside>



Once we have the branches, we are ready to start our journey with **<span class="hl hl-cyan">Nuke</span>**.

### Install Nuke global tool
**<span class="hl hl-cyan">Nuke</span>** comes with a .NET global tool that provides a comfortable way to setup and execute your build projects right from your terminal. In this series I am going to use **<span class="hl hl-orange">Window terminal</span>** to setup everything.
Use below command to install **<span class="hl hl-cyan">Nuke</span>** global tool:



```
dotnet tool install Nuke.GlobalTool --global
```


From now on you can use the global tool to:
  - Set up new builds
  - Run existing builds
  - Leverage shell completion
  - Add tool & library packages
  - Navigate around root directories
  - Convert CAKE build scripts
  - Manage secrets in parameter files

### Install Extension for your IDE 
I am going to show you how to use **<span class="hl hl-cyan">Nuke</span>** with **<span class="hl hl-orange">Rider</span>** and **<span class="hl hl-orange">Visual Studio</span>**.
#### JetBrains Rider
In  **<span class="hl hl-orange">Rider</span>** you can install the [_<span class="hl hl-cyan">Nuke Support plugin</span>_](https://plugins.jetbrains.com/plugin/10803-nuke-support) to be more productive in writing, running, and debugging your builds.    

Once you installed the plugin, you can click the gutter icon next to your targets or hit Alt + Enter from inside their declaration to run and debug them. The top-level item starts a normal execution including all dependencies. From the submenu, you can debug and run/debug without dependencies:


<figure class="post-figure center nocaption fancybox">
  <img src="/images/nuke/nuke_gutter.png" alt="rider" loading="lazy" />
  
</figure>




#### Microsoft Visual Studio
In  **<span class="hl hl-orange">Visual Studio</span>** you can install the [_<span class="hl hl-cyan">Nuke Support plugin</span>_](https://marketplace.visualstudio.com/items?itemName=nuke.visualstudio) to be more productive in writing, running, and debugging your builds.    

Once you installed the plugin, from the _Task Runner Explorer_, you can double-click a target to run it. Additionally, you can use toggle buttons to attach the debugger or skip dependencies:


<figure class="post-figure center nocaption fancybox">
  <img src="/images/nuke/vs_gutter.png" alt="vs" loading="lazy" />
  
</figure>



### Setup your first Nuke build project
After installing necessary tools, we are ready to setup our first **<span class="hl hl-cyan">Nuke</span>** build project. 

To setup a new build project,run the below command from an existing repository. **<span class="hl hl-cyan">Nuke</span>** will search for the next upwards _<span class="hl hl-warning">.git</span>_ or _<span class="hl hl-warning">.svn</span>_ directory to determine the build _<span class="hl hl-warning">root directory</span>_. If neither is found, it will use the current directory. 

During the setup, you'll be asked several questions to configure your build to your preferences.



```
nuke :setup
```





<aside class="callout callout-info callout-info">
<p>You can also pass the <strong>--root parameter</strong> to specify that the current directory should be used as a root directory.</p>
</aside>



Yay! 🎉 Your first build has now been set up, and you can run the build with the default implementation! though it will not do anything because we haven't added any build steps yet. 

In the [next](/post/write-your-first-building-block-in-nuke/) article, we will add some build steps to our build project and run it.





