---
title: Getting Started with LM Studio & Agent Framework for .NET Developers
date: 2025-10-02T04:00:00.000Z
description: How to use Agent Framework in AI development using LM Studio / OpenAI using C#
featured: true
draft: false
toc: false
thumbnailImage: /images/agent-framework/aflogo.png
thumbnailImagePosition: left
shareImage: /images/agent-framework/aflogo.png
codeMaxLines: 10
codeLineNumbers: false
figurePositionShow: true
categories:
  - Agent Framework
  - AI
  - LLM
  - .NET 10
tags:
  - genai
  - lmstudio
keywords:
  - Semantic Kernel
  - Agent Framework
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
comments: true
showSocial: true
---
Microsoft has announced the __Microsoft Agent Framework__, an open-source SDK and runtime that makes it easier for developers to build, deploy, and manage multi-agent systems. If you’ve worked with __Semantic Kernel__ or experimented with __AutoGen__, this framework brings the best of both worlds into a single, unified foundation.

Instead of choosing between _enterprise-ready stability (Semantic Kernel)_ or _research-driven orchestration patterns (AutoGen)_, C# developers can now leverage one framework that combines innovation with production-grade reliability.

### From Semantic Kernel and AutoGen → To Microsoft Agent Framework
Here’s a quick comparison:

| Feature                  | Semantic Kernel                                                                     | AutoGen                                                                        | Microsoft Agent Framework                                                         |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **Focus**                | Stable SDK with enterprise connectors, workflows, observability                     | Experimental multi-agent orchestration from research                           | Unified SDK: innovation + enterprise readiness                                    |
| **Interop**              | Plugins, connectors, MCP, A2A, OpenAPI                                              | Tool integration but no standard cross-runtime protocols                       | Built-in connectors, full support for MCP + A2A + OpenAPI                         |
| **Memory**               | Multiple vector store connectors, memory abstraction (e.g., Elasticsearch, MongoDB) | In-memory history, external vector stores (ChromaDB, Mem0, etc.)               | Pluggable memory across first/third-party stores, persistent + adaptive retrieval |
| **Orchestration**        | Deterministic + dynamic orchestration (Process Framework, Agent Framework)          | Dynamic LLM orchestration (debate, reflection, facilitator/worker, group chat) | Both: deterministic workflow + dynamic LLM orchestration                          |
| **Enterprise Readiness** | Telemetry, observability, compliance                                                | Minimal                                                                        | Full stack: observability, approvals, CI/CD, long-running durability, hydration   |

### Why It Matters for .NET Developers?
With Microsoft Agent Framework, you get:

__Open standards & interoperability__ — MCP, A2A, and OpenAPI ensure your agents are portable, vendor-neutral, and easy to integrate into existing .NET solutions.

__Research-to-production pipeline__ — bleeding-edge orchestration patterns from Microsoft Research are now packaged for real-world enterprise use.

__Extensibility by design__ — modular connectors, pluggable memory stores, and declarative agent definitions mean you can integrate it with your own C# applications.

__Enterprise readiness__ — built-in observability, approvals, security, and support for long-running, durable workflows fit right into modern DevOps pipelines.

### Orchestration Options: Flexible or Deterministic
One of the most powerful aspects of Microsoft Agent Framework is that it supports two orchestration styles side by side:

__Agent Orchestration__ — LLM-driven reasoning, dynamic collaboration, and open-ended problem solving.

__Workflow Orchestration__ — Business-logic-driven, deterministic workflows that are repeatable and reliable for enterprise processes.

As a .NET developer, this means you can choose the right orchestration strategy depending on whether your application needs flexibility for creative tasks or structured reliability for business-critical workflows.


To really understand how the __Microsoft Agent Framework__ fits into a developer workflow, let’s look at a practical example. While many developers start with cloud-based LLMs like OpenAI or Azure OpenAI, there are times when running models locally is the better choice. Local experimentation gives you greater privacy, full developer control, consistent reproducibility, and the ability to work entirely offline. That’s where __LM Studio__ comes in—it provides an easy way to run powerful open-source models on your machine with an OpenAI-compatible API, making it a perfect companion for building and testing agents in .NET.

### What is LM Studio?

[LM Studio](https://lmstudio.ai/) is a desktop application that allows you to run open-source LLMs locally on your machine. It provides a clean UI to download, configure, and experiment with models such as Qwen, LLaMA, Mistral, and others — without requiring cloud APIs.

One of the best parts: LM Studio can expose an OpenAI-compatible REST API, which means your .NET applications can talk to local models just like they would with OpenAI or Azure OpenAI Service.

LM Studio maintains a [catalog](https://lmstudio.ai/models) of models that are optimized and customized for the application. However, you can use any GGUF models from Hugging Face.

### Install LM Studio

To install LM Studio, follow these steps:

1. Visit the [LM Studio website](https://lmstudio.ai/) and download the latest version for your operating system.
2. Follow the installation instructions provided on the website.
3. Once installed, launch LM Studio and start experimenting with local LLMs!

### Enable OpenAI-Compatible API & Run your first model
To expose OpenAI compatible API, swich to `Power User` mode and Start the server. You can also tweak the settings as per your requirements but make sure `Just-in-Time Model Loading` is enabled. When this is enabled, if a request specified a model that is not loaded, it will be automatically loaded and used. 



<figure class="post-figure center nocaption fancybox">
  <img src="/images/semantic-kernel/lmstudio_power_user_mode.gif" alt="lmstudio_power_user_mode" loading="lazy" />
  
</figure>



This will expose OpenAI API compatible endpoint on `http://localhost:11435`. Copy or note the server URL — you’ll use it in your application.

### Create a .NET Console Application
Now, let’s create a simple .NET console application that uses the Microsoft Agent Framework to interact with a local LLM via LM Studio.
1. Open your terminal or command prompt. Create a new console app targeting .NET 10:
    ```bash
    dotnet new console -n AgentFrameworkLMStudioDemo -f net10.0
    cd AgentFrameworkLMStudioDemo
    ```
2. Add the necessary NuGet packages for Microsoft Agent Framework and any other dependencies:
    ```bash
    dotnet add package Microsoft.Agents.AI.OpenAI
    ```
3. Restore the packages:
    ```bash
    dotnet restore
    ```

### Write Your First Agent
Open the `Program.cs` file and replace its contents with the following code:

```csharp
using Microsoft.Agents.AI;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;

var endPoint = Environment.GetEnvironmentVariable("OPENAI_ENDPOINT") ?? "http://localhost:11435/v1";
var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") ?? "apiKey";
var model = Environment.GetEnvironmentVariable("OPENAI_MODEL") ?? "qwen/qwen3-4b-2507";

const string JokerName = "Joker";
const string JokerInstructions = "You are good at telling jokes.";

// Create an agent backed by LM Studio
AIAgent agent = new OpenAIClient(
        new ApiKeyCredential(apiKey),
        new OpenAIClientOptions { Endpoint = new Uri(endPoint) })
    .GetChatClient(model)
    .CreateAIAgent(JokerInstructions, JokerName);

// Example chat message
UserChatMessage chatMessage = new("Tell me a joke about a pirate.");

// Non-streaming invocation
ChatCompletion chatCompletion = await agent.RunAsync([chatMessage]);
Console.WriteLine("Non-streaming response:");
Console.WriteLine(chatCompletion.Content.Last().Text);

// Streaming invocation
Console.WriteLine("\nStreaming response:");
var completionUpdates = agent.RunStreamingAsync([chatMessage]);
await foreach (StreamingChatCompletionUpdate completionUpdate in completionUpdates)
{
    if (completionUpdate.ContentUpdate.Count > 0)
    {
        Console.Write(completionUpdate.ContentUpdate[0].Text);
    }
}
```
### Run the Application
Before running the application, ensure that LM Studio is running and the OpenAI-compatible API is enabled.
Set the necessary environment variables for the API endpoint, API key (for LM Studio, API Key is not needed, however to make it work with other OpenAI APIs, you need to set a dummy one), and model name. You can do this in your terminal:

```bash
export OPENAI_ENDPOINT="http://localhost:11435/v1"
export OPENAI_API_KEY="api-Key"
export OPENAI_MODEL="qwen/qwen3-4b-2507"
```
Now, run your application:

```bash
dotnet run
```
You should see the agent generate a pirate joke by the local LLM running in LM Studio! — first via a normal response, then streamed word by word.

### Big Picture: From Local Testing to Enterprise Deployment
With Microsoft Agent Framework, .NET developers no longer need to choose between the stability of Semantic Kernel and the innovative orchestration from AutoGen—both come together in a single, unified SDK. Whether you’re experimenting locally with LM Studio or deploying enterprise-ready applications, the framework empowers you to combine flexible Agent Orchestration with deterministic Workflow Orchestration.

The result is a foundation that supports your journey from prototype to production, bringing open standards, extensibility, and enterprise durability into every stage of your agentic applications.

This post focused on getting started with a single agent in LM Studio, but we’re just scratching the surface. In upcoming blogs, we’ll dive into __multi-agent collaboration__, __workflow orchestration__, and __enterprise integration patterns__—so you’ll see how to scale from simple examples to sophisticated agent ecosystems running in .NET.

