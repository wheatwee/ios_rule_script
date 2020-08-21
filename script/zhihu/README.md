# 知乎增强

## 介绍

去除知乎广告，提供黑名单增强等功能。

分为Plus和Lite两个版本，带✨号的为Plus版本的功能。

目前已实现：

1. 去除关注列表的广告
2. 去除推荐列表的广告
3. 去除回答列表的广告
4. 去除回答列表的圆桌
5. 去除官方账号的推广消息✨
6. 去除推荐列表中黑名单用户的回答✨
7. 去除回答列表中黑名单用户的回答✨
8. 去除关注顶部的最常访问✨
9. 去除未读消息的红点✨
10. 去除知乎指南提示✨

## 最近更新

1. 去除脚本内置的答主黑名单，现在屏蔽谁完全由你决定。如果出现屏蔽失效，请重新获取黑名单。
2. 解决关注列表切换为”时间排序“时去广告失效的问题
3. 解决知乎直播无法访问的问题
4. 去除回答列表的圆桌

## 去广告

部分去广告的思路来自 https://github.com/onewayticket255/Surge-Script

如果出现去广告无效的情况，一般是由于CDN服务器的IP没有加到MITM中引起的。

临时解决方法：

1. **将去广告规则的优先级调整到最高**
2. 清理知乎的缓存
3. 卸载知乎后重装
4. 安装已经验证过的版本
5. 增加一个 * 的MITM，慎用，100%能去广告，但是副作用非常大

### 验证情况

2020年8月8日：

在知乎 V6.5.1.1(2518)、Surge4.10.0(1788) TF、Quantumult X 1.0.14(359) TF、Loon 2.1.3(191) TF 中验证通过。

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

配置说明以Plus版本为主，Lite版本的配置说明见文末。

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
知乎_去除MCN信息 = type=http-response,requires-body=1,max-size=0,pattern=^https?:\/\/api\.zhihu\.com\/people\/,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_信息流去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https?:\/\/api\.zhihu\.com\/(moments|topstory)(\/|\?)?(recommend|action=|feed_type=),script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_获取黑名单 = type=http-response,requires-body=1,max-size=0,pattern=^https?:\/\/api\.zhihu\.com\/settings\/blocked_users,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_回答黑名单增强 = type=http-response,requires-body=1,max-size=0,pattern=^https?:\/\/api\.zhihu\.com\/v4\/questions,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_官方消息去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https?:\/\/api\.zhihu\.com\/notifications\/v3\/(message\?|timeline\/entry\/system_message),script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js

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
[Rule]
# 知乎直播修正
URL-REGEX,^https?:\/\/api\.zhihu\.com\/drama\/,DIRECT
# 知乎去广告
DOMAIN,118.89.204.198,REJECT,no-resolve
DOMAIN-SUFFIX,118.89.204.198,REJECT,no-resolve
DOMAIN-KEYWORD,118.89.204.198,REJECT,no-resolve
IP-CIDR,118.89.204.198/32,REJECT,no-resolve
DOMAIN,appcloud2.zhihu.com,REJECT
DOMAIN,appcloud2.in.zhihu.com,REJECT
USER-AGENT,AVOS*,REJECT
URL-REGEX,^https?:\/\/api\.zhihu\.com/(ad|fringe|commercial|market/popover|search/(top|preset|tab)|.*featured-comment-ad),REJECT

[URL Rewrite]
# 知乎直播修正
^https?:\/\/api\.zhihu\.com\/drama\/ https://api.zhihu.com/drama/ header

[Remote Script]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.loon, tag=知乎_去广告及黑名单增强, enabled=true
```

Loon 2.1.3(193) TF + 可以使用插件Plugin

```ini
[Plugin]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.loonplugin
```

#### Quantumult X

配置文件

```ini
[filter_local]
# 知乎去广告
DOMAIN,118.89.204.198,REJECT
DOMAIN-SUFFIX,118.89.204.198,REJECT
DOMAIN-KEYWORD,118.89.204.198,REJECT
IP-CIDR,118.89.204.198/32,REJECT
USER-AGENT,AVOS*,REJECT
DOMAIN-SUFFIX,appcloud2.zhihu.com,REJECT
DOMAIN-SUFFIX,appcloud2.in.zhihu.com,REJECT

[rewrite_remote]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.quanx, tag=知乎_去广告, update-interval=86400, opt-parser=false, enabled=true
```

## 我只想单纯的去个广告……

知乎去除最常访问、知乎去除未读消息红点、知乎指南屏蔽、黑名单功能增强已不属于屏蔽广告范畴，如果只想单纯去广告，使用下面的Lite版本的配置

### Surge

使用模块

```ini
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_lite.sgmodule
```

#### Quantumult X

配置文件

```ini
[filter_local]
# 知乎去广告
DOMAIN,118.89.204.198,REJECT
DOMAIN-SUFFIX,118.89.204.198,REJECT
DOMAIN-KEYWORD,118.89.204.198,REJECT
IP-CIDR,118.89.204.198/32,REJECT
USER-AGENT,AVOS*,REJECT
DOMAIN-SUFFIX,appcloud2.zhihu.com,REJECT
DOMAIN-SUFFIX,appcloud2.in.zhihu.com,REJECT

[rewrite_remote]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_lite.quanx, tag=知乎_去广告, update-interval=86400, opt-parser=false, enabled=true
```

### Loon

配置文件

```ini
[Rule]
# 知乎直播修正
URL-REGEX,^https?:\/\/api\.zhihu\.com\/drama\/,DIRECT
# 知乎去广告
DOMAIN,118.89.204.198,REJECT,no-resolve
DOMAIN-SUFFIX,118.89.204.198,REJECT,no-resolve
DOMAIN-KEYWORD,118.89.204.198,REJECT,no-resolve
IP-CIDR,118.89.204.198/32,REJECT,no-resolve
DOMAIN,appcloud2.zhihu.com,REJECT
DOMAIN,appcloud2.in.zhihu.com,REJECT
USER-AGENT,AVOS*,REJECT
URL-REGEX,^https?:\/\/api\.zhihu\.com/(ad|fringe|commercial|market/popover|search/(top|preset|tab)|.*featured-comment-ad),REJECT

[URL Rewrite]
# 知乎直播修正
^https?:\/\/api\.zhihu\.com\/drama\/ https://api.zhihu.com/drama/ header

[Remote Script]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_lite.loon, tag=知乎_去广告, enabled=true
```

Loon 2.1.3(193) TF + 可以使用插件Plugin

```ini
[Plugin]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_lite.loonplugin
```

## 其他问题

### 知乎直播无法访问

我这套配置**不会导致知乎直播无法访问**。目前已知部分大而全的去广告规则集合，会导致知乎直播无法访问。

我已经在Surge模块和Loon插件中对知乎直播无法访问的问题做了修正，但由于优先级的问题，不一定会生效。

Quantumult X这方面的拦截，是在url复写中的，暂时没有办法通过更高优先级的规则来修正它，只有等复写规则的作者更新。

如果出现知乎直播无法访问的情况，请开启抓包/调试/记录日志等功能，确认是哪条规则影响知乎直播的正常访问，将其删除或编写修正规则覆盖掉它。

#### Surge/Loon

Surge和Loon的知乎直播修正，提供两种方案。

一种是在本地规则中修改，覆盖掉远程引用的规则集，适用于远程规则集配置错误导致知乎直播无法访问的情况。

```ini
[Rule]
# 知乎直播修正
URL-REGEX,^https?:\/\/api\.zhihu\.com\/drama\/,DIRECT
```

一种是在url复写中进行修改，覆盖掉远程的订阅复写，适用于Loon远程订阅复写配置错误导致知乎直播无法访问的情况。

```ini
[URL Rewrite]
# 知乎直播修正
^https?:\/\/api\.zhihu\.com\/drama\/ https://api.zhihu.com/drama/ header
```

根据实际情况二选一即可。如果使用插件，为覆盖各种场景，两个规则都写入到插件中了。

如果远程错误的规则是在模块或插件中的，由于模块和插件优先级很高，上面的修正可能不会生效，建议联系插件作者修改。

## 感谢

[@onewayticket255](https://github.com/onewayticket255/Surge-Script)

[@fiiir](https://github.com/fiiir)