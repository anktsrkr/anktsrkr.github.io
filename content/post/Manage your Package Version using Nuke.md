---
title: "Manage your Package Version using Nuke" 
date: 2022-09-03T11:08:35+01:00
description: "Manage your Package Version using Nuke." 
draft: false 
thumbnailImage: "/images/nuke/nuke_plan.png"
shareImage: "/images/nuke/nuke_plan.png" 
figurePositionShow: true 
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
- github feed
- github nuget
- gitversion
---
 
Hi Everyone!

This post is continuation of the series about a build automation tool called [**{{< hl-text cyan >}}Nuke{{< /hl-text >}}**](https://nuke.build/) . Over the time, I will updated this page with links to individual posts : 

[Getting Started with Nuke](/post/getting-started-with-nuke/)

[Write your first building block in Nuke](/post/write-your-first-building-block-in-nuke/)

_This Post - Manage your Package Version using Nuke_

[Coming Soon - Manage your Package Release using Nuke in Github](#)

In our [last post](/post/write-your-first-building-block-in-nuke/), we have completed all the steps to create a new package and publish it to the feed based on where we are running the build. But we have not yet covered the versioning of the package and hence it was not able to run the targets. In this post, we will cover the versioning of the package and how to publish it to the feed.

{{< toc >}}

## What is GitVersion?
 **{{< hl-text success >}}GitVersion{{< /hl-text >}}** is a tool that generates a Semantic Version number based on your Git history. The version number generated from GitVersion can then be used for various different purposes, such as:

* _Stamping a version number on artifacts (packages)_ produced during build. - This is what we did in our [last post](/post/write-your-first-building-block-in-nuke/), check the Target _{{< hl-text purple >}}Pack{{< /hl-text >}}_  in the **{{< hl-text orange >}}build.cs{{< /hl-text >}}** file.

* _Patching AssemblyInfo.cs (and similar) files with the version number during the build_, so the version number is embedded within the compiled binaries themselves - This is also we did in our [last post](/post/write-your-first-building-block-in-nuke/), check the Target _{{< hl-text purple >}}Compile{{< /hl-text >}}_ in the **{{< hl-text orange >}}build.cs{{< /hl-text >}}** file.
* Exposing the version number to the build server to version the build itself.

## What is Semantic Versioning?
Semantic Versioning is a standard for versioning software. It is a set of rules and requirements that dictate how version numbers are assigned and incremented.

A version number is made up of three parts: **{{< hl-text red >}}MAJOR.MINOR.PATCH{{< /hl-text >}}** , and they are assigned in that order. For example, the version number `1.0.0` indicates the first major release of a project. Below table shows when to increment each part of the version number.

| Part        | When        |
| ----------- | ----------- |
| Major      | If you are making incompatible API changes|
| Minor      | If you are adding functionality in a backwards compatible manner        |
| Patch      | If you are making  backwards compatible bug fixes        |

Along with the three parts of the version number, a pre-release version number can be added. For example, the version number `1.0.0-alpha` indicates that the project is in the alpha stage of development. Below table shows how we use pre-release version number in our project.

| Pre-release        | When        |
| ----------- | ----------- |
| alpha      | For early, unstable releases|
| beta      | For feature complete, but probably stable releases        |

Now that we have covered the basics of GitVersion and Semantic Versioning, let's start with the implementation.
## Installing GitVersion in Nuke
To install GitVersion in Nuke, go to your root folder from your {{< hl-text orange >}}Window terminal{{< /hl-text >}}  and run below command:

{{<codeblock "Windows Terminal">}}nuke :add-package GitVersion.Tool{{</codeblock >}}

{{< alert info no-icon>}}
In many cases, Nuke relies on third-party tools. You can add a NuGet package to a build project by calling: `nuke :add-package <package-id> [--version <package-version>]`. 

The major benefit compared to the `dotnet add package` command is that Nuke will automatically determine if the package should be referenced through PackageReference, i.e. as a normal library, or through PackageDownload, i.e. without affecting the dependency resolution graph.
{{< /alert >}}
## Run your first Nuke build
To make sure that Version is generated as per our expectation, we will add `GitVersion.yml` file in the root folder of our project. This file will contain the configuration for GitVersion. Below is the content of the file.

{{<codeblock "GitVersion.yml" "yaml">}}next-version: 1.0.0
assembly-versioning-scheme: MajorMinorPatch
assembly-file-versioning-scheme: MajorMinorPatch
mode: ContinuousDelivery
tag-prefix: '[vV]'
continuous-delivery-fallback-tag: ci
major-version-bump-message: '\+semver:\s?(breaking|major)'
minor-version-bump-message: '\+semver:\s?(feature|minor)'
patch-version-bump-message: '\+semver:\s?(fix|patch)'
no-bump-message: '\+semver:\s?(none|skip)'
legacy-semver-padding: 4
build-metadata-padding: 4
commits-since-version-source-padding: 4
tag-pre-release-weight: 60000
commit-message-incrementing: Enabled
branches:
    develop:
        mode: ContinuousDeployment
        tag: alpha
        increment: Minor
        prevent-increment-of-merged-branch-version: false
        track-merge-target: true
        regex: ^dev(elop)?(ment)?$
        source-branches: []
        tracks-release-branches: true
        is-release-branch: false
        is-mainline: false
        pre-release-weight: 0
    main:
        mode: ContinuousDelivery
        tag: ''
        increment: Patch
        prevent-increment-of-merged-branch-version: true
        track-merge-target: false
        regex: ^master$|^main$
        source-branches:
        - develop
        - release
        tracks-release-branches: false
        is-release-branch: true
        is-mainline: true
        pre-release-weight: 55000
    release:
        mode: ContinuousDelivery
        tag: beta
        increment: None
        prevent-increment-of-merged-branch-version: true
        track-merge-target: false
        regex: ^releases?[/-]
        source-branches:
        - develop
        - main
        - support
        - release
        tracks-release-branches: false
        is-release-branch: true
        is-mainline: false
        pre-release-weight: 30000
    feature:
        mode: ContinuousDelivery
        tag: useBranchName
        increment: Inherit
        prevent-increment-of-merged-branch-version: false
        track-merge-target: false
        regex: ^features?[/-]
        source-branches:
        - develop
        - main
        - release
        - feature
        - support
        - hotfix
        tracks-release-branches: false
        is-release-branch: false
        is-mainline: false
        pre-release-weight: 30000
    pull-request:
        mode: ContinuousDelivery
        tag: PullRequest
        increment: Inherit
        prevent-increment-of-merged-branch-version: false
        tag-number-pattern: '[/-](?<number>\d+)'
        track-merge-target: false
        regex: ^(pull|pull\-requests|pr)[/-]
        source-branches:
        - develop
        - main
        - release
        - feature
        - support
        - hotfix
        tracks-release-branches: false
        is-release-branch: false
        is-mainline: false
        pre-release-weight: 30000
    hotfix:
        mode: ContinuousDelivery
        tag: beta
        increment: Patch
        prevent-increment-of-merged-branch-version: false
        track-merge-target: false
        regex: ^hotfix(es)?[/-]
        source-branches:
        - develop
        - main
        - support
        tracks-release-branches: false
        is-release-branch: false
        is-mainline: false
        pre-release-weight: 30000
    support:
        mode: ContinuousDelivery
        tag: ''
        increment: Patch
        prevent-increment-of-merged-branch-version: true
        track-merge-target: false
        regex: ^support[/-]
        source-branches:
        - main
        tracks-release-branches: false
        is-release-branch: false
        is-mainline: true
        pre-release-weight: 55000
ignore:
    sha: []
commit-date-format: yyyy-MM-dd
merge-message-formats: {}
update-build-number: true
{{</codeblock >}}
You can now run the build script by executing the following command in the terminal.
{{<codeblock  "Windows Terminal" >}}nuke
{{</codeblock >}}

Here is the output of the above command: 
{{< image classes="center nocaption fancybox" src="/images/nuke/nuke_run_error_2.png" title="nuke error" >}}

Still it fails! 😣 because we have defined to run _Pack_ when the configuration is `Release`.you can run the same by passing the configuration as `Release` as below:
{{<codeblock  "Windows Terminal" >}}nuke --configuration Release
{{</codeblock >}}

{{< image classes="center nocaption fancybox" src="/images/nuke/nuke_run_success.png" title="nuke success" >}}

In the Next post, we are going to check-in our changes to Github and will create a release note automatically, so that we can easily track the changes in the release along with artifacts.