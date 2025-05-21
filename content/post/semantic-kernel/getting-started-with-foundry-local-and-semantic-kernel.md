---
title: "Getting Started with Foundry Local & Semantic Kernel" # Title of the blog post.
date: 2025-05-21T07:00:00+01:00 # Date of post creation.
description: "How to use Semantic Kernel in AI development using Foundry Local / OpenAI" # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnailImage: "/images/semantic-kernel/local foundry.png"
thumbnailImagePosition: left
shareImage: "/images/semantic-kernel/local foundry.png" # Designate a separate image for social media sharing.
codeMaxLines: 10 # Override global value for how many lines within a code block before auto-collapsing.
codeLineNumbers: false # Override global value for showing of line numbers within code block.
figurePositionShow: true # Override global value for showing the figure label.

categories:
- Semantic Kernel
- LLM
- .NET 9
- AI
- Vector DB
tags:
- genai
- ollama
keywords:
- Semantic Kernel
- AI development
- Machine learning
- Microsoft AI
- Natural language processing (NLP)
- OpenAI integration
- .NET AI framework
- Python AI tools
- AI-powered applications
- Prompt engineering
- AI agent creation
- Large language models (LLMs)
- AI automation
- Cognitive computing
- AI SDK
- Gen AI
- .NET 9
- LLM
- Ollama
- Foundry Local
- LM Studio
---
 
Hi Everyone! 
This post is continuation of a series about **{{< hl-text cyan >}}Semantic Kernel{{< /hl-text >}}**. Over the time, I will updated this page with links to individual posts : 

[Getting Started with Semantic Kernel (Part 1)](/post/getting-started-with-semantic-kernel)

[Getting Started with Semantic Kernel (Part 2)](/post/getting-started-with-semantic-kernel-pt-2)

[Building Blocks of Semantic Kernel](/post/semantic-kernel/semantic-kernel-building-blocks)

_This Post - Getting Started with Foundry Local & Semantic Kernel_

So far, we have discussed theorical aspects of Semantic Kernel. In this post, we will focus on practical aspects of using Semantic Kernel with Foundry Local.

Initially, I had a plan to start this technical part with **{{< hl-text cyan >}}Ollama{{< /hl-text >}}** and **{{< hl-text cyan >}}LM Studio{{< /hl-text >}}**. However, I have decided to start with **{{< hl-text cyan >}}Foundry Local{{< /hl-text >}}**, as this is something Microsoft just announced in Build 2025. You can find more information about Foundry Local [here](https://build.microsoft.com/en-US/sessions/BRK146).

### What is Foundry Local?
__Foundry Local__ is the high performance local AI stack that is designed to run on your own hardware and brings Azure AI Foundry’s power. it is build on top of Onnx Runtime and is designed to run on any hardware. 

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/foundry_local.png" title="foundry_local" >}}

Currently, Foundry Local is available for Windows and MacOS. We will be using Windows for this post.

### Installing Foundry Local
To install Foundry Local, you can use the following command in your terminal:

```bash
winget install Microsoft.FoundryLocal
```
Alternatively, you can download the installer from the [Foundry Local Github Repo](https://github.com/microsoft/Foundry-Local/releases).

### List Available Models
Once installed, `foundry` command will be available in your terminal. You can use the following command to list all available models:

```bash
foundry models list
```
Based on the your hardware, you will see a list of available models. For example, on my machine,  I can see the following models:

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/listofmodels.png" title="List of available models" >}}

You might noticed we have separate models for gpu and cpu. when you run the model based on your hardware, it will automatically select the best model for you.

### Run your first model
To run your first model, you can use the following command:

```bash
foundry model run <model_name>
```
For example, to run the `qwen2.5-0.5b` model, you can use the following command:

```bash
foundry model run qwen2.5-0.5b
```

Once you run the command, under the hood, it will download the model in your local machine and keep it `C:\Users\%USERNAME%\.foundry\cache\models` and can be used for future referenc. You can also use below command to see the models downloaded in your local machine:

```bash
foundry cache ls
```
Once the command is executed, you will see the following output:

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/runmodel.png" title="Run your first model" >}}

This is running in interactive mode, but we don't want that, so will close the interactive mode by pressing `Ctrl + C`. and run the below command:

```bash
foundry service start
```
This will expose OpenAI API compatible endpoint on `http://localhost:5273`. You can use this endpoint from your semantic kernel application.

### Setup Semantic Kernel
We will create a new minimal api project using your favorite IDE. I will be using Visual Studio.

1. Open Visual Studio and create a new project.
2. Select "ASP.NET Core Web API" template.
3. Configure the project name and location.
4. Click "Create" to generate the project.

It could be a console application as well, but I prefer to use minimal api as we will be using it from out chat application.

#### Add Nuget Packages
First, we need to install following nuget packages:
 {{<codeblock  "SemanticChat.FoundryLocal.csproj" xml >}}<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.5" />
    <PackageReference Include="Microsoft.SemanticKernel.Connectors.OpenAI" Version="1.53.1" />
  </ItemGroup>
</Project>
{{</codeblock>}}
  
#### Add Connector and Kernel
Next step is to add the OpenAI connector and Kernel to the `ServiceCollection` in `Program.cs` file. You can use the following code to do that:

 {{<codeblock  "SemanticChat.FoundryLocal.csproj" csharp >}}using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddKernel();
builder.Services.AddOpenAIChatCompletion("qwen2.5-0.5b-instruct-cuda-gpu", new Uri("http://localhost:5273/v1"), serviceId: "qwen2.5"); 
{{</codeblock>}}

Use Model Id (not the alias) and the endpoint `http://localhost:5273/v1` from __Foundry Local__.

#### Add Chat Completion Endpoint
Next step is to add the chat completion endpoint to the `Program.cs` file. You can use the following code to do that:

 {{<codeblock  "Program.cs" csharp >}}var chatHistory = new ChatHistory("You are helpful assistant.");
app.MapPost("/api/chat",async (Kernel kernel, ChatRequest request, HttpContext ctx,  CancellationToken ct) =>
{
    ctx.Response.Headers.Append(HeaderNames.ContentType, "text/event-stream");

    var chatService = kernel.GetRequiredService<IChatCompletionService>(serviceKey: request.model);

    // Add user message
    chatHistory!.AddUserMessage(request.content);

    var roleWritten = false;
    var fullMessage = string.Empty;
    var role = string.Empty; 
    await foreach (var chatUpdate in chatService.GetStreamingChatMessageContentsAsync(chatHistory,  cancellationToken: ct))
    { 
        if (chatUpdate.Content is { Length: > 0 })
        {
            if (!roleWritten && chatUpdate.Role.HasValue)
            {
                Console.Write($"{chatUpdate.Role.Value}: {chatUpdate.Content}");
                roleWritten = true;
                role = chatUpdate.Role.Value.Label;
            }

            fullMessage += chatUpdate.Content;
            await ctx.Response.WriteAsync($"data: ", cancellationToken: ct);
            await JsonSerializer.SerializeAsync(ctx.Response.Body, new ChatResponse { Content = chatUpdate.Content!, Role = role!, AuthorName = "Assistant" }, cancellationToken: ct);
            await ctx.Response.WriteAsync($"\n\n", cancellationToken: ct);
            await ctx.Response.Body.FlushAsync(ct);
        }
    }
    chatHistory.AddAssistantMessage(fullMessage);
})
.WithName("Chat");
{{</codeblock>}}

Let's break down the code:
- We are using `MapPost` to create a new endpoint `/api/chat` that will handle chat requests.
- We are using `text/event-stream` to set the response type for streaming, which is used for server-sent events.
- We are using `IChatCompletionService` to get the chat service for the model we are using from Kernel.
- We are using `ChatHistory` to keep track of the chat history. Initially, we are setting the system message to `You are helpful assistant.`. Notice that, we are using global variable `chatHistory` for demo purpose, later post we will use a better approach to manage the chat history.
- We are using `AddUserMessage` to add the user message to the chat history.
- We are using `GetStreamingChatMessageContentsAsync` to get the streaming chat message contents from the LLM.
- We are using `JsonSerializer` to serialize the response and send it back to the client.
- Finally, we are using `AddAssistantMessage` to add the assistant message to the chat history. So that follow up questions can be asked.
- We are using `cancellationToken` to cancel the request if needed.

Let's see it in action.


{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/foundarylocal-demo.gif" title="foundarylocal" >}}

The UI is a chat application built using Blazor, will explain it in detail in some future post. For now, you can see that we are able to get the response from the LLM using Foundry Local and Semantic Kernel.

Probably, you have noticed that the follow up question do not makes sense if the user is not providing any context. Since we are using `ChatHistory` to keep track of the chat history, we can use it to provide context to the LLM.

### Outro
In this post, we have discussed how to use Foundry Local with Semantic Kernel. We have seen how to install Foundry Local, run a model, and use it with Semantic Kernel.

Will I be using Foundry Local in my future posts? probably not because of the following reasons:
- Model catalog has limited models available.
- The above, can be solved but for that we need to download the models from Hugging Face and have to go through the process of converting them to Onnx format using python. This is a bit tedious process especially when you are .NET developer and you want to focus on building applications.
- Though the api is OpenAI compatible, structured output is not supported yet.
- Onnx model hosted on Hugging Face are not optimized for Foundry Local yet. However, we have the confirmation from **{{< hl-text red >}}the awesome team of Foundry Local {{< /hl-text >}}** that they are working on it and will be available soon.

We will keep an eye on the Foundry Local and will update this post when we have more information.

Next post will be about **{{< hl-text cyan >}}Ollama{{< /hl-text >}}** and **{{< hl-text cyan >}}LM Studio{{< /hl-text >}}**. We will see how to use them with Semantic Kernel and build a chat application.

{{<alert info no-icon>}}
Icon and images used in this post is property of Microsoft. Story behind the icon is available [here](https://devblogs.microsoft.com/semantic-kernel/semantic-kernels-new-icon-and-the-art-of-teamwork/).
{{</alert >}}
