/*
百度贴吧签到，增加重试机制，减少签到失败的情况。
脚本为串行执行，通过设定batchSize的值<int>，实现每批多少个贴吧并行签到一次。
*/
const scirptName = '百度贴吧';
const batchSize = 20; 
const retries = 5; // 签到失败重试次数
const interval = 2000; // 每次重试间隔
const tiebaCookieKey = 'tieba_cookie_key';
const tiebeGetCookieRegex = /https?:\/\/c\.tieba\.baidu\.com\/c\/s\/login/;
let magicJS = MagicJS(scirptName, "INFO");

let getTiebaListOptions = {
  url: 'https://tieba.baidu.com/mo/q/newmoindex',
  headers:{
    "Content-Type": "application/octet-stream",
    "Referer": "https://tieba.baidu.com/index/tbwise/forum",
    "Cookie": "",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/16A366"
  },
  body: ''
}

let tiebaCheckInOptions = {
  url: 'https://tieba.baidu.com/sign/add',
  headers: {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip,deflate,br",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    "Connection": "keep-alive",
    "Cookie": "",
    "Host": "tieba.baidu.com",
    "Referer": "https://tieba.baidu.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36 Edg/84.0.522.63"
  },
  body: ''
}

function GetTieBaList(cookie){
  return new Promise((resolve, reject) =>{
    getTiebaListOptions.headers.Cookie = cookie;
    magicJS.get(getTiebaListOptions, (err, resp, data) =>{
      if (err){
        magicJS.logError(`获取贴吧列表失败，请求异常：${err}`);
        reject(err);
      }
      else{
        try{
          let obj = JSON.parse(data);
          if (obj.error === 'success'){
            resolve([obj.data.tbs,obj.data.like_forum]);
          }
          else{
            magicJS.logWarning(`获取贴吧列表失败，接口响应不合法：${data}`);
            reject('获取贴吧列表失败');
          }
        }
        catch (err){
          magicJS.logError(`获取贴吧列表失败，执行异常：${err}`);
          reject(err);
        }
      }
    })
  })
}

function TiebaCheckIn(cookie, tbs, tieba){
  return new Promise((resolve, reject) =>{
    let kw = tieba['forum_name'];
    if (tieba['is_sign'] === 1){
      resolve(`[${kw}] 重复签到`);
    }
    else{
      tiebaCheckInOptions.headers.Cookie = cookie;
      tiebaCheckInOptions.body = `tbs=${tbs}&kw=${kw}&ie=utf-8`;
      magicJS.post(tiebaCheckInOptions, (err, resp, data)=>{
        if (err){
          magicJS.logError(`[${kw}] 签到失败，请求异常：${err}`);
          reject(err);
        }
        else{
          try{
            let obj = JSON.parse(data);
            if (obj.data.errmsg === 'success' && obj.data.errno === 0 && obj.data.uinfo.is_sign_in === 1){
              resolve(`[${kw}] 签到成功 排名 ${obj.data.uinfo.user_sign_rank} 积分 ${obj.data.uinfo.cont_sign_num}`)
            }
            else if (obj.no === 1011){
              magicJS.logWarning(`[${kw}] 未加入此吧或等级不够，接口响应：${data}`);
              reject(`[${kw}] 未加入此吧或等级不够`);
            }
            else if (obj.no === 1102){
              magicJS.logWarning(`[${kw}] 签到过快，接口响应：${data}`);
              reject(`[${kw}] 签到过快`);
            }
            else if (obj.no === 1101){
              magicJS.logWarning(`[${kw}] 重复签到，接口响应：${data}`);
              resolve(`[${kw}] 重复签到`);
            }
            else{
              magicJS.logWarning(`[${kw}] 签到失败，接口响应不合法：${data}`);
              reject(`[${kw}] 签到失败`);
            }
          }
          catch (err){
            magicJS.logError(`${kw} 签到失败，执行异常：${err}`);
            reject(`[${kw}] 执行异常`);
          }
        }
      })
    }
  })
}

async function Main(){
  if (magicJS.isRequest && tiebeGetCookieRegex.test(magicJS.request.url)){
    let cookie = magicJS.request.headers.Cookie;
    let hisCookie = magicJS.read(tiebaCookieKey);
    magicJS.logDebug(`当前贴吧Cookie：\n${cookie}\n历史贴吧Cookie：\n${hisCookie}`);
    if (!!cookie && cookie === hisCookie){
      magicJS.logInfo(`贴吧Cookie没有变化，无需更新。`);
    }
    else if (!!cookie && cookie !== hisCookie){
      magicJS.write(tiebaCookieKey, cookie);
      magicJS.notify(`🎈获取贴吧Cookie成功！！`)
    }
    else{
      magicJS.notify(`❌获取贴吧Cookie出现异常！！`)
    }
  }
  else{
    let cookie = magicJS.read(tiebaCookieKey);
    let content = '🥺很遗憾，以下贴吧签到失败：';
    if (!!cookie === false){
      content = '❓请先获取有效的贴吧Cookie！！';
    }
    else{
      let [tbs,tiebaList] = await magicJS.retry(GetTieBaList, retries, interval)(cookie);
      let tiebaCount = tiebaList.length;
      let cycleNumber = Math.ceil(tiebaList.length / batchSize);
      let [success,failed] = [0,0];
      for(let i=0; i<cycleNumber; i++){
        let batchTiebaPromise = [];
        let batchTiebaList = tiebaList.splice(0, batchSize);
        for (let tieba of batchTiebaList){
          batchTiebaPromise.push(magicJS.attempt(magicJS.retry(TiebaCheckIn, retries, interval)(cookie, tbs, tieba)));
        }
        await Promise.all(batchTiebaPromise).then((result) =>{
          result.forEach(element => {
            if (element[0] !== null){
              failed += 1;
              content += `\n${element[0]}`;
            }
            else{
              success += 1;
            }
          });
        })
      }
      magicJS.notify(scirptName, `签到${tiebaCount}个，成功${success}个，失败${failed}个`, !!failed>0? content : '🎉恭喜，所有贴吧签到成功！！');
    }
  }
  magicJS.done();
}

Main();

function MagicJS(scriptName='MagicJS', logLevel='INFO'){

  return new class{

    constructor(){
      this.version = '2.2.2'
      this.scriptName = scriptName;
      this.logLevels = {
        DEBUG: 5,
        INFO: 4,
        NOTIFY: 3,
        WARNING: 2,
        ERROR: 1,
        CRITICAL: 0,
        NONE: -1
      };
      this.isLoon = typeof $loon !== 'undefined';
      this.isQuanX = typeof $task !== 'undefined';
      this.isJSBox = typeof $drive !== 'undefined';
      this.isNode = typeof module !== 'undefined' && !this.isJSBox;
      this.isSurge = typeof $httpClient !== 'undefined' && !this.isLoon;
      this.node = {'request': undefined, 'fs': undefined, 'data': {}};
      this.iOSUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1';
      this.pcUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 Edg/84.0.522.59';
      this.logLevel = logLevel;
      if (this.isNode){
        this.node.fs = require('fs');
        this.node.request = require('request');
        try{
          this.node.fs.accessSync('./magic.json', this.node.fs.constants.R_OK | this.node.fs.constants.W_OK);
        }
        catch(err){
          this.node.fs.writeFileSync('./magic.json', '{}', {encoding: 'utf8'})
        }
        this.node.data = require('./magic.json');
      }
      else if (this.isJSBox){
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

    set logLevel(level) {this._logLevel = typeof level === 'string'? level.toUpperCase(): 'DEBUG'};
    get logLevel() {return this._logLevel};
    get isRequest() { return typeof $request !== 'undefined' && typeof $response === 'undefined'}
    get isResponse() { return typeof $response !== 'undefined' }
    get request() { return typeof $request !== 'undefined' ? $request : undefined }
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
    get platform(){
      if (this.isSurge) return "Surge"
      else if (this.isQuanX) return "Quantumult X"
      else if (this.isLoon) return "Loon"
      else if (this.isJSBox) return "JSBox"
      else if (this.isNode) return "Node.js"
      else return "unknown"
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
        this.logError(err);
        val = !!session? {} : null;
        this.del(key);
      }
      if (typeof val === 'undefined') val = null;
      try {if(!!val && typeof val === 'string') val = JSON.parse(val)} catch(err) {}
      this.logDebug(`READ DATA [${key}]${!!session? `[${session}]`: ''}(${typeof val})\n${JSON.stringify(val)}`);
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
        // 有Session，所有数据都是Object
        try {
          if (typeof data === 'string') data = JSON.parse(data)
          data = typeof data === 'object' && !!data ? data : {};
        }
        catch(err){
          this.logError(err);
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
      this.logDebug(`WRITE DATA [${key}]${!!session? `[${session}]`: ''}(${typeof val})\n${JSON.stringify(val)}`);
    };

    del(key, session=''){
      this.logDebug(`DELETE KEY [${key}]${!!session ? `[${session}]`:''}`);
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
      this.logNotify(`title:${title}\nsubTitle:${subTitle}\nbody:${body}\noptions:${typeof options === 'object'? JSON.stringify(options) : options}`);
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
        if (!!options) $notification.post(title, subTitle, body, options);
        else $notification.post(title, subTitle, body);
      }
      else if (this.isQuanX) {
         $notify(title, subTitle, body, options);
      }
      else if (this.isNode) {}
      else if (this.isJSBox){
        let push = {
          title: title,
          body: !!subTitle ? `${subTitle}\n${body}` : body,
        }
        $push.schedule(push);
      } 
    }
    
    log(msg, level="INFO"){
      if (!(this.logLevels[this._logLevel] < this.logLevels[level.toUpperCase()])) console.log(`[${level}] [${this.scriptName}]\n${msg}\n`);
    }

    logDebug(msg){
      this.log(msg, "DEBUG");
    }

    logInfo(msg){
      this.log(msg, "INFO");
    }

    logNotify(msg){
      this.log(msg, "NOTIFY");
    }

    logWarning(msg){
      this.log(msg, "WARNING");
    }

    logError(msg){
      this.log(msg, "ERROR");
    }

    /**
     * 对传入的Http Options根据不同环境进行适配
     * @param {*} options 
     */
    adapterHttpOptions(options, method){
      let _options = typeof options === 'object'? Object.assign({}, options): {'url': options, 'headers': {}};
      
      if (_options.hasOwnProperty('header') && !_options.hasOwnProperty('headers')){
        _options['headers'] = _options['header'];
        delete _options['header'];
      }

      // 规范化的headers
      const headersMap = {
        'accept': 'Accept',
        'accept-ch': 'Accept-CH',
        'accept-charset': 'Accept-Charset',
        'accept-features': 'Accept-Features',
        'accept-encoding': 'Accept-Encoding',
        'accept-language': 'Accept-Language',
        'accept-ranges': 'Accept-Ranges',
        'access-control-allow-credentials': 'Access-Control-Allow-Credentials',
        'access-control-allow-origin': 'Access-Control-Allow-Origin',
        'access-control-allow-methods': 'Access-Control-Allow-Methods',
        'access-control-allow-headers': 'Access-Control-Allow-Headers',
        'access-control-max-age': 'Access-Control-Max-Age',
        'access-control-expose-headers': 'Access-Control-Expose-Headers',
        'access-control-request-method': 'Access-Control-Request-Method',
        'access-control-request-headers': 'Access-Control-Request-Headers',
        'age': 'Age',
        'allow': 'Allow',
        'alternates': 'Alternates',
        'authorization': 'Authorization',
        'cache-control': 'Cache-Control',
        'connection': 'Connection',
        'content-encoding': 'Content-Encoding',
        'content-language': 'Content-Language',
        'content-length': 'Content-Length',
        'content-location': 'Content-Location',
        'content-md5': 'Content-MD5',
        'content-range': 'Content-Range',
        'content-security-policy': 'Content-Security-Policy',
        'content-type': 'Content-Type',
        'cookie': 'Cookie',
        'dnt': 'DNT',
        'date': 'Date',
        'etag': 'ETag',
        'expect': 'Expect',
        'expires': 'Expires',
        'from': 'From',
        'host': 'Host',
        'if-match': 'If-Match',
        'if-modified-since': 'If-Modified-Since',
        'if-none-match': 'If-None-Match',
        'if-range': 'If-Range',
        'if-unmodified-since': 'If-Unmodified-Since',
        'last-event-id': 'Last-Event-ID',
        'last-modified': 'Last-Modified',
        'link': 'Link',
        'location': 'Location',
        'max-forwards': 'Max-Forwards',
        'negotiate': 'Negotiate',
        'origin': 'Origin',
        'pragma': 'Pragma',
        'proxy-authenticate': 'Proxy-Authenticate',
        'proxy-authorization': 'Proxy-Authorization',
        'range': 'Range',
        'referer': 'Referer',
        'retry-after': 'Retry-After',
        'sec-websocket-extensions': 'Sec-Websocket-Extensions',
        'sec-websocket-key': 'Sec-Websocket-Key',
        'sec-websocket-origin': 'Sec-Websocket-Origin',
        'sec-websocket-protocol': 'Sec-Websocket-Protocol',
        'sec-websocket-version': 'Sec-Websocket-Version',
        'server': 'Server',
        'set-cookie': 'Set-Cookie',
        'set-cookie2': 'Set-Cookie2',
        'strict-transport-security': 'Strict-Transport-Security',
        'tcn': 'TCN',
        'te': 'TE',
        'trailer': 'Trailer',
        'transfer-encoding': 'Transfer-Encoding',
        'upgrade': 'Upgrade',
        'user-agent': 'User-Agent',
        'variant-vary': 'Variant-Vary',
        'vary': 'Vary',
        'via': 'Via',
        'warning': 'Warning',
        'www-authenticate': 'WWW-Authenticate',
        'x-content-duration': 'X-Content-Duration',
        'x-content-security-policy': 'X-Content-Security-Policy',
        'x-dnsprefetch-control': 'X-DNSPrefetch-Control',
        'x-frame-options': 'X-Frame-Options',
        'x-requested-with': 'X-Requested-With',
        'x-surge-skip-scripting':'X-Surge-Skip-Scripting'
      }
      if (typeof _options.headers === 'object'){
        for (let key in _options.headers){
          if (headersMap[key]) {
            _options.headers[headersMap[key]] = _options.headers[key];
            delete _options.headers[key];
          }
        }
      }

      // 自动补完User-Agent，减少请求特征
      if (!!!_options.headers || typeof _options.headers !== 'object' || !!!_options.headers['User-Agent']){
        if (!!!_options.headers || typeof _options.headers !== 'object') _options.headers = {};
        if (this.isNode) _options.headers['User-Agent'] = this.pcUserAgent;
        else  _options.headers['User-Agent'] = this.iOSUserAgent
      }

      // 判断是否跳过脚本处理
      let skipScripting = false;
      if ((typeof _options['opts'] === 'object' && (_options['opts']['hints'] === true || _options['opts']['Skip-Scripting'] === true)) || 
          (typeof _options['headers'] === 'object' && _options['headers']['X-Surge-Skip-Scripting'] === true)){
        skipScripting = true;
      }
      if (!skipScripting){
        if (this.isSurge) _options.headers['X-Surge-Skip-Scripting'] = false;
        // 目前对Loon的处理暂时无用，会被强制覆盖掉，等待作者更新
        else if (this.isLoon) _options.headers['X-Requested-With'] = 'XMLHttpRequest'; 
        else if (this.isQuanX){
          if (typeof _options['opts'] !== 'object') _options.opts = {};
          _options.opts['hints'] = false;
        }
      }

      // 对请求数据做清理
      if (!this.isSurge || skipScripting) delete _options.headers['X-Surge-Skip-Scripting'];
      if (!this.isQuanX && _options.hasOwnProperty('opts')) delete _options['opts'];
      if (this.isQuanX && _options.hasOwnProperty('opts')) delete _options['opts']['Skip-Scripting'];
      
      // GET请求将body转换成QueryString(beta)
      if (method === 'GET' && !this.isNode && !!_options.body){
        let qs = Object.keys(_options.body).map(key=>{
          if (typeof _options.body === 'undefined') return ''
          return `${encodeURIComponent(key)}=${encodeURIComponent(_options.body[key])}`
        }).join('&');
        if (_options.url.indexOf('?') < 0) _options.url += '?'
        if (_options.url.lastIndexOf('&')+1 != _options.url.length && _options.url.lastIndexOf('?')+1 != _options.url.length) _options.url += '&'
        _options.url += qs;
        delete _options.body;
      }

      // 适配多环境
      if (this.isQuanX){
        if (_options.hasOwnProperty('body') && typeof _options['body'] !== 'string') _options['body'] = JSON.stringify(_options['body']);
        _options['method'] = method;
      }
      else if (this.isNode){
        delete _options.headers['Accept-Encoding'];
        if (typeof _options.body === 'object'){
          if (method === 'GET'){
            _options.qs = _options.body;
            delete _options.body
          }
          else if (method === 'POST'){
            _options['json'] = true;
            _options.body = _options.body;
          }
        }
      }
      else if (this.isJSBox){
        _options['header'] = _options['headers'];
        delete _options['headers']
      }

      return _options;
    }
    
    /**
     * Http客户端发起GET请求
     * @param {*} options 
     * @param {*} callback 
     * options可配置参数headers和opts，用于判断由脚本发起的http请求是否跳过脚本处理。
     * 支持Surge和Quantumult X两种配置方式。
     * 以下几种配置会跳过脚本处理，options没有opts或opts的值不匹配，则不跳过脚本处理
     * {opts:{"hints": true}}
     * {opts:{"Skip-Scripting": true}}
     * {headers: {"X-Surge-Skip-Scripting": true}}
     */
    get(options, callback){
      let _options = this.adapterHttpOptions(options, 'GET');
      this.logDebug(`HTTP GET: ${JSON.stringify(_options)}`);
      if (this.isSurge || this.isLoon) {
        $httpClient.get(_options, callback);
      }
      else if (this.isQuanX) {
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
        _options['handler'] = (resp)=>{
          let err = resp.error? JSON.stringify(resp.error) : undefined;
          let data = typeof resp.data === 'object' ? JSON.stringify(resp.data) : resp.data;
          callback(err, resp.response, data);
        }
        $http.get(_options);
      }
    }

    /**
     * Http客户端发起POST请求
     * @param {*} options 
     * @param {*} callback 
     * options可配置参数headers和opts，用于判断由脚本发起的http请求是否跳过脚本处理。
     * 支持Surge和Quantumult X两种配置方式。
     * 以下几种配置会跳过脚本处理，options没有opts或opts的值不匹配，则不跳过脚本处理
     * {opts:{"hints": true}}
     * {opts:{"Skip-Scripting": true}}
     * {headers: {"X-Surge-Skip-Scripting": true}}
     */
    post(options, callback){
      let _options = this.adapterHttpOptions(options, 'POST');
      this.logDebug(`HTTP POST: ${JSON.stringify(_options)}`);
      if (this.isSurge || this.isLoon) {
        $httpClient.post(_options, callback);
      }
      else if (this.isQuanX) {
        $task.fetch(_options).then(
          resp => {
            resp['status'] = resp.statusCode
            callback(null, resp, resp.body)
          },
          reason => {callback(reason.error, null, null)}
        )
      }
      else if(this.isNode){
        return this.node.request.post(_options, callback);
      }
      else if(this.isJSBox){
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
     * 示例：let [err,val] = await magicJS.attempt(func(), 'defaultvalue');
     * 或者：let [err, [val1,val2]] = await magicJS.attempt(func(), ['defaultvalue1', 'defaultvalue2']);
     * @param {*} promise Promise 对象
     * @param {*} defaultValue 出现异常时返回的默认值
     * @returns 返回两个值，第一个值为异常，第二个值为执行结果
     */
    attempt(promise, defaultValue=null){ return promise.then((args)=>{return [null, args]}).catch(ex=>{this.logError(ex); return [ex, defaultValue]})};

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
                    this.logError(ex);
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
              this.logError(ex);
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
