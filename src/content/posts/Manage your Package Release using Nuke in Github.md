---
title: Manage your Package Release using Nuke in Github
date: 2022-09-05T10:08:35.000Z
description: Manage your Package Release using Nuke in Github.
draft: false
thumbnailImage: /images/nuke/nuke_plan.png
shareImage: /images/nuke/nuke_plan.png
figurePositionShow: true
series: Nuke
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
  - github feed
  - github nuget
  - gitversion
featured: false
toc: false
comments: true
showSocial: true
---
Hi Everyone!

In our [last post](/post/manage-your-package-version-using-nuke/), we ran the build successfully in our local machine. But before we check-in, we need to make sure that we have all the required secrets in the repository, such as _Myget API key_, _Nuget API key_. 

If you are following the series from the beginning, once you checked-in the code, it will trigger the build in **<span class="hl hl-green">Github</span>**. But if will get the error as shown below:



<figure class="post-figure center nocaption fancybox">
  <img src="/images/nuke/github_workflow_error.png" alt="github workflow error" loading="lazy" />
  
</figure>



So, in this post, we will fix the error and then we will see how to manage the release using  **<span class="hl hl-orange">Github Release</span>**.

## Fix the Issue (Skip if you are not following the series from the beginning)
The error caused due to inadequate "Permissions" to run the Shell. To fix this, we need to add required permissions to the **<span class="hl hl-warning">build.cmd</span>** and **<span class="hl hl-warning">build.sh</span>** files. Run the following commands in the terminal to fix the issue:



<div class="code-title">Windows Terminal</div>

```
git update-index --add --chmod=+x build.cmd
git update-index --add --chmod=+x build.sh
```



At this point, you can check-in the code and it will trigger the build in **<span class="hl hl-green">Github</span>** and will run successfully.But we will check-in once we have completed the release process.

## What is Github Release?
Releases are deployable software iterations you can package and make available for a wider audience to download and use.

Releases are based on **<span class="hl hl-red">Git tags</span>**, which mark a specific point in your repository's history

## Create a Release
Currently, **<span class="hl hl-cyan">Nuke</span>** doesn't have a built-in task to create a release. But **<span class="hl hl-cyan">Nuke</span>** uses **<span class="hl hl-primary">Octokit</span>** to interact with **<span class="hl hl-green">Github</span>**. So, we can use the **<span class="hl hl-primary">Octokit</span>** to create a release.

### Create a Release Task
We will create a new task called **<span class="hl hl-green">CreateRelease</span>** in the **<span class="hl hl-orange">Build.cs</span>** file. Below shows updated **<span class="hl hl-orange">Build.cs</span>** file:



<div class="code-title">Build.cs</div>

```csharp
using System.Linq;

using Nuke.Common;
using Nuke.Common.IO;
using Nuke.Common.Git;
using Nuke.Common.ProjectModel;
using Nuke.Common.Tools.DotNet;
using Nuke.Common.Tools.GitVersion;
using Nuke.Common.Utilities.Collections;
using Nuke.Common.CI.GitHubActions;

using static Nuke.Common.IO.FileSystemTasks;
using static Nuke.Common.IO.PathConstruction;
using static Nuke.Common.Tools.DotNet.DotNetTasks;
using System.IO;
using Octokit;
using System.Threading.Tasks;
using Nuke.Common.Tools.GitHub;
using Nuke.Common.ChangeLog;
using System;
using Octokit.Internal;
using ParameterAttribute = Nuke.Common.ParameterAttribute;

[GitHubActions("continuous",
GitHubActionsImage.UbuntuLatest,
AutoGenerate = false,
FetchDepth = 0,
    OnPushBranches = new[] 
    {
        "main", 
        "dev",
        "releases/**"
    },
    OnPullRequestBranches = new[] 
    {
        "releases/**" 
    },
    InvokedTargets = new[]
    {
        nameof(Pack),
    },
    EnableGitHubToken = true,
    ImportSecrets = new[] 
    { 
        nameof(MyGetApiKey), 
        nameof(NuGetApiKey) 
    }
)]

class Build : NukeBuild
{
    public static int Main() => Execute<Build>(x => x.Pack);
    
    [Parameter("Configuration to build - Default is 'Debug' (local) or 'Release' (server)")]
    readonly Configuration Configuration = IsLocalBuild ? Configuration.Debug : Configuration.Release;

    [Parameter("MyGet Feed Url for Public Access of Pre Releases")]
    readonly string MyGetNugetFeed;
    [Parameter("MyGet Api Key"), Secret]
    readonly string MyGetApiKey;

    [Parameter("Nuget Feed Url for Public Access of Pre Releases")]
    readonly string NugetFeed;
    [Parameter("Nuget Api Key"), Secret]
    readonly string NuGetApiKey;

    [Parameter("Copyright Details")]
    readonly string Copyright;

    [Parameter("Artifacts Type")]
    readonly string ArtifactsType;

    [Parameter("Excluded Artifacts Type")]
    readonly string ExcludedArtifactsType;

    [GitVersion]
    readonly GitVersion GitVersion;

    [GitRepository]
    readonly GitRepository GitRepository;

    [Solution(GenerateProjects = true)]
    readonly Solution Solution;

    static GitHubActions GitHubActions => GitHubActions.Instance;
    static AbsolutePath ArtifactsDirectory => RootDirectory / ".artifacts";

    static readonly string PackageContentType = "application/octet-stream";
    static string ChangeLogFile => RootDirectory / "CHANGELOG.md";

    string GithubNugetFeed => GitHubActions != null
         ? $"https://nuget.pkg.github.com/{GitHubActions.RepositoryOwner}/index.json"
         : null;


    Target Clean => _ => _
      .Description($"Cleaning Project.")
      .Before(Restore)
      .Executes(() =>
      {
          DotNetClean(c => c.SetProject(Solution.src.Sundry_HelloWorld));
          EnsureCleanDirectory(ArtifactsDirectory);
      });
    Target Restore => _ => _
        .Description($"Restoring Project Dependencies.")
        .DependsOn(Clean)
        .Executes(() =>
        {
            DotNetRestore(
                r => r.SetProjectFile(Solution.src.Sundry_HelloWorld));
        });

    Target Compile => _ => _
        .Description($"Building Project with the version.")
        .DependsOn(Restore)
        .Executes(() =>
        {
            DotNetBuild(b => b
                .SetProjectFile(Solution.src.Sundry_HelloWorld)
                .SetConfiguration(Configuration)
                .SetVersion(GitVersion.NuGetVersionV2)
                .SetAssemblyVersion(GitVersion.AssemblySemVer)
                .SetInformationalVersion(GitVersion.InformationalVersion)
                .SetFileVersion(GitVersion.AssemblySemFileVer)
                .EnableNoRestore());
        });

    Target Pack => _ => _
    .Description($"Packing Project with the version.")
    .Requires(() => Configuration.Equals(Configuration.Release))
    .Produces(ArtifactsDirectory / ArtifactsType)
    .DependsOn(Compile)
    .Triggers(PublishToGithub, PublishToMyGet, PublishToNuGet)
    .Executes(() =>
    {
        DotNetPack(p =>
            p
                .SetProject(Solution.src.Sundry_HelloWorld)
                .SetConfiguration(Configuration)
                .SetOutputDirectory(ArtifactsDirectory)
                .EnableNoBuild()
                .EnableNoRestore()
                .SetCopyright(Copyright)
                .SetVersion(GitVersion.NuGetVersionV2)
                .SetAssemblyVersion(GitVersion.AssemblySemVer)
                .SetInformationalVersion(GitVersion.InformationalVersion)
                .SetFileVersion(GitVersion.AssemblySemFileVer));
    });

    Target PublishToGithub => _ => _
       .Description($"Publishing to Github for Development only.")
       .Triggers(CreateRelease)
       .Requires(() => Configuration.Equals(Configuration.Release))
       .OnlyWhenStatic(() => GitRepository.IsOnDevelopBranch() || GitHubActions.IsPullRequest)
       .Executes(() =>
       {
           GlobFiles(ArtifactsDirectory, ArtifactsType)
               .Where(x => !x.EndsWith(ExcludedArtifactsType))
               .ForEach(x =>
               {
                   DotNetNuGetPush(s => s
                       .SetTargetPath(x)
                       .SetSource(GithubNugetFeed)
                       .SetApiKey(GitHubActions.Token)
                       .EnableSkipDuplicate()
                   );
               });
       });

    Target PublishToMyGet => _ => _
       .Description($"Publishing to MyGet for PreRelese only.")
       .Requires(() => Configuration.Equals(Configuration.Release))
       .Triggers(CreateRelease)
       .OnlyWhenStatic(() => GitRepository.IsOnReleaseBranch())
       .Executes(() =>
       {
           GlobFiles(ArtifactsDirectory, ArtifactsType)
               .Where(x => !x.EndsWith(ExcludedArtifactsType))
               .ForEach(x =>
               {
                   DotNetNuGetPush(s => s
                       .SetTargetPath(x)
                       .SetSource(MyGetNugetFeed)
                       .SetApiKey(MyGetApiKey)
                       .EnableSkipDuplicate()
                   );
               });
       });
    Target PublishToNuGet => _ => _
       .Description($"Publishing to NuGet with the version.")
       .Triggers(CreateRelease)
       .Requires(() => Configuration.Equals(Configuration.Release))
       .OnlyWhenStatic(() => GitRepository.IsOnMainOrMasterBranch())
       .Executes(() =>
       {
           GlobFiles(ArtifactsDirectory, ArtifactsType)
               .Where(x => !x.EndsWith(ExcludedArtifactsType))
               .ForEach(x =>
               {
                   DotNetNuGetPush(s => s
                       .SetTargetPath(x)
                       .SetSource(NugetFeed)
                       .SetApiKey(NuGetApiKey)
                       .EnableSkipDuplicate()
                   );
               });
       });

    Target CreateRelease => _ => _
       .Description($"Creating release for the publishable version.")
       .Requires(() => Configuration.Equals(Configuration.Release))
       .OnlyWhenStatic(() => GitRepository.IsOnMainOrMasterBranch() || GitRepository.IsOnReleaseBranch())
       .Executes(async () =>
       {
           var credentials = new Credentials(GitHubActions.Token);
           GitHubTasks.GitHubClient = new GitHubClient(new ProductHeaderValue(nameof(NukeBuild)),
               new InMemoryCredentialStore(credentials));

           var (owner, name) = (GitRepository.GetGitHubOwner(), GitRepository.GetGitHubName());

           var releaseTag = GitVersion.NuGetVersionV2;
           var changeLogSectionEntries = ChangelogTasks.ExtractChangelogSectionNotes(ChangeLogFile);
           var latestChangeLog = changeLogSectionEntries
               .Aggregate((c, n) => c + Environment.NewLine + n);

           var newRelease = new NewRelease(releaseTag)
           {
               TargetCommitish = GitVersion.Sha,
               Draft = true,
               Name = $"v{releaseTag}",
               Prerelease = !string.IsNullOrEmpty(GitVersion.PreReleaseTag),
               Body = latestChangeLog
           };

           var createdRelease = await GitHubTasks
                                       .GitHubClient
                                       .Repository
                                       .Release.Create(owner, name, newRelease);

           GlobFiles(ArtifactsDirectory, ArtifactsType)
              .Where(x => !x.EndsWith(ExcludedArtifactsType))
              .ForEach(async x => await UploadReleaseAssetToGithub(createdRelease, x));

           await GitHubTasks
                      .GitHubClient
                      .Repository
                      .Release
              .Edit(owner, name, createdRelease.Id, new ReleaseUpdate { Draft = false });
       });


    private static async Task UploadReleaseAssetToGithub(Release release, string asset)
    {
        await using var artifactStream = File.OpenRead(asset);
        var fileName = Path.GetFileName(asset);
        var assetUpload = new ReleaseAssetUpload
        {
            FileName = fileName,
            ContentType = PackageContentType,
            RawData = artifactStream,
        };
        await GitHubTasks.GitHubClient.Repository.Release.UploadAsset(release, assetUpload);
    }
}
```



**<span class="hl hl-green">CreateRelease</span>** is dependent on the **<span class="hl hl-green">PublishToGithub</span>**, **<span class="hl hl-green">PublishToMyGet</span>** and **<span class="hl hl-green">PublishToNuGet</span>** targets. This is because we want to create a release only after the artifacts are published to the respective feeds if the build is triggered from the main/master branch or the release branch.

### Make use of CHANGELOG.md
As you can see, the above Task is dependent on the **<span class="hl hl-blue">ChangelogTasks</span>**. This is because we want to extract the latest changes from the __CHANGELOG.md__ file and add it to the release notes. This is a very useful feature and helps us to keep track of the changes made to the project.

For example, let's create a new __CHANGELOG.md__ in the root of the project and add the following content to it.



<div class="code-title">CHANGELOG.md</div>

```
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 / 2022-09-05
### Added
- Added CHANGELOG
- Initial Release of the package

```


Once these changes are committed in  **<span class="hl hl-red">dev</span>** branch, **<span class="hl hl-blue">Github Actions</span>** will automatically run. You can see the results of the build in the __Actions__ tab: 


<figure class="post-figure center nocaption fancybox">
  <img src="/images/nuke/github_workflow_success.png" alt="github workflow success" loading="lazy" />
  
</figure>



Our expectation is, it will publish the artifacts to the respective feeds. But, it didn't. Because we have not added correct parameters in the _parameters.json_ file. Let's do that now.


<div class="code-title">.nuke/parameters.json</div>

```json
{
  "$schema": "./build.schema.json",
  "Solution": "Sundry.HelloWorld.sln",
  "ArtifactsType": "*.nupkg",
  "Copyright": "©SunDryOSS 2022",
  "ExcludedArtifactsType": "symbols.nupkg",
  "MyGetNugetFeed": "https://www.myget.org/F/sundryossdemo/api/v3/index.json",
  "NugetFeed": "https://www.myget.org/F/sundryossdemo/api/v3/index.json"
}
```



Now, as expected, the artifacts are published to the _Github Packages_. You can see the results in the __Packages__ tab:


<figure class="post-figure center nocaption fancybox">
  <img src="/images/nuke/github_package.png" alt="github packages" loading="lazy" />
  
</figure>



But it didn't create a release. Let's raise a _PR_ for release branch.It will run the Action again to create a temporary package to test.



<figure class="post-figure center nocaption fancybox">
  <img src="/images/nuke/github_package_temp_package.png" alt="github_package_temp_package" loading="lazy" />
  
</figure>



Once the PR is merged, the Action will run again and this time it will create a release. You can see the results in the __Releases__ tab:



<figure class="post-figure center nocaption fancybox">
  <img src="/images/nuke/github_release.png" alt="github release" loading="lazy" />
  
</figure>



It will also publish the __beta artifacts__ to the _MyGet_ feed. You can see the result:



<figure class="post-figure center nocaption fancybox">
  <img src="/images/nuke/myget_feed.png" alt="myget_feed" loading="lazy" />
  
</figure>




## Conclusion
Phew!😵 That was a long journey. We have skipped publishing to the _NuGet_ feed because it is very similar to the _MyGet_ feed and hopefully, you have understood the concept.
Here is the link to the source code of the project: [https://github.com/sundryoss/Sundry.HelloWorld](https://github.com/sundryoss/Sundry.HelloWorld)

I hope you have enjoyed this article. If you have any questions or suggestions, please feel free to reach out by commenting below. I will be happy to help you.
