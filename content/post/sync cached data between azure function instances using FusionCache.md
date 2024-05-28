---
title: "Sync Cached Data Between Azure Function Instances Using FusionCache" # Title of the blog post.
date: 2024-05-26T07:00:35+01:00 # Date of post creation.
description: "Sync Cached Data Between Azure Function Instances Using FusionCache" # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
thumbnailImage: "/images/fusioncache/logo.png"
thumbnailImagePosition: left
shareImage: "/images/fusioncache/logo.png" # Designate a separate image for social media sharing.
codeMaxLines: 10 # Override global value for how many lines within a code block before auto-collapsing.
codeLineNumbers: false # Override global value for showing of line numbers within code block.
figurePositionShow: true # Override global value for showing the figure label.
categories:
- .NET 6
- .NET 7
- .NET 8
- Azure Function
- FusionCache
tags:
- fusioncache
- c#
- azurefunctiontips
keywords:
- azure functions memory cache
- azure functions memory cache fusioncache
- azure function distributed cache
- Azure Functions and Caching
- Azure Functions and Caching fusioncache
- c# - Azure Functions and Caching
- c# - Azure Functions and Caching fusioncache
- Clearing cache in Azure Function app and c#
- How to reset memory cache in Azure Function 
- azure function app cache
- azure functions cache stampede
- c# azure function distributed cache
- c# azure function distributed cache fusioncache
---

{{<alert info no-icon>}}
Icon used in this post is property of [FusionCache](https://github.com/ZiggyCreatures/FusionCache) repo.
{{</alert >}}

In today's event-driven programming world, we are using lots of **{{< hl-text green >}}Azure Function{{< /hl-text >}}** as the serverless solution that allows us to write less code, maintain less infrastructure, and save on costs.
 
**{{< hl-text green >}}Azure Function{{< /hl-text >}}** comes with various triggers such as `HttpTrigger`, `ServiceBusTrigger`, `SqlTrigger` etc. which help us build an API easily. 

Let's say the team already built a `HttpTrigger` API **GetProductsById** and the data is coming from Azure SQL. This API is exposed internally and `n` number of internal teams are using it maybe in batches with multiple products or a single product with multiple calls. The owner of this API is unaware of how this API is being used.

## The Problem
The problem with this API is that it is not performant enough to meet the expectations even if they have enabled auto-scaling. The team started investigating the issue and noted below points - 

1. The data does not change very frequently.
2. The requirement is if it gets updated it has to be mirrored as soon as possible. 
3. Based on this requirement, team wrote a query using **{{< hl-text yellow >}}Dapper{{< /hl-text >}}** to fetch the data directly from the database, which means no matter what, every time someone invokes the endpoint it always hit the database.

Let's see how the function looks now -  


{{<codeblock "GetProductById.cs" csharp >}}[Function("GetProductById")]
public async Task<IActionResult> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get", Route = null)] HttpRequestData req)
{
    using var conn = _dapperContext.CreateConnection();

    var productid = req.Query["productid"];

    var product = await conn.GetAsync<Product>(productid);
    if (product is null)
    return new NotFoundResult();

    return new OkObjectResult(product);
}
{{</codeblock>}}

## The Solution
Team found a possible solution. As the data doesn't change frequently, team decided to cache the data in memory, something like - 

{{<codeblock "GetProductById.cs" csharp >}}[Function("GetProductById")]
public async Task<IActionResult> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get", Route = null)] HttpRequestData req)
{
    using var conn = _dapperContext.CreateConnection();

    var productid = req.Query["productid"];

    var product = await _memcache.GetOrCreateAsync(productid, cacheEntry =>
    {
        cacheEntry.SlidingExpiration = TimeSpan.FromSeconds(10);
        cacheEntry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30);
        return conn.GetAsync<Product>(productid);
    });

    if (product is null)
    return new NotFoundResult();

    return new OkObjectResult(product);
}
{{</codeblock>}}

Locally, everything seems super fast. However, when testing this solution on Azure, team soon realised that it had several flaws. 

_When a single instance of Azure Function App running_ 

Team noticed that the database is getting hit more than expected when the system is under pressure. The possible reason for such a problem is that `_memcache.GetOrCreateAsync` is getting executed in parallel at the same time. You may call this as __Cache stampede__.

_When more than one instance of Azure Function App running (Horizentally Scalled)_ 

Along with the previous problem, each instance is now having a cold start problem which means it hits the database again to fetch the data. 

_When Azure Function App is restarted_

Same as above as the memory cache is empty it hits the database and so on. 


### SemaphoreSlim to rescue (Oops!)
Now, to solve the first problem team decided to use `SemaphoreSlim` which limits the number of threads that can access a resource or pool of resources concurrently. But this solves the problem partially because it might happen that `product id 2` is waiting for `product id 1`. So a better approach is to have `SemaphoreSlim` but with a key.

### Distributed Cache to rescue (sort of!)
To solve the second and third problems, we can't only depend on memory cache we will need a second level of distributed cache where we could have data before we reach to database. The __ideal solution__ could be to _have a hybrid cache which first checks in memory, if not found checks the distribued cache, if not found fetches data from the database_.

### Problem with ideal solution
While the ideal solution makes more sense, it may create a problem while horizontally scaling. Memory cache could be out of sync very quickly when data changes in database/distributed cache but the memory cache is not expired.

### FusionCache to rescue (🎉Yay!🎉)
All of the above problems can be solved using [`FusionCache`](https://github.com/ZiggyCreatures/FusionCache), a feature-rich, fully documented perfect caching solution available in .NET ecosystem.

`FusionCache` by default handles __Cache stampede__ problem. It has many features but to keep it short we will only use two of it's features. 

1. [2nd level](https://github.com/ZiggyCreatures/FusionCache/blob/main/docs/CacheLevels.md): This feature creates a bridge between the memory cache and the distributed cache.
2. [Backplane](https://github.com/ZiggyCreatures/FusionCache/blob/main/docs/Backplane.md): This feature notifies the other nodes about changes in the cache, so all will be in-sync.

Below is the visual representation - 

{{<figure src="/images/fusioncache/diagram.png" alt="How fusioncache works" >}}

{{<alert info no-icon>}}
The above image is the property of [FusionCache](https://github.com/ZiggyCreatures/FusionCache) repo.
{{</alert >}}

Let's update `Program.cs` to enable `FusionCache`

{{<codeblock "Program.cs" csharp >}}var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureLogging(logging =>
    {
        logging.ClearProviders(); // Removes the default console logger
        logging.AddApplicationInsights();
        logging.AddSimpleConsole(c => // Adds a new console logger
        {
            c.SingleLine = true; // Ensures the "info" etc is at the start of the line.
        });
        logging.SetMinimumLevel(LogLevel.Trace);
    })
    .ConfigureServices((ctx, services) =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();

        var sqlConn = ctx.Configuration.GetConnectionString("Sql");
        var redisConn = ctx.Configuration.GetConnectionString("Redis");


        if (string.IsNullOrWhiteSpace(sqlConn))
            throw new NullReferenceException("You must specify a sql connection (see appsettings.json)");

        // ADD SERVICES: DAPPER CONTEXT
        services.AddSingleton(new DapperContext(sqlConn));

        // ADD SERVICES: REDIS
        if (string.IsNullOrWhiteSpace(redisConn) == false)
        {
            // ADD SERVICES: REDIS DISTRIBUTED CACHE
            services.AddStackExchangeRedisCache(options => { options.Configuration = redisConn; });

            // ADD SERVICES: JSON SERIALIZER
            services.AddFusionCacheSystemTextJsonSerializer();

            // ADD SERVICES: REDIS BACKPLANE
            services.AddFusionCacheStackExchangeRedisBackplane(options => { options.Configuration = redisConn; });
        }

        // ADD SERVICES: FUSIONCACHE
        services.AddFusionCache()
            .WithDefaultEntryOptions(x =>
                x.SetDuration(TimeSpan.FromMinutes(5)))
            .TryWithRegisteredDistributedCache()
            .TryWithRegisteredBackplane();
    }).Build();

    host.Run();
{{</codeblock>}}

Also, update our function's code - 

{{<codeblock "GetProductById.cs" csharp >}}[Function("GetProductById")]
public async Task<IActionResult> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get", Route = null)] HttpRequestData req)
{
    using var conn = _dapperContext.CreateConnection();

    var productid = req.Query["productid"];

    var product = await _cache.GetOrSetAsync<Product>($"product:{productid}",(ctx, _) =>
        {
            var x = conn.GetAsync<Product>(productid);
            return x;
        });

    if (product is null)
    return new NotFoundResult();

    return new OkObjectResult(product);
}
{{</codeblock>}}

The above codeblocks makes sure all cross cutting concerns such as cache stampede prevention,transient failure of distributed cache/backplane etc.

--------------------------------------------------

 Till this point, we haven't talked about updating the data, but one of our requirements is to reflect the updated data as soon as possible in all nodes.

 To achieve this, we have several options. One of the options could be to add an interceptor somehow while updating the data. The other option could use the feature of SQL Server known as `Change Tracking`, which works with Azure Function's [`SqlTrigger`](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-azure-sql-trigger?tabs=isolated-process%2Cportal&pivots=programming-language-csharp) very well.

In this demo, I am using `AdventureWorks Lite database` which you can also download from [here](https://learn.microsoft.com/en-us/sql/samples/adventureworks-install-configure?view=sql-server-ver16&tabs=ssms).

Let's enable the `Change Tracking` at database level first and enable it for the table for which you want to track the change. 

{{<codeblock "alterdatabase.sql" sql>}}ALTER DATABASE [AdventureWorksLT2022]
SET CHANGE_TRACKING = ON
(CHANGE_RETENTION = 10 MINUTES, AUTO_CLEANUP = ON);

ALTER TABLE [SalesLT].[Product]
ENABLE CHANGE_TRACKING;
{{</codeblock>}}

{{<alert warning no-icon>}}
The `CHANGE_RETENTION` option specifies the time period for which change history is kept. The retention of change history by the SQL database might affect trigger functionality.

For example, if the Azure Function is turned off for several days and then resumed, the database will contain the changes that occurred in past ten minutes in the above setup example.
{{</alert>}}

Let's add our `SqlTrigger` function which could be a separate Function App altogether. 

{{<codeblock "InvalidateCache.cs" csharp >}}[Function("InvalidateCache")]
public async Task Run([SqlTrigger(" [SalesLT].[Product]", "Sql")] IReadOnlyList<SqlChange<Product>> changes,FunctionContext context)
{
    foreach (var change in changes)
    {
        if (change.Operation == SqlChangeOperation.Update)
        {
            await _cache.ExpireAsync($"product:{change.Item.ProductID}");
        }
    }
}
{{</codeblock>}}

Essentially, when it expires the data from this function, first it removes the data from the distributed cache and it notifies all the available nodes to remove the data for that particular key from their memory cache through backplane.
  
## Conclusion
You might have several types of data to cache and you don't want to handle them in a single place, then the other approach could be to publish the update in eventhub and each consumer will invalidate their cached data.

Nevertheless, IMO, the above approach makes the developer's life easy without worrying too much. It comes with a cost as Azure Redis is too costly. 

Let me know what you think about this!