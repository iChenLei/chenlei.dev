---
id: is-flutter-the-best-way-to-build-app
title: 【译】Flutter是否是跨平台移动app开发的最佳方案？
author: YunLei
author_title: Pinduoduo FE Developer
author_url: https://github.com/ichenlei
author_image_url: https://avatars1.githubusercontent.com/u/14012511
tags: [flutter, dart]
---
[原文链接在此](https://10clouds.com/blog/flutter-cross-platform-apps/)

>现如今我们想要写一个app，不必让自己局限于两个主要移动市场iOS和android中的一个
此时很多公司想到了是否可以开发一个工具让我们只用编写一次代码，供两个系统使用。

<!--truncate-->

当然现在很多复杂的程序依旧需要创建两个独立的项目来对应不同的移动操作系统，我们日常使用的很多程序都是十分标准
化。这些程序从服务端下载数据，为用户展示UI，有时候需要用户上传一些文件到服务器，因此都是十分模版化的移动app。

我们选了很多跨平台开发移动SDK，这些SDK可以让我们创建项目，能让我们跑在不同的平台并且有不同的表现（主要是iOS和Android的UI风格表现）。
被提到最多的开发框架是Facebook的React Native（这也是我们10clouds使用的跨平台开发方案），Microsoft家的Xamarin，以及马上要介绍的
Google家的[flutter](https://flutter.io/)

### 为什么作为一个移动开发者你应该选择Flutter

当我调查分析了世界上大多数跨平台解决方案之后，我发现比较突出和推荐的框架是React Native，紧随其后的是Xamarin。
不过对于我这个安卓开发者来说缺陷就是它们都需要你更换你的IDE，Aandroid Studio和IntelliJ在开发者社区相当受欢迎。

React Native，使用的语言是Javascript，没有官方推荐的IDE，根据我的观察这个方案更像是为那些想开发移动app的前端开发者而生的。
RN的工具链是可定制的，不过也意味着你需要整合它们，相当多的依赖项。

Xamarin，比较特别的是使用了C#语言，一种和Java很像的语言。我很容易就学会怎么实用它，这门语言对开发者十分友好。
开发来说就比较受限制，几乎只能使用Visual Studio IDE。之前我使用时我发现没有Resharper插件（IntelliJ公司开发的）的话只能做一些基础工作。
除此之外，看起来Xamarin仍然需要创建平台专属的view来让应用在不同平台上表现得更好，这意味着只用60%-80%的代码是可以复用的。

讨论分析完两个最大的跨平台解决方案，我想起了今年参加Google Developer Days时了解到的Flutter SDK，一种开发多平台，原生app的解决方案。
然后我决定试一试。

### 所以flutter到底是什么？

Flutter是目前由Google开发的跨平台开发解决方案。它使用了Google的自家语言Dart。Dart语言和Javascript非常相似（注：曾经Google想使用Dart语言代替Javascript）
不过Dart语言拥有可选的内建的类型安全支持（类型安全对于Flutter开发是必须的，其他项目是可选的）。这个功能让语言变得更像是Java，这使得对于那些没有动态语言开发
经验的开发者来说很容易上手。

Flutter的创立者宣称他们自己的渲染引擎，可以拥有更高效和更灵活的用户体验。对于我来说最重要的是，Google对于AS用户提供了插件支持，所以
我能在自己喜欢的IDE上做开发了，这太棒了！

![image](https://10clouds.com/wp-content/uploads/2017/12/Flutter-Code-1024x640.png)

### 开发Flutter应用所需的SDK tools

Flutter SDK的安装是很容易的。首先你需要使用git clone Flutter的GitHub repo，下载到你自己的电脑里面。
然后在项目根路径运行Flutter Doctor 命令，去检查确认所需要的依赖，Flutter会指导你安装缺失的依赖。

所有的一切在我的MacBook上都是开箱即用的，但是呢我在我的家用PC Windows上却不能快速安装Flutter。当然这也不是大问题，因为你不能用windows来做开发，
毕竟你怎么努力也不可能在Windows上编译你的iOS应用，不过我必须承认这是这个工具的一个污点。Android Studio上的Dart和Flutter插件在插件市场都是可用的，
我能够很容易通过插件管理工具去安装它们。

### Flutter的优点和缺点

使用Flutter有很多好处，但它也有一些缺点。最大的缺点就是它的成熟度，我们可以看官网知道这个项目仍然处于Alpha阶段，
并且至少目前我们还不知道正式1.0版本的发布日期。API也经常出现不兼容更新，一些重要的功能仍然确实（比如：push通知，本地数据库
，JSON的编解码）。不过，SDK的版本更新还是很频繁的，值得开发者期待。

![image](https://10clouds.com/wp-content/uploads/2017/12/Flutter-Labs-App-view-1024x640.png)

Flutter开发相对Android开发来说有很大的不同，所以从移动开发到Flutter开发需要一些时间，至少对我来说不能很快的转变。
两周的学习，让我了解了Flutter app的架构以及Flutter是如何工作的。但是如果我想开始开发一个真实的上线应用，我需要花一些时间
去熟悉应用的架构和Dart语言的一些概念。

Flutter的UI是构建于代码的，这允许我们同时为两个系统开发UI界面，我们使用的UI组件都是Flutter SDK提供的widget，不过这样的做法也有一些弊端。
我们不能在不运行程序的前提下预览UI界面（比如android的layout XML或者iOS的storyboard）。如果我们想要为不同的系统构建不同的UI，需要使用原生代码
为不同的平台编写不同的UI，当然Flutter应用不能在不写原生代码的情况下直接使用系统的原生widget。

Flutter明确地说明安装它是很容易的，在OSX系统上，我花了半小时安装了所有依赖，但是我觉得如果我没有提前安装AS和Android SDK的话，应该会花更多的时间。
使用Flutter开发的应用据说比React Native和Xamarin表现的更好，但是我不能确定这个结论，在此之前我没有跨平台开发经验。

### 我对Flutter的疑问

Flutter的未来依旧是不确定的，目前仍然没有正式版发布日期。处于alpha阶段意味着未来的开发支持是不确定的。我不认为开发支持会结束，
在此前的开发者会议上，谷歌推荐了自家的这个新开发工具。或许会吸引更多的人和公司开始使用这个跨平台开发工具。另一个潜在的担忧是
Flutter开发者是否能快速开始进入上手状态，就像我上面提到的尽管你有大量的移动开发经验，你也做不到立即进入Flutter开发状态。
所以在开始开发你的长期运行的应用之前可以用一些小应用来试试水。

### Flutter的下一步是什么

Flutter将要取代原生app？看起来不太像，不过应该能在移动开发领域占领一席之地，因为很多应用都很简单，就像上面说的模版化应用程序。我感觉
有很大的潜在可能性是使用Flutter完成商业逻辑，但UI使用原生的SDK。

但是Flutter的发展也需要的社区的建议和开发，这有很多的影响因素，并不是所有的都是可行的。雇佣Flutter门外汉开发者要确保跟得上新版本的发展，
还有就是社区对于新手入门的支持。

### 你对Flutter的看法

你有什么看法呢？你是否有Flutter的开发经验，相比较其他的跨平台开发解决方案有什么看法？
