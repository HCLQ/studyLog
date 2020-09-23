# V8 垃圾回收

[详细](https://juejin.im/post/5e6afc58e51d452715157434?utm_source=gold_browser_extension#heading-1)

## 基本概念

- 世代假说
  - 大部分变量都是分配不久就会被清除
  
  - 存在少数长时间不死，甚至半岁整个程序的周期的变量
- mutator
  - 生成新对象
  - 改变旧对象引用
- V8 内存
  <img src="https://user-gold-cdn.xitu.io/2020/3/13/170d1f0ba3c53149?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">
  新生代分为 **from**/**to** 两个空间，只有 1-8M 内存，存储很快消亡的对象

## 新生代 gc

- 存活检测
  通过可达性分析，迭代复制由 root 指向的节点和其子节点，然后互换 from 和 to 空间
  <img src="https://user-gold-cdn.xitu.io/2020/3/13/170d1ee0f36f61b0?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

### 问题

从 root 可达性分析时，若碰到了老生代的对象，则会跳过处理  
存在一种情况，有个新生代对象唯一被老生代对象索引,则会被跳过，因此需要加入额外一个概念

- 记录集 - 在 mutator 过程中，若为老生代对象 A 添加了新生代的对象 B，则将 A 加入记录集,进行新生代回收时，扫描记录集获得 B 的引用，记录集存储的是发起引用的老生代对象

## 新生代晋升老生代

晋升是直接复制新对象到老生区

### 时机

以下两种情况都会晋升

- 新生代对象已经经历过一次 gc
- 复制过程中，to 空间使用量超过 25%使用量

## 老生代 gc

### 标记清除

1. 获取 root 的引用(全局顶层变量)
2. 迭代遍历 root，进行标记
3. 找到无标记的变量进行垃圾回收

### 三色标记法

类似于 **react** 的 **async reconcile**，标记阶段时异步的，可能同时伴随着 mutator，标记完一次性同步删除白色节点

- 白色(未遍历)
- 灰色(遍历部分，等待遍历完子)
- 黑色(子应用遍历完)

#### 细节

1. 对根引用直接涂灰
2. 把根的子涂灰, 然后涂黑根
3. 对灰色节点递归
4. 串联白色节点，进行删除

<img src="https://user-gold-cdn.xitu.io/2020/3/13/170d1f1455aa48bf?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

### 问题

在标记时，可能存在 mutator 动态修改了引用，导致一些白色节点的唯一引用是黑色节点，而黑色节点不会被再次遍历，所以白色节点会没有标记而被误删除

- 解决方案(写屏障) - 在变更引用时，直接对 mutator 过程中变更的引用涂灰，不由父节点迭代而来
  <img src="https://user-gold-cdn.xitu.io/2020/3/13/170d1f1a6e5484d9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">

## 写屏障伪代码

```js
function writeBarrier(obj, field, newField) {
  // 新生代gc记录集，obj是否是老生代对象，newField是否是新生代对象，obj是否存在于记录集
  if(isOld(obj) && isNew(newField) && notMemo(obj)) {
    addMemo(obj)
  }
  // 老生代gc，三色标记，新引用直接涂灰
  if(!marked(newField)) {
    mark(newField, GREY)
  }
  // 修改引用
  ...
}
```
