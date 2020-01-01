---
id: the-best-way-for-weex-tabbar
title: 浅谈如何解决weex开发中Tabbar这个刚需
author: YunLei
author_title: Pinduoduo FE Developer
author_url: https://github.com/ichenlei
author_image_url: https://avatars1.githubusercontent.com/u/14012511
tags: [weex]
---

### 我想找到最高效的路由(Tabbar)方案
>很多从vue开发转到weex的开发者，都会先尝试vue-router,殊不知web环境和原生环境差太多，react-native也不使用react-router呀！RN有自己的react-navigation，但是weex怎么办呢

##### 先看看使用vue-router的作品
[weex-yanxuan-demo](https://github.com/zwwill/yanxuan-weex-demo)

![aaa](https://raw.githubusercontent.com/zwwill/yanxuan-weex-demo/master/banner.png)

可能大家觉得做的很不错呀，但是实际run起来，页面切换卡爆。

<!--truncate-->

在安卓上表现只能说更糟糕

![aaaccc](https://user-images.githubusercontent.com/14012511/34323724-7cadbc2e-e891-11e7-8631-bdd99807de22.gif)

#### 所以哪里能找到完美的解决方案啦？
![assaa](https://user-images.githubusercontent.com/14012511/34323772-6811ad78-e893-11e7-97f0-bb67d3e6ed19.png)

##### ⚡️ 我只很遗憾的告诉你，最好写原生代码，毕竟我们没有react-navigation这种神器

##### 🎁 在这之前我们可以看看阿里飞猪前端团队提供的weex-ui

![ddder](https://camo.githubusercontent.com/bba85a9dd5c667a576f2906fae897b306feeccaa/68747470733a2f2f696d672e616c6963646e2e636f6d2f7466732f5442316e366a4f67334444384b4a6a793046645858636a765858612d3536322d313030302e676966)

```bash
    npm i weex-ui -S
```

```html
<template>
  <wxc-tab-bar :tab-titles="tabTitles"
               :tab-styles="tabStyles"
               title-type="icon"
               @wxcTabBarCurrentTabSelected="wxcTabBarCurrentTabSelected">
    <!--The first page content-->
    <div class="item-container" :style="contentStyle"><text>Home</text></div>
    
    <!--The second page content-->
    <div class="item-container" :style="contentStyle"><text>Hot</text></div>
    
    <!-- The third page content-->
    <div class="item-container" :style="contentStyle"><text>Message</text></div>
    
    <!-- The fourth page content-->
    <div class="item-container" :style="contentStyle"><text>My</text></div>
  </wxc-tab-bar>
</template>

<style scoped>
  .item-container {
    width: 750px;
    background-color: #f2f3f4;
    align-items: center;
    justify-content: center;
  }
</style>
<script>
  import { WxcTabBar, Utils } from 'weex-ui';
 
  // https://github.com/alibaba/weex-ui/blob/master/example/tab-bar/config.js 
  import Config from './config'

  export default {
    components: { WxcTabBar },
    data: () => ({
      tabTitles: Config.tabTitles,
      tabStyles: Config.tabStyles
    }),
    created () {
      const tabPageHeight = Utils.env.getPageHeight();
      const { tabStyles } = this;
      this.contentStyle = { height: (tabPageHeight - tabStyles.height) + 'px' };
    },
    methods: {
      wxcTabBarCurrentTabSelected (e) {
        const index = e.page;
        // console.log(index);
      }
    }
  };
</script>
```

我们查看weex-ui的tabbar[源码](https://github.com/alibaba/weex-ui/blob/master/packages/wxc-tab-bar/index.vue)，这里我们省略次要代码。看看飞猪团队怎么做的，看到 **weex.requireModule('animation')**我们就明白了飞猪做tabbar的套路和web端是一样的，利用动画偏移我们的组件，加上动画效果的到tabbar的效果。但是这里问题来了，react-navigation可以懒加载第2，3，4位置的tabbar-page,weex-ui显然是不行的，如果是比较轻量级的app，勉强接受，不过显然我们想要做更多的控制。

```js
const animation = weex.requireModule('animation');
export default {
    props: {},
    data: () => ({
      currentPage: 0,
      translateX: 0
    }),
    created () {
      //省略内容
    },
    methods: {
    //省略内容
      _animateTransformX (page, animated) {
        const { duration, timingFunction } = this;
        const computedDur = animated ? duration : 0.00001;
        const containerEl = this.$refs[`tab-container`];
        const dist = page * 750;
        animation.transition(containerEl, {
          styles: {
            transform: `translateX(${-dist}px)`
          },
          duration: computedDur,
          timingFunction,
          delay: 0
        }, () => {
        });
      }
    }
  };
```

![c1e3b2de-a32e-491a-97e7-2ae51ee5b52d](https://user-images.githubusercontent.com/14012511/34323899-60a8f43e-e897-11e7-8e10-04b40861d780.png)

>weex-ui的用户如是说到，确实想要三端一致，我还是建议使用的。

##  最后推荐原生混合weex的方式，tabbar原生实现，页面使用weex 两个成功的例子
###  1.极客邦旗下的【<a href="https://time.geekbang.org">极客时间app</a>】,几十万用户量级

![demo](https://static001.geekbang.org/static/time/img/screenshot8.0941807.jpg)

###  2.我的demo例子，具体原生tabbar混合weex怎么做。

请看[源码]("https://github.com/iChenLei/weex-eleme/blob/master/app/src/main/java/com/weex/sample/NavigationActivity.java")
