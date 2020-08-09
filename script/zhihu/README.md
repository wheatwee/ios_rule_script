# 知乎

## 知乎去广告

主要功能：

1. 去除关注、推荐的广告
2. 去除官方账号消息的广告
3. 去除关注顶部的最常访问
4. 去除未读消息的红点
5. 去除知乎指南提醒

部分去广告的思路来自 https://github.com/onewayticket255/Surge-Script

如果出现去广告无效的情况，一般是由于CDN服务器的IP没有加到MITM中引起的。

临时解决方法：

1. 清理知乎的缓存
2. 卸载知乎后重装
3. 安装已经验证过的版本
4. 增加一个 * 的MITM，慎用，100%能去广告，但是副作用非常大

### 测试情况

2020年8月8日：

在知乎 V6.5.1.1(2518)、Surge4.10.0(1788) TF、Quantumult X 1.0.14(359) TF、Loon 2.1.3(191) TF 中测试通过。

## 黑名单增强

知乎的黑名单设计比较脑残，将某人拉黑后，他的回答依旧会出现在推荐列表和问题的答案中。

黑名单增强就是对黑名单中用户的回答进行屏蔽，让他彻底推荐列表和回答列表中消失。

如果需要定向查看某个黑名单的用户，请搜索他的名称，然后点进去看他的回答。

#### 自定义黑名单

首次使用时，请从“我的”-“设置”-“屏蔽设置”-“管理黑名单”，进入黑名单列表。不断往下滑动，直到滑动到列表底部。滑动到底部后，会弹出通知“知乎黑名单获取结束”，表示黑名单获取完成。此时黑名单为脚本内置黑名单与用户自定义黑名单的并集，如果不需要脚本内置的黑名单，则fork后自行修改。

黑名单匹配方式为用户名，同名用户都会被屏蔽，“[已重置]”除外。

每次添加或移除黑名单用户，脚本内置的黑名单也会同步更新。

![](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/images/01.jpg)

![](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/images/03.jpg)

![](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/images/02.jpg)

## 配置说明

#### Surge

配置文件

```ini
[Rule]
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_remove_ads.surge,REJECT

[Map Local]
# 知乎去除最常访问
^https?:\/\/api\.zhihu\.com\/moments\/recent data="https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/blank.json"
# 知乎去除未读消息红点
^https?:\/\/api\.zhihu\.com\/notifications\/v3\/count data="https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/blank.json"
# 知乎指南屏蔽
^https?:\/\/api\.zhihu\.com\/me\/guides data="https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/blank.json"

[Script]
知乎_我的MCN = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api\.zhihu\.com/people/,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_信息流去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api\.zhihu\.com/(moments|topstory)/recommend,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_获取黑名单 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api\.zhihu\.com\/settings\/blocked_users,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_回答黑名单增强 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api\.zhihu\.com/v4/questions,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_官方消息去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api\.zhihu\.com\/notifications\/v3\/(message\?|timeline\/entry\/system_message),script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js

[MITM]
hostname = www.zhihu.com, api.zhihu.com, link.zhihu.com, 118.89.204.198
```

或者使用模块

```ini
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.sgmodule
```

#### Loon

配置文件

```ini
[Remote Rule]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_remove_ads.loon, policy=REJECT, tag=知乎, enabled=true

[Remote Script]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.loon, tag=知乎_去广告及黑名单增强, enabled=true
```

#### Quantumult X

配置文件

```ini
[filter_remote]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_remove_ads.quanx, tag=知乎去广告, force-policy=REJECT, enabled=true

[rewrite_remote]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.quanx, tag=知乎_去广告及黑名单增强, update-interval=86400, opt-parser=false, enabled=true
```

## 减少屏蔽数量

知乎去除最常访问、知乎去除未读消息红点、知乎指南屏蔽、黑名单功能增强已不属于屏蔽广告范畴，如果只想单纯屏蔽广告，