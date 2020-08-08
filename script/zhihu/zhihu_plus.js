/*
部分去广告的代码来自 https://github.com/onewayticket255/Surge-Script

Surge config

[MITM]
hostname = www.zhihu.com,api.zhihu.com,link.zhihu.com,118.89.204.198,103.41.167.234,210.22.248.207,111.206.76.35

[Map Local]
# 知乎去除最常访问
^https?:\/\/api\.zhihu\.com\/moments\/recent data="https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/blank.json"
# 知乎去除未读消息红点
^https?:\/\/api\.zhihu\.com\/notifications\/v3\/count data="https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/blank.json"
# 知乎指南屏蔽
^https?:\/\/api\.zhihu\.com\/me\/guides data="https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/blank.json"

[Script]
# 知乎去广告及黑名单增强
知乎_我的MCN = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api\.zhihu\.com/people/,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_信息流去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api\.zhihu\.com/(moments|topstory)/recommend,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_回答去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api\.zhihu\.com/v4/questions,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js
知乎_官方消息去广告 = type=http-response,requires-body=1,max-size=0,pattern=^https:\/\/api.zhihu.com\/notifications\/v3\/(message\?|timeline\/entry\/system_message),script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.js

Loon Config

[Rule]
DOMAIN,appcloud2.zhihu.com,REJECT
DOMAIN,118.89.204.198,REJECT
USER-AGENT,AVOS*,REJECT
URL-REGEX,https://api.zhihu.com/(ad|drama|fringe|commercial|market/popover|search/(top|preset|tab)|.*featured-comment-ad),REJECT

[Remote Script]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.loon, tag=知乎_去广告及黑名单增强, enabled=true

QuanX Config

[filter_local]
USER-AGENT, AVOS*, reject
DOMAIN-SUFFIX, 118.89.204.198, reject
DOMAIN-SUFFIX, appcloud2.zhihu.com, reject

[rewrite_remote]
https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/zhihu/zhihu_plus.quanx, tag=知乎_去广告及黑名单增强, update-interval=86400, opt-parser=false, enabled=true
*/

let scriptName = '知乎增强';
let magicJS = MagicJS(scriptName);


const topstory_recommend_regex = /^https:\/\/api\.zhihu\.com\/topstory\/recommend\?/;
const moments_recommend_regex = /^https:\/\/api.zhihu.com\/moments\/recommend/;
const mcn_userinfo = /^https:\/\/api.zhihu.com\/people\//;
const question_regex = /^https:\/\/api.zhihu.com\/v4\/questions/;
const sysmsg_timeline_regex = /^https:\/\/api.zhihu.com\/notifications\/v3\/timeline\/entry\/system_message/;
const sysmsg_notifications_regex = /^https:\/\/api.zhihu.com\/notifications\/v3\/message\?/;
const blocked_users_regex = /^https:\/\/api.zhihu.com\/settings\/blocked_users/;
const moments_recent_regex = /^https?:\/\/api\.zhihu\.com\/moments\/recent/;
const blocked_users_key = 'zhihu_blocked_users';
let answer_blacklist = ['盐选推荐', '盐选科普', '会员推荐', '故事档案局', '小蒜苗', '魏甚麽', '知乎小伙伴', '知乎视频', '知乎亲子', '知乎团队', '知乎好物推荐', '知乎盐选会员', '知乎礼券', '创作者小助手', '知乎校园', '战斗力旺盛的伯爵'];
let sysmsg_blacklist = ['知乎小伙伴', '知乎视频', '知乎亲子', '知乎团队', '知乎好物推荐', '知乎盐选会员', '知乎礼券', '创作者小助手', '知乎校园'];


async function main(){
  // 知乎去广告及黑名单增强
  if (magicJS.isResponse){
    let body = magicJS.response ? magicJS.response.body: {};
    try{
      if (body.length > 0){
        body=JSON.parse(body);
      }
    }
    catch (err){
      magicJS.log(`解析body出现异常：${body}`);
      body = {};
    }
    // 知乎推荐去广告与黑名单增强
    if (topstory_recommend_regex.test(magicJS.request.url)){
      let custom_black_users = magicJS.read(blocked_users_key);
      answer_blacklist = !!custom_black_users ? custom_black_users : answer_blacklist;
      let data = body['data'].filter((element) =>{
        try{
          if(element['card_type'] != 'slot_event_card' && element.hasOwnProperty('ad') == false && element.hasOwnProperty('common_card') && 
              answer_blacklist.indexOf(element['common_card']['feed_content']['source_line']['elements'][1]['text']['panel_text']) < 0){      
            return true;
          }
        }
        catch (err){
          magicJS.log('知乎推荐去广告出现异常：' + err);
          return true;
        }
      });
      body['data'] = data;
    }
    // 知乎关注去广告
    else if (moments_recommend_regex.test(magicJS.request.url)){
      let data = body['data'].filter((element) =>{
        try{
          if(element.hasOwnProperty('ad') == false){      
            return true;
          }
        }
        catch (err){
          magicJS.log('知乎关注去广告出现异常：' + err);
          return true;
        }
      });
      body['data'] = data;
    }
    else if (mcn_userinfo.test(magicJS.request.url)){
      delete body['mcn_user_info']
    }
    // 知乎回答列表去广告及黑名单增强，在回答列表里不会出现黑名单的答主
    else if (question_regex.test(magicJS.request.url)){
      let custom_black_users = magicJS.read(blocked_users_key);
      answer_blacklist = !!custom_black_users ? custom_black_users : answer_blacklist;
      delete body['ad_info'];
      let data = body['data'].filter((element) =>{
        if (answer_blacklist.indexOf(element['author']['name']) < 0){
          return true;
        }
      })
      body['data'] = data;
    }
    // 拦截官方账号推广消息
    else if (sysmsg_timeline_regex.test(magicJS.request.url) && body.hasOwnProperty('data')){
      let data = body['data'].filter((element) =>{
        if (sysmsg_blacklist.indexOf(element['content']['title']) < 0){
          return true;
        }
      })
      body['data'] = data;
    } 
    else if (sysmsg_notifications_regex.test(magicJS.request.url)){
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
    else if (blocked_users_regex.test(magicJS.request.url) && magicJS.request.method == 'GET'){
      try{
        let obj = JSON.parse(magicJS.response.body);
        let saved_black_users_list = magicJS.read(blocked_users_key);
        saved_black_users_list = !!saved_black_users_list? saved_black_users_list : answer_blacklist;
        let black_users_list = [];
        if (!!obj['data']){
          obj['data'].forEach(element => {
            if (element['name'] != '[已重置]'){
              black_users_list.push(element['name']);
            }
          });
          // 更新黑名单
          let new_blackusers = [...new Set(saved_black_users_list.concat(black_users_list))];
          magicJS.write(blocked_users_key, new_blackusers);
        }
        else{
          magicJS.log(`获取黑名单失败，接口响应不合法：${magicJS.response.body}`);
        }
        if (obj['paging']['is_end'] == true){
          magicJS.notify('知乎黑名单获取结束');
        }
      }
      catch(err){
        magicJS.log(`获取黑名单失败，异常信息：${err}`);
        magicJS.notify('获取黑名单失败，执行异常。')
      }
    }
    else if (moments_recent_regex.test(magicJS.request.url)){
      magicJS.done({
        "data": [],
        "guide_text": "",
        "is_show": false,
        "style_type": "dot",
        "top_unread_count": 0,
        "total_unread_count": 0
      });
    }
    body=JSON.stringify(body);
    magicJS.done({body});
  }
}

main();

function MagicJS(scriptName='MagicJS', debug=false){
  return new class{

    constructor(){
      this.scriptName = scriptName;
      this.debug = debug;
      this.node = {'request': undefined, 'fs': undefined, 'data': {}};
      if (this.isNode){
        this.node.request = require('request');
        this.node.data = require('./magic.json');
        this.node.fs = require('fs');
      }
    }
    
    get version() { return '202008030033' };
    get isSurge() { return typeof $httpClient !== 'undefined' && !this.isLoon };
    get isQuanX() { return typeof $task !== 'undefined' };
    get isLoon() { return typeof $loon !== 'undefined' };
    get isJSBox() { return typeof $drive !== 'undefined'};
    get isNode() { return typeof module !== 'undefined' && !this.isJSBox };
    get isRequest() { return (typeof $request !== 'undefined') && (typeof $response === 'undefined')}
    get isResponse() { return typeof $response !== 'undefined' }
    get request() { return (typeof $request !== 'undefined') ? $request : undefined }

    get response() { 
      if (typeof $response !== 'undefined'){
        if ($response.hasOwnProperty('status')) $response['statusCode'] = $response['status']
        if ($response.hasOwnProperty('statusCode')) $response['status'] = $response['statusCode']
        return $response;
      }
      else{
        return undefined;
      }
    }

    read(key, session='default'){
      let data = '';
      if (this.isSurge || this.isLoon) {
        data = $persistentStore.read(key);
      }
      else if (this.isQuanX) {
        data = $prefs.valueForKey(key);
      }
      else if (this.isNode){
        data = this.node.data[key];
      }
      else if (this.isJSBox){
        data = $file.read('drive://magic.json').string;
        data = JSON.parse(data)[key];
      }
      try {
        if (!!data && typeof data === 'string'){
          data = JSON.parse(data);
        }
        data = !!data ? data: {};
      } 
      catch (err){ 
        this.log(`raise exception: ${err}`);
        data = {};
        this.del(key);
      }
      let val = data[session];
      try { if (typeof val == 'string') val = JSON.parse(val) } catch(err) {}
      if (this.debug) this.log(`read data [${key}][${session}](${typeof val})\n${JSON.stringify(val)}`);
      return val;
    };

    write(key, val, session='default'){
      let data = '';
      if (this.isSurge || this.isLoon) {
        data = $persistentStore.read(key);
      }
      else if (this.isQuanX) {
        data = $prefs.valueForKey(key);
      }
      else if (this.isNode){
        data = this.node.data;
      }
      else if (this.isJSBox){
        data = JSON.parse($file.read('drive://magic.json').string);
      }
      try {
        if (!!data && typeof data === 'string'){
          data = JSON.parse(data);
        }
        data = !!data ? data: {};
      } 
      catch(err) { 
        this.log(`raise exception: ${err}`);
        data = {};
        this.del(key);
      }
      if (this.isNode || this.isJSBox){
        data[key][session] = val;
      }
      else{
        data[session] = val;
      }
      data = JSON.stringify(data);
      if (this.isSurge || this.isLoon) {
        $persistentStore.write(data, key);
      }
      else if (this.isQuanX) {
        $prefs.setValueForKey(data, key);
      }
      else if (this.isNode){
        this.node.fs.writeFileSync('./magic.json', data, (err) =>{
          this.log(err);
        })
      }
      else if (this.isJSBox){
        $file.write({data: $data({string: data}), path: 'drive://magic.json'});
      }
      if (this.debug) this.log(`write data [${key}][${session}](${typeof val})\n${JSON.stringify(val)}`);
    };

    del(key){
      if (this.isSurge || this.isLoon) {
        $persistentStore.write('', key);
      }
      else if (this.isQuanX) {
        $prefs.setValueForKey('', key);
      }
      else if (this.isNode || this.isJSBox){
        this.write(key, '');
      }
    }

    notify(title = scriptName, subTitle = '', body = ''){
      if (arguments.length == 1){
        title = scriptName;
        subTitle = '',
        body = arguments[0];
      }
      if (this.isSurge || this.isLoon) {
        $notification.post(title, subTitle, body);
      }
      else if (this.isQuanX) {
         $notify(title, subTitle, body);
      }
      else if (this.isNode) {
        this.log(`${title} ${subTitle}\n${body}`);
      }
      else if (this.isJSBox){
        $push.schedule({
          title: title,
          body: subTitle ? `${subTitle}\n${body}` : body
        });
      }
    }
    
    log(msg){
      console.log(`[${this.scriptName}]\n${msg}\n`)
    }

    get(options, callback){
      if (this.debug) this.log(`http get: ${JSON.stringify(options)}`);
      if (this.isSurge || this.isLoon) {
        $httpClient.get(options, callback);
      }
      else if (this.isQuanX) {
        if (typeof options === 'string') options = { url: options }
        options['method'] = 'GET'
        $task.fetch(options).then(
          resp => {
            resp['status'] = resp.statusCode
            callback(null, resp, resp.body)
          },
          reason => callback(reason.error, null, null),
        )
      }
      else if(this.isNode){
        return this.node.request.get(options, callback);
      }
      else if(this.isJSBox){
        options = typeof options === 'string'? {'url': options} : options;
        options['header'] = options['headers'];
        delete options['headers']
        options['handler'] = (resp)=>{
          let err = resp.error? JSON.stringify(resp.error) : undefined;
          let data = typeof resp.data === 'object' ? JSON.stringify(resp.data) : resp.data;
          callback(err, resp.response, data);
        }
        $http.get(options);
      }
    }

    post(options, callback){
      if (this.debug) this.log(`http post: ${JSON.stringify(options)}`);
      if (this.isSurge || this.isLoon) {
        $httpClient.post(options, callback);
      }
      else if (this.isQuanX) {
        if (typeof options === 'string') options = { url: options }
        if (options.hasOwnProperty('body') && typeof options['body'] !== 'string') options['body'] = JSON.stringify(options['body']);
        options['method'] = 'POST'
        $task.fetch(options).then(
          resp => {
            resp['status'] = resp.statusCode
            callback(null, resp, resp.body)
          },
          reason => {callback(reason.error, null, null)}
        )
      }
      else if(this.isNode){
        if (typeof options.body === 'object') options.body = JSON.stringify(options.body);
        return this.node.request.post(options, callback);
      }
      else if(this.isJSBox){
        options = typeof options === 'string'? {'url': options} : options;
        options['header'] = options['headers'];
        delete options['headers']
        options['handler'] = (resp)=>{
          let err = resp.error? JSON.stringify(resp.error) : undefined;
          let data = typeof resp.data === 'object' ? JSON.stringify(resp.data) : resp.data;
          callback(err, resp.response, data);
        }
        $http.post(options);
      }
    }

    done(value = {}){
      if (typeof $done !== 'undefined'){
        $done(value);
      }
    }

    isToday(day){
      if (day == null){
          return false;
      }
      else{
        let today = new Date();
        if (typeof day == 'string'){
            day = new Date(day);
        }
        if (today.getFullYear() == day.getFullYear() && today.getMonth() == day.getMonth() && today.getDay() == day.getDay()){
            return true;
        }
        else{
            return false;
        }
      }
    }

    /**
     * 对await执行中出现的异常进行捕获并返回，避免写过多的try catch语句
     * @param {*} promise Promise 对象
     * @param {*} defaultValue 出现异常时返回的默认值
     * @returns 返回两个值，第一个值为异常，第二个值为执行结果
     */
    attempt(promise, defaultValue=null){ return promise.then((args)=>{return [null, args]}).catch(ex=>{this.log('raise exception:' + ex); return [ex, defaultValue]})};

    /**
     * 重试方法
     *
     * @param {*} fn 需要重试的函数
     * @param {number} [retries=5] 重试次数
     * @param {number} [interval=0] 每次重试间隔
     * @param {function} [callback=null] 函数没有异常时的回调，会将函数执行结果result传入callback，根据result的值进行判断，如果需要再次重试，在callback中throw一个异常，适用于函数本身没有异常但仍需重试的情况。
     * @returns 返回一个Promise对象
     */
    retry(fn, retries=5, interval=0, callback=null) {
      return (...args)=>{
        return new Promise((resolve, reject) =>{
          function _retry(...args){
            Promise.resolve().then(()=>fn.apply(this,args)).then(
              result => {
                if (typeof callback === 'function'){
                  Promise.resolve().then(()=>callback(result)).then(()=>{resolve(result)}).catch(ex=>{
                    if (retries >= 1 && interval > 0){
                      setTimeout(() => _retry.apply(this, args), interval);
                    }
                    else if (retries >= 1) {
                      _retry.apply(this, args);
                    }
                    else{
                      reject(ex);
                    }
                    retries --;
                  });
                }
                else{
                  resolve(result);
                }
              }
              ).catch(ex=>{
              if (retries >= 1 && interval > 0){
                setTimeout(() => _retry.apply(this, args), interval);
              }
              else if (retries >= 1) {
                _retry.apply(this, args);
              }
              else{
                reject(ex);
              }
              retries --;
            })
          }
          _retry.apply(this, args);
        });
      };
    }

    sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
    
  }(scriptName);
}
