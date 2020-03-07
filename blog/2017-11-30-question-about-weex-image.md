---
id: question-about-weex-image
title: 浅谈weex框架使用中的图片问题
author: YunLei
author_title: Pinduoduo FE Developer
author_url: https://github.com/ichenlei
author_image_url: https://testimg.yangkeduo.com/pdd_images/2020-03-07/a70bfa6a-3d27-4e46-b36b-2ee70f53b14f.jpg
tags: [weex]
---
### 新手问题 如何加载本地图片呀？

> 官方只提供了一个ImageAdapter例子，图片都是网络的

来看看官方让我们嵌入weex的时候，怎么指导的

```java
public class ImageAdapter implements IWXImgLoaderAdapter {
  @Override
  public void setImage(String url, ImageView view, WXImageQuality quality, WXImageStrategy strategy) {
    //实现你自己的图片下载，否则图片无法显示。
  }
}
```

<!--truncate-->

⚠️ 注意这个setImage方法，它是IWXImgLoaderAdapter提供的接口

```java
package com.taobao.weex.adapter;
import android.widget.ImageView;
import com.taobao.weex.common.WXImageStrategy;
import com.taobao.weex.dom.WXImageQuality;

/**
 * Interface for ImageLoader. This interface works as an adapter for various image library.
 */
public interface IWXImgLoaderAdapter {

  void setImage(String url, ImageView view, WXImageQuality quality, WXImageStrategy quality);
}
```
这是weex SDK(android) 里类的代码：
我们关注四个参数**url**-**view**-**quality**-**quality**

再来看看我们weex内建的组件**image**的属性：

1.**class** 文档说明必须申明宽高，所以可以在vue的**<style></style>**部分申明

2.**style**  相当于内联CSS，可以直接设置宽高

3.**src**  我们最需要关注的属性，标明图片来源

4.**placeholder**  占位图，加载图片需要时间特别是网络图，所以用本地图做占位是一个需求

5.**resize**图片的填充模式

那我们看看原生端，WXImage这个类的核心部分

```java
//填充模式选择
@WXComponentProp(name = Constants.Name.RESIZE_MODE)
  public void setResizeMode(String resizeMode) {
    (getHostView()).setScaleType(getResizeMode(resizeMode));
  }

  private ScaleType getResizeMode(String resizeMode) {
    ScaleType scaleType = ScaleType.FIT_XY;
    if (TextUtils.isEmpty(resizeMode)) {
      return scaleType;
    }

    switch (resizeMode) {
      case "cover":
        scaleType = ScaleType.CENTER_CROP;
        break;
      case "contain":
        scaleType = ScaleType.FIT_CENTER;
        break;
      case "stretch":
        scaleType = ScaleType.FIT_XY;
        break;
    }
    return scaleType;
  }
``` 
同样的还有：

```java
   @WXComponentProp(name = Constants.Name.SRC)
  @WXComponentProp(name = Constants.Name.RESIZE)
```

```
这里@WXComponentProp是weex开发自定义组件的注解，后续会讲怎么自定义component,@WXComponentProp就是起到**<component :k=v ></component>**获取标签属性的作用。
```

#### 好了我们回到ImageAdapter

>url就是我们的图片路径，可以是安卓SD卡里的，可以是mipmap(drawable)里的，也可以是assets里的，当然更可以是网络图片，带http:\/\/这类的,(笑

这里我们以Picasso为例子：

```java
Picasso.with(Context).load(uri).into(view,[callback])
```
在setImage方法里，我们可以对url做一些处理，Picasso能接受哪些路径参数呢

1.mipmap(drawable)  参数是int类型

2.assets  参数string类型，格式是**'file:///android_asset/your.png'**

3.网络 参数string  格式是正常的URL链接

4.sdcard 暂时没有去了解

>quality这个setImage参数主要是控制图片质量

```java
public enum WXImageQuality {

  ORIGINAL,

  LOW,

  NORMAL,

  HIGH
}
```

>Strategy这个setImage参数主要是对图片做一些剪裁和blur

```java
public class WXImageStrategy {

  /**
   * Whether to clip image. The default value is false.
   */
  public boolean isClipping;

  /**
   * Whether to sharp the image. The default is false.
   */
  public boolean isSharpen;

  /**
   * The blur radius of the image. [0,10],0 means no blur.
   * */
  public int blurRadius;

  public String placeHolder;

  public ImageListener getImageListener() {
    return imageListener;
  }

  public void setImageListener(ImageListener imageListener) {
    this.imageListener = imageListener;
  }

  ImageListener imageListener;

  public interface ImageListener{
    public void onImageFinish(String url,ImageView imageView,boolean  result,Map extra);
  }
}
```

>weex-eleme的图片加载代码

```java
   //没有设置图片路径，也就是src参数为空，直接退出
     if(TextUtils.isEmpty(url)) return;

  //让加载图片的任务跑在UI线程  当然也可以不用这样
    WXSDKManager.getInstance().postOnUiThread(new Runnable() {
      @Override
      public void run() {
        if(view==null||view.getLayoutParams()==null){ return;}

    //这里给我们启示，我们可以为了不暴露图片cdn,可以在这里做处理
   //比如 src是xx.png  这里处理成http://www.yourcdn.com/xx.png
   //之所以这样是因为原生代码反编译可以混淆，但是JS是暴露的，可以直接拿到
        String temp = url;
        if (url.startsWith("//")) {temp = "http:" + url; }

        if (view.getLayoutParams().width <= 0 || view.getLayoutParams().height <= 0) {return; }

     //比如你做的是电商，这里可以使用本地的图片当作占位图，等待网络图下载✅
        if(!TextUtils.isEmpty(strategy.placeHolder)){
          Picasso.Builder builder=new Picasso.Builder(WXEnvironment.getApplication());
          Picasso picasso=builder.build();
          picasso.load(Uri.parse(strategy.placeHolder)).into(view);
          view.setTag(strategy.placeHolder.hashCode(),picasso);}

      //这里是核心，本地图加载这句代码就搞定啦
        Picasso.with(WXEnvironment.getApplication()).load(temp)
                .into(view, new Callback() {
                  @Override
                  public void onSuccess() {
                    if(strategy.getImageListener()!=null){
                      strategy.getImageListener().onImageFinish(url,view,true,null);
                    }

                    if(!TextUtils.isEmpty(strategy.placeHolder)){
                      ((Picasso) view.getTag(strategy.placeHolder.hashCode())).cancelRequest(view)
                ;}}
                  @Override
                  public void onError() {
                    if(strategy.getImageListener()!=null){
                      strategy.getImageListener().onImageFinish(url,view,false,null); 
                }} }); }},0);
  }
```

这里给个vue方面的例子：

```html
<template>
        <div class="cart_wrapper" @click="changeCart">
                <div v-if="showcart">
                    <image class="cart_image" :src="cart_active_path"></image>
                </div>  
                <div v-if="!showcart">
                    <image class="cart_image" :src="cart_inactive_path"></image>
                 </div>   
        </div>
</template>

<script>
    export default {
        data(){
            return {
                cart_image_path:'file:///android_asset/cart/cart_inactive_png',
                cart_active_path:'file:///android_asset/cart/cart_active.png',
                cart_inactive_path:'file:///android_asset/cart/cart_inactive.png',
                showcart:true
            }
        },
        methods:{
            changeCart(e){
                   this.showcart = this.showcart ? false : true;
            }
        }
    }
</script>

<style scoped>
    .cart_wrapper{
        position: absolute;
        bottom: 15px;
        left: 20px;
        width:140px;
        height:140px;
    }
    .cart_image{
        width:140px;
        height:140px;
    }
</style>
```
##### 总结下图片的加载，就是实现下setImage方法，不知道怎么加载本地图的同学👨‍🎓肯定是不知道:src的属性路径字符串怎么写，这里就需要你看看Picasso(安卓)的使用说明，iOS我不清楚不过应该是类似的，主要问题是路径字符串格式大家不清楚，总之还是蛮简单的。希望对你有帮助。