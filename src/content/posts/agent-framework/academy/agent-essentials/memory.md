---
title: Persist Conversations and Smart Memory
date: '2026-06-06T21:19:08.642Z'
description: Learn to save conversation history across restarts and implement structured memory using AIContextProviders.
featured: false
draft: false
toc: true
series: Agent Essentials
seriesOrder: 4
thumbnailImage: /images/agent-framework/aflogo.png
thumbnailImagePosition: left
shareImage: /images/agent-framework/aflogo.png
canonicalUrl: 'https://microsoft-agent-framework.github.io/learn/agent-essentials/memory/'
sourceUrl: 'https://microsoft-agent-framework.github.io/learn/agent-essentials/memory/'
sourceCodeUrl: 'https://github.com/microsoft-agent-framework/microsoft-agent-framework.github.io/blob/main/src/content/tutorials/agent-essentials/04-memory.mdx'
sourceName: Microsoft Agent Framework Tutorial Blog
sourcePath: src/content/tutorials/agent-essentials/04-memory.mdx
crosspost: true
difficulty: Beginner
time: 20 min
provider: Azure OpenAI
hosting: Console app
categories:
  - Agent Framework
  - AI
  - Agent Essentials
tags:
  - agent-framework
  - agent-essentials
  - session-persistence
  - aicontextprovider
  - structured-memory
keywords:
  - Microsoft Agent Framework
  - Agent Framework
  - Session Persistence
  - AIContextProvider
  - Structured Memory
comments: true
showSocial: true
---
## Overview

In the previous module, **Jordan Miller** gave the agent a "short-term" memory using sessions. However, that memory was volatile—it only lived as long as the application was running. If Jordan restarted the console app, the agent would lose all context of the ongoing incident.

In a real-world outage, investigations often span hours, multiple shifts, and handovers. This guide walks you through implementing **Durable Persistence** and **Structured Memory**. You'll learn how to serialize an **Agent Session** to a file and use an **AIContextProvider** to extract specific facts (like the Incident ID) so that Jordan's assistant remains smart across application restarts.

## Agent Anatomy

We are now completing the "Memory" pillar by moving from volatile history to structured, persistable state.

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

  <!-- Memory (Active) -->
  <div class="p-5 rounded-2xl bg-white border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 transition-all hover:-translate-y-1 relative overflow-hidden animate-fade-in animate-delay-3">
    <div class="absolute top-0 right-0 px-2 py-0.5 bg-indigo-500 text-[9px] font-black text-white rounded-bl-lg tracking-tighter uppercase">Building</div>
    <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl mb-4 border border-indigo-100">💾</div>
    <div class="font-bold text-slate-900 mb-1 text-sm">Memory</div>
    <p class="text-[11px] leading-relaxed text-slate-600 font-medium">State and persistence.</p>
  </div>

  <!-- Hosting (Upcoming) -->
  <div class="p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 shadow-sm opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100 animate-fade-in animate-delay-4">
    <div class="absolute top-0 right-0 px-2 py-0.5 bg-slate-400 text-[9px] font-black text-white rounded-bl-lg tracking-tighter uppercase">Upcoming</div>
    <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl mb-4 border border-slate-100">☁️</div>
    <div class="font-bold text-slate-900 mb-1 text-sm">Hosting</div>
    <p class="text-[11px] leading-relaxed text-slate-500">Exposing as a service.</p>
  </div>
</div>


<div class="premium-gradient border border-indigo-100 rounded-3xl p-8 my-12 shadow-sm relative overflow-hidden animate-fade-in animate-delay-4">
  <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
  <div class="flex gap-5">
    <div class="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    </div>
    <div>
      <h4 class="text-indigo-950 font-black text-lg tracking-tight mb-2">Solving the Context Window</h4>
      <p class="text-sm leading-relaxed text-indigo-900/70 max-w-2xl">
        In the previous module, we learned that the <strong>Context Window</strong> is finite. If you rely only on <strong>Session History</strong>, your token usage grows with every message until the window overflows. <strong>Smart Memory</strong> (via <code>AIContextProvider</code>) solves this. By extracting high-value facts (like the Incident ID) into a compact, structured format, you can provide the agent with essential context that never grows out of control, even in conversations spanning hundreds of turns.
      </p>
    </div>
  </div>
</div>

## Setup your environment

If you are continuing from the previous tutorial, you can use your existing project. Otherwise, follow the steps below to initialize a new one.

<div class="solid-callout solid-callout-info mb-8">
  <p class="font-bold text-indigo-900 mb-3 text-base">📋 Pre-flight Checklist</p>
  <ul class="space-y-2.5 m-0 p-0 list-none text-sm text-indigo-900/80">
    <li class="flex items-center gap-2">🛠️ <strong>.NET 10.0 SDK</strong> installed.</li>
    <li class="flex items-center gap-2">🤖 <strong>AI Provider</strong>: Azure OpenAI or Local (Ollama/LM Studio).</li>
    <li class="flex items-center gap-2">💾 <strong>Persistence</strong>: We will use <code>SerializeSessionAsync</code> to demonstrate state saving.</li>
  </ul>
</div>

### <span class="step-pill">1</span> Install required packages

We are using the same core packages as the previous modules.


  

#### OpenAI Compatible (LM Studio)

```bash
dotnet add package Microsoft.Agents.AI.OpenAI
dotnet add package OpenAI
dotnet add package Microsoft.Extensions.AI
dotnet restore
```

<div class="flex items-center gap-3 my-6 opacity-50">
  <div class="h-[1px] flex-1 bg-slate-200"></div>
  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Package Anatomy</span>
  <div class="h-[1px] flex-1 bg-slate-200"></div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">🔌</span>
      <code class="text-xs font-bold text-indigo-600">Microsoft.Agents.AI.OpenAI</code>
    </div>
    <p class="text-xs text-slate-500 leading-relaxed">The core Agent Framework package. It provides the <code class="text-[10px] bg-slate-100 px-1 rounded">AsAIAgent</code> extension and the base classes for <code class="text-[10px] bg-slate-100 px-1 rounded">AIContextProvider</code>.</p>
  </div>
  <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">🛠️</span>
      <code class="text-xs font-bold text-indigo-600">Microsoft.Extensions.AI</code>
    </div>
    <p class="text-xs text-slate-500 leading-relaxed">Provides the unified .NET abstractions for AI. We use this to describe typed context objects for our memory providers.</p>
  </div>
</div>


  

#### Azure OpenAI

```bash
dotnet add package Microsoft.Agents.AI.OpenAI
dotnet add package Azure.AI.OpenAI
dotnet add package Azure.Identity
dotnet add package Microsoft.Extensions.AI
dotnet restore
```

<div class="flex items-center gap-3 my-6 opacity-50">
  <div class="h-[1px] flex-1 bg-slate-200"></div>
  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Package Anatomy</span>
  <div class="h-[1px] flex-1 bg-slate-200"></div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">🔌</span>
      <code class="text-xs font-bold text-indigo-600">Microsoft.Agents.AI.OpenAI</code>
    </div>
    <p class="text-xs text-slate-500 leading-relaxed">The core Agent Framework package. It provides the <code class="text-[10px] bg-slate-100 px-1 rounded">AsAIAgent</code> extension and the base classes for <code class="text-[10px] bg-slate-100 px-1 rounded">AIContextProvider</code>.</p>
  </div>
  <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xl">🛠️</span>
      <code class="text-xs font-bold text-indigo-600">Microsoft.Extensions.AI</code>
    </div>
    <p class="text-xs text-slate-500 leading-relaxed">Provides the unified .NET abstractions for AI. We use this to describe typed context objects for our memory providers.</p>
  </div>
</div>




## Build the Agent

In this module, you'll evolve your triage agent to track structured operator context—like names and active incident IDs—while implementing durable session persistence to ensure it never forgets a detail, even after a system restart.

Before we dive into the implementation, let's look at the architectural flow that governs how your agent balances volatile chat history with persistent, structured memory:

<div class="flex items-center gap-3 my-12 opacity-50">
  <div class="h-[1px] flex-1 bg-slate-200"></div>
  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Memory Architecture</span>
  <div class="h-[1px] flex-1 bg-slate-200"></div>
</div>

<div class="w-full bg-slate-50/50 rounded-[2rem] p-8 md:p-12 border border-slate-100/80 my-10 flex flex-col items-center transition-all hover:bg-slate-50">
  
  ```mermaid
  graph TD
      User(["User Input"]) --> SessionHistory["Session History<br/>(Volatile Transcript)"]
      SessionHistory --> ContextWindow{"LLM Context Window"}
      
      Provider["AIContextProvider"]
      Store[("session.json")]
      Provider <--> Store
      
      ContextWindow -- "1. Extract Facts" --> Provider
      Provider -- "2. Inject Instructions" --> ContextWindow
      
      ContextWindow --> Assistant(["Agent Response"])
      
      style Provider fill:#f9f9ff,stroke:#6366f1,stroke-width:2px
      style Store fill:#f9f9ff,stroke:#6366f1,stroke-width:2px
      style ContextWindow fill:#e0e7ff,stroke:#4338ca,stroke-width:2px,stroke-dasharray: 5 5
  ```
  
  <p class="text-xs text-slate-400 mt-6 italic">The hybrid flow of volatile history and persistent structured state.</p>
</div>

### <span class="step-pill">1</span> Define the Memory Provider <span class="agent-heading-chip">💾 Memory</span>

The <code>AIContextProvider</code> is the framework's hook for custom memory. We use <code>ProviderSessionState<T></code> to manage the data lifecycle.

Replace `Program.cs` with the following code:


  

#### OpenAI Compatible (LM Studio)

```csharp
using OpenAI;
using OpenAI.Chat;
using Microsoft.Agents.AI;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.AI;
using System.ComponentModel;
using System.IO;
using System.ClientModel;

// 1. Configure the Provider
var endpoint = Environment.GetEnvironmentVariable("OPENAI_ENDPOINT") ?? "http://localhost:1234/v1";
var modelName = Environment.GetEnvironmentVariable("OPENAI_MODEL_NAME") ?? "google/gemma-4-e4b";
var chatClient = new OpenAIClient(new ApiKeyCredential("dummy"), new OpenAIClientOptions { Endpoint = new Uri(endpoint) })
    .GetChatClient(modelName);

// 2. Initialize Agent with Memory Provider and Tools
var operatorMemory = new OperatorMemory(chatClient.AsIChatClient());
AIAgent agent = chatClient.AsAIAgent(new ChatClientAgentOptions
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

// 3. Start a Session and Provide Context
AgentSession session = await agent.CreateSessionAsync();
Console.WriteLine("--- Turn 1: Setting the Incident ---");
Console.WriteLine(await agent.RunAsync("I am triaging the checkout latency incident in West Europe (INC-1042). My name is Jordan and I am the Lead Responder.", session));

// 4. Persistence: Save to File (Survives Restarts)
Console.WriteLine("\n--- Saving Session to Disk ---");
string filePath = "session.json";
JsonElement sessionJson = await agent.SerializeSessionAsync(session);
await File.WriteAllTextAsync(filePath, sessionJson.GetRawText());
Console.WriteLine($"History saved to {filePath}.");

// 5. Rehydration: Load from File (Simulated Restart)
Console.WriteLine("\n--- Simulating App Restart ---");
string savedJson = await File.ReadAllTextAsync(filePath);
JsonElement sessionData = JsonSerializer.Deserialize<JsonElement>(savedJson);
var restoredSession = await agent.DeserializeSessionAsync(sessionData);

Console.WriteLine("--- Turn 2: Recovered Context ---");
Console.WriteLine(await agent.RunAsync("Remind me, which incident am I handling and what is my role?", restoredSession));

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

        return new ValueTask<AIContext>(new AIContext { 
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
using Azure.AI.OpenAI;
using Azure.Identity;
using Microsoft.Agents.AI;
using System.Text;
using System.Text.Json;
using OpenAI.Chat;
using Microsoft.Extensions.AI;
using System.ComponentModel;
using System.IO;

// 1. Configure the Provider
var endpoint = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT")!;
var deploymentName = Environment.GetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT_NAME")!;
var chatClient = new AzureOpenAIClient(new Uri(endpoint), new DefaultAzureCredential()).GetChatClient(deploymentName);

// 2. Initialize Agent with Memory Provider and Tools
var operatorMemory = new OperatorMemory(chatClient.AsIChatClient());
AIAgent agent = chatClient.AsAIAgent(new ChatClientAgentOptions
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

// 3. Start a Session and Provide Context
AgentSession session = await agent.CreateSessionAsync();
Console.WriteLine("--- Turn 1: Setting the Incident ---");
Console.WriteLine(await agent.RunAsync("I am triaging the checkout latency incident in West Europe (INC-1042). My name is Jordan and I am the Lead Responder.", session));

// 4. Persistence: Save to File (Survives Restarts)
Console.WriteLine("\n--- Saving Session to Disk ---");
string filePath = "session.json";
JsonElement sessionJson = await agent.SerializeSessionAsync(session);
await File.WriteAllTextAsync(filePath, sessionJson.GetRawText());
Console.WriteLine($"History saved to {filePath}.");

// 5. Rehydration: Load from File (Simulated Restart)
Console.WriteLine("\n--- Simulating App Restart ---");
string savedJson = await File.ReadAllTextAsync(filePath);
JsonElement sessionData = JsonSerializer.Deserialize<JsonElement>(savedJson);
var restoredSession = await agent.DeserializeSessionAsync(sessionData);

Console.WriteLine("--- Turn 2: Recovered Context ---");
Console.WriteLine(await agent.RunAsync("Remind me, which incident am I handling and what is my role?", restoredSession));

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

        return new ValueTask<AIContext>(new AIContext { 
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




<div class="premium-gradient border border-indigo-100 rounded-3xl p-8 my-12 shadow-sm relative overflow-hidden animate-fade-in animate-delay-4">
  <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
  <div class="relative z-10">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div>
        <h4 class="text-indigo-950 font-black text-lg tracking-tight">Production State Architecture</h4>
        <p class="text-xs text-indigo-900/60 uppercase font-bold tracking-widest">Designing for Scale and Reliability</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Redis Card -->
      <div class="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white shadow-sm hover:shadow-md transition-all">
        <div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl mb-4 border border-red-100">⚡</div>
        <div class="font-bold text-slate-900 mb-1 text-sm">Hot Tier</div>
        <div class="text-[10px] font-black text-red-600 uppercase tracking-tighter mb-3">Redis</div>
        <p class="text-[11px] leading-relaxed text-slate-600">Sub-millisecond retrieval of active sessions. Perfect for agents requiring real-time responsiveness.</p>
      </div>

      <!-- SQL Card -->
      <div class="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white shadow-sm hover:shadow-md transition-all">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4 border border-indigo-100">💾</div>
        <div class="font-bold text-slate-900 mb-1 text-sm">Warm Tier</div>
        <div class="text-[10px] font-black text-indigo-600 uppercase tracking-tighter mb-3">SQL / NoSQL</div>
        <p class="text-[11px] leading-relaxed text-slate-600">Durable, transactional storage for complete message logs, audit trails, and long-term history.</p>
      </div>

      <!-- Blob Card -->
      <div class="p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-white shadow-sm hover:shadow-md transition-all">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-4 border border-amber-100">☁️</div>
        <div class="font-bold text-slate-900 mb-1 text-sm">Cold Tier</div>
        <div class="text-[10px] font-black text-amber-600 uppercase tracking-tighter mb-3">Blob Storage</div>
        <p class="text-[11px] leading-relaxed text-slate-600">Cost-effective storage for large session snapshots, document artifacts, and offline backups.</p>
      </div>
    </div>
    
    <div class="mt-8 pt-6 border-t border-indigo-900/5">
      <p class="text-[11px] italic text-indigo-900/50 leading-relaxed max-w-2xl">
        The Agent Framework is storage-agnostic. As long as you can serialize the session state and restore it later, your agent can pick up exactly where it left off.
      </p>
    </div>
  </div>
</div>



## Try it

Experiment with how the Agent Framework handles structured state and persistence.


  

#### 🧪 The Crash Test

### Simulate a Recovery
To prove persistence, we will simulate a "Fresh Run" where the agent has no memory in RAM, but loads it from disk. 

To understand what's happening under the hood:

<div class="flex items-center gap-3 my-12 opacity-50">
  <div class="h-[1px] flex-1 bg-slate-200"></div>
  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Persistence Lifecycle</span>
  <div class="h-[1px] flex-1 bg-slate-200"></div>
</div>

<div class="w-full bg-slate-50/50 rounded-[2rem] p-8 md:p-12 border border-slate-100/80 my-10 flex flex-col items-center transition-all hover:bg-slate-50">

  ```mermaid
  graph TD
      Session["Active Agent Session"] -- "SerializeSessionAsync" --> JSON["session.json (UTF-8)"]
      JSON -- "File.WriteAllText" --> Disk[("Local Disk")]
      Disk -- "File.ReadAllText" --> JSON_Reloaded["session.json"]
      JSON_Reloaded -- "DeserializeSessionAsync" --> RestoredSession["Restored Agent Session"]

      style Session fill:#e0e7ff,stroke:#4338ca
      style RestoredSession fill:#e0e7ff,stroke:#4338ca
      style Disk fill:#f9f9ff,stroke:#6366f1
  ```

  <p class="text-xs text-slate-400 mt-6 italic">How state survives application restarts and crashes.</p>
</div>

1. Comment out your Turn 1 code (the introduction) in your `Program.cs`.
2. Add these lines to the end of your file:

```csharp
// Load the state from the previous run
string savedJson = await File.ReadAllTextAsync("session.json");
JsonElement sessionData = JsonSerializer.Deserialize<JsonElement>(savedJson);
var restoredSession = await agent.DeserializeSessionAsync(sessionData);

Console.WriteLine("\n--- Fresh Run: Testing Recovered Memory ---");
Console.WriteLine(await agent.RunAsync("Who am I and what incident am I working on?", restoredSession));
```

**The Goal:** The agent will correctly identify you and the incident ID, even though this "fresh" run never heard you introduce yourself.



  

#### 🔍 Inspect the Mind

### Direct State Access
Smart Memory isn't a black box. Your application can read the structured state directly without calling the LLM. Add this to the end of your `Program.cs`:

```csharp
var op = operatorMemory.GetContext(restoredSession);
Console.WriteLine($"\n[APP LOG]: Memory check -> Operator: {op?.Name}, Role: {op?.Role}");
```

**The Goal:** Observe how the application "knows" who Jordan is because the `OperatorMemory` provider extracted that fact into a typed C# object.



  

#### ✍️ Manual Override

### Manipulate the Context
Because the state is stored in a standard C# object, your application can update it programmatically. Try overriding the incident ID:

```csharp
var context = operatorMemory.GetContext(restoredSession);
context.IncidentId = "INC-9999 (PRIORITY OVERRIDE)";

Console.WriteLine("\n--- Turn 3: Manual Override ---");
Console.WriteLine(await agent.RunAsync("Which incident am I handling now?", restoredSession));
```

**The Goal:** The agent will immediately recognize the new ID, proving that `AIContextProvider` can steer the agent even if the chat history contains conflicting information.

<div class="solid-callout solid-callout-info mt-6">
  <p class="font-bold text-indigo-900 mb-2 text-sm">🧠 Pro-Tip: Resolving Fact Conflicts</p>
  <p class="text-xs text-indigo-900/80 leading-relaxed">
    If the agent sees a fact in the <strong>History</strong> (e.g., "I'm handling INC-1042") that contradicts a fact in <strong>Smart Memory</strong> (e.g., "Active Incident: INC-9999"), it might get confused. By adding "Priority" or "Source of Truth" language to your provider's instructions, you ensure your application code always has the final word.
  </p>
</div>




## Summary & Next Steps

Congratulations! You've graduated from basic chat history to a **Durable Enterprise Agent**. 

By combining **Session Serialization** and **AIContextProviders**, you've built an agent that:
- **Remembers** across application restarts.
- **Extracts** structured facts into typed C# objects.
- **Optimizes** its own context window for better performance.

In the **[next tutorial](/post/agent-framework/academy/agent-essentials/host-your-agent/)**, we will conclude this journey by taking Jordan's assistant out of the terminal and **hosting it as a scalable service**.
