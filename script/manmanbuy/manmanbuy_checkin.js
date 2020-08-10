const SCRIPT_NAME = '慢慢买';
const GET_COOKIE_REGEX = /https:?\/\/m\.manmanbuy\.com\/taolijin\/logserver.aspx/;
const LOGIN_REGEX = /https?:\/\/m\.manmanbuy\.com\/taolijin\/login.aspx/
const CHECKIN_COOKIE_KEY = 'manmanbuy_checkin_cookie';
const LOGIN_BODY_KEY = 'manmanbuy_login_body';
const USERNAME_KEY = 'manmanbuy_username'
const DEVICEID_KEY = 'manmanbuy_deviceid'

let magicJS = MagicJS(SCRIPT_NAME, "INFO");

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
      let hisBody = magicJS.read(LOGIN_BODY_KEY, 'default');
      if (hisBody != magicJS.request.body){
        magicJS.write(LOGIN_BODY_KEY, magicJS.request.body, 'default');
        magicJS.log('获取登录Body成功。')
        magicJS.notify('🎈获取登录Body成功！！');
      }
      else{
        magicJS.log('登录Body没有变化，无需更新。')
      }
    }
    else if (GET_COOKIE_REGEX.test(magicJS.request.url)){
      try{
        let hisCookie = magicJS.read(CHECKIN_COOKIE_KEY, 'default');
        let cookie = magicJS.request.headers['Cookie'];
        let devicedId = magicJS.request.body.match(/deviceid=([^&]*)/)[1];
        let username = magicJS.request.body.match(/username=([^&]*)/)[1];
        let hisDevicedId = magicJS.read(DEVICEID_KEY, 'default');
        let hisUsername = magicJS.read(USERNAME_KEY, 'default');
        if (hisCookie != cookie || devicedId != hisDevicedId || hisUsername != username){
          magicJS.write(DEVICEID_KEY, devicedId, 'default');
          magicJS.write(USERNAME_KEY, username, 'default');
          magicJS.write(CHECKIN_COOKIE_KEY, cookie, 'default');
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
      let cookie = magicJS.read(CHECKIN_COOKIE_KEY, 'default');
      let body = magicJS.read(LOGIN_BODY_KEY, 'default');
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
        let cookie = magicJS.read(CHECKIN_COOKIE_KEY, 'default');
        let devicedId = magicJS.read(DEVICEID_KEY, 'default');
        let username = magicJS.read(USERNAME_KEY, 'default');
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

function MagicJS(scriptName='MagicJS', logLevel='INFO'){

  return new class{
    constructor(){
      this.scriptName = scriptName;
      this.logLevel = this.getLogLevels(logLevel.toUpperCase());
      this.node = {'request': undefined, 'fs': undefined, 'data': {}};
      if (this.isNode){
        this.node.request = require('request');
        this.node.data = require('./magic.json');
        this.node.fs = require('fs');
      }
    }
    
    get version() { return '202008102255' };
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
        val = $file.read('drive://magic.json').string;
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
      try {if(!!val && typeof val === 'string') val = JSON.parse(val)} catch(err) {}
      if (typeof val === 'undefined') val = null;
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
        data = JSON.parse($file.read('drive://magic.json').string);
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
      data = JSON.stringify(data);
      if (this.isSurge || this.isLoon) {
        $persistentStore.write(data, key);
      }
      else if (this.isQuanX) {
        $prefs.setValueForKey(data, key);
      }
      else if (this.isNode){
        this.node.fs.writeFileSync('./magic.json', data, (err) =>{
          this.logError(err);
        })
      }
      else if (this.isJSBox){
        $file.write({data: $data({string: data}), path: 'drive://magic.json'});
      }
      this.logDebug(`write data [${key}]${!!session? `[${session}]`: ''}(${typeof val})\n${JSON.stringify(val)}`);
    };

    del(key, session=''){
      this.logDebug(`delete key [${key}]${!!session ? `[${session}]`:''}`);
      this.write(key, undefined, session);
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

