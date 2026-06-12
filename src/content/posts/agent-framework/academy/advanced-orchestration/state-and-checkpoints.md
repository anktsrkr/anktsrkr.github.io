---
title: State & Checkpoints
date: '2026-06-06T21:19:08.642Z'
description: Ensure Jordan's triage assembly line never loses data by managing shared state and checkpointing execution.
featured: false
draft: false
toc: true
series: Advanced Orchestration
seriesOrder: 3
thumbnailImage: /images/agent-framework/aflogo.png
thumbnailImagePosition: left
shareImage: /images/agent-framework/aflogo.png
sourceUrl: 'https://microsoft-agent-framework.github.io/learn/advanced-orchestration/state-and-checkpoints/'
sourceCodeUrl: 'https://github.com/microsoft-agent-framework/microsoft-agent-framework.github.io/blob/main/src/content/tutorials/advanced-orchestration/03-state-and-checkpoints.mdx'
sourceName: Microsoft Agent Framework Tutorial Blog
sourcePath: src/content/tutorials/advanced-orchestration/03-state-and-checkpoints.mdx
crosspost: true
difficulty: Advanced
time: 20 min
provider: Azure OpenAI
hosting: Console app
categories:
  - Agent Framework
  - AI
  - Advanced Orchestration
tags:
  - agent-framework
  - advanced-orchestration
  - shared-state
  - state-isolation
  - checkpoints
  - rehydration
keywords:
  - Microsoft Agent Framework
  - Agent Framework
  - Shared State
  - State Isolation
  - Checkpoints
  - Rehydration
comments: true
showSocial: true
---
<div class="solid-callout solid-callout-info mb-10">
  <p class="font-bold text-indigo-900 mb-2 text-base">ℹ️ Note on Scope</p>
  <p class="text-sm text-indigo-900/80 leading-relaxed m-0">
    This module is intended to provide a conceptual overview and ensure completeness of the orchestration pillars. A detailed, hands-on walkthrough of state management and checkpointing implementation is part of a separate, specialized learning path.
  </p>
</div>

## Overview

Jordan Miller's triage workflow is highly effective, but Taylor Vance has a new concern: *"What happens if the service restarts while the agent is reasoning? Or what if multiple executors need access to the same giant telemetry file without passing it through every single edge?"*

In real-world applications, managing data and recovering from interruptions are critical. Without proper state isolation, data can leak between different workflow executions. Without checkpoints, a crashed process means starting the triage all over again.

In this module, we will implement **Shared State** and **Checkpoints** to make Jordan's workflow resilient and production-ready.

## System Anatomy

<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-10">
  <!-- Workflows (Mastered) -->
  <div class="p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 shadow-sm opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
    <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-lg mb-3 border border-slate-100">🔄</div>
    <div class="font-bold text-slate-900 mb-0.5 text-xs">Workflows</div>
    <p class="text-[10px] leading-relaxed text-slate-500">Graph execution.</p>
  </div>

  <!-- Executors (Mastered) -->
  <div class="p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 shadow-sm opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
    <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-lg mb-3 border border-slate-100">⚙️</div>
    <div class="font-bold text-slate-900 mb-0.5 text-xs">Executors</div>
    <p class="text-[10px] leading-relaxed text-slate-500">Processing units.</p>
  </div>

  <!-- Edges (Mastered) -->
  <div class="p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 shadow-sm opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
    <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-lg mb-3 border border-slate-100">🔀</div>
    <div class="font-bold text-slate-900 mb-0.5 text-xs">Edges</div>
    <p class="text-[10px] leading-relaxed text-slate-500">Message routing.</p>
  </div>

  <!-- Events (Mastered) -->
  <div class="p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 shadow-sm opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
    <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-lg mb-3 border border-slate-100">📊</div>
    <div class="font-bold text-slate-900 mb-0.5 text-xs">Events</div>
    <p class="text-[10px] leading-relaxed text-slate-500">Observability.</p>
  </div>

  <!-- State (Active) -->
  <div class="p-4 rounded-xl bg-white border-2 border-indigo-500 shadow-md relative overflow-hidden transition-all hover:-translate-y-1">
    <div class="absolute top-0 right-0 px-1.5 py-0.5 bg-indigo-500 text-[8px] font-black text-white rounded-bl-lg tracking-tighter uppercase">Building</div>
    <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-lg mb-3 border border-indigo-100">💾</div>
    <div class="font-bold text-slate-900 mb-0.5 text-xs">State</div>
    <p class="text-[10px] leading-relaxed text-slate-600 font-medium">Resiliency.</p>
  </div>

  <!-- Hosting (Upcoming) -->
  <div class="p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 shadow-sm opacity-50 grayscale transition-all relative overflow-hidden hover:grayscale-0 hover:opacity-100">
    <div class="absolute top-0 right-0 px-1.5 py-0.5 bg-amber-500 text-[8px] font-black text-white rounded-bl-lg tracking-tighter uppercase">Upcoming</div>
    <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-lg mb-3 border border-slate-100">☁️</div>
    <div class="font-bold text-slate-900 mb-0.5 text-xs">Hosting</div>
    <p class="text-[10px] leading-relaxed text-slate-500">Service boundary.</p>
  </div>
</div>

## Managing Workflow State

State allows multiple executors within a workflow to access and modify common data without relying on direct message passing. This is essential when passing massive payloads (like a 50MB log file) between executors is inefficient.

<div class="solid-callout solid-callout-info mb-8">
  <p class="font-bold text-indigo-900 mb-2 text-base">🛡️ State Isolation</p>
  <p class="text-sm text-indigo-900/80 leading-relaxed m-0">
    When building workflows, it's critical to ensure <strong>State Isolation</strong>. If you reuse the same <code>WorkflowBuilder</code> or Executor instances across multiple requests, their mutable internal state will be shared, leading to data corruption. Always create a new workflow instance (and new executors) for each request, or ensure your executors implement <code>IResettableExecutor</code>.
  </p>
</div>

### Writing and Reading State

Executors can safely interact with the shared workflow context using `QueueStateUpdateAsync` and `ReadStateAsync`.

```csharp
internal sealed class FetchTelemetryExecutor() : Executor<string, string>("FetchTelemetry")
{
    public override async ValueTask<string> HandleAsync(string service, IWorkflowContext context, CancellationToken ct = default)
    {
        string rawLogs = "[Massive log payload...]";
        string logId = Guid.NewGuid().ToString("N");

        // Store the large payload in shared state instead of passing it downstream
        await context.QueueStateUpdateAsync(logId, rawLogs, scopeName: "IncidentLogs", ct);
        
        return logId; // Only pass the ID to the next executor
    }
}

internal sealed class TriageAgentExecutor() : Executor<string, string>("TriageAgent")
{
    public override async ValueTask<string> HandleAsync(string logId, IWorkflowContext context, CancellationToken ct = default)
    {
        // Retrieve the payload using the ID
        var rawLogs = await context.ReadStateAsync<string>(logId, scopeName: "IncidentLogs", ct);
        
        return "PRIORITY: P0"; 
    }
}
```

## Checkpointing Execution

Checkpoints allow you to save the state of a workflow at specific points during its execution and resume from those points later. This is vital for long-running workflows to avoid losing progress in case of failures.

Checkpoints are created at the end of each **superstep** (after all executors in that step finish). A checkpoint captures:
*   The current state of all executors
*   Pending messages for the next superstep
*   Shared states

### <span class="step-pill">1</span> Setup the Checkpoint Manager

To enable checkpointing, you must provide a `CheckpointManager` when running the workflow. The Agent Framework provides multiple storage providers depending on your durability needs:

*   **In-Memory**: Keeps checkpoints in process memory (best for local testing).
*   **File**: Persists checkpoints to a local directory (survives process restarts).
*   **Azure Cosmos DB**: Persists to NoSQL (best for production/distributed systems).

Here is how Jordan updates the `Program.cs` execution to use an in-memory checkpoint manager:

```csharp
using Microsoft.Agents.AI.Workflows;

// 1. Create a checkpoint manager
CheckpointManager checkpointManager = CheckpointManager.CreateInMemory();

// 2. Run the workflow with checkpointing enabled
StreamingRun run = await InProcessExecution
    .RunStreamingAsync(workflow, "checkout failures", checkpointManager);

await foreach (WorkflowEvent evt in run.WatchStreamAsync())
{
    if (evt is SuperStepCompletedEvent stepCompleted)
    {
        // A checkpoint is successfully saved after each superstep
        CheckpointInfo? cp = stepCompleted.CompletionInfo?.Checkpoint;
        ConsoleTheme.Muted($"[CHECKPOINT] Step complete. Saved state: {cp?.CheckpointId}");
    }
}
```

### <span class="step-pill">2</span> Making Executors Checkpoint-Aware

To ensure that an executor's custom internal state is saved, it must override `OnCheckpointingAsync`. To restore that state, it overrides `OnCheckpointRestoredAsync`.

```csharp
internal sealed partial class TriageSyncExecutor() : Executor<string, string>("TriageSync")
{
    private const string StateKey = "TriageSyncState";
    private int _messagesProcessed = 0;

    public override ValueTask<string> HandleAsync(string message, IWorkflowContext context, CancellationToken ct = default)
    {
        _messagesProcessed++;
        return ValueTask.FromResult("Processed");
    }

    // Save custom state to the checkpoint
    protected override ValueTask OnCheckpointingAsync(IWorkflowContext context, CancellationToken ct = default)
    {
        return context.QueueStateUpdateAsync(StateKey, _messagesProcessed, ct: ct);
    }

    // Restore custom state from the checkpoint
    protected override async ValueTask OnCheckpointRestoredAsync(IWorkflowContext context, CancellationToken ct = default)
    {
        _messagesProcessed = await context.ReadStateAsync<int>(StateKey, ct: ct);
    }
}
```

## Resuming and Rehydrating

If Taylor's server crashes during an incident, they don't want to re-fetch telemetry. They want to resume from the exact last saved superstep.

### Resuming on the Same Instance

You can resume a paused workflow directly if you still have the `StreamingRun` object in memory:

```csharp
// Get a previous checkpoint
CheckpointInfo savedCheckpoint = run.Checkpoints.Last();

// Restore and continue execution
await run.RestoreCheckpointAsync(savedCheckpoint);
await foreach (WorkflowEvent evt in run.WatchStreamAsync())
{
    // ... handling resumed events
}
```

### Rehydrating into a New Instance

If the server restarted, the workflow object is gone, but the checkpoint data persists (if using File or Cosmos DB storage). You can rehydrate the workflow entirely:

```csharp
// In a new process/server...
// (Assuming a FileCheckpointStorage implementation exists or similar approach)
// CheckpointManager manager = CheckpointManager.CreateFileStorage("/path/to/checkpoints");
// CheckpointInfo lastCp = await manager.GetLatestCheckpointAsync("IncidentTriage");

// Re-build the workflow topology
// Workflow newWorkflow = builder.Build();

// Resume execution from the loaded checkpoint
// StreamingRun resumedRun = await InProcessExecution
//     .ResumeStreamingAsync(newWorkflow, lastCp, manager);
```

<div class="solid-callout solid-callout-warning my-8">
  <p class="font-bold text-amber-900 mb-2 text-sm">⚠️ Security Reminder</p>
  <p class="text-xs text-amber-900/80 leading-relaxed">
    Checkpoint storage is a trust boundary. Never load checkpoints from untrusted or potentially tampered sources. Ensure the storage location (File or Cosmos DB) is secured with appropriate access controls.
  </p>
</div>

## Summary & Next Steps

You've shown Jordan and Taylor how to build a resilient, stateful automation system. By leveraging **Shared State** for heavy payloads and **Checkpoints** for fault tolerance, the triage workflow is now robust enough for production.

In the **[next tutorial](/post/agent-framework/academy/advanced-orchestration/host-your-workflow/)**, we will take this resilient assembly line and host it as a scalable API using Azure Functions.
