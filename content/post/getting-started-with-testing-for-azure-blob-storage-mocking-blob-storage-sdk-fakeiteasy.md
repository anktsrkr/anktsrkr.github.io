---
title: "Getting started with testing for Azure Blob Storage : Mocking Azure Blob/File Storage SDK Using FakeItEasy" # Title of the blog post.
date: 2023-10-11T08:30:35+01:00 # Date of post creation.
description: "Perform unit & integration tests for Azure Blob Storage: Unit Test with help of Test Containers and Azurite" # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnailImage: "/images/azstorage/fie.png"
thumbnailImagePosition: left
shareImage: "/images/azstorage/fie.png" # Designate a separate image for social media sharing.
codeMaxLines: 10 # Override global value for how many lines within a code block before auto-collapsing.
codeLineNumbers: false # Override global value for showing of line numbers within code block.
figurePositionShow: true # Override global value for showing the figure label.

categories:
- Azure
- Azurite
- Unit Testing
- Integration Testing
- Test Containers
- FakeItEasy
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
- azure storage FakeItEasy
- azure storage xunit
- azure storage .net 7
- azure storage azurite
- azure storage azurite test containers
- azure storage azurite FakeItEasy
- azure storage azurite xunit
- azure storage azurite .net 7
- azure storage azurite unit testing
- azure storage azurite integration testing
- azure storage azurite test containers
- azure storage azurite testcontainers
- azure storage unit testing
- azure storage blob integration testing
- azure storage blob test containers
- azure storage blob FakeItEasy
- azure storage blob xunit
- azure storage blob .net 7
- azure storage blob azurite
- azure storage blob azurite test containers
- azure storage blob azurite FakeItEasy
- azure storage blob azurite xunit
- azure storage blob azurite .net 7
- azure storage blob azurite unit testing
- azure storage blob azurite integration testing
- azure storage blob azurite test containers
- azure storage blob azurite testcontainers
- azurite integration testing
- azurite test containers
- azurite FakeItEasy
- azurite xunit
- azurite .net 7
- azurite unit testing
- unit and integration testing for azure blob storage
- unit and integration testing for azure blob storage using azurite test containers
- unit and integration testing for azure blob storage using azurite testcontainers
- unit and integration testing for azure blob storage using xunit FakeItEasy
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
- getting started with testing for azure blob storage unit test with FakeItEasy
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

As you are aware I have decided to move away from **MOQ** and insted we will use **FakeItEasy** for mocking the Azure Storage SDK.  This post is adoptation of [this](/getting-started-with-testing-for-azure-blob-storage-mocking-blob-storage-sdk) which is using **Moq**.

You can find the full series of how to perform unit and integration tests for Azure Blob Storage using Azurite Test Containers, and xUnit.

[Getting started with testing for Azure Blob Storage : Dependency Injection](/post/getting-started-with-testing-for-azure-blob-storage-dependency-injection)

[Getting started with testing for Azure Blob Storage : Unit Test with help of Moq](/post/getting-started-with-testing-for-azure-blob-storage-unit-test-moq)

[Getting started with testing for Azure Blob Storage : Unit Test with help of FakeItEasy (Alternative to MoQ)](/post/getting-started-with-testing-for-azure-blob-storage-unit-test-fakeiteasy)


[Getting started with testing for Azure Blob Storage : Integration Test with help of TestContainers and Azurite](/post/getting-started-with-testing-for-azure-blob-storage-integration-test-testcontainers-azurite)

[Getting started with testing for Azure Blob Storage : Mocking Azure Blob/File Storage SDK](/post/getting-started-with-testing-for-azure-blob-storage-mocking-blob-storage-sdk)

_This Post - Getting started with testing for Azure Blob Storage : Mocking Azure Blob/File Storage SDK Using FakeItEasy (Alternative to MoQ)_

 We will use the same code base we used in the [previous](/post/getting-started-with-testing-for-azure-blob-storage-mocking-blob-storage-sdk) post. So, if you have not read the previous post, I would recommend to read it first before proceeding further as we will skip the code part and focus on the testing part.


### Writing Unit Tests
Finally, we have reached to the point where we can write unit tests for `AzBlobService`. Let's write the unit tests for `AzBlobService` using _FakeItEasy_ and _xUnit_. For this, I have created seperate class named `AzBlobServiceTest` which will contain all the unit tests for `AzBlobService` in our unit test project.

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
        var _azBlobServiceClientFactory = A.Fake<IAzureClientFactory<BlobServiceClient>>();
        var _azBlobServiceClient = A.Fake<BlobServiceClient>();
        var _azBlobContainerClient = A.Fake<BlobContainerClient>();
        var _azBlobClient = A.Fake<BlobClient>();
        var _azBlobSettingsOption = A.Fake<AzBlobSettingsOption>();

        var blobContainerInfo = BlobsModelFactory.BlobContainerInfo(default, default);
        var blobContentInfo = BlobsModelFactory.BlobContentInfo(default, default, default, default, default);

        A.CallTo(() => _azBlobContainerClient.CreateIfNotExistsAsync(default, default, default, default)).Returns(Response.FromValue(blobContainerInfo, default!));
        A.CallTo(() => _azBlobClient.UploadAsync(A.Dummy<Stream>(), default, default, default, default, default, default, default)).Returns(Response.FromValue(blobContentInfo, default!));
        A.CallTo(() => _azBlobContainerClient.GetBlobClient(default)).Returns(_azBlobClient);
        A.CallTo(() => _azBlobServiceClient.GetBlobContainerClient(default)).Returns(_azBlobContainerClient);
        A.CallTo(() => _azBlobServiceClientFactory.CreateClient(default)).Returns(_azBlobServiceClient);

        var _sut = new AzBlobService(_azBlobServiceClientFactory, _azBlobSettingsOption);

        // Act
        var result = await _sut.UploadFileToAzBlobAsync("samplefile.txt");

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task File_Upload_Fail()
    {
       // Arrange
        var _azBlobServiceClientFactory = A.Fake<IAzureClientFactory<BlobServiceClient>>();
        var _azBlobServiceClient = A.Fake<BlobServiceClient>();
        var _azBlobContainerClient = A.Fake<BlobContainerClient>();
        var _azBlobClient = A.Fake<BlobClient>();
        var _azBlobSettingsOption = A.Fake<AzBlobSettingsOption>();


        var blobContainerInfo = BlobsModelFactory.BlobContainerInfo(default, default);
        var blobContentInfo = BlobsModelFactory.BlobContentInfo(default, default, default, default, default);

        A.CallTo(() => _azBlobContainerClient.CreateIfNotExistsAsync(default, default, default, default)).Returns(Response.FromValue(blobContainerInfo, default!));
        A.CallTo(() => _azBlobClient.UploadAsync(A.Dummy<Stream>(), default, default, default, default, default, default, default)).Returns(Response.FromValue(blobContentInfo, default!));
        A.CallTo(() => _azBlobContainerClient.GetBlobClient(default)).Returns(_azBlobClient);
        A.CallTo(() => _azBlobServiceClient.GetBlobContainerClient(default)).Returns(_azBlobContainerClient);
        A.CallTo(() => _azBlobServiceClientFactory.CreateClient(default)).Returns(_azBlobServiceClient);

        var _sut = new AzBlobService(_azBlobServiceClientFactory, _azBlobSettingsOption);

        // Act
        var result = await _sut.UploadFileToAzBlobAsync("");

        // Assert
        Assert.False(result);
        Assert.Contains("Unable to upload blob. Reason", Output.ToString());
    }
}
{{< /codeblock >}}
Nothing fancy here, we are just faking the dependency of `BlobServiceClient` and `BlobContainerClient` and injecting it to `AzBlobService` using `AzBlobServiceClientFactory`. Also we tried to fake all the required methods of `BlobServiceClient` and `BlobContainerClient` which are used in `AzBlobService`.

I have also created the scenario where file upload fails due to blank file name to show how to write negative unit tests.

## Conclusion
In this article, we have learned how to write loosely coupled code for Azure Storage SDK and how to mock the Azure Storage SDK using _FakeItEasy_ and _xUnit_. This whole series of articles was focused on Azure Blob Storage but you can use the same approach for Azure File Storage as well. For Azure File Storage, you just need to replace the `BlobServiceClient` with `FileServiceClient` and `BlobContainerClient` with `ShareClient` and `BlobClient` with `ShareFileClient`, and you are good to go. Also to mock the respose you will have `FilesModelFactory` instead of `BlobsModelFactory`.

You can find the source code [**here**](https://github.com/sundryoss/Sundry.AzStorageTest).