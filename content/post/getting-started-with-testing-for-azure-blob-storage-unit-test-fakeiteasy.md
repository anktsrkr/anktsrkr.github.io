---
title: "Getting started with testing for Azure Blob Storage : Unit Test with help of FakeItEasy" # Title of the blog post.
date: 2023-10-11T08:00:35+01:00 # Date of post creation.
description: "Perform unit & integration tests for Azure Blob Storage: Unit Test with help of FakeItEasy" # Description used for search engine.
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
- azure storage fakeiteasy
- azure storage xunit
- azure storage .net 7
- azure storage azurite
- azure storage azurite test containers
- azure storage azurite fakeiteasy
- azure storage azurite xunit
- azure storage azurite .net 7
- azure storage azurite unit testing
- azure storage azurite integration testing
- azure storage azurite test containers
- azure storage azurite testcontainers
- azure storage unit testing
- azure storage blob integration testing
- azure storage blob test containers
- azure storage blob fakeiteasy
- azure storage blob xunit
- azure storage blob .net 7
- azure storage blob azurite
- azure storage blob azurite test containers
- azure storage blob azurite fakeiteasy
- azure storage blob azurite xunit
- azure storage blob azurite .net 7
- azure storage blob azurite unit testing
- azure storage blob azurite integration testing
- azure storage blob azurite test containers
- azure storage blob azurite testcontainers
- azurite integration testing
- azurite test containers
- azurite fakeiteasy
- azurite xunit
- azurite .net 7
- azurite unit testing
- unit and integration testing for azure blob storage
- unit and integration testing for azure blob storage using azurite test containers
- unit and integration testing for azure blob storage using azurite testcontainers
- unit and integration testing for azure blob storage using xunit fakeiteasy
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
- getting started with testing for azure blob storage unit test with fakeiteasy
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

In this post, we will discuss about the alternative framework for mocking. This post is adoptation of [this](/post/getting-started-with-testing-for-azure-blob-storage-unit-test-moq) which is using **Moq**.

You can find the full series of how to perform unit and integration tests for Azure Blob Storage using Azurite Test Containers, and xUnit.

[Getting started with testing for Azure Blob Storage : Dependency Injection](/post/getting-started-with-testing-for-azure-blob-storage-dependency-injection)

[Getting started with testing for Azure Blob Storage : Unit Test with help of Moq](/post/getting-started-with-testing-for-azure-blob-storage-unit-test-moq)

_This Post - Getting started with testing for Azure Blob Storage : Unit Test with help of FakeItEasy (Alternative to MoQ)_

[Getting started with testing for Azure Blob Storage : Integration Test with help of TestContainers and Azurite](/post/getting-started-with-testing-for-azure-blob-storage-integration-test-testcontainers-azurite)

[Getting started with testing for Azure Blob Storage : Mocking Azure Blob/File Storage SDK](/post/getting-started-with-testing-for-azure-blob-storage-mocking-blob-storage-sdk)

Let's get started.

I am late in the party, but you must be aware of the fuss around the **Moq**. If you are not aware, let me give you a brief detail about it.

**Moq** maintainer [Daniel Cazzulino](https://twitter.com/kzu) has introduced a spyware in the **Moq** library from version 4.20.0, which sends your hashed email address to the **SponsorLink** CDN. You can find the full story [here](https://www.bleepingcomputer.com/news/security/popular-open-source-project-moq-criticized-for-quietly-collecting-data/)

As of today, latest version of **Moq** is 4.20.69. In which, the spyware is removed. However, the damage is already done. Also, not sure about the future if they will introduce the spyware again or not. So, I have decided to move away from **Moq** and use some other mocking framework like **FakeItEasy** or **NSubstitute**.


In this post, we will use **FakeItEasy** to perform unit test for Azure Blob Storage. FakeItEasy and NSubstitute are the two most popular mocking framework alongwith **Moq**. I have decided to use **FakeItEasy** because of it's license. **FakeItEasy** is licensed under _MIT_ and *NSubstitute* is licensed under _2-Clause BSD_. I am not a lawyer, but seems like there not much difference between these two licenses. However, I am more comfortable with _MIT_ license.

 We will use the same code base we used in the [previous](/post/getting-started-with-testing-for-azure-blob-storage-unit-test-moq) post. So, if you have not read the previous post, I would recommend to read it first before proceeding further as we will skip the code part and focus on the testing part.

 
First, we will remove the reference of **Moq** from the project. Then we will add **FakeItEasy** as nuget package. Here is the code snippet of _csproj_ for the project _SystemUnderTest_ - 

 {{<codeblock  "SystemUnderTest.UnitTest.csproj" xml >}}<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net7.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>

    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.3.2" />
    <PackageReference Include="FakeItEasy" Version="7.4.0" />
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

So, we will create a fake object of **{{< hl-text yellow >}}IAzBlobService{{< /hl-text >}}** and pass it to **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** method. 

{{<codeblock  "UnitTests.cs" csharp >}}[Fact]
public async Task File_Upload_Success()
{
  var azBlobService = A.Fake<IAzBlobService>();
  A.CallTo(() => azBlobService.UploadFileToAzBlobAsync(A<string>._)).Returns(true);
  await Program.UploadFileToAzBlobAsync(azBlobService);
  Assert.Contains("File uploaded successfully", Output.ToString());
}
{{</codeblock>}}

{{< hl-text cyan >}}At line 4{{< /hl-text >}}, we are creating a fake object of **{{< hl-text yellow >}}IAzBlobService{{< /hl-text >}}**. 

{{< hl-text cyan >}}At line 5{{< /hl-text >}}, we are setting up the fake object to return _true_ when **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** method is called.

{{< hl-text cyan >}}At line 6{{< /hl-text >}} we are calling **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** method and passing the fake object of **{{< hl-text yellow >}}IAzBlobService{{< /hl-text >}}**.

{{< hl-text cyan >}}At line 7{{< /hl-text >}}, we are asserting that the output contains the string _File uploaded successfully_.

At this stage, we have completely ignoring the implementation of **{{< hl-text blue >}}UploadFileToAzBlob{{< /hl-text >}}** method. We are only testing the output of the method and not the implementation. This is the beauty of mocking framework. We can test the output of the method without worrying about the implementation.

### Test case 2 - File upload failure
Similarly, we can write the test case for the scenario when the file upload fails.

{{<codeblock  "UnitTests.cs" csharp >}}[Fact]
public async Task File_Upload_Failure ()
{
  var azBlobService = A.Fake<IAzBlobService>();
  A.CallTo(() => azBlobService.UploadFileToAzBlobAsync(A<string>._)).Returns(false);
  await Program.UploadFileToAzBlobAsync(azBlobService);
  Assert.Contains("File upload failed", Output.ToString());
}
{{</codeblock>}}

Here, the only difference is we are setting up the fake object to return _false_ when **{{< hl-text blue >}}UploadFileToAzBlobAsync{{< /hl-text >}}** method is called.

## Outro
That's it. We have written two test cases for the method **{{< hl-text blue >}}UploadFileToAzBlobAsync{{< /hl-text >}}**. We have used **FakeItEasy** to mock the dependency **{{< hl-text yellow >}}IAzBlobService{{< /hl-text >}}** and **xUnit** to write the test cases. 

However, we have not tested the implementation of **{{< hl-text blue >}}UploadFileToAzBlobAsync{{< /hl-text >}}** method. We have only tested the output of the method. 

We will write the test cases for the implementation of **{{< hl-text blue >}}UploadFileToAzBlobAsync{{< /hl-text >}}** method using **FakeItEasy** in another post.

**FakeItEasy** has great documentation. You can find it [here](https://fakeiteasy.github.io/).


You can find the source code [**here**](https://github.com/sundryoss/Sundry.AzStorageTest).