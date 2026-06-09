---
title: >-
  Getting started with testing for Azure Blob Storage : Integration Test with
  help of TestContainers and Azurite
date: 2023-01-18T05:00:35.000Z
description: >-
  Perform unit & integration tests for Azure Blob Storage: Unit Test with help
  of Test Containers and Azurite
featured: true
draft: false
toc: false
thumbnailImage: /images/azstorage/banner.png
thumbnailImagePosition: left
shareImage: /images/azstorage/banner.png
codeMaxLines: 10
codeLineNumbers: false
figurePositionShow: true
series: Azure Blob Storage Testing
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
  - >-
    unit and integration testing for azure blob storage using azurite test
    containers
  - >-
    unit and integration testing for azure blob storage using azurite
    testcontainers
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
  - 'integration test for azure storage,'
  - storage
  - unit test
  - getting started with testing for azure blob storage
  - getting started with testing for azure blob storage dependency injection
  - getting started with testing for azure blob storage unit test
  - getting started with testing for azure blob storage unit test with moq
  - getting started with testing for azure blob storage integration test
  - >-
    getting started with testing for azure blob storage integration test with
    azurite test containers
  - >-
    getting started with testing for azure blob storage integration test with
    azurite testcontainers
  - class fixture
  - collection fixture
  - IAsyncLifetime
  - xunit class fixture
  - xunit collection fixture
  - xunit IAsyncLifetime
  - azurite IAsyncLifetime
comments: true
showSocial: true
---
Hi Everyone!

In our [last](/post/getting-started-with-testing-for-azure-blob-storage-unit-test-moq) post, we have seen how to perform unit tests for Azure Blob Storage using _Moq_ by hiding the dependency of Azure Storage SDK and actual implementation of it. In this post, we will see how to perform integration tests for Azure Blob Storage using TestContainers and Azurite.

### What is Azurite?
[Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite) is an open-source emulator provides a free local environment for testing your Azure Blob, Queue Storage, and Table Storage applications. When you're satisfied with how your application is working locally, switch to using an Azure Storage account in the cloud. The emulator provides cross-platform support on Windows, Linux, and macOS.

There are several different ways to install Azurite. You can install it as a Node.js package, as a Docker container, or as a standalone executable. In this post, we will use Azurite as a Docker container.

##### Why am I using Azurite instead of actual storage account?
IMO, it is always a good practice to use a local environment for testing. It will help you to avoid unnecessary costs and unnecessary headaches for managing the storage account. Also, it will help you to test your application in a more controlled environment.

### What is TestContainers?
[Testcontainers](https://dotnet.testcontainers.org/) for .NET is a library to support tests with throwaway instances of Docker containers for all compatible .NET Standard versions. The library is built on top of the .NET Docker remote API and provides a lightweight implementation to support your test environment in all circumstances.

For example, When we will run our integration tests, you will see that the Azurite container will be created and started automatically. 



<figure class="post-figure center nocaption fancybox">
  <img src="/images/azstorage/azurite.png" alt="Azurite TestContainer" loading="lazy" />
  
</figure>


 
 And after the tests are completed, the container will be stopped and removed automatically.

## Prerequisites
We will create a new project _SystemUnderTest.IntegrationTest_ for integration tests. We will use the same project structure as in our [last](/post/getting-started-with-testing-for-azure-blob-storage-unit-test-moq) post. The only difference is list of NuGet packages we will use. Instead of **<span class="hl hl-green">Moq</span>** , we will add **<span class="hl hl-orange">Testcontainers</span>**. Here is the code snippet of _csproj_ for test project
 

<div class="code-title">SystemUnderTest.IntegrationTest.csproj</div>

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net7.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>

    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <None Remove="appsettings.json" />
  </ItemGroup>

  <ItemGroup>
    <Content Include="appsettings.json">
      <CopyToOutputDirectory>Always</CopyToOutputDirectory>
    </Content>
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.3.2" />
	  <PackageReference Include="Testcontainers" Version="2.3.0" />
	  <PackageReference Include="xunit" Version="2.4.2" />
	  <PackageReference Include="Xunit.DependencyInjection" Version="8.7.0" />
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
```



Also, to make sure **<span class="hl hl-purple">IAzBlobService</span>** is registered with DI, I have added following code in _Startup.cs_ of _SystemUnderTest.IntegrationTest_ project


<div class="code-title">Startup.cs</div>

```csharp
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SystemUnderTest.Interface;

namespace SystemUnderTest.IntegrationTest;

public class Startup
{
    public void ConfigureHost(IHostBuilder hostBuilder) =>
        hostBuilder
         .ConfigureServices((context, services) =>
         {
             services.AddSingleton<IAzBlobService, AzBlobService>();
         })
        .ConfigureAppConfiguration((context, config) =>
            {
                config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                      .AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", optional: true);
            });

}
```



Now, we are ready to write our first integration test. But before that, we need to understand couple of concepts of xUnit. 

## Problem Statement

In our case, we want to initialize a blob storage instance with a set of test data, and then leave that test data in place for use by multiple test classes or multiple test cases in the same class. We also want to clean up the blob storage after all the tests are executed. 

This setup of test context typically happens in the _Constructor_ of the test class and the cleanup happens in the _Dispose_ method of the test class. But starting a Azurite container through TestContainers is **expensive asynchronous operation** and it is certainly not a good idea to do it in the  **synchronous** constructor.

The correct way to do this in XUnit is through the **<span class="hl hl-orange">IAsyncLifetime</span>** interface. This interface has two methods, **<span class="hl hl-success">InitializeAsync</span>** and **<span class="hl hl-green">DisposeAsync</span>**. The **<span class="hl hl-success">InitializeAsync</span>** method is called before the first test in the class is run, and the **<span class="hl hl-green">DisposeAsync</span>** method is called after the last test in the class is run. Below is the code snippet for Azurite container initialization and cleanup through **<span class="hl hl-orange">IAsyncLifetime</span>** interface.



<div class="code-title">AzuriteContainer.cs</div>

```csharp
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Configurations;
using DotNet.Testcontainers.Containers;

namespace SystemUnderTest.IntegrationTest;

public class AzuriteContainer : IAsyncLifetime
{
    private readonly AzuriteTestcontainer _azuriteContainer;
    private const string AZURE_IMAGE = "mcr.microsoft.com/azure-storage/azurite";
    private const int DEFAULT_BLOB_PORT = 10000;
    public AzuriteContainer()
    {
        _azuriteContainer = new TestcontainersBuilder<AzuriteTestcontainer>()
                            .WithAzurite(new AzuriteTestcontainerConfiguration(AZURE_IMAGE)
                            {
                                BlobServiceOnlyEnabled = true,
                            })
                            .WithPortBinding(DEFAULT_BLOB_PORT)
                            .Build();

    }
    public async Task DisposeAsync()
    {
        await _azuriteContainer.DisposeAsync();
    }

    public async Task InitializeAsync()
    {
        using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(5));
        await _azuriteContainer.StartAsync(cts.Token);
    }
}
```



To setup the shared context below features can be used:

| Feature        | When to use        |
| ----------- | ----------- |
| Class Fixtures      | When you want to create a single test context and share it among all the tests in the class, and have it cleaned up after all the tests in the class have finished.|
| Collection Fixtures      | When you want to create a single test context and share it among tests in several test classes, and have it cleaned up after all the tests in the test classes have finished.|

In our case, we want to create a single test context and share it among all the tests in the class, and have it cleaned up after all the tests in the class have finished. So, we could use **<span class="hl hl-purple">Class Fixture</span>**, but for demonstration purpose we will use **<span class="hl hl-warning">Collection Fixture</span>**.However, Please see the steps for how to use - 

**<span class="hl hl-purple">Steps to use Class Fixture :</span>**
- Create the fixture class, and put the startup code in the fixture class constructor.
- If the fixture class needs to perform cleanup, implement _IDisposable_ on the fixture class, and put the cleanup code in the _Dispose()_ method.
- Add _IClassFixture<>_ to the test class.
- If the test class needs access to the fixture instance, add it as a constructor argument, and it will be provided automatically.

**<span class="hl hl-warning">Steps to use Collection Fixture :</span>**
- Create the fixture class, and put the startup code in the fixture class constructor.
- If the fixture class needs to perform cleanup, implement _IDisposable_ on the fixture class, and put the cleanup code in the _Dispose()_ method.
- Create the collection definition class, decorating it with the _[CollectionDefinition]_ attribute, giving it a unique name that will identify the test collection.
- Add _ICollectionFixture<>_ to the collection definition class.
- Add the _[Collection]_ attribute to all the test classes that will be part of the collection, using the unique name you provided to the test collection definition class's _[CollectionDefinition]_ attribute.
- If the test classes need access to the fixture instance, add it as a constructor argument, and it will be provided automatically.

If you follow the table, this is exactly what I did for our Azurite container. Below is the code snippet for **<span class="hl hl-warning">Collection Fixture</span>**.



<div class="code-title">AzuriteContainerInstanceCollectionFixture.cs</div>

```csharp
namespace SystemUnderTest.IntegrationTest;

[CollectionDefinition(nameof(AzuriteContainer))]
public class AzuriteContainerInstanceCollectionFixture : ICollectionFixture<AzuriteContainer>
{
}
```



## Integration Test
Now we know some basic concepts, let's write our first integration test. Below is the code snippet for the integration test.



<div class="code-title">AzBlobServiceTest.cs</div>

```csharp
using SystemUnderTest.Interface;

namespace SystemUnderTest.IntegrationTest;

[Collection(nameof(AzuriteContainer))]
public class IntegrationTests
{
    private readonly StringWriter Output = new();
    private readonly IAzBlobService _azBlobService;

    public IntegrationTests(IAzBlobService azBlobService, AzuriteContainer azuriteInstance)
    {
        Console.SetOut(Output);
       _azBlobService = azBlobService;
    }
    [Fact]
    public async Task File_Upload_Suceess()
    {
        await Program.UploadFileToAzBlobAsync(_azBlobService);
        Assert.Contains("File uploaded successfully", Output.ToString());
    }
}
```



## Outro
In this article, we have learned how to write integration tests for Azure Storage using Azurite container using XUnit and Testcontainers. However there are many things I have skipped. For example, how to mock the Azure Storage SDK, run automated tests in your CI pipeline, etc. I will cover some of these topics in the next post.

You can find the source code [**here**](https://github.com/sundryoss/Sundry.AzStorageTest).
