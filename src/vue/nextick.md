# nextTick
[官方解释](https://cn.vuejs.org/v2/api/#vm-nextTick) - 将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。  
理解 - 异步执行，且在事件循环中尽快调用

## 宏任务(macro)还是微任务(micro)?
在不考虑兼容性的问题下，问nextTick的具体实现？  
我估计80%人会说是微任务，15%的人会说是看情况，都有。而只有不到5%的人会知道真相。

##### 哪些是宏任务/微任务?
宏任务 |微任务
-|-
setTimeout |process.nextTick
setInterval |MutationObserver
setImmediate |Promise.then
requestAnimationFrame |
MessageChannel |

## 真相
实际上，nextTick在vue发展的不同版本中，针对各种渲染和dom事件问题进行了多次调整。宏/微任务，甚至两种并行。在最新版本 2.6.12 中稳定为 **微任务**。为了探究具体原因，以及遇到的问题，我翻阅了多个版本的源码寻找答案。  

#### v2.0.0 - v2.4.4 微任务
最初，在vue2.0开始，都是基于 **MutationObserver** 或 **Promise** 处理的微任务   
下文注释内容大意为 MutationObserver 在ios >= 9.3.3 上webview中有奇怪的延迟bug，因此优先使用Promise.

<img src="https://imagecdn.ymm56.com/ymmfile/common-operation/9bc242ce-539f-49b3-ab20-becbe80ae92d.png" width="600px">  

#### 产生的问题
微任务的优先级太高了，导致vue的渲染处理可能夹在事件冒泡或者多个连续事件之间进行。

issues - 
[#4521](https://github.com/vuejs/vue/issues/4521)
[#6690](https://github.com/vuejs/vue/issues/6690)
[#6566](https://github.com/vuejs/vue/issues/6566) 

这里我以经典的 [#6566](https://github.com/vuejs/vue/issues/6566) 来说明问题。
```html
<div v-if="show">
    <i @click="show = false">show is true</i>
</div>
<div v-else @click="show = true">
    <i>show is false</i>
</div>
```
实际上你点击 i 标签的文字后，会永远看到 **show is true**。因为v-if控制的2个dom元素结构相同，vue会复用元素，对其父子上的事件进行解绑和绑定。由于微任务优先级太高，事件冒泡上div的时候，已经绑上了 **@click="show = true"**，导致状态又变回去了。所以永远只能看到 **show is true**。

#### v2.5.0 - v2.5.1  宏任务
为了解决上述问题，在这个版本中改为了完全宏任务。选择优先使用setImmediate和MessageChannel。setTimeout 即使设为 setTimeout(fn, 0)，根据标准也会有最低延迟，一般为4ms。而setImmediate和MessageChannel则是立刻插入到宏任务中。

<img src="https://imagecdn.ymm56.com/ymmfile/common-operation/73a14af5-2d29-4a71-a279-2b26571595ad.png" width="600px">  

#### 产生的问题
宏任务又太慢了，导致动画以及页面状态切换的渲染上太慢了。  

[#6813](https://github.com/vuejs/vue/issues/6813) 
有一段列表，css控制在屏宽1000px时进行垂直展示，同时 **v-show** 控制监听页面宽度变化在1000px时进行列表隐藏。
由于使用了宏任务，虽然v-show的状态已经置为false了，但vue重新绘制dom导致的回流和css导致的回流不在同一个事件循环里，且要更晚。所以页面会出现列表先垂直展示而后才隐藏的2次回流效果，导致画面闪烁。

#### v2.5.2 - v2.5.20  微宏并行
所以这里采用了微任务+宏任务并行的策略，默认情况都是走微任务，只有绑定的事件函数执行时走宏任务。  
如图，绑定事件时候调用witchMacroTask，使得事件函数执行时走宏任务。

<img src="https://imagecdn.ymm56.com/ymmfile/common-operation/a6f21643-e938-4bab-ab3f-69746f312f20.png" width="600px">
<img src="https://imagecdn.ymm56.com/ymmfile/common-operation/6239cd71-d285-4f48-a164-9af003f5d1e1.png" width="600px">

#### 产生问题
但是，问题又来了，以下是由于事件全走宏任务导致的不能解决的问题。  

[#7109](https://github.com/vuejs/vue/issues/7109)   
[#7153](https://github.com/vuejs/vue/issues/7153) 
[#7546](https://github.com/vuejs/vue/issues/7546) 
[#7834](https://github.com/vuejs/vue/issues/7834) 
[#8109](https://github.com/vuejs/vue/issues/8109) 


#### v2.6.0 - v2.6.12  微任务
最终全部走微任务，但是对事件执行做了一些改动。以阻止一些情况下由于微任务优先级太高导致的函数执行。

<img src="https://imagecdn.ymm56.com/ymmfile/common-operation/1749ef9f-4dfc-4e97-9cb0-bf85853671bd.png" width="600px">