---
title: "Write your first building block in Nuke" # Title of the blog post.
date: 2022-08-30T11:08:35+01:00 # Date of post creation.
description: "Write your first building block in Nuke." # Description used for search engine.
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

This post is continuation of the series about a build automation tool called [**{{< hl-text cyan >}}Nuke{{< /hl-text >}}**](https://nuke.build/) . Over the time, I will updated this page with links to individual posts : 

[Getting Started with Nuke](/post/getting-started-with-nuke/)

_This Post - Write your first building block in Nuke_

[Coming Soon - Manage your Package Version using Nuke](#)

[Coming Soon - Manage your Package Release using Nuke in Github](#)

In our [last post](/post/getting-started-with-nuke/), we have created a new build project using **{{< hl-text cyan >}}Nuke{{< /hl-text >}}**. In this post, _first_ we will see what are the changes in the project structure and then we will write our first building block in **{{< hl-text cyan >}}Nuke{{< /hl-text >}}**. We will also see how to generate a new workflow for **{{< hl-text blue >}}Github Actions{{< /hl-text >}}** and _lastly_ we will run our build project from local system.

{{< toc >}}
## Effective changes
The setup will create a number of files in your repository and – if you've chosen so – add the build project to your solution file. Below, you can examine the structure of added files and what they are used for:
```
<root-directory>
├── .nuke                           # Root directory marker
│   ├── build.schema.json           # Build schema file
│   └── parameters.json             # Default parameters file
│
├── build
│   ├── .editorconfig               # Common formatting
│   ├── _build.csproj               # Build project file
│   ├── _build.csproj.DotSettings   # ReSharper/Rider formatting
│   ├── Build.cs                    # Default build implementation
│   ├── Configuration.cs            # Enumeration of build configurations
│   ├── Directory.Build.props       # MSBuild stop files
│   └── Directory.Build.targets
│
├── build.cmd                       # Cross-platform bootstrapping
├── build.ps1                       # Windows/PowerShell bootstrapping
└── build.sh                        # Linux/Shell bootstrapping
```
## Write your first "Target" block in Nuke
**{{< hl-text green>}}Target{{< /hl-text >}}** properties are the building blocks of a **{{< hl-text cyan >}}Nuke{{< /hl-text >}}** project. Inside a **{{< hl-text primary>}}Build{{< /hl-text >}}** class, you can define your build steps as **{{< hl-text green>}}Target{{< /hl-text >}}** properties. The implementation for a build step is provided as a lambda function through the Executes method:

{{<codeblock "Build.cs" "csharp">}}using Nuke.Common;
using Nuke.Common.Tools.DotNet;
using Nuke.Common.ProjectModel;
using static Nuke.Common.Tools.DotNet.DotNetTasks;

class Build : NukeBuild
{
    public static int Main() => Execute<Build>(x => x.Clean);

    [Solution(GenerateProjects = true)]
    readonly Solution Solution;

    Target Clean => _ => _
        .Description($"Cleaning Project.")
        .Executes(() =>
        {
           DotNetClean(c => c.SetProject(Solution.src.Sundry_HelloWorld));
        });
}

{{</codeblock >}}
In the above code, we have defined a {{< hl-text green>}}Clean{{< /hl-text >}} target. We gave some nice description to the target and we are executing _DotNetClean_. If you have noticed, we are using strongly typed _{{< hl-text primary>}}Solution.src.Sundry_HelloWorld{{< /hl-text >}}_ to reference the project file instead of _string_ literal. We are going to discuss more about this later.

You can make use of asynchronous execution by adding the **{{< hl-text warning>}}async{{< /hl-text >}}**  as well for example:

{{<codeblock "Build.cs" "csharp">}}using Nuke.Common;
class Build : NukeBuild
{
    public static int Main() => Execute<Build>();

    Target MyTarget => _ => _
        .Executes(async () =>
        {
            await Console.Out.WriteLineAsync("Hello!");
        });
}

{{</codeblock >}}

{{< alert warning>}}
Please note, Async targets are just a convenience feature that allows you using async APIs in a straightforward way. Behind the scenes, they are still run synchronously.
{{< /alert >}}

 We are going to use **{{< hl-text warning>}}async{{< /hl-text >}}** in coming **{{< hl-text green>}}Target{{< /hl-text >}}** with more complex tasks.

## Generate the build script for "Github Actions"
Now, we have defined our first **{{< hl-text green>}}Target{{< /hl-text >}}**. We are going to generate the build script for **{{< hl-text blue>}}Github Actions{{< /hl-text >}}**. In general, this is most annoying thing to do as you have to write it in Yml file. But we are going to do it in a very simple way by just adding a attribute to the Build class:
{{<codeblock "Build.cs" "csharp">}}using Nuke.Common;
using Nuke.Common.Tools.DotNet;
using Nuke.Common.ProjectModel;
using static Nuke.Common.Tools.DotNet.DotNetTasks;
using Nuke.Common.CI.GitHubActions;

[GitHubActions(
    "continuous",
    GitHubActionsImage.UbuntuLatest,
    AutoGenerate = true,
    FetchDepth = 0,
    OnPushBranches = new[] { "main", "dev", "releases/**" },
    OnPullRequestBranches = new[] { "releases/**" },
    InvokedTargets = new[] {
        nameof(Clean),
   },
    EnableGitHubToken = true,
    ImportSecrets = new[] { nameof(MyGetApiKey), nameof(NuGetApiKey) }
)]

class Build : NukeBuild
{
    public static int Main() => Execute<Build>(x => x.Clean);

    [Solution(GenerateProjects = true)]
    readonly Solution Solution;

    [Parameter("MyGet Api Key"), Secret]
    readonly string MyGetApiKey;

    [Parameter("Nuget Api Key"), Secret]
    readonly string NuGetApiKey;

    Target Clean => _ => _
        .Description($"Cleaning Project.")
        .Executes(() =>
        {
           DotNetClean(c => c.SetProject(Solution.src.Sundry_HelloWorld));
        });
}

{{</codeblock >}}

Let's try to understand the above code. We have added a **{{< hl-text orange>}}GitHubActions{{< /hl-text >}}** attribute to the **{{< hl-text primary>}}Build{{< /hl-text >}}** class. This attribute is used to generate the build script for **{{< hl-text blue>}}Github Actions{{< /hl-text >}}**. We have provided the following parameters to the attribute:

* **{{< hl-text orange>}}Name{{< /hl-text >}}** - This is the name of the workflow. It will be used to generate the workflow file name.
* **{{< hl-text orange>}}Image{{< /hl-text >}}** - This is the image that will be used to run the build. In our case, we are using _{{< hl-text blue>}}UbuntuLatest{{< /hl-text >}}_.
* **{{< hl-text orange>}}AutoGenerate{{< /hl-text >}}** - This is a boolean value that indicates whether the build script should be generated or not. In our case, we are setting it to _{{< hl-text blue>}}true{{< /hl-text >}}_.
* **{{< hl-text orange>}}FetchDepth{{< /hl-text >}}** - This is the number of commits that will be fetched from the repository. In our case, we are setting it to _{{< hl-text blue>}}0{{< /hl-text >}}_, which means all the commits will be fetched from all the branches and tags.
* **{{< hl-text orange>}}OnPushBranches{{< /hl-text >}}** - This is an array of branches that will trigger the build on push. In our case, we are setting it to _{{< hl-text blue>}}main{{< /hl-text >}}_, _{{< hl-text blue>}}dev{{< /hl-text >}}_ and _{{< hl-text blue>}}releases/**{{< /hl-text >}}_.
* **{{< hl-text orange>}}OnPullRequestBranches{{< /hl-text >}}** - This is an array of branches that will trigger the build on pull request. In our case, we are setting it to  _{{< hl-text blue>}}releases/**{{< /hl-text >}}_.
* **{{< hl-text orange>}}InvokedTargets{{< /hl-text >}}** - This is an array of targets that will be invoked when the build is triggered. In our case, we are setting it to _{{< hl-text blue>}}Clean{{< /hl-text >}}_.
* **{{< hl-text orange>}}EnableGitHubToken{{< /hl-text >}}** - This is a boolean value that indicates whether the _{{< hl-text blue>}}GITHUB_TOKEN{{< /hl-text >}}_ should be enabled or not. In our case, we are setting it to _{{< hl-text blue>}}true{{< /hl-text >}}_.
* **{{< hl-text orange>}}ImportSecrets{{< /hl-text >}}** - This is an array of secrets that will be imported from the repository. In our case, we are setting it to _{{< hl-text blue>}}MY_GET_API_KEY{{< /hl-text >}}_ and _{{< hl-text blue>}}NUGET_API_KEY{{< /hl-text >}}_.

Now, {{< hl-text red>}}build your project{{< /hl-text >}}, this is very __important step__ and then go to your root folder from your {{< hl-text orange >}}Window terminal{{< /hl-text >}}  and run below command to generate the build script:

```
nuke
```

This will generate the following yml file named __"continuous.yml"__ : 

{{<codeblock "continuous.yml" "yaml">}}
# ------------------------------------------------------------------------------
# <auto-generated>
#
#     This code was generated.
#
#     - To turn off auto-generation set:
#
#         [GitHubActions (AutoGenerate = false)]
#
#     - To trigger manual generation invoke:
#
#         nuke --generate-configuration GitHubActions_continuous --host GitHubActions
#
# </auto-generated>
# ------------------------------------------------------------------------------

name: continuous

on:
  push:
    branches:
      - main
      - dev
      - 'releases/**'
  pull_request:
    branches:
      - 'releases/**'

jobs:
  ubuntu-latest:
    name: ubuntu-latest
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Cache .nuke/temp, ~/.nuget/packages
        uses: actions/cache@v2
        with:
          path: |
            .nuke/temp
            ~/.nuget/packages
          key: ${{ runner.os }}-${{ hashFiles('**/global.json', '**/*.csproj') }}
      - name: Run './build.cmd Clean'
        run: ./build.cmd Clean
        env:
          MyGetApiKey: ${{ secrets.MY_GET_API_KEY }}
          NuGetApiKey: ${{ secrets.NUGET_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

{{</codeblock >}}
## Let's write all the "Target"

Now, we have basic foundation. Let's write all the targets that we need to build our project. We will write the following targets:

* **{{< hl-text green>}}Clean{{< /hl-text >}}** - This target will clean the project.

* **{{< hl-text green>}}Restore{{< /hl-text >}}** - This target will restore the project.

* **{{< hl-text green>}}Compile{{< /hl-text >}}** - This target will build the project.

* **{{< hl-text green>}}Pack{{< /hl-text >}}** - This target will pack the project and generate the artifact (Nuget package) to specific folder.

* **{{< hl-text green>}}PublishToGithub{{< /hl-text >}}** - This target will publish the package to Github, Only if the build is triggered from the **{{< hl-text red >}}dev{{< /hl-text >}}** branch or the pull request.

* **{{< hl-text green>}}PublishToMyGet{{< /hl-text >}}** - This target will publish the package to MyGet, only if the build is triggered from the **{{< hl-text yellow >}}release/**{{< /hl-text >}}** branch.

* **{{< hl-text green>}}PublishToNuGet{{< /hl-text >}}** - This target will publish the package to NuGet, only if the build is triggered from the **{{< hl-text green>}}main{{< /hl-text >}}** branch.

Lets write the above targets in our **{{< hl-text orange >}}build.cs{{< /hl-text >}}** file:

{{<codeblock "build.cs" "csharp">}}using System.Linq;

using Nuke.Common;
using Nuke.Common.IO;
using Nuke.Common.Git;
using Nuke.Common.ProjectModel;
using Nuke.Common.Tools.DotNet;
using Nuke.Common.Tools.GitVersion;
using Nuke.Common.Utilities.Collections;
using Nuke.Common.CI.GitHubActions;
using Nuke.Common.Tools.NerdbankGitVersioning;

using static Nuke.Common.IO.FileSystemTasks;
using static Nuke.Common.IO.PathConstruction;
using static Nuke.Common.Tools.DotNet.DotNetTasks;
[GitHubActions("continuous",
    GitHubActionsImage.UbuntuLatest,
    AutoGenerate = true,
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
}
{{</codeblock>}}
Couple of things to note here:

* **{{< hl-text red >}}Requires{{< /hl-text >}}** : This allows you to specify parameter requirement that must be met before the target is executed. In this case, we are saying that the target can only be executed if the configuration parameter is set to Release. This is because we don't want to publish a debug version of our packages.

* **{{< hl-text red >}}OnlyWhenStatic{{< /hl-text >}}** : This allows you to specify conditions that must be met before the target is executed. In our example for __PublishToGithub__ case, we are saying that the target can only be executed if the branch is set to develop or if it is a pull request. This is because we want to publish this only for internal users.

* **{{< hl-text red >}}Produces{{< /hl-text >}}** : This allows you to specify the output of the target. In our example, we are saying that the output of the target is the artifacts directory.

* **{{< hl-text red >}}Triggers{{< /hl-text >}}** : This allows you to specify the targets that should be executed after the current target. In our example, we are saying that the target __Pack__ should trigger the targets __PublishToGithub__, __PublishToMyGet__ and __PublishToNuGet__.

* **{{< hl-text red >}}DependsOn{{< /hl-text >}}** : This allows you to specify the targets that should be executed before the current target. In our example, we are saying that the target __Pack__ should depend on the targets __Compile__ and __Restore__.

* **{{< hl-text warning >}}Parameter{{< /hl-text >}}** : This attribute allows you to specify the parameters that should be passed to the target. You can specify the parameters in the following ways:

    * _**Through Command-Line**_ : You can specify the parameters from the command-line through their kebab-case names prefixed with a double-dash. For example, if you want to specify the `Configuration` parameter, you can do so by running the following command:{{<codeblock "" "powershell">}}nuke --configuration Release{{</codeblock >}}

    * _**Through Parameter Files**_ : You can specify the parameters in a parameter file. The parameter file is located in `.nuke` folder. {{<codeblock ".nuke/parameters.json" "json">}}{
    "$schema": "./build.schema.json",
    "Configuration": "Release"
}
{{</codeblock >}}
{{< alert info no-icon>}}
Besides the default parameters.json file, you can create additional profiles following the parameters.{name}.json naming pattern. These profiles can be loaded on-demand like : `nuke --profile {name} [other-profiles...]`
{{< /alert >}}

    * _**Through Environment Variables**_ : You can specify the parameters through environment variables. My recommendation would be to keep The environment variables prefixed with `NUKE_` and keep the parameter name in uppercase. For example, if you want to specify the `Configuration` parameter, you can do so by setting the environment variable `NUKE_CONFIGURATION` to `Release`. Nuke will automatically pick up the environment variables and use them as parameters.

* **{{< hl-text warning >}}Secret{{< /hl-text >}}** : This attribute allows you to specify the parameters that should be passed to the target as secrets such as API Key, password. In our example, we are specifying the `NuGetApiKey` as a secret. 


* **{{< hl-text warning >}}Solution{{< /hl-text >}}** : This attribute allows you to specify the solution file that should be used for the target. In our example, we are saying that the solution file that should be used for the target is `Sundry HelloWorld.sln`. We are also mentioning the project name should be automatically inferred from the solution file. Hence we used `GenerateProjects = true`.

* **{{< hl-text warning >}}GitVersion{{< /hl-text >}}** : This attribute allows you to get the version of the build. In our example, we are saying that we want to get the version of the build from GitVersion. we will discuss more about GitVersion in the next post.
    
* **{{< hl-text warning >}}GitRepository{{< /hl-text >}}** : This attribute allows you to get the repository information.

## New Requirement! 😈
As we understand from the above, Github will trigger this scripts when we push to the **{{< hl-text green>}}main{{< /hl-text >}}**, **{{< hl-text yellow >}}release/**{{< /hl-text >}}** and **{{< hl-text red >}}dev{{< /hl-text >}}** branches. 

Also it will trigger when  we submit pull request for the **{{< hl-text yellow >}}release/**{{< /hl-text >}}** branch.

But, I don't want to trigger this Action when we push `Readme.md` file to any of the branches. So, to achieve this, we have to add `paths-ignore:` in the yml file. But **{{< hl-text cyan >}}Nuke{{< /hl-text >}}**_doesn't support_ this feature yet. So, we have to add it manually. 

To do that first, let's disable the auto-generation of the yml file by updating **{{< hl-text purple>}}AutoGenerate {{< /hl-text >}}** property of the **{{< hl-text green>}}GitHubActions{{< /hl-text >}}** attribute, like below:

{{<codeblock "Build.cs" "csharp">}}using Nuke.Common;
using Nuke.Common.Tools.DotNet;
using Nuke.Common.ProjectModel;
using static Nuke.Common.Tools.DotNet.DotNetTasks;
using Nuke.Common.CI.GitHubActions;

[GitHubActions(
    "continuous",
    GitHubActionsImage.UbuntuLatest,
    AutoGenerate = false,
    FetchDepth = 0,
    OnPushBranches = new[] { "main", "dev", "releases/**" },
    OnPullRequestBranches = new[] { "releases/**" },
    InvokedTargets = new[] {
        nameof(Clean),
   },
    EnableGitHubToken = true,
    ImportSecrets = new[] { nameof(MyGetApiKey), nameof(NuGetApiKey) }
)]

class Build : NukeBuild
{
    /* Omitted */
}

{{</codeblock >}}

Now, update the yml file by adding `paths-ignore:` as below:

{{<codeblock "continuous.yml" "yaml">}}
# ------------------------------------------------------------------------------
# <auto-generated>
#
#     This code was generated.
#
#     - To turn off auto-generation set:
#
#         [GitHubActions (AutoGenerate = false)]
#
#     - To trigger manual generation invoke:
#
#         nuke --generate-configuration GitHubActions_continuous --host GitHubActions
#
# </auto-generated>
# ------------------------------------------------------------------------------

name: continuous

on:
  push:
    branches:
      - main
      - dev
      - 'releases/**'
    paths-ignore:
      - '**/README.md'
  pull_request:
    branches:
      - 'releases/**'
    paths-ignore:
      - '**/README.md'

jobs:
  ubuntu-latest:
    name: ubuntu-latest
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Cache .nuke/temp, ~/.nuget/packages
        uses: actions/cache@v2
        with:
          path: |
            .nuke/temp
            ~/.nuget/packages
          key: ${{ runner.os }}-${{ hashFiles('**/global.json', '**/*.csproj') }}
      - name: Run './build.cmd Pack'
        run: ./build.cmd Pack
        env:
          MyGetApiKey: ${{ secrets.MY_GET_API_KEY }}
          NuGetApiKey: ${{ secrets.NUGET_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/upload-artifact@v1
        with:
          name: .artifacts
          path: .artifacts
{{</codeblock >}}

## Run your first Nuke build
At this point, we have a working build script.  You can run the build script by executing the following command in the terminal but make sure you have Git repository initialized.

{{<codeblock >}}nuke
{{</codeblock >}}

Here is the output of the above command: 
{{< image classes="center nocaption fancybox" src="/images/nuke/nuke_run_error.png" title="vs" >}}

As we can see, we are getting an error that, _could not inject value for GitVersion_. This is because we haven't installed the _{{< hl-text success >}}GitVersion{{< /hl-text >}}_ tool yet.

In the next article, we will add the _{{< hl-text success >}}GitVersion{{< /hl-text >}}_ tool and we will learn how to manage a version of a package using the same .




