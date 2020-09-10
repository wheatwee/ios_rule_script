# iOS Rules And Scripts

## 前言

iOS平台的分流规则和一些自动化脚本。

## 特别声明

1. 本项目内所有资源文件，禁止任何公众号、自媒体进行任何形式的转载、发布。
2. 编写本项目主要目的为学习和研究ES6，无法保证项目内容的合法性、准确性、完整性和有效性。
3. 本项目涉及的数据由使用的个人或组织自行填写，本项目不对数据内容负责，包括但不限于数据的真实性、准确性、合法性。使用本项目所造成的一切后果，与本项目的所有贡献者无关，由使用的个人或组织完全承担。
4. 本项目中涉及的第三方硬件、软件等，与本项目没有任何直接或间接的关系。本项目仅对部署和使用过程进行客观描述，不代表支持使用任何第三方硬件、软件。使用任何第三方硬件、软件，所造成的一切后果由使用的个人或组织承担，与本项目无关。
5. 本项目中所有内容只供学习和研究使用，不得将本项目中任何内容用于违反国家/地区/组织等的法律法规或相关规定的其他用途。
6. 所有基于本项目源代码，进行的任何修改，为其他个人或组织的自发行为，与本项目没有任何直接或间接的关系，所造成的一切后果亦与本项目无关。
7. 所有直接或间接使用本项目的个人和组织，应24小时内完成学习和研究，并及时删除本项目中的所有内容。如对本项目的功能有需求，应自行开发相关功能。
8. 本项目保留随时对免责声明进行补充或更改的权利，直接或间接使用本项目内容的个人或组织，视为接受本项目的特别声明。

## 支持情况

我的脚本在不同平台支持情况如下：

|          | Surge       | Quantumult X | Loon        | Shadowrocket | JSBox       | Node.js          |
| -------- | ----------- | ------------ | ----------- | ------------ | ----------- | ---------------- |
| 需要硬件 | iPhone/iPad | iPhone/iPad  | iPhone/iPad | iPhone/iPad  | iPhone/iPad | 可长期运行的电脑 |
| 脚本更新 | 自动更新    | 自动更新     | 自动更新    | 自动更新     | 手动更新    | 手动更新         |
| 推送通知 | 手机推送    | 手机推送     | 手机推送    | 手机推送     | 手机推送    | 无               |
| 使用成本 | 付费App     | 付费App      | 付费App     | 付费App      | 付费App     | 免费             |
| 支持情况 | 优先支持    | 兼容支持     | 兼容支持    | 随缘支持     | 部分支持    | 部分支持         |

优先支持：优先确保运行正常，出现异常优先解决

兼容支持：代码层面做兼容，会做测试

随缘支持：代码层面做兼容，偶尔做测试

部分支持：代码层面做兼容，部分功能可用，不做测试

支持优先级：Surge > Quantumult X > Loon > Shadowrocket ≥  JSBox > Node.js

**搬运其他作者的脚本，没办法进行任何支持、维护和解答，有问题请联系原作者。**

## 脚本说明

我的脚本介绍：

| 脚本                                                         | 介绍                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [知乎助手](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/zhihu) | 2020年使用纯净版知乎是一种怎么样的体验？                     |
| [什么值得买](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/smzdm) | 什么值得买签到和去广告脚本                                   |
| [百度贴吧](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/tieba) | 带重试功能的贴吧签到，提高签到成功率                         |
| [联通手机营业厅](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/10010) | 每日自动签到、必领美团外卖30-3优惠券、4次抽奖、话费流量语音情况推送 |
| [联享家](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/lxj) | 去广告、拦截检测更新                                         |
| [嘀嗒出行](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/didachuxing) | 每日自动签到                                                 |
| [家长帮](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/jiazhangbang) | 每日自动签到                                                 |
| [慢慢买](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/manmanbuy) | 每日自动签到                                                 |
| [小米有品](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/youpin) | 每日自动签到                                                 |
| [叮咚买菜](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/dingdong) | 每日自动签到                                                 |
| [万达电影](https://github.com/blackmatrix7/ios_rule_script/tree/master/script/wanda) | 每日自动签到                                                 |

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