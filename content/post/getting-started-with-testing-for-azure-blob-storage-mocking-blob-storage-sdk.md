---
title: "Getting started with testing for Azure Blob Storage : Mocking Azure Blob/File Storage SDK" # Title of the blog post.
date: 2023-05-17T06:00:35+01:00 # Date of post creation.
description: "Perform unit & integration tests for Azure Blob Storage: Unit Test with help of Test Containers and Azurite" # Description used for search engine.
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

[Getting started with testing for Azure Blob Storage : Unit Test with help of Moq](/post/getting-started-with-testing-for-azure-blob-storage-unit-test-moq)


[Getting started with testing for Azure Blob Storage : Integration Test with help of TestContainers and Azurite](/post/getting-started-with-testing-for-azure-blob-storage-integration-test-testcontainers-azurite)

_This Post - Getting started with testing for Azure Blob Storage : Mocking Azure Blob/File Storage SDK_

By far we have seen how to perform unit tests for Azure Blob Storage using _Moq_ by hiding the dependency of Azure Storage SDK and actual implementation of it. But what if we want to test the actual implementation (i.e `AzBlobService`) of Azure Storage SDK? In this post, we will see how to perform unit tests for Azure Blob Storage using _Moq_ by mocking the Azure Storage SDK. 

At the end of our [First](/post/getting-started-with-testing-for-azure-blob-storage-dependency-injection) post, We hid the dependency of Azure Storage SDK and actual implementation of it by creating an interface `IAzBlobService` and a class `AzBlobService` which implements the interface. What if file upload fails due to blank file name or file name with invalid characters?  In this case, we want to test the actual implementation of `AzBlobService` and not the interface `IAzBlobService`.  So, we need to find a way to test the actual implementation of `AzBlobService`. 

### Issue with Current Implementation
Currently `AzBlobService` is dependent only on `IConfiguration` and if you analyze further the below snippet, you will see that we are creating an instance of `BlobServiceClient` at line 13.

{{<codeblock  "AzBlobService.cs" csharp >}} public class AzBlobService : IAzBlobService
    {
        private readonly string azBlobConnectionString;
        private readonly string azBlobContainerName;
        public AzBlobService(IConfiguration configuration)
        {
            azBlobConnectionString = configuration.GetValue<string>("AzBlobSettings:ConnectionString")!;
            azBlobContainerName = configuration.GetValue<string>("AzBlobSettings:ContainerName")!;
        }
        public async Task<bool> UploadFileToAzBlobAsync(string fileName)
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
                Console.WriteLine($"Unable to upload blob. Reason :{ex.Message}");
                return false;
            }
        }
    }
{{< /codeblock >}}

Subsequently, we are using `CreateIfNotExistsAsync` and `UploadAsync` methods of `BlobContainerClient` and `BlobClient` respectively. It means that our current implementation is tightly coupled with Azure Storage SDK. 

### Solution
To solve this problem first, we need to make sure our implementation is loosely coupled with Azure Storage SDK. 

We will refractor our code further and remove the dependency of `IConfiguration`. But if remove the dependency of `IConfiguration`, how will we get the connection string and container name? 

Let's create a class `AzBlobSettingsOption` which will hold all the configuration details. and we will configure this class in `Program.cs` file as shown below.

{{<codeblock  "Program.cs" csharp >}}static IHostBuilder CreateHostBuilder(string[] args)
        {
          return Host
           .CreateDefaultBuilder(args)
           .ConfigureServices((context, services) =>
           {
               var azBlobSettingsOption = context.Configuration.GetSection(AzBlobSettingsOption.ConfigKey).Get<AzBlobSettingsOption>()!;

               services.AddSingleton(azBlobSettingsOption);
               services.AddSingleton<IAzBlobService, AzBlobService>();
           })
           .ConfigureAppConfiguration((context, config) =>
           {
               config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                     .AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", optional: true);
           });
        }
{{< /codeblock >}}

Now, we can inject the configuration whereever we want to use.

Next, we will install the package `Microsoft.Extensions.Azure` which will help us to inject the depency of `BlobServiceClient`. I guess this package is one of the underrated package😒. Below is the code snippet of `Program.cs`

{{<codeblock  "Program.cs" csharp >}}static IHostBuilder CreateHostBuilder(string[] args)
        {
            return Host
           .CreateDefaultBuilder(args)
           .ConfigureServices((context, services) =>
           {
               var azBlobSettingsOption = context.Configuration.GetSection(AzBlobSettingsOption.ConfigKey).Get<AzBlobSettingsOption>()!;

               services.AddAzureClients(builder => builder
                                                    .AddBlobServiceClient(azBlobSettingsOption.ConnectionString)
                                                    .WithName(azBlobSettingsOption.ConnectionName));

               services.AddSingleton(azBlobSettingsOption);
               services.AddSingleton<IAzBlobService, AzBlobService>();
           })
           .ConfigureAppConfiguration((context, config) =>
           {
               config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                     .AddJsonFile($"appsettings.{context.HostingEnvironment.EnvironmentName}.json", optional: true);
           });
        }
{{< /codeblock >}}

Now, Let's refractor the code for `AzBlobService` which will now has a dependency of _IAzureClientFactory<BlobServiceClient>_ and _AzBlobSettingsOption_ instead of _IConfiguration_. Refractored version of `AzBlobService` shown below -
{{<codeblock  "Program.cs" csharp >}}public class AzBlobService : IAzBlobService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly AzBlobSettingsOption _azBlobSettingsOption;
        public AzBlobService(IAzureClientFactory<BlobServiceClient> blobServiceClientFactory, AzBlobSettingsOption azBlobSettingsOption)
        {
            _azBlobSettingsOption = azBlobSettingsOption;
            _blobServiceClient = blobServiceClientFactory.CreateClient(_azBlobSettingsOption.ConnectionName);
        }
        public async Task<bool> UploadFileToAzBlobAsync(string fileName)
        {
            try
            {
                using FileStream stream = new(fileName, FileMode.Open);
                BlobContainerClient container = _blobServiceClient.GetBlobContainerClient(_azBlobSettingsOption.ContainerName);

                await container.CreateIfNotExistsAsync();
                var client = container.GetBlobClient(fileName);
                await client.UploadAsync(stream);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unable to upload blob. Reason :{ex.Message}");
                return false;
            }
        }
    }
{{< /codeblock >}}

This refractor will give us the flexibility to inject the mocked dependency of `BlobServiceClient` while writing unit tests. 

### Writing Unit Tests
Finally, we have reached to the point where we can write unit tests for `AzBlobService`. Let's write the unit tests for `AzBlobService` using _Moq_ and _xUnit_. For this, I have created seperate class named `AzBlobServiceTest` which will contain all the unit tests for `AzBlobService` in our unit test project.

{{<codeblock  "AzBlobServiceTest.cs" csharp >}}public class AzBlobServiceTest
{
    private readonly StringWriter Output = new();
    private const string _connectionName = "testconnection";

    public AzBlobServiceTest()
    {
        Console.SetOut(Output);
    }
    [Fact]
    public async Task File_Upload_Suceess()
    {
    // Arrange
        var _azBlobServiceClientFactory = new Mock<IAzureClientFactory<BlobServiceClient>>();
        var _azBlobServiceClient = new Mock<BlobServiceClient>();
        var _azBlobContainerClient = new Mock<BlobContainerClient>();
        var _azBlobClient = new Mock<BlobClient>();

        var blobContainerInfo = BlobsModelFactory.BlobContainerInfo(default,default);
        var blobContentInfo = BlobsModelFactory.BlobContentInfo(default,default,default,default,default);

        _azBlobContainerClient.Setup(x => x.CreateIfNotExistsAsync(default,default,default,default)).ReturnsAsync(Response.FromValue(blobContainerInfo,default!));
        _azBlobClient.Setup(x => x.UploadAsync(It.IsAny<Stream>(), default, default, default, default,default,default,default)).ReturnsAsync(Response.FromValue(blobContentInfo,default!));
        _azBlobContainerClient.Setup(x => x.GetBlobClient(It.IsAny<string>())).Returns(_azBlobClient.Object);
        _azBlobServiceClient.Setup(x => x.GetBlobContainerClient(It.IsAny<string>())).Returns(_azBlobContainerClient.Object);

        _azBlobServiceClientFactory.Setup(x => x.CreateClient(_connectionName)).Returns(_azBlobServiceClient.Object);
        var _azBlobSettingsOption = new AzBlobSettingsOption()
        {
            ConnectionName = _connectionName,
        };
        var _sut = new AzBlobService(_azBlobServiceClientFactory.Object, _azBlobSettingsOption);

    // Act
        var result = await _sut.UploadFileToAzBlobAsync("samplefile.txt");

    // Assert
        Assert.True(result);
    }

     [Fact]
    public async Task File_Upload_Fail()
    {
    // Arrange
        var _azBlobServiceClientFactory = new Mock<IAzureClientFactory<BlobServiceClient>>();
        var _azBlobServiceClient = new Mock<BlobServiceClient>();
        var _azBlobContainerClient = new Mock<BlobContainerClient>();
        var _azBlobClient = new Mock<BlobClient>();

        var blobContainerInfo = BlobsModelFactory.BlobContainerInfo(default,default);
        var blobContentInfo = BlobsModelFactory.BlobContentInfo(default,default,default,default,default);

        _azBlobContainerClient.Setup(x => x.CreateIfNotExistsAsync(default,default,default,default)).ReturnsAsync(Response.FromValue(blobContainerInfo,default!));
        _azBlobClient.Setup(x => x.UploadAsync(It.IsAny<Stream>(), default, default, default, default,default,default,default)).ReturnsAsync(Response.FromValue(blobContentInfo,default!));
        _azBlobContainerClient.Setup(x => x.GetBlobClient(It.IsAny<string>())).Returns(_azBlobClient.Object);
        _azBlobServiceClient.Setup(x => x.GetBlobContainerClient(It.IsAny<string>())).Returns(_azBlobContainerClient.Object);

        _azBlobServiceClientFactory.Setup(x => x.CreateClient(_connectionName)).Returns(_azBlobServiceClient.Object);
        var _azBlobSettingsOption = new AzBlobSettingsOption()
        {
            ConnectionName = _connectionName,
        };
        var _sut = new AzBlobService(_azBlobServiceClientFactory.Object, _azBlobSettingsOption);

    // Act
        var result = await _sut.UploadFileToAzBlobAsync("");

    // Assert
        Assert.False(result);
        Assert.Contains("Unable to upload blob. Reason", Output.ToString());
    }
}
{{< /codeblock >}}
Nothing fancy here, we are just mocking the dependency of `BlobServiceClient` and `BlobContainerClient` and injecting it to `AzBlobService` using `AzBlobServiceClientFactory`. Also we tried to mock all the required methods of `BlobServiceClient` and `BlobContainerClient` which are used in `AzBlobService`.

However, I would like to bring your attention to the line 19 and 20 of above code snippet, where we are using `BlobsModelFactory` to create the instance of `BlobContainerInfo` and `BlobContentInfo`. 

This factory class is very powerful and it can be used to create the instance of any class which is part of `Azure.Storage.Blobs` namespace.

I have also created the scenario where file upload fails due to blank file name to show how to write negative unit tests.

## Conclusion
In this article, we have learned how to write loosely coupled code for Azure Storage SDK and how to mock the Azure Storage SDK using _Moq_ and _xUnit_. This whole series of articles was focused on Azure Blob Storage but you can use the same approach for Azure File Storage as well. For Azure File Storage, you just need to replace the `BlobServiceClient` with `FileServiceClient` and `BlobContainerClient` with `ShareClient` and `BlobClient` with `ShareFileClient`, and you are good to go. Also to mock the respose you will have `FilesModelFactory` instead of `BlobsModelFactory`.

You can find the source code [**here**](https://github.com/sundryoss/Sundry.AzStorageTest).