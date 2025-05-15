---
title: "Getting Started with Semantic Kernel (Part 1)" # Title of the blog post.
date: 2025-05-14T06:00:00+01:00 # Date of post creation.
description: "Getting Started with Semantic Kernel (Part 1)." # Description used for search engine.
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
- Gen AI
- .NET 9
- LLM
tags:
- genai
- llm
- semantic kernel
keywords:
- nuke
- automation
- ci
- cd
- .net6
- c#
- aspnetcore
- github action
- nuget
- myget
- github nuget
---
 
Hi Everyone!

With this post, I am starting a new series about **{{< hl-text cyan >}}Semantic Kernel{{< /hl-text >}}**. Over the time, I will updated this page with links to individual posts : 

_This Post - Getting Started with Semantic Kernel (Part 1)_

## What is Semantic Kernel?

Semantic Kernel is a lightweight, open-source development kit that provides a framework for building AI applications using large language models (LLMs). It allows developers to create and manage complex workflows, integrate with various AI services, and leverage the power of LLMs in their applications. Semantic Kernel is designed to be flexible, extensible, and easy to use, making it a great choice for developers looking to build AI-powered applications.

Did you identify any buzzwords in the previous definition? If not, let me help you with that. The definition contains the following buzzwords:
 
- **Large Language Models (LLMs)**: These are AI models that are trained on vast amounts of text data and can generate human-like text. They are used in various applications, including chatbots, content generation, and more.

- **AI Applications**: These are applications that provide AI capabilities, such as natural language processing, image recognition, and more. Sometimes, this kind of application can have it's own memory, can take decisions on its own, and can even learn from the user. This is where Semantic Kernel comes into play.

Before we dive into the details of Semantic Kernel, let's take a moment to understand what is Generative AI and where LLMs fit in the picture.

## What is Generative AI?
At the highest level, {{<hl-text blue >}}Generative AI {{</hl-text >}} (GenAI) is a subset of artificial intelligence that focuses on creating new content, such as text, images, music, and more. Below is a simple diagram that illustrates the relationship between artificial intelligence and Generative AI: 

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/gen_ai.svg" title="Gen AI" >}}

- **Artificial Intelligence (AI)**
A multidisciplinary field of computer science that focuses on creating systems capable of performing tasks that typically require human intelligence. This includes problem-solving, learning, reasoning, and understanding natural language.

- **Machine Learning (ML)**
A subset of Artificial Intelligence that learns from existing data and makes predictions or decisions without being explicitly programmed.

- **Deep Learning (DL)**
A subset of machine learning that uses {{<hl-text green >}}artificial neural networks{{</hl-text >}} with many layers to analyze various factors of data. 

{{<hl-text blue >}}Generative AI {{</hl-text >}}is built upon a specific type of AI model, called a **{{<hl-text yellow >}}Generative Model{{</hl-text >}}**.  These models mathematically approximate the distribution of the training data. These models take large amounts of data as input such as text, images etc., In second phase, a deep learning model is utilized to recognize patterns within the data. Finally, the model generates new content based on the learned patterns.

### Why Generative AI possible now?
GenAI has been around for a while, but it has gained significant traction in recent years due to several factors:
- **Data Availability**: The internet has made vast amounts of data available, which is essential for training generative models. This includes text, images, audio, and video data.
- **Computational Power**: Advances in hardware, particularly GPUs and TPUs, have made it possible to train large models on massive datasets. This has significantly reduced the time and cost associated with training generative models.
- **Advancements in Deep Learning**: The development of more sophisticated deep learning algorithms and architectures such as GANs (Generative Adversarial Networks), Transformers, and RLHF (Reinforcement Learning with Human Feedback) has made it possible to train larger and more complex models. These architectures have shown remarkable performance in generating high-quality content across various domains.

Within GenAI, we have Large Language Models (LLMs) and Foundation Models (FMs).

{{< image classes="center nocaption fancybox" src="/images/semantic-kernel/llm_fm.svg" title="LLM & FM" >}}

- **Foundation Models (FMs)**: These are large-scale ML models trained on diverse data sources and tasks. They can be fine-tuned for specific applications, making them versatile and powerful. Examples include GPT-4, BART.

- **Large Language Models (LLMs)**: These are a subset of foundation models specifically designed for natural language processing tasks. They are trained on vast amounts of text data and can generate human-like text, answer questions, and perform various language-related tasks.

## How LLMs Work?
Typically, LLM consists of three main components:
1. **Encoder**: This component processes the input text and converts it into a numerical representation (embedding) that captures the meaning and context of the text. The encoder uses techniques like tokenization and word embeddings to achieve this.
2. **Pre-trained Transformer Model**: This is the core of the LLM. Once the token embeddings are generated,  they are trained using pre-trained transformer models. Based on the architecture of LLM, there may be step involving human feedback to guide the model's output for specific tasks.

3. **Decoder**: This component then converts the encoded input from previous steps back into text. 

Now, we understand the basic concepts of GenAI and LLMs and how they work. Next, we will focus on Semantic Kernel our main topic of discussion in the next blog post.

