# 知乎

## 知乎去广告及黑名单增强

知乎去信息流、推荐、官方消息内的广告，对黑名单效果进行增强。

知乎的黑名单设计，将某人拉黑后，他的回答依旧会出现在问题的答案中，黑名单增强就是对黑名单中用户的回答进行去除，让他彻底从回答列表中消失。

部分去广告的代码来自 https://github.com/onewayticket255/Surge-Script

### 配置说明

#### Surge

##### **配置文件**

```ini
[Script]
知乎_用户信息去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https://api.zhihu.com/people/,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_信息流去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https://api.zhihu.com/moments/recommend,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_推荐去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https://api.zhihu.com/topstory/recommend,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_回答黑名单增强 = type=http-response,requires-body=1,max-size=0,pattern=^https://api.zhihu.com/v4/questions,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_官方消息去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api.zhihu.com\/notifications\/v3\/message\?,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_消息列表去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api.zhihu.com\/notifications\/v3\/timeline\/entry\/system_message,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js

[MITM]
hostname = api.zhihu.com
```

### Loon

**远程脚本**

```ini
[Remote Script]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.loon, tag=知乎_去广告及黑名单增强, enabled=true
```

### Quantumult X

**远程复写**

```ini
[rewrite_remote]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.quanx, tag=知乎_去广告及黑名单增强, update-interval=86400, opt-parser=false, enabled=true
```

