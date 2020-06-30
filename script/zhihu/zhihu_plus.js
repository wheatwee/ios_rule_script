/*
部分去广告的代码来自 https://github.com/onewayticket255/Surge-Script

Surge config

[MITM]
hostname = api.zhihu.com

[Script]
知乎_用户信息去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https://api.zhihu.com/people/,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_信息流去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https://api.zhihu.com/moments/recommend,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_推荐去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https://api.zhihu.com/topstory/recommend,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_回答黑名单增强 = type=http-response,requires-body=1,max-size=0,pattern=^https://api.zhihu.com/v4/questions,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_官方消息去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api.zhihu.com\/notifications\/v3\/message\?,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_消息列表去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api.zhihu.com\/notifications\/v3\/timeline\/entry\/system_message,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
*/

let body = $response.body;
try{
  if (body.length > 0){
    body=JSON.parse(body);
  }
}
catch (err){
  console.log('[知乎去广告] 解析body出现异常：' + $response.body);
  body = {};
}

let topstory_recommend_regex = /^https:\/\/api\.zhihu\.com\/topstory\/recommend\?/;
let moments_recommend_regex = /^https:\/\/api.zhihu.com\/moments\/recommend/;
let mcn_userinfo = /^https:\/\/api.zhihu.com\/people\//;
let question_regex = /^https:\/\/api.zhihu.com\/v4\/questions/;
let sysmsg_timeline_regex = /^https:\/\/api.zhihu.com\/notifications\/v3\/timeline\/entry\/system_message/;
let sysmsg_notifications_regex = /^https:\/\/api.zhihu.com\/notifications\/v3\/message\?/;
let answer_blacklist = ['盐选推荐', '盐选科普', '会员推荐', '故事档案局', '小蒜苗', '魏甚麽'];
let sysmsg_blacklist = ['知乎小伙伴', '知乎视频', '知乎亲子', '知乎团队', '知乎好物推荐', '知乎盐选会员', '知乎礼券', '创作者小助手', '知乎校园'];

if (topstory_recommend_regex.test($request.url)){
  body['data'].forEach((element, index)=> {
    if(element['card_type']=='slot_event_card'||element.hasOwnProperty('ad')){      
      body['data'].splice(index,1);
    }
  });
}
// 推荐功能去广告及黑名单增强
else if (moments_recommend_regex.test($request.url)){
  let data = body['data'].filter((element) =>{
    try{
      if(element.hasOwnProperty('ad') == false || (
          element.hasOwnProperty('common_card') && 
          answer_blacklist.indexOf(element['common_card']['feed_content']['source_line']['elements'][1]['text']['panel_text']) < 0)){      
        return true;
      }
    }
    catch (err){
      console.log('[知乎去广告] 推荐去广告出现异常：' + err);
      return true;
    }
  });
  body['data'] = data;
}
else if (mcn_userinfo.test($request.url)){
  delete body['mcn_user_info']
}
// 知乎黑名单增强，在回答列表里不会出现黑名单的答主
else if (question_regex.test($request.url)){
  delete body['ad_info'];
  let data = body['data'].filter((element) =>{
    if (answer_blacklist.indexOf(element['author']['name']) < 0){
      return true;
    }
  })
  body['data'] = data;
}
// 拦截官方账号推广消息
else if (sysmsg_timeline_regex.test($request.url) && body.hasOwnProperty('data')){
  let data = body['data'].filter((element) =>{
    if (sysmsg_blacklist.indexOf(element['content']['title']) < 0){
      return true;
    }
  })
  body['data'] = data;
} 
else if (sysmsg_notifications_regex.test($request.url)){
  body['data'].forEach((element, index)=> {
    if(element['detail_title']=='官方帐号消息'){
      let unread_count = body['data'][index]['unread_count'];
      if (unread_count > 0){
        body['data'][index]['content']['text'] = '未读消息' + unread_count + '条';
      }
      else{
        body['data'][index]['content']['text'] = '全部消息已读';
      }
      body['data'][index]['is_read'] = true;
      body['data'][index]['unread_count'] = 0;
    }
  })
}
body=JSON.stringify(body);
$done({body});
