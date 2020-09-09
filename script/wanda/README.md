# 万达电影—签到

脚本修改自

https://github.com/chavyleung/scripts/tree/master/wanda

做以下改动：

1. 解决配置成Surge模块，不注释获取Cookie的脚本时，打开万达电影APP反复弹出获取Cookie成功的通知
2. 合并脚本文件，减少引用外部文件数量

## 配置说明

### Surge

使用模块

https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/wanda/wanda_checkin.sgmodule

### Loon

使用远程脚本配置

```ini
[Remote Script]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/wanda/wanda_checkin.lnscript, tag=万达电影_每日签到, enabled=true
```

### Quantumult X

配置文件

```ini
[rewrite_remote]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/wanda/wanda_checkin.qxrewrite, tag=万达电影_获取Cookie, enabled=true

[task_local]
20 0 * * * https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/wanda/wanda_checkin.js, tag=万达电影_每日签到, enabled=true
```

## 获取Cookie

万达电影APP - 我的 