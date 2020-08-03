/**
 * [MITM]
 * hostname = biz.caiyunapp.com
 * 
 * [Script]
 * 彩云天气_SVIP = type=http-response,requires-body=1,max-size=0,pattern=https?:\/\/biz\.caiyunapp\.com\/(membership_rights|v2\/user),script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/caiyun/caiyun_svip.js
 * 
 */

const SCRIPT_NAME = '彩云天气';
const DEBUG = false;
const USER_REGEX = /https?:\/\/biz\.caiyunapp\.com\/v2\/user/;
const RIGHTS_REGEX = /https?:\/\/biz\.caiyunapp\.com\/membership_rights/;
const RESULT = {
  is_vip: true,
  vip_type: "s",
  svip_expired_at: 1882066669.9452950954,
}
const RESULT_WT = {
  vip: {
    enable: true,
    svip_expired_at: 1882066669.9452950954
  }
}
const RIGHTS = { 
  "result": [
    { 
      "name": "\u514d\u5e7f\u544a", 
      "enabled": true, 
      "vip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/vip-ads-free.png",
      "vip": true, 
      "svip": true, 
      "_id": "5ee5eb091d28d2634a2ee08f", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-ads-free.png" 
    }, 
    { 
      "name": "\u591a\u5730\u5929\u6c14\u63a8\u9001", 
      "enabled": true, 
      "vip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/vip-custom-push.png", 
      "vip": true, 
      "svip": true, 
      "_id": "5ee5eb091d28d2634a2ee090", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-custom-push.png" 
    }, 
    { 
      "name": "\u964d\u6c34\u63d0\u9192", 
      "enabled": true, 
      "vip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/vip-rain-notification.png", 
      "vip": true, 
      "svip": true, 
      "_id": "5ee5eb091d28d2634a2ee091", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-rain-notification.png" 
    }, 
    { 
      "name": "\u536b\u661f\u4e91\u56fe", 
      "enabled": true, 
      "vip_icon": null, 
      "vip": false, 
      "svip": true, 
      "_id": "5ee5eb091d28d2634a2ee092", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-satellite-clouds.png" 
    }, 
    { 
      "name": "\u4e91\u91cf", 
      "enabled": true, 
      "vip_icon": null, 
      "vip": false, 
      "svip": true,
      "_id": "5ee5eb091d28d2634a2ee093", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-cloud-cover.png"
    }, 
    { 
      "name": "\u6c14\u6e29\u9884\u62a5", 
      "enabled": true, 
      "vip_icon": null, 
      "vip": false, 
      "svip": true, 
      "_id": "5ee5eb091d28d2634a2ee094", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-tmp-forecast.png"
    }, 
    { 
      "name": "\u9732\u70b9\u6e29\u5ea6\u9884\u62a5", 
      "enabled": true, 
      "vip_icon": null, 
      "vip": false, 
      "svip": true, 
      "_id": "5ee5eb091d28d2634a2ee095", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-dew-point-tmp-forecast.png" 
    }, 
    { 
      "name": "\u77ed\u6ce2\u8f90\u5c04\u901a\u91cf", 
      "enabled": true, 
      "vip_icon": null, 
      "vip": false, 
      "svip": true, 
      "_id": "5ee5eb091d28d2634a2ee096", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-short-wave-radiation.png" 
    }, 
    { 
      "name": "\u6c14\u538b", 
      "enabled": true, 
      "vip_icon": null, 
      "vip": false, 
      "svip": true, 
      "_id": "5ee5eb091d28d2634a2ee097", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-pressure.png" 
    }, 
    { 
      "name": "\u80fd\u89c1\u5ea6", 
      "enabled": true, 
      "vip_icon": null, 
      "vip": false, 
      "svip": true, 
      "_id": "5ee5eb091d28d2634a2ee098", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-visibility.png" 
    }, 
    { 
      "name": "\u6e7f\u5ea6\u9884\u62a5", 
      "enabled": true, 
      "vip_icon": null, 
      "vip": false, 
      "svip": true, 
      "_id": "5ee5eb091d28d2634a2ee099", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-humidity-forecast.png" 
    }, 
    { 
      "name": "2\u5929\u964d\u96e8\u9884\u62a5\u56fe", 
      "enabled": true, 
      "vip_icon": null, 
      "vip": false, 
      "svip": true, 
      "_id": "5ee5eb091d28d2634a2ee09a", 
      "svip_icon": "https://cdn.caiyunapp.com/ad/img/membership_rights/svip-rain-forecast.png" 
    }
  ], 
  "rc": 0 
}

let magicJS = MagicJS(SCRIPT_NAME, DEBUG);

function Main(){
  if (magicJS.isResponse){
    if (USER_REGEX.test(magicJS.request.url)){
      try{
        let obj = JSON.parse(magicJS.response.body);
        Object.assign(obj['result'], RESULT)
        Object.assign(obj['result']['wt'], RESULT_WT)
        let body = JSON.stringify(obj);
        magicJS.done({body});
      }
      catch(err){
        magicJS.log(`解锁SVIP失败，异常信息${err}`);
        magicJS.done();
      }
    }
    if (RIGHTS_REGEX.test(magicJS.request.url)){
      let body = JSON.stringify(RIGHTS);
      magicJS.done({body});
    }
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
    
    get version() { return '202007292202' };
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