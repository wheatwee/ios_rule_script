# 联通每日签到与抽奖

## 配置说明

### Surge

使用模块，地址

```ini
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/10010/unicom_checkin.sgmodule
```

### Quantumult X

```ini
[rewrite_remote]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/10010/unicom_checkin.quanx, tag=联通_获取cookie, update-interval=86400, opt-parser=false, enabled=true

[task_local]
15 0 * * * https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/10010/unicom_checkin.js, tag=联通_签到与抽奖, enabled=true
```

### Loon

```ini
[Remote Script]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/10010/unicom_checkin.loon, tag=联通_签到与抽奖, enabled=true
```

## 获取Cookie

在联通手机营业厅v7.4.3中，进入“我的”-”天天抽奖“，弹出 Cookie、手机号、手机号密文、城市四个项目获取成功即可。

## 签到效果图

![](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/10010/images/01.jpg)

![](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/10010/images/02.jpg)

