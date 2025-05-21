---
title: "Building Blocks of Semantic Kernel" # Title of the blog post.
date: 2025-05-21T06:00:00+01:00 # Date of post creation.
description: "How to use Semantic Kernel in AI development" # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnailImage: "/images/semantic-kernel/sk.png"
thumbnailImagePosition: left
shareImage: "/images/semantic-kernel/sk.png" # Designate a separate image for social media sharing.
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
---
 
Hi Everyone! 
This post is continuation of a series about **{{< hl-text cyan >}}Semantic Kernel{{< /hl-text >}}**. Over the time, I will updated this page with links to individual posts : 

[Getting Started with Semantic Kernel (Part 1)](/post/getting-started-with-semantic-kernel)

[Getting Started with Semantic Kernel (Part 2)](/post/getting-started-with-semantic-kernel-pt-2)

_This Post - Building Blocks of Semantic Kernel_

So far, we have covered the theoretical aspects of Gen AI and LLM. We will continue to explore the theoretical aspects of Semantic Kernel in this post.

Let me reiterate what I have said in [Part 1](/post/getting-started-with-semantic-kernel) **{{< hl-text cyan >}}Semantic Kernel{{< /hl-text >}}** is a **{{< hl-text red >}}development kit{{< /hl-text >}}**.

> As per wikipedia, A ***software development kit (SDK)*** is a collection of software development tools.

In the context of Semantic Kernel, the development kit provides a various frameworks and components that can be used to build AI applications.

### Semantic Kernel Components
 Semantic Kernel provides a set of components that can be used individually or in combination to build AI applications. These components include:

 #### Kernel
Kernel is the core component of Semantic Kernel.  It is basically a dependency container, which has two component `Services` and `Plugins`.

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/kernel.png" title="Kernel" >}}


Let's take a look at the two components of Kernel:

| Component        | Description        |
| ----------- | ----------- |
| Services      | Just like any other `Services` in .NET project. It has _Logging_, _Cache_, _HttpClient_ etc. capabilities. The only difference is that these `Services` also consists of AI specific services, such as _ChatCompletion_ , _Vector Store_ etc. services via connectors. |
| Plugins      |These are components that are used to extend the functionality of LLM. We will explore this topic in more detail in future posts.|

 #### Connectors
 Connectors are the components that are used to connect Semantic Kernel with other external services. Yhere are two types of connectors:
| Connector        | Description        |
| ----------- | ----------- |
| AI Connectors      | These connectors provide an abstraction layer that exposes multiple AI service types from different providers such as Azure OpenAI, Local LLMs etc. via a common interface. Supported services include Chat Completion, Text Generation, Embedding Generation, Text to Image, Image to Text, Text to Audio and Audio to Text.|
| Vector Store Connectors      | These connectors provide an abstraction layer that exposes vector store from different providers such as Qdrant, Azure Search, Chroma etc. via a common interface. |

 #### Functions and Plugins
These are components that are used to extend the functionality of LLM. Plugins are a collection of named functions that can be used to perform specific tasks. Functions are the individual units of work that can be executed by the Semantic Kernel. As mentioned earlier, Plugins can be registered with the kernel, which allows the kernel to use them in two ways:

1. Advertise them to the chat completion AI, so that the AI can choose them for invocation.
2. Make them available to be called from a template during template rendering.

Below diagram shows the different sources of plugins:

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/plugins-from-sources.png" title="plugins-from-sources" >}}

`KernelFunction` attribute is used to define a function. In general, it should have well defined description and input/output parameters, which should be understood by the AI. 

 #### Prompt Templates
Prompt templates allow you to create instructions that can be used to guide the LLM in generating responses. In general, it gives the context and/or persona with the user input and function output, if any.
See the following diagram for where prompt templates fit in the overall architecture of Semantic Kernel:

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/template-function-execution.png" title="template-function-execution" >}}

 #### Filters
 Filters are components which provides a way to take action before and after of function invocation and prompt rendering in the Semantic Kernel pipeline.

{{< alert warning>}}
Please note, Prompt templates are always converted to `KernelFunction` before execution, both function and prompt filters will be invoked for a prompt template. Function filters are the outer filters and prompt filters are the inner filters.
{{< /alert >}}

See the following diagram for where filters fit in the overall architecture of Semantic Kernel:

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/filters-overview.png" title="filters-overview" >}}

### Semantic Kernel Frameworks
Semantic Kernel provides a set of frameworks as well, which can be used together or independently to build more advanced applications.

 #### Agent Framework 
Agent Framework provides a way to create agents that can interact with each other and/or with the user to perform tasks autonomously or semi-autonomously.

We will explore this topic in more detail in future posts, however [here](https://learn.microsoft.com/en-us/semantic-kernel/frameworks/agents) is the official documentation.

 #### Process Framework 
Process Framework provides a way to define and manage business processes within the Semantic Kernel. It allows you to create complex workflows by chaining together multiple functions and components, utilizing an event-driven model to manage workflow execution.

We will also explore this topic in more detail in future posts, however [here](https://learn.microsoft.com/en-us/semantic-kernel/frameworks/process/process-framework) is the official documentation.

I know this is the third post, but we did not cover any code yet. Just because I wanted to make sure we are on the same page and understand the basic concepts of Semantic Kernel.
In the next post, we will start with the code and build a simple application using Semantic Kernel.

{{<alert info no-icon>}}
Icon and images used in this post is property of Microsoft. Story behind the icon is available [here](https://devblogs.microsoft.com/semantic-kernel/semantic-kernels-new-icon-and-the-art-of-teamwork/).
{{</alert >}}
