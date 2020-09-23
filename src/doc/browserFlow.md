# 浏览器流程
(参考)[https://juejin.im/post/5f007d32f265da22b64936bf]

## 地址栏输入后发生了什么
<img src="https://user-gold-cdn.xitu.io/2020/7/4/1731a0a7812b8fca?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">


## http请求流程
- 构建请求
构建请求行信息  
例子: GET /index.html HTTP1.1

- 查找缓存，若需要走本地缓存则直接拦截请求返回资源副本

- 准备 IP 地址和端口  
http网络请求第一步就是和服务器建立tcp连接，建立连接需要ip和端口，则需要查询dns，dns查询过程可先从本地dns缓存，然后查找
  - dns查找 - dns服务器的Ip可以是动态化，由每次上网时网关分配(DHCP)，也可以是指定的。最有名的是谷歌的 8.8.8.8

  - 域名是分级的 主机名.次级域名.顶级域名.根域名（www.baidu.com.root），只是一般都省略了.root。

  - dns服务器根据域名的层级分级查询，直到最终Ip地址  

    - 从"根域名服务器"查到"顶级域名服务器"的NS记录和A记录（IP地址）
    - 从"顶级域名服务器"查到"次级域名服务器"的NS记录和A记录（IP地址）
    - 从"次级域名服务器"查出"主机名"的IP地址

  - 若dns中没有端口号，则http默认80，https默认443。如果是https请求，还需要建立TLS连接

- 等待TCP队列  
在chrome下，同一时间请求最大数量为**6**，少于6会进入下一步，否则等待

- 建立TCP连接
  - 三次握手建立连接
  - 四次握手断开连接

- 发送http请求   
    <img src="https://user-gold-cdn.xitu.io/2020/7/4/1731a08c0a1dc8f3?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" style="width: 80%">

- 服务端处理完请求返回请求
     <img src="https://user-gold-cdn.xitu.io/2020/7/4/1731a091ba9262f5?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" style="width: 80%">
    - 响应头里包含有响应的文件类型 如 **Content-Type: text/html**，浏览器将执行html渲染  

- 请求结束，若Connection: Keep-alive 则保持与服务器的TCP连接，否则关闭,因此一个TCP可以处理无数个http请求


- 重定向机制   
301 永久重定向
302 临时重定向
303 当用Post请求时，服务器返回表示应该用get方法去另一个地方取资源
304 和缓存相关, 表示使用本地缓存
305 必须通过代理访问
307 post重定向，但需要用户进一步确认行为，和303是对302的补充
<img src="https://user-gold-cdn.xitu.io/2020/7/4/1731a09bc630f327?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" style="width: 60%">

## 渲染流程 [参考](https://juejin.im/post/5f05d12a5188252e8406e37b?utm_source=gold_browser_extension)

<img src="https://user-gold-cdn.xitu.io/2020/7/8/1732ebe6c3160d94?imageView2/0/w/1280/h/960/format/webp/ignore-error/1" style="width: 80%">  

1. 处理html构建DOM树
2. 处理Css构建CSSOM
3. 合并DOM和CSSOM
4. 布局，计算节点位置
5. GPU绘制，合成图层显示

## chrome devtool network
<img src="https://imagecdn.ymm56.com/ymmfile/common-operation/480c6150-8017-444e-847c-59aa454e5328.png" style="width: 60%"> 


- **Queueing** - 请求排队的时间。关于这个，需要知道一个背景，就是浏览器与同一个域名建立的TCP连接数是有限制的，chrome设置的6个，如果说同一时间，发起的同一域名的请求超过了6个，这时候就需要排队了，也就是这个Queueing时间

- **Stalled** - 是浏览器得到要发出这个请求的指令，到请求可以发出的等待时间，一般是代理协商、以及等待可复用的TCP连接释放的时间，不包括DNS查询、建立TCP连接等时间等 

- **DNS Lookup** - DNS查询的时间，页面内任何新的域名都需要走一遍 完整的DNS查询过程，已经查询过的则走缓存  

- **Initial Connection** - 建立TCP连接的时间，包括TCP的三次握手和SSL的认证

- **SSL** - 完成ssl认证的时间  

- **Request sent** - 请求第一个字节发出前到最后一个字节发出后的时间，也就是上传时间  

- **Waiting(TTFB)** - 请求发出后，到收到响应的第一个字节所花费的时间(Time To First Byte)

- **Content Download** - 收到响应的第一个字节，到接受完最后一个字节的时间，就是下载时间
