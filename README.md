### JavaScript SDK设计指南

- 可供参考的设计: 
- https://github.com/leancloud/javascript-sdk
- https://leancloud.cn/docs/leanstorage_guide-js.html
- https://leancloud.cn/docs/sdk_setup-js.html 

本文介绍如何对开发 JavaScript 网页应用设计SDK，适用于桌面端，移动端，不同平台，不同浏览器。对于JavaScript实现的非网页应用（硬件，嵌入式，node/io js）场景则不适用，这些场景会在未来介绍。由于我没有找到比较好的 JavaScript SDK文档，所以把我的个人经验做了整理和记录。JavaScript-SDK-设计 不仅仅介绍SDK，还包括用户和浏览器的关系。写的越多，想的越多，就开始关注不同平台，不同浏览器之间的性能和差异.

什么是SDK ?

 SDK是软件开发工具包 的缩写，是能够让编程者开发出应用程序的软件包。一般SDK包括一个或多个API、开发工具集和说明文档

 设计哲学

 SDK设计成什么样子取决于SDK用途，但是必须要原生 ，简短 ，执行迅速 ，代码干净 ，易读 ，可测试 。

 不应该使用Livescript, Coffeescript, Typescript这类寄生语言，这种语言的原理是把代码编译成JavaScript语言再执行。JavaScript的原生实现执行速度更快。

 尽量不要使用jQuery，而应该使用轻量的类库代替。如果是DOM操作可以使用zepto.js 。如果要发HTTP ajax请求 使用window.fetch。

 SDK版本一旦发布，要保证可以兼容旧版本并且要能被将来的版本兼容。所以要给SDK写文档 、写注释、做单元测试和情景测试。

 ### 范围

哪些情况你应该设计SDK？

* 1、嵌入的widgets - 在第三方网页上嵌入的交互应用(Disqus, Google Maps, Facebook Widget)。

* 2、分析和度量 - 收集用户信息，了解访客和网站交互的方式 (GA, Flurry, Mixpanel)。

* 3、封装网络服务 - 开发调用外部网站服务的客户端应用. (Facebook Graph API).

 ### SDK 内容

 应该使用异步语法来加载脚本。 应该改善用户体验，SDK类库不应该影响主页面的加载。

### 异步语法

```
<script>
  (function () {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'http://xxx.com/sdk.js';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();
</script>
```

针对现代浏览器，可以使用async。

```

<script async src="http://xxx.com/sdk.js"></script>

```

### 传统语法

```
<script type="text/javascript" src="http://xxx.com/sdk.js"></script>
```

### 比较

下列图标表示异步语法和同步语法的差别。

异步:

```
 |----A-----|
    |-----B-----------|
        |-------C------|
```

同步:

```
|----A-----||-----B-----------||-------C------|
```

### 异步的问题

如果异步加载，不能像下列代码一样调用SDK。

```
<script>
  (function () {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'http://xxx.com/sdk.js';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();

  // execute your script immediately here
  SDKName('some arguments');
</script>

``` 

这样做会导致未知的结果，因为SDKName()执行的时候尚未被加载完成。

```
<script>
  (function () {
    // add a queue event here
    SDKName = SDKName || function () {
      (SDKName.q = SDKName.q || []).push(arguments);
    };
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'http://xxx.com/sdk.js';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();

  // execute your script immediately here
  SDKName('some arguments');
</script>


<script>
  (function () {
    // add a queue event here
    SDKName = window.SDKName || (window.SDKName = []);
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'http://xxx.com/sdk.js';
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();

  // execute your script immediately here
  SDKName.push(['some arguments']);
</script>

```

### 其他

还有其他方式加载代码  ES2015中的Import 

```
 import "your-sdk";
```


### SDK版本管理


不要用类似 brand-v<timestamp>.js brand-v<datetime>.js brand-v1-v2.js的版本号，这样会导致SDK使用者不知道最新的版本是什么。

使用“主版本.小版本.补丁号”这种有语义的命名方式管理版本。v1.0.0 v1.5.0 v2.0.0这样的版本号让使用者容易在changelog文档中跟综和查找。

Normally, we can have different ways to state the SDK version, it depends on your service and design. Using Query String path.

```
http://xxx.com/sdk.js?v=1.0.0
```

Using the Folder Naming.

```
http://xxx.com/v1.0.0/sdk.js
```

Using hostname (subdomain).

```
http://v1.xxx.com/sdk.js
```

For the further development, you are advised to use stable unstable alpha latest experimental version.

```
http://xxx.com/sdk-stable.js
http://xxx.com/sdk-unstable.js
http://xxx.com/sdk-alpha.js
http://xxx.com/sdk-latest.js
http://xxx.com/sdk-experimental.js
```

### Changelog Document

如果SDK有升级，应该通知SDK使用者。major，minor版本甚至是修改bug都应该写Changelog Document。 使用者会有一个好的体验

- https://keepachangelog.com/en/1.0.0/

每个版本都应该有：

```

[Added] for new features.
[Changed] for changes in existing functionality.
[Deprecated] for once-stable features removed in upcoming releases. 
[Removed] for deprecated features removed in this release.
[Fixed] for any bug fixes.
[Security] to invite users to upgrade in case of vulnerabilities.

```

### 命名空间

应该最多定义一个命名空间，不要使用通用的名字定义命名空间以防止和其他类库冲突。

应该用(function () { ... })()把SDK代码包起来。

jQuery, Node.js等等类库经常使用的一个方法是把创造私有命名空间的整个文件用闭包包起来，这样可以避免和其他模块冲突。


>  避免命名空间冲突

参考Google Analytics项目你可以通过改变ga的值来定义你的命名空间。

```
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
```

OpenX 的经验是提供一个参数来请求相关命名空间

https://docs.openx.com/ad_server/adtags_namespace.html


### 存储机制

> Cookie

考虑subdomain 和 path 情况，使用Cookie的范围非常复杂。


1. 对于path=/， 在 http://github.com ，cookie有first=value1 在http://sub.github.com， 有另一个cookie:second=value2 | --- | http://github.com | http://sub.github.com | |:---------:|:------------:|:------------: | |first=value1| ✓ | ✓| |second=value2| ✘ | ✓|

2. first=value1 在 http://github.com 生效, second=value2 在 http://github.com/path1 生效， third=value3 在 http://sub.github.com 生效,
| --- | http://github.com | http://github.com/path1 | http://sub.github.com| |:---------:|:------------:|:------------:|:------------:| |first=value1 | ✓ | ✓ | ✓|
|second=value2 | ✘ | ✓ | ✘| |third=value3 | ✘ | ✘ | ✓|


> 检查Cookie可写性

* 给定一个域（假设是当前主机名），检查cookie是否可写。

```

var checkCookieWritable = function(domain) {
    try {
        // Create cookie
        document.cookie = 'cookietest=1' + (domain ? '; domain=' + domain : '');
        var ret = document.cookie.indexOf('cookietest=') != -1;
        // Delete cookie
        document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT' + (domain ? '; domain=' + domain : '');
        return ret;
    } catch (e) {
        return false;
    }
};

```

> 检查第三方Cookie可写性

只用客户端JavaScript无法实现，需要一个服务器做这件事情

https://dl.dropboxusercontent.com/u/105727/web/3rd/third-party-cookies.html


> 读写删除Cookie

读/写/删除 cookie 代码片段。

```

var cookie = {
    write: function(name, value, days, domain, path) {
        var date = new Date();
        days = days || 730; // two years
        path = path || '/';
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = '; expires=' + date.toGMTString();
        var cookieValue = name + '=' + value + expires + '; path=' + path;
        if (domain) {
            cookieValue += '; domain=' + domain;
        }
        document.cookie = cookieValue;
    },
    read: function(name) {
        var allCookie = '' + document.cookie;
        var index = allCookie.indexOf(name);
        if (name === undefined || name === '' || index === -1) return '';
        var ind1 = allCookie.indexOf(';', index);
        if (ind1 == -1) ind1 = allCookie.length;
        return unescape(allCookie.substring(index + name.length + 1, ind1));
    },
    remove: function(name) {
        if (this.read(name)) {
            this.write(name, '', -1, '/');
        }
    }
};

```

### Session

- 客户端JavaScript代码无法写session，请参考服务端实现。

- 浏览器打开页面，session一直有效，页面的重新加载和恢复，session也不会被删除。在新tab页或者窗口中打开页面会导致新的session初始化。


### 本地存储

- 存储的数据没有有效期，数据的额度可以很多（至少5M）并且不会转到服务端。

- 相同域的本地存储不能共享，可以在站点内部创建框架并且可以用postMessage在本地存储之间传递数据。

http://stackoverflow.com/questions/10502469/is-there-any-workaround-to-make-use-of-html5-localstorage-on-both-http-and-https

### 检查本地存储可写行

- 不是每个浏览器都支持window.localStorage，SDK在使用之前必须确认是否可用。

```
var testCanLocalStorage = function() {
   var mod = 'modernizr';
   try {
       localStorage.setItem(mod, mod);
       localStorage.removeItem(mod);
       return true;
   } catch (e) {
       return false;
   }
};
```

### Session 存储

- 为session存储数据（当tab页关闭，数据失效）。

> 检查SessionStorage可写性

```
var checkCanSessionStorage = function() {
  var mod = 'modernizr';
  try {
    sessionStorage.setItem(mod, mod);
    sessionStorage.removeItem(mod);
    return true;
  } catch (e) {
    return false;
  }
}
```

### 事件

- 浏览器端有load unload on off bind 事件，这里有一些代码可以处理不同浏览器的差异.

### Document Ready

- 在开始执行SDK功能之前要先确保整个页面加载完成。

```

function ready (fn) {
    if (document.readyState != 'loading') {
        fn();
    } else if (window.addEventListener) {
        // window.addEventListener('load', fn);
        window.addEventListener('DOMContentLoaded', fn);
    } else {
        window.attachEvent('onreadystatechange', function() {
            if (document.readyState != 'loading')
                fn();
            });
    }
}

```

- 在document已经被完全加载和解析后执行，不用等stylesheets，images和子模块完成加载。

- load事件可以用来探测页面是否完全加载

https://github.com/loverajoel/jstips/blob/gh-pages/_posts/en/2016-02-15-detect-document-ready-in-pure-js.md


### 消息事件

- 关于iframe和窗口的跨源通信，请读  https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

```

// in the iframe
parent.postMessage("Hello"); // string

// ==========================================

// in the iframe's parent
// Create IE + others compatible event handler
var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

// Listen to message from child window
eventer(messageEvent,function(e) {
  // e.origin , check the message origin
  console.log('parent received message!:  ',e.data);
},false);

```

发送的消息格式应该是String，如果用json做一些高级用法，就用JSON String。虽然很多浏览器支持对参数的结构化克隆算法 ，但并不是全部浏览器都支持。

### 方向改变

* 探测设备方向改变。

```
 
 window.addEventListener('orientationchange', fn);

```

* 得到方向旋转角度。

```

window.orientation; // => 90, -90, 0

```

* 竖屏正方向，竖屏反方向，横屏正方向，横屏反方向。（实验性的）

```
// https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
var orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;

```

### 禁止滚屏

- 电脑页面用CSS代码overflow: hidden，移动页面不支CSS这种写法，用javascript事件。

```
document.addEventListener('touchstart', function(e){ e.preventDefault(); }); // prevent scroll

// or 
document.body.addEventListener('touchstart', function(e){ e.preventDefault(); }); // prevent scroll

// use move if you need some touch event
document.addEventListener('touchmove', function(e){ e.preventDefault(); }); // prevent scroll

```

### 请求

- 我们的SDK用Ajax请求和服务器通信，虽然可以用jQuery ajax请求，但这里我们有更好的方案实现它。


### 参考文献:
 - https://www.zcfy.cc/article/javascript-sdk-design-guide-530.html
 - 第三方JavaScript.
 - ga 项目: https://github.com/react-ga/react-ga
 - 极光sdk 设计. https://docs.jiguang.cn/jmessage/client/im_sdk_js_v2/
 - https://keepachangelog.com/en/1.0.0/
 - 从”秒杀问题“入手，如何设计Node.js?  https://www.youtube.com/watch?v=YVQNA1y6NEg
 - HOW TO Design Apis https://www.youtube.com/watch?v=qCdpTji8nxo.
 - https://www.jianshu.com/p/47d29692524b.
 - https://github.com/leancloud/javascript-sdk 
 - http://liubin.org/promises-book/  JavaScript Promise迷你书
 - https://developers.facebook.com/docs/apis-and-sdks?locale=zh_CN·
 - javascript sdk设计指南 https://www.zcfy.cc/original/403
 - http://jssdk.sinaapp.com/
 - https://js8.in/2016/06/29/javascript%20sdk(jssdk)%E8%AE%BE%E8%AE%A1%E6%8C%87%E5%8D%97/
 - https://www.zcfy.cc/article/javascript-sdk-design-guide-530.html