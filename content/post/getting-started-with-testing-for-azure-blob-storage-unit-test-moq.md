---
title: "Getting started with testing for Azure Blob Storage : Unit Test with help of Moq" # Title of the blog post.
date: 2023-01-16T09:00:35+01:00 # Date of post creation.
description: "Perform unit & integration tests for Azure Blob Storage: Unit Test with help of Moq" # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnailImage: "/images/azstorage/banner.png"
thumbnailImagePosition: left
shareImage: "/images/azstorage/banner.png" # Designate a separate image for social media sharing.
codeMaxLines: 10 # Override global value for how many lines within a code block before auto-collapsing.
codeLineNumbers: false # Override global value for showing of line numbers within code block.
figurePositionShow: true # Override global value for showing the figure label.

categories:
- Azure
- Azurite
- Unit Testing
- Integration Testing
- Test Containers
- Moq
- xUnit
- .NET 7
tags:
- azure
- testing
- c#
keywords:
- azure storage unit test
- azure storage unit testing
- azure storage integration test
- azure storage integration testing
- azure storage test containers
- azure storage testcontainers
- azure storage moq
- azure storage xunit
- azure storage .net 7
- azure storage azurite
- azure storage azurite test containers
- azure storage azurite moq
- azure storage azurite xunit
- azure storage azurite .net 7
- azure storage azurite unit testing
- azure storage azurite integration testing
- azure storage azurite test containers
- azure storage azurite testcontainers
- azure storage unit testing
- azure storage blob integration testing
- azure storage blob test containers
- azure storage blob moq
- azure storage blob xunit
- azure storage blob .net 7
- azure storage blob azurite
- azure storage blob azurite test containers
- azure storage blob azurite moq
- azure storage blob azurite xunit
- azure storage blob azurite .net 7
- azure storage blob azurite unit testing
- azure storage blob azurite integration testing
- azure storage blob azurite test containers
- azure storage blob azurite testcontainers
- azurite integration testing
- azurite test containers
- azurite moq
- azurite xunit
- azurite .net 7
- azurite unit testing
- unit and integration testing for azure blob storage
- unit and integration testing for azure blob storage using azurite test containers
- unit and integration testing for azure blob storage using azurite testcontainers
- unit and integration testing for azure blob storage using xunit moq
- unit and integration testing for azure blob storage using .net 7
- unit and integration testing for azure blob storage using azurite
- BlobContainerClient
- BlobContainerClient dependency injection
- BlobClient
- BlobServiceClient
- Azure.Storage.Blobs 
- Azure.Storage.Blobs v12 unit testing
- Azure.Storage.Blobs v12 integration testing
- Dependency injection
- azure storage blob dependency injection
- azure storage dependency injection
- azure storage testing
- azurite
- moving solutions to Azure Cloud
- How to Test Azure Blob Storage
- How to make integration test for Azure Storage 
- azure
- integration test for azure storage,
- storage
- unit test
- getting started with testing for azure blob storage
- getting started with testing for azure blob storage dependency injection
- getting started with testing for azure blob storage unit test
- getting started with testing for azure blob storage unit test with moq
- getting started with testing for azure blob storage integration test
- getting started with testing for azure blob storage integration test with azurite test containers
- getting started with testing for azure blob storage integration test with azurite testcontainers
- class fixture
- collection fixture
- IAsyncLifetime
- xunit class fixture
- xunit collection fixture
- xunit IAsyncLifetime
- azurite IAsyncLifetime
---
Hi Everyone!

This post is continuation of how to perform unit and integration tests for Azure Blob Storage using Azurite Test Containers, Moq and xUnit. Over the time, I will updated this page with links to individual posts : 

[Getting started with testing for Azure Blob Storage : Dependency Injection](/post/getting-started-with-testing-for-azure-blob-storage-dependency-injection)

_This Post - Getting started with testing for Azure Blob Storage : Unit Test with help of Moq_

[Getting started with testing for Azure Blob Storage : Integration Test with help of TestContainers and Azurite](/post/getting-started-with-testing-for-azure-blob-storage-integration-test-testcontainers-azurite)

Now, we know the context of the problem and by some extend we tried to solve it.  However **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** still has a dependency on **{{< hl-text purple >}}IServiceProvider{{< /hl-text >}}**. 

First thing first, we will try to replace the dependency with **{{< hl-text yellow >}}IAzBlobService{{< /hl-text >}}** and to make it work, we will refactor the **{{< hl-text purple >}}Main{{< /hl-text >}}** method. Actually not much difference, we just introduced another method  **{{< hl-text orange >}}CreateHostBuilder{{< /hl-text >}}** to create _IHostBuilder_ instance. I have also used **{{< hl-text red >}}ExcludeFromCodeCoverage{{< /hl-text >}}**  attribute to exclude configuration methods from code coverage. Below is the code snippet for updated startup - 

{{<codeblock  "Program.cs" csharp >}} public class Program
    {
        [ExcludeFromCodeCoverage]
        public static async Task Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();
            var azBlobService = host.Services.GetRequiredService<IAzBlobService>();
            await UploadFileToAzBlobAsync(azBlobService);

            await host.RunAsync();
        }
        [ExcludeFromCodeCoverage]
         static IHostBuilder CreateHostBuilder(string[] args) =>
           Host
            .CreateDefaultBuilder(args)
            .ConfigureServices((context, services) =>
            {
                services.AddSingleton<IAzBlobService, AzBlobService>();
            })
            .ConfigureAppConfiguration((context, config) =>
            {
                config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                      .AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", optional: true);
            });
{{</codeblock>}}

Here is the updated code for **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** method, now it does not have any dependency on **{{< hl-text purple >}}IServiceProvider{{< /hl-text >}}** instead it has dependency on **{{< hl-text yellow >}}IAzBlobService{{< /hl-text >}}**.

{{<codeblock  "Program.cs" csharp >}}public static async Task UploadFileToAzBlobAsync(IAzBlobService azBlobService)
        {
            var result = await azBlobService.UploadFileToAzBlobAsync("samplefile.txt");

            if (result)
            {
                Console.WriteLine("File uploaded successfully");
            }
            else
            {
                Console.WriteLine("File upload failed");
            }
        }
{{</codeblock>}}

So, Coming back to the original heading of the post, How can we perform unit test for **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** method? We refactored it lot, will it help us to perform unit test? Let's find out.

We will use **two** very popular tool / framework for this post.

1. [xUnit.net](https://xunit.net/) - Unit testing tool for the .NET
2. [Moq](https://github.com/Moq/moq4/wiki/Quickstart) - Mocking framework for .NET
 
 Let's start with **{{< hl-text yellow >}}xUnit.net{{< /hl-text >}}**. We will create a new project _Sundry.AzStorageTest.UnitTest_ and add **{{< hl-text green >}}Moq{{< /hl-text >}}** as nuget packages. Here is the code snippet of _csproj_ for test project
 {{<codeblock  "SystemUnderTest.UnitTest.csproj" xml >}}<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net7.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>

    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.3.2" />
    <PackageReference Include="Moq" Version="4.18.3" />
    <PackageReference Include="xunit" Version="2.4.2" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.4.5">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="coverlet.collector" Version="3.1.2">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\SystemUnderTest\SystemUnderTest.csproj" />
  </ItemGroup>

</Project>
{{</codeblock>}}

Nothing fancy here, however if you see the project reference path, we have added the reference to the project we are going to test. This is important, because we will be using the code from the project we are going to test. Also we use _..\\..\src_ folder structure, because we have the project we are going to test in _src_ folder and test project in _tests_ folder like this -


{{< image classes="center nocaption fancybox" src="/images/azstorage/folderst.png" title="Folder structure" >}}


## Writing Unit Test
We have setup all tools and framework and ready to write our first test case. Let's try to understand what are the scenarios we want to test. We have two scenarios in our mind, one is when the file is uploaded successfully and another is when the file upload fails. We will write test cases for each scenario.

If you notice  **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** writes the result to _console_. so,let's prepare our _UnitTests.cs_ to handle this - 

{{<codeblock  "UnitTests.cs" csharp >}}using Moq;
using SystemUnderTest.Interface;

namespace SystemUnderTest.UnitTest;

public class UnitTests
{
   private readonly StringWriter Output = new StringWriter();
    public UnitTests()
    {
        Console.SetOut(Output);
    }
}
{{</codeblock>}}

 All set. Let's write our first test case. 

### Test case 1 - File upload success
If you remember, very beginning of this post we made a change in **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** method. We removed the dependency on **{{< hl-text purple >}}IServiceProvider{{< /hl-text >}}** and added dependency on **{{< hl-text yellow >}}IAzBlobService{{< /hl-text >}}**. 

So, we will create a mock object of **{{< hl-text yellow >}}IAzBlobService{{< /hl-text >}}** and pass it to **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** method. 

{{<codeblock  "UnitTests.cs" csharp >}}[Fact]
public async Task File_Upload_Success()
{
    var azBlobService = new Mock<IAzBlobService>();
    azBlobService
                .Setup(x => x.UploadFileToAzBlobAsync(It.IsAny<string>()))
                .ReturnsAsync(true);
    
    await Program.UploadFileToAzBlobAsync(azBlobService.Object);
    Assert.Contains("File uploaded successfully", Output.ToString());
}
{{</codeblock>}}

{{< hl-text cyan >}}At line 4{{< /hl-text >}}, we are creating a mock object of **{{< hl-text yellow >}}IAzBlobService{{< /hl-text >}}**. 

{{< hl-text cyan >}}At line 5{{< /hl-text >}}, we are setting up the mock object to return _true_ when **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** method is called.

{{< hl-text cyan >}}At line 9{{< /hl-text >}} we are calling **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** method and passing the mock object of **{{< hl-text yellow >}}IAzBlobService{{< /hl-text >}}**.

{{< hl-text cyan >}}At line 10{{< /hl-text >}}, we are asserting that the output contains the string _File uploaded successfully_.

At this stage, we have completely ignoring the implementation of **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** method. We are only testing the output of the method and not the implementation. This is the beauty of **Moq**. We can test the output of the method without worrying about the implementation.

### Test case 2 - File upload failure
Similarly, we can write the test case for the scenario when the file upload fails.

{{<codeblock  "UnitTests.cs" csharp >}}[Fact]
public async Task File_Upload_Failure ()
{
     var azBlobService = new Mock<IAzBlobService>();
     azBlobService
                .Setup(x => x.UploadFileToAzBlobAsync(It.IsAny<string>()))
                .ReturnsAsync(false);
    
    await Program.UploadFileToAzBlobAsync(azBlobService.Object);
    Assert.Contains("File upload failed", Output.ToString());
}
{{</codeblock>}}

Here, the only difference is we are setting up the mock object to return _false_ when **{{< hl-text blue >}}UploadFileToAzBlobAsync{{< /hl-text >}}** method is called.

## Outro
That's it. We have written two test cases for the method **{{< hl-text blue >}}UploadFileToAzBlobAsync{{< /hl-text >}}**. We have used **Moq** to mock the dependency **{{< hl-text yellow >}}IAzBlobService{{< /hl-text >}}** and **xUnit** to write the test cases. 

However, we have not tested the implementation of **{{< hl-text blue >}}UploadFileToAzBlobAsync{{< /hl-text >}}** method. We have only tested the output of the method. 

We will write the test cases for the implementation of **{{< hl-text blue >}}UploadFileToAzBlobAsync{{< /hl-text >}}** method in the [next](/post/getting-started-with-testing-for-azure-blob-storage-integration-test-testcontainers-azurite) post, which will be act as integration test cases.

You can find the source code [**here**](https://github.com/sundryoss/Sundry.AzStorageTest).