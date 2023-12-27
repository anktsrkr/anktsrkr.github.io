---
title: "Re-Authorize Efficiently Using Polly And .NET HttpClientFactory" # Title of the blog post.
date: 2023-05-25T06:00:35+01:00 # Date of post creation.
description: "Re-Authorize Efficiently Using Polly And .NET HttpClientFactory" # Description used for search engine.
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
- polly get accesstoken
- using polly to retry after HttpStatusCode.Unauthorized
- refresh authentication token on retry when using polly
- re-authorization and onRetry with polly
- refresh bearer token when using named HttpClient
- refresh bearer token when using typed HttpClient
- refresh token when using typed HttpClientFactory
- .net core polly retry accesstoken idtoken
- re-authorize Efficiently Using Polly And .NET HttpClientFactory
---
In today's world, we are using a lot of APIs to build our applications. To make your .NET based applications more ressilient and fault tolerant, go to solution is to use  **{{< hl-text green >}}Polly{{< /hl-text >}}**. Probably, you are already using it. So,I'm not going to explain how to use it in general. You can find some excellent documentation [here](https://github.com/App-vNext/Polly#get-started).

However, In this post I'm going to discuss about one of the typical scenario where we need to refresh the authentication token when using Polly. Let's get started.

>__UPDATE__: If you are using **Polly v8** and **.NET 8**, you can find the updated post [here](/post/re-authorize-efficiently-using-polly-and-httpclientfactory-in-.net8/)

## The Problem
To handle such situation what we do is retry on _Unauthorized_ failure and call a method to reauthorize. Something like below from the Polly documentation - 

{{<codeblock  "FromDocumentation.cs" csharp >}}HttpClient httpClient = ...

var authEnsuringPolicy = Policy<HttpResponseMessage>  
  .HandleResult(r => r.StatusCode == StatusCode.Unauthorized)
  .RetryAsync(1, onRetryAsync: async (e, i) => await AuthHelper.RefreshAuthorization(httpClient));

var httpResponseMessage =  
    await authEnsuringPolicy.ExecuteAsync(() => httpClient.GetAsync(uri));

{{</codeblock>}}

_The above pattern works by sharing the httpClient variable across closures, but a significant drawback is that you have to declare and use the policy in the same scope. This makes impossible to use dependency injection approach where you define policies centrally on startup, then provide them by DI to the point of use. Using DI with Polly in this way is a powerful pattern for separation of concerns, and allows easy stubbing out of Polly in unit testing._

_From Polly _v5.1.0_, with **Context** available as a state variable to every delegate, the policy declaration can be rewritten:_

{{<codeblock  "FromDocumentation.cs" csharp >}}var authEnsuringPolicy = Policy<HttpResponseMessage>  
  .HandleResult(r => r.StatusCode == StatusCode.Unauthorized)
  .RetryAsync(1, onRetryAsync: async (ex, i, context) => await AuthHelper.RefreshAuthorization(context["httpClient"]));

{{</codeblock>}}

_And the usage (elsewhere in the codebase):_

{{<codeblock  "FromDocumentation.cs" csharp >}}
var httpResponseMessage =  
    await authEnsuringPolicy.ExecuteAsync(context => context["httpClient"].GetAsync(uri), 
    contextData: new Dictionary<string, object> {{"httpClient", httpClient}}
    );

{{</codeblock>}}

_Passing context as state-data parameters in the different parts of policy execution allows policy declaration and usage now to be separate._

The above example and explanation is taken from the Polly documentation. You can find the same [here](http://www.thepollyproject.org/2017/05/04/putting-the-context-into-polly/).

IMO, the above approach is not very clean as we are passing _httpClient_ as a state variable. Instead if we can pass the _Token_ as a state variable, it will be more cleaner. Let's try to implement the same.

## The Solution
The solution could be to make use of the _Context_ , _DelegationHandler_ and _HttpClientFactory_. Define a communication between them as below - 
    
{{< figure src="/images/polly/refresh-token-flow.png" alt="Communication between Context, DelegationHandler and HttpClientFactory" >}}

In our scenario, we are using _Auth0_ as Token Provider and our Downstream system (Todo API)is protected by it.

First, we will focus on **{{< hl-text orange >}}Auth0 Service{{< /hl-text >}}**. This service is responsible for getting the actual _Token_ from Auth0 and refresh it when it is expired. We will start by defining _Token_ DTO as below - 

{{<codeblock  "ITokenService.cs" csharp >}}
public record Token
{
    public static Token Empty => new();

    [JsonPropertyName("token_type")]
    public string Scheme { get; set; } = default!;

    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = default!;

    [JsonPropertyName("expires_in")]
    public double ExpiresIn { get; set; } = default!;
}
{{</codeblock>}} 

We will also define a _Auth0Service_  which will be responsible for the actual hard work - 

{{<codeblock  "IAuth0Service.cs" csharp >}}public interface IAuth0Service
{
    Task<Token> GetTokenAsync();
}
public class Auth0Service : IAuth0Service
{
    private readonly HttpClient _httpClient;
    private readonly Auth0Option _settings;
    public Auth0Service(HttpClient client, Auth0Option settings)
    {
        _httpClient = client;
        _settings = settings;
    }
    public async Task<Token> GetTokenAsync()
    {
        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["client_id"] = _settings.ClientId,
            ["client_secret"] = _settings.ClientSecret,
            ["audience"] = _settings.Audience,
            ["grant_type"] = _settings.GrantType,
            ["scope"] = _settings.Scope
        });

            var result= await  _httpClient.PostAsync(_settings.TokenUrl, content);
            if (!result.IsSuccessStatusCode)
            {
               return Token.Empty;
            }
            var token = await result.Content.ReadFromJsonAsync<Token>();

            return token!;
    }
}
{{</codeblock>}}
It will work as Typed Client for Auth0.

Next, we will focus on **{{< hl-text green >}}Token Service{{< /hl-text >}}**. This service is responsible for getting the cached _Token_ from memory and refresh it from **{{< hl-text orange >}}Auth0 Service{{< /hl-text >}}** when it is expired. Below is the implementation - 

{{<codeblock  "ITokenService.cs" csharp >}}public interface ITokenService
{
    ValueTask<Token> GetToken();
    Task<Token> RefreshToken();
}
public class TokenService : ITokenService
{
    private const string CacheKey = nameof(TokenService);

    private readonly IAuth0Service _auth0Service;
    private readonly IMemoryCache _memoryCache;
    public TokenService(IAuth0Service auth0Service, IMemoryCache memoryCache)
    {
        _auth0Service = auth0Service;
        _memoryCache = memoryCache;
    }
    public async ValueTask<Token> GetToken()
    {
        if (!_memoryCache.TryGetValue(CacheKey, out Token? cacheValue))
        {
            cacheValue = await RefreshToken();
        }
        return cacheValue!;
    }

    public async Task<Token> RefreshToken()
    {
        var token = await _auth0Service.GetTokenAsync();
        if (token != Token.Empty)
        {
            var expires_in = token.ExpiresIn>0?token.ExpiresIn-10:token.ExpiresIn;
            _memoryCache.Set(CacheKey, token, new MemoryCacheEntryOptions()
                                                    .SetSlidingExpiration(TimeSpan.FromMinutes(5))
                                                    .SetAbsoluteExpiration(TimeSpan.FromSeconds(expires_in)));
        }

        return token;
    }
}
{{</codeblock>}}

Here, couple of things to note - 

1. We are using **ValueTask** for _GetToken_. This is because we know that the __Hot path__ will be to get the _Token_ from the memory cache and very few scenraio(e.g very first time when Downstream is getting hit) it will actualy call the **{{< hl-text orange >}}Auth0 Service{{< /hl-text >}}**. So, we are using **ValueTask** to avoid the overhead of allocating a new Task in the heap.

2. We are using _SetAbsoluteExpiration_ and _SetSlidingExpiration_ both to make sure we are not overwhelming by storing the unused _Token_ in the memory cache. Also to avoid edge case when the _Token_ is expired but not yet refreshed we are making sure it removed from the cache before it's actual expiry time.


Time to rewrite our Policy for getting the refreshed Token - 
{{<codeblock  "ITokenService.cs" csharp >}}public static IAsyncPolicy<HttpResponseMessage> GetTokenRefresher(IServiceProvider provider, HttpRequestMessage request)
    {
        var delay = Backoff.ConstantBackoff(TimeSpan.FromMilliseconds(100), retryCount: 3);

        return Policy<HttpResponseMessage>
                .HandleResult(msg => msg.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                .WaitAndRetryAsync(delay, async (_, _, _, _) =>
            {
                await provider.GetRequiredService<ITokenService>().RefreshToken();
                request.SetPolicyExecutionContext(new Context());
            });
    }

    public static IAsyncPolicy<HttpResponseMessage> GetConstantBackofffPolicy()
    {
        var delay = Backoff.ConstantBackoff(TimeSpan.FromMilliseconds(100), retryCount: 3);

        return HttpPolicyExtensions
            .HandleTransientHttpError()
            .OrResult(msg => msg.StatusCode == System.Net.HttpStatusCode.NotFound)
            .WaitAndRetryAsync(delay);
    }
{{</codeblock>}}

Very simple and clean. We are making sure, after refreshing the token, the context is clear so that in _DelegationHandler_ we can get the updated token. Below is the implementation of custom handler - 
{{<codeblock  "ITokenService.cs" csharp >}}public class TokenRetrievalHandler : DelegatingHandler
{
    private readonly ITokenService tokenService;
    private const string TokenRetrieval = nameof(TokenRetrieval);
    private const string TokenKey = nameof(TokenKey);
    public TokenRetrievalHandler(ITokenService service)
    {
        tokenService = service;
    }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var context = request.GetPolicyExecutionContext();
        if (context.Count == 0)
        {
            context = new Context(TokenRetrieval, new Dictionary<string, object> { { TokenKey, await tokenService.GetToken() } });
            request.SetPolicyExecutionContext(context);
        }

        var token = (Token)context[TokenKey];

        if(token!= Token.Empty)
            request.Headers.Authorization = new AuthenticationHeaderValue(token.Scheme, token.AccessToken);

        return await base.SendAsync(request, cancellationToken);
    }
}
{{</codeblock>}}

We are intercepting the actual call and making sure,the updated token is added in header always. 

We have all the pieces in place. Now, we just need to orchestrate the flow. We will also make use of **PolicyWrap** to combine the same type of policies to make our application fault tolerant.

We will create _ServiceCollection_ extension to keep our _StartUp.cs_ clear and concise. First we will create the extension for **{{< hl-text orange >}}Auth0 Service{{< /hl-text >}}** as below

{{<codeblock  "ServiceCollectionExtensions.cs" csharp >}}public static IServiceCollection AddAuth0Service(this IServiceCollection services, HostBuilderContext context)
    {
        var auth0Option = context.Configuration.GetSection(Auth0Option.ConfigKey).Get<Auth0Option>()!;

        services.AddSingleton(auth0Option);

        services
                .AddHttpClient<IAuth0Service, Auth0Service>(client =>
                {
                    client.BaseAddress = new Uri(auth0Option.BaseAddress);
                    client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/json");
                })
                .AddPolicyHandler(PollyRetryPolicies.GetConstantBackofffPolicy());
        return services;
    }
{{</codeblock>}}
Nothing fancy here, just making sure in case of any transient error, we are retrying 3 times with a constant backoff of 100ms.

Now, the intersting Typed Client for DownStream System which is in our case _TodoService_. Below is the extension method for the same - 

{{<codeblock  "ServiceCollectionExtensions.cs" csharp >}}public static IServiceCollection AddTodoService(this IServiceCollection services, HostBuilderContext context)
    {
        services.AddSingleton<ITokenService, TokenService>();
        services.AddTransient<TokenRetrievalHandler>();

        var todoServiceOption = context.Configuration.GetSection(TodoServiceOption.ConfigKey).Get<TodoServiceOption>()!;
        services
                .AddHttpClient<ITodoService, TodoService>(client => client.BaseAddress = new Uri(todoServiceOption.BaseUrl))
                .AddPolicyHandler((provider,request)=> Policy.WrapAsync(PollyRetryPolicies.GetConstantBackofffPolicy(), PollyRetryPolicies.GetTokenRefresher(provider, request)))
                .AddHttpMessageHandler<TokenRetrievalHandler>();
        return services;
    }
{{</codeblock>}}

We have added the _TokenRetrievalHandler_  to intercept any call from this Typed Client and attach the _Token_ in the header. Also, we have added the _PolicyWrap_ to make sure we are retrying 3 times with a constant backoff of 100ms in case of any transient error and also refresh the token in case of _Unauthorized_ error.

And the last bit, The Console from where we are calling the API - 

{{<codeblock  "Program.cs" csharp >}}public static class Program
{
    public static async Task Main(string[] args)
    {
        var host = CreateHostBuilder(args).Build();

        var todoService = host.Services.GetRequiredService<ITodoService>();
        await GetAllTodo(todoService);

        await host.RunAsync();
    }

    static IHostBuilder CreateHostBuilder(string[] args) => Host
        .CreateDefaultBuilder(args)
         .ConfigureServices((context, services) => services.AddMemoryCache()
                                                           .AddAuth0Service(context)
                                                           .AddTodoService(context))
        .ConfigureAppConfiguration((_, config) => config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true));

    public static async Task GetAllTodo(ITodoService todoService)
    {
        var todos = await todoService.GetTodosAsync();
        if (todos is null)
        {
            Console.WriteLine("Todos is null");
            return;
        }
        Console.WriteLine($"Todos: {todos.Count()}");
    }
}
{{</codeblock>}}

Here, we have configured the services for _MemoryCache_, _Auth0Service_ and _TodoService_. Also, we have added the _appsettings.json_ file to get the configuration for the same.

That's it. We are done. Now, we can run the application.


## Conclusion
IMO, the above approach is more cleaner and easy to understand. Also, it is more flexible and can be extended easily.Also, each service has it's own responsibility and can be tested independently. I have used _Auth0_ as Token Provider but you can use any other provider as well with any other Downstream system.I have skipped the part for Auth0 configuration but let me know if you want me to explain it in seperate post. You can also use the same approach for _Named Client_ as well. This post is inspired from below [post](https://stackoverflow.com/questions/59833373/refresh-token-using-polly-with-named-client/73123449)


As always, You can find the source code [**here**](https://github.com/sundryoss/Sundry.PollyDemystified/).