---
title: "Getting Started with LMStudio & Semantic Kernel" # Title of the blog post.
date: 2025-05-23T19:00:00+01:00 # Date of post creation.
description: "How to use Semantic Kernel in AI development using LMStudio / OpenAI using C#" # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnailImage: "/images/semantic-kernel/lmstudio.png"
thumbnailImagePosition: left
shareImage: "/images/semantic-kernel/lmstudio.png" # Designate a separate image for social media sharing.
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

[Getting Started with Ollama & Semantic Kernel](/post/semantic-kernel/getting-started-with-ollama-and-semantic-kernel)

_This Post - Getting Started with LMStudio & Semantic Kernel_

So far, we have seen how to use Semantic Kernel with Ollama and Foundry Local. In this post, we will see how to use Semantic Kernel with **{{< hl-text cyan >}}LM Studio{{< /hl-text >}}**.

### What is LM Studio?
__LM Studio__ is a desktop application that is designed to run LLM on your own hardware. It supports both GPU & CPU. It is based on llama.cpp.

LM Studio supports GGUF and MLX formats. `MLX` is a new Machine Learning framework from Apple. MLX is efficient and blazing fast on M1/M2/M3/M4 Macs. LM Studio leverages MLX to run LLMs on Apple silicon, utilizing the full power of the Mac's Unified Memory, CPU, and GPU. 

Please note that, LM Studio GUI app is not open source. However LM Studio‘s CLI, Core SDK, and MLX inferencing engine are all MIT licensed and open source.

LM Studio maintains a [catalog](https://lmstudio.ai/models) of models that are optimized and customized for the application. However, you can use any GGUF models from Hugging Face.

LM Studio is available for Windows, Linux and  MacOS. We will be using Windows for this post.

### Installing LM Studio
You can install LM Studio, using the installer from the official website.  

You also need to make sure you have [Nvidia container toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html#installation) installed.

You can download the installer from official website [LM Studio](https://lmstudio.ai/download). Based on your OS, you can download the installer. Once downloaded, run the installer and follow the instructions to install LM Studio.


### Run your first model
Once you launch the application, you will see the main window of LM Studio. Go to `Discover` tab and search for the model you want to run. For this post, we will be using `Gemma 3 4B QAT` model.


{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/lmstudio_model_installation.gif" title="lmstudio_model_installation" >}}

We will not be using the GUI for this post, but you can use it for exploring the models and their capabilities.

To expose OpenAI compatible API, swich to `Power User` mode and Start the server. You can also tweak the settings as per your requirements but make sure `Just-in-Time Model Loading` is enabled. When this is enabled, if a request specified a model that is not loaded, it will be automatically loaded and used. 

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/lmstudio_power_user_mode.gif" title="lmstudio_power_user_mode" >}}

This will expose OpenAI API compatible endpoint on `http://localhost:11435`. You can use this endpoint from your semantic kernel application.

### Setup Semantic Kernel
We will create a new minimal api project using your favorite IDE. I will be using Visual Studio.

1. Open Visual Studio and create a new project.
2. Select "ASP.NET Core Web API" template.
3. Configure the project name and location.
4. Click "Create" to generate the project.

It could be a console application as well, but I prefer to use minimal api as we will be using it from out chat application.

#### Add Nuget Packages
First, we need to install following nuget packages:
 {{<codeblock  "SemanticChat.LMStudio.csproj" xml >}}<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.5" />
    <PackageReference Include="Microsoft.SemanticKernel.Connectors.OpenAI" Version="1.54.0" />
    <PackageReference Include="Microsoft.SemanticKernel.PromptTemplates.Liquid" Version="1.54.0" />
  </ItemGroup>
</Project>
{{</codeblock>}}
  
#### Add Connector and Kernel
Next step is to add the OpenAI connector and Kernel to the `ServiceCollection` in `Program.cs` file. You can use the following code to do that:

 {{<codeblock  "SemanticChat.LMStudio.csproj" csharp >}}using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddKernel();
builder.Services.AddOpenAIChatCompletion("gemma-3-4b-it-qat", new Uri("http://localhost:11435/v1"), serviceId: "gemma"); 
{{</codeblock>}}

#### Add Chat Summarization Endpoint
In the previous post, we have seen how to add chat completion endpoint using Semantic Kernel and Ollama. Now we will extend the same to add chat summarization endpoint using LM Studio.
So as next step we need to add the chat summarization endpoint to the `Program.cs` file. You can use the following code to do that:

 {{<codeblock  "Program.cs" csharp >}}app.MapPost("/api/summerize", async (Kernel kernel, ChatRequest request, HttpContext ctx, IHttpClientFactory factory, CancellationToken ct) =>
{
    var template = "<message role=\"system\">\r\nYou are an expert summarizer and analyzer who can help me.\r\n</message>\r\n<message role=\"user\">\r\n    `Generate a concise and coherent summary from the given Context. \r\n\r\n    Condense the context into a well-written summary that captures the main ideas, key points, and insights presented in the context. \r\n\r\n    Prioritize clarity and brevity while retaining the essential information. \r\n\r\n    Aim to convey the context's core message and any supporting details that contribute to a comprehensive understanding. \r\n\r\n    Craft the summary to be self-contained, ensuring that readers can grasp the content even if they haven't read the context. \r\n\r\n    Provide context where necessary and avoid excessive technical jargon or verbosity.\r\n\r\n    The goal is to create a summary that effectively communicates the context's content while being easily digestible and engaging.\r\n\r\n    Summary should NOT be more than {{inputs.word_count}} words for {{inputs.target_audience}} audience.\r\n\r\n    CONTEXT: {{inputs.text}}\r\n\r\n    SUMMARY: \r\n</message>\r\n{% for item in history %}\r\n    <message role=\"{{item.role}}\">\r\n        {{item.content}}\r\n    </message>\r\n    {% endfor %}\r\n";
    var chatHistory = chatHistories.TryGetValue(request.sessionid, out var result) ? result : new ChatHistory();
    var templateFactory = new LiquidPromptTemplateFactory();
    var promptTemplateConfig = new PromptTemplateConfig()
    {
        Template = template,
        TemplateFormat = "liquid",
        Name = "summarizerprompt",
    };

    var cleanAssistantText = Regex.Replace(chatHistory.Last(x => x.Role == AuthorRole.Assistant).Content, @"<think>[\s\S]*?</think>", "").Trim();

    var chatService = kernel.GetRequiredService<IChatCompletionService>(serviceKey: "gemma");

    var arguments = new KernelArguments()
    {
        { "inputs", new
            {
                word_count = "5",
                target_audience = "professional",
                text= "Question : " +  chatHistory.Last(x=>x.Role == AuthorRole.User).Content + "\n Answer : "+cleanAssistantText
            }
        }
    };
    var promptTemplate = templateFactory.Create(promptTemplateConfig);
    var renderedPrompt = await promptTemplate.RenderAsync(kernel, arguments, ct);

    var chatUpdate = await chatService.GetChatMessageContentAsync(renderedPrompt, cancellationToken: ct);
    return chatUpdate.Content!;
})
.WithName("Summerize");
{{</codeblock>}}

Let's break down the code:
- We are using `MapPost` to create a new endpoint `/api/summerize` that will handle chat requests.
- Defining a template for the chat summarization prompt using Liquid syntax. This template includes instructions for summarizing the context and generating a concise summary.
- We are using `ChatHistory` to get the chat history based on the session ID provided in the request. If the session ID does not exist, we create a new `ChatHistory` instance.
- We are using `LiquidPromptTemplateFactory` to create a prompt template from the defined template.
- We are Sanitizing the last assistant message in the chat history to remove any `<think>` tags and keep the content clean.
- We are using `KernelArguments` to pass the inputs to the prompt template, including the word count, target audience, and text to summarize.
- We are using `GetChatMessageContentAsync` to get the chat message content from the LLM based on the rendered prompt.
- Finally, we return the content of the chat update as the response.

Let's see it in action.

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/lmstudio-in-action.gif" title="lmstudio-in-action" >}}

The UI is a chat application built using Blazor which supports thinking step as well, will explain it in detail in some future post. For now, you can see that we are able to get the summary from the LLM using LM Studio and Semantic Kernel.


### Outro
In this post, we have discussed how to use LM Studio with Semantic Kernel. We have seen how to install LM Studio, run a model, and use it with Semantic Kernel.

Will I be using LM Studio in my future posts? For Chat completion, we will be using LM Studio as streaming is supported with function call in LM Studio. However we will not be using LM Studio for Text embedding and probably will be using Ollama as soon as streaming with function call is supported.

Next post onwards, we will be shifting our focus on more enterprise use cases of Semantic Kernel. Such as Agent creation, Prompt engineering, Process building, and more.

{{<alert info no-icon>}}
LM Studio Icon used in this post is property of [LM Studio](https://lmstudio.ai/).

{{< /alert >}}

{{<alert info no-icon>}}
Semantic Kernel Icon used in this post is property of Microsoft. Story behind the icon is available [here](https://devblogs.microsoft.com/semantic-kernel/semantic-kernels-new-icon-and-the-art-of-teamwork/).
{{</alert >}}
