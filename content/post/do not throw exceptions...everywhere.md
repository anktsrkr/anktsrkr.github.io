---
title: "Do not throw exceptions...Everywhere" # Title of the blog post.
date: 2023-10-08T08:00:35+01:00 # Date of post creation.
description: "Do not throw exceptions...Everywhere, Instead make it as rule." # Description used for search engine.
featured: true # Sets if post is a featured post, making appear on the home page side bar.
draft: false # Sets whether to render this page. Draft of true will not be rendered.
toc: false # Controls if a table of contents should be generated for first-level links automatically.
# menu: main
thumbnailImage: "/images/exception/small-rulevsexception.png"
shareImage: "/images/exception/small-rulevsexception.png" # Designate a separate image for social media sharing.
codeMaxLines: 10 # Override global value for how many lines within a code block before auto-collapsing.
codeLineNumbers: false # Override global value for showing of line numbers within code block.
figurePositionShow: true # Override global value for showing the figure label.
coverImage: "/images/exception/rulevsexception.png"
autoThumbnailImage: true
thumbnailImagePosition: "top"
metaAlignment: center

categories:
- .NET 7
- ProblemOr
- Exception handling
tags:
- c#
- Monads
keywords:
- discriminated union c#
- .net exception handling
- .net exception handling best practices
- .net core exception handling
- .net core exception handling best practices
- .net 7 exception handling
- .net 7 exception handling best practices
- .net 7 core exception handling
- .net 7 core exception handling best practices
- .net 8 exception handling
- .net 8 exception handling best practices
- .net 8 core exception handling
- ProblemOr
- Result
- ErrorOr
- Maybe
- Either
- erroror .net core
- erroror c#
- result .net core
- problemor .net core
- maybe .net core
- result .net core
- either .net core
- C# Either
- C# Either union
- C# Either discriminated union
- C# Either monad
- C# Either type
- C# Either functional programming
- C# Either functional programming union
- C# Either functional programming discriminated union
- C# Result union
- C# ProblemOr union
- C# Result
- C# ProblemOr
- C# Result discriminated union
- C# ProblemOr discriminated union
- C# Maybe union type
- C# Maybe discriminated union
- C# Maybe
- C# Maybe type
- C# Maybe monad
- C# Result monad
- C# ProblemOr monad
- C# monad
- C# functional programming
- C# functional
- C# functional programming union
- C# functional programming discriminated union
- C# functional programming monad
- C# functional programming maybe
- C# functional programming maybe monad
- C# functional programming result
- C# functional programming result monad
- C# functional programming problemor
- C# functional programming problemor monad
- C# functional programming eroror union
- C# functional programming eroror discriminated union
- C# functional programming eroror monad
- C# functional programming eroror maybe


---
We, as C# developers, are used to throwing exceptions everywhere be it a functional such as validation or technical such as network failure. But is it worth throwing exceptions everywhere? Exceptions are expensive. You should not throw exceptions everywhere. You should throw exceptions only when it is necessary. But how? Let's discuss the alternative approach.

## Types of exceptions in general
Excellent [**article**](https://learn.microsoft.com/en-gb/archive/blogs/ericlippert/vexing-exceptions) by Eric Lippert on exceptions, where you can find the types of exceptions in general. I will discuss the four categories of exceptions in short and will discuss in which category you should throw exceptions and in which category you should not throw exceptions and also discuss the alternative approach.

As per Eric Lippert, there are four categories of exceptions in general.
1. Fatal
2. Vexing
3. Exogenous
4. Boneheaded

### Fatal
Fatal exceptions are the ones that you can't do anything about and not your fault. For example, `OutOfMemoryException`. You can't do anything about it. You can't recover from it. You can't retry it. You can't do anything about it. So, there is no point in catching it. You should let it bubble up to the top.

### Vexing
Vexing exceptions are the ones that you can avoid by changing the code. For example, `FormatException`. You can avoid it by using `TryParse` instead of `Parse`. So, you should not throw vexing exceptions. You should use `TryParse` instead of `Parse` or similar approach.

### Exogenous
Exogenous exceptions are the ones that you can't avoid by changing the code. For example, `FileNotFoundException`. You can't avoid it by changing the code. For example, if you are trying to read a file and the file does not exist. You may try fail fast approach by checking the file existence before reading it. 

But what if the file is deleted/renamed/moved/locked after checking the existence and before reading it? to avoid this, you can lock the file maybe? But what if network failure happens.

As we can see, how hard we try to avoid it, we can't avoid it. So, in such cases you should throw exogenous exceptions.

### Boneheaded
Boneheaded exceptions are the ones that you can avoid by changing the code. For example, `ValidationException` or `IndexOutOfRange`. You can avoid it by checking the argument. So, you should not throw boneheaded exceptions. You should validate the argument and in latter case, you should check the index before accessing the array.

## Alternative approach : Dropping exceptions,treat as rule
Let's say you are creating user with an email. There could be two business scenarios apart from infrastructure issues. 
 - Either user with the same email already exists.
 - We should be able to create user with the email.

 In general, what we should is create a `DuplicateEmailException` and throws it from the service. But as per the above discussion, we should not throw it. 

 Instead what we could do is return a **ProblemOr<User>**, in this case if the user with the same email already exists, we will return a **Problem** with the status code **Conflict** and if the user with the same email does not exist, we will return a **User**.
{{<codeblock  "UserService.cs" csharp >}}public async Task<ProblemOr<User>> CreateUserAsync(string email)
{
    if (await _userRepository.GetAsync(email) is User user)
    {
        return Problem.Conflict("Email already exists");
    }

    var probableUser = User.CreateWithEmail(email);// This might have email validation logic as well.

    if (user.HasProblem)
    {
        return probableUser.Problems;
    }
    await _userRepository.AddAsync(probableUser.Value);
    return probableUser.Value;
}
{{</codeblock>}}

What we did here basically instead of throwing an exception, we are treating as control flow. We are not breaking the chain but still we are bubbling up the problem to the top. So, the caller can decide what to do with the problem like below:
{{<codeblock  "UserController.cs" csharp >}}[HttpPost]
probableUser.SwitchFirst(
    user => Console.WriteLine(user.Name),
    error => Console.WriteLine(error.Description));
{{</codeblock>}}

It is also possible that the method does not return any business object. For example, you are sending email to a user and you just want to return **Success** or **Failure**. In this case, if the user does not exist, you can return **Problem** with the problem as **NotFound** and if the user exists, you can send email and return **Success**, Like below:

{{<codeblock  "UserService.cs" csharp >}}public async Task<ProblemOr<Success>> SendEmailAsync(string email)
{
    if (await _userRepository.GetAsync(email) is not User user)
    {
        return Problem.NotFound("404","User not found");
    }

    await _emailService.SendEmailAsync(user);
    return Result.Success;
}
{{</codeblock>}} 

We can now see the alternative approach in action. But what is this **ProblemOr**? Let's discuss it.

## ProblemOr<T> : An opinionated discriminated union in C#
**ProblemOr<T>** is nothing but an opinionated discriminated union. Discriminated union provides a way to represent a value that can be one of a fixed set of different values and types. Discriminated unions are useful for heterogeneous data; data that can have special cases, including valid and error cases. 

**ProblemOr<T>** can be one of the following:
1. **Problem** : Represents a problem with the status code and description.
2. **Result** : Represents a success.
3. **T** : Represents a value of type T.

I mentioned it as _opinionated_ because this is not a general purpose discriminated union, where you can have any number of cases. This is specifically designed for the scenarios where you want to return a value or a problem.

You need to install the package from [**here**](https://www.nuget.org/packages/Sundry.ProblemOr/) to use it.


## Conclusion
In this article, we discussed the types of exceptions in general and in which category you should throw exceptions and in which category you should not throw exceptions and also discussed the alternative approach. We also discussed the **ProblemOr** which is an opinionated discriminated union in C#.