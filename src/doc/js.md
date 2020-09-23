# js

## 基础

> 类型

| 原始类型                                           | 对象类型 |
| -------------------------------------------------- | -------- |
| Boolean,String,Number,Null,Undefined,BigInt,Symbol | Object   |

## 原型

每一个对象的**proto**指向其构造函数的 prototype

<img src="https://developer.ibm.com/developer/articles/1306-jiangjj-jsinstanceof/nl/zh/images/figure1.jpg">

### new 做了什么

- 创建一个对象 A
- 将构造函数中的 this 指向 A
- 执行构造函数中的代码，赋值属性
- 将 A 的**proto**指向构造函数的 prototype
- 若构造函数显示 return 了一个新对象 B，则返回 B 否则返回 A

### 实现 instanceof

```js
function instanceof(left, right) {
  let __proto__ = left;
  let prototype = right.prototype;
  while (true) {
    if (!__proto__) {
      return false;
    } else if (__proto__ === prototype) {
      return true;
    }
    __proto__ = __proto__.__proto__;
  }
}
```

### valueOf 和 toString
 两个函数是对象属性上定义函数用于隐式转换，有些对象会自带对其特殊的转换  
 如Date的valueOf返回的是从 1970 年 1 月 1 日午夜开始计的毫秒数 UTC

- 举例

```js
let t = {
  valueOf() {
    console.info("value");
    return 2;
  },
  toString() {
    console.info("string");
    return "7";
  },
};
```

| 场景         | 结果                      |
| ------------ | ------------------------- |
| t == '123'   | > 'value'<br> > false     |
| t+1          | > 'value'<br> > 3         |
| t +''        | > 'value'<br> > '2'       |
| new Error(t) | > 'string'<br> > Error: 7 |
| alert(t)     | > 'string'<br> > '7'      |
| String(t)    | > 'string'<br> > '7'      |
| Number(t)    | > 'value'<br> > 2         |

而实际上如果只重载了valueOf或toString中的一个，那么一些场景会先按valueOf,toString的顺序调用  
如果valueOf返回的还是包装类型，会继续调用toString方法
而一些场景只会使用toString  
具体调用哪个得参考场景  
- a + b 操作则是先valueOf 后 toString
- String 和 new Error 则是只调用toString  
> 结论，若需要重载 无脑优先覆盖toString