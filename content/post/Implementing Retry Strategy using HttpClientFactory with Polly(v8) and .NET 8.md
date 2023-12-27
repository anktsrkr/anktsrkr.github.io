---
title: "Implementing Retry Strategy using HttpClientFactory with Polly(v8) and .NET 8" 
date: 2023-10-31T06:00:35+01:00 # Date of post creation.
description: "Implementing Retry Strategy using HttpClientFactory with Polly(v8) and .NET 8" # Description used for search engine.
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
- .NET 8
- Polly 8
tags:
- polly
- c#
- httpclientfactory
keywords:
- polly v8
- polly c#
- polly .net 8
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
Hi Everyone!

As we all aware, Polly v8 is released sometime back and so is .NET 8, it is ready for Production use 🥳.

In this series of posts, I will try to cover some of the new features of Polly v8 and .NET 8. Below are the topics I am planning to cover in this series :

_This Post - Implementing Retry Strategy for HttpClientFactory using Polly(v8) and .NET 8_

[Re-Authorize Efficiently Using Polly And .NET HttpClientFactory in .NET 8](/post/re-authorize-efficiently-using-polly-and-httpclientfactory-in-.net8)

[Implementing Timeout Strategy for HttpClientFactory using Polly(v8) and .NET 8](#)

[Implementing CircuitBreaker Strategy for HttpClientFactory using Polly(v8) and .NET 8](#)

[Implementing RateLimiter Strategy for HttpClientFactory using Polly(v8) and .NET 8](#)

[Implementing Multiple Strategy for HttpClientFactory using Polly(v8) and .NET 8](#)

[Implementing Telemetry for HttpClientFactory using Polly(v8) and .NET 8](#)

I would like to keep this series as relevant as possible, so that developers can use it in their day to day work.

## What's new in .NET 8 (relevant to this post)?
Microsoft has released a new package for resiliency, which is [Microsoft.Extensions.Http.Resilience](https://www.nuget.org/packages/Microsoft.Extensions.Http.Resilience/). This package is a wrapper around Polly v8 and provides a way to implement Polly strategies for HttpClientFactory.

## Setup
For demonstration purpose, I have created a .NET 8 Web API project so that we can inject fault in our API as and when required. For some initial use cases, it will look like below :

{{< image classes="fancybox right clear" group="polly" src="/images/pollynet8/weather-api.png" title="Weather API" >}}

Just boilerplate code, nothing fancy here apart from the fact that we throw exception randomly to simulate the fault.

We will also create a console application to consume this API and will implement Polly strategies for HttpClientFactor here.

{{< image classes="fancybox right clear" group="polly" src="/images/pollynet8/console-startup.png" title="Console Startup" >}}

We are using Typed HttpClient here, so we will create a implementation for that as well.

{{< image classes="fancybox right clear" group="polly" src="/images/pollynet8/weatherforecast-client.png" title="Weather API" >}}

## Retry Resilience Strategy
Resilience strategies (previously known as Policy in v7) are essential components of Polly, designed to execute user-defined callbacks while adding an extra layer of resilience.

Polly categorizes resilience strategies into two types: **Reactive** and **Proactive**.

Defination of both are as below (from [Polly documentation](https://www.pollydocs.org/strategies/index.html)):

**Reactive**: These strategies handle specific exceptions that are thrown, or results that are returned, by the callbacks executed through the strategy.

**Proactive**: Unlike reactive strategies, proactive strategies do not focus on handling errors by the callbacks might throw or return. They can make proactive decisions to cancel or reject the execution of callbacks (e.g., using a rate limiter or a timeout resilience strategy).

**_Retry_** is a ___reactive strategy___, which means it will handle specific exceptions that are thrown, or results that are returned, by the callbacks executed through the strategy.

These strategies can not run on their own, they need to be executed by a resilience pipeline. 
 
Below is the sequence of diagram of how HttpClientFactory will execute the resilience strategy :

{{< image classes="right clear" src="/images/pollynet8/sequence.png" title="HttpClient Retry Resilience Strategy" >}}

Enough of theory, let's implement Retry strategy for our HttpClientFactory.

First thing first, we will add all required packages to our console application, below are the packages we need to install :

{{< image classes="fancybox right clear" group="polly" src="/images/pollynet8/console-required-packages.png" title="Required Packages for Console App" >}}

At the time of writing this post, All packages provided by Microsoft are in preview mode for RC2. By the time you are reading this post, it might be available in stable version.

Now, we will add new extension method `AddResilienceHandler` provided by the package `Microsoft.Extensions.Http.Resilience` to our `Program.cs` file. We will also configure the retry policy here.

{{< image classes="fancybox right clear" group="polly" src="/images/pollynet8/console-startup-with-retry.png" title="HttpClientFactory Extension Method" >}}

Above code implies that, it will retry 3 times with exponential backoff. It will also add some random jitter to the retry interval.
> If you want to learn more about why we need to add jitter to the retry interval, please refer to [this](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) article.

{{< alert info no-icon>}}
By default, the options are set to handle only transient failures, that is timeouts, `5xx` responses, and `System.Net.Http.HttpRequestException` exceptions.
{{< /alert >}}

{{< alert info no-icon>}}
By default, the options are set to respect Retry-After header as well.
{{< /alert >}}

{{< alert warning no-icon>}}
 If the `ShouldRetryAfterHeader` is set to `true` then the generator will resolve the delay based on the Retry-After header rules, otherwise it will return null and the retry strategy delay will generate the delay based on the configured options.
{{< /alert >}}

Now, if we run the console application, you will see that it will retry maximum configured time with exponential backoff and will eventually pass.

{{< image classes="fancybox right clear" group="polly" src="/images/pollynet8/console-retry.png" title="Console Retry" >}}

Here, Attempt: 0 is the actual call and Attempt: 1, 2 are the retries.


## Conclusion
In this post, we have seen how we can implement Retry strategy for HttpClientFactory using Polly v8 and .NET 8. If you are coming from Polly v7, you will notice that there are some changes in the way we implement the resilience strategy. We will see more about it in upcoming posts.

I would also recommend you to read Anti-patterns [here](https://www.pollydocs.org/strategies/retry.html#anti-patterns) to avoid some common mistakes.
