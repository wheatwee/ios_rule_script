const SCRIPT_NAME = '慢慢买';
const DEBUG = false;
const GET_COOKIE_REGEX = /https:?\/\/m\.manmanbuy\.com\/taolijin\/logserver.aspx/;
const LOGIN_REGEX = /https?:\/\/m\.manmanbuy\.com\/taolijin\/login.aspx/
const CHECKIN_COOKIE_KEY = 'manmanbuy_checkin_cookie';
const LOGIN_BODY_KEY = 'manmanbuy_login_body';
const USERNAME_KEY = 'manmanbuy_username'
const DEVICEID_KEY = 'manmanbuy_deviceid'

let magicJS = MagicJS(SCRIPT_NAME, DEBUG);

let login_options = {
  url: 'https://m.manmanbuy.com/taolijin/login.aspx',
  headers: {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-cn",
    "Connection": "keep-alive",
    "Content-Length": "66",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Cookie": "",
    "Host": "m.manmanbuy.com",
    "Origin": "https://m.manmanbuy.com",
    "Referer": "https://m.manmanbuy.com/renwu/index.aspx",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios ",
    "X-Requested-With": "XMLHttpRequest",
    "savedata": "false"
  },
  body: ''
}

let checkin_options = {
  url: 'https://m.manmanbuy.com/renwu/index.aspx',
  headers: {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-cn",
    "Connection": "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Cookie": "",
    "Host": "m.manmanbuy.com",
    "Origin": "https://m.manmanbuy.com",
    "Referer": "https://m.manmanbuy.com/renwu/index.aspx",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios ",
    "X-Requested-With": "XMLHttpRequest"
  },
  body: ''
}

async function Main(){
  if (magicJS.isRequest){
    if (LOGIN_REGEX.test(magicJS.request.url) && magicJS.request.headers.hasOwnProperty('savedata') == false){
      let hisBody = magicJS.read(LOGIN_BODY_KEY);
      if (hisBody != magicJS.request.body){
        magicJS.write(LOGIN_BODY_KEY, magicJS.request.body);
        magicJS.log('获取登录Body成功。')
        magicJS.notify('🎈获取登录Body成功！！');
      }
      else{
        magicJS.log('登录Body没有变化，无需更新。')
      }
    }
    else if (GET_COOKIE_REGEX.test(magicJS.request.url)){
      try{
        let hisCookie = magicJS.read(CHECKIN_COOKIE_KEY);
        let cookie = magicJS.request.headers['Cookie'];
        let devicedId = magicJS.request.body.match(/deviceid=([^&]*)/)[1];
        let username = magicJS.request.body.match(/username=([^&]*)/)[1];
        let hisDevicedId = magicJS.read(DEVICEID_KEY);
        let hisUsername = magicJS.read(USERNAME_KEY);
        if (hisCookie != cookie || devicedId != hisDevicedId || hisUsername != username){
          magicJS.write(DEVICEID_KEY, devicedId);
          magicJS.write(USERNAME_KEY, username);
          magicJS.write(CHECKIN_COOKIE_KEY, cookie);
          magicJS.log('获取签到Cookie和Body成功。')
          magicJS.notify('🎈获取签到Cookie和Body成功！！');
        }
      }
      catch (err){
        magicJS.log(`获取签到Cookie和Body失败，执行异常${err}`);
        magicJS.notify('❌获取签到Cookie和Body失败，执行异常！！');

      }
    }
    magicJS.done();
  }
  else{
    let loginResult = await new Promise((resolve) =>{
      let cookie = magicJS.read(CHECKIN_COOKIE_KEY);
      let body = magicJS.read(LOGIN_BODY_KEY);
      if (!!cookie && !!body){
        login_options.headers['Cookie'] = cookie;
        login_options.body = body;
        magicJS.post(login_options, (err, resp, data) =>{
          if (err){
            magicJS.log(`登录失败，http请求异常:${err}`);
            resolve(false);
          }
          else{
            try{
              let obj = JSON.parse(data);
              if (obj['code'] == 1){
                magicJS.log('登录成功');
                resolve(true);
              }
              else{
                magicJS.log(`登录失败，接口响应不合法：${data}`);
                magicJS.notify('❌登录失败，接口响应不合法。');
                resolve(false);
              }
            }
            catch(err){
              magicJS.log(`登录失败，执行异常：${err}，接口响应：${data}`);
              magicJS.notify('❌登录失败，执行异常。');
              resolve(false);
            }
          }
        })
      }
      else{
        magicJS.notify('❌登录失败，请先获取登录Cookie和Body！！');
        resolve(false);
      }
    })
    if (loginResult){
      await new Promise((resolve) =>{
        let cookie = magicJS.read(CHECKIN_COOKIE_KEY);
        let devicedId = magicJS.read(DEVICEID_KEY);
        let username = magicJS.read(USERNAME_KEY);
        let body = `action=checkin&username=${username}&c_devid=${devicedId}&isAjaxInvoke=true`;
        if (!!cookie && !!body){
          checkin_options.headers['Cookie'] = cookie;
          checkin_options.body = body;
          magicJS.post(checkin_options, (err, resp, data) =>{
            if (err){
              magicJS.log(`签到失败，http请求异常:${err}`);
            }
            else{
              try{
                let obj = JSON.parse(data);
                if (obj['code'] == 1){
                  magicJS.log(`签到成功，获得积分${obj['data']['jifen']}，已连续签到${obj['data']['zt']}天！！`);
                  magicJS.notify(`🎉签到成功\n🎁获得积分${obj['data']['jifen']}，已连续签到${obj['data']['zt']}天！！`)
                }
                else if(obj['code'] == 0){
                  magicJS.log(`签到失败，可能是重复签到，接口响应：${data}`);
                  magicJS.notify('❌签到失败，可能是重复签到！！');
                }
                else{
                  magicJS.log(`签到失败，接口响应不合法：${data}`);
                  magicJS.notify('❌签到失败，接口响应不合法！！');
                }
              }
              catch(err){
                magicJS.log(`签到失败，执行异常：${err}，接口响应：${data}`);
                magicJS.notify('❌签到失败，执行异常！！');
              }
            }
            resolve();
          })
        }
        else{
          magicJS.notify('❌签到失败，请先获取签到Cookie！！');
          resolve();
        }
      })
    }
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

