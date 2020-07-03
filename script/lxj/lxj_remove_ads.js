/*
Surge

[Rule]
# 联享家去广告
DOMAIN-SUFFIX,bbs.hori-gz.com,TinyGif
DOMAIN-SUFFIX,mms.hori-gz.com,TinyGif
DOMAIN-SUFFIX,yxhd.hori-gz.com,TinyGif
DOMAIN-SUFFIX,ad.hori-gz.com,TinyGif
DOMAIN-SUFFIX,adfile.hori-gz.com,TinyGif
DOMAIN-SUFFIX,shop17741405.m.youzan.com,TinyGif
DOMAIN-SUFFIX,pangolin.snssdk.com,Reject
DOMAIN-SUFFIX,kinglian.cn,TinyGif

[MITM]
hostname = adfile.hori-gz.com, sso.lxjapp.com, nfys.kinglian.cn, bbs.hori-gz.com

[Script]
联享家_去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https?:\/\/adfile\.hori-gz\.com*,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/lxj/lxj_remove_ad.js
联享家_检查更新 = type=http-response,requires-body=1,max-size=0,pattern=^https?:\/\/sso\.lxjapp\.com\/\/chims\/servlet\/csGetLatestSoftwareVersionServlet,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/lxj/lxj_remove_ad.js
*/

let body = $response.body;
try{
  body=JSON.parse(body);
}
catch (err){
  console.log('[联享家去广告]出现异常：' + err);
  body = {};  
}

let app_playlist_regex = /^https?:\/\/adfile\.hori-gz\.com*/;
let app_version_regex = /^https?:\/\/sso\.lxjapp\.com\/\/chims\/servlet\/csGetLatestSoftwareVersionServlet/;
let kinglina_ad_regex = /^https?:\/\/nfys\.kinglian\.cn\/*/;
let youzan_shop_regex = /^https?:\/\/shop17741405\.m\.youzan\.com/;
let lxj_bbs_regex = /^https?:\/\/bbs\.hori-gz\.com\:8443\/*/;


console.log('[联享家去广告]去除咨询广告');

// 有赞商城直接返回html，特殊处理
if (youzan_shop_regex.test($request.url)){
  body = '';
}
else {
  // 不知道什么鬼的广告，可能是首页弹的优惠券
  if (app_playlist_regex.test($request.url)){
    body['sourceList'] = [];
  }
  // 去除更新检查
  else if (app_version_regex.test($request.url)){
    body = {};
  }
  // 景联科技广告
  else if (kinglina_ad_regex.test($request.url)){
    body = '';
  }
  // 去除资讯
  else if (lxj_bbs_regex.test($request.url)){
    body['list'] = [];
    if (body.hasOwnProperty('pageCount')){
      body['pageCount'] = 0;
    }
    if (body.hasOwnProperty('pageSize')){
      body['pageSize'] = 10;
    }
    if (body.hasOwnProperty('totalCount')){
      body['totalCount'] = 0;
    }
  }
  body=JSON.stringify(body);
}

$done({body});
