---
title: Write your first building block in Nuke
date: 2022-08-30T10:08:35.000Z
description: Write your first building block in Nuke.
featured: true
draft: false
toc: false
featureImage: /images/nuke/nuke_plan.png
thumbnailImage: /images/nuke/nuke_plan.png
shareImage: /images/nuke/nuke_plan.png
codeMaxLines: 10
codeLineNumbers: false
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
  - github nuget
comments: true
showSocial: true
---
Hi Everyone!

In our [last post](/post/getting-started-with-nuke/), we have created a new build project using **<span class="hl hl-cyan">Nuke</span>**. In this post, _first_ we will see what are the changes in the project structure and then we will write our first building block in **<span class="hl hl-cyan">Nuke</span>**. We will also see how to generate a new workflow for **<span class="hl hl-blue">Github Actions</span>** and _lastly_ we will run our build project from local system.


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
**<span class="hl hl-green">Target</span>** properties are the building blocks of a **<span class="hl hl-cyan">Nuke</span>** project. Inside a **<span class="hl hl-primary">Build</span>** class, you can define your build steps as **<span class="hl hl-green">Target</span>** properties. The implementation for a build step is provided as a lambda function through the Executes method:



<div class="code-title">Build.cs</div>

```csharp
using Nuke.Common;
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

```


In the above code, we have defined a <span class="hl hl-green">Clean</span> target. We gave some nice description to the target and we are executing _DotNetClean_. If you have noticed, we are using strongly typed _<span class="hl hl-primary">Solution.src.Sundry_HelloWorld</span>_ to reference the project file instead of _string_ literal. We are going to discuss more about this later.

You can make use of asynchronous execution by adding the **<span class="hl hl-warning">async</span>**  as well for example:



<div class="code-title">Build.cs</div>

```csharp
using Nuke.Common;
class Build : NukeBuild
{
    public static int Main() => Execute<Build>();

    Target MyTarget => _ => _
        .Executes(async () =>
        {
            await Console.Out.WriteLineAsync("Hello!");
        });
}

```





<aside class="callout callout-warning callout-warning">
<p>Please note, Async targets are just a convenience feature that allows you using async APIs in a straightforward way. Behind the scenes, they are still run synchronously.</p>
</aside>



 We are going to use **<span class="hl hl-warning">async</span>** in coming **<span class="hl hl-green">Target</span>** with more complex tasks.

## Generate the build script for "Github Actions"
Now, we have defined our first **<span class="hl hl-green">Target</span>**. We are going to generate the build script for **<span class="hl hl-blue">Github Actions</span>**. In general, this is most annoying thing to do as you have to write it in Yml file. But we are going to do it in a very simple way by just adding a attribute to the Build class:


<div class="code-title">Build.cs</div>

```csharp
using Nuke.Common;
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

```



Let's try to understand the above code. We have added a **<span class="hl hl-orange">GitHubActions</span>** attribute to the **<span class="hl hl-primary">Build</span>** class. This attribute is used to generate the build script for **<span class="hl hl-blue">Github Actions</span>**. We have provided the following parameters to the attribute:

* **<span class="hl hl-orange">Name</span>** - This is the name of the workflow. It will be used to generate the workflow file name.
* **<span class="hl hl-orange">Image</span>** - This is the image that will be used to run the build. In our case, we are using _<span class="hl hl-blue">UbuntuLatest</span>_.
* **<span class="hl hl-orange">AutoGenerate</span>** - This is a boolean value that indicates whether the build script should be generated or not. In our case, we are setting it to _<span class="hl hl-blue">true</span>_.
* **<span class="hl hl-orange">FetchDepth</span>** - This is the number of commits that will be fetched from the repository. In our case, we are setting it to _<span class="hl hl-blue">0</span>_, which means all the commits will be fetched from all the branches and tags.
* **<span class="hl hl-orange">OnPushBranches</span>** - This is an array of branches that will trigger the build on push. In our case, we are setting it to _<span class="hl hl-blue">main</span>_, _<span class="hl hl-blue">dev</span>_ and _<span class="hl hl-blue">releases/**</span>_.
* **<span class="hl hl-orange">OnPullRequestBranches</span>** - This is an array of branches that will trigger the build on pull request. In our case, we are setting it to  _<span class="hl hl-blue">releases/**</span>_.
* **<span class="hl hl-orange">InvokedTargets</span>** - This is an array of targets that will be invoked when the build is triggered. In our case, we are setting it to _<span class="hl hl-blue">Clean</span>_.
* **<span class="hl hl-orange">EnableGitHubToken</span>** - This is a boolean value that indicates whether the _<span class="hl hl-blue">GITHUB_TOKEN</span>_ should be enabled or not. In our case, we are setting it to _<span class="hl hl-blue">true</span>_.
* **<span class="hl hl-orange">ImportSecrets</span>** - This is an array of secrets that will be imported from the repository. In our case, we are setting it to _<span class="hl hl-blue">MY_GET_API_KEY</span>_ and _<span class="hl hl-blue">NUGET_API_KEY</span>_.

Now, <span class="hl hl-red">build your project</span>, this is very __important step__ and then go to your root folder from your <span class="hl hl-orange">Window terminal</span>  and run below command to generate the build script:

```
nuke
```

This will generate the following yml file named __"continuous.yml"__ : 



<div class="code-title">continuous.yml</div>

```yaml

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

```


## Let's write all the "Target"

Now, we have basic foundation. Let's write all the targets that we need to build our project. We will write the following targets:

* **<span class="hl hl-green">Clean</span>** - This target will clean the project.

* **<span class="hl hl-green">Restore</span>** - This target will restore the project.

* **<span class="hl hl-green">Compile</span>** - This target will build the project.

* **<span class="hl hl-green">Pack</span>** - This target will pack the project and generate the artifact (Nuget package) to specific folder.

* **<span class="hl hl-green">PublishToGithub</span>** - This target will publish the package to Github, Only if the build is triggered from the **<span class="hl hl-red">dev</span>** branch or the pull request.

* **<span class="hl hl-green">PublishToMyGet</span>** - This target will publish the package to MyGet, only if the build is triggered from the **<span class="hl hl-yellow">release/**</span>** branch.

* **<span class="hl hl-green">PublishToNuGet</span>** - This target will publish the package to NuGet, only if the build is triggered from the **<span class="hl hl-green">main</span>** branch.

Lets write the above targets in our **<span class="hl hl-orange">Build.cs</span>** file:



<div class="code-title">build.cs</div>

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
```


Couple of things to note here:

* **<span class="hl hl-red">Requires</span>** : This allows you to specify parameter requirement that must be met before the target is executed. In this case, we are saying that the target can only be executed if the configuration parameter is set to Release. This is because we don't want to publish a debug version of our packages.

* **<span class="hl hl-red">OnlyWhenStatic</span>** : This allows you to specify conditions that must be met before the target is executed. In our example for __PublishToGithub__ case, we are saying that the target can only be executed if the branch is set to develop or if it is a pull request. This is because we want to publish this only for internal users.

* **<span class="hl hl-red">Produces</span>** : This allows you to specify the output of the target. In our example, we are saying that the output of the target is the artifacts directory.

* **<span class="hl hl-red">Triggers</span>** : This allows you to specify the targets that should be executed after the current target. In our example, we are saying that the target __Pack__ should trigger the targets __PublishToGithub__, __PublishToMyGet__ and __PublishToNuGet__.

* **<span class="hl hl-red">DependsOn</span>** : This allows you to specify the targets that should be executed before the current target. In our example, we are saying that the target __Pack__ should depend on the targets __Compile__ and __Restore__.

* **<span class="hl hl-warning">Parameter</span>** : This attribute allows you to specify the parameters that should be passed to the target. You can specify the parameters in the following ways:

    * _**Through Command-Line**_ : You can specify the parameters from the command-line through their kebab-case names prefixed with a double-dash. For example, if you want to specify the `Configuration` parameter, you can do so by running the following command:

```powershell
nuke --configuration Release
```



    * _**Through Parameter Files**_ : You can specify the parameters in a parameter file. The parameter file is located in `.nuke` folder. 

<div class="code-title">.nuke/parameters.json</div>

```json
{
    "$schema": "./build.schema.json",
    "Configuration": "Release"
}
```




<aside class="callout callout-info callout-info callout-no-icon">
<p>Besides the default parameters.json file, you can create additional profiles following the parameters.{name}.json naming pattern. These profiles can be loaded on-demand like : <code>nuke --profile {name} [other-profiles...]</code></p>
</aside>



    * _**Through Environment Variables**_ : You can specify the parameters through environment variables. My recommendation would be to keep The environment variables prefixed with `NUKE_` and keep the parameter name in uppercase. For example, if you want to specify the `Configuration` parameter, you can do so by setting the environment variable `NUKE_CONFIGURATION` to `Release`. Nuke will automatically pick up the environment variables and use them as parameters.

* **<span class="hl hl-warning">Secret</span>** : This attribute allows you to specify the parameters that should be passed to the target as secrets such as API Key, password. In our example, we are specifying the `NuGetApiKey` as a secret. 


* **<span class="hl hl-warning">Solution</span>** : This attribute allows you to specify the solution file that should be used for the target. In our example, we are saying that the solution file that should be used for the target is `Sundry HelloWorld.sln`. We are also mentioning the project name should be automatically inferred from the solution file. Hence we used `GenerateProjects = true`.

* **<span class="hl hl-warning">GitVersion</span>** : This attribute allows you to get the version of the build. In our example, we are saying that we want to get the version of the build from GitVersion. we will discuss more about GitVersion in the next post.
    
* **<span class="hl hl-warning">GitRepository</span>** : This attribute allows you to get the repository information.

## New Requirement! 😈
As we understand from the above, Github will trigger this scripts when we push to the **<span class="hl hl-green">main</span>**, **<span class="hl hl-yellow">release/**</span>** and **<span class="hl hl-red">dev</span>** branches. 

Also it will trigger when  we submit pull request for the **<span class="hl hl-yellow">release/**</span>** branch.

But, I don't want to trigger this Action when we push `Readme.md` file to any of the branches. So, to achieve this, we have to add `paths-ignore:` in the yml file. But **<span class="hl hl-cyan">Nuke</span>**_doesn't support_ this feature yet. So, we have to add it manually. 

To do that first, let's disable the auto-generation of the yml file by updating **<span class="hl hl-purple">AutoGenerate</span>** property of the **<span class="hl hl-green">GitHubActions</span>** attribute, like below:



<div class="code-title">Build.cs</div>

```csharp
using Nuke.Common;
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

```



Now, update the yml file by adding `paths-ignore:` as below:



<div class="code-title">continuous.yml</div>

```yaml

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
```



## Run your first Nuke build
At this point, we have a working build script.  You can run the build script by executing the following command in the terminal but make sure you have Git repository initialized.



```
nuke
```



Here is the output of the above command: 


<figure class="post-figure center nocaption fancybox">
  <img src="/images/nuke/nuke_run_error.png" alt="vs" loading="lazy" />
  
</figure>



As we can see, we are getting an error that, _could not inject value for GitVersion_. This is because we haven't installed the _<span class="hl hl-success">GitVersion</span>_ tool yet.

In the next article, we will add the _<span class="hl hl-success">GitVersion</span>_ tool and we will learn how to manage a version of a package using the same .




