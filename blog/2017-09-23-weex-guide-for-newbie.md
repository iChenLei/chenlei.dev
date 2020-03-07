---
id: weex-guide-to-newbie
title: 写给安卓开发工程师的weex开发指南，iOS工程师可以参考
author: YunLei
author_title: Pinduoduo FE Developer
author_url: https://github.com/ichenlei
author_image_url: https://testimg.yangkeduo.com/pdd_images/2020-03-07/a70bfa6a-3d27-4e46-b36b-2ee70f53b14f.jpg
tags: [weex]
---

#### 为什么是安卓，不是iOS？

> 本人是前端，略懂安卓，因为object-c语法晦涩所以iOS知识基本为0

#### 什么姿势开始？weex-toolkit? hybird?
>根据市面上已经做出来的产品或者demo来看，weex-toolkit📦的app性能太差，hybrid渐进的引入效果还不错，比如已经面向用户的【极客时间】app [链接](https://time.geekbang.org/)

<!--truncate-->

### hybrid_step_01
使用Android Studio新建一个项目，取个名字，然后配置build.gradle
```java
apply plugin: 'com.android.application'
android {
    compileSdkVersion 23
    buildToolsVersion '27.0.1'

    defaultConfig {
        applicationId "com.weex.sample"
        minSdkVersion 14
        targetSdkVersion 23
        versionCode 1
        versionName "1.0"
        /**
         * 必须加，否则64位手机无法加载so文件
         */
        ndk {
            abiFilters "x86"
            abiFilters "armeabi"
        }
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    compile fileTree(include: ['*.jar'], dir: 'libs')
    compile 'com.android.support:recyclerview-v7:23.4.0'
    compile 'com.android.support:support-v4:23.4.0'
    compile 'com.android.support:appcompat-v7:23.4.0'
    compile 'com.alibaba:fastjson:1.1.45'
    compile 'com.taobao.android:weex_sdk:0.10.0@aar' //请使用最新的SDK版本
    compile 'com.squareup.picasso:picasso:2.5.2' //图片库也可以是glide等
    testCompile 'junit:junit:4.12'
}
```
实现图片下载接口，初始化时设置,这里先不讲本地图片，网络图片，等加载的问题
文件路径一般是 ../app/src/main/java/com.xxx.sss/ImageAdapter.java
```java
package com.weex.sample;
import android.widget.ImageView;
import com.taobao.weex.adapter.IWXImgLoaderAdapter;
import com.taobao.weex.common.WXImageStrategy;
import com.taobao.weex.dom.WXImageQuality;
/**
 * Created by iChenLei on 17/12/22.
 */
public class ImageAdapter implements IWXImgLoaderAdapter {
  @Override
  public void setImage(String url, ImageView view, WXImageQuality quality, WXImageStrategy strategy) {
    //实现你自己的图片下载，否则图片无法显示。
  }
}
```
### hybird_step_02
很重要的初始化步骤，在MainApplication里面初始化我们的WXSDKEngine
```java
package com.weex.sample;
import android.app.Application;
import com.taobao.weex.InitConfig;
import com.taobao.weex.WXSDKEngine;
/*** 
注意要在Manifest中设置android:name=".WXApplication" 
要实现ImageAdapter 否则图片不能下载 
gradle 中一定要添加一些依赖，否则初始化会失败。 
*/
public class WXApplication extends Application { 
   @Override  public void onCreate() {    
             super.onCreate();     
             InitConfig config=new InitConfig.Builder().setImgAdapter(new ImageAdapter()).build();    
             WXSDKEngine.initialize(this,config);  
}}
```
### hybrid_step_03
>是不是想说这不是weex官网给的嵌入安卓教程么，复制粘贴有意思？NO NO NO，前面确实是一样的，下面我们就要来一个☝️不一样的！

这次我们将要使用viewpager做页面切换，RadioGroup实现BottomNavigation,效果如下:

![sss](https://camo.githubusercontent.com/92fc5cb7e5220cb6dc9a28fd0d16de85c0332e04/687474703a2f2f7777342e73696e61696d672e636e2f6c617267652f303036306c6d37546c7931666d706b6a30776370756a333075303168636864742e6a7067)

>代码详见该项目源码

```java
        ViewPager viewpager = (ViewPager)findViewById(R.id.fragment_master);
        List<Fragment> list = new ArrayList<Fragment>();
        list.add(TestFragment.newInstance("home.js"));
        list.add(TestFragment.newInstance("web.js"));   //这里可能会疑问，这是啥？
        FragmentPagerAdapater fpa = new 
        FragmentPagerAdapater(getSupportFragmentManager(),list);
        viewpager.setAdapter(fpa);
```
我们主要需要实现Fragment渲染weex,当然还需要实现一些借口，因为篇幅有限这里省略

```java
public class TestFragment extends Fragment implements IWXRenderListener {

    //JS来源 可以是本地 也可以是服务器端
    private String mBundleUrl;
    //用来装载weex页面的容器
    private FrameLayout rootView;
    //weexsdk实例
    private WXSDKInstance mWXSDKInstance;

    public TestFragment(){}

    //这里就是我们的newInstance方法
    public static TestFragment newInstance(String url) {
        Bundle args = new Bundle();
        TestFragment fragment = new TestFragment();
        args.putString(WXSDKInstance.BUNDLE_URL,url);
        fragment.setArguments(args);
        return fragment; //我们要的是fragment
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        View view = View.inflate(getActivity(), R.layout.weex_test,null);
        rootView = (FrameLayout)view.findViewById(R.id.fragment_test);

        mBundleUrl = getArguments() != null ? getArguments().getString(WXSDKInstance.BUNDLE_URL) : null;

        mWXSDKInstance = new WXSDKInstance(getActivity());
        mWXSDKInstance.registerRenderListener(this);
        mWXSDKInstance.render("weex fragment test", WXFileUtils.loadAsset(mBundleUrl,getActivity()),null,null, WXRenderStrategy.APPEND_ASYNC);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        if (rootView.getParent() != null) {
            ((ViewGroup) rootView.getParent()).removeView(rootView);
        }
        System.out.print("[chenlei-weex]  What happened? ");
        return rootView;
    }

    @Override
    public void onViewCreated(WXSDKInstance mWXSDKInstance, View view) {
       //这句代码很重要，将我们渲染的weex view加载到FrameLayout里面
        rootView.addView(view);
        System.out.print("[chenlei-weex] Add view successful?");
    }
}
```
致此我们就不需要安卓开发工程师了(开除!😊)，当然是开玩笑啦，不过现在就可以利用我们的weex-toolkit写vue也就是weex界面了

### hybird_step_03
>开始写vue(weex)部分

![xcode](https://user-images.githubusercontent.com/14012511/34298701-0c9f5c22-e75a-11e7-9cc2-48c0aff5529c.png)

我那么讨厌weex-toolkit为啥还要用它，不自己弄个webpack配置呢？答案是我们可以改造weex-toolkit，完成我们的目的。改造哪里呢？当然是webpack.config.js

```js
const weexConfig = {
  entry: weexEntry,
  output: {
    //改造下面这句代码，将我们编译后的js输出到安卓的assets里面
    path:pathTo.join('/Users/ichenlei/code/weex/WXSample/app/src/main/assets','.'),
    filename: '[name].js'
  },
//......
}
```
有时候我们不想把所有的vue组件都编译，只编译页面级别的vue文件，怎么做？
```js
 const walk = (dir) => {
    dir = dir || '.';
    //⚠️我们这里遍历入口不是src/而是src/page
    const directory = pathTo.join(__dirname, 'src/page', dir);
    fs.readdirSync(directory).forEach((file) => {
      //遍历我们的page页面
  }
  // Generate an entry file before writing a webpack configuration
walk();
```

最后这样我们可以利用webpack --watch模式和Android Studio的instant run来达成伪Hot Reload(官方也没有提供Hot Reload，这里无比想念React Native,对比下简直不要太棒！