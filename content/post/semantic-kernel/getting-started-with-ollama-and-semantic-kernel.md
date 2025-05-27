---
title: "Getting Started with Ollama & Semantic Kernel" # Title of the blog post.
date: 2025-05-23T19:00:00+01:00 # Date of post creation.
description: "How to use Semantic Kernel in AI development using Ollama / OpenAI using C#" # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnailImage: "/images/semantic-kernel/ollama.png"
thumbnailImagePosition: left
shareImage: "/images/semantic-kernel/ollama.png" # Designate a separate image for social media sharing.
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

[Getting Started with Foundry Local & Semantic Kernel](/post/semantic-kernel/getting-started-with-foundry-local-and-semantic-kernel)

_This Post - Getting Started with Ollama & Semantic Kernel_

[Getting Started with LMStudio & Semantic Kernel](/post/semantic-kernel/getting-started-with-lmstudio-and-semantic-kernel)


Now, we have a basic understanding how to integrate with local LLM using **{{< hl-text cyan >}}Semantic Kernel{{< /hl-text >}}**.  In this post we will continue our journey with another local LLM tool **{{< hl-text cyan >}}Ollama{{< /hl-text >}}**. 

### What is Ollama?
__Ollama__ is the high performance and headless application that is designed to run LLM on your own hardware. It supports both GPU & CPU. It is based on llama.cpp. Since v0.7.0, it supports multimodal models, models which can process both text, images and audio.

Ollama maintains a [catalog](https://ollama.com/search) of models that are optimized and customized for the application. However, you can use any GGUF models from Hugging Face. I will write another post on how to use Ollama with Hugging Face models but In this post, we use the models available in the catalog.

Ollama is available for Windows, Linux and  MacOS. We will be using Windows for this post.

### Installing Ollama
You can install ollama, either using the installer or using the docker image. I will be using the installer for this post but will also show you how to use the docker image.
 
##### Installation using Docker
###### CPU Only
```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

###### GPU Only
To enable Nvidia GPU support for Docker Desktop, make sure all prerequisites are met. You can check the [Docker](https://docs.docker.com/desktop/features/gpu/) for more information.

You also need to make sure you have [Nvidia container toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#installation) installed.


Once you have all the prerequisites, you can run the following command to start the Ollama container with GPU support:
```bash
docker run -d --gpus=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

##### Installation using Installer
You can download the installer from official website [Ollama](https://ollama.com/download). Based on your OS, you can download the installer. Once downloaded, run the installer and follow the instructions to install Ollama.

Alternatively, you can download the installer from the [Ollama Github Repo](https://github.com/ollama/ollama/releases/).


### List Available Models
Based on, how you installed it `ollama` command will be available either in your windows terminal or docker container. You can use the following command to list all available models:

```bash
ollama list
```

Just after the installation, you will see no models available.

### Run your first model
To run your first model, you can use the following command:

```bash
ollama run <model_name>
```
For example, to run the `qwen3:0.6b` model, you can use the following command:

```bash
ollama run qwen3:0.6b
```

Once you run the command, under the hood, it will download the model in your local machine and keep it `C:\Users\%USERNAME%\.ollama\models` and can be used for future reference. 

If you want to download the model without running it, you can use the following command:

```bash
ollama pull <model_name>
```
If you want to change the model directory location, you can set the `OLLAMA_MODELS` environment variable to the desired path. Once set make sure to restart the application.

You can also expose the model as a REST API using the following command:

```bash
ollama serve 
```

This will expose OpenAI API compatible endpoint on `http://localhost:11434`. You can use this endpoint from your semantic kernel application.

### Setup Semantic Kernel
We will create a new minimal api project using your favorite IDE. I will be using Visual Studio.

1. Open Visual Studio and create a new project.
2. Select "ASP.NET Core Web API" template.
3. Configure the project name and location.
4. Click "Create" to generate the project.

It could be a console application as well, but I prefer to use minimal api as we will be using it from out chat application.

It gets interesting from here. As `Ollama` serves OpenAI compatible API, we can use the same code we used for Foundry Local.

`Ollama` also has a first class support in .NET using a awesome project called [OllamaSharp](https://github.com/awaescher/OllamaSharp). Based on this project, Semantic Kernel has also has dedicated connector for `Ollama`.

#### Add Nuget Packages
First, we need to install following nuget packages:
 {{<codeblock  "SemanticChat.Ollama.csproj" xml >}}<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.5" />
    <!-- 👇 Use this package if you want to use OpenAI compatible API -->
    <PackageReference Include="Microsoft.SemanticKernel.Connectors.OpenAI" Version="1.54.0" />
    <!-- 👇 Use this package if you want to use OllamaSharp compatible API -->
    <PackageReference Include="Microsoft.SemanticKernel.Connectors.Ollama" Version="1.54.0-alpha" />
  </ItemGroup>
</Project>
{{</codeblock>}}
  
#### Add Connector and Kernel
Next step is to add the OpenAI connector and Kernel to the `ServiceCollection` in `Program.cs` file. You can use the following code to do that:

 {{<codeblock  "SemanticChat.Ollama.csproj" csharp >}}using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddKernel();
  <!-- 👇 Use this if you installed OpenAI Connector-->
builder.Services.AddOpenAIChatCompletion("qwen3:0.6b", new Uri("http://localhost:11434/v1"), serviceId: "qwen3:0.6b"); 
  <!-- 👇 Use this if you installed Ollama Connector-->
builder.Services.AddOllamaChatCompletion("qwen3:0.6b", new Uri("http://localhost:11434/"), serviceId: "qwen3:0.6b"); 
{{</codeblock>}}

Notice that the endpoint is different for different connectors. 

#### Add Chat Completion Endpoint
Next step is to add the chat completion endpoint to the `Program.cs` file. You can use the following code to do that:

 {{<codeblock  "Program.cs" csharp >}}var chatHistories = new Dictionary<string, ChatHistory>();
app.MapPost("/api/chat",async (Kernel kernel, ChatRequest request, HttpContext ctx,  CancellationToken ct) =>
{
    ctx.Response.Headers.Append(HeaderNames.ContentType, "text/event-stream");

    var chatService = kernel.GetRequiredService<IChatCompletionService>(serviceKey: request.model);

    var chatHistory = chatHistories.TryGetValue(request.sessionid, out var result) ? result : new ChatHistory("You are helpful assistant.");
    
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
    chatHistories[request.sessionid] = chatHistory;

})
.WithName("Chat");
{{</codeblock>}}

Let's break down the code:
- We are using `MapPost` to create a new endpoint `/api/chat` that will handle chat requests.
- We are using `text/event-stream` to set the response type for streaming, which is used for server-sent events.
- We are using `IChatCompletionService` to get the chat service for the model we are using from Kernel.
- We are using `ChatHistory` to keep track of the chat history based on per session. Initially, we are setting the system message to `You are helpful assistant.`. Notice that, we are using global variable `chatHistories` for demo purpose, later post we will use a better approach to manage the chat history.
- We are using `AddUserMessage` to add the user message to the chat history.
- We are using `GetStreamingChatMessageContentsAsync` to get the streaming chat message contents from the LLM.
- We are using `JsonSerializer` to serialize the response and send it back to the client.
- Finally, we are using `AddAssistantMessage` to add the assistant message to the chat history. So that follow up questions can be asked.
- We are using `cancellationToken` to cancel the request if needed.

Let's see it in action.

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/ollama.gif" title="ollama" >}}

The UI is a chat application built using Blazor which supports thinking step as well, will explain it in detail in some future post. For now, you can see that we are able to get the response from the LLM using Ollama and Semantic Kernel.

Probably, you have noticed that the follow up question do not makes sense if the user is not providing any context. Since we are using `ChatHistory` to keep track of the chat history, we can use it to provide context to the LLM.

### Outro
In this post, we have discussed how to use Ollama with Semantic Kernel. We have seen how to install Ollama, run a model, and use it with Semantic Kernel.

Will I be using Ollama in my future posts? For Chat completion, we will not be using Ollama as streaming is not supported yet with function call. Instead, we will be using **{{< hl-text cyan >}}LM Studio{{< /hl-text >}}**. However other task like Text embedding, we will use Ollama.

Ollama team is working to support streaming with function call, releated discussion can be found [here](https://github.com/ollama/ollama/pull/10415) and as soons as it is available, I will update this post.

Next post will talk about **{{< hl-text cyan >}}LM Studio{{< /hl-text >}}**. We will see how to use it with Semantic Kernel and build a chat application.

{{<alert info no-icon>}}
Ollama Icon used in this post is property of [Ollama](https://ollama.com/).

{{< /alert >}}

{{<alert info no-icon>}}
Semantic Kernel Icon used in this post is property of Microsoft. Story behind the icon is available [here](https://devblogs.microsoft.com/semantic-kernel/semantic-kernels-new-icon-and-the-art-of-teamwork/).
{{</alert >}}
