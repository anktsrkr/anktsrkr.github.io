---
title: Expose Your Agent via API
date: '2026-06-06T21:19:08.642Z'
description: Take Jordan Miller's incident triage assistant out of the terminal and host it as a scalable service.
featured: false
draft: false
toc: true
series: Agent Essentials
seriesOrder: 5
thumbnailImage: /images/agent-framework/aflogo.png
thumbnailImagePosition: left
shareImage: /images/agent-framework/aflogo.png
sourceUrl: 'https://microsoft-agent-framework.github.io/learn/agent-essentials/host-your-agent/'
sourceCodeUrl: 'https://github.com/microsoft-agent-framework/microsoft-agent-framework.github.io/blob/main/src/content/tutorials/agent-essentials/05-host-your-agent.mdx'
sourceName: Microsoft Agent Framework Tutorial Blog
sourcePath: src/content/tutorials/agent-essentials/05-host-your-agent.mdx
crosspost: true
difficulty: Intermediate
time: 30 min
provider: Azure OpenAI
hosting: Azure Functions
categories:
  - Agent Framework
  - AI
  - Agent Essentials
tags:
  - agent-framework
  - agent-essentials
  - hosting
  - durable-agents
  - azure-functions
keywords:
  - Microsoft Agent Framework
  - Agent Framework
  - Hosting
  - Durable Agents
  - Azure Functions
comments: true
showSocial: true
---
## Overview

Jordan Miller's assistant is now highly capable: it has a defined **Persona**, a reasoning **Brain**, external **Tools**, and persistent **Memory**. However, it currently lives only in a local console window. To be truly useful, it needs to be accessible by other systems—Slack bots, monitoring dashboards, or mobile apps.

In this final module of the **Agent Essentials** path, we will host the assistant as a **Service** using Azure Functions. This transforms Jordan's local logic into a scalable API endpoint that maintains conversation state automatically through the **Durable Task Framework**.

## Agent Anatomy

We have reached the fifth and final pillar: **Hosting**. This is the bridge that turns a script into a professional, distributed application.

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-10">
  <!-- Persona (Mastered) -->
  <div class="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 shadow-sm opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100 animate-fade-in">
    <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl mb-4 border border-slate-100">🎭</div>
    <div class="font-bold text-slate-900 mb-1 text-sm">Persona</div>
    <p class="text-[11px] leading-relaxed text-slate-500">Jordan's on-call identity.</p>
  </div>

  <!-- Brain (Mastered) -->
  <div class="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 shadow-sm opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100 animate-fade-in animate-delay-1">
    <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl mb-4 border border-slate-100">🧠</div>
    <div class="font-bold text-slate-900 mb-1 text-sm">Brain</div>
    <p class="text-[11px] leading-relaxed text-slate-500">Reasoning about alerts.</p>
  </div>

  <!-- Tools (Mastered) -->
  <div class="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 shadow-sm opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100 animate-fade-in animate-delay-2">
    <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl mb-4 border border-slate-100">🛠️</div>
    <div class="font-bold text-slate-900 mb-1 text-sm">Tools</div>
    <p class="text-[11px] leading-relaxed text-slate-500">External capabilities.</p>
  </div>

  <!-- Memory (Mastered) -->
  <div class="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 shadow-sm opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100 animate-fade-in animate-delay-3">
    <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl mb-4 border border-slate-100">💾</div>
    <div class="font-bold text-slate-900 mb-1 text-sm">Memory</div>
    <p class="text-[11px] leading-relaxed text-slate-500">State and persistence.</p>
  </div>

  <!-- Hosting (Active) -->
  <div class="p-5 rounded-2xl bg-white border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 transition-all hover:-translate-y-1 relative overflow-hidden animate-fade-in animate-delay-4">
    <div class="absolute top-0 right-0 px-2 py-0.5 bg-indigo-500 text-[9px] font-black text-white rounded-bl-lg tracking-tighter uppercase">Building</div>
    <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl mb-4 border border-indigo-100">☁️</div>
    <div class="font-bold text-slate-900 mb-1 text-sm">Hosting</div>
    <p class="text-[11px] leading-relaxed text-slate-600 font-medium">Exposing as a service.</p>
  </div>
</div>

<div class="premium-gradient border border-indigo-100 rounded-3xl p-8 my-12 shadow-sm relative overflow-hidden animate-fade-in animate-delay-4">
  <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
  <div class="flex gap-5 relative z-10">
    <div class="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </div>
    <div>
      <h4 class="text-indigo-950 font-black text-lg tracking-tight mb-2">Why Durable Agents?</h4>
      <p class="text-sm leading-relaxed text-indigo-900/70 max-w-2xl">
        In the previous modules, we used a local console app. If that app crashed or the network blipped during an LLM call, the state was lost. By hosting on <strong>Azure Functions</strong> with <strong>Durable Task</strong>, your agent becomes "durable." It can pause execution while waiting for an LLM response and resume exactly where it left off, ensuring reliable, multi-turn conversations even across server restarts.
      </p>
    </div>
  </div>
</div>

## Setup Your Infrastructure

Hosting an agent requires a **Durable Task Scheduler (DTS)** to manage the state of the conversation. This ensures that Jordan's assistant remembers the conversation history regardless of the underlying server's lifecycle.

<div class="flex items-center gap-3 my-12 opacity-50">
  <div class="h-[1px] flex-1 bg-slate-200"></div>
  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Hosting Architecture</span>
  <div class="h-[1px] flex-1 bg-slate-200"></div>
</div>

<div class="w-full bg-slate-50/50 rounded-[2rem] p-6 md:p-10 border border-slate-100/80 my-10 transition-all hover:bg-slate-50">
  
  ```mermaid
  graph LR
      Client(["HTTP Client"]) -- "POST /run" --> Func["Azure Function"]
      Func -- "1. Load" --> DTS[("Durable Task")]
      Func -- "2. Execute" --> Brain["🧠 LLM Brain"]
      Brain -- "3. Response" --> Func
      Func -- "4. Save" --> DTS
      Func -- "JSON" --> Client
      
      style Func fill:#f9f9ff,stroke:#6366f1,stroke-width:2px
      style DTS fill:#f9f9ff,stroke:#6366f1,stroke-width:2px
      style Brain fill:#e0e7ff,stroke:#4338ca,stroke-width:2px
  ```
  
  <p class="text-xs text-slate-400 mt-6 italic text-center">The request flow through a stateful, hosted agent service.</p>
</div>

<details class="premium-details my-8">
  <summary class="premium-summary">
    <div class="flex items-center gap-3 mb-1">
      <span class="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-md">Prerequisite</span>
      <span class="summary-title text-indigo-950 font-black">Infrastructure: Durable Task Scheduler (DTS)</span>
    </div>
    <span class="summary-subtitle text-slate-500 text-xs">Essential setup for stateful agent hosting</span>
  </summary>
  <div class="premium-details-content">
    <p class="text-sm text-slate-600 mb-6">
      The Agent Framework uses the <strong>Durable Task Scheduler (DTS)</strong> to manage the state and coordination of your agents.
    </p>

    <div class="solid-callout solid-callout-info mb-6">
      <p class="font-bold text-indigo-900 mb-2 text-xs uppercase tracking-wider">Configuration: host.json</p>
      <p class="text-[11px] text-indigo-900/60 mb-3">Add the following to your project's <code>host.json</code> to enable the Durable Task extension:</p>

```json
{
  "extensions": {
    "durableTask": {
      "storageProvider": {
        "type": "azureManaged",
        "connectionStringName": "DurableTaskSchedulerConnectionString"
      }
    }
  }
}
```
    </div>

    
      

#### Local Emulator (Docker)

<p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">1. Start the Emulator</p>
<div class="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-800 shadow-inner group relative overflow-hidden">
  <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
    <div class="flex gap-1.5">
      <div class="w-2 h-2 rounded-full bg-red-500/40"></div>
      <div class="w-2 h-2 rounded-full bg-amber-500/40"></div>
      <div class="w-2 h-2 rounded-full bg-emerald-500/40"></div>
    </div>
    <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">DTS Emulator</span>
  </div>
  <code class="text-indigo-300 text-xs block leading-relaxed break-all font-mono">
    docker run -p 8080:8080 -p 8082:8082 mcr.microsoft.com/durabletask/scheduler-emulator:latest
  </code>
  <div class="mt-4 flex items-center gap-6">
    <div class="flex items-center gap-2">
      <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
      <span class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Port 8080: gRPC API</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
      <span class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Port 8082: Dashboard</span>
    </div>
  </div>
</div>

<p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">2. Connection String</p>
<p class="text-[11px] text-slate-500 mb-2">Add this to your <code class="text-[10px] bg-slate-100 px-1 rounded text-indigo-600 font-custom">local.settings.json</code>:</p>
<code class="block py-3 px-4 bg-slate-50 rounded-xl border border-slate-200 text-indigo-600 font-mono text-[11px]">"DurableTaskSchedulerConnectionString": "Endpoint=http://localhost:8080;Authentication=None"</code>


      

#### Azure (Cloud)

<p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">1. Provision Resource</p>
<p class="text-[11px] text-slate-500 mb-4">Deploy a <strong>Durable Task Scheduler</strong> instance via the Azure Portal or Bicep templates.</p>
<p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">2. Assign Permissions</p>
<p class="text-[11px] text-slate-500 mb-4">Enable <strong>Managed Identity</strong> on your Function App and assign it the <code class="text-[10px] bg-slate-100 px-1 rounded text-indigo-600 font-custom">Durable Task Data Contributor</code> role on the DTS resource.</p>
<p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">3. Connection String</p>
<p class="text-[11px] text-slate-500 mb-2">Set this in your App Configuration or <code class="text-[10px] bg-slate-100 px-1 rounded text-indigo-600 font-custom">local.settings.json</code>:</p>
<code class="block mt-2 py-2 px-3 bg-slate-100 rounded text-indigo-600 font-mono text-[10px]">"DurableTaskSchedulerConnectionString": "Endpoint=https://your-scheduler.durabletask.io;Authentication=ManagedIdentity"</code>


    

    <div class="solid-callout solid-callout-info mt-6">
      <p class="font-bold text-indigo-900 mb-2 text-sm">🛠️ Tooling: Azure Functions Core Tools</p>
      <p class="text-xs text-indigo-900/80 leading-relaxed">
        To scaffold and run your agent host, you need the <strong>Azure Functions Core Tools (v4.x)</strong>. If you don't have them yet, [follow the official installation guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local) for your platform.
      </p>
    </div>
  </div>
</details>

<div class="solid-callout solid-callout-info my-10">
  <p class="font-bold text-indigo-900 mb-2 text-sm">🌐 Choosing Your Hosting Model</p>
  <p class="text-xs text-indigo-900/80 leading-relaxed font-medium">
    The <strong>Agent Framework</strong> leverages the Durable Task engine, giving you two primary hosting paths depending on your infrastructure needs:
  </p>
  <ul class="text-[11px] text-indigo-900/70 list-disc ml-4 mt-2 space-y-1">
    <li><strong>Azure Functions (Durable Functions):</strong> What we use here. It offers deep Azure integration, built-in HTTP management, and flexible storage options.</li>
    <li><strong>Standalone SDKs:</strong> Ideal for self-hosting on any platform (Kubernetes, IoT Edge, etc.) where you want to manage the host yourself.</li>
  </ul>
  <p class="text-xs text-indigo-900/80 mt-3 leading-relaxed">
    [Learn more about choosing an orchestration framework](https://learn.microsoft.com/en-us/azure/durable-task/common/choose-orchestration-framework).
  </p>
</div>

### <span class="step-pill">1</span> Initialize the Project

First, create a new Azure Functions project using the **Azure Functions Core Tools**. We will use the **Isolated Worker Model**, which is the modern standard for .NET functions.

```bash
func init IncidentTriage.Host --worker-runtime dotnet-isolated --target-framework net10.0
cd IncidentTriage.Host
```

### <span class="step-pill">2</span> Install required packages

We focus on the hosting bridge and the worker extensions required for stateful execution.


  

#### OpenAI Compatible (LM Studio)

```bash
dotnet add package Microsoft.Agents.AI.Hosting.AzureFunctions
dotnet add package Microsoft.Agents.AI.OpenAI
dotnet add package Microsoft.Azure.Functions.Worker.Extensions.DurableTask.AzureManaged
dotnet add package Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore
dotnet add package OpenAI
dotnet add package Microsoft.Extensions.AI
dotnet restore
```

<div class="flex items-center gap-3 my-6 opacity-50">
  <div class="h-[1px] flex-1 bg-slate-200"></div>
  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Package Anatomy</span>
  <div class="h-[1px] flex-1 bg-slate-200"></div>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">☁️</span>
      <code class="text-xs font-bold text-indigo-600 break-all">Microsoft.Agents.AI.Hosting.AzureFunctions</code>
    </div>
    <p class="text-xs text-slate-500 leading-relaxed">The hosting bridge. It provides the <code class="text-[10px] bg-slate-100 px-1 rounded">ConfigureDurableOptions</code> extension to register agents as HTTP services.</p>
  </div>
  <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">💾</span>
      <code class="text-xs font-bold text-indigo-600 break-all">Microsoft.Azure.Functions.Worker.Extensions.DurableTask.AzureManaged</code>
    </div>
    <p class="text-xs text-slate-500 leading-relaxed">The worker extension that enables the Function app to talk to the Durable Task Scheduler backend.</p>
  </div>
  <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">🛠️</span>
      <code class="text-xs font-bold text-indigo-600">Microsoft.Extensions.AI</code>
    </div>
    <p class="text-xs text-slate-500 leading-relaxed">Provides the unified .NET abstractions for AI. Required for structured memory and tool metadata in hosted environments.</p>
  </div>
</div>


  

#### Azure OpenAI

```bash
dotnet add package Microsoft.Agents.AI.Hosting.AzureFunctions
dotnet add package Microsoft.Agents.AI.OpenAI
dotnet add package Azure.AI.OpenAI
dotnet add package Microsoft.Azure.Functions.Worker.Extensions.DurableTask.AzureManaged
dotnet add package Microsoft.Azure.Functions.Worker.Extensions.Http.AspNetCore
dotnet add package Azure.Identity
dotnet add package Microsoft.Extensions.AI
dotnet restore
```

<div class="flex items-center gap-3 my-6 opacity-50">
  <div class="h-[1px] flex-1 bg-slate-200"></div>
  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Package Anatomy</span>
  <div class="h-[1px] flex-1 bg-slate-200"></div>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">☁️</span>
      <code class="text-xs font-bold text-indigo-600 break-all">Microsoft.Agents.AI.Hosting.AzureFunctions</code>
    </div>
    <p class="text-xs text-slate-500 leading-relaxed">The hosting bridge. It provides the <code class="text-[10px] bg-slate-100 px-1 rounded">ConfigureDurableOptions</code> extension to register agents as HTTP services.</p>
  </div>
  <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">💾</span>
      <code class="text-xs font-bold text-indigo-600 break-all">Microsoft.Azure.Functions.Worker.Extensions.DurableTask.AzureManaged</code>
    </div>
    <p class="text-xs text-slate-500 leading-relaxed">The worker extension that enables the Function app to talk to the Durable Task Scheduler backend.</p>
  </div>
  <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">🛠️</span>
      <code class="text-xs font-bold text-indigo-600">Microsoft.Extensions.AI</code>
    </div>
    <p class="text-xs text-slate-500 leading-relaxed">Provides the unified .NET abstractions for AI. Required for structured memory and tool metadata in hosted environments.</p>
  </div>
</div>




## Build the Host

### <span class="step-pill">1</span> Register your Agent

In the Azure Functions host, we register the agent logic. This automatically creates a set of HTTP endpoints to interact with the agent.

Replace the contents of `Program.cs` with the following:


  

#### OpenAI Compatible (LM Studio)

```csharp
using Microsoft.Agents.AI;
using Microsoft.Agents.AI.Hosting.AzureFunctions;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Hosting;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using System.ComponentModel;
using System.Text;

// 1. Configure the Provider
var endpoint = Environment.GetEnvironmentVariable("OPENAI_ENDPOINT") ?? "http://localhost:1234/v1";
var modelName = Environment.GetEnvironmentVariable("OPENAI_MODEL_NAME") ?? "google/gemma-4-e4b";
var chatClient = new OpenAIClient(new ApiKeyCredential("dummy"), new OpenAIClientOptions { Endpoint = new Uri(endpoint) })
    .GetChatClient(modelName);

// 2. Initialize Agent with Memory Provider and Tools
var operatorMemory = new OperatorMemory(chatClient.AsIChatClient());
AIAgent triageAgent = chatClient.AsAIAgent(new ChatClientAgentOptions
{
    Name = "TriageAgent",
    ChatOptions = new()
    {
        Instructions = """
            You are an enterprise incident triage assistant.
            Summarize the incident, identify likely severity, 
            and suggest the next investigation step.
            Always address the operator by their name and use their role to tailor your response.
            Keep answers concise and operational.
            """,
        Tools = [
            AIFunctionFactory.Create(GetServiceStatus, "GetServiceStatus"),
            AIFunctionFactory.Create(GetOnCallEngineer, "GetOnCallEngineer")
        ]
    },
    AIContextProviders = [operatorMemory]
});

// 3. Register with the Function Host
var builder = FunctionsApplication.CreateBuilder(args);
builder.ConfigureFunctionsWebApplication();

builder.ConfigureDurableOptions(options =>
{
    options.Agents.AddAIAgent(triageAgent, true, false);
});

using IHost app = builder.Build();
app.Run();

// --- Tool Definitions (from Module 2) ---

[Description("Gets the current health status for an enterprise service.")]
static string GetServiceStatus(
    [Description("The service name to check, such as checkout, payments, or inventory.")] string serviceName)
{
    return serviceName.ToLowerInvariant() switch
    {
        "checkout" => "Checkout is DEGRADED in West Europe. P95 latency is 4.8s. Payment retries are elevated.",
        "payments" => "Payments is HEALTHY. No active regional alerts.",
        "inventory" => "Inventory is HEALTHY. Last sync 2 minutes ago.",
        _ => $"{serviceName} has no active status record in the demo store."
    };
}

[Description("Gets the name of the engineer currently on-call.")]
static string GetOnCallEngineer(
    [Description("The service name to check.")] string serviceName) => "Taylor Vance (@tvance)";

// --- Memory Provider Implementation ---

internal sealed class OperatorMemory(IChatClient chatClient) : AIContextProvider
{
    private readonly ProviderSessionState<OperatorContext> _sessionState = new(_ => new OperatorContext(), nameof(OperatorMemory));
    public override IReadOnlyList<string> StateKeys => [_sessionState.StateKey];

    public OperatorContext GetContext(AgentSession session) => _sessionState.GetOrInitializeState(session);

    protected override async ValueTask StoreAIContextAsync(InvokedContext context, CancellationToken ct)
    {
        var op = _sessionState.GetOrInitializeState(context.Session);
        if ((op.Name is null || op.Role is null || op.IncidentId is null) && context.RequestMessages.Any(m => m.Role == ChatRole.User))
        {
            var result = await chatClient.GetResponseAsync<OperatorContext>(context.RequestMessages,
                new ChatOptions { Instructions = "Extract operator name, role, and incident ID if present." }, cancellationToken: ct);
            op.Name ??= result.Result.Name;
            op.Role ??= result.Result.Role;
            op.IncidentId ??= result.Result.IncidentId;
        }
        _sessionState.SaveState(context.Session, op);
    }

    protected override ValueTask<AIContext> ProvideAIContextAsync(InvokingContext context, CancellationToken ct)
    {
        var op = _sessionState.GetOrInitializeState(context.Session);
        var instructions = new StringBuilder();
        if (op.Name != null) instructions.Append($"The operator is {op.Name}, a {op.Role}. ");
        if (op.IncidentId != null)
        {
            // PRIORITY: Injected facts should override conflicting conversation history
            instructions.Append($"The current incident context is {op.IncidentId}. (Priority: Use this ID even if history mentions a different one). ");
        }

        return new ValueTask<AIContext>(new AIContext
        {
            Instructions = instructions.Length > 0 ? instructions.ToString() : "Ask for the operator's name, role, and the incident ID they are triaging."
        });
    }
}

internal sealed class OperatorContext
{
    public string? Name { get; set; }
    public string? Role { get; set; }
    public string? IncidentId { get; set; }
}
```


  

#### Azure OpenAI

```csharp
using Microsoft.Agents.AI;
using Microsoft.Agents.AI.Hosting.AzureFunctions;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Hosting;
using Azure.AI.OpenAI;
using Azure.Identity;
using OpenAI.Chat;
using System.ComponentModel;
using System.Text;

// 1. Configure the Provider
var endpoint = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT")!;
var deploymentName = Environment.GetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT_NAME")!;
var chatClient = new AzureOpenAIClient(new Uri(endpoint), new DefaultAzureCredential()).GetChatClient(deploymentName);

// 2. Initialize Agent with Memory Provider and Tools
var operatorMemory = new OperatorMemory(chatClient.AsIChatClient());
AIAgent triageAgent = chatClient.AsAIAgent(new ChatClientAgentOptions
{
    Name = "TriageAgent",
    ChatOptions = new()
    {
        Instructions = """
            You are an enterprise incident triage assistant.
            Summarize the incident, identify likely severity, 
            and suggest the next investigation step.
            Always address the operator by their name and use their role to tailor your response.
            Keep answers concise and operational.
            """,
        Tools = [
            AIFunctionFactory.Create(GetServiceStatus, "GetServiceStatus"),
            AIFunctionFactory.Create(GetOnCallEngineer, "GetOnCallEngineer")
        ]
    },
    AIContextProviders = [operatorMemory]
});

// 3. Register with the Function Host
var builder = FunctionsApplication.CreateBuilder(args);
builder.ConfigureFunctionsWebApplication();

builder.ConfigureDurableOptions(options =>
{
    options.Agents.AddAIAgent(triageAgent, true, false);
});

using IHost app = builder.Build();
app.Run();

// --- Tool Definitions (from Module 2) ---

[Description("Gets the current health status for an enterprise service.")]
static string GetServiceStatus(
    [Description("The service name to check, such as checkout, payments, or inventory.")] string serviceName)
{
    return serviceName.ToLowerInvariant() switch
    {
        "checkout" => "Checkout is DEGRADED in West Europe. P95 latency is 4.8s. Payment retries are elevated.",
        "payments" => "Payments is HEALTHY. No active regional alerts.",
        "inventory" => "Inventory is HEALTHY. Last sync 2 minutes ago.",
        _ => $"{serviceName} has no active status record in the demo store."
    };
}

[Description("Gets the name of the engineer currently on-call.")]
static string GetOnCallEngineer(
    [Description("The service name to check.")] string serviceName) => "Taylor Vance (@tvance)";

// --- Memory Provider Implementation ---

internal sealed class OperatorMemory(IChatClient chatClient) : AIContextProvider
{
    private readonly ProviderSessionState<OperatorContext> _sessionState = new(_ => new OperatorContext(), nameof(OperatorMemory));
    public override IReadOnlyList<string> StateKeys => [_sessionState.StateKey];

    public OperatorContext GetContext(AgentSession session) => _sessionState.GetOrInitializeState(session);

    protected override async ValueTask StoreAIContextAsync(InvokedContext context, CancellationToken ct)
    {
        var op = _sessionState.GetOrInitializeState(context.Session);
        if ((op.Name is null || op.Role is null || op.IncidentId is null) && context.RequestMessages.Any(m => m.Role == ChatRole.User))
        {
            var result = await chatClient.GetResponseAsync<OperatorContext>(context.RequestMessages,
                new ChatOptions { Instructions = "Extract operator name, role, and incident ID if present." }, cancellationToken: ct);
            op.Name ??= result.Result.Name;
            op.Role ??= result.Result.Role;
            op.IncidentId ??= result.Result.IncidentId;
        }
        _sessionState.SaveState(context.Session, op);
    }

    protected override ValueTask<AIContext> ProvideAIContextAsync(InvokingContext context, CancellationToken ct)
    {
        var op = _sessionState.GetOrInitializeState(context.Session);
        var instructions = new StringBuilder();
        if (op.Name != null) instructions.Append($"The operator is {op.Name}, a {op.Role}. ");
        if (op.IncidentId != null)
        {
            // PRIORITY: Injected facts should override conflicting conversation history
            instructions.Append($"The current incident context is {op.IncidentId}. (Priority: Use this ID even if history mentions a different one). ");
        }

        return new ValueTask<AIContext>(new AIContext
        {
            Instructions = instructions.Length > 0 ? instructions.ToString() : "Ask for the operator's name, role, and the incident ID they are triaging."
        });
    }
}

internal sealed class OperatorContext
{
    public string? Name { get; set; }
    public string? Role { get; set; }
    public string? IncidentId { get; set; }
}
```




<div class="solid-callout solid-callout-warning my-8">
  <p class="font-bold text-amber-900 mb-2 text-sm">⚠️ Configuration Reminder</p>
  <p class="text-xs text-amber-900/80 leading-relaxed">
    Ensure your <code>local.settings.json</code> contains the <code>AZURE_OPENAI_ENDPOINT</code> and <code>AZURE_OPENAI_DEPLOYMENT_NAME</code> variables, as well as the <code>DurableTaskSchedulerConnectionString</code> required for the host to start.
  </p>
</div>

## Try it

Experiment with how the Agent behaves when exposed via a stateful API.


  

#### 📟 API Call

### First Interaction: Start a Thread
Once your host is running, you can talk to Jordan's assistant via any HTTP client. This first call initializes a new conversation thread.

```bash
curl -X POST http://localhost:7071/api/agents/TriageAgent/run \
  -H "Content-Type: text/plain" \
  -d "My name is Jordan. There is a latency spike in the checkout service!"
```

**The Response:** The agent returns the triage summary and a unique thread ID in the headers.

```http
HTTP/1.1 200 OK
Content-Type: text/plain
x-ms-thread-id: 7886412a-6d34-4c71-9ea6-c87a80e5fcd9

Hello Jordan. I've noted the latency spike in Checkout. 
Checking the service status now...
```



  

#### 💾 State Persistence

### Continue the Conversation
Because we are using **Durable Task**, the agent remembers the context of the thread. To continue the same conversation, include the `thread_id` in the query string.

```bash
# Use the ID returned in the x-ms-thread-id header
curl -X POST "http://localhost:7071/api/agents/TriageAgent/run?thread_id=7886412a-6d34-4c71-9ea6-c87a80e5fcd9" \
  -H "Content-Type: text/plain" \
  -d "Who is the on-call engineer for this service?"
```

**The Goal:** Even if you restart the server, the agent will remember that you are **Jordan** and you were discussing the **checkout** service, because the state is persisted in the DTS backend.



  

#### 🛡️ Crash Proof

### Survives System Failures
Because the state is managed by the **Durable Task Scheduler**, your agent is "crash proof." The framework checkpoints the conversation state at every turn.

1. Start a conversation and get a `thread_id`.
2. **Crash the app** (press `Ctrl+C` in the terminal).
3. **Restart the app** and immediately send a follow-up request using the same `thread_id`.

**The Goal:** The agent resumes exactly where it left off. Even if the server dies mid-execution, the Durable Task backend ensures the "brain" state and conversation history are safely recovered, making Jordan's assistant resilient enough for production.




## Summary & Next Steps

Congratulations! You've completed the **Agent Essentials** path. Jordan Miller now has a production-ready assistant that can reason, act, and remember—all hosted as a scalable service.

**What's next?** 
While a single agent is powerful, real-world complexity often requires multiple components working together. In the **[Advanced Orchestration](/post/agent-framework/academy/advanced-orchestration/beyond-agents/)** journey, you'll learn how to move beyond single-turn reasoning and build robust **Compound AI Systems** using Workflows and Orchestrators.
