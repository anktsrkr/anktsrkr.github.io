---
title: "Download Files From Azure Blob Storage Efficiently Using RecyclableMemoryStream" # Title of the blog post.
date: 2023-05-24T06:00:35+01:00 # Date of post creation.
description: "Download Files From Azure Blob Storage Efficiently Using RecyclableMemoryStream" # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnailImage: "/images/azstorage/azure-storage-blob.png"
thumbnailImagePosition: left
shareImage: "/images/azstorage/azure-storage-blob.png" # Designate a separate image for social media sharing.
codeMaxLines: 10 # Override global value for how many lines within a code block before auto-collapsing.
codeLineNumbers: false # Override global value for showing of line numbers within code block.
figurePositionShow: true # Override global value for showing the figure label.

categories:
- Azure
- Azurite
- .NET 7
tags:
- azure
- c#
keywords:
- azure storage recyclablememorystream
- azure storage recyclablememorystream manager
- azure storage .net 7
- azure storage azurite
- azure storage azurite recyclablememorystream
- azure storage azurite recyclablememorystream manager
- azure storage azurite memory optimized
- azure storage blob recyclablememorystream
- azure storage blob recyclablememorystream manager
- azure storage blob memory optimized
- azure storage blob xunit
- azure storage blob .net 7
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
- How to download files memory optimized way from azure blob storage
- How to download files memory optimized way from azure blob storage using recyclablememorystream
- How to use RecyclableMemoryStream in .NET Core
- Microsoft.IO.RecyclableMemoryStream
- Take advantage of Microsoft.IO.RecyclableMemoryStream to eliminate LOH allocations and avoid memory fragmentation and memory leaks in your .NET Core applications.
- RecyclableMemoryStream
- RecyclableMemoryStream Manager
- Recyclable Memory Stream
- .net core Recyclable Memory Stream
- .net core Recyclable Memory Stream manager
---
Recently, I was working on a project where we had to download multiple large files from Azure Blob Storage and process it further. When the application hits the production environment and started getting the actual files, we observed that memory consumption is getting very high. On top of that, the application was hosted in shared windows based app service plan, which was making it even worse for other applications too.

 After analyzing the issue, we found that the issue was with the way we were downloading the files. In this post, we will see how we can download files from Azure Blob Storage efficiently using **{{<hl-text orange>}}RecyclableMemoryStream{{< /hl-text >}}**.

## The Problem

Let us first understand the problem. In this section, we will see how we were downloading the files from Azure Blob Storage. Below is the code snippet for the same.

{{<codeblock  "AzBlobService.cs" csharp >}}public async Task<bool> DownloadFileFromAzBlobNotOptimizedAsync()
    {
        var container = _blobServiceClient.GetBlobContainerClient(_azBlobSettingsOption.ContainerName);
        var blobs = container.GetBlobs();
        foreach (var blob in blobs)
        {
                try
                {
                    var blobClient = container.GetBlobClient(blob.Name);
                    using var stream = new MemoryStream();
                    await blobClient.DownloadToAsync(stream);
                }
                finally
                {
                }
        }
        return true;
    }
{{</codeblock>}}

Above code snippet is self explanatory but let me explain it in detail. We are using **{{< hl-text blue >}}BlobServiceClient{{< /hl-text >}}** to get the list of blobs from the container. Then we are looping through the blob's metadata and downloading the files _one by one_.

Let us benchmark the above code snippet using **{{< hl-text green>}}BenchmarkDotNet{{< /hl-text >}}**. Below is the code snippet for the same.

{{<codeblock  "Program.cs" csharp >}}internal class ProgramX
{
    private static void Main(string[] args)
    {
        var summary = BenchmarkRunner.Run<BenchmarkAPIPerformance>();
    }
}

[MemoryDiagnoser]
[ThreadingDiagnoser]
public class BenchmarkAPIPerformance
{
    private static HttpClient _httpClient;

    [Params(25,50)]
    public int N;

    [GlobalSetup]
    public void GlobalSetup()
    {
        var factory = new WebApplicationFactory<Program>()
                    .WithWebHostBuilder(_ =>{});
        _httpClient = factory.CreateClient();
    }

    [Benchmark]
    public async Task DownloadNotOptimized()
    {
        for (int i = 0; i < N; i++)
        {
            var response = await _httpClient.GetAsync("/DownloadNotOptimized");
        }
{{</codeblock>}}

Below is the benchmark result for the same.

{{<figure src="/images/azstorage/azblob-not-optimized.png" alt="Azure Blob Storage Not Optimized" >}}

If you see the above benchmark result, you will notice that Gen 0, Gen 1 and Gen 2 all has some value and also the memory allocation looks high. But what exactly is Gen 0, Gen 1 and Gen 2?

### What is Gen 0, Gen 1 and Gen 2?
I find the below explanation from Microsoft Docs [LOH](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/large-object-heap) and [Garbage Collection Fundamentals](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals) very helpful. 

The .NET garbage collector (GC) divides objects up into small and large objects. The small object heap (SOH) is used to store objects that are smaller than 85 KB in size. The large object heap (LOH) is used to store objects that are equal or larger than 85 KB in size. 

The garbage collector is a generational collector. It has three generations: Gen 0, Gen 1, and Gen 2. 

Gen 0 is the youngest generation and contains short-lived objects. An example of a short-lived object is a temporary variable. Garbage collection occurs most frequently in this generation.

Gen 1 contains short-lived objects and longer-lived objects. Examples of longer-lived objects are objects in server applications that contain static data that is live for the duration of the process. 

Gen 2 contains longer-lived objects and survives garbage collection cycles longer than Gen 0 and Gen 1 objects. Examples of Gen 2 objects are objects in server applications that contain static data that is live for the duration of the process and large objects (85 KB or larger). 

In our case, we are downloading the files and storing it in **{{< hl-text yellow >}}MemoryStream{{< /hl-text >}}**. Since the files are larger than 85 KB, surely it will end up in LOH. 

## The Solution
So, from the above explanation, if we somehow can avoid LOH allocation, we might be able to reduce the memory consumption and performance will also improve. Microsoft has provided a library called **{{< hl-text orange >}}Microsoft.IO.RecyclableMemoryStream{{< /hl-text >}}** which can be used to avoid LOH allocation. The excellent documentation for the same can be found [here](https://github.com/microsoft/Microsoft.IO.RecyclableMemoryStream) where you can find the details about how it actually works.

The best part is that the semantics are close to the original **{{< hl-text green >}}System.IO.MemoryStream{{< /hl-text >}}**implementation, and is intended to be a drop-in replacement as much as possible.

So, Let's try to implement in our code -

{{<codeblock  "AzBlobService.cs" csharp >}}private static readonly RecyclableMemoryStreamManager manager = new();
    public async Task<bool> DownloadFileFromAzBlobOptimizedAsync()
    {
        var container = _blobServiceClient.GetBlobContainerClient(_azBlobSettingsOption.ContainerName);
        var blobs = container.GetBlobs();
        foreach (var blob in blobs)
        {
            try
                {
                    var blobClient = container.GetBlobClient(blob.Name);
                    using var stream = manager.GetStream();
                    await blobClient.DownloadToAsync(stream);
                }
                finally
                {
                }
        }
        return true;
    }

{{</codeblock>}}

Note that **{{< hl-text orange >}}RecyclableMemoryStreamManager{{< /hl-text >}}** should be declared once and it will live for the entire process lifetime and it is thread safe. so, we can use it in multiple threads. let's update the code to download the files in parallel instead of sequentially.

{{<codeblock  "AzBlobService.cs" csharp >}}public async Task<bool> DownloadFileFromAzBlobOptimizedAsync()
    {
        var container = _blobServiceClient.GetBlobContainerClient(_azBlobSettingsOption.ContainerName);
        var blobs = container.GetBlobs();
        var semaphore = new SemaphoreSlim(10);
        var tasks = new List<Task>();

        foreach (var blob in blobs)
        {
            await semaphore.WaitAsync();

            tasks.Add(Task.Run(async () =>
            {
                try
                {
                    var blobClient = container.GetBlobClient(blob.Name);
                    using var stream = manager.GetStream();
                    await blobClient.DownloadToAsync(stream);
                }
                finally
                {
                    semaphore.Release();
                }
            }));
        }
        await Task.WhenAll(tasks);
        return true;
    }
{{</codeblock>}}

Here, _SemaphoreSlim_ is used to limit the number of concurrent threads. In our case, we are limiting it to 10. You can change it as per your requirement.

Let's update the benchmark code to use the optimized version.

{{<codeblock  "Program.cs" csharp >}}[Benchmark]
    public async Task DownloadOptimized()
    {
        for (int i = 0; i < N; i++)
        {
            var response = await _httpClient.GetAsync("/DownloadOptimized");
        }
    }
{{</codeblock>}}

Below is the benchmark result for the same.

{{<figure src="/images/azstorage/azblob-optimized.png" alt="Azure Blob Storage Optimized" >}}

## Conclusion

From the above result, we can clearly identify that there is a huge improvement in LOH allocation and becomes zero. This is possible because  **{{< hl-text orange >}}RecyclableMemoryStreamManager{{< /hl-text >}}** eliminate LOH allocations by using pooled buffers rather than pooling the streams themselves.

Also the memory allocation is reduced significantly. In fact, the memory allocation is reduced by ~734% which is huge. 

You can find the source code [**here**](https://github.com/sundryoss/Sundry.MsDemystified).