# 缓存相关

- res: Last-Modified 
- req: If-Modified-Since

- res: Etag   
在ngix里 Etag是由 是由Last-Modified和content-length的十六进制组合而成, 这样想来是个Etag加强版本的Last-Modified，毕竟Last-Modified是个时间戳，只能精确到秒
- req: If-None-Match

## h缓存判断流程
<img src="https://user-gold-cdn.xitu.io/2020/7/4/1731a0a361b2bc83?imageView2/0/w/1280/h/960/format/webp/ignore-error/1">