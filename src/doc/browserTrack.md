# 浏览器小技巧

## 指纹

前端如何根据运行环境识别用户唯一身份
目前，不同的系统显卡绘制的 canvas 时，渲染参数，抗锯齿算法不同，因此会造成图片数据的 CRC 校验不一致，导致我们目前可以通过 canvas 转 base64 的方式取构造用户的唯一身份 id

```js
function getCanvasFp() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = "14px Arial";
  ctx.fillStyle = "#ccc";
  ctx.fillText("get uuid", 2, 2);
  return canvas.toDataURL("image/jpeg");
}
```

1. 绘制 canvas，转 base64 获取 dataurl
2. 对 dataurl 进行 md5 摘要算法，提取指纹

已有开源库对此进行处理

> fingerprintjs2

其原理根据: canvas, webgl, UserAgent, AudioContext 以及对 h5 新 api 的支持程度等多方面综合构造唯一身份 id

```js
requestIdleCallback(function () {
  Fingerprint2.get((components) => {
    const values = components.map((component) => component.value);
    const fp = Fingerprint2.x64hash128(values.join(""), 31);
  });
});
```

## 1px 适配方案

一般如下设置 viewport，但这样设备纯在 dpr，设备像素比，如果网页宽度等于设备宽度，意味着 1 设备逻辑像素 = 页面 1px
而高 dpr 的设备(retina 屏-视网膜屏)，是 dpr 个物理像素渲染 1 个逻辑像素，所以这么设置了后，我们的 1px 可能在 ip6 上就是 2 个物理像素渲染。
若想显示的足够细，需要各自适配方案。

```html
<meta
  name="viewport"
  content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover"
/>
```

- **写小数 px 值** - 根据媒体查询 dpr 值 (-webkit-min-device-pixel-ratio) 来选择设置
  > 缺陷是安卓和低版本 Ios 不支持，但未来肯定是标准写法

```css
.border {
  border: 1px solid #999;
}
@media screen and (-webkit-min-device-pixel-ratio: 2) {
  .border {
    border: 0.5px solid #999;
  }
}
@media screen and (-webkit-min-device-pixel-ratio: 3) {
  .border {
    border: 0.33333px solid #999;
  }
}
```

- **border-image** 用一个 6x6 的图片填充 border-image
  > 缺陷是圆角和颜色设置不方便

<img src="https://imagecdn.ymm56.com/ymmfile/common-operation/0e2109ed-f32a-42ef-a514-443324e658f5.webp">

```css
@media screen and (-webkit-min-device-pixel-ratio: 2) {
  .border {
    border: 1px solid transparent;
    border-image: url(border.gif) 2 repeat;
  }
}
```

- **background 渐变**
  > 兼容性好，但需要写很多代码去定义不同边框结构，而且这只是背景, 这样做出来的边框实际是在原本的 border 空间内部的, 如果元素背景色有变化的样式, 边框线也会消失.
  > 最后不能适应圆角样式

```css
@media screen and (-webkit-min-device-pixel-ratio: 2) {
  .ui-border-t {
    background-position: left top;
    background-image: -webkit-gradient(
      linear,
      left bottom,
      left top,
      color-stop(0.5, transparent),
      color-stop(0.5, #e0e0e0),
      to(#e0e0e0)
    );
  }
}
```

- **transform** 构建伪元素，长宽放大 2 倍，边框宽 1px 然后 transform 缩放 50%

> 占据了伪元素，容易 css 冲突，除此外最优

```css
.radius-border{
    position: relative;
}
@media screen and (-webkit-min-device-pixel-ratio: 2){
    .radius-border:before{
        content: "";
        pointer-events: none; /* 防止点击触发 */
        box-sizing: border-box;
        position: absolute;
        width: 200%;
        height: 200%;
        left: 0;
        top: 0;
        border-radius: 8px;
        border:1px solid #999;
        -webkit-transform(scale(0.5));
        -webkit-transform-origin: 0 0;
        transform(scale(0.5));
        transform-origin: 0 0;
    }
}
```

- **viewport** 手机淘宝的早期方案，现已放弃。如果动态的根据 dpr 设置 viewport，也就是网页宽度为实际的设备物理宽度，那么 css 的 1px 就等于实际的 1px 长了。手淘的 [flexible.js](https://github.com/amfe/lib-flexible)就是这个原理。

> 缺陷就是 有些安卓里不适用，非Ios机型还是设置scale=1,原因在于安卓手机不一定有devicePixelRatio属性, 就算有也不一定能响应scale小于1的viewport缩放设置, 例如我的手机设置了scale=0.33333333, 显示的结果也与scale=1无异.

```js
const metaEl = doc.createElement("meta");
metaEl.setAttribute("name", "viewport");
const scale = 1 / devicePixelRatio;
const content = [
  "initial-scale=" + scale,
  "maximum-scale=" + scale,
  "minimum-scale=" + scale,
  "user-scalable=no",
];
metaEl.setAttribute(
  "content",
  content.join(',')
);
```
然后在html上动态设置 font-size，再用postcss转化px->rem，
```js
function refreshRem() {
    var width = docEl.getBoundingClientRect().width;
    if (width / dpr > 540) { //大于540px可以不认为是手机屏
        width = 540 * dpr;
    }
    var rem = width / 10; 
    docEl.style.fontSize = rem + 'px';
    flexible.rem = win.rem = rem;
}
```