前端手册
#通用方法
#$tab对象
$tab对象用于做应用页面操作、打开页面、跳转页面、返回页面等，它定义在plugins/tab.js文件中，它有如下方法

关闭所有页面，打开到应用内的某个页面
this.$tab.reLaunch("/pages/system/user");

this.$tab.reLaunch("/pages/system/user").then(() => {
  // 执行结束的逻辑
})
跳转到tabBar页面，并关闭其他所有非tabBar页面
this.$tab.switchTab("/pages/index");

this.$tab.switchTab("/pages/index").then(() => {
  // 执行结束的逻辑
})
关闭当前页面，跳转到应用内的某个页面
this.$tab.redirectTo("/pages/index");

this.$tab.redirectTo("/pages/index").then(() => {
  // 执行结束的逻辑
})
保留当前页面，跳转到应用内的某个页面
this.$tab.navigateTo("/pages/system/user");

this.$tab.navigateTo("/pages/system/user").then(() => {
  // 执行结束的逻辑
})
关闭当前页面，返回上一页面或多级页面
this.$tab.navigateBack();

this.$tab.navigateBack().then(() => {
  // 执行结束的逻辑
})
#$modal对象
$modal对象用于做消息提示、对话框提醒、二次确认、遮罩等，它定义在plugins/modal.js文件中，它有如下方法

提供成功、警告和错误等反馈信息
this.$modal.msg("默认反馈");
this.$modal.msgError("错误反馈");
this.$modal.msgSuccess("成功反馈");
this.$modal.hideMsg(); // 隐藏消息提示框
提供成功、警告和错误等提示信息
this.$modal.alert("默认提示");
提供确认窗体信息
this.$modal.confirm('确认信息').then(() => {
  ...
})
提供遮罩层信息
// 打开遮罩层
this.$modal.loading("正在导出数据，请稍后...");

// 关闭遮罩层
this.$modal.closeLoading();
#$auth对象
$auth对象用于验证用户是否拥有某（些）权限或角色，它定义在plugins/auth.js文件中，它有如下方法

验证用户权限
// 验证用户是否具备某权限
this.$auth.hasPermi("system:user:add");
// 验证用户是否含有指定权限，只需包含其中一个
this.$auth.hasPermiOr(["system:user:add", "system:user:update"]);
// 验证用户是否含有指定权限，必须全部拥有
this.$auth.hasPermiAnd(["system:user:add", "system:user:update"]);
验证用户角色
// 验证用户是否具备某角色
this.$auth.hasRole("admin");
// 验证用户是否含有指定角色，只需包含其中一个
this.$auth.hasRoleOr(["admin", "common"]);
// 验证用户是否含有指定角色，必须全部拥有
this.$auth.hasRoleAnd(["admin", "common"]);
#开发规范
#新增 page
在 @/pages (opens new window)文件下 创建对应的文件夹，一般性一个路由对应一个文件， 该模块下的功能就建议在本文件夹下创建一个新文件夹，各个功能模块维护自己的utils或components组件。

#新增 api
在 @/api (opens new window)文件夹下创建本模块对应的 api 服务。

#新增组件
在全局的 @/components (opens new window)写一些全局的组件，如富文本，各种搜索组件，封装的分页组件等等能被公用的组件。 每个页面或者模块特定的业务组件则会写在当前 @/pages (opens new window)下面。
如：@/pages/system/user/components/xxx.vue。这样拆分大大减轻了维护成本。

#新增样式
页面的样式和组件是一个道理，全局的 @/style (opens new window)放置一下全局公用的样式，每一个页面的样式就写在当前 page下面，请记住加上scoped 就只会作用在当前组件内了，避免造成全局的样式污染。

/* 编译前 */
.example {
  color: red;
}

/* 编译后 */
.example[_v-f3f3eg9] {
  color: red;
}
#请求流程
#交互流程
一个完整的前端 UI 交互到服务端处理流程是这样的：

UI 组件交互操作；
调用统一管理的 api service 请求函数；
使用封装的 request.js 发送请求；
获取服务端返回；
更新 data；
为了方便管理维护，统一的请求处理都放在 @/api (opens new window)文件夹中，并且一般按照 model 维度进行拆分文件，如：

api/
  system/
    user.js
    role.js
  monitor/
    operlog.js
	logininfor.js
  ...
提示

其中，@/utils/request.js (opens new window)是基于 uniapp 的封装，便于统一处理 POST，GET 等请求参数，请求头，以及错误提示信息等。 它封装了全局request拦截器、response拦截器、统一的错误处理、统一做了超时处理、baseURL设置等。

#请求示例
// api/system/user.js
import request from '@/utils/request'

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

// pages/system/user/index.vue
import { listUser } from "@/api/system/user";

export default {
  data() {
    userList: null,
    loading: true
  },
  methods: {
    getList() {
      this.loading = true
      listUser().then(response => {
        this.userList = response.rows
        this.loading = false
      })
    }
  }
}
提示

如果有不同的baseURL，直接通过覆盖的方式，让它具有不同的baseURL。

export function listUser(query) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query,
    baseURL: process.env.BASE_API
  })
}
#引入依赖
除了uniui组件以及脚手架内置的业务组件，有时我们还需要引入其他外部组件。

在终端输入下面的命令完成安装：

$ npm install xxxx --save
加上 --save 参数会自动添加依赖到 package.json 中去。


#路由使用
页面路由为框架统一管理，开发者需要在pages.json里配置每个路由页面的路径及页面样式。类似小程序在app.json中配置页面路由一样。

在uni-app中有两种页面路由跳转方式：使用navigator组件跳转或调用api跳转。

#组件跳转方式
该组件类似HTML中的<a>组件，但只能跳转本地页面。目标页面必须在pages.json中注册。

属性说明

属性名	类型	默认值	描述
url	String		应用内的跳转链接，值为相对路径或绝对路径，如"../first/first"，"/pages/first/first"
open-type	String	navigate	跳转方式
delta	Number		当open-type为navigateBack时有效，表示回退的层数
animation-type	String	pop-in/out	当open-type为navigate、navigateBack时有效，窗口的显示/关闭动画效果
animation-duration	Number	300	当open-type为navigate、navigateBack时有效，窗口显示/关闭动画的持续时间
hover-class	String	navigator-hover	指定点击时的样式类，当hover-class="none"时，没有点击态效果
hover-stop-propagation	Boolean	false	指定是否阻止本节点的祖先节点出现点击态
hover-start-time	Number	50	按住后多久出现点击态，单位毫秒
hover-stay-time	Number	600	手指松开后点击态保留时间，单位毫秒
target	String	self	在哪个小程序目标上发生跳转，默认当前小程序，值域self/miniProgram
open-type有效值

值	说明
navigate	对应uni.navigateTo的功能
redirect	对应uni.redirectTo的功能
switchTab	对应uni.switchTab的功能
reLaunch	对应uni.reLaunch的功能
navigateBack	对应uni.navigateBack的功能
exit	退出小程序target="miniProgram"时生效
示例代码

<template>
  <view>
    <view class="page-body">
      <view class="btn-area">
        <navigator url="navigate/navigate?title=navigate" hover-class="navigator-hover">
          <button type="default">跳转到新页面</button>
        </navigator>
        <navigator url="redirect/redirect?title=redirect" open-type="redirect" hover-class="other-navigator-hover">
          <button type="default">在当前页打开</button>
        </navigator>
        <navigator url="/pages/tabBar/extUI/extUI" open-type="switchTab" hover-class="other-navigator-hover">
          <button type="default">跳转tab页面</button>
        </navigator>
      </view>
    </view>
  </view>
</template>
<script>
  // navigate.vue页面接受参数
  export default {
    onLoad: function(option) { //option为object类型，会序列化上个页面传递的参数
      console.log(option.id); //打印出上个页面传递的参数。
      console.log(option.name); //打印出上个页面传递的参数。
    }
  }
</script>
由于url有长度限制，太长的字符串会传递失败，可使用encodeURIComponent等多种方式解决，如下为encodeURIComponent示例。

<navigator :url="'/pages/navigate/navigate?item='+ encodeURIComponent(JSON.stringify(item))"></navigator>
// navigate.vue页面接受参数
onLoad: function (option) {
	const item = JSON.parse(decodeURIComponent(option.item));
}
#调用API跳转方式
无参方式

uni.navigateTo({
  url:'/pages/login'
})
带参数方式

uni.navigateTo({
  url:'/pages/login?id=1&name=ry'
})
获取参数

export default {
  onLoad(option) {
    console.log(option.id);
    console.log(option.name);
  }
}
内置封装参考 $tab对象使用方法

更多原生api使用参考uniapp-api-router (opens new window)官方文档。

#组件使用
参考组件使用

#权限使用
由于uniapp小程序不适合使用指令，只能通过手动设置v-if全局权限判断函数。

<template>
  <uni-grid>
    <uni-grid-item v-if="checkPermi(['system:user:add'])">用户管理</uni-grid-item>
    <uni-grid-item v-if="checkPermi(['system:user:add', 'system:user:edit'])">参数管理</uni-grid-item>
    <uni-grid-item v-if="checkRole(['admin'])">角色管理</uni-grid-item>
    <uni-grid-item v-if="checkRole(['admin','common'])">定时任务</uni-grid-item>
   </uni-grid>
</template>

<script>
import { checkPermi, checkRole } from "@/utils/permission"; // 权限判断函数

export default{
   methods: {
    checkPermi,
    checkRole
  }
}
</script>
前端有了鉴权后端还需要鉴权吗？

前端的鉴权只是一个辅助功能，对于专业人员这些限制都是可以轻松绕过的，为保证服务器安全，无论前端是否进行了权限校验，后端接口都需要对会话请求再次进行权限校验！

#使用图标
图标组件，用于展示移动端常见的图标，可自定义颜色、大小。

#参数说明
图标属性

属性名	类型	默认值	说明
size	Number	24	图标大小
type	String		图标图案
color	String		图标颜色
customPrefix	String		自定义图标
图标事件

事件名	说明
@click	点击 Icon 触发事件
#使用方式
<uni-icons type="contact" size="30"></uni-icons>
更多图标图案参考 icons图标(opens new window)

#自定义图标
自定义图标需要先获取

1、访问阿里图标库 (opens new window)，搜索图标并加入购物车。

2、点击页面右上角购物车图标 ，点击添加至项目，如没有项目，需要先添加一个项目目录，选择项目后点击确定。

3、确定后进入项目，点击项目设置，对图标库进行一些编辑（根据实际情况调整，一般不需要动）。

4、点击下载到本地，解压后，需要用到的文件暂时有两个iconfont.css、iconfont.ttf。

5、将iconfont.ttf、iconfont.css放到项目根目录static下。

6、打开iconfont.css,修改@font-face如下,注意src字体文件的引用路径是否正确。

@font-face {
  font-family: "iconfont";
  src: url('/static/iconfont.ttf') format('truetype');
}
7、在static/scss/index.scss文件下引入新增的iconfont.css。

......
@import "@/static/iconfont.css"; // 这是自定义新增的iconfont引入
通过上述操作，现在就获得一个可以自定义的图标库，使用custom-prefix和type属性获取自定义图标

<uni-icons custom-prefix="iconfont" type="icon-xxxx" size="30"></uni-icons>
#使用字典
1、main.js中引入方法

import { getDicts } from "@/api/system/dict/data";
2、加载数据字典

export default {
  data() {
    return {
      xxxxxOptions: [],
      .....
...

created() {
  this.getDicts("字典类型").then(response => {
    this.xxxxxOptions = response.data;
  });
},
3、读取数据字典

<uni-data-select
  v-for="dict in xxxxxOptions"
  :key="dict.dictValue"
  :text="dict.dictLabel"
  :value="dict.dictValue"
/>
#使用参数
参数设置是提供开发人员、实施人员的动态系统配置参数，不需要去频繁修改后台配置文件，也无需重启服务器即可生效。

1、main.js中引入方法

import { getConfigKey } from "@/api/system/config";
2、页面使用参数

this.getConfigKey("参数键名").then(response => {
  this.xxxxx = response.msg;
});
#异常处理
@/request.js 是基于 uniapp 的封装，便于统一处理 POST，GET 等请求参数，请求头，以及错误提示信息等。它封装了全局 request拦截器、response拦截器、统一的错误处理、统一做了超时处理、baseURL设置等。 如果有自定义错误码可以在errorCode.js中设置对应key value值。

import store from '@/store'
import config from '@/config'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { toast, showConfirm, tansParams } from '@/utils/common'

let isShow = false
let timeout = 10000
const baseUrl = config.baseUrl

const request = config => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  config.header = config.header || {}
  if (getToken() && !isToken) {
    config.header['Authorization'] = 'Bearer ' + getToken()
  }
  // get请求映射params参数
  if (config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.url = url
  }
  return new Promise((resolve, reject) => {
    uni.request({
        method: config.method || 'get',
        timeout: config.timeout ||  timeout,
        url: config.baseUrl || baseUrl + config.url,
        data: config.data,
        header: config.header,
        dataType: 'json'
      }).then(response => {
        let [error, res] = response
        if (error) {
          toast('后端接口连接异常')
          reject('后端接口连接异常')
          return
        }
        const code = res.data.code || 200
        const msg = errorCode[code] || res.data.msg || errorCode['default']
        if (code === 401 && !isShow) {
          isShow = true
          showConfirm('登录状态已过期，您可以继续留在该页面，或者重新登录?').then(res => {
            if (res.confirm) {
              store.dispatch('LogOut').then(res => {
                uni.reLaunch({ url: '/pages/login' })
              })
            }
          }).catch(() => {
            isShow = false
          })
          reject('无效的会话，或者会话已过期，请重新登录。')
        } else if (code === 500) {
          toast(msg)
          reject('500')
        } else if (code !== 200) {
          toast(msg)
          reject(code)
        }
        resolve(res.data)
      })
      .catch(error => {
        let { message } = error
        if (message === 'Network Error') {
          message = '后端接口连接异常'
        } else if (message.includes('timeout')) {
          message = '系统接口请求超时'
        } else if (message.includes('Request failed with status code')) {
          message = '系统接口' + message.substr(message.length - 3) + '异常'
        }
        toast(message)
        reject(error)
      })
  })
}

export default request
提示

如果有些不需要传递token的请求，可以设置headers中的属性isToken为false

export function login(username, password, code, uuid) {
  return request({
    url: 'xxxx',
    headers: {
      isToken: false,
      // 可以自定义 Authorization
	  // 'Authorization': 'Basic d2ViOg=='
    },
    method: 'get'
  })
}