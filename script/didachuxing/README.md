# 嘀嗒出行

嘀嗒出行自动签到和自动拾取贝壳脚本。每日0点10分执行脚本，自动进行当日签到，并显示签到获取的贝壳数量。同时拾取所有贝壳广场中的所有贝壳。

## 配置说明

### Surge

**安装模块**

Surge推荐使用模块进行部署，模块地址：https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/didachuxing/didachuxing_plus.sgmodule

**配置文件**

如果不方便使用模块，则根据如下内容修改配置文件

```ini
[Script]
嘀嗒出行_每日签到 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/didachuxing/didachuxing_plus.js,script-update-interval=0,type=cron,cronexp=10 0 * * *
嘀嗒出行_获取cookie = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/didachuxing/didachuxing_plus.js,script-update-interval=0,type=http-request,pattern=^https?:\/\/www\.didapinche\.com\/hapis\/.*\/getBeikeAccount\?userCid=.*

[MITM]
hostname = www.didapinche.com
```

## 使用说明

打开嘀嗒出行App后，进入左侧菜单中的“贝壳广场”，正常情况下会自动获取Cookie。如果没有获取成功，请查阅Surge等第三方App的执行日志。

执行效果图，脚本更新时可能会进行微调。

![](https://github.com/blackmatrix7/ios_rule_script/raw/master/script/didachuxing/images/didachuxing_checkin01.jpg)

