---
title: 'Getting started with testing for Azure Blob Storage : Dependency Injection'
date: 2023-01-12T05:00:35.000Z
description: 'Perform unit & integration tests for Azure Blob Storage: Dependency Injection'
featured: true
draft: false
toc: false
thumbnailImage: /images/azstorage/banner.png
thumbnailImagePosition: left
shareImage: /images/azstorage/banner.png
codeMaxLines: 10
codeLineNumbers: false
figurePositionShow: true
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
With this post, I am starting a new series about how to perform unit and integration tests for Azure Blob Storage using Azurite Test Containers, Moq and xUnit. Over the time, I will updated this page with links to individual posts : 

_This Post - Getting started with testing for Azure Blob Storage : Dependency Injection_

[Getting started with testing for Azure Blob Storage : Unit Test with help of Moq](/post/getting-started-with-testing-for-azure-blob-storage-unit-test-moq)

[Getting started with testing for Azure Blob Storage : Unit Test with help of FakeItEasy (Alternative to MoQ)](/post/getting-started-with-testing-for-azure-blob-storage-unit-test-fakeiteasy)

[Getting started with testing for Azure Blob Storage : Integration Test with help of TestContainers and Azurite](/post/getting-started-with-testing-for-azure-blob-storage-integration-test-testcontainers-azurite)

[Getting started with testing for Azure Blob Storage : Mocking Azure Blob/File Storage SDK](/post/getting-started-with-testing-for-azure-blob-storage-mocking-blob-storage-sdk)

[Getting started with testing for Azure Blob Storage : Mocking Azure Blob/File Storage SDK with help of FakeItEasy (Alternative to MoQ)](/post/getting-started-with-testing-for-azure-blob-storage-mocking-blob-storage-sdk-fakeiteasy)

## Introduction

Recently, I was working on a existing project where we were uploading some files to Azure Blob Storage. While working on this project, I was responsible for maintaining at least 80% code coverage. While started analyzing the code coverage,found that the way it was written, it's not possible to write unit tests for it. So, I decided to refactor the code. In this post, I will start with a very basic example and will refactor it to make it testable. 

## The Problem
Let's get started with a very basic example. In this example, we will upload a file to Azure Blob Storage. Below is the code snippet for the same. 



<aside class="callout callout-info callout-info callout-no-icon">
<p>Please note, I am using .NET 7 console app to show in this post. But the process is same for any .NET version and any application type.</p>
<p>In fact, it&#39;s difficult to introduce Dependency Injection in console app, so you can take it as <em>Bonus</em> that I am showing how to do it in console app.</p>
</aside>






<div class="code-title">Program.cs</div>

```csharp
using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;


using IHost host = Host
    .CreateDefaultBuilder(args)
    .ConfigureAppConfiguration((context, config) =>
    {
        config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
              .AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", optional: true);
    })
    .Build();



await UploadFileToAzBlob(host.Services);
await host.RunAsync();


static async Task UploadFileToAzBlob(IServiceProvider services)
{
    var config = services.GetRequiredService<IConfiguration>();
    var azBlobConnectionString = config.GetValue<string>("AzBlobSettings:ConnectionString");
    var azBlobContainerName = config.GetValue<string>("AzBlobSettings:ContainerName");
    var fileName = config.GetValue<string>("AzBlobSettings:FileName")!;

    using FileStream stream = new(fileName, FileMode.Open);
    
    BlobContainerClient container = new (azBlobConnectionString, azBlobContainerName);

    try
    {
        await container.CreateIfNotExistsAsync();

        var client = container.GetBlobClient(fileName);
        await client.UploadAsync(stream);
    }
    catch (Exception)
    {
        throw;
    }
}
```



We will focus on **<span class="hl hl-blue">UploadFileToAzBlob</span>** method. This method is responsible for uploading a file to Azure Blob Storage. In this method, we are creating a **<span class="hl hl-orange">BlobContainerClient</span>** object directly and then using it to upload the file.

Problem with this approach is that we are not able to mock **<span class="hl hl-orange">BlobContainerClient</span>** object. So, we are not able to write unit tests for this method. Also, it is dependent on **<span class="hl hl-purple">IServiceProvider</span>** , which is not a good practice and makes it difficult to write unit tests for this method.


## The Solution
In this section, we will start refactoring the code to make it testable. The first step is to move the **<span class="hl hl-orange">BlobContainerClient</span>** releated code. We will introduce a new interface **<span class="hl hl-yellow">IAzBlobService</span>** and move all blob releated reponsibities to it's own class
**<span class="hl hl-yellow">AzBlobService</span>**. Below is the code snippet for the same.



<div class="code-title">IAzBlobService.cs</div>

```csharp
using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;

namespace SystemUnderTest.Interface;

public interface IAzBlobService
{
    Task<bool> UploadFileToAzBlob(string fileName);
}

public class AzBlobService : IAzBlobService
{
    private readonly string azBlobConnectionString;
    private readonly string azBlobContainerName;
    public AzBlobService(IConfiguration  configuration)
    {
        azBlobConnectionString = configuration.GetValue<string>("AzBlobSettings:ConnectionString")!;
        azBlobContainerName = configuration.GetValue<string>("AzBlobSettings:ContainerName")!;
    }
    public async Task<bool> UploadFileToAzBlob(string fileName)
    {
        using FileStream stream = new(fileName, FileMode.Open);
        BlobContainerClient container = new(azBlobConnectionString, azBlobContainerName);

        try
        {          
            await container.CreateIfNotExistsAsync();
            var client = container.GetBlobClient(fileName);
            await client.UploadAsync(stream);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unable to upload blob. Reason :{ex.Message}" );
            return false;
        }
    }
}
```



Let's refractor the method **<span class="hl hl-blue">UploadFileToAzBlob</span>**.



<div class="code-title">Program.cs</div>

```csharp
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SystemUnderTest.Interface;

using IHost host = Host
    .CreateDefaultBuilder(args)
    .ConfigureServices((context, services) =>
    {
        services.AddSingleton<IAzBlobService, AzBlobService>();
    })
    .ConfigureAppConfiguration((context, config) =>
    {
        config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
              .AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", optional: true);
    })
.Build();



await UploadFileToAzBlob(host.Services);
await host.RunAsync();


static async Task UploadFileToAzBlob(IServiceProvider services)
{
    var azBlobService = services.GetRequiredService<IAzBlobService>();
    var result = await azBlobService.UploadFileToAzBlob("samplefile.txt");

    if (result)
    {
        Console.WriteLine("File uploaded successfully");
    }
    else
    {
        Console.WriteLine("File upload failed");
    }
}
```



Now, our method is not directly depends on  **<span class="hl hl-orange">BlobContainerClient</span>**, we have delegated the responsibility to **<span class="hl hl-yellow">IAzBlobService</span>**. This makes it easy to write unit tests for this method. In layman's terms, we have decoupled the code and it is called _Dependency Injection_.

However, our method still dependents on **<span class="hl hl-purple">IServiceProvider</span>**. In our [next](/post/getting-started-with-testing-for-azure-blob-storage-unit-test-moq) post, we will see how to remove this dependency as well and will write our first unit test case.

You can find the source code [**here**](https://github.com/sundryoss/Sundry.AzStorageTest).
