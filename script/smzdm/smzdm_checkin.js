/*
Surge Config

[Script]
什么值得买_每日签到 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,,type=cron,cronexp=10 0 * * *
什么值得买_获取cookie = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,,type=http-request,requires-body=true,pattern=^https?:\/\/zhiyou\.smzdm\.com\/user$
什么值得买_获取账号密码 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin.js,,type=http-request,requires-body=true,pattern=^https?:\/\/user-api\.smzdm\.com\/user_login\/normal$

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
  let smzdmCookie = magicJS.read(smzdmCookieKey, 'default');
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
    let smzdmCookie = magicJS.read(smzdmCookieKey, 'default');
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
    let smzdmCookie = magicJS.read(smzdmCookieKey, 'default');
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
    let account = smzdmAccount? smzdmAccount : magicJS.read(smzdmAccountKey, 'default');
    let password = smzdmPassword? smzdmPassword : magicJS.read(smzdmPasswordKey, 'default');
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
            magicJS.write(smzdmTokenKey, obj['data']['token'], 'default');
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
        old_session_id = magicJS.read(smzdmSessionKey, 'default') != null ? magicJS.read(smzdmSessionKey, 'default') : '';
        // 获取新的session_id
        console.log({'old_session_id': old_session_id, 'new_session_id': session_id});    
        // 比较差异
        if (old_session_id == session_id){
          magicJS.log('网页版cookie没有变化，无需更新。');
        }
        else{
          // 持久化cookie
          magicJS.write(smzdmSessionKey, session_id, 'default');
          magicJS.write(smzdmCookieKey, magicJS.request.headers.Cookie, 'default');
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
          let hisAccount = magicJS.read(smzdmAccountKey, 'default');
          let hisPassword = magicJS.read(smzdmPasswordKey, 'default');
          if (account != hisAccount || password != hisPassword){
            magicJS.write(smzdmAccountKey, account, 'default');
            magicJS.write(smzdmPasswordKey, password, 'default');
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
    let afterLevel, afterPoint, afterExp, afterGold, afterSilver, afterHaveCheckin, unread;

    if (!WebCheckCookie()){
      magicJS.log('没有读取到什么值得买有效cookie，请访问zhiyou.smzdm.com进行登录');
      magicJS.notify(scriptName, '', '❓没有获取到Web端Cookie，请先进行登录。');
    }
    else{
      // 查询签到前用户数据
      [beforeLevel, beforePoint, beforeExp, beforeGold, beforeSilver, haveCheckin,] = await WebGetCurrentInfo();
      magicJS.log(`签到前等级${beforeLevel}，积分${beforePoint}，经验${beforeExp}，金币${beforeGold}，碎银子${beforeSilver}`);

      // App端签到
      let account = smzdmAccount? smzdmAccount : magicJS.read(smzdmAccountKey, 'default');
      let password = smzdmPassword? smzdmPassword : magicJS.read(smzdmPasswordKey, 'default');
      if (!!account && !!password){
        appToken = magicJS.read(smzdmTokenKey, 'default');
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

      await magicJS.sleep(5000);
      
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
      [afterLevel, afterPoint, afterExp, afterGold, afterSilver, afterHaveCheckin, checkinNum, unread] = await WebGetCurrentInfo();
      magicJS.log(`签到后等级${afterLevel}，积分${afterPoint}，经验${afterExp}，金币${afterGold}，碎银子${afterSilver}`);
    }

    if (haveCheckin && afterHaveCheckin){
      webCheckinStr = 'Web端重复签到';
    }
    else if(!haveCheckin && afterHaveCheckin){
      webCheckinStr = 'Web端签到成功';
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

function MagicJS(scriptName='MagicJS', logLevel='INFO'){

  return new class{
    constructor(){
      this.scriptName = scriptName;
      this.logLevel = this.getLogLevels(logLevel.toUpperCase());
      this.node = {'request': undefined, 'fs': undefined, 'data': {}};
      if (this.isNode){
        this.node.fs = require('fs');
        this.node.request = require('request');
        try{
          this.node.fs.accessSync('./magic.json');
        }
        catch(err){
          this.logError(err);
          this.node.fs.writeFileSync('./magic.json', '{}')
        }
        this.node.data = require('./magic.json');
      }
      if (this.isJSBox){
        if (!$file.exists('drive://MagicJS')){
          $file.mkdir('drive://MagicJS');
        }
        if (!$file.exists('drive://MagicJS/magic.json')){
          $file.write({
            data: $data({string: '{}'}),
            path: 'drive://MagicJS/magic.json'
          })
        }
      }
    }
    
    get version() { return 'v2.1.3' };
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

    get logLevels(){
      return {
        DEBUG: 4,
        INFO: 3,
        WARNING: 2,
        ERROR: 1,
        CRITICAL: 0
      };
    } 

    getLogLevels(level){
      try{
        if (this.isNumber(level)){
          return level;
        }
        else{
          let levelNum = this.logLevels[level];
          if (typeof levelNum === 'undefined'){
            this.logError(`获取MagicJS日志级别错误，已强制设置为DEBUG级别。传入日志级别：${level}。`)
            return this.logLevels.DEBUG;
          }
          else{
            return levelNum;
          }
        }
      }
      catch(err){
        this.logError(`获取MagicJS日志级别错误，已强制设置为DEBUG级别。传入日志级别：${level}，异常信息：${err}。`)
        return this.logLevels.DEBUG;
      }
    }

    read(key, session=''){
      let val = '';
      // 读取原始数据
      if (this.isSurge || this.isLoon) {
        val = $persistentStore.read(key);
      }
      else if (this.isQuanX) {
        val = $prefs.valueForKey(key);
      }
      else if (this.isNode){
        val = this.node.data;
      }
      else if (this.isJSBox){
        val = $file.read('drive://MagicJS/magic.json').string;
      }
      try {
        // Node 和 JSBox数据处理
        if (this.isNode) val = val[key]
        if (this.isJSBox) val = JSON.parse(val)[key];
        // 带Session的情况
        if (!!session){
          if(typeof val === 'string') val = JSON.parse(val);
          val = !!val && typeof val === 'object' ? val[session]: null;
        }
      } 
      catch (err){ 
        this.logError(`raise exception: ${err}`);
        val = !!session? {} : null;
        this.del(key);
      }
      if (typeof val === 'undefined') val = null;
      try {if(!!val && typeof val === 'string') val = JSON.parse(val)} catch(err) {}
      this.logDebug(`read data [${key}]${!!session? `[${session}]`: ''}(${typeof val})\n${JSON.stringify(val)}`);
      return val;
    };

    write(key, val, session=''){
      let data = !!session ? {} : '';
      // 读取原先存储的JSON格式数据
      if (!!session && (this.isSurge || this.isLoon)) {
        data = $persistentStore.read(key);
      }
      else if (!!session && this.isQuanX) {
        data = $prefs.valueForKey(key);
      }
      else if (this.isNode){
        data = this.node.data;
      }
      else if (this.isJSBox){
        data = JSON.parse($file.read('drive://MagicJS/magic.json').string);
      }
      if (!!session){
        // 有Session，要求所有数据都是Object
        try {
          if (typeof data === 'string') data = JSON.parse(data)
          data = typeof data === 'object' ? data : {};
        }
        catch(err){
          this.logError(`raise exception: ${err}`);
          this.del(key); 
          data = {};
        };
        if (this.isJSBox || this.isNode){
          // 构造数据
          if (!data.hasOwnProperty(key) || typeof data[key] != 'object'){
            data[key] = {};
          }
          if (!data[key].hasOwnProperty(session)){
            data[key][session] = null;
          }
          // 写入或删除数据
          if (typeof val === 'undefined'){
            delete data[key][session];
          }
          else{
            data[key][session] = val;
          }
        }
        else {
          // 写入或删除数据      
          if (typeof val === 'undefined'){
            delete data[session];
          }
          else{
            data[session] = val;
          }
        }
      }
      // 没有Session时
      else{
        if (this.isNode || this.isJSBox){
          // 删除数据
          if (typeof val === 'undefined'){
            delete data[key];
          }
          else{
            data[key] = val;
          }
        }        
        else{    
          // 删除数据      
          if (typeof val === 'undefined'){
            data = null;
          }
          else{
            data = val;
          }
        }
      }
      // 数据回写
      if (typeof data === 'object') data = JSON.stringify(data);
      if (this.isSurge || this.isLoon) {
        $persistentStore.write(data, key);
      }
      else if (this.isQuanX) {
        $prefs.setValueForKey(data, key);
      }
      else if (this.isNode){
        this.node.fs.writeFileSync('./magic.json', data)
      }
      else if (this.isJSBox){
        $file.write({data: $data({string: data}), path: 'drive://MagicJS/magic.json'});
      }
      this.logDebug(`write data [${key}]${!!session? `[${session}]`: ''}(${typeof val})\n${JSON.stringify(val)}`);
    };

    del(key, session=''){
      this.logDebug(`delete key [${key}]${!!session ? `[${session}]`:''}`);
      this.write(key, undefined, session);
    }

    /**
     * iOS系统通知
     * @param {*} title 通知标题
     * @param {*} subTitle 通知副标题
     * @param {*} body 通知内容
     * @param {*} options 通知选项，目前支持传入超链接或Object
     * Surge不支持通知选项，Loon仅支持打开URL，QuantumultX支持打开URL和多媒体通知
     * options "applestore://" 打开Apple Store
     * options "https://www.apple.com.cn/" 打开Apple.com.cn
     * options {'open-url': 'https://www.apple.com.cn/'} 打开Apple.com.cn
     * options {'open-url': 'https://www.apple.com.cn/', 'media-url': 'https://raw.githubusercontent.com/Orz-3/mini/master/Apple.png'} 打开Apple.com.cn，显示一个苹果Logo
     */ 
    notify(title=this.scriptName, subTitle='', body='', options=''){
      let convertOptions = (_options) =>{
        let newOptions = '';
        if (typeof _options === 'string'){
          if (this.isLoon) newOptions = _options;
          else if (this.isQuanX) newOptions = {'open-url': _options};
        }
        else if (typeof _options === 'object'){
          if (this.isLoon) newOptions = !!_options['open-url'] ? _options['open-url'] : '';
          else if (this.isQuanX) newOptions = !!_options['open-url'] || !!_options['media-url'] ? _options : {};
        }
        return newOptions;
      }
      options = convertOptions(options);
      // 支持单个参数通知
      if (arguments.length == 1){
        title = this.scriptName;
        subTitle = '',
        body = arguments[0];
      }
      if (this.isSurge){
        $notification.post(title, subTitle, body);
      }
      else if (this.isLoon){
        // 2020.08.11 Loon2.1.3(194)TF 如果不加这个logDebug，在跑测试用例连续6次通知，会漏掉一些通知，已反馈给作者。
        this.logDebug(`title: ${title}, subTitle：${subTitle}, body：${body}, options：${options}`);
        if (!!options) $notification.post(title, subTitle, body, options);
        else $notification.post(title, subTitle, body);
      }
      else if (this.isQuanX) {
         $notify(title, subTitle, body, options);
      }
      else if (this.isNode) {
        this.log(`${title} ${subTitle}\n${body}`);
      }
      else if (this.isJSBox){
        let push = {
          title: title,
          body: !!subTitle ? `${subTitle}\n${body}` : body,
        }
        $push.schedule(push);
      } 
    }
    
    log(msg, level="INFO"){
      if (this.logLevel >= this.getLogLevels(level.toUpperCase())) console.log(`[${level}] [${this.scriptName}]\n${msg}\n`)
    }

    logDebug(msg){
      this.log(msg, "DEBUG");
    }

    logInfo(msg){
      this.log(msg, "INFO");
    }

    logWarning(msg){
      this.log(msg, "WARNING");
    }

    logError(msg){
      this.log(msg, "ERROR");
    }
    
    get(options, callback){
      let _options = typeof options === 'object'? Object.assign({}, options): options;
      this.logDebug(`http get: ${JSON.stringify(_options)}`);
      if (this.isSurge || this.isLoon) {
        $httpClient.get(_options, callback);
      }
      else if (this.isQuanX) {
        if (typeof _options === 'string') _options = { url: _options }
        _options['method'] = 'GET'
        $task.fetch(_options).then(
          resp => {
            resp['status'] = resp.statusCode
            callback(null, resp, resp.body)
          },
          reason => callback(reason.error, null, null),
        )
      }
      else if(this.isNode){
        return this.node.request.get(_options, callback);
      }
      else if(this.isJSBox){
        _options = typeof _options === 'string'? {'url': _options} :_options;
        options['header'] = _options['headers'];
        delete _options['headers']
        _options['handler'] = (resp)=>{
          let err = resp.error? JSON.stringify(resp.error) : undefined;
          let data = typeof resp.data === 'object' ? JSON.stringify(resp.data) : resp.data;
          callback(err, resp.response, data);
        }
        $http.get(_options);
      }
    }

    post(options, callback){
      let _options = typeof options === 'object'? Object.assign({}, options): options;
      this.logDebug(`http post: ${JSON.stringify(_options)}`);
      if (this.isSurge || this.isLoon) {
        $httpClient.post(_options, callback);
      }
      else if (this.isQuanX) {
        if (typeof _options === 'string') _options = { url: _options }
        if (_options.hasOwnProperty('body') && typeof _options['body'] !== 'string') _options['body'] = JSON.stringify(_options['body']);
        _options['method'] = 'POST'
        $task.fetch(_options).then(
          resp => {
            resp['status'] = resp.statusCode
            callback(null, resp, resp.body)
          },
          reason => {callback(reason.error, null, null)}
        )
      }
      else if(this.isNode){
        if (typeof _options.body === 'object') _options.body = JSON.stringify(_options.body);
        return this.node.request.post(_options, callback);
      }
      else if(this.isJSBox){
        _options = typeof _options === 'string'? {'url': _options} : _options;
        _options['header'] = _options['headers'];
        delete _options['headers']
        _options['handler'] = (resp)=>{
          let err = resp.error? JSON.stringify(resp.error) : undefined;
          let data = typeof resp.data === 'object' ? JSON.stringify(resp.data) : resp.data;
          callback(err, resp.response, data);
        }
        $http.post(_options);
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

    isNumber(val) {
      return parseFloat(val).toString() === "NaN"? false: true;
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