const GET_COOKIE_REGEX = /^https?:\/\/pgc-cms\.jzb\.com\/api\/channel\/recommend/;
const DEVICE_ID_KEY = 'jzb_deviceod';
const HEADERS_KEY = 'jzb_headers';
const SCRIPT_NAME = '家长帮';
const DEBUG = false;

let magicJS = MagicJS(SCRIPT_NAME, DEBUG);

async function Main(){
  if (magicJS.isRequest){
    if(GET_COOKIE_REGEX.test(magicJS.request.url) && magicJS.request.method == 'GET'){
      try{
        let hisDeviceId = magicJS.read(DEVICE_ID_KEY);
        let deviceId = magicJS.request.url.match(/deviceId=([^&]*)/)[1];
        let hisHeaders = magicJS.read(HEADERS_KEY);
        let headers = magicJS.request.headers;
        if (hisDeviceId != deviceId || hisHeaders['Authorization'] != headers['Authorization']){
          headers['Host'] = 'mp.jzb.com';
          magicJS.write(DEVICE_ID_KEY, deviceId);
          magicJS.write(HEADERS_KEY, headers);
          magicJS.log(`家长帮Cookie写入成功`);
          magicJS.notify('🎈Cookie写入成功！！');
        }
      }
      catch(err){
        magicJS.log(`家长帮Cookie写入失败，异常信息：${err}，接口返回${data}`);
        magicJS.notify('❌Cookie写入失败，执行异常。');
      }
    }
  }
  else{
    await new Promise(resolve=>{
      let deviceId = magicJS.read(DEVICE_ID_KEY);
      let headers = magicJS.read(HEADERS_KEY);
      if (!!headers && deviceId){
        let options = {
          url: `https://mp.jzb.com/user/info/sign/?deviceId=${deviceId}`,
          headers: headers
        }
        magicJS.get(options, (err, resp, data)=>{
          if (err){
            magicJS.log(`家长帮签到失败，http请求异常，异常信息：${err}`);
            magicJS.notify('❌签到失败，http请求异常。');
          }
          else{
            try{
              let obj = JSON.parse(data);
              if (obj.errcode == 0){
                magicJS.log(obj.errmsg);
                magicJS.notify(`🎉${obj.errmsg}，本次新增元宝${obj.objects.addscore}个！！`)
              }
              else{
                magicJS.log(`家长帮签到失败，接口返回不合法，接口返回：${data}`);
                magicJS.notify('❌签到失败，接口返回不合法。');
              }
            }
            catch(err){
              magicJS.log(`家长帮签到失败，执行异常，异常信息：${err}`);
              magicJS.notify('❌签到失败，执行异常。');
            }
          }
          resolve();
        })
      }
      else{
        magicJS.log('家长帮签到失败，请先获取Cookie。');
        magicJS.notify('❓签到失败，请先获取Cookie。');
      }
    })
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