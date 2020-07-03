/*
Surge Config

[Script]
嘀嗒出行_每日签到 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/didachuxing/didachuxing_plus.js,script-update-interval=0,type=cron,cronexp=15 0 * * *
嘀嗒出行_获取cookie = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/didachuxing/didachuxing_plus.js,script-update-interval=0,type=http-request,pattern=^https?:\/\/www\.didapinche\.com\/hapis\/.*\/getBeikeAccount\?userCid=.*

[MITM]
hostname = www.didapinche.com
*/

const didaGetCookieRegex = /^https?:\/\/www\.didapinche\.com\/hapis\/.*\/getBeikeAccount\?userCid=.*/;
const didaCidKey = 'dida_cid';
const didaCookieKey = 'dida_cookie';
const didaUserAgentKey = 'dida_useragent';
const didaCinfoKey = 'dida_cinfo';
const didaAccessTokenKey = 'dida_access_token';
const didaUserCidKey = 'dida_user_cid';
const scriptName = '嘀嗒出行';

let magicJS = MagicJS(scriptName);
let didaCid = null;
let didaCookie = null;
let didaUserAgent = null;
let didaCinfo = null;
let didaAccessToken = null;

let checkinOptions = {
    url : 'https://www.didapinche.com/hapis/api/t/Jifen/signIn?userCid=',
    headers : {
      "Accept": "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-cn",
      "Connection": "keep-alive",
      "Cookie": null,
      "Host": "www.didapinche.com",
      "Referer": "https://www.didapinche.com/dida/public/didashell/index.html",
      "User-Agent": null,
      "ddcinfo": null,
      "x-access-token": null
    }
};

// 检查cookie完整性
function CheckCookie(){
  if (didaAccessToken == null){
    didaAccessToken = magicJS.read(didaAccessTokenKey);      
    didaCookie = magicJS.read(didaCookieKey);
    didaUserAgent = magicJS.read(didaUserAgentKey);
    didaCinfo = magicJS.read(didaCookieKey);
    didaAccessToken = magicJS.read(didaAccessTokenKey);
    didaCid = magicJS.read(didaCidKey);
    if (didaAccessToken == null || didaAccessToken == '' || didaAccessToken == {}){
        magicJS.log('没有读取到嘀嗒出行有效cookie，请先访问贝壳广场进行获取。');
        magicJS.notify(scriptName, '', '❓没有读取到cookie，请先访问贝壳广场进行获取。')
        return false;
    }
    else{
        return true;
    }
  }
  else{
    return true;
  }
}

// 每日签到
function Checkin() {
  return new Promise((resolve, reject) => {
    if (CheckCookie()){
      checkinOptions.url += didaCid;
      checkinOptions.headers['Cookie'] = didaCookie;
      checkinOptions.headers['User-Agent'] = didaUserAgent;
      checkinOptions.headers['ddcinfo'] = didaCinfo;
      checkinOptions.headers['x-access-token'] = didaAccessToken;
      magicJS.get(checkinOptions, (err, resp, data)=>{
        if (err) {
          magicJS.notify(scriptName, '', '❌签到出现异常，http请求错误。');
          reject('签到出现异常:' + err);
        }
        else{
          magicJS.log('签到结果返回数据：' + data);
          let checkin_obj = JSON.parse(data);
          if (checkin_obj.hasOwnProperty('code') && checkin_obj.hasOwnProperty('ret') && checkin_obj['code'] == 0){
            if (typeof checkin_obj['ret'] == 'object'){
              magicJS.notify(scriptName, '', `🎉签到成功，连续签到${checkin_obj['ret']['continueSign']}天。\n ${checkin_obj['ret']['toast']}`);
              resolve(checkin_obj['ret']['toast']);
            }
            else if (typeof checkin_obj['ret'] == 'string'){
              magicJS.notify(scriptName, '', `🎉${checkin_obj['ret']}`);
              resolve(checkin_obj['ret']);
            }
            else {
              magicJS.notify(scriptName, '', `❌签到出现异常，请查看日志。`);
              reject('签到出现异常:' + data);
            }
          }
          else{
            reject('签到出现异常:' + data);
          }
        }
      });
    }
  });
}


function Main(){
  if (magicJS.isRequest){
    if(didaGetCookieRegex.test(magicJS.request.url) && magicJS.request.method == 'GET'){

      magicJS.log('获取http headers：' + JSON.stringify(magicJS.request.headers));

      didaCid = magicJS.request.url.match(/userCid=([^\s]*)/)[1];
      didaCookie = magicJS.request.headers['Cookie'];
      didaUserAgent = magicJS.request.headers['User-Agent'];
      didaCinfo = magicJS.request.headers['ddcinfo'];
      didaAccessToken = magicJS.request.headers['x-access-token'];

      let didaHisAccessToken = magicJS.read(didaAccessTokenKey);
      let didaHisCid = magicJS.read(didaCidKey);

      if (didaHisAccessToken == didaAccessToken){
        magicJS.log('token与cookie没有变化，无需更新。');
        // magicJS.notify(scriptName, '', '🎈token与cookie没有变化，无需更新。')
      }
      else if (didaHisCid == null || didaHisCid != didaCid || didaHisAccessToken == null){
        magicJS.write(didaCidKey, didaCid);
        magicJS.write(didaCookieKey, didaCookie);
        magicJS.write(didaUserAgentKey, didaUserAgent);
        magicJS.write(didaCookieKey, didaCinfo);
        magicJS.write(didaAccessTokenKey, didaAccessToken);
        magicJS.log('获取嘀嗒出行token成功。');
        magicJS.notify(scriptName, '', '🎈获取token与cookie成功。')
      }
      else{
        magicJS.log('没有读取到有效的Cookie信息。');
      }
    }
    magicJS.done();
  }
  else{
    Checkin().then(
      value=>{
        magicJS.log(value);
        magicJS.done();
      },
      reason=>{
        magicJS.log(reason);
        magicJS.done();
      }
    );
  }
}

Main();

function MagicJS(scriptName='MagicJS') {
  
    const version = '202007030027';

    const isSurge = undefined !== this.$httpClient;
    const isQuanX = undefined !== this.$task;

    const read = (key, session='default') => {
      let jsonStr = '';
      let data = null;
      if (isSurge) {
        jsonStr = $persistentStore.read(key);
      }
      else if (isQuanX) {
        jsonStr = $prefs.valueForKey(key);
      }
      try { 
        data = JSON.parse(jsonStr) != null? JSON.parse(jsonStr) : {};
      } 
      catch (err){ 
        log(`Parse Data Error: ${err}`);
        data = {};
        del(key);
      }
      let val = data[session];
      try { if (typeof val == 'string') val = JSON.parse(val); } catch {}
      log(`Read Data [${key}][${session}](${typeof val})\n${JSON.stringify(val)}`);
      return val;
    };
  
    const write = (key, val, session='default') => {
      let jsonStr = '';
      let data = null;
      if (isSurge) {
        jsonStr = $persistentStore.read(key);
      }
      else if (isQuanX){
        jsonStr = $prefs.valueForKey(key);
      }
      try { 
        data = JSON.parse(jsonStr) != null? JSON.parse(jsonStr) : {};
      } 
      catch(err) { 
        log(`Parse Data Error: ${err}`);
        data = {};
        del(key);
      }
      data[session] = val;
      jsonStr = JSON.stringify(data);
      log(`Write Data [${key}][${session}](${typeof val})\n${JSON.stringify(val)}`);
      if (isSurge) {
        return $persistentStore.write(jsonStr, key);
      }
      else if (isQuanX) {
        return $prefs.setValueForKey(jsonStr, key);
      }
    };

    const del = (key) =>{
      if (isSurge) {
        $persistentStore.write({}, key);
      }
      else if (isQuanX) {
        $prefs.setValueForKey({}, key);
      }
    }
  
    const notify = (title, subTitle = '', body = '') => {
      if (isSurge) $notification.post(title, subTitle, body)
      if (isQuanX) $notify(title, subTitle, body)
    }
    
    const log = (msg) => {
      console.log(`[${scriptName}]\n${msg}\n`)
    }
  
    const get = (options, callback) => {
      if (isSurge) {
        $httpClient.get(options, callback);
      };
      if (isQuanX) {
        if (typeof options == 'string') options = { url: options }
        options['method'] = 'GET'
        return $task.fetch(options).then(
          response => {
            response['status'] = response.statusCode
            callback(null, response, response.body)
          },
          reason => callback(reason.error, null, null),
        )
      };
    }
  
    const post = (options, callback) => {
      if (isSurge) {
        $httpClient.post(options, callback);
      };
      if (isQuanX) {
        if (typeof options == 'string') options = { url: options }
        options['method'] = 'POST'
        $task.fetch(options).then(
          response => {
            response['status'] = response.statusCode
            callback(null, response, response.body)
          },
          reason => callback(reason.error, null, null),
        )
      };
    }
  
    const _response = () =>{
      try{
        return $response;
      }
      catch {
        return undefined;
      }
    }
    const response = _response();
  
  
    const _request = () =>{
      try{
        return $request;
      }
      catch {
        return undefined;
      }
    }
    const request = _request();
  
    const done = (value = {}) => {
      $done(value)
    }
  
    const isToday = (day) => {
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
  
    const _isRequest = () => {
      return typeof $request != 'undefined';
    }
    const isRequest = _isRequest();
  
    const _isResponse = () => {
      return typeof $response != 'undefined';
    }
    const isResponse = _isResponse();
  
    return { version, isSurge, isQuanX, response, request, isRequest, isResponse , notify, log, write, read, del, get, post, done, isToday}
}