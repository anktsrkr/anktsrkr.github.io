---
title: "Getting Started with Semantic Kernel (Part 2) " # Title of the blog post.
date: 2025-05-16T06:00:00+01:00 # Date of post creation.
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
- Ollama
- Foundry Local
- LM Studio
---
 
Hi Everyone! 
This post is continuation of a series about **{{< hl-text cyan >}}Semantic Kernel{{< /hl-text >}}**. Over the time, I will updated this page with links to individual posts : 

[Getting Started with Semantic Kernel (Part 1)](/post/getting-started-with-semantic-kernel)

_This Post - Getting Started with Semantic Kernel (Part 2)_

[Building Blocks of Semantic Kernel](/post/semantic-kernel/semantic-kernel-building-blocks)

[Getting Started with Foundry Local & Semantic Kernel](/post/semantic-kernel/getting-started-with-foundry-local-and-semantic-kernel)

[Getting Started with Ollama & Semantic Kernel](/post/semantic-kernel/getting-started-with-ollama-and-semantic-kernel)

[Getting Started with LMStudio & Semantic Kernel](/post/semantic-kernel/getting-started-with-lmstudio-and-semantic-kernel)
We now have a basic understanding of Gen AI and how LLM works. However, before we dive into Semantic Kernel, Let's take a moment to understand some of the key components and tools that will be important as we move forward.

## SLM vs LLM
### SLM (Small Language Model)
SLM refers to Small language models that are typically less complex and require fewer resources to run. They are often used for specific tasks or applications where a full LLM may not be necessary. SLMs can be effective for tasks like text classification, sentiment analysis, and other simpler NLP tasks.
### LLM (Large Language Model)
LLM refers to large language models that are trained on vast amounts of text data and can generate human-like text. They are capable of understanding and generating natural language, making them suitable for a wide range of applications, including chatbots, content generation, translation, and more. LLMs are typically more complex and require significant computational resources to run.
### Key Differences
- **Size**: LLMs are larger and more complex than SLMs, requiring more computational resources.
- **Number of Parameters**: LLMs typically have a significantly higher number of parameters (Billions to trillions) compared to SLMs (Millions to tens of millions).
- **Capabilities**: LLMs can handle a wider range of tasks and generate more coherent and contextually relevant text compared to SLMs.
- **Training Data**: LLMs are trained on vast amounts of text data, while SLMs may be trained on smaller datasets.
- **Use Cases**: SLMs are often used for specific tasks, while LLMs are more versatile and can be used for a variety of applications.
### Examples
- **SLM**: 	Phi-3, GPT-4o mini etc.
- **LLM**: OpenAI, Mistral, LLama etc.
### When to Use SLM vs LLM
- **Use SLM**: When you have limited computational resources, need to perform specific tasks, or require faster inference times.
- **Use LLM**: When you need to generate high-quality text, handle complex tasks, or require a model that can understand and generate natural language in a more sophisticated manner.
 
 You may refer this [link](https://www.microsoft.com/en-us/microsoft-cloud/blog/2024/11/11/explore-ai-models-key-differences-between-small-language-models-and-large-language-models/) for more details.

## Local LLM vs Cloud LLM

When it comes to using LLMs, there are two main options: local LLMs and cloud LLMs. Local LLMs are models that you can run on your own hardware, while cloud LLMs are hosted by a third-party provider and accessed via an API. Each option has its own advantages and disadvantages.

### Local LLMs
- **Advantages**:
  - Greater control over the model and data.
  - No latency issues related to network calls.
  - Can be optimized for specific hardware.

- **Disadvantages**:
  - Requires significant hardware resources.
  - Sort of complex setup and maintenance.
  - Limited scalability compared to cloud solutions.

### Cloud LLMs
- **Advantages**:
  - Easy to set up and use.
  - Scalable to handle varying workloads.
  - Access to the latest models and updates.

- **Disadvantages**:
  - Less control over the model and data.
  - Potential latency issues due to network calls.
  - Ongoing costs associated with usage.
  
Semantic Kernel supports both local and cloud LLMs, allowing developers to choose the best option for their specific use case.

## How to run LLM locally?
These days, there are many options available to run LLM locally. Some of the popular options include:
- **Ollama**: Ollama is a command-line tool that allows you to run LLMs locally on your machine. It provides a simple interface for downloading and running models, making it easy to get started with local LLMs. 
- **LM Studio**: LM Studio is a GUI-based application that allows you to run LLMs locally on your machine. It provides a user-friendly interface for managing models and running inference, making it accessible to users who may not be comfortable with command-line tools.
- **Docker Model Runner**: Currently it is in preview, but it allows you to run LLMs in a containerized environment using Docker. 
- **Foundry Local**: Foundry Local brings the power of Azure AI Foundry to your local device without requiring an Azure subscription. 

In our case, we will be mostly using **Ollama** in Docker and **LM Studio** as these are feature-rich. We will also use **Foundry Local** to show how to integrate with Semantic Kernel.

## Where can I find Cloud LLMs?
There are many cloud LLM providers available, some of the popular ones include:
- **OpenAI**: OpenAI provides access to its GPT models via an API, allowing developers to integrate LLM capabilities into their applications.
- **Microsoft**: Microsoft provides access to its Azure OpenAI Service, allowing developers to integrate LLM capabilities into their applications.
- **Github Models**: Github provides access to various LLMs via its API, allowing developers to integrate LLM capabilities into their applications.

Last but not the least, we will be touching on **Vector DB** in this post.
## What is Vector DB?
Vector databases are specialized databases designed to store and manage high-dimensional vectors, which are often used in machine learning and artificial intelligence applications. These databases are optimized for similarity search and retrieval tasks, making them ideal for applications that involve large-scale data processing, such as image recognition, natural language processing, and recommendation systems.
### Examples of Vector DB
You may use cloud-based vector databases or run them locally. Some popular options for local vector databases include:

- **Qdrant**: A vector database that provides high-performance similarity search and retrieval capabilities. It is designed for large-scale applications and supports various data types, including text, images.
- **Chroma**: A vector database that focuses on providing fast and efficient similarity search capabilities. It is designed for use in machine learning and AI applications, making it a popular choice for developers working with high-dimensional data.

In our case, we will be mostly using **Qdrant**.

We now have more understanding of the components and tools that will be important as we move forward. In the next post, we will see how to use Semantic Kernel with **Ollama** / **LM Studio**. Later, we will see how to use **Qdrant** with Semantic Kernel.

{{<alert info no-icon>}}
Icon used in this post is property of Microsoft. Story behind the icon is available [here](https://devblogs.microsoft.com/semantic-kernel/semantic-kernels-new-icon-and-the-art-of-teamwork/).
{{</alert >}}