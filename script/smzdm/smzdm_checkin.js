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

let magicJS = MagicJS(scriptName);
let smzdmCookie = null;
let webCheckinStr = '';
let appCheckinStr = '';

let webGetCurrentBeforeOptions = {
    url : 'https://zhiyou.smzdm.com/user/info/jsonp_get_current?callback=jQuery112407333236740601499_',
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

let webGetCurrentAfterOptions = {
  url : 'https://zhiyou.smzdm.com/user/info/jsonp_get_current?callback=jQuery112407333236740601499_',
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
  if (smzdmCookie == null){
    smzdmCookie = magicJS.read(smzdmCookieKey);
    if (smzdmCookie == null || smzdmCookie == ''){
      webCheckinStr = 'WebCookie无效';
      magicJS.log('没有读取到什么值得买有效cookie，请访问zhiyou.smzdm.com进行登录');
      magicJS.notify(scriptName, '', '❓没有获取到Webcookie，请先进行登录。')
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

// 获取用户信息
function WebGetCurrentBefore(){
  return new Promise((resolve) => {
    if (WebCheckCookie()){
      webGetCurrentBeforeOptions.url += new Date().getTime() + '&_=' + new Date().getTime();
      webGetCurrentBeforeOptions.headers.Cookie = smzdmCookie;
      magicJS.get(webGetCurrentBeforeOptions, (err, resp, data)=>{
        magicJS.log('Web获取用户签到前数据 ' + data);
        before_data = /jQuery.*\((.*)\)/.exec(data)[1];
        let before_obj = JSON.parse(before_data);
        if ('smzdm_id' in before_obj && before_obj['smzdm_id'] != undefined && before_obj['smzdm_id'].length >0 ){
          let beforeLevel = Number(before_obj['level']);
          let beforePoint = Number(before_obj['point']);
          let beforeExp = Number(before_obj['exp']);
          let beforeGold = Number(before_obj['gold']);
          let beforeSilver = Number(before_obj['silver']);
          let haveCheckin = before_obj['checkin']['has_checkin'];
          if (haveCheckin == true){
            webCheckinStr = 'Web重复签到';
            magicJS.log('Web今天已经签到过，不要重复签到。');
            resolve([beforeLevel, beforePoint, beforeExp, beforeGold, beforeSilver, haveCheckin]);
          }
          else {
            resolve([beforeLevel, beforePoint, beforeExp, beforeGold, beforeSilver, haveCheckin]);
          }
        }
        else {
          resolve([null, null, null, null, null, false]);
        }
      })
    }
    else{
      resolve([null, null, null, null, null, false]);
    }
  });
}

// 每日签到
function WebCheckin() {
  return new Promise((resolve) => {
    if (WebCheckCookie()){
      webCheckinOptions.url += new Date().getTime() + '&_=' + new Date().getTime();
      webCheckinOptions.headers.Cookie = smzdmCookie;
      magicJS.get(webCheckinOptions, (err, resp, data)=>{
        if (err) {
          webCheckinStr = 'Web签到异常';
          magicJS.log('Web签到出现异常:' + err);
          resolve(false);
        }
        else{
          checkin_data = /jQuery.*\((.*)\)/.exec(data)[1];
          let checkin_obj = JSON.parse(checkin_data);
          if (checkin_obj['error_code'] == 0){
            webCheckinStr = 'Web签到成功';
            magicJS.log('Web本日签到成功');
            resolve(true);
          }
          else{
            magicJS.log(`Web签到出现异常，接口返回数据：${data}`);
            webCheckinStr = 'Web签到异常';
            resolve(false);
          }
        }
      });
    }
    else{
      resolve(false);
    }
  });
}

// 签到后获取用户信息
function WebGetCurrentAfter(beforeLevel, beforePoint, beforeExp, beforeGold, beforeSilver) {
  return new Promise((resolve) => {
    if (WebCheckCookie()){
      webGetCurrentAfterOptions.url += new Date().getTime() + '&_=' + new Date().getTime();
      webGetCurrentAfterOptions.headers.Cookie = smzdmCookie;
      magicJS.get(webGetCurrentAfterOptions, (err, resp, data)=>{
        if (err) {
          magicJS.notify(scriptName, '', '❌获取Web签到后异常，http请求错误！！');
          magicJS.log('获取Web签到后数据异常:' + err);
          resolve(false);
        }
        else{
          magicJS.log('获取Web用户签到后数据 ' + data);
          let afterData = /jQuery.*\((.*)\)/.exec(data)[1];
          let afterObj = JSON.parse(afterData);
          if ('smzdm_id' in afterObj && afterObj['smzdm_id'] != undefined && afterObj['smzdm_id'].length >0 ){
            let subj = `📆${webCheckinStr} ${appCheckinStr} 已签到${afterObj['checkin']['daily_checkin_num']}天`;
            let addLevel = Number(afterObj['level']) - beforeLevel;
            let addPoint = Number(afterObj['point']) - beforePoint;
            let addExp = Number(afterObj['exp']) - beforeExp;
            let addGold = Number(afterObj['gold']) - beforeGold;
            let addSilver = Number(afterObj['silver']) - beforeSilver;
            let content = '🥇等级' + afterObj['level'] + (addLevel > 0 ? '(+' + addLevel + ')' : '') + 
            ' 💡积分' + afterObj['point'] + (addPoint > 0 ? '(+' + addPoint + ')' : '') +  
            ' 🔰经验' + afterObj['exp'] + (addExp > 0 ? '(+' + addExp + ')' : '') + '\n' + 
            '💰金币' + afterObj['gold'] + (addGold > 0 ? '(+' + addGold + ')' : '') +  
            ' ✨碎银子' + afterObj['silver'] + (addSilver > 0 ? '(+' + addSilver + ')' : '') +
            ' 📮未读消息' + afterObj['unread']['notice']['num'];
            magicJS.notify(scriptName, subj, content);
            resolve(true);
          }
          else {
            magicJS.notify(scriptName, '', '❌获取Web用户签到后数据异常！！');
            magicJS.log('获取Web用户签到后数据异常。');
            resolve(false);
          }
        }
      })
    }
    else{
      resolve(false);
    }
  });
}

function AppGetToken(){
  return new Promise((resolve) => {
    let account = magicJS.read(smzdmAccountKey);
    let password = magicJS.read(smzdmPasswordKey);
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
        appCheckinStr = 'App登录异常';
        magicJS.log(`什么值得买App登录失败，http请求异常。异常内容：${err}`);
        magicJS.notify(scriptName, '', '❌App登录失败，http请求异常！！');
        resolve('');
      }
      else{
        try{
          let obj = JSON.parse(data);
          magicJS.log(`什么值得买App登录，接口响应内容：${data}`);
          if (obj.error_code == '111104'){
            appCheckinStr = 'App登录异常';
            magicJS.log(`什么值得买App登录失败，账号密码错误`);
            magicJS.notify(scriptName, '', '❌App登录失败，账号密码错误！！');
            resolve('');
          }
          if (obj.error_code == '110202'){
            appCheckinStr = 'App登录异常';
            magicJS.log(`什么值得买App登录失败，验证码错误`);
            magicJS.notify(scriptName, '', '❌App登录失败，验证码错误！！');
            resolve('');
          }
          else if (obj.error_code != '0'){
            appCheckinStr = 'App登录异常';
            magicJS.log(`什么值得买App登录失败，接口响应格式不合法`);
            magicJS.notify(scriptName, '', '❌App登录失败，接口响应格式不合法！！');
            resolve('');
          }
          else{
            magicJS.log(`什么值得买App登录成功`);
            magicJS.write(smzdmTokenKey, obj['data']['token']);
            resolve(obj['data']['token']);
          }
        }
        catch (ex){
          appCheckinStr = 'App登录异常';
          magicJS.log(`什么值得买App登录失败，代码执行异常。异常内容：${ex}`);
          magicJS.notify(scriptName, '', '❌登录失败，代码执行异常！！');
          resolve('');
        }
      }
    })
  })
}

/*
什么值得买App端签到，感谢苍井灰灰提供接口
返回值 0 失败 1 成功 2 网络繁忙 3 token失效 4 重复签到
*/
function AppCheckin(token){
  return new Promise((resolve, reject) => {
    if (magicJS.isJSBox){
      appCheckinOptions.body = {token: token, f:'win'};
    }
    else if (magicJS.isNode){
      appCheckinOptions.form = {token: token, f:'win'};
    }
    else{
      appCheckinOptions.body =  `token=${token}&f=win`;
    }
    if (magicJS.isNode){
      delete appCheckinOptions['headers']['Accept-Encoding'];
    }
    magicJS.post(appCheckinOptions, (err, resp, data) => {
      if (err){
        appCheckinStr = 'App签到异常';
        magicJS.log(`App签到失败，http请求异常。异常内容：${err}`);
        magicJS.notify(scriptName, '', '❌App签到失败，http请求异常！！');
        reject(0);
      }
      else{
        try{
          magicJS.log(`什么值得买App签到，接口响应内容：${data}`);
          let obj = JSON.parse(data);
          if (obj.error_code == '-1' && obj.error_msg.indexOf('主页君较忙') >= 0){
            appCheckinStr = 'App签到失败';
            magicJS.log('App签到失败，网络访问超时。');
            reject(2);
          }
          if (obj.error_code == '11111'){
            appCheckinStr = 'App签到失败';
            magicJS.log(`App签到失败，Token已过期。`);
            magicJS.notify(scriptName, '', '❌App签到失败，Token已过期！！');
            resolve(3);
          }
          else if (obj.error_code != '0'){
            appCheckinStr = 'App签到失败';
            magicJS.log(`App签到失败，接口响应格式不合法。`);
            magicJS.notify(scriptName, '', '❌App签到失败，接口响应格式不合法！！');
            resolve(0);
          }
          else if(obj.error_msg == '已签到'){
            appCheckinStr = 'App重复签到';
            magicJS.log('App签到重复签到。');
            resolve(4);
          }
          else{
            appCheckinStr = 'App签到成功';
            magicJS.log('App签到成功！！');
            resolve(1);
          }
        }
        catch (ex){
          appCheckinStr = 'App签到异常';
          magicJS.log(`App签到失败，代码执行异常。异常内容：${ex}`);
          magicJS.notify(scriptName, '', '❌App签到失败，代码执行异常！！');
          resolve(0);
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

    // 查询签到前用户数据
    let [beforeLevel, beforePoint, beforeExp, beforeGold, beforeSilver, haveCheckin] = await WebGetCurrentBefore();

    // Web签到
    if (!haveCheckin){
      await WebCheckin();
    }

    // App签到
    let token = magicJS.read(smzdmTokenKey);
    if (!token){
      token = await AppGetToken();
    }
    let AppCheckinRetry = magicJS.retry(AppCheckin, 5, 3000, async (result)=>{
      if (result == 3){
        token = await AppGetToken();
        throw result;
      }
    });
    // 重试三次App签到，每次间隔3000毫秒
    await magicJS.attempt(AppCheckinRetry(token));

    // 查询签到后用户数据
    await WebGetCurrentAfter(beforeLevel, beforePoint, beforeExp, beforeGold, beforeSilver);
  }
  magicJS.done();
}

Main();

function MagicJS(scriptName='MagicJS'){
  return new class{

    constructor(){
      this.scriptName = scriptName;
      this.node = {'request': undefined, 'fs': undefined, 'data': {}};
      if (this.isNode){
        this.node.request = require('request');
        this.node.data = require('./magic.json');
        this.node.fs = require('fs');
      }
    }
    
    get version() { return '202007090033' };
    get isSurge() { return typeof $httpClient !== 'undefined' };
    get isQuanX() { return typeof $task !== 'undefined' };
    get isLoon() { return typeof $loon !== 'undefined' };
    get isJSBox() { return typeof $drive !== 'undefined'};
    get isNode() { return typeof module !== 'undefined' && !this.isJSBox };
    get isRequest() { return (typeof $request !== 'undefined') && (typeof $response === 'undefined')}
    get isResponse() { return typeof $response !== 'undefined' }
    get response() { return (typeof $response !== 'undefined') ? $response : undefined }
    get request() { return (typeof $request !== 'undefined') ? $request : undefined }

    read(key, session='default'){
      let data = '';
      if (this.isSurge) {
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
      this.log(`Read Data [${key}][${session}](${typeof val})\n${JSON.stringify(val)}`);
      return val;
    };

    write(key, val, session='default'){
      let data = '';
      if (this.isSurge) {
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
      if (this.isSurge) {
        return $persistentStore.write(data, key);
      }
      else if (this.isQuanX) {
        return $prefs.setValueForKey(data, key);
      }
      else if (this.isNode){
        this.node.fs.writeFileSync('./magic.json', data, (err) =>{
          this.log(err);
        })
      }
      else if (this.isJSBox){
        $file.write({data: $data({string: data}), path: 'drive://magic.json'});
      }
      this.log(`Write Data [${key}][${session}](${typeof val})\n${JSON.stringify(val)}`);
    };

    del(key){
      if (this.isSurge) {
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
          console.log('Http Post 接口返回' + data);
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
     * @returns 返回两个值，第一个值为异常，第二个值为执行结果
     */
    attempt(promise){ return promise.then(data=>[null, data]).catch(ex=>{this.log('捕获异常' + ex); return [ex, null]}) }

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