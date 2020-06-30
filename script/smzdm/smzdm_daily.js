/*
Surge Config

[Script]
[什么值得买]每日签到 = script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm_daily.js,script-update-interval=0,type=cron,cronexp=10 0 * * *
[什么值得买]获取cookie = debug=1,script-path=https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/script/smzdm_daily.js,script-update-interval=0,type=http-request,pattern=^https?:\/\/zhiyou\.smzdm\.com\/user$

[MITM]
hostname = zhiyou.smzdm.com
*/

// 每日签到
let checkin = (cookie, callback) => {
    let url = 'https://zhiyou.smzdm.com/user/checkin/jsonp_checkin?callback=jQuery112404020093264993104_' + new Date().getTime() + '&_=' + new Date().getTime();
    let body = {
        url : url,
        headers : {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-cn',
            'Connection': 'keep-alive',
            'Host': 'zhiyou.smzdm.com',
            'Referer': 'https://www.smzdm.com/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Safari/605.1.15',
            'Cookie': cookie
        }
    }
    $httpClient.get(body, callback);
}

// 获取当前登录用户信息
let get_current = (cookie, callback) => {
    let url = 'https://zhiyou.smzdm.com/user/info/jsonp_get_current?callback=jQuery112407333236740601499_' + new Date().getTime() + '&_=' + new Date().getTime();
    let result = {'result': 0, 'data': null};

    let body = {
        url : url,
        headers : {
            'Accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'DNT': '1',
            'Host': 'zhiyou.smzdm.com',
            'Referer': 'https://zhiyou.smzdm.com/user/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
            'Cookie': cookie
        }
    };

    $httpClient.get(body, callback);
}

// 获取网页版什么值得买cookie
// result 0 失败 1 成功 2 未登录
let get_cookie = (request) => {
    let result = {'result': 0, 'session_id': null, 'cookie': null};
    console.log('[什么值得买] 获取cookie：' + request.headers.Cookie);
    if (request.headers && request.headers.Cookie){
        match_str = request.headers.Cookie.match(/sess=[^\s]*;/);
        session_id = match_str != null ? match_str[0] : null;
        if (session_id){
            result = {'result': 1, 'session_id': session_id, 'cookie': request.headers.Cookie};
        }
        else{
            result = {'result': 2, 'session_id': null, 'cookie': null};
        }
    }
    return result;
}

// 获取cookie
let zhiyou_regex = /^http?s:\/\/zhiyou.smzdm.com\/user$/;

if (typeof $request != 'undefined' && $request && zhiyou_regex.test($request.url))
{
    let result = get_cookie($request);
    // 获取新的session_id
    if (result['result'] == 1){
        // 获取持久化的session_id
        old_session_id = $persistentStore.read('smzdm_session') != null ? $persistentStore.read('smzdm_session') : '';
        // 获取新的session_id
        new_session_id = result['session_id'];
        console.log({'old_session_id': old_session_id, 'new_session_id': new_session_id});    
        // 比较差异
        if (old_session_id == new_session_id){
            console.log('[什么值得买] 网页版cookie没有变化，无需更新。');
        }
        else{
            // 持久化cookie
            $persistentStore.write(new_session_id, 'smzdm_session');
            $persistentStore.write(result['cookie'], 'smzdm_cookie');
            console.log('[什么值得买] 写入cookie ' + result['cookie']);
            $notification.post('什么值得买', '', '🎈获取cookie成功！！');
        }
    }
    else if (result['result'] == 2){
        // $notification.post('什么值得买', '', '🎈等待登录账号。');
    }
    else{
        $notification.post('什么值得买', '', '❌获取cookie失败！！');
    }
}
// 每日签到
else if (typeof $request == 'undefined' || $request.url.length == 0){
    // 获取持久化的cookie
    var cookie = $persistentStore.read('smzdm_cookie')
    // 签到前的用户信息
    let before_checkin_cb = (before_err, before_resp, before_data) => {
        if (before_err) {
            console.log('[什么值得买] 获取用户信息出现异常 ' + before_err);
        }
        else {
            before_data = /jQuery.*\((.*)\)/.exec(before_data)[1];
            let before_obj = JSON.parse(before_data);
            console.log('[什么值得买] 获取用户签到前数据 ' + before_data);
            if ('smzdm_id' in before_obj && before_obj['smzdm_id'] != undefined && before_obj['smzdm_id'].length >0 ){
                let level = Number(before_obj['level']);
                let point = Number(before_obj['point']);
                let exp = Number(before_obj['exp']);
                let gold = Number(before_obj['gold']);
                let silver = Number(before_obj['silver']);
                console.log('[什么值得买] 获取用户信息 ' + JSON.stringify(before_obj));
                // 避免重复签到
                if (before_obj['checkin']['has_checkin'] == true){
                    console.log('[什么值得买] 发现重复签到，已取消本次签到。');
                    let content = '🥇等级' + before_obj['level'] + ' 💡积分' + before_obj['point'] + ' 🔰经验' + before_obj['exp'] + 
                                  '\n💰金币' + before_obj['gold'] +' ✨碎银子' + before_obj['silver'] + ' 📮未读消息' + before_obj['unread']['notice']['num'];
                    $notification.post('什么值得买', '🤣今天已经签到过，不要重复签到哦！！', content);
                }
                // 开始签到
                else{
                    let checkin_cb = (checkin_err, check_resp, checkin_data) => {
                        let checkin_result = 0;
                        if (checkin_err) {
                            console.log('什么值得买出现异常:' + checkin_err);
                            checkin_result = 0;
                            $notification.post('什么值得买', '', '❌签到出现异常，' + checkin_err + '。');
                        }
                        else{
                            // 正则处理签到返回数据
                            checkin_data = /jQuery.*\((.*)\)/.exec(checkin_data)[1];
                            let checkin_obj = JSON.parse(checkin_data);
                            if (checkin_obj['error_code'] == 0){
                                checkin_result = 1;

                                let after_checkin_cb = ((after_err, after_resp, after_data) => {
                                    after_data = /jQuery.*\((.*)\)/.exec(after_data)[1];
                                    let after_obj = JSON.parse(after_data);
                                    if (after_err) {
                                        console.log('获取用户信息出现异常:' + after_err);
                                        $notification.post('什么值得买', '🎉签到成功！!', '');
                                    }
                                    else {
                                        var subj = '🎉签到成功，📆已连续签到'+ after_obj['checkin']['daily_checkin_num'] + '天';
                                        var add_level = Number(after_obj['level']) - level;
                                        var add_point = Number(after_obj['point']) - point;
                                        var add_exp = Number(after_obj['exp']) - exp;
                                        var add_gold = Number(after_obj['gold']) - gold;
                                        var add_silver = Number(after_obj['silver']) - silver;
                                        var content = '🥇等级' + after_obj['level'] + (add_level > 0 ? '(+' + add_level + ')' : '') + 
                                                      ' 💡积分' + after_obj['point'] + (add_point > 0 ? '(+' + add_point + ')' : '') +  
                                                      ' 🔰经验' + after_obj['exp'] + (add_exp > 0 ? '(+' + add_exp + ')' : '') + 
                                                      '\n💰金币' + after_obj['gold'] + (add_gold > 0 ? '(+' + add_gold + ')' : '') +  
                                                      ' ✨碎银子' + after_obj['silver'] + (add_silver > 0 ? '(+' + add_silver + ')' : '') +
                                                      ' 📮未读消息' + after_obj['unread']['notice']['num'];
                                        $notification.post('什么值得买', subj, content);
                                    }
                                });
                                get_current(cookie, after_checkin_cb);
                            }
                            else {
                                checkin_result = 2;
                                $notification.post('什么值得买', '', '❌签到失败，请尝试更新cookie。');
                            }
                        }
                    }
                    checkin(cookie, checkin_cb);
                }
            }
            else{
                console.log('[什么值得买] 签到前获取用户信息失败，请更新cookie！');
                $notification.post('什么值得买', '', '❌获取用户信息失败，请更新cookie！！');
            }
        }
    }
    // 签到前获取用户信息，用于判断签到状态和数据比对
    get_current(cookie, before_checkin_cb);
}

$done();
