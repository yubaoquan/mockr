# mockr
简单的基于 koa 的 mock 数据服务器


## 安装

> npm i @ybq/mockr

## 用法

> npm run mockr

mockr 会在当前目录(执行命令的目录)下寻找名为 `mockr-config.js` 的配置文件

## 配置

### 默认匹配规则
如果没有特殊指明, mockr 对所有的请求使用一条默认的匹配规则: 当一个请求到达时, mockr 将在 controller 路径(由配置文件中配置的根 `controllerRoot` 和请求的 path 拼接而成)寻找并执行 controller.

例如有如下请求: `https://3000/a/b/c`, 配置文件中的 `controllerRoot` 配置为 `controllers`. mockr 中 controller 的拼装逻辑如下
```
let controllerPath = path.resolve(cwd, controllerRoot, '.', ctx.request.path)
```
cwd 是配置文件所在的文件夹, 如果 cwd 是`/Usr/xxx`, 则最终的 controller 路径为 `/Usr/xxx/controllers/a/b/c`. 此时, mockr 将尝试从这个路径 require controller 文件. 如果 require 得到的是一个函数, mockr 将执行该函数, 否则执行下面的逻辑:

```
ctx.body = requireResult
```
所以你可以在 `/Usr/xxx/controllers/a/b/` 路径添加一个 `c.js` 或 `c.json` 作为 controller

### Restful 风格匹配规则
如果请求 URL 中包含参数, 例如如下形式:

`/name/${name}/age/${age}`

真实的 URL 如下:

`/name/Tom/age/12`

可以在配置文件的 `restfulURLs` 中指定 restful URL 的模板, `restfulURLs` 的值是一个数组, 数组中每个元素代表一种 URL 模板. 在上面例子中, 配置为如下格式:

```
restfulURLs: [
    ['/name', null, '/age', null],
    // 其他模板
]
```

### 特殊规则
如果以上的规则不能满足你的需求, 你也可以定制自己的 controller 映射规则. 编辑配置文件中的 `specialControllers`, 此配置项的值是一个数组, 数组中的每一项是包含两个属性(`url`, `path`)的对象, `url` 属性可以是正则表达式, 函数或字符串. `path` 是 controller 相对 `controllerRoot` 的路径. 如果 `url` 是正则表达式, mockr 会执行正则匹配 `url.test(${requestURL})`; 如果 `url` 是函数, mockr 会将请求的 url 传入 `url` 函数获取匹配结果, 否则 mockr 直接比较 `url` 是否等于请求的 URL, 即如下:
```
let matched = url === ${requestURL}
```
如果执行结果为 true, mockr 将执行此元素 path 属性指定的 controller

### 页面渲染
Mockr 支持对 freemarker 模板的渲染. 进行页面渲染需要在配置文件中配置 `pageEntries`, `templateRoots`, `syncDataRoot` 和 `static`

`templateRoots` 是字符串数组, 每个元素代表一个文件夹, 文件夹内放置模板文件. 通常情况你只需要设置一个就够了.

`pageEntries` 也是一个数组, 数组中每个元素时包含两个或三个属性(`url`, `template`, `syncDataPath`)的对象(`syncDataPath` 可省略). `url` 同上面特殊规则提到的 url 一样, `template` 是请求对应的模板文件路径, `syndDataPath` 类似于 controller, 它提供用于渲染页面的同步数据.

获取一个请求的同步数据时, Mockr 将 `syncDataRoot` 和 `syncDataPath` 合并, 得到一个路径, 然后使用和 controller 相同的逻辑, 得到同步数据, 塞到模板中进行渲染

### 规则优先级
请求到来是, mockr 先遍历检查 `pageEntries` 规则, 查看请求是否是一个页面请求. 如果是页面请求, 并且配置了 `syndDataPath`, mockr 将 require 数据文件并渲染页面. 如果 `syncDataPath` 没配置, mockr 将使用默认规则获取同步数据并进行渲染.

如果请求不是页面请求(例如 ajax 请求), mockr 会通过特殊规则寻找 controller. 如果找到了, 直接执行 controller.
如果通过特殊规则没有找到 controller, mockr 将遍历 `restfulURLs` 查看请求的 url 是否匹配数组中的元素. 如果匹配, 则按照 restful 规则组装 controller 路径寻找 controller 并执行, 规则如下:

将请求 URL 中的参数对应的位置替换成 `_param`, 例如:

`/name/Top/age/12` 替换后的 controller 路径为 `/name/_param/age/_param`.

如果仍然没有找到 controller, mockr 将根据默认规则寻找 controller


### 特性

1. 除非修改了配置文件, 否则你不需要重启 mockr. 也就是说, controller 或其他文件的变动是即时生效的.

### 实例
等多配置细节, 见 [test](https://github.com/yubaoquan/mockr/tree/master/test)

## License

ISC