# 移动端常见问题

#### ios 滚动不畅

1. 滚动容器设置 -webkit-overflow-scrolling: touch

```
默认为 auto
-webkit-overflow-scrolling: touch; /* 当手指从触摸屏上移开，会保持一段时间的滚动 */

-webkit-overflow-scrolling: auto; /* 当手指从触摸屏上移开，滚动会立即停止 */
```

2. 设置 overflow

```
body {
    overflow-y: hidden;
}
.wrapper {
    overflow-y: auto;
}
```

#### ios 上拉边界白边

##### 原因

在 iOS 中，手指按住屏幕上下拖动，会触发 touchmove 事件。这个事件触发的对象是整个 webview 容器，容器自然会被拖动，剩下的部分会成空白。

##### 解决

1. 监听事件禁止滑动  
   通过监听 touchmove，让需要滑动的地方滑动，不需要滑动的地方禁止滑动

```js
document.body.addEventListener(
  "touchmove",
  function(e) {
    if (e._isScroller) return;
    // 阻止默认事件
    e.preventDefault();
  },
  {
    passive: false,
  }
);
```

2. 滚动妥协填充空白，装饰成其他功能  
   在很多时候，我们可以不去解决这个问题，换一直思路。根据场景，我们可以将下拉作为一个功能性的操作。
   比如：下拉后刷新页面

#### 点击穿透和延时

##### 原因

iOS 中的 safari，为了实现双击缩放操作，在单击 300ms 之后，如果未进行第二次点击，则执行 click 单击操作。也就是说来判断用户行为是否为双击产生的。但是，在 App 中，无论是否需要双击缩放这种行为，click 单击都会产生 300ms 延迟。

##### 原理

双层元素叠加时，在上层元素上绑定 touch 事件，下层元素绑定 click 事件。由于 click 发生在 touch 之后，点击上层元素，元素消失，下层元素会触发 click 事件，由此产生了点击穿透的效果。

##### 解决

1.  touchstart 替换 click
2.  fastclick

#### 软键盘顶起页面，收起未回落

Android 手机中，点击 input 框时，键盘弹出，将页面顶起来，导致页面样式错乱。
移开焦点时，键盘收起，键盘区域空白，未回落。

```js
// 监听input的blur事件，触发后判断焦点目标，决定是否回弹重置页面位置;
setTimeout(() => {
  const el = document.activeElement;
  if (
    !el ||
    !el.tagName ||
    !["textarea", "input"].includes(el.tagName.toLowerCase())
  ) {
    window.scrollTo(0, document.documentElement.clientHeight);
  }
}, 100);
```

若在android某些版本中，键盘顶起页面导致高度变化布局错乱，可以强制恢复高度解决
```js
// 记录原有的视口高度
const originalHeight = document.body.clientHeight || document.documentElement.clientHeight;

window.onresize = function(){
  var resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
  if(resizeHeight < originalHeight ){
    // 恢复内容区域高度
    // const container = document.getElementById("container")
    // 例如 container.style.height = originalHeight;
  }
}
```
#### iphone X安全区域适配
iphoneX 等版本头部和底部需要空余出来
##### 解决
设置 viewport-fit 为 cover   
可选值有
- auto 此值不影响初始布局视图端口，并且整个web页面都是可查看的
- contain 视图端口按比例缩放，以适合显示内嵌的最大矩形
- cover 视图端口被缩放以填充设备显示。强烈建议使用 safe area inset 变量，以确保重要内容不会出现在显示之外

```
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover">
```

使用css判断   
safe-area-inset-*由四个定义了视口边缘内矩形的 top, right, bottom 和 left 的环境变量组成，这样可以安全地放入内容，而不会有被非矩形的显示切断的风险。对于矩形视口，例如普通的笔记本电脑显示器，其值等于零。对于非矩形显示器（如圆形表盘，iPhoneX 屏幕），在用户代理设置的四个值形成的矩形内，所有内容均可见
```css
/* 适配 iPhone X 顶部填充*/
@supports (top: env(safe-area-inset-top)){
  body,
  .header{
      padding-top: constant(safe-area-inset-top, 40px);
      padding-top: env(safe-area-inset-top, 40px);
      padding-top: var(safe-area-inset-top, 40px);
  }
}
/* 判断iPhoneX 将 footer 的 padding-bottom 填充到最底部 */
@supports (bottom: env(safe-area-inset-bottom)){
    body,
    .footer{
        padding-bottom: constant(safe-area-inset-bottom, 20px);
        padding-bottom: env(safe-area-inset-bottom, 20px);
        padding-top: var(safe-area-inset-bottom, 20px);
    }
}
```  
其中 env() 用法为 env( <custom-ident> , <declaration-value>? )，第一个参数为自定义的区域，第二个为备用值。

其中 var() 用法为 var( <custom-property-name> , <declaration-value>? )，作用是在 env() 不生效的情况下，给出一个备用值。

constant（） 被 css 2017-2018 年为草稿阶段，是否已被标准化未知。而其他iOS 浏览器版本中是否有此函数未知，作为兼容处理而添加进去。

