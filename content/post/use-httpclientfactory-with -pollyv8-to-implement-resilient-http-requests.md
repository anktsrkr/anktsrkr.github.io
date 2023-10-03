---
title: "Use IHttpClientFactory and Polly(v8) to implement resilient HTTP requests" # Title of the blog post.
date: 2023-10-02T06:00:35+01:00 # Date of post creation.
description: "Use IHttpClientFactory and Polly(v8) to implement resilient HTTP requests" # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnailImage: "/images/polly/logo.png"
thumbnailImagePosition: left
shareImage: "/images/polly/logo.png" # Designate a separate image for social media sharing.
codeMaxLines: 10 # Override global value for how many lines within a code block before auto-collapsing.
codeLineNumbers: false # Override global value for showing of line numbers within code block.
figurePositionShow: true # Override global value for showing the figure label.

categories:
- .NET 7
- Polly
- HttpClientFactory
tags:
- polly
- c#
- httpclientfactory
keywords:
- polly v8
- polly c#
- polly .net 7
- polly .net 8
- polly .net 5
- polly .net 6
- polly .net core
- polly aspnetcore
- polly 8
- IHttpClientFactory polly 8
- httpclient polly 8
- polly 8 httpclientfactory
- polly 8 httpclient
- polly 8 resilience httpclientfactory
- Microsoft.Extensions.Http.Polly
- polly get accesstoken
- using polly to retry after HttpStatusCode.Unauthorized
- refresh authentication token on retry when using polly
- re-authorization and onRetry with polly
- refresh bearer token when using named HttpClient
- refresh bearer token when using typed HttpClient
- refresh token when using typed HttpClientFactory
- .net core polly retry accesstoken idtoken
- re-authorize Efficiently Using Polly And .NET HttpClientFactory
- Use IHttpClientFactory to implement resilient HTTP requests - .NET
---
Recently, **{{< hl-text green >}}Polly{{< /hl-text >}}**  team did fabulous job 🎉 by releasing the new version **{{< hl-text green >}}8.0.0{{< /hl-text >}}**. It has lot of improvements and also they re-implemented Policy as Strategy. Polly v8 introduces the concept of resilience pipelines, a powerful tool that put together one or more resilience strategies.[Here](https://www.thepollyproject.org/2023/09/28/polly-v8-officially-released/) is the all changes you can find.

## The Problem
Microsoft provides a extension  **{{< hl-text green >}}Microsoft.Extensions.Http.Polly {{< /hl-text >}}**  which allows us to use Polly with _HttpClientFactory_. It is very easy to use and you can find the documentation [here](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/implement-resilient-applications/use-httpclientfactory-to-implement-resilient-http-requests).

But, there is a catch. as of today. the extension does not support Polly V8 yet. So, if you are using Polly V8, you can not use the extension. 
 
## The Solution
The solution is very simple. There are couple of options I can think of -
1. Wait for the extension to support Polly V8. I am not sure when it will be available.
2. Create our own extension to use Polly V8 with _HttpClientFactory_.
3. Use the new extension [**Sundry.Extensions.Http.Polly**](https://www.nuget.org/packages/Sundry.Extensions.Http.Polly/) which supports Polly V8 already! This is almost same as the Microsoft's extension but it supports all new features of Polly V8.

In this post, I will be using the 3rd option. We will create a simple console application to demonstrate the usage of the extension. Let's get started. 

First, we will define a named or typed client HttpClient configuration in our standard Program.cs configuration. Now we will add incremental code specifying the resilience strategy we want to apply to the HttpClient. In this example, we will add a retry policy with exponential backoff.

{{<codeblock  "Program.cs" csharp >}}static IHostBuilder CreateHostBuilder(string[] args)
        {
            return Host
                .CreateDefaultBuilder(args)
                .ConfigureLogging((context, logging) =>
                {
                    logging.SetMinimumLevel(LogLevel.Trace);
                })
                .ConfigureServices((context, services) =>
                {
                    services
                    .AddHttpClient<IWeatherService, WeatherService>(client =>
                        {
                            client.BaseAddress = new Uri("http://localhost:5087/");
                        })
                    .AddResiliencePipelineHandler(PollyResilienceStrategy.Retry());
                });
        }
{{</codeblock>}}

We also need to add the nuget package [**Sundry.Extensions.Http.Polly**](https://www.nuget.org/packages/Sundry.Extensions.Http.Polly/) to our project.

The differnce between the Microsoft's extension and this extension is that,  we need to add the **_AddResiliencePipelineHandler_** extension method to the _HttpClientBuilder_ instead of **_AddPolicyHandler_**. 

Let's define our resilience strategy as well. 

{{<codeblock  "Program.cs" csharp >}}    public static class PollyResilienceStrategy
    {
        public static ResiliencePipeline<HttpResponseMessage> Retry()
        {
            return new ResiliencePipelineBuilder<HttpResponseMessage>()
                   .AddRetry(new RetryStrategyOptions<HttpResponseMessage>
                   {
                       ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
                           .Handle<HttpRequestException>()
                           .HandleResult(result => !result.IsSuccessStatusCode),
                       Delay = TimeSpan.FromSeconds(1),
                       MaxRetryAttempts = 5,
                       UseJitter = true,
                       BackoffType = DelayBackoffType.Exponential,
                       OnRetry = args =>
                       {
                           Console.WriteLine($"Retry Attempt Number : {args.AttemptNumber} after {args.RetryDelay.TotalSeconds} seconds.");
                           return default;
                       }
                   })
                   .Build();
        }
    }
{{</codeblock>}}

In this case, it's adding a strategy for Http Retries with exponential backoff along with Jitter. This strategy will handle the _HttpRequestException_ and _HttpResponseMessage_ with status code other than _200_. It will retry 5 times with 1 second**ish** delay between each retry. It will also log the retry attempt number and delay between each retry.

{{< alert info no-icon>}}
Enabling Jitter makes sure smooth and evenly distributed retry intervals applied with a well-controlled median initial retry delay on an exponential backoff. This approach helps to spread out the spikes when the issue arises.
{{< /alert >}}

[**Sundry.Extensions.Http.Polly**](https://www.nuget.org/packages/Sundry.Extensions.Http.Polly/) also provides built-in support for Transient Fault Handling Strategies. We will see the example below along with _AddResiliencePipelineRegistry_ example.

In Polly v8 _PolicyRegistry_ is replaced with _ResiliencePipelineRegistry_. Let's see how we can use it with new extension.
{{<codeblock  "Program.cs" csharp >}}static IHostBuilder CreateHostBuilder(string[] args)
        {
            return Host
                .CreateDefaultBuilder(args)
                .ConfigureLogging((context, logging) =>
                {
                    logging.SetMinimumLevel(LogLevel.Trace);
                })
                .ConfigureServices((context, services) =>
                {
                    services.AddResiliencePipelineRegistry((_,y) => y.TryAddBuilder<HttpResponseMessage>("Retry", (builder, _) => builder.AddRetry(new RetryStrategyOptions<HttpResponseMessage>
                   {
                       ShouldHandle = HttpPolicyExtensions.HandleTransientHttpError(),
                       Delay = TimeSpan.FromSeconds(1),
                       MaxRetryAttempts = 5,
                       UseJitter = true,
                       BackoffType = DelayBackoffType.Exponential,
                       OnRetry = (args) =>
                       {
                          System.Console.WriteLine($"Using TryAddBuilder:  Retry Attempt Number : {args.AttemptNumber} after {args.RetryDelay.TotalSeconds} seconds.");
                          return default;
                       },
                   })));

                    services
                    .AddHttpClient<IWeatherService, WeatherService>(client =>
                        {
                            client.BaseAddress = new Uri("http://localhost:5087/");
                        })
                    .AddResiliencePipelineHandlerFromRegistry("Retry");
                });
        }
{{</codeblock>}}

In this case, We have registerd Retry strategy to the **_ResiliencePipelineRegistry_** with name _Retry_. This will create and cache resilience pipeline instances. We have also added the **_AddResiliencePipelineHandlerFromRegistry_** extension method to the _HttpClientBuilder_ instead of _AddResiliencePipelineRegistry_ to make use of the registered strategy.

Also, if you noticed, this example is using _HttpPolicyExtensions.HandleTransientHttpError()_ to handle the transient errors.

It does support multiple overload which can be used to log using _ILogger_ as well. Below is the example for the same.
{{<codeblock  "Program.cs" csharp >}} public static ResiliencePipeline<HttpResponseMessage> Retry(IServiceProvider sp)
        {
            return new ResiliencePipelineBuilder<HttpResponseMessage>()
                   .AddRetry(new RetryStrategyOptions<HttpResponseMessage>
                   {
                       ShouldHandle = HttpPolicyExtensions.HandleTransientHttpError(),
                       Delay = TimeSpan.FromSeconds(1),
                       MaxRetryAttempts = 5,
                       UseJitter = true,
                       BackoffType = DelayBackoffType.Exponential,
                       OnRetry = (args) =>
                       {
                           var logger = sp.GetRequiredService<ILogger>();
                           logger.LogTrace($"Retry Attempt Number : {args.AttemptNumber} after {args.RetryDelay.TotalSeconds} seconds.");
                           return default;
                       },   
                   })
                   .Build();
        }
{{</codeblock>}}


## Conclusion
I tried to keep the similar approach as Microsoft's extension as close as possible. So that migration from v7 to v8 will be easy. Also kept the naming convention same as Polly v8. So, if you are using Polly v8, you can use this extension without any issue and you will get all the new features of Polly v8. Let me know if you have any feedback or suggestions. Also, if you want to contribute, you are more than welcome.

As always, You can find the source code [**here**](https://github.com/sundryoss/Sundry.Extensions.Http.Polly/).