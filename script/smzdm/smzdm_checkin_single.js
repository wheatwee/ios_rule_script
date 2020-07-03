/*
Surge Config

[Script]
什么值得买_每日签到 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin_single.js,script-update-interval=0,type=cron,cronexp=10 0 * * *
什么值得买_获取cookie = debug=1,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm/smzdm_checkin_single.js,script-update-interval=0,type=http-request,pattern=^https?:\/\/zhiyou\.smzdm\.com\/user$

[MITM]
hostname = zhiyou.smzdm.com
*/

const zhiyouRegex = /^https?:\/\/zhiyou.smzdm.com\/user$/;
const smzdmCookieKey = 'smzdm_cookie';
const smzdmSessionKey = 'smzdm_session';
const scriptName = '什么值得买';

let magicJS = MagicJS(scriptName);
let smzdmCookie = null;
let beforeLevel = 0;
let beforePoint = 0;
let beforeExp = 0;
let beforeGold = 0;
let beforeSilver = 0;

let getCurrentOptions = {
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

let checkinOptions = {
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

// 检查cookie完整性
function checkCookie(){
  if (smzdmCookie == null){
    smzdmCookie = magicJS.read(smzdmCookieKey);
    if (smzdmCookie == null || smzdmCookie == ''){
        magicJS.log('没有读取到什么值得买有效cookie，请访问zhiyou.smzdm.com进行登录');
        magicJS.notify(scriptName, '', '❓没有获取到cookie，请先进行登录。')
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
function GetCurrentBefore(){
  return new Promise((resolve, reject) => {
    if (checkCookie()){
      getCurrentOptions.url += new Date().getTime() + '&_=' + new Date().getTime();
      getCurrentOptions.headers.Cookie = smzdmCookie;
      magicJS.get(getCurrentOptions, (err, resp, data)=>{
        magicJS.log('获取用户签到前数据 ' + data);
        before_data = /jQuery.*\((.*)\)/.exec(data)[1];
        let before_obj = JSON.parse(before_data);
        if ('smzdm_id' in before_obj && before_obj['smzdm_id'] != undefined && before_obj['smzdm_id'].length >0 ){
            beforeLevel = Number(before_obj['level']);
            beforePoint = Number(before_obj['point']);
            beforeExp = Number(before_obj['exp']);
            beforeGold = Number(before_obj['gold']);
            beforeSilver = Number(before_obj['silver']);
            if (before_obj['checkin']['has_checkin'] == true){
                let content = '🥇等级' + beforeLevel + ' 💡积分' + beforePoint + ' 🔰经验' + beforeExp + 
                              '\n💰金币' + beforeGold +' ✨碎银子' + beforeSilver + ' 📮未读消息' + before_obj['unread']['notice']['num'];
                magicJS.notify(scriptName, '🤣今天已经签到过，不要重复签到哦！！', content);
                reject('发现重复签到，已取消本次签到。');
            }
            else {
              resolve('本日没有签到，可以继续执行。');
            }
        }
        else {
            reject('获取用户签到前数据异常。');
        }
      })
    }
  });
}

// 每日签到
function Checkin() {
  return new Promise((resolve, reject) => {
    if (checkCookie()){
      checkinOptions.url += new Date().getTime() + '&_=' + new Date().getTime();
      checkinOptions.headers.Cookie = smzdmCookie;
      magicJS.get(checkinOptions, (err, resp, data)=>{
        if (err) {
          magicJS.notify(scriptName, '', '❌签到出现异常，http请求错误。');
          reject('签到出现异常:' + err);
        }
        else{
          checkin_data = /jQuery.*\((.*)\)/.exec(data)[1];
          let checkin_obj = JSON.parse(checkin_data);
          if (checkin_obj['error_code'] == 0){
            resolve('本日签到成功');
          }
          else{
            magicJS.notify(scriptName, '', '❌签到出现异常，请查阅签到日志。');
            reject('签到出现异常:' + data);
          }
        }
      });
    }
  });
}

// 签到后获取用户信息
function GetCurrentAfter() {
  return new Promise((resolve, reject) => {
    if (checkCookie()){
      getCurrentOptions.url += new Date().getTime() + '&_=' + new Date().getTime();
      getCurrentOptions.headers.Cookie = smzdmCookie;
      magicJS.get(getCurrentOptions, (err, resp, data)=>{
        if (err) {
          magicJS.notify(scriptName, '', '❌签到出现异常，http请求错误。');
          reject('签到出现异常:' + err);
        }
        else{
          magicJS.log('获取用户签到后数据 ' + data);
          after_data = /jQuery.*\((.*)\)/.exec(data)[1];
          let after_obj = JSON.parse(after_data);
          if ('smzdm_id' in after_obj && after_obj['smzdm_id'] != undefined && after_obj['smzdm_id'].length >0 ){
            let subj = '🎉签到成功，📆已连续签到'+ after_obj['checkin']['daily_checkin_num'] + '天';
            let add_level = Number(after_obj['level']) - beforeLevel;
            let add_point = Number(after_obj['point']) - beforePoint;
            let add_exp = Number(after_obj['exp']) - beforeExp;
            let add_gold = Number(after_obj['gold']) - beforeGold;
            let add_silver = Number(after_obj['silver']) - beforeSilver;
            let content = '🥇等级' + after_obj['level'] + (add_level > 0 ? '(+' + add_level + ')' : '') + 
                            ' 💡积分' + after_obj['point'] + (add_point > 0 ? '(+' + add_point + ')' : '') +  
                            ' 🔰经验' + after_obj['exp'] + (add_exp > 0 ? '(+' + add_exp + ')' : '') + 
                            '\n💰金币' + after_obj['gold'] + (add_gold > 0 ? '(+' + add_gold + ')' : '') +  
                            ' ✨碎银子' + after_obj['silver'] + (add_silver > 0 ? '(+' + add_silver + ')' : '') +
                            ' 📮未读消息' + after_obj['unread']['notice']['num'];
            magicJS.notify(scriptName, subj, content);
            resolve('获取用户签到后数据成功。')
          }
          else {
            magicJS.notify(scriptName, '', '❌获取用户签到后数据异常！！');
            reject('获取用户签到后数据异常。');
          }
        }
      })
    }
  });
}

function Main(){
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
    magicJS.done();
  }
  else{
    GetCurrentBefore().then(value =>{
      magicJS.log(value);
      Checkin().then(value=>{
        magicJS.log(value);
        GetCurrentAfter().then((result)=>{
          magicJS.log(result);
          magicJS.done();
        })
      },
      reason=>{
        magicJS.log(reason);
        magicJS.done();
      })
    },
    reason =>{
      magicJS.log(reason);
      magicJS.done();
    });
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