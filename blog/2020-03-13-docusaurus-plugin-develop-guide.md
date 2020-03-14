---
id: docusaurus-plugin-develop-guide
title: 编写一个Docusaurus插件
author: YunLei
author_title: Pinduoduo FE Developer
author_url: https://github.com/ichenlei
author_image_url: https://testimg.yangkeduo.com/pdd_images/2020-03-07/a70bfa6a-3d27-4e46-b36b-2ee70f53b14f.jpg
tags: [docusaurus]
---

>在过去两年里我的博客是使用Gatsby构建的，基于github webhooks和netlify实现静态部署。上个月我突发奇想想要换一种技术来制作我的博客，当然技术选型还是
限定在前端领域。考察了docsify/Vuepress/docute/docusaurus等等技术，最终决定尝试一下Facebook出品的[docusaurus](https://https://github.com/facebook/docusaurus)，当我查看docusaurus官网时候发现官方正在紧锣密鼓地开发V2版本，因为我只是在尝试新技术所以不太在意新版本是否stable release，所以我基于2.0.0-alpha.40构建了我的新博客。

<!--truncate-->

### 编写docusaurus插件的原因

构建博客的过程比较顺利，基于目前还不是很完善的Guide我还是搭起了Blog。后面我想使用百度统计来统计我的博客访问，于是我开始寻找相关插件，在官方平台我只看到了谷歌统计的支持，官方提供了@docusaurus/plugin-google-analytics来支持。在国内谷歌分析使用不太方便，统计功能是没有被屏蔽的，不过用户查看统计结果时需要科学上网，在国内使用百度分析/友盟等统计平台比较方便简洁。

![百度统计](https://testimg.yangkeduo.com/pdd_images/2020-03-14/3d4f6baa-c261-46df-a3e8-5f49a53face8.png)

不过遗憾的是我们没有找到相关的插件npm包，没办法只能自力更生，这里参考plugin文档和谷歌分析插件源码实现一个DIY的百度分析docusaurus插件。

### Docusaurus插件开发文档

>Docusaurus' implementation of the plugins system provides us with a convenient way to hook into the website's lifecycle to modify what goes on during development/build, which involves (but not limited to) extending the webpack config, modifying the data being loaded and creating new components to be used in a page.

#### Creating plugins
>A plugin is a module which exports a function that takes two parameters and returns an object when executed.

官方描述plugin是一个导出接受两个参数返回一个object函数的模块。

#### Module definition

函数接受 **context** 和 **options** 两个参数， 返回一个包含lifecycle API的对象。

```js
// my-docusaurus-plugin.js
module.exports = function(context, options) {
  // ...
  return {
    name: 'my-docusaurus-plugin',
    async loadContent() { ... },
    async contentLoaded({content, actions}) { ... },
    /* other lifecycle api */
  };
};
```

#### context

>context是是一个贯穿真个插件流程的对象，该对象包含了以下

```js
interface LoadContext {
  siteDir: string; // 网站源码文件路径
  generatedFilesDir: string; // 网站build目录
  siteConfig: DocusaurusConfig; // 网站配置
  outDir: string; // 网站deploy目录
  baseUrl: string; // 网址
}
```

#### options

> options are the second optional parameter when the plugins are used. options are plugin-specific and are specified by users when they use them in docusaurus.config.js. Alternatively, if preset contains the plugin, the preset will then be in charge of passing the correct options into the plugin. It is up to individual plugin to define what options it takes.

### @docusaurus/plugin-google-analytics源码参考

```js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('path');

module.exports = function(context) {
  const {siteConfig} = context;
  const {themeConfig} = siteConfig;
  const {googleAnalytics} = themeConfig || {};

  if (!googleAnalytics) {
    throw new Error(
      `You need to specify 'googleAnalytics' object in 'themeConfig' with 'trackingId' field in it to use docusaurus-plugin-google-analytics`,
    );
  }

  const {trackingID, anonymizeIP} = googleAnalytics;

  if (!trackingID) {
    throw new Error(
      'You specified the `googleAnalytics` object in `themeConfig` but the `trackingID` field was missing. ' +
        'Please ensure this is not a mistake.',
    );
  }

  const isProd = process.env.NODE_ENV === 'production';

  return {
    name: 'docusaurus-plugin-google-analytics',

    getClientModules() {
      return isProd ? [path.resolve(__dirname, './analytics')] : [];
    },

    injectHtmlTags() {
      if (!isProd) {
        return {};
      }
      return {
        headTags: [
          {
            tagName: 'link',
            attributes: {
              rel: 'preconnect',
              href: 'https://www.google-analytics.com',
            },
          },
          // https://developers.google.com/analytics/devguides/collection/analyticsjs/#alternative_async_tag
          {
            tagName: 'script',
            innerHTML: `
              window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
              ga('create', '${trackingID}', 'auto');
              ${anonymizeIP ? "ga('set', 'anonymizeIp', true);\n" : ''}
              ga('send', 'pageview');
            `,
          },
          {
            tagName: 'script',
            attributes: {
              async: true,
              src: 'https://www.google-analytics.com/analytics.js',
            },
          },
        ],
      };
    },
  };
};
```

查看源码我们可以知道@docusaurus/plugin-google-analytics插件利用了一个重要的api即**injectHtmlTags()**,网页统计脚本的原理是在所监听的网页注入分析脚本，我们利用插件使得每一个docusaurus生成的静态网页注入相应的script脚本。上面的插件代码将会生成如下的HTML内容。

```html
  <link rel='preconnect' href='https://www.google-analytics.com'>
  <script>...content</script>
  <script async src='https://www.google-analytics.com/analytics.js'>
```

NPM包的编写上传个人还不是很熟悉，就先开发一个本地的插件，博客项目目录如下：

```js
   .docusaurus/
   blog/
   docs/
   node_modules/
   src/
       |-baiduGAPlugin/
       |- ....
   static/
   .gitignore
   docusaurus.config.js
   package-lock.js
   package.json
   README.md
   sidebars.js
```

模仿谷歌分析插件，我们写出如下的百度统计docusaurus插件：

```js
module.exports = function(context, _) {
  return {
    name: 'docusaurus-plugin-baidu-analytics',

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'link',
            attributes: {
              rel: 'preconnect',
              href: 'https://hm.baidu.com',
            },
          },
          {
            tagName: 'script',
            innerHTML: `
                var _hmt = _hmt || [];
                (function() {
                  var hm = document.createElement("script");
                  hm.src = "https://hm.baidu.com/hm.js?2a119ab67f6599ee7a1f013ffe41460f";
                  var s = document.getElementsByTagName("script")[0]; 
                  s.parentNode.insertBefore(hm, s);
                })();
            `,
          },
        ],
      };
    },
  };
};
```

#### 百度插件的不足之处
> 没有自定义插件参数，不能当作公共包来使用，百度统计插件改进使之支持自定义，百度官方提供脚本让我们直接复制粘贴，使用静态博客生成器
的话就不适合手动操作了，需要支持参数插件配置，通过观察发现个性化参数是有脚本后面的Hash数字，因为我们提炼出一个 **hashID** 参数。

![百度统计脚本](http://testimg.yangkeduo.com/pdd_images/2020-03-14/a1041b03-050f-4a48-a075-7b84820b9991.png)

```jsx {11-30,55}
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const path = require('path');

module.exports = function(context, _) {
  const {siteConfig} = context;
  const {themeConfig} = siteConfig;
  const {baiduConfig} = themeConfig || {};

  if (!baiduConfig) {
    throw new Error(
      `You need to specify 'baiduConfig' object in 'themeConfig' with 'hashID' field in it to use docusaurus-plugin-baidu-analytics`,
    );
  }

  const {hashID, anonymizeIP} = baiduConfig;

  if (!hashID) {
    throw new Error(
      'You specified the `baiduConfig` object in `themeConfig` but the `hashID` field was missing. ' +
        'Please ensure this is not a mistake.',
    );
  }

  const isProd = process.env.NODE_ENV === 'production';

  return {
    name: 'docusaurus-plugin-baidu-analytics',

    getClientModules() {
      return isProd ? [path.resolve(__dirname, './analytics')] : [];
    },

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'link',
            attributes: {
              rel: 'preconnect',
              href: 'https://hm.baidu.com',
            },
          },
          {
            tagName: 'script',
            innerHTML: `
                var _hmt = _hmt || [];
                (function() {
                  var hm = document.createElement("script");
                  hm.src = "https://hm.baidu.com/hm.js?${hashID}";
                  var s = document.getElementsByTagName("script")[0]; 
                  s.parentNode.insertBefore(hm, s);
                })();
            `,
          },
        ],
      };
    },
  };
};
```
### 我们写好的插件怎么使用呢？

在docusaurus.config.js中我们可以配置相关plugin参数

```js {6-11}
// docusaurus.config.js
module.exports = {
  /* other configs */
  // 本地引用
  plugins: [path.resolve(__dirname, 'src/baiduGAPlugin')]
  // npm引用
  plugins: ['docusaurus-plugin-baidu-analytics'],
  themeConfig: {
    baiduConfig: {
      hashID: '2a119ab67f65******1f013ffe41460f'
    },
  },
}
```

> 这样一个docusaurus插件就编写完成了✅

### 最终的使用效果

![final](https://testimg.yangkeduo.com/pdd_images/2020-03-14/d4053596-683c-4b34-81f8-71d433b8f280.jpg)