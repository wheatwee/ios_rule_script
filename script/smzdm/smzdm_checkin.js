/*
Surge Config

[Script]
什么值得买_每日签到 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,script-update-interval=0,type=cron,cronexp=10 0 * * *
什么值得买_获取cookie = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,script-update-interval=0,type=http-request,requires-body=true,pattern=^https?:\/\/zhiyou\.smzdm\.com\/user$
什么值得买_获取账号密码 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,script-update-interval=0,type=http-request,requires-body=true,pattern=^https?:\/\/user-api\.smzdm\.com\/user_login\/normal$

[MITM]
hostname = zhiyou.smzdm.com, user-api.smzdm.com
*/
const zhiyouRegex = /^https?:\/\/zhiyou\.smzdm\.com\/user$/;
const appLoginRegex = /^https?:\/\/user-api\.smzdm\.com\/user_login\/normal$/;
const smzdmCookieKey = 'smzdm_cookie';
const smzdmSessionKey = 'smzdm_session';
const smzdmTokenKey = 'smzdm_token';
const smzdmAccountKey = 'smzdm_account';
const smzdmPasswordKey = 'smzdm_password';
const scriptName = '什么值得买';
const smzdmAccount = '' // 什么值得买账号
const smzdmPassword = '' // 什么值得买密码

let magicJS = MagicJS(scriptName);
let appToken = null;

let webGetCurrentInfo = {
    url : 'https://zhiyou.smzdm.com/user/info/jsonp_get_current?callback=jQuery112407333236740601499_1595084820484&_=1595084820484',
    headers : {
      'Accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Connection': 'keep-alive',
      'DNT': '1',
      'Host': 'zhiyou.smzdm.com',
      'Referer': 'https://zhiyou.smzdm.com/user/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
      'Cookie': null
    }
};

let webCheckinOptions = {
    url : 'https://zhiyou.smzdm.com/user/checkin/jsonp_checkin?callback=jQuery112404020093264993104_',
    headers : {
      'Accept': '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-cn',
      'Connection': 'keep-alive',
      'Host': 'zhiyou.smzdm.com',
      'Referer': 'https://www.smzdm.com/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Safari/605.1.15',
      'Cookie': null
    }
};

let getAppTokenOptions ={
  url : 'https://api.smzdm.com/v1/user/login',
  headers : {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-cn',
    'Connection': 'keep-alive',
    'Host': 'api.smzdm.com',
    'Content-Type':'application/x-www-form-urlencoded'
  },
  body: ''
};

let appCheckinOptions ={
  url : 'https://api.smzdm.com/v1/user/checkin',
  headers : {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-cn',
    'Connection': 'keep-alive',
    'Host': 'api.smzdm.com',
    'Content-Type':'application/x-www-form-urlencoded'
  },
  body: ''
};

// 检查cookie完整性
function WebCheckCookie(){
  let smzdmCookie = magicJS.read(smzdmCookieKey);
  if (!!smzdmCookie){
    return true;
  }
  else{
      return false;
  }
}

// 获取用户信息
function WebGetCurrentInfo(){
  return new Promise((resolve) => {
    webGetCurrentInfo.url = webGetCurrentInfo.url.replace(/_[0-9]*&_=[0-9]*/, `_${new Date().getTime()}&_=${new Date().getTime()}`);
    let smzdmCookie = magicJS.read(smzdmCookieKey);
    webGetCurrentInfo.headers.Cookie = smzdmCookie;
    magicJS.get(webGetCurrentInfo, (err, resp, data)=>{
      try{
        let obj = JSON.parse(/jQuery.*\((.*)\)/.exec(data)[1]);
        if ('smzdm_id' in obj && !!obj['smzdm_id']){
          let level = Number(obj['level']);
          let point = Number(obj['point']);
          let exp = Number(obj['exp']);
          let gold = Number(obj['gold']);
          let silver = Number(obj['silver']);
          let haveCheckin = obj['checkin']['has_checkin'];
          resolve([level, point, exp, gold, silver, haveCheckin, obj['checkin']['daily_checkin_num'], obj['unread']['notice']['num']]);
        }
        else {
          magicJS.log(`获取用户信息异常，接口返回数据不合法：${data}`);
          resolve([null, null, null, null, null, false, null, null]);
        }
      }
      catch (err){
        magicJS.log(`获取用户信息异常，代码指向异常：${err}，接口返回数据：${data}`);
        resolve([null, null, null, null, null, false, null, null]);
      }
    })
  });
}

// 每日签到
function WebCheckin() {
  return new Promise((resolve, reject) => {
    let smzdmCookie = magicJS.read(smzdmCookieKey);
    webCheckinOptions.url = webCheckinOptions.url.replace(/_[0-9]*&_=[0-9]*/, `_${new Date().getTime()}&_=${new Date().getTime()}`);
    webCheckinOptions.headers.Cookie = smzdmCookie;
    magicJS.get(webCheckinOptions, (err, resp, data)=>{
      if (err) {
        magicJS.log('Web端签到出现异常:' + err);
        reject('Web端签到异常');
      }
      else{
        try {
          let checkin_data = /(callback\()(.*)(\))/.exec(data);
          if (checkin_data){
            let checkin_obj = JSON.parse(checkin_data[2]);
            if (!!checkin_obj && checkin_obj.hasOwnProperty('error_code')){
              if (checkin_obj.error_code == -1){
                magicJS.log(`Web端签到出现异常，网络繁忙，接口返回：${data}`);
                reject( 'Web端网络繁忙');
              }
              else if (checkin_obj['error_code'] == 0){
                magicJS.log('Web端本日签到成功');
                resolve([true, 'Web端签到成功']);
              }
              else{
                magicJS.log(`Web端签到出现异常，接口返回数据不合法：${data}`);
                reject('Web端返回错误');
              }
            }
            else{
              magicJS.log(`Web端签到出现异常，接口返回数据：${data}`);
              reject('Web端签到异常');
            }
          }
          else{
            magicJS.log(`Web端签到出现异常，接口返回数据不合法：${data}`);
            reject('Web端签到异常');
          }
        }
        catch (err){
          magicJS.log(`Web端签到出现异常，代码执行异常：${err}，接口返回：${data}`);
          reject('Web端执行异常');
        }
      }
    });
  });
}

function AppGetToken(){
  return new Promise((resolve) => {
    let account = smzdmAccount? smzdmAccount : magicJS.read(smzdmAccountKey);
    let password = smzdmPassword? smzdmPassword : magicJS.read(smzdmPasswordKey);
    if (magicJS.isJSBox){
      getAppTokenOptions.body = {user_login: account, user_pass: password, f:'win'};
    }
    else if (magicJS.isNode){
      getAppTokenOptions.form = {token: token, f:'win'};
    }
    else{
      getAppTokenOptions.body = `user_login=${account}&user_pass=${password}&f=win`;
    }
    if (magicJS.isNode){
      delete getAppTokenOptions['headers']['Accept-Encoding'];
    }
    magicJS.post(getAppTokenOptions, (err, resp, data) => {
      if (err){
        magicJS.log(`什么值得买App登录失败，http请求异常。异常内容：${err}`);
        resolve([false,'App端登录异常',null]);
      }
      else{
        try{
          let obj = JSON.parse(data);
          magicJS.log(`什么值得买App登录，接口响应内容：${data}`);
          if (obj.error_code == '111104'){
            magicJS.log(`什么值得买App登录失败，账号密码错误`);
            resolve([false,'App端账号密码错误',null]);
          }
          if (obj.error_code == '110202'){
            magicJS.log(`什么值得买App登录失败，验证码错误`);
            resolve([false,'App端验证码错误',null]);
          }
          else if (obj.error_code != '0'){
            magicJS.log(`什么值得买App登录失败，接口响应格式不合法`);
            resolve([false,'App端响应异常',null]);
          }
          else{
            magicJS.log(`什么值得买App登录成功`);
            magicJS.write(smzdmTokenKey, obj['data']['token']);
            resolve([true,'App端登录成功',obj['data']['token']]);
          }
        }
        catch (ex){
          magicJS.log(`什么值得买App登录失败，代码执行异常。异常内容：${ex}`);
          resolve([false,'App端执行异常',null]);
        }
      }
    })
  })
}

/*
什么值得买App端签到，感谢苍井灰灰提供接口
返回值 0 失败 1 成功 2 网络繁忙 3 token失效 4 重复签到
*/
function AppCheckin(){
  return new Promise((resolve, reject) => {
    if (magicJS.isJSBox){
      appCheckinOptions.body = {token: appToken, f:'win'};
    }
    else if (magicJS.isNode){
      appCheckinOptions.form = {token: appToken, f:'win'};
    }
    else{
      appCheckinOptions.body =  `token=${appToken}&f=win`;
    }
    if (magicJS.isNode){
      delete appCheckinOptions['headers']['Accept-Encoding'];
    }
    magicJS.post(appCheckinOptions, (err, resp, data) => {
      if (err){
        magicJS.log(`App端签到失败，http请求异常。异常内容：${err}`);
        reject('App端请求异常');
      }
      else{
        try{
          let obj = JSON.parse(data);
          if (obj.error_code == '-1' && obj.error_msg.indexOf('主页君较忙') >= 0){
            magicJS.log(`App签到失败，网络繁忙。接口返回：${data}`);
            reject('App端网络繁忙');
          }
          else if (obj.error_code == '11111'){
            magicJS.log(`App签到失败，Token已过期。接口返回：${data}`);
            resolve([3, 'App端Token过期']);
          }
          else if (obj.error_code != '0'){
            magicJS.log(`App签到失败，接口响应格式不合法：${data}`);
            resolve([3, 'App端返回异常']);
          }
          else if(obj.error_msg == '已签到'){
            magicJS.log('App端重复签到');
            resolve([4, 'App端重复签到']);
          }
          else{
            magicJS.log('App签到成功！！');
            resolve([1, 'App端签到成功']);
          }
        }
        catch (ex){
          magicJS.log(`App签到失败，代码执行异常。异常内容：${ex}，接口返回：${data}`);
          reject('App端执行异常');
        }
      }
    })
  })
}

async function Main(){
  if (magicJS.isRequest){
    if(zhiyouRegex.test(magicJS.request.url) && magicJS.request.method == 'GET'){
      let match_str = magicJS.request.headers.Cookie.match(/sess=[^\s]*;/);
      session_id = match_str != null ? match_str[0] : null;
      // 获取新的session_id
      if (session_id){
        // 获取持久化的session_id
        old_session_id = magicJS.read(smzdmSessionKey) != null ? magicJS.read(smzdmSessionKey) : '';
        // 获取新的session_id
        console.log({'old_session_id': old_session_id, 'new_session_id': session_id});    
        // 比较差异
        if (old_session_id == session_id){
          magicJS.log('网页版cookie没有变化，无需更新。');
        }
        else{
          // 持久化cookie
          magicJS.write(smzdmSessionKey, session_id);
          magicJS.write(smzdmCookieKey, magicJS.request.headers.Cookie);
          magicJS.log('写入cookie ' + magicJS.request.headers.Cookie);
          magicJS.notify(scriptName, '', '🎈获取cookie成功！！');
        }
      }
      else{
        magicJS.log('没有读取到有效的Cookie信息。');
      }
    }
    else if(appLoginRegex.test(magicJS.request.url) && magicJS.request.method == 'POST'){
      if (magicJS.request.body){
        try{
          // TODO 密码含有&的可能会有问题，待验证
          let matchArray = magicJS.request.body.match(/(user_login=)([^&]*)(&user_pass=)([^&]*)(&v=)/);
          let account = decodeURIComponent(matchArray[2]);
          let password = matchArray[4];
          let hisAccount = magicJS.read(smzdmAccountKey);
          let hisPassword = magicJS.read(smzdmPasswordKey);
          if (account != hisAccount || password != hisPassword){
            magicJS.write(smzdmAccountKey, account);
            magicJS.write(smzdmPasswordKey, password);
            magicJS.notify(scriptName, '', '🎈获取账号密码成功！！');
            magicJS.log(`获取账号密码成功，登录账号：${account}`);
          }
          else{
            magicJS.log(`账号密码没有变化，无需更新。登录账号：${account}`);
          }
        }
        catch (ex){
          magicJS.notify(scriptName, '', '❌获取账号密码出现异常,请查阅日志！！');
          magicJS.log(`获取账号密码出现异常。\n请求数据：${magicJS.request.body}\n异常信息：${ex}`);
        }        
      }
      else{
        magicJS.log(`获取账号密码时请求数据不合法 。\n请求数据：${magicJS.request.body}`);
      }
    }
  }
  else{
    let subTitle = '';
    let content = '';
    let webCheckinErr = null;
    let webCheckinResult = '';
    let webCheckinStr = '';
    let getTokenStr = '';
    let appCheckinErr = null;
    let appCheckinStr = '';
    let beforeLevel, beforePoint, beforeExp, beforeGold, beforeSilver, haveCheckin, checkinNum;
    let afterLevel, afterPoint, afterExp, afterGold, afterSilver, unread;

    if (!WebCheckCookie()){
      magicJS.log('没有读取到什么值得买有效cookie，请访问zhiyou.smzdm.com进行登录');
      magicJS.notify(scriptName, '', '❓没有获取到Web端Cookie，请先进行登录。');
    }
    else{
      // 查询签到前用户数据
      [beforeLevel, beforePoint, beforeExp, beforeGold, beforeSilver, haveCheckin,] = await WebGetCurrentInfo();
      magicJS.log(`签到前等级${beforeLevel}，积分${beforePoint}，经验${beforeExp}，金币${beforeGold}，碎银子${beforeSilver}`);

      // App端签到
      let account = smzdmAccount? smzdmAccount : magicJS.read(smzdmAccountKey);
      let password = smzdmPassword? smzdmPassword : magicJS.read(smzdmPasswordKey);
      if (!!account && !!password){
        appToken = magicJS.read(smzdmTokenKey);
        if (!appToken){
          [,getTokenStr,appToken] = await AppGetToken();
        }
        if (!!appToken){
          let AppCheckinRetry = magicJS.retry(AppCheckin, 5, 2000, async (result)=>{
            if (result == 3){
              appToken = await AppGetToken();
              if (appToken) throw result;
            }
          });
          // 重试5次App签到，每次间隔2000毫秒
          [appCheckinErr,[,appCheckinStr]] = await magicJS.attempt(AppCheckinRetry(), [false, 'App端签到异常']);
          if (appCheckinErr){
            appCheckinStr = appCheckinErr;
          }
        }
        else{
          appCheckinStr = getTokenStr;
        }
      }
      else{
        magicJS.notify(scriptName, '', '❓没有获取到App端账号密码，请先进行登录。');
      }
      
      // Web端签到
      if (!haveCheckin){
        let webCheckinRetry = magicJS.retry(WebCheckin, 2, 1000);
        [webCheckinErr,[webCheckinResult, webCheckinStr]] = await magicJS.attempt(webCheckinRetry(), [false, 'Web端签到异常']);
        if (webCheckinErr) 
        {
          webCheckinStr = webCheckinErr;
          magicJS.log('Web端签到异常：' + webCheckinErr);
        }
      }
      else{
        magicJS.log('Web端重复签到');
        webCheckinStr = 'Web端重复签到';
      }
    }

    if (WebCheckCookie()){
      // 查询签到后用户数据
      [afterLevel, afterPoint, afterExp, afterGold, afterSilver, , checkinNum, unread] = await WebGetCurrentInfo();
      magicJS.log(`签到后等级${afterLevel}，积分${afterPoint}，经验${afterExp}，金币${afterGold}，碎银子${afterSilver}`);
    }

    subTitle = `${webCheckinStr} ${appCheckinStr}`;
    if (!!checkinNum) subTitle += ` 已签到${checkinNum}天`;

    if (beforeLevel && afterLevel){
      let addLevel = afterLevel - beforeLevel;
      let addPoint = afterPoint - beforePoint;
      let addExp = afterExp - beforeExp;
      let addGold = afterGold - beforeGold;
      let addSilver = afterSilver - beforeSilver;
      content = '🥇等级' + afterLevel + (addLevel > 0 ? '(+' + addLevel + ')' : '') + 
      ' 💡积分' + afterPoint + (addPoint > 0 ? '(+' + addPoint + ')' : '') +  
      ' 🔰经验' + afterExp + (addExp > 0 ? '(+' + addExp + ')' : '') + '\n' + 
      '💰金币' + afterGold + (addGold > 0 ? '(+' + addGold + ')' : '') +  
      ' ✨碎银子' + afterSilver + (addSilver > 0 ? '(+' + addSilver + ')' : '') +
      ' 📮未读消息' + unread;
    }
    if (webCheckinStr || appCheckinStr || content){
      magicJS.notify(scriptName, subTitle, content);
    }
    
  }
  magicJS.done();
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
    
    get version() { return '202007220021' };
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