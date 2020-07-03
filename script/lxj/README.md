# 联享家去广告脚本

## 前言

联享家作为一个具有开锁功能的广告App，不可谓不恶心。

所以编写此脚本，用于去除联享家App的核心功能——广告，保留开锁的附属功能。

去除检查更新、商城内容、特惠内容、资讯内容、我的中的个人服务和社区生活。

## 支持版本

Surge 4

联享家 V5.6.05

更新的版本接口可能会变化导致去广告失效，不建议更新联享家App，除非你喜欢看更多的广告。

## 配置说明

目前仅在Surge4测试通过，其他App请自行修改配置文件后测试。

Surge 配置

```ini
[Proxy]
Reject = reject
RejectGif = reject-tinygif

[Rule]
# 联享家去广告
DOMAIN-SUFFIX,bbs.hori-gz.com,RejectGif
DOMAIN-SUFFIX,mms.hori-gz.com,RejectGif
DOMAIN-SUFFIX,yxhd.hori-gz.com,RejectGif
DOMAIN-SUFFIX,ad.hori-gz.com,RejectGif
DOMAIN-SUFFIX,adfile.hori-gz.com,RejectGif
DOMAIN-SUFFIX,shop17741405.m.youzan.com,RejectGif
DOMAIN-SUFFIX,pangolin.snssdk.com,Reject
DOMAIN-SUFFIX,kinglian.cn,RejectGif

[MITM]
hostname = adfile.hori-gz.com, sso.lxjapp.com, nfys.kinglian.cn, bbs.hori-gz.com

[Script]
联享家_去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https?:\/\/adfile\.hori-gz\.com*,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/lxj/lxj_remove_ads.js
联享家_检查更新 = type=http-response,requires-body=1,max-size=0,pattern=^https?:\/\/sso\.lxjapp\.com\/\/chims\/servlet\/csGetLatestSoftwareVersionServlet,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/lxj/lxj_remove_ads.js
```

## 去广告效果

### 商城去广告

<img src="https://github.com/blackmatrix7/ios_rule_script/raw/master/script/lxj/images/remove_ads_01.jpg" style="zoom:10%;" />

### 特惠去广告

<img src="https://github.com/blackmatrix7/ios_rule_script/raw/master/script/lxj/images/remove_ads_02.jpg" style="zoom:10%;" />

### 资讯去广告

<img src="https://github.com/blackmatrix7/ios_rule_script/raw/master/script/lxj/images/remove_ads_03.jpg" style="zoom:10%;" />

### 我的去广告

<img src="https://github.com/blackmatrix7/ios_rule_script/raw/master/script/lxj/images/remove_ads_04.jpg" style="zoom:10%;" />

### 开锁去广告

<img src="https://github.com/blackmatrix7/ios_rule_script/raw/master/script/lxj/images/remove_ads_05.jpg" style="zoom:10%;" />