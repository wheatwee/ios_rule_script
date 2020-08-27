# iOS Rules And Scripts

## 前言

iOS平台的去广告规则和一些自动化脚本。

## 支持情况

我的脚本在不同平台支持情况如下：

|          | Surge       | Quantumult X | Loon        | JSBox       | Node.js          |
| -------- | ----------- | ------------ | ----------- | ----------- | ---------------- |
| 需要硬件 | iPhone/iPad | iPhone/iPad  | iPhone/iPad | iPhone/iPad | 可长期运行的电脑 |
| 脚本更新 | 自动更新    | 自动更新     | 自动更新    | 手动更新    | 手动更新         |
| 推送通知 | 手机推送    | 手机推送     | 手机推送    | 手机推送    | 无               |
| 使用成本 | 付费App     | 付费App      | 付费App     | 付费App     | 免费             |
| 支持情况 | 优先支持    | 兼容支持     | 兼容支持    | 随缘支持    | 随缘支持         |

优先支持：优先确保运行正常，出现异常优先解决

兼容支持：代码层面做兼容，会做测试

随缘支持：代码层面做兼容，不做测试

**搬运其他作者的脚本，没办法进行任何维护和解答，有问题请联系原作者。**

## 脚本说明

我的脚本介绍：

| 脚本                                                         | 介绍                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [知乎](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/zhihu) | 去广告、付费内容置顶提醒、黑名单增强                         |
| [什么值得买](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/smzdm) | Web端和App端签到、自动完成去购买任务、去广告                 |
| [百度贴吧](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/tieba) | 带重试功能的贴吧签到，提高签到成功率                         |
| [联通手机营业厅](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/10010) | 每日签到、必领美团外卖30-3优惠券、4次抽奖、话费流量语音情况推送 |
| [嘀嗒出行](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/didachuxing) | 每日签到                                                     |
| [联享家](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/lxj) | 去广告、拦截检测更新                                         |
| [家长帮](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/jiazhangbang) | 每日签到                                                     |
| [慢慢买](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/manmanbuy) | 每日签到                                                     |

## 其他说明

### 脚本

除自己编写的脚本外，还有部分脚本来自其他大佬的作品，如 [chavyleung](https://github.com/chavyleung/scripts)、[NobyDa](https://github.com/NobyDa/Script/tree/master)、[ConnersHua](https://github.com/ConnersHua/Profiles/tree/master)、[onewayticket255](https://github.com/onewayticket255/Surge-Script)，这里主要进行一些定制化修改、整合和备份。

**自己编写的脚本，通常**：

1. README里会有详细的配置和使用说明
2. README里会有具体的执行效果配图
3. 可能会有名为MagicJS的函数

**非自己编写的脚本，通常**：

1. 会在README或注释里说明
2. 只有一个扩展名为.sgmodule的文件
3. 配置文件中引用的js为其他Github
4. 其他忘记注明的情况，会尽快补上

### 规则

规则绝大部分不是我自己写的，只是做备份和一些定制化，主要用于满足个人需求。

### 其他

脚本的内容可以放心引用，基本上不会对链接做调整。

请尽量不要引用本项目种rule目录下的规则文件，我时常会根据个人需求进行调整和修改，不一定符合你的需求。