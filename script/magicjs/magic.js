const SET_VALUE_REGEX = /http:\/\/(www\.)?magic\.js\/value\/write/
const GET_VALUE_REGEX = /http:\/\/(www\.)?magic\.js\/value\/read/
const DEL_VALUE_REGEX = /http:\/\/(www\.)?magic\.js\/value\/del/

let body = {}
let magicJS = MagicJS();

if (magicJS.isRequest){
  if (SET_VALUE_REGEX.test(magicJS.request.url)){
    try{
      let key = magicJS.request.url.match(/key=([^&]*)/)[1]
      let val = magicJS.request.url.match(/val=([^&]*)/)[1]
      magicJS.write(key, val);
      if (magicJS.read(key) == val){
        magicJS.notify('变量写入成功');
        body = {'success': true, 'msg': '变量写入成功', 'key': key, 'val': val}
      }
      else{
        magicJS.notify('变量写入失败');
        body = {'success': false, 'msg': '变量写入失败', 'key': key, 'val': magicJS.read(key)}
      }
    }
    catch (err){
      magicJS.notify('变量写入失败');
      body = {'success': false, 'msg': '变量写入失败'};
    }
  }
  else if (GET_VALUE_REGEX.test(magicJS.request.url)){
    try{
      let key = magicJS.request.url.match(/key=([^&]*)/)[1]
      val = magicJS.read(key);
      magicJS.notify('读取变量成功');
      body = {'success': true, 'msg': '读取变量成功', 'key': key, 'val': val}
    }
    catch (err){
      magicJS.notify('读取变量失败');
      body = {'success': false, 'msg': '读取变量失败'};
    }
  }
  else if (DEL_VALUE_REGEX.test(magicJS.request.url)){
    try{
      let key = magicJS.request.url.match(/key=([^&]*)/)[1]
      val = magicJS.del(key);
      if (!!magicJS.read(key)){
        magicJS.notify('删除变量失败');
        body = {'success': true, 'msg': '删除变量失败', 'key': key}
      }
      else{
        magicJS.notify('删除变量成功');
        body = {'success': true, 'msg': '删除变量成功', 'key': key}
      }
    }
    catch (err){
      magicJS.notify('删除变量失败');
      body = {'success': false, 'msg': '删除变量失败'};
    }

  }
  else{
    magicJS.notify('请求格式错误');
    body = {'success': false, 'msg': '请求格式错误'};
  }
}
else if(magicJS.isResponse){

}
else{
  magicJS = MagicJS("MagicJS", "DEBUG");
  const testKey = 'magicjs_test';
  const testSessionKey = 'magicjs_session_test';
  let val1 = new Date().getTime() + ' val1';
  let val2 = new Date().getTime() + ' val2';
  let readVal = null;
  
  magicJS.log('-----------------无Session数据操作开始-----------------')
  
  // 读取错误的Key
  magicJS.logDebug('开始测试读取无Session且错误的Key。');
  readVal = magicJS.read('magicjs_error');
  if (readVal === null){
    magicJS.logDebug('✅测试读取无Session且错误的Key通过。');
  }
  else{
    magicJS.logError('❌测试读取无Session且错误的Key失败。');
  }
  // 写入无Session变量
  magicJS.write(testKey, val1);
  // 读取无Session变量
  readVal = magicJS.read(testKey);
  if (readVal == val1){
    magicJS.logDebug('✅无Session数据读写验证通过。');
  }
  else{
    magicJS.logError('❌无Session数据读写验证失败。');
  }
  // 清理无Session变量
  magicJS.del(testKey);
  readVal = magicJS.read(testKey);
  if (readVal === null){
    magicJS.logDebug('✅无Session数据删除成功。');
  }
  else{
    magicJS.logError('❌无Session数据删除失败。');
  }

  magicJS.log('-----------------无Session数据操作结束-----------------')

  magicJS.log('-----------------有Session数据操作开始-----------------')

  // 读取有Session且错误的Key
  magicJS.logDebug('开始测试读取有Session且错误的Key。');
  readVal = magicJS.read('magicjs_session_error', 'session1');
  if (readVal === null){
    magicJS.logDebug('✅测试读取有Session且错误的Key通过。');
  }
  else{
    magicJS.logError('❌测试读取有Session且错误的Key失败。');
  }
  // 写入有Session变量
  magicJS.write(testSessionKey, val1, 'session1');
  magicJS.write(testSessionKey, val2, 'session2');
  // 读取有Session变量
  readVal = magicJS.read(testSessionKey, 'session1');
  if (readVal == val1){
    magicJS.logDebug('✅有Session1数据读写验证通过。');
  }
  else{
    magicJS.logError('❌有Session1数据读写验证失败。');
  }
  readVal = magicJS.read(testSessionKey, 'session2');
  if (readVal == val2){
    magicJS.logDebug('✅有Session2数据读写验证通过。');
  }
  else{
    magicJS.logError('❌有Session2数据读写验证失败。');
  }
  // 清理有Session变量
  magicJS.del(testSessionKey, 'session1');
  readVal = magicJS.read(testSessionKey, 'session1');
  if (readVal === null){
    magicJS.logDebug('✅有Session数据删除成功。');
  }
  else{
    magicJS.logError('❌有Session数据删除失败。');
  }
  // 测试正确的Key，错误的Session
  readVal = magicJS.read(testSessionKey, 'session3');
  if (readVal === null){
    magicJS.logDebug('✅正确的Key，错误的Session，读取通过。');
  }
  else{
    magicJS.logError('❌正确的Key，错误的Session，读取失败。');
  }
  // 无session写入成功后，又改为有Session
  magicJS.write(testSessionKey, val2);
  magicJS.write(testSessionKey, val2, 'session2');
  readVal = magicJS.read(testSessionKey, 'session2');
  if (readVal == val2){
    magicJS.logDebug('✅无session写入成功后，又改为有Session，验证通过。')
  }
  else{
    magicJS.logError('❌无session写入成功后，又改为有Session，验证失败。')
  }
  magicJS.write(testSessionKey, val2);
  readVal = magicJS.read(testSessionKey);
  if (readVal == val2){
    magicJS.logDebug('✅有session写入成功后，又改为无Session，验证通过。')
  }
  else{
    magicJS.logError('❌有session写入成功后，又改为无Session，验证失败。')
  }
  // 无Seesion写入JSON字符串成功后，又改为有Session
  magicJS.write(testSessionKey, JSON.stringify({hello: 'world'}));
  magicJS.write(testSessionKey, {magicjs: true}, 'session2');
  readVal = magicJS.read(testSessionKey, 'session2');
  if (readVal.magicjs == true){
    magicJS.logDebug('✅无session写入成功后，又改为有Session，验证通过。')
  }
  else{
    magicJS.logError('❌无session写入成功后，又改为有Session，验证失败。')
  }
  magicJS.write(testSessionKey, {hello: 'world'});
  readVal = magicJS.read(testSessionKey);
  if (readVal.hello == 'world'){
    magicJS.logDebug('✅有session写入成功后，又改为无Session，验证通过。')
  }
  else{
    magicJS.logError('❌有session写入成功后，又改为无Session，验证失败。')
  }
  magicJS.log('-----------------有Session数据操作结束-----------------')
  magicJS.done();
}

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