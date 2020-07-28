# 什么值得买

## Web端和App端自动签到

什么值得买Web端和App端每日自动签到脚本，签到完成后，显示连续签到次数和签到收益。

![](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/images/checkin.jpg)

### 配置说明

#### Surge

##### **安装模块**

Surge推荐使用模块进行部署，模块地址：https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.sgmodule

##### **配置文件**

如果不方便使用模块，则根据如下内容修改配置文件

```ini
[Script]
什么值得买_每日签到 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,script-update-interval=0,type=cron,cronexp=5 0 * * *
什么值得买_获取cookie = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,script-update-interval=0,type=http-request,requires-body=true,pattern=^https?:\/\/zhiyou\.smzdm\.com\/user$
什么值得买_获取账号密码 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,script-update-interval=0,type=http-request,requires-body=true,pattern=^https?:\/\/user-api\.smzdm\.com\/user_login\/normal$

[MITM]
hostname = zhiyou.smzdm.com, user-api.smzdm.com
```

### Loon

**远程脚本**

直接在配置里修改

```ini
[Remote Script]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.loon, tag=什么值得买_每日签到, enabled=true
```

**本地脚本**

使用本地脚本时，在配置中增加如下配置项

```ini
[Script]
enable = true
# 什么值得买签到
http-request ^https?:\/\/zhiyou\.smzdm\.com\/user$ requires-body=1,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,tag=什么值得买_获取cookie
http-request ^https?:\/\/user-api\.smzdm\.com\/user_login\/normal$ requires-body=1,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,tag=什么值得买_获取账号密码
cron "5 0 * * *" script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,tag=什么值得买_每日签到

[MITM]
hostname = zhiyou.smzdm.com, user-api.smzdm.com
```

### Quantumult X

修改配置文件

```ini
[rewrite_local]
^https?:\/\/zhiyou\.smzdm\.com\/user$ url script-request-header https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js
^https?:\/\/user-api\.smzdm\.com\/user_login\/normal$ url script-request-body https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js

[task_local]
5 0 * * * https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js, tag=什么值得买每日签到

[mitm]
hostname = video.google.com,zhiyou.smzdm.com,user-api.smzdm.com
```

远程复写配置

```ini
[rewrite_remote]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.quanx, tag=什么值得买_去广告, update-interval=86400, opt-parser=false, enabled=true
```

### 使用说明

#### **Web端获取Cookie：**

使用手机浏览器访问 https://zhiyou.smzdm.com/ 进行一次登录，通常会显示获取cookie成功。

可能因为重定向的问题，登录成功后访问的不是https://zhiyou.smzdm.com/user/ ，则重新在浏览器中访问一次https://zhiyou.smzdm.com/user/ 即可。

如果还是没有获取到Cookie，请查阅Surge等第三方App的执行日志。

#### **App端获取账号密码：**

打开什么值得买App，点击“我的“-“设置”-“退出登录”，先退出登录。随后点击“我的”中顶部的“立即登录”，选择“账号密码登录”，注意是账号密码登录，不要使用手机快捷登录或其他第三方登录方式。

登录完成后，提示获取账号密码成功，就说明没有问题了。如果没有提示，还是查阅一下第三方App的执行日志。在登录过程中，无论账号密码正确与否，都会进行获取和保存，如果账号密码有错，则重新登录一次即可，脚本会自动更新所保存的账号密码。

以上在什么值得买的iPhone 9.5.17版本测试通过。

##### 隐私说明

因为手机端需要使用账号密码换取token，再通过token签到，所以需要获取一次账号密码。账号密码只会在本地存储，用于发送给“什么值得买”服务端接口用于换取token，不会发送给任何第三方。脚本完全开源，如有疑虑请查阅脚本源码。

##### 存在的问题

###### 什么值得买iPhone 9.8.5抓取不到账户名密码

在最新版的什么值得买客户端iPhone 9.8.5(2020-07-13)中，由于请求头声明异常，会导致Quantumult X和Surge的商店版本无法抓取到账户名和密码，Loon抓取正常。这个属于什么值得买客户端的请求不规范导致，修复时间未知。和Quantumlu X作者反馈，作者迅速对这种请求头不规范的情况做了兼容，目前在Qutumult X 1.0.13(348) TF版本中已经可以正常获取到数据。

现阶段的解决办法：

1. 如果有Quantumult X有TF版本，更新至最新版即可
2. 如果使用Loon，没影响
3. 如果使用Surge，降级什么值得买App后抓取 
4. clone 整个项目到本地，在本地脚本里填上预留的用户名密码

###### App端签到没有收益

目前App端的签到，反复确认没有任何收益，纯粹只是娱乐。另外在凌晨高峰期签到，有很大的概率会出现“主页君较忙”的提示，导致签到失败。这个是什么值得买服务器接口的问题，非脚本可以解决。所以脚本内置了5次App端签到机会，每次间隔3秒。如果三次签到后还是失败，会在通知中显示App签到失败，避开高峰时期再手动执行一次脚本即可。

## 去广告

去除什么值得买首页、好价、好文内的广告

### 配置说明

#### Surge

##### 配置文件

在配置文件中修改。

```ini
[MITM]
hostname = homepage-api.smzdm.com, haojia-api.smzdm.com, article-api.smzdm.com

[Script]
什么值得买_首页去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/homepage-api.smzdm.com\/home\?ad_info,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.js
什么值得买_好价去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/haojia-api.smzdm.com\/home\/list\?,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.js
什么值得买_好文去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/article-api.smzdm.com\/article\/index_home_page\?ad_info,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.js
```

##### 模块安装

模块地址： https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.sgmodule

### Loon

**本地脚本**

```ini
[Script]
enable = true
http-response ^https:\/\/homepage-api.smzdm.com\/home\?ad_info script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.js, requires-body=true, timeout=10, tag=什么值得买_首页去广告
http-response ^https:\/\/haojia-api.smzdm.com\/home\/list\? script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.js, requires-body=true, timeout=10, tag=什么值得买_好价去广告
http-response ^https:\/\/article-api.smzdm.com\/article\/index_home_page\?ad_info script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.js, requires-body=true, timeout=10, tag=什么值得买_好文去广告

[MITM]
hostname = homepage-api.smzdm.com, haojia-api.smzdm.com, article-api.smzdm.com
```

**远程脚本**

```ini
[Remote Script]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.loon, tag=什么值得买_去广告, enabled=true
```

### Quantumult X

**本地复写脚本**

```ini
[rewrite_local]
^https:\/\/homepage-api.smzdm.com\/home\?ad_info url script-response-body https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.js
^https:\/\/haojia-api.smzdm.com\/home\/list\? url script-response-body https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.js
^https:\/\/article-api.smzdm.com\/article\/index_home_page\?ad_info url script-response-body https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.js

[mitm]
hostname = homepage-api.smzdm.com, haojia-api.smzdm.com, article-api.smzdm.com
```

**远程复写脚本**

```ini
[rewrite_remote]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_remove_ads.quanx, tag=什么值得买_去广告, update-interval=86400, opt-parser=false, enabled=true
```

