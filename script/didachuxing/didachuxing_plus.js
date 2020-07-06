/*
Surge Config

[Script]
嘀嗒出行_每日签到 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/didachuxing/didachuxing_checkin.js,script-update-interval=0,type=cron,cronexp=15 0 * * *
嘀嗒出行_获取cookie = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/didachuxing/didachuxing_checkin.js,script-update-interval=0,type=http-request,pattern=^https?:\/\/www\.didapinche\.com\/hapis\/.*\/getBeikeAccount\?userCid=.*

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
let didaGetBeikeResult = [];
let didaGetBeikeCount = 0;
let didaNotifyContent = '';

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

let getBeikeAccountOptions = {
  url : 'https://www.didapinche.com/hapis/api/t/Jifen/getBeikeAccount?userCid=',
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
    "x-access-token": null,
    "UserAgent": ''
  }
}

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
      let url = checkinOptions.url.replace(/(userCid=[^&]*)/i, `userCid=${didaCid}`);
      checkinOptions.url = url;
      checkinOptions.headers['Cookie'] = didaCookie;
      checkinOptions.headers['User-Agent'] = didaUserAgent;
      checkinOptions.headers['ddcinfo'] = didaCinfo;
      checkinOptions.headers['x-access-token'] = didaAccessToken;
      let checkinLog = '';
      let checkinNotify = '';
      magicJS.get(checkinOptions, (err, resp, data)=>{
        if (err) {
          checkinNotify = '❌签到出现异常，http请求错误。';
          checkinLog = '签到出现异常:' + err;
          didaNotifyContent += checkinNotify;
          resolve(checkinLog);
        }
        else{
          magicJS.log('签到结果返回数据：' + data);
          let checkin_obj = JSON.parse(data);
          if (checkin_obj.hasOwnProperty('code') && checkin_obj.hasOwnProperty('ret') && checkin_obj['code'] == 0){
            if (typeof checkin_obj['ret'] == 'object'){
              checkinLog = `签到成功，连续签到${checkin_obj['ret']['continueSign']}天，${checkin_obj['ret']['toast']}`;
              checkinNotify = `🎉${checkinLog}\n`;
              didaNotifyContent += checkinNotify;
              magicJS.log(checkinLog);
              resolve(checkinLog);
            }
            else if (typeof checkin_obj['ret'] == 'string'){
              if (checkin_obj['ret'] == '已经签到过'){
                checkinNotify = `✅本日已经签到过，不要重复签到哦\n`;
              }
              else{
                checkinNotify = `🎉${checkinLog}\n`;
              }
              checkinLog = checkin_obj['ret'];
              didaNotifyContent += checkinNotify;
              magicJS.log(checkinLog);
              resolve(checkinLog);
            }
            else {
              checkinLog = '签到出现异常:' + data;
              checkinNotify = '❌签到出现异常，请查看日志\n';
              didaNotifyContent += checkinNotify;
              magicJS.log(checkinLog);
              resolve(checkinLog);
            }
          }
          else{
            checkinLog = '签到出现异常:' + data;
            checkinNotify = '❌签到出现异常，请查看日志\n';
            didaNotifyContent += checkinNotify;
            magicJS.log(checkinLog);
            resolve(checkinLog);
          }
        }
      });
    }
  });
}

// 获取账户待领取贝壳
function GetBeikeAccount(){
  let beikeList = {};
  return new Promise((resolve, reject) => {
    if (CheckCookie()){
      let url = getBeikeAccountOptions.url.replace(/(userCid=[^&]*)/i, `userCid=${didaCid}`);
      getBeikeAccountOptions.url = url;
      getBeikeAccountOptions.headers['Cookie'] = didaCookie;
      getBeikeAccountOptions.headers['User-Agent'] = didaUserAgent;
      getBeikeAccountOptions.headers['ddcinfo'] = didaCinfo;
      getBeikeAccountOptions.headers['x-access-token'] = didaAccessToken;

      magicJS.get(getBeikeAccountOptions, (err, resp, data)=>{
        if (err) {
          magicJS.notify(scriptName, '', '❌获取账户下待领取贝壳异常，http请求错误。');
          magicJS.log('获取账户下待领取贝壳异常，http请求错误：' + err);
          resolve(beikeList);
        }
        else{
          let obj = JSON.parse(data);
          if (obj.hasOwnProperty('code') && obj['code'] == 0 && obj.hasOwnProperty('ret') && typeof obj['ret'] == 'object'){
            beikeList = obj['ret']['receivableAccountList'];
            magicJS.log('待拾取贝壳情况：' + JSON.stringify(beikeList));
            resolve(beikeList);
          }
          else{
            magicJS.notify(scriptName, '', '❌获取账户下待领取贝壳异常，接口响应错误。');
            magicJS.log('获取账户下待领取贝壳异常，接口响应错误：' + data);
            resolve(beikeList);
          }
        }
      })
    }
  });
}

// 模拟点击实现单个贝壳拾取操作
function AddBeikeAccount(uniqueKey, changeAmount, beikeType){
  let beikeData = {'uniqueKey': uniqueKey, 'changeAmount': changeAmount, 'beikeType': beikeType};;
  return new Promise((resolve, reject) => {
    if (CheckCookie()){
      let addBeikeAccount = {
        url : `https://www.didapinche.com/hapis/api/t/Jifen/addBeikeAccountFromRedis?userCid=${didaCid}&uniqueKey=${beikeData['uniqueKey']}`,
        headers : {
          "Accept": "application/json, text/plain, */*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "zh-cn",
          "Connection": "keep-alive",
          "Cookie": didaCookie,
          "Host": "www.didapinche.com",
          "Referer": "https://www.didapinche.com/dida/public/didashell/index.html",
          "User-Agent": didaUserAgent,
          "ddcinfo": didaCinfo,
          "x-access-token": didaAccessToken
        }
      };
      magicJS.get(addBeikeAccount, (err, resp, data)=>{
        if (err) {
          magicJS.notify(scriptName, '', '❌拾取贝壳失败，http请求错误。');
          magicJS.log('拾取贝壳失败，http请求错误：' + err);
          resolve(beikeData);
        }
        else{
          magicJS.log('拾取贝壳接口响应内容：' + data);
          let obj = JSON.parse(data);
          if (obj.hasOwnProperty('code') && obj['code'] == 0){
            didaGetBeikeResult.push(beikeData);
            didaGetBeikeCount += Number(beikeData['changeAmount']);
            magicJS.log('拾取贝壳成功，贝壳数据：' + JSON.stringify(beikeData));
            resolve(beikeData);
          }
          else{
            magicJS.notify(scriptName, '', '❌拾取贝壳失败，接口响应错误。');
            magicJS.log('拾取贝壳失败，接口响应错误：' + data);
            resolve(beikeData);
          }
        }
      });
    }
  });
}

async function GetAccountAllBeike(){
  let beikeList = await GetBeikeAccount();
  if (beikeList.length > 0){
    for (let index=0; index < beikeList.length; index ++){
        let element = beikeList[index];
        await AddBeikeAccount(element['uniqueKey'], element['changeAmount'], element['beikeType']);
    }
    if (didaGetBeikeResult.length > 0 && didaGetBeikeCount > 0){
      magicJS.log(`本次共拾取贝壳${didaGetBeikeCount}个，详细情况如下：${JSON.stringify(didaGetBeikeResult)}`);
      didaNotifyContent += `🏖本次共拾取贝壳${didaGetBeikeCount}个\n🗳右滑查看获取贝壳详情`;
      didaGetBeikeResult.forEach(element => {
        didaNotifyContent += `\n🚘${element['beikeType']}：${element['changeAmount']}个`;
      });
    }
  }
  else{
    didaNotifyContent += '🏖本次没有发现待拾取的贝壳，明天再来看看吧';
    magicJS.log('没有待拾取的贝壳');
  }
}

async function Main(){
  if (magicJS.isRequest){
    if(didaGetCookieRegex.test(magicJS.request.url) && magicJS.request.method == 'GET' && magicJS.request.headers.hasOwnProperty('UserAgent') == false){

      magicJS.log('获取http headers：' + JSON.stringify(magicJS.request.headers));

      didaCid = magicJS.request.url.match(/userCid=([^\s]*)/)[1];
      didaCookie = magicJS.request.headers['Cookie'];
      didaUserAgent = magicJS.request.headers['User-Agent'];
      didaCinfo = magicJS.request.headers['ddcinfo'];
      didaAccessToken = magicJS.request.headers['x-access-token'];

      let didaHisAccessToken = magicJS.read(didaAccessTokenKey);
      let didaHisCid = magicJS.read(didaCidKey);
      let didaHisCookie = magicJS.read(didaCookieKey);

      if (didaHisAccessToken == didaAccessToken){
        magicJS.log('token与cookie没有变化，无需更新。');
        // magicJS.notify(scriptName, '', '🎈token与cookie没有变化，无需更新。')
      }
      else if (didaHisCid == null || didaHisCid != didaCid || didaHisAccessToken == null || didaHisAccessToken != didaAccessToken || didaHisCookie == null || didaHisCookie != didaCookie  ){
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
    
    await Checkin();
    
    await GetAccountAllBeike();

    magicJS.notify(scriptName, '', didaNotifyContent);

    magicJS.done();
  }
}

Main();

function MagicJS(scriptName='MagicJS'){
  return new class{

    constructor(){
      this.scriptName = scriptName;
    }
    
    get version() { return '202007021523' };

    get isSurge() { 
      return undefined !== $httpClient 
    };
    
    get isQuanX() { 
      return undefined !== $task 
    };

    read(key, session='default'){
      let jsonStr = '';
      let data = null;
      if (this.isSurge) {
        jsonStr = $persistentStore.read(key);
      }
      else if (this.isQuanX) {
        jsonStr = $prefs.valueForKey(key);
      }
      try { 
        data = JSON.parse(jsonStr);
      } 
      catch (err){ 
        this.log(`Parse Data Error: ${err}`);
        data = {};
        this.del(key);
      }
      let val = data[session];
      try { if (typeof val == 'string') val = JSON.parse(val); } catch {}
      this.log(`Read Data [${key}][${session}](${typeof val})\n${JSON.stringify(val)}`);
      return val;
    };

    write(key, val, session='default'){
      let jsonStr = '';
      let data = null;
      if (this.isSurge) {
        jsonStr = $persistentStore.read(key);
      }
      else if (this.isQuanX){
        jsonStr = $prefs.valueForKey(key);
      }
      try { 
        data = JSON.parse(jsonStr);
      } 
      catch(err) { 
        this.log(`Parse Data Error: ${err}`);
        data = {};
        this.del(key);
      }
      data[session] = val;
      jsonStr = JSON.stringify(data);
      this.log(`Write Data [${key}][${session}](${typeof val})\n${JSON.stringify(val)}`);
      if (this.isSurge) {
        return $persistentStore.write(jsonStr, key);
      }
      else if (this.isQuanX) {
        return $prefs.setValueForKey(jsonStr, key);
      }
    };

    del(key){
      if (this.isSurge) {
        $persistentStore.write({}, key);
      }
      else if (this.isQuanX) {
        $prefs.setValueForKey({}, key);
      }
    }

    notify(title, subTitle = '', body = ''){
      if (this.isSurge) $notification.post(title, subTitle, body)
      else if (this.isQuanX) $notify(title, subTitle, body)
    }
    
    log(msg){
      console.log(`[${this.scriptName}]\n${msg}\n`)
    }

    get(options, callback){
      this.log(`Http Get: ${JSON.stringify(options)}`);
      if (this.isSurge) {
        $httpClient.get(options, callback);
      }
      else if (this.isQuanX) {
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

    post(options, callback){
      this.log(`Http Post: ${JSON.stringify(options)}`);
      if (this.isSurge) {
        $httpClient.post(options, callback);
      }
      else if (this.isQuanX) {
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

    get response(){
      return (typeof $response != 'undefined') ? $response : undefined;
    }


    get request(){
      return (typeof $request != 'undefined') ? $request : undefined;
    }

    done(value = {}){
      $done(value)
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

    get isRequest(){
      return (typeof $request != 'undefined') && (typeof $response == 'undefined');
    }

    get isResponse(){
      return typeof $response != 'undefined';
    }
  }(scriptName);
}