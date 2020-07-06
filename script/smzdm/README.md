# 什么值得买

什么值得买Web端和App端每日自动签到脚本，签到完成后，显示连续签到次数和签到收益。

## 配置说明

### Surge

**安装模块**

Surge推荐使用模块进行部署，模块地址：https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.sgmodule

**配置文件**

如果不方便使用模块，则根据如下内容修改配置文件

```ini
[Script]
什么值得买_每日签到 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,script-update-interval=0,type=cron,cronexp=10 0 * * *
什么值得买_获取cookie = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,script-update-interval=0,type=http-request,requires-body=true,pattern=^https?:\/\/zhiyou\.smzdm\.com\/user$
什么值得买_获取账号密码 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,script-update-interval=0,type=http-request,requires-body=true,pattern=^https?:\/\/user-api\.smzdm\.com\/user_login\/normal$

[MITM]
hostname = zhiyou.smzdm.com, user-api.smzdm.com
```

## 使用说明

**Web端获取Cookie：**

使用手机浏览器访问https://zhiyou.smzdm.com/进行一次登录，通常会显示获取cookie成功。

可能因为重定向的问题，登录成功后访问的不是https://zhiyou.smzdm.com/user/，则重新在浏览器中访问一次https://zhiyou.smzdm.com/user/即可。

如果还是没有获取到Cookie，请查阅Surge等第三方App的执行日志。

**App端获取账号密码：**

> 特别说明：
>
> 因为手机端需要使用账号密码换取token，再通过token签到，如果需要获取一次账号密码。账号密码只会在本地存储，不会对外发送，脚本完全开源，如有疑惑可以查阅脚本源码。

打开什么值得买App，点击“我的“-“设置”-“退出登录”，先退出登录。随后点击“我的”中顶部的“立即登录”，选择“账号密码登录”，注意是账号密码登录，不要使用手机快捷登录或其他第三方登录方式。

登录完成后，提示获取账号密码成功，就说明没有问题了。如果没有提示，还是查阅一下第三方App的执行日志。在登录过程中，无论账号密码正确与否，都会进行获取和保存，如果账号密码有错，则重新登录一次即可，脚本会自动更新所保存的账号密码。

以上在什么值得买的iPhone 9.5.17版本测试通过。

目前App端的签到，没有任何收益，纯粹只是娱乐。





