---
id: what-is-service-mesh
title: 【译】什么是服务网格
author: YunLei
author_title: Pinduoduo FE Developer
author_url: https://github.com/ichenlei
author_image_url: https://avatars1.githubusercontent.com/u/14012511
tags: [service mesh, cloud computation]
---
[原文链接在此](https://buoyant.io/2017/04/25/whats-a-service-mesh-and-why-do-i-need-one/)

>service mesh是专门面向微服务治理调度的基础设施，它可以让服务之间的交互变得安全，快速高效，如果你在编写云原生的应用，那么你需要service mesh!

经过过去几年的发展，service mesh已经成为云原生技术栈中重要的组成部分。大流量公司诸如PayPal，Lyft，Ticketmaster和Credit Karma都已经将service mesh应用到它们的生产环境应用上。在一月，Linkerd（开源service mesh应用），成为CNCF基金会官方项目。但是什么是service mesh？为什么突然变得很重要？

<!--truncate-->

在这篇文章里，我将定义service mesh，并且追溯它在过去十年应用架构演变中诞生的根源。我将区分和service mesh定义相近但有区别的概念，诸如API网关，edge proxies和企业级应用队列。最后，我将描述service mesh的发展方向和云原生应用开发中人们对它的期望。

### 什么是service mesh？

Service mesh是控制service-to-service交互的基础架构设施。它用于解决请求在包含现代云原生应用服务复杂拓扑结构中的传递问题。在实践中，service mesh通常被实现为包含轻量级网络代理的网格，用于发布列式应用代码，不需要应用去关注实现细节。

Service mesh的理念是作为云原生应用中独立的一层。在云原生应用模型中，一个独立的应用可能需要依赖上百个服务，每一个服务可能拥有上千个实例，每个实例的状态可能随时改变，比如它们被Kubernets动态调度。不仅仅是服务之间的交流看起来复杂，普遍来说运行时的基础设施行为也很复杂。管理这些是至关重要的，需要确保端到端的表现和可依赖性。

### service mesh是一种网络模型？

Service mesh是一种网络模型，它是基于TCP/IP之上的虚拟的一层。它假定下层的L3/L4网络是可用于在点对点之间传输数据。（它也假定所有的网络环境是不可靠的，service mesh必须保证能够控制网络失败的情况）

在一些实现方式上，service mesh和TCP/IP很相似。在机器上抽象了TCP堆栈，用于在网络节点之间传输可靠的数据信息，service mesh抽象了服务之间的请求传输。就像TCP，service mesh不关心传输的数据是如何编码的。应用有个高级别的目标（“send something from A to B”）,service mesh的任务就是完成这个目标并且处理任何可能失败的情况。

与TCP不同的是，service mesh有个很重要的理念超越了“just make it work”:它提供了统一的规定，在应用运行时进行控制。Service mesh这个确定的目的就是将服务之间的交互从不可见的领域移出来，这些基础设施将作为生态中的一等公民，去被监控，管理和控制。

### Service Mesh真正做了什么？

可靠的请求传输实现在云原生应用中是非常复杂难办的。像Linkerd这种Service mesh应用可以用于管理这些复杂的服务交互，用的有力的技术有：circuit-breaking， latency-aware load balancing，服务发现和retries以及deadlines。这些功能必须联合使用，这些功能相互协调与复杂的环境交互将使得操作它们变得容易。

举个例子，当一个请求通过Linkerd到达一个服务，按照时间线会出现下面的事件：

1-linkerd通过动态路由决定将请求输送到哪个服务。请求是否应该导向生产环境还是staging环境？输送到本地服务还是云端服务？输送到将要被测试的新版本服务还是已经在生产环境验证的老版本服务？所有的路由规则都是动态可定制的，可应用全局或者独立的局部流量。

2-找到了正确的目的地，Linkerd会恢复实例池（容纳服务发现的发现的服务节点）。如果这些信息偏离了Linkerd所遵守的标准么，Linkerd将作出决定，决定哪些信息源可以被信任。

3-Linkerd选择一个可以最快作出响应的服务实例，当然判定因素有很多比如最近的响应返回时间

4-Linkerd尝试向实例发送请求，记录响应的相关信息注入类型时间等等。

5-如果实例挂了，不响应或者获取请求失败，Linkerd会向其他实例发送请求。

6-如果实例返回了错误，Linkerd会将它从负载均衡池里踢出去，然后再次尝试传输请求。

7-如果在Deadline时，请求奔溃了。Linkerd会主动标记请求失败而不是再次尝试。

8-Linkerd会捕获所有行为的信息，做到可追溯，信息都会被提交到中心系统。

>Linkerd结构图如下

![image](https://buoyant.io/wp-content/uploads/2017/04/linkerd-service-mesh-diagram-1024x587.png)

### 为什么是service mesh?

Service mesh并不是一个新功能，它更多的是对现有功能的提升。Web应用早已有了管理复杂服务交互的方案。最早的service mesh模型
可以追溯到过去十年的应用发展阶段。

想象一个2000年左右的中等规模的web应用：三层架构应用，在这种模型中包含应用逻辑，web服务逻辑和存储逻辑。
每一层都是单独的。每一层之间的交互复杂度依赖于用户规模。总之没有‘**mesh**，但这里存在层与层之间的交互逻辑，由各层的代码控制。

这个架构随着用户规模和业务复杂度的提升，开始崩溃。比如Google，Netflix和Twitter这种大流量公司将要面临大量的请求。
应用层被拆分成多个服务（有时候称之为微服务），服务之间的拓扑结构变得复杂。在这些系统中，一个交互层被创建，被称之为富客户端苦库。
比如Twitter的Finagle和Google的Stubby就是比较好的例子。

很多情况下，诸如Finagle，Stubby这种被成为第一代Service Mesh实现。不过它们用于特殊的目的和特殊的环境，需要特定的语言和框架。
这种情况下这些公司开源了它们的项目，希望用于外部公司。

快速转向现代云原生应用模型，模型通过两个外加元素将多个小服务组合成为服务。元素一是容器（e.g. Docker），容器提供隔离的环境和依赖管理，
另一个元素是容器编排方案（e.g. Kubernets），抽象管理容器池。

这三个组件允许应用在服务器上负载请求和在云环境上处理失败，但是上百服务或者上千实例，和容器编排工具去实时调度实例，让一个请求到达
正确的服务变得十分复杂，尽管容器让不同服务可以使用不同语言，库的调用依旧不再可靠。

复杂度和可靠性要求促使我们需要专门创建一层架构用于服务与服务之间的交互，要能实现脱离应用并能捕获高度动态的环境信息，这一层就是**Service Mesh**。

### Service Mesh的未来

Service Mesh快速成长为云原生生态的一员，这里已经有确认存在的路线发展图等待我们去探索。Serverless服务（比如亚马逊的[Lamada](https://aws.amazon.com/cn/lambda/)）需要使用Service Mesh去匹配服务的名字和链接。它在服务实体中的角色从云原生环境看来依旧比较年轻，
Service Mesh对成为基础设施的一部分还比较冷静。继续稳步发（后面翻译不下去了，累）


