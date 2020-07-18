/*
[MITM]
m.client.10010.com

[Script]
联通_获取cookie = type=http-request,pattern=^https?:\/\/m\.client\.10010\.com\/dailylottery\/static\/(integral|doubleball)\/firstpage,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/10010/unicom_checkin.js,script-update-interval=0
联通_签到与抽奖 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/10010/unicom_checkin.js,script-update-interval=0,type=cron,cronexp=10 0 * * *
*/
const getLotteryCookieRegex = /^https?:\/\/m\.client\.10010\.com\/dailylottery\/static\/(integral|doubleball)\/firstpage/;
const unicomCookieKey = 'unicom_user_cookie';
const mobileKey = 'unicom_mobile'
const encryptMobileKey = 'unicom_encrypt_mobile'
const cityCodeKey = 'city_code'
const scriptName = '中国联通';

let magicJS = MagicJS(scriptName,false);

let userLoginOptions = {
  url: "http://m.client.10010.com/dailylottery/static/textdl/userLogin?flag=1",
  headers: {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-cn",
    "Connection": "close",
    "Cookie": "",
    "Host": "m.client.10010.com",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@6.0201}{systemVersion:dis}",
    "savedata": "false"
  }
}

let daySingOptions = {
  url: "https://act.10010.com/SigninApp/signin/daySign?vesion=0.3044332648335779",
  headers: {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-cn",
    "Connection": "keep-alive",
    "Cookie": null,
    "Host": "act.10010.com",
    "Origin": "https://act.10010.com",
    "Referer": "https://act.10010.com/SigninApp/signin/querySigninActivity.htm?version=iphone_c@6.0201",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "X-Requested-With": "XMLHttpRequest",
    "savedata": "false"
  },
  body: ''
}

let daySingNewVersionOptions = {
  url: "https://act.10010.com/SigninApp/signin/todaySign?vesion=0.5630763707346611",
  headers: {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-cn",
    "Connection": "close",
    "Cookie": null,
    "Host": "act.10010.com",
    "Origin": "https://act.10010.com",
    "Referer": "https://act.10010.com/SigninApp/signin/querySigninActivity.htm",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@7.0402}{systemVersion:dis}{yw_code:}",
    "savedata": "false"
  },
  body: ''
}

let getContinueCountOptions = {
  url: "https://act.10010.com/SigninApp/signin/getContinuCount?vesion=0.35425159102265746",
  headers: {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-cn",
    "Connection": "keep-alive",
    "Cookie": null,
    "Host": "act.10010.com",
    "Origin": "https://act.10010.com",
    "Referer": "https://act.10010.com/SigninApp/signin/querySigninActivity.htm?version=iphone_c@6.0201",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "X-Requested-With": "XMLHttpRequest",
    "savedata": "false"
  },
  body: ''
}

let getScoreTotalOptions = {
  url: "https://act.10010.com/SigninApp/signin/getIntegral?vesion=0.9157830014621342",
  headers: {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-cn",
    "Connection": "keep-alive",
    "Cookie": null,
    "Host": "act.10010.com",
    "Origin": "https://act.10010.com",
    "Referer": "https://act.10010.com/SigninApp/signin/querySigninActivity.htm?version=iphone_c@6.0201",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "X-Requested-With": "XMLHttpRequest",
    "savedata": "false"
  },
  body: ''
}

let getGoldTotalOptions = {
  url: "https://act.10010.com/SigninApp/signin/getGoldTotal?vesion=0.7865317639339587",
  headers: {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-cn",
    "Connection": "keep-alive",
    "Cookie": null,
    "Host": "act.10010.com",
    "Origin": "https://act.10010.com",
    "Referer": "https://act.10010.com/SigninApp/signin/querySigninActivity.htm?version=iphone_c@6.0201",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "X-Requested-With": "XMLHttpRequest",
    "savedata": "false"
  },
  body: ''
}

let getUserInfoOptions = {
  url: "https://m.client.10010.com/mobileService/home/queryUserInfoSeven.htm?version=iphone_c@7.0402&desmobiel=&showType=3",
  headers: {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-cn",
    "Connection": "close",
    "Cookie": "",
    "Host": "m.client.10010.com",
    "User-Agent": "ChinaUnicom4.x/240 CFNetwork/1121.2.2 Darwin/19.3.0"
  }
}

let getLotteryCountOptions = {
  url: "http://m.client.10010.com/dailylottery/static/active/findActivityInfojifen?areaCode=031&groupByType=&mobile=",
  headers: {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-cn",
    "Connection": "close",
    "Cookie": null,
    "Host": "m.client.10010.com",
    "Origin": "https://m.client.10010.com",
    "Referer": "http://m.client.10010.com/dailylottery/static/integral/firstpage?encryptmobile=",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "X-Requested-With": "XMLHttpRequest",
    "savedata": "false"
  },
  body: ''
}

let getLotteryCountNewVersionOptions = {
  url: "http://m.client.10010.com/dailylottery/static/active/findActivityInfo?areaCode=031&groupByType=&mobile=",
  headers: {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-cn",
    "Connection": "close",
    "Cookie": null,
    "Host": "m.client.10010.com",
    "Origin": "https://m.client.10010.com",
    "Referer": "http://m.client.10010.com/dailylottery/static/integral/firstpage?encryptmobile=",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "X-Requested-With": "XMLHttpRequest",
    "savedata": "false"
  },
  body: ''
}

let dailyLotteryOptions = {
  url: "http://m.client.10010.com/dailylottery/static/integral/choujiang?usernumberofjsp=",
  headers: {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-cn",
    "Connection": "close",
    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    "Cookie": null,
    "Host": "m.client.10010.com",
    "Origin": "https://m.client.10010.com",
    "Referer": "http://m.client.10010.com/dailylottery/static/integral/firstpage?encryptmobile=",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "X-Requested-With": "XMLHttpRequest",
    "savedata": "false"
  },
  body: ''
}

let dailyLotteryNewVersionOptions = {
  url: "https://m.client.10010.com/dailylottery/static/doubleball/choujiang?usernumberofjsp=",
  headers: {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-cn",
    "Connection": "close",
    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    "Cookie": null,
    "Host": "m.client.10010.com",
    "Origin": "https://m.client.10010.com",
    "Referer": "http://m.client.10010.com/dailylottery/static/integral/firstpage?encryptmobile=",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "X-Requested-With": "XMLHttpRequest",
    "savedata": "false"
  },
  body: ''
}

let meituanCouponOptions = {
  url: 'https://m.client.10010.com/welfare-mall-front/mobile/api/bj2402/v1?reqdata=%7B%22saleTypes%22%3A%22TY%22%2C%22amount%22%3A0%2C%22goodsId%22%3A%228a29ac8a72be05a70172c067722600b8%22%2C%22sourceChannel%22%3A%22955000300%22%2C%22payWay%22%3A%22%22%2C%22imei%22%3A%22%22%2C%22proFlag%22%3A%22%22%2C%22points%22%3A0%2C%22scene%22%3A%22%22%2C%22promoterCode%22%3A%22%22%7D',
  headers: {
    "Accept": "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-cn",
    "Connection": "keep-alive",
    "Cookie": "",
    "Host": "m.client.10010.com",
    "Origin": "https://img.client.10010.com",
    "Referer": "https://img.client.10010.com/jifenshangcheng/meituan?whetherFriday=YES&from=955000006&from=955000006&idx=1&idx=1",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 unicom{version:iphone_c@7.0402}{systemVersion:dis}{yw_code:}"
  }
}

// 用户登录
function UserLogin(){
  // 联通App签到
  return new Promise((resolve) =>{
    let cookie = magicJS.read(unicomCookieKey);
    if (cookie){
      userLoginOptions.headers['Cookie'] = cookie;
      magicJS.get(userLoginOptions, (err, resp, data) =>{
        if (err){
          magicJS.log('用户登录失败，http请求异常：' + err);
          resolve([false, '用户登录失败']);
        }
        else{
          if (data.indexOf('天天抽奖') >= 0){
            magicJS.log('用户登录成功');
            resolve([true, '用户登录成功'])
          }
          else if (data.indexOf('请稍后重试') >= 0){
            magicJS.log('用户登录失败');
            resolve([false, '用户登录失败']);
          }
          else{
            magicJS.log('用户登录失败，接口响应不合法：' + data);
            resolve([false, '用户登录失败']);
          }
        }
      });
    }
    else{
      resolve([false, '请先获取token再登录']);
      magicJS.log('请先获取cookie再刷新token');
    }
  });
}

// 旧版签到
function AppCheckin(){
  // 联通App签到
  return new Promise((resolve) =>{
    let unicomCookie = magicJS.read(unicomCookieKey);
    daySingOptions.headers['Cookie'] = unicomCookie;
    magicJS.post(daySingOptions, (err, resp, data) => {
      if (err){
        magicJS.log('签到失败，http请求异常：' + err);
        magicJS.notify(scriptName, '', '❌签到失败，http请求异常！！');
        resolve([false, '签到失败', null,null,null]);
      }
      else {
        magicJS.log('联通签到，接口响应数据：' + data);
        let obj = {};
        try{
          obj = JSON.parse(data);
          if (obj.hasOwnProperty('prizeCount')){
            magicJS.log('签到成功');
            resolve([true, '签到成功', obj.prizeCount, obj.growthV, obj.flowerCount]);
          }
          else if (data == '{}'){
            magicJS.log('重复签到');
            resolve([true, '重复签到', null,null,null]);
          }
          else if (obj.hasOwnProperty('toLogin')){
            magicJS.log('未登录');
            resolve([false, '未登录', null,null,null]);
          }
          else{
            resolve([false, '接口返回异常', null,null,null]);
          }
        }
        catch (err){
          magicJS.log('签到异常，代码执行错误：' + err);
          resolve([false, '签到异常', null,null,null]);
        }
      }
    })
  });
}

// 新版签到
function AppCheckinNewVersion(){
  // 联通App签到
  return new Promise((resolve) =>{
    let unicomCookie = magicJS.read(unicomCookieKey);
    daySingNewVersionOptions.headers['Cookie'] = unicomCookie;
    magicJS.post(daySingNewVersionOptions, (err, resp, data) => {
      if (err){
        magicJS.log('新版签到失败，http请求异常：' + err);
        magicJS.notify(scriptName, '', '❌签到失败，http请求异常！！');
        resolve([false, '签到失败', null,null,null]);
      }
      else {
        let obj = {};
        try{
          obj = JSON.parse(data);
          if (obj.hasOwnProperty('msgCode') && obj['msgCode'] == '0000'){
            magicJS.log('新版签到成功');
            resolve([true, '签到成功', obj.prizeCount, obj.growValue, bj.flowerCount]);
          }
          else if (obj.hasOwnProperty('msgCode') && obj['msgCode'] == '8888'){
            magicJS.log('新版重复签到');
            resolve([true, '重复签到',obj.prizeCount,obj.growValue,obj.flowerCount]);
          }
          else if (obj.hasOwnProperty('toLogin')){
            magicJS.log('新版未登录');
            resolve([false, '未登录', null,null,null]);
          }
          else{
            magicJS.log('新版签到异常，接口返回数据不合法。' + data);
            resolve([false, '签到异常', null,null,null]);
          }
        }
        catch (err){
          magicJS.log('新版签到异常，代码执行错误：' + err);
          resolve([false, '签到异常', null,null,null]);
        }
      }
    })
  });
}

// 获取连续签到天数
function GetContinueCount(){
  return new Promise((resolve, reject) =>{
    let unicomCookie = magicJS.read(unicomCookieKey);
    getContinueCountOptions.headers['Cookie'] = unicomCookie;
    magicJS.post(getContinueCountOptions, (err, resp, data) => {
      if (err){
        magicJS.log('获取连续签到次数失败，http请求异常：' + err);
        reject('?');
      }
      else {
        // magicJS.log('获取连续签到次数，接口响应数据：' + data);
        if (data){
          let number = '?';
          if (/^\d+$/.test(data)){
            number = data;
          }
          else{
            magicJS.log('获取连续签到次数失败，接口响应不合法。' + data);
          }
          resolve(number);
        }
        else{
          magicJS.log('获取连续签到次数异常，没有获取到响应体。' );
          reject('?');
        }
      }
    })
  });
}

// 获取当前积分(弃用)
function GetScoreTotal(){
  return new Promise((resolve) =>{
    let unicomCookie =  magicJS.read(unicomCookieKey);
    getScoreTotalOptions.headers['Cookie'] = unicomCookie;
    magicJS.post(getScoreTotalOptions, (err, resp, data) => {
      if (err){
        magicJS.log('获取积分失败，http请求异常：' + err);
        resolve('未知');
      }
      else {
        magicJS.log('获取积分，接口响应数据：' + data);
        let obj = JSON.parse(data);
        if (obj.hasOwnProperty('integralTotal')){
          resolve(obj['integralTotal']);
        }
        else{
          magicJS.log('获取积分异常，接口响应不合法：' + data);
          resolve('未知');
        }
      }
    })
  });
}

// 获取当前金币(弃用)
function GetGoldTotal(){
  return new Promise((resolve) =>{
    let unicomCookie = magicJS.read(unicomCookieKey);
    getGoldTotalOptions.headers['Cookie'] = unicomCookie;
    magicJS.post(getGoldTotalOptions, (err, resp, data) => {
      if (err){
        magicJS.log('获取金币失败，http请求异常：' + err);
        resolve('未知');
      }
      else {
        magicJS.log('获取金币，接口响应数据：' + data);
        let obj = JSON.parse(data);
        if (obj.hasOwnProperty('goldTotal')){
          resolve(obj['goldTotal']);
        }
        else{
          magicJS.log('获取金币异常，接口响应不合法：' + data);
          resolve('未知');
        }
      }
    })
  });
}

// 获取用户信息
function GetUserInfo(){
  return new Promise((resolve, reject) =>{
    let unicomCookie = magicJS.read(unicomCookieKey);
    if (unicomCookie){
      let mobile = magicJS.read(mobileKey);
      getUserInfoOptions.headers['Cookie'] = unicomCookie;
      getUserInfoOptions.url = getUserInfoOptions.url.replace(/desmobiel=[0-9a-zA-Z]*/, `desmobiel=${mobile}`);
      magicJS.get(getUserInfoOptions, (err, resp, data) => {
        if (err){
          magicJS.log('获取用户信息失败，http请求异常：' + err);
          reject({});
        }
        else {
          let result = {}
          let obj = JSON.parse(data);
          if (obj.hasOwnProperty('data') && obj['data'].hasOwnProperty('dataList')){
            obj['data']['dataList'].forEach(element => {
              if ('flow,fee,voice,point'.indexOf(element['type'])>=0){
                result[element['type']] = `${element['remainTitle']}${element['number']}${element['unit']}`
              }
            });
            magicJS.log('获取用户信息：' + JSON.stringify(result));
            resolve(result);
          }
          else{
            magicJS.log('获取用户信息异常，接口响应不合法：' + data);
            reject(data);
          }
        }
      })
    }
    else{
      resolve({});
    }
  });
}

// 获取抽奖次数
function GetLotteryCount(){
  return new Promise((resolve) =>{
    let unicomCookie = magicJS.read(unicomCookieKey);
    let encryptMobile = magicJS.read(encryptMobileKey);
    let areaCode = magicJS.read(cityCodeKey);
    getLotteryCountOptions.headers['Cookie'] = unicomCookie;
    getLotteryCountOptions.headers['Referer'] = getLotteryCountOptions.headers['Referer'].replace(/encryptmobile=.*/, `encryptmobile=${encryptMobile}`);
    getLotteryCountOptions.url = getLotteryCountOptions.url.replace(/mobile=[0-9a-zA-Z]*/, `mobile=${encryptMobile}`).replace(/areaCode=[0-9]*/, `areaCode=${areaCode}`);
    if (unicomCookie && encryptMobile){
      magicJS.get(getLotteryCountOptions, (err, resp, data) => {
        if (err){
          magicJS.log('获取抽奖次数失败，http请求异常：' + err);
          resolve(0);
        }
        else {
          let obj = JSON.parse(data);
          if (obj.hasOwnProperty('acFrequency')){
            let lotteryCount = Number(obj['acFrequency']['totalAcFreq']);
            magicJS.log('获取抽奖次数：' + lotteryCount);
            resolve(lotteryCount);
          }
          else{
            magicJS.log('获取抽奖次数异常，接口响应不合法：' + data);
            resolve(0);
          }
        }
      })
    }
  });
}

// 新版获取抽奖次数
function GetLotteryCountNewVersion(){
  return new Promise((resolve) =>{
    let unicomCookie = magicJS.read(unicomCookieKey);
    let encryptMobile = magicJS.read(encryptMobileKey);
    let areaCode = magicJS.read(cityCodeKey);
    getLotteryCountNewVersionOptions.headers['Cookie'] = unicomCookie;
    getLotteryCountNewVersionOptions.headers['Referer'] = getLotteryCountNewVersionOptions.headers['Referer'].replace(/encryptmobile=.*/, `encryptmobile=${encryptMobile}`);
    getLotteryCountNewVersionOptions.url = getLotteryCountNewVersionOptions.url.replace(/mobile=.*/, `mobile=${encryptMobile}`).replace(/areaCode=[0-9]*/, `areaCode=${areaCode}`);;
    if (unicomCookie && encryptMobile){
      magicJS.get(getLotteryCountNewVersionOptions, (err, resp, data) => {
        if (err){
          magicJS.log('获取新版抽奖次数失败，http请求异常：' + err);
          resolve(0);
        }
        else {
          let obj = JSON.parse(data);
          if (obj.hasOwnProperty('acFrequency')){
            let lotteryCount = Number(obj['acFrequency']['totalAcFreq']);
            magicJS.log('获取新版抽奖次数：' + lotteryCount);
            resolve(lotteryCount);
          }
          else{
            magicJS.log('获取新版抽奖次数异常，接口响应不合法：' + data);
            resolve(0);
          }
        }
      })
    }
  });
}

// 单次免费抽奖
function DailyLottery(){
  return new Promise((resolve) =>{
    // 签到的cookie就可以用
    let lotteryCookie = magicJS.read(unicomCookieKey);
    let encryptMobile = magicJS.read(encryptMobileKey);
    if (lotteryCookie && encryptMobile){
      dailyLotteryOptions.headers['Cookie'] = lotteryCookie;
      dailyLotteryOptions.headers['Referer'] = dailyLotteryOptions.headers['Referer'].replace(/encryptmobile=.*/, `encryptmobile=${encryptMobile}`);
      dailyLotteryOptions.url = dailyLotteryOptions.url.replace(/usernumberofjsp=.*/, `usernumberofjsp=${encryptMobile}`);
      magicJS.post(dailyLotteryOptions, (err, resp, data) => {
        if (err){
          magicJS.log('每日免费抽奖，http请求异常：' + err);
          resolve('请求异常');
        }
        else {
          magicJS.log('每日免费抽奖，接口响应数据：' + data);
          let obj = JSON.parse(data);
          if (obj.hasOwnProperty('Rsptype') && obj['Rsptype'] == '6666'){
            resolve('次数不足');
          }
          else if (obj.hasOwnProperty('Rsptype') && obj['Rsptype'] == '3333'){
            resolve('请求无效');
          }
          else if (obj.hasOwnProperty('RspMsg')){
            resolve(obj['RspMsg']);
          }
          else{
            magicJS.log('每日免费抽奖，接口响应不合法：' + data);
            resolve('接口响应不合法');
          }
        }
      });
    }
    else{
      magicJS.log('每日免费抽奖，获取登录信息失败，请重新访问一次抽奖页面。');
      magicJS.notify(scriptName, '', '每日免费抽奖，❌获取登录信息失败！！')
      resolve('未登录');
    }
  });
}

// 新版单次免费抽奖
function DailyLotteryNewVersion(){
  return new Promise((resolve) =>{
    // 签到的cookie就可以用
    let lotteryCookie = magicJS.read(unicomCookieKey);
    let encryptMobile = magicJS.read(encryptMobileKey);
    if (lotteryCookie && encryptMobile){
      dailyLotteryNewVersionOptions.headers['Cookie'] = lotteryCookie;
      dailyLotteryNewVersionOptions.headers['Referer'] = dailyLotteryNewVersionOptions.headers['Referer'].replace(/encryptmobile=.*/, `encryptmobile=${encryptMobile}`);
      dailyLotteryNewVersionOptions.url = dailyLotteryNewVersionOptions.url.replace(/usernumberofjsp=.*/, `usernumberofjsp=${encryptMobile}`);
      magicJS.post(dailyLotteryNewVersionOptions, (err, resp, data) => {
        if (err){
          magicJS.log('新版每日免费抽奖，http请求异常：' + err);
          resolve('请求异常');
        }
        else {
          magicJS.log('新版每日免费抽奖，接口响应数据：' + data);
          let obj = JSON.parse(data);
          if (obj.hasOwnProperty('Rsptype') && obj['Rsptype'] == '6666'){
            resolve('次数不足');
          }
          else if (obj.hasOwnProperty('Rsptype') && obj['Rsptype'] == '3333'){
            resolve('请求无效');
          }
          else if (obj.hasOwnProperty('RspMsg')){
            resolve(obj['RspMsg']);
          }
          else{
            magicJS.log('新版每日免费抽奖，接口响应不合法：' + data);
            resolve('接口响应不合法');
          }
        }
      });
    }
    else{
      magicJS.log('每日免费抽奖，获取登录信息失败，请重新访问一次抽奖页面。');
      magicJS.notify(scriptName, '', '每日免费抽奖，❌获取登录信息失败！！')
      resolve('未登录');
    }
  });
}

// 批量免费抽奖
async function StartDailyLottery(){
  let lotteryCount = await GetLotteryCount();
  let lotteryList = '';
  if (lotteryCount > 0){
    for (let i=0;i<lotteryCount;i++){
      // 开始抽奖
      magicJS.log(`第${i+1}次免费抽奖开始`);
      if (lotteryList){
        lotteryList += '\n';
      }
      lotteryList += `第${i+1}次抽奖：${await DailyLottery()}`;
    }
  }
  return [lotteryCount,lotteryList];
}

// 批量新版免费抽奖
async function StartDailyLotteryNewVersion(lotteryCount){
  let lotteryNewVersionCount = await GetLotteryCountNewVersion();
  let lotteryNewVersionList = '';
  if (lotteryNewVersionCount > 0){
    for (let i=0;i<lotteryNewVersionCount;i++){
      // 开始抽奖
      magicJS.log(`新版第${i+1}次免费抽奖开始`);
      if (lotteryNewVersionList){
        lotteryNewVersionList += '\n';
      }
      lotteryNewVersionList += `第${lotteryCount+i+1}次抽奖：${await DailyLotteryNewVersion()}`;
    }
  }
  return [lotteryNewVersionCount,lotteryNewVersionList];
}

// 美团外卖优惠券
function GetMeituanCoupon(){
  return new Promise((resolve, reject) =>{
    // 签到的cookie就可以用
    let meituanCookie = magicJS.read(unicomCookieKey);
    if (meituanCookie){
      meituanCouponOptions.headers['Cookie'] = meituanCookie;
      magicJS.get(meituanCouponOptions, (err, resp, data) => {
        if (err){
          magicJS.log('领取美团外卖优惠券异常，http请求异常：' + err);
          reject('美团外卖优惠券:请求异常');
        }
        else {
          let obj = {};
          try{
            obj = JSON.parse(data);
            if (obj.hasOwnProperty('code')){
              if (obj['code'] == '0' && obj['msg'] == '下单成功'){
                magicJS.log('领取美团外卖优惠券，领取成功');
                resolve('美团外卖优惠券：领取成功');
              }
              else if (obj['code'] == '1'){
                magicJS.log('领取美团外卖优惠券，达到领取上限');
                resolve('美团外卖优惠券：达到领取上限');
              }
              else{
                magicJS.log('领取美团外卖优惠券，接口响应不合法：' + data);
                reject('接口响应不合法');
              }
            } 
            else{
              magicJS.log('领取美团外卖优惠券，接口响应不合法：' + data);
              reject('美团外卖优惠券：接口响应不合法');
            }
          }
          catch (err){
            magicJS.log('领取美团外卖优惠券，代码执行异常：' + err);
            reject('美团外卖优惠券：代码执行异常');
          }
        }
      });
    }
    else{
      magicJS.log('领取美团外卖优惠券失败，请重新访问一次领取优惠券页面。');
      magicJS.notify(scriptName, '', '❌领取美团外卖优惠券，获取登录信息失败！！')
      resolve('美团外卖优惠券：登录信息无效');
    }
  });
}

async function Main(){
  if (magicJS.isRequest){
    if(getLotteryCookieRegex.test(magicJS.request.url) && magicJS.request.headers.hasOwnProperty('savedata') == false){
      // 获取cookie
      let cookie = magicJS.request.headers['Cookie'];
      let hisCookie = magicJS.read(unicomCookieKey);
      // 获取手机号
      let mobile = /c_mobile=([0-9]{11})/.exec(cookie)[1];
      let hisMobile = magicJS.read(mobileKey);
      // 获取加密手机号
      let encryptMobile = /encryptmobile=([a-zA-Z0-9]*)/.exec(magicJS.request.url)[1];
      let hisEncryptMobile = magicJS.read(encryptMobileKey);
      let cityCode = /city=([0-9]*)/.exec(magicJS.request.headers['Cookie'])[1]
      // 获取城市代码
      let hisCityCode = magicJS.read(cityCodeKey);
      let notifyContent = '';
      magicJS.log(`新的cookie：${cookie}\n\n旧的cookie：${hisCookie}`);
      magicJS.log(`新的手机号：${mobile}\n旧的手机号：${hisMobile}`);
      magicJS.log(`新的手机号密文：${encryptMobile}\n旧的手机号密文：${hisEncryptMobile}`);
      magicJS.log(`新的城市代码：${cityCode}\n旧的城市代码：${hisCityCode}`);
      // cookie
      if (cookie != hisCookie){
        magicJS.write(unicomCookieKey, cookie);
        if (!hisCookie){
          magicJS.log('首次获取联通cookie成功：' + cookie);
          notifyContent += '🍩联通cookie:获取成功';
        }
        else{
          magicJS.log('更新联通cookie成功：' + cookie);
          notifyContent += '🍩联通cookie:更新成功';
        }
      }
      else{
        magicJS.log('联通cookie没有变化，无需更新');
        notifyContent += '🍩联通cookie:没有变化';
      }
      // 手机号
      if (mobile != hisMobile){
        magicJS.write(mobileKey, mobile);
        if (!hisMobile){
          notifyContent += ' 📱手机号:获取成功';
        }
        else{
          notifyContent += ' 📱手机号:更新成功';
        }
      }
      else{
        magicJS.log('手机号码密文没有变化，无需更新');
        notifyContent += ' 📱手机号:没有变化';
      }
      // 手机号密文
      if (hisEncryptMobile != encryptMobile){
        magicJS.write(encryptMobileKey, encryptMobile);
        if (!hisEncryptMobile){
          notifyContent += '\n🗳手机号密文:获取成功';
        }
        else{
          notifyContent += '\n🗳手机号密文:更新成功';
        }
      }
      else{
        magicJS.log('手机号码密文没有变化，无需更新');
        notifyContent += '\n🗳手机号密文:没有变化';
      }
      if (cityCode != hisCityCode){
        magicJS.write(cityCodeKey, cityCode);
        if (!hisCityCode){
          magicJS.log('首次获取联通城市代码成功：' + cityCode);
          notifyContent += ' 🌃城市:获取成功';
        }
        else{
          magicJS.log('更新联通城市代码成功：' + cityCode);
          notifyContent += ' 🌃城市:更新成功';
        }
      }
      else{
        magicJS.log('城市代码没有变化，无需更新');
        notifyContent += ' 🌃城市:没有变化';
      }
      magicJS.notify(scriptName, '', notifyContent);
    }
    magicJS.done();
  }
  else{
    magicJS.log('签到与抽奖开始执行！');
    // 生成签到结果的通知
    let notifySubTtile = '';
    // 通知内容
    let notifyContent = '';
    let checkinResult,checkinResultStr,prizeCount,growthV,flowerCount;
    // 连续签到天数
    let contineCount = '?'

    await (async ()=>{
      // 旧版签到，如果失败就用新版的再试试
      [,[checkinResult,checkinResultStr,prizeCount,growthV,flowerCount]] = await magicJS.attempt(AppCheckin(), [false,'签到异常',null,null,null]);
      if (!checkinResult){
        [,[checkinResult,checkinResultStr,prizeCount,growthV,flowerCount]] = await magicJS.attempt(AppCheckinNewVersion(), [false,'签到异常',null,null,null]);
      }
      if (!!prizeCount && !!growthV && !!flowerCount){
        notifySubTtile = `🧱积分+${prizeCount} 🎈成长值+${growthV} 💐鲜花+${flowerCount}`
      }

      // 查询连续签到天数
      let genContinueCountPromise = magicJS.retry(GetContinueCount, 3, 2000)();
      [,contineCount] = await magicJS.attempt(genContinueCountPromise);

      // 查询用户信息
      let getUserInfoPromise = magicJS.retry(GetUserInfo, 3, 2000)();
      let [,userInfo] = await magicJS.attempt(getUserInfoPromise);
      if (userInfo && userInfo.hasOwnProperty('flow') && userInfo.hasOwnProperty('fee')){
        notifyContent += `${userInfo['flow']} ${userInfo['fee']}\n${userInfo['voice']} ${userInfo['point']}`
      }

      // 领取美团外卖优惠券
      let getMeituanCouponRetry = magicJS.retry(GetMeituanCoupon, 3, 2000);
      let getMeituanCouponPromise = getMeituanCouponRetry();
      let [,meituanResult] = await magicJS.attempt(getMeituanCouponPromise);
      if (meituanResult){
        notifyContent += notifyContent ? `\n${meituanResult}` : meituanResult;
      }

      // 抽奖前用户登录
      let [errUserLogin, loginResult, loginStr] = await magicJS.attempt(UserLogin(), [false, '用户登录失败']);
      if (errUserLogin){
        magicJS.log('用户登录失败，异常信息：' + errUserLogin);
      }
      else if (loginResult){
        // 旧版抽奖
        let [errLottery, [lotteryCount, lotteryResult]] = await magicJS.attempt(StartDailyLottery(), [null,null]);
        if (errLottery) magicJS.log('旧版抽奖出现异常：' + errLottery);
        // 新版抽奖
        let [errLotteryNewVersion, [lotteryNewVersionCount, lotteryNewVersionResult]] = await magicJS.attempt(StartDailyLotteryNewVersion(lotteryCount), [null,null]);
        if (errLotteryNewVersion) magicJS.log('新版抽奖出现异常：' + errLotteryNewVersion);
        if (lotteryResult){
          notifyContent += notifyContent ? `\n${lotteryResult}` : lotteryResult;
        }
        if (lotteryNewVersionResult){
          notifyContent +=  notifyContent ? `\n${lotteryNewVersionResult}` : lotteryNewVersionResult;
        }
      }
      else {
        magicJS.log('用户登录结果：' + loginStr);
      }
    })();

    magicJS.log('签到与抽奖执行完毕！');
    // 通知签到和抽奖结果
    magicJS.notify(`${scriptName} ${checkinResultStr}，连续签到${contineCount}天`, notifySubTtile, notifyContent);
    magicJS.done();
  }
}

Main();

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
    
    get version() { return '202007181155' };
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
        if (typeof data === 'string'){
          data = JSON.parse(data);
        }
        data = data != null && data != undefined ? data: {};
      } 
      catch (err){ 
        this.log(`Parse Data Error: ${err}`);
        data = {};
        this.del(key);
      }
      let val = data[session];
      try { if (typeof val == 'string') val = JSON.parse(val) } catch {}
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
        if (typeof data === 'string'){
          data = JSON.parse(data);
        }
        data = data != null && data != undefined ? data: {};
      } 
      catch(err) { 
        this.log(`Parse Data Error: ${err}`);
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
        $persistentStore.write({}, key);
      }
      else if (this.isQuanX) {
        $prefs.setValueForKey({}, key);
      }
      else if (this.isNode || this.isJSBox){
        this.write(key, '');
      }
    }

    notify(title, subTitle = '', body = ''){
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

    table(msg){
      console.table(`[${this.scriptName}]\n${msg}\n`)
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
  }(scriptName);
}