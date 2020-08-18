const blocked_users_key = 'zhihu_blocked_users';
const topstory_recommend_regex = /^https:\/\/api\.zhihu\.com\/topstory\/recommend\?/;
const moments_recommend_regex = /^https:\/\/api.zhihu.com\/moments\/recommend/;
const mcn_userinfo = /^https:\/\/api.zhihu.com\/people\//;
const question_regex = /^https:\/\/api.zhihu.com\/v4\/questions/;
const sysmsg_timeline_regex = /^https:\/\/api.zhihu.com\/notifications\/v3\/timeline\/entry\/system_message/;
const sysmsg_notifications_regex = /^https:\/\/api.zhihu.com\/notifications\/v3\/message\?/;
const blocked_users_regex = /^https:\/\/api.zhihu.com\/settings\/blocked_users/;
let scriptName = '知乎增强';
let magicJS = MagicJS(scriptName, "DEBUG");
let answer_blocked_users = {'盐选推荐': 'default', '盐选科普': 'default', '会员推荐': 'default', '故事档案局': 'default'};
let sysmsg_blacklist = ['知乎小伙伴', '知乎视频', '知乎亲子', '知乎团队', '知乎好物推荐', '知乎盐选会员', '知乎礼券', '知乎校园'];


async function main(){
  let custom_blocked_users = {};
  try{
    custom_blocked_users = magicJS.read(blocked_users_key, 'default');
    // 对旧的黑名单数据进行清理
    if (!!custom_blocked_users && custom_blocked_users instanceof Array){
      magicJS.del(blocked_users_key);
      magicJS.logInfo(`因数据格式变化，当前脚本黑名单已清空，请重新获取。脚本黑名单清空前数据：${JSON.stringify(custom_blocked_users)}`);
      magicJS.notify("因数据格式变化，当前脚本黑名单已清空。\n请访问知乎App中的黑名单列表重新获取。");
    }
    custom_blocked_users = !!custom_blocked_users ? custom_blocked_users : answer_blocked_users;
    magicJS.logDebug(`获取脚本黑名单列表成功，当前黑名单：${JSON.stringify(custom_blocked_users)}。`)
  }
  catch (err){
    magicJS.del(blocked_users_key);
    magicJS.logError(`获取脚本黑名单出现异常，已重置脚本黑名单，异常信息：${err}`);
    magicJS.notify("获取脚本黑名单出现异常，已清空脚本黑名单。\n请访问知乎App中的黑名单列表重新获取。")
  }

  // 知乎去广告及黑名单增强
  if (magicJS.isResponse){
    let body = magicJS.response ? magicJS.response.body: {};
    try{
      if (body.length > 0){
        body=JSON.parse(body);
      }
    }
    catch (err){
      magicJS.logError(`解析body出现异常：${body}`);
      body = {};
    }
    // 知乎推荐去广告与黑名单增强
    if (topstory_recommend_regex.test(magicJS.request.url)){
      temp_blocked_users = Object.keys(custom_blocked_users);
      magicJS.logDebug(`当前黑名单列表: ${JSON.stringify(temp_blocked_users)}`);
      let data = body['data'].filter((element) =>{
        try{
          if(element['card_type'] != 'slot_event_card' && element.hasOwnProperty('ad') == false && element.hasOwnProperty('common_card') && 
          temp_blocked_users.indexOf(element['common_card']['feed_content']['source_line']['elements'][1]['text']['panel_text']) < 0){      
            return true;
          }
        }
        catch (err){
          magicJS.logError('知乎推荐去广告出现异常：' + err);
          return true;
        }
      });
      body['data'] = data;
    }
    // 知乎关注去广告
    else if (moments_recommend_regex.test(magicJS.request.url)){
      let data = body['data'].filter((element) =>{
        try{
          if(element.hasOwnProperty('ad') == false){      
            return true;
          }
        }
        catch (err){
          magicJS.logError('知乎关注去广告出现异常：' + err);
          return true;
        }
      });
      body['data'] = data;
    }
    else if (mcn_userinfo.test(magicJS.request.url)){
      delete body['mcn_user_info']
    }
    // 知乎回答列表去广告及黑名单增强，在回答列表里不会出现黑名单的答主
    else if (question_regex.test(magicJS.request.url)){
      temp_blocked_users = Object.keys(custom_blocked_users);
      magicJS.logDebug(`当前黑名单列表: ${JSON.stringify(temp_blocked_users)}`);
      delete body['ad_info'];
      let data = body['data'].filter((element) =>{
        if (temp_blocked_users.indexOf(element['author']['name']) < 0){
          return true;
        }
      })
      body['data'] = data;
    }
    // 拦截官方账号推广消息
    else if (sysmsg_timeline_regex.test(magicJS.request.url) && body.hasOwnProperty('data')){
      let data = body['data'].filter((element) =>{
        if (sysmsg_blacklist.indexOf(element['content']['title']) < 0){
          return true;
        }
      })
      body['data'] = data;
    } 
    // 屏蔽一些官方的营销消息
    else if (sysmsg_notifications_regex.test(magicJS.request.url)){
      body['data'].forEach((element, index)=> {
        if(element['detail_title']=='官方帐号消息'){
          let unread_count = body['data'][index]['unread_count'];
          if (unread_count > 0){
            body['data'][index]['content']['text'] = '未读消息' + unread_count + '条';
          }
          else{
            body['data'][index]['content']['text'] = '全部消息已读';
          }
          body['data'][index]['is_read'] = true;
          body['data'][index]['unread_count'] = 0;
        }
      })
    }
    // 黑名单管理
    else if (blocked_users_regex.test(magicJS.request.url)){
      // 获取黑名单
      if (magicJS.request.method == 'GET'){
        try{
          let obj = JSON.parse(magicJS.response.body);
          if (!!obj['data']){
            obj['data'].forEach(element => {
              if (element['name'] != '[已重置]' && !custom_blocked_users.hasOwnProperty(element['name'])){
                custom_blocked_users[element['name']] = element['id'];
              }
            });
            magicJS.write(blocked_users_key, custom_blocked_users, 'default');
            if (obj['paging']['is_end'] == true){
              magicJS.notify(`获取脚本黑名单结束，当前黑名单共${Object.keys(custom_blocked_users).length}人！`);
              magicJS.logDebug(`脚本黑名单内容：${JSON.stringify(custom_blocked_users)}。`);
            }
          }
          else{
            magicJS.logWarning(`获取黑名单失败，接口响应不合法：${magicJS.response.body}`);
          }
        }
        catch(err){
          magicJS.del(blocked_users_key);
          magicJS.logError(`获取黑名单失败，异常信息：${err}`);
          magicJS.notify('获取黑名单失败，执行异常，已清空黑名单。');
        }
      }
      // 写入黑名单
      else if (magicJS.request.method == 'POST'){
        try{
          let obj = JSON.parse(magicJS.response.body);
          if (obj.hasOwnProperty('name') && obj.hasOwnProperty('id')){
            custom_blocked_users[obj['name']] = obj['id'];
            magicJS.write(blocked_users_key, custom_blocked_users, 'default');
            magicJS.logInfo(`${obj['name']}写入脚本黑名单成功，当前脚本黑名单数据：${JSON.stringify(custom_blocked_users)}`);
            magicJS.notify(`已将用户 ${obj['name']} 写入脚本黑名单。`);
          }
          else{
            magicJS.logWarning(`写入黑名单失败，接口响应不合法：${magicJS.response.body}`);
            magicJS.notify('写入脚本黑名单失败，接口返回不合法。');
          }
        }
        catch (err){
          magicJS.logError(`写入黑名单失败，异常信息：${err}`);
          magicJS.notify('写入脚本黑名单失败，执行异常，请查阅日志。');
        }
      }
      // 移出黑名单
      else if (magicJS.request.method == 'DELETE'){
        try{
          let obj = JSON.parse(magicJS.response.body);
          if (obj.success){
            let user_id = magicJS.request.url.match(/https?:\/\/api\.zhihu\.com\/settings\/blocked_users\/([0-9a-zA-Z]*)/)[1];
            for (let username in custom_blocked_users){
              if (custom_blocked_users[username] == user_id){
                delete custom_blocked_users[username];
                magicJS.write(blocked_users_key, custom_blocked_users, 'default')
                magicJS.logInfo(`${obj['name']}移出脚本黑名单成功，当前脚本黑名单数据：${JSON.stringify(custom_blocked_users)}`);
                magicJS.notify(`已将用户 ${username} 移出脚本黑名单！`);
                break;
              }
            }
          }
          else{
            magicJS.logWarning(`移出黑名单失败，接口响应不合法：${magicJS.response.body}`);
            magicJS.notify('移出脚本黑名单失败，接口返回不合法。');
          }
        }
        catch (err){
          magicJS.logError(`移出黑名单失败，异常信息：${err}`);
          magicJS.notify('移出脚本黑名单失败，执行异常，请查阅日志。');
        }
      }
    }
    body=JSON.stringify(body);
    magicJS.done({body});
  }
}

main();

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
    
    get version() { return 'v2.1.4' };
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
          data = typeof data === 'object' && !!data ? data : {};
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
        // 2020.08.11 Loon2.1.3(194)TF 如果不加这个log，在跑测试用例连续6次通知，会漏掉一些通知，已反馈给作者。
        this.logInfo(`title: ${title}, subTitle：${subTitle}, body：${body}, options：${options}`);
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

    formatTime(time, fmt="yyyy-MM-dd hh:mm:ss") {
      var o = {
        "M+": time.getMonth() + 1,
        "d+": time.getDate(),
        "h+": time.getHours(),
        "m+": time.getMinutes(),
        "s+": time.getSeconds(),
        "q+": Math.floor((time.getMonth() + 3) / 3),
        "S": time.getMilliseconds()
      };
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
      for (let k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      return fmt;
    };

    now(){
      return this.formatTime(new Date(), "yyyy-MM-dd hh:mm:ss");
    }

    sleep(time) {
      return new Promise(resolve => setTimeout(resolve, time));
    }
    
  }(scriptName);
}