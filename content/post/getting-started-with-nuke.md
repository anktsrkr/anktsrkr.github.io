---
title: "Getting Started with Nuke" # Title of the blog post.
date: 2022-08-28T11:07:35+01:00 # Date of post creation.
description: "Getting Started with Nuke." # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
featureImage: "/images/nuke/nuke_plan.png" # Sets featured image on blog post.
thumbnailImage: "/images/nuke/nuke_plan.png"
shareImage: "/images/nuke/nuke_plan.png" # Designate a separate image for social media sharing.
codeMaxLines: 10 # Override global value for how many lines within a code block before auto-collapsing.
codeLineNumbers: false # Override global value for showing of line numbers within code block.
figurePositionShow: true # Override global value for showing the figure label.
coverImage: "/images/nuke/nuke_plan_full.png"
autoThumbnailImage: true
thumbnailImagePosition: "top"
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
---
 
Hi Everyone!

With this post, I am starting a new series about a build automation tool called [**{{< hl-text cyan >}}Nuke{{< /hl-text >}}**](https://nuke.build/)  . Over the time, I will updated this page with links to individual posts : 

_This Post - Getting Started with Nuke_

[Write your first building block in Nuke](/post/write-your-first-building-block-in-nuke/)

[Manage your Package Version using Nuke](/post/manage-your-package-version-using-nuke/)

[Coming Soon - Manage your Package Release using Nuke in Github](#)

{{< toc >}}
## What we are going to build?
In this series of posts we are going to build yet another`Hello World` C# library! Sounds interesting?  😇 

No! right? Well, we are going to build,pack and deploy the library using **{{< hl-text cyan >}}Nuke!{{< /hl-text >}}** and to automate the process we are going to use **{{< hl-text blue >}}Github Actions{{< /hl-text >}}** as our workflow automation tool.

So, without further ado, lets get started!

### What is Nuke?
 **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** is a build automation library that is bootstrapped with simple  **{{< hl-text orange >}}.NET console applications {{< /hl-text >}}** and build steps that are defined as regular C# properties. Some of the key features of  **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** are:
  1. No Need to write any XML or YAML files for your pipeline, just annotate your Build class with attribute, Nuke will do the rest!
  2.  **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** is a cross-platform build automation tool, it can be used on Windows, Linux and Mac.
  3.  **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** is a C# based build automation tool, so you can use all the power of C# to write your build steps.
  4. Make your build steps reusable by creating your own building blocks.
  5.  **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** takes _Fail Fast_ approach, if any of the build step fails, it will stop the execution of the build.
  6. Last but not the least,  **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** has first class support for your IDE. You can use Visual Studio, Rider or VS Code to write your build steps. Features like code-completion, navigation, refactorings, and debugging are supported out-of-the-box!
 
 
### What is Github Actions?
**{{< hl-text blue >}}Github Actions{{< /hl-text >}}** is a continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline.

**{{< hl-text blue >}}Github Actions{{< /hl-text >}}** gives developers the ability to automate their workflows across issues, pull requests, and more—plus native CI/CD functionality. 

In our case, we are going to use **{{< hl-text blue >}}Github Actions{{< /hl-text >}}** to run our **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** build script. 

## Getting Started
Before we start, Let us create some branches in our repository. We are going to use the following branches in our repository:

 1. **{{< hl-text green>}}main{{< /hl-text >}}** - This is our main branch, we will use this branch to publish the package in **Nuget** with actual version number for public users.

 2. **{{< hl-text yellow >}}release/**{{< /hl-text >}}** - This is our release branch, we will use this branch to publish the pre release version to **MyGet** with _beta_ tag for public users.

 3. **{{< hl-text red >}}dev{{< /hl-text >}}** - This is our development branch, we will use this branch to publish the pre release version to **Github Feed** with _alpha_ tag for internal users.

{{< alert info no-icon>}}
**Github Feed** is a private feed that is created by Github for each repository. We can use this feed to publish our package to our internal users.
{{< /alert >}}

Once we have the branches, we are ready to start our journey with **{{< hl-text cyan >}}Nuke{{< /hl-text >}}**.

### Install Nuke global tool
**{{< hl-text cyan >}}Nuke{{< /hl-text >}}** comes with a .NET global tool that provides a comfortable way to setup and execute your build projects right from your terminal. In this series I am going to use **{{< hl-text orange >}}Window terminal{{< /hl-text >}}** to setup everything.
Use below command to install **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** global tool:

{{< codeblock>}}dotnet tool install Nuke.GlobalTool --global
{{< /codeblock >}}
From now on you can use the global tool to:
  - Set up new builds
  - Run existing builds
  - Leverage shell completion
  - Add tool & library packages
  - Navigate around root directories
  - Convert CAKE build scripts
  - Manage secrets in parameter files

### Install Extension for your IDE 
I am going to show you how to use **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** with **{{< hl-text orange >}}Rider{{< /hl-text >}}** and **{{< hl-text orange >}}Visual Studio{{< /hl-text >}}**.
#### JetBrains Rider
In  **{{< hl-text orange >}}Rider{{< /hl-text >}}** you can install the [_{{< hl-text cyan >}}Nuke Support plugin{{< /hl-text >}}_](https://plugins.jetbrains.com/plugin/10803-nuke-support) to be more productive in writing, running, and debugging your builds.    

Once you installed the plugin, you can click the gutter icon next to your targets or hit Alt + Enter from inside their declaration to run and debug them. The top-level item starts a normal execution including all dependencies. From the submenu, you can debug and run/debug without dependencies:
{{< image classes="center nocaption fancybox" src="/images/nuke/nuke_gutter.png" title="rider" >}}


#### Microsoft Visual Studio
In  **{{< hl-text orange >}}Visual Studio{{< /hl-text >}}** you can install the [_{{< hl-text cyan >}}Nuke Support plugin{{< /hl-text >}}_](https://marketplace.visualstudio.com/items?itemName=nuke.visualstudio) to be more productive in writing, running, and debugging your builds.    

Once you installed the plugin, from the _Task Runner Explorer_, you can double-click a target to run it. Additionally, you can use toggle buttons to attach the debugger or skip dependencies:
{{< image classes="center nocaption fancybox" src="/images/nuke/vs_gutter.png" title="vs" >}}

### Setup your first Nuke build project
After installing necessary tools, we are ready to setup our first **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** build project. 

To setup a new build project,run the below command from an existing repository. **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** will search for the next upwards _{{< hl-text warning >}}.git{{< /hl-text >}}_ or _{{< hl-text warning >}}.svn{{< /hl-text >}}_ directory to determine the build _{{< hl-text warning >}}root directory{{< /hl-text >}}_. If neither is found, it will use the current directory. 

During the setup, you'll be asked several questions to configure your build to your preferences.

{{< codeblock>}}nuke :setup
{{< /codeblock >}}

{{< alert info>}}
You can also pass the **--root parameter** to specify that the current directory should be used as a root directory.
{{< /alert >}}

Yay! 🎉 Your first build has now been set up, and you can run the build with the default implementation! though it will not do anything because we haven't added any build steps yet. 

In the [next](/post/write-your-first-building-block-in-nuke/) article, we will add some build steps to our build project and run it.





