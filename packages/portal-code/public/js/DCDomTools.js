//-- 都昌软件的处理HTML DOM结构的工具类
// 袁永福到此一游


// 注意：每次修改文件上传时都得写上时间 
 

var DCDomTools = new Object();

// 获得全局客户端编号
DCDomTools.getGlobalClientID = function () {
    var wtop = window.top;
    var id = wtop.DCClientID20200617;
    if (typeof (id) == "undefined") {
        id = new Date().valueOf().toString();
        wtop.DCClientID20200617 = id;
    }
    return id;
};

// 对文档节点进行排序，如果修改了文档结构返回true,否则返回false。
DCDomTools.sortChildNodes = function (rootNode, sortFunction) {
    if (rootNode == null) {
        return;
    }
    var list = new Array();
    var nodes = rootNode.childNodes;
    for (var iCount = 0; iCount < nodes.length; iCount++) {
        list.push(nodes[iCount]);

    }
    list.sort(sortFunction);
    var changed = false;
    for (var iCount = 0; iCount < list.length; iCount++) {
        if (list[iCount] != nodes[iCount]) {
            changed = true;
            break;
        }
    }
    if (changed == true) {
        while (rootNode.firstChild != null) {
            rootNode.removeChild(rootNode.firstChild);
        }
        for (var iCount = 0; iCount < list.length; iCount++) {
            rootNode.appendChild(list[iCount]);
        }
        return true;
    }
    else {
        return false;
    }
};

// 判断一个字符串是否以另外一个字符串打头。
DCDomTools.StartsWith = function(bigStr, smallStr)
{
    if (smallStr == null || smallStr.length == 0) {
        return true;
    }
    if (bigStr != null && smallStr != null && bigStr.length >= smallStr.length) {
        var str2 = bigStr.substr(0, smallStr.length);
        if (str2 == smallStr) {
            return true;
        }
    }
    return false;
};

DCDomTools.getSelectionRange = function () {
    var sel = DCDomTools.getSelection();
    if (sel != null
        && sel.getRangeAt
        && sel.rangeCount >= 1 
        && document.body.getAttribute("ismobiledevice") !== "true") {
        var rng = sel.getRangeAt(0);
        return rng;
    }
    return null;
};

//伍贻超20190717：前端对字符串进行HTML解码，要求传入的字符串必须是HTML编码后
DCDomTools.HTMLDecode = function (str) {
    //var div = document.createElement("div");
    //div.innerHTML = str;
    //return div.innerText;

    var HTML_DECODE = {
        "&lt;": "<",
        "&gt;": ">",
        "&amp;": "&",
        "&nbsp;": " ",
        "&quot;": "\"",
        "&copy;": ""
    };
    var REGX_HTML_ENCODE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;
    var REGX_HTML_DECODE = /&\w+;|&#(\d+);/g;
    var REGX_TRIM = /(^\s*)|(\s*$)/g;
    str = (str != undefined) ? str : "";
    return (typeof str != "string") ? str :
        str.replace(REGX_HTML_DECODE,
            function ($0, $1) {
                var c = HTML_DECODE[$0];
                if (c == undefined) {
                    if (!isNaN($1)) {
                        c = String.fromCharCode(($1 == 160) ? 32 : $1);
                    } else {
                        c = $0;
                    }
                }
                return c;
            });
};

//伍贻超20190717：前端对字符串进行HTML编码，要求传入的字符串必须是HTML明码
DCDomTools.HTMLEncode = function (str) {
    //var div = document.createElement("div");
    //div.innerText = str;
    //return div.innerHTML;

    return !str ? str : String(str).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
};


// 获得被选中的所有文档节点
//@param splitText 是否根据需要拆分文本节点。
DCDomTools.GetSelectionNodes = function (splitText) {
    var resultNodes = new Array();
    var sel = DCDomTools.getSelection();
    if (sel == null) {
        return txtNodes;
    }
    if (sel.getRangeAt) {
        for (var iCount = 0; iCount < sel.rangeCount; iCount++) {
            var rng = sel.getRangeAt(iCount);

            var endNode = rng.endContainer;
            //优化标签删除 2019-10-17 hulijun
            if (endNode && endNode.hasChildNodes()) {
                endNode = endNode.lastChild;
            }
            if (splitText != false) {
                if (endNode.nodeType == 3 && endNode.length > rng.endOffset && rng.endOffset > 0) {
                    // 拆分结尾文本节点
                    var node2 = endNode.splitText(rng.endOffset);
                }
            }

            var startNode = rng.startContainer;
            if (splitText != false ) {
                if (startNode.nodeType == 3 && startNode.length > rng.startOffset && rng.startOffset > 0) {
                    // 拆分起始文本节点
                    var node2 = startNode.splitText(rng.startOffset);
                    if (startNode == endNode) {
                        endNode = node2;
                    }
                    startNode = node2;
                }
            }
            var totalParent = rng.commonAncestorContainer;
            if (totalParent == null) {
                var p1 = startNode.parentNode;
                while (p1 != null) {
                    var p2 = endNode.parentNode;
                    while (p2 != null) {
                        if (p1 == p2) {
                            totalParent = p1;
                            break;
                        }
                        p2 = p2.parentNode;
                    }
                    p1 = p1.parentNode;
                }
                if (totalParent != null) {
                    break;
                }
            }
            if (startNode == endNode) {
                if (startNode.nodeType == 3) {
                    resultNodes.push(startNode);
                }
                else {
                    function GetNodes(rootNode) {
                        var len = rootNode.childNodes.length;
                        for (var iCount = 0; iCount < len; iCount++) {
                            var subNode = rootNode.childNodes[iCount];
                            resultNodes.push(subNode);
                            if (subNode.nodeType == 3) {
                                GetNodes(subNode);
                            }
                        }
                    }
                    GetNodes(startNode);
                }
            }
            else {
                var node = startNode;
                while (true) {
                    resultNodes.push(node);
                    // 获得DOM树中的下一个节点
                    var nextNode = null;
                    if (node.nodeType == 1) {
                        // 元素节点。
                        if (node.firstChild) {
                            nextNode = node.firstChild;
                        }
                        else {
                            nextNode = node.nextSibling;
                        }
                    }
                    else {
                        // 非元素节点
                        nextNode = node.nextSibling;
                    }
                    if (nextNode == null) {
                        nextNode = node;
                        while (nextNode != null) {
                            if (nextNode.nextSibling == null) {
                                nextNode = nextNode.parentNode;
                            }
                            else {
                                nextNode = nextNode.nextSibling;
                                break;
                            }
                        }//while
                    }
                    if (nextNode == endNode) {
                        resultNodes.push(nextNode);
                        // 遇到结尾节点则完成工作，退出循环。
                        break;
                    }
                    if (nextNode == null || nextNode == totalParent) {
                        // 下一个节点为空则退出循环。
                        break;
                    }
                    node = nextNode;
                }//while
            }
        }
    }
    return resultNodes;
};

DCDomTools.getSessionID = function () {
    var sid = null;
    var cookies = document.cookie;
    if (cookies != null
        && cookies.length > 0
        && (cookies.indexOf("SessionId") >= 0
            || cookies.indexOf("SessionID") >= 0
            || cookies.indexOf("sessionid") >= 0)) {

    }
    else {
        sid = DCDomTools.GetDCSessionID20201022();// window.top.dc_sessionid20201022;
        if (sid == null || sid.length == 0) {
            if (__error_window_localStorage == false) {
                try {
                    if (window.localStorage) {
                        sid = window.localStorage["dc_sessionid20201022"];
                        if (sid == null || sid.length == 0) {
                            sid = "sid" + new Date().valueOf();
                            window.localStorage["dc_sessionid20201022"] = sid;
                        }
                    }
                }
                catch (e) {
                    __error_window_localStorage = true;
                }
            }
            if (sid == null || sid.length == 0) {
                sid = "sid" + new Date().valueOf();
            }
            DCDomTools.SetDCSessionID20201022(sid);//window.top.dc_sessionid20201022 = sid;
        }
    }
    return sid;
};
DCDomTools.fixAjaxSettings = function(settings , myWriterControl )
{
    if (DCDomTools.getIEVersion() >= 10 || DCDomTools.getIEVersion() == -1 ) {
        settings.xhrFields = { withCredentials: true };
        settings.crossDomain = true;
    }
    else {
        jQuery.support.cors = true;
    }
    if (myWriterControl == null) {
        myWriterControl = document.WriterControl;
    }
    //wyc20201203:添加全局的同步异步设置
    if (settings.async == null || settings.async == undefined) {
        if (document.WriterControl &&
            document.WriterControl.Options &&
            document.WriterControl.Options.AJAXAsync == false) {
            settings.async = false;
        }
    }
    //wyc20200820：添加自定义的AJAX请求头
    if (myWriterControl != null
        && myWriterControl.Options != null
        && myWriterControl.Options.AttachedAJAXHeader != null) {
        var _AttachedAJAXHeader = myWriterControl.Options.AttachedAJAXHeader
        var typestr = typeof (_AttachedAJAXHeader);
        if (typestr == "object") {
            settings.headers = _AttachedAJAXHeader;
        } else if (typestr == "string" && _AttachedAJAXHeader.slice(0, 1) == "{") {
            var ajaxheader = JSON.parse(_AttachedAJAXHeader);
            if (ajaxheader != null) {
                settings.headers = ajaxheader;
            }
        }
    }
    // yyf 20200831: 添加dc_sessionid的请求头

    var sid = DCDomTools.getSessionID();

    if (sid != null && sid.length > 0) {
        function analyseUrl(url) {
            if (url == null || url.length == 0) {
                return null;
            }
            var regex = /^(?:([a-z]*):)?(?:\/\/)?(?:([^:@]*)(?::([^@]*))?@)?([0-9a-z-._]+)?(?::([0-9]*))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/i;
            //               1 - scheme              2 - user    3 = pass    4 - host           5 - port  6 - path        7 - query    8 - hash
             
            var md = url.match(regex) || [];

            var r = {
                "url": url,
                "scheme": md[1],
                "user": md[2],
                "pass": md[3],
                "host": md[4],
                "port": md[5] && +md[5],
                "path": md[6],
                "query": md[7],
                "hash": md[8]
            };
              
            return r;
        }
        settings.beforeSend = function (xhr, mySettings) {
            var loc = analyseUrl(document.location.href);
            var useHeader = false;
            if (loc != null) {
                if (loc.scheme == "file" || loc.scheme == null || loc.length == 0) {
                    // 从本地文件触发的
                    useHeader = false;
                }
                else {
                    var targetUrl = analyseUrl(mySettings.url);
                    if (targetUrl != null) {
                        if (targetUrl.scheme == null || targetUrl.scheme.length == 0) {
                            // 目标路径没有模式，应该是相对路径，则不是跨域
                            useHeader = true;
                        }
                        else {
                            if (loc.host == targetUrl.host && loc.port == targetUrl.port) {
                                // 没有跨域
                                useHeader = true;
                            }
                            else {
                                // 跨域了
                                useHeader = false;
                            }
                        }
                    }
                }
            }
            if (useHeader == true )
            {
                xhr.setRequestHeader("dc_sessionid", sid);
                xhr.setRequestHeader("Sec-Fetch-Site", "same-origin");
            }
            else {
                mySettings.url = DCDomTools.appendSessionIDToUrl(mySettings.url);
            }
        }
    }
    return settings;
};

var __error_window_localStorage = false;

DCDomTools.appendSessionIDToUrl = function (url) {
    if (url != null && url.length > 0) {
        var sid = DCDomTools.getSessionID();
        if (sid != null && sid.length > 0) {
            var index = url.indexOf("?");
            if (index > 0) {
                url = url + "&dc_sessionid=" + sid;
            }
            else {
                url = url + "?dc_sessionid=" + sid;
            }
        }
    }
    return url;
};

//@method 获得IE浏览器的版本号，如果不是IE浏览器则返回-1. 
DCDomTools.getIEVersion = function () {
    if (DCDomTools.__ieversion == null) {
        DCDomTools.__ieversion = -1;
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
        var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器  
        var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器  
        var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
        if (isIE) {
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
            reIE.test(userAgent);
            var fIEVersion = parseFloat(RegExp["$1"]);
            if (fIEVersion == 7) {
                DCDomTools.__ieversion = 7;
            }
            else if (fIEVersion == 8) {
                DCDomTools.__ieversion = 8;
            }
            else if (fIEVersion == 9) {
                DCDomTools.__ieversion = 9;
            }
            else if (fIEVersion == 10) {
                DCDomTools.__ieversion = 10;
            }
            else {
                DCDomTools.__ieversion = 6;//IE版本<=7
            }
        }
        else if (isEdge) {
            // MS Eege浏览器不认为是IE浏览器。
            DCDomTools.__ieversion = -1; 
            //DCDomTools.__ieversion = 'edge';//edge
        }
        else if (isIE11) {
            DCDomTools.__ieversion = 11; //IE11  
        }
        else {
            DCDomTools.__ieversion = -1;//不是ie浏览器
        }
    }
    return DCDomTools.__ieversion;
};

//@method 判断是否为IE7或者更低版本
DCDomTools.IsIE7 = function () {
    if (DCDomTools.__isie7 == null) {
        DCDomTools.__isie7 = false;
        if (navigator && navigator.appName == "Microsoft Internet Explorer") {
            var ver = navigator.appVersion;
            if (ver != null) {
                if (ver.indexOf("MSIE 8.") >= 0
                    || ver.indexOf("MSIE 7.") >= 0
                    || ver.indexOf("MSIE 6.") >= 0) {
                    DCDomTools.__isie7 = true;
                }
            }
        }
    }
    return DCDomTools.__isie7;
};

function RegisterCORSCallback(win, name, func) {
    if (win == null) {
        win = window;
    }
    if (win.CORSCallbacks == null) {
        win.CORSCallbacks = new Array();
    }
    win.onmessage = function (e) {
        e = e || win.event;
        win.CORSCallSender = e.source;
        var data = e.data;
        if (data != null && data.length > 11) {
            if (data.substr(0, 11) == "DCCallback:") {
                data = data.substr(11);
                var index = data.indexOf("$");
                var funcName = data;
                var parameter = null;
                if (index > 0) {
                    funcName = data.substr(0, index);
                    parameter = data.substr(index + 1);
                }
                for (var iCount = 0; iCount < win.CORSCallbacks.length; iCount++) {
                    var info = win.CORSCallbacks[iCount];
                    if (info.name == funcName) {
                        info.func.call(win, parameter);
                        break;
                    }
                }
            }
        }
    };
    for (var iCount = 0; iCount < win.CORSCallbacks.length; iCount++) {
        var info = win.CORSCallbacks[iCount];
        if (info.name == name) {
            info.func = func;
            return;
        }
    }
    var newInfo = new Object();
    newInfo.name = name;
    newInfo.func = func;
    win.CORSCallbacks.push(newInfo);    
};

function ExeCORSCallback(name, parameter) {
    if (win.CORSCallSender != null) {
        win.CORSCallSender.postMessage("DCCallback:" + name + "$" + parameter);
        return true;
    }
    return false;
};

//@method 设置跨域远程调用
DCDomTools.SetRPCCallback = function (win) {
    if (window.dcrpc == null) {
        window.dcrpc = new Array();
        window.addEventListener("message", function (e) {
            e = e || window.event;
            var txt = e.data;
            if (txt != null && txt.length > 0) {
                var callName = txt;
                var parameter = null;
                var index = txt.indexOf("*");
                if (index > 0) {
                    callName = txt.substr(0, index);
                    parameter = txt.substr(index + 1);
                }
                for (var iCount = 0; iCount < window.dcrpc.length; iCount++) {
                    var item = window.dcrpc[iCount];
                    if (item.win == e.source) {
                        var func = item[callName];
                        if (typeof (func) == "function") {
                            func(parameter);
                        }
                        break;
                    }
                }//for
            }
        });
    }
    for (var iCount = 0; iCount < window.dcrpc.length; iCount++) {
        var item = window.dcrpc[iCount];
        if (item.win == win) {
            function temp9998() {
                win.postMessage("dcrpc20190320", "*");
            }
            window.setTimeout(temp9998, 2000);
            return item;
        }
    }//for

    var info = new Object();
    info.win = win;
    window.dcrpc.push(info);
    function temp999() {
        info.innerSended = true;
        win.postMessage("dcrpc20190320", "*");
    }
    window.setTimeout(temp999, 2000);

    info.RPCCall = function (name, parameter, delay) {
        if (typeof (delay) == "number" && delay > 0) {
            var funcssss = function () {
                info.win.postMessage(name + "*" + parameter);
            }
            window.setTimeout(funcssss, delay);
        }
        else {
            info.win.postMessage(name + "*" + parameter);
        }
    };
    return info;
};

// 判断是否为一个JSON格式的字符串
DCDomTools.isJsonText = function (txt) {
    if (txt == null || txt.length == 0) {
        return false;
    }
    if (txt.substr(0, 1) == "{" && txt.substr(txt.length - 1) == "}") {
        return true;
    }
    if (txt.substr(0, 1) == "[" && txt.substr(txt.length - 1) == "]") {
        return true;
    }
    return false;
};

// 修正事件参数对象
DCDomTools.FixEventObject = function (eventObject) {
    if (eventObject == null && window.event) {
        eventObject = window.event;
    }
    if (eventObject != null && eventObject.originalEvent) {
        eventObject = eventObject.originalEvent;
    }
    return eventObject;
};

// 冒泡调用内容改变方法
DCDomTools.BubbleRaiseChanged = function (element) {
    if (element == null) {
        var sel = this.getSelection();
        if (sel != null) {
            element = sel.focusNode;
        }
    }
    var p = element;
    while (p != null) {
        if (typeof (p.RaiseChanged) == "function") {
            p.RaiseChanged();
        }
        p = p.parentNode;
    }
};

// 获得文档中所有的全局样式清单。
DCDomTools.GetAllStyleSheet = function () {
    var result = new Object();
    if (document.styleSheets) {
        var len = document.styleSheets.length;
        for (var iCount = 0; iCount < len; iCount++) {
            var sheet = document.styleSheets[iCount];
            // 20200305 xuyiming 解决DCWRITER-3055
            try {
                var rules = sheet.rules || sheet.cssRules;
            }
            catch (err) {
                var rules = null;
            }
            if (rules) {
                var len2 = rules.length;
                for (var iCount2 = 0; iCount2 < len2; iCount2++) {
                    var rule = rules[iCount2];
                    if (rule.style) {
                        result[rule.selectorText] = rule.style;
                    }
                }
            }
        }
        return result;
    }

    var nodes = document.getElementsByTagName("STYLE");
    var len = nodes.length;
    for (var iCount = 0; iCount < len; iCount++) {
        var node = nodes[iCount];
        if (node.sheet && node.sheet.rules) {
            var rules = node.sheet.rules;
            var len2 = rules.length;
            for (var iCount2 = 0; iCount2 < len2; iCount2++) {
                var rule = rules[iCount2];
                if (rule.style) {
                    result[rule.selectorText] = rule.style;
                }
            }
        }
    }
    return result;
};

// @method 获得2个节点中所有的子孙节点
// @param startNode 起始节点
// @param endNode 结束节点
// @excludeReadonlyNode 是否过滤掉内容只读(无法手动编辑)的节点。
DCDomTools.GetAllNodes = function (startNode, endNode, excludeReadonlyNode) {
    if (startNode != null && endNode != null) {
        var handled = false;
        var p1 = startNode;
        while (p1 != null) {
            var p2 = endNode;
            while (p2 != null) {
                if (p1 == p2) {
                    break;
                }
                if (p1.parentNode == p2.parentNode) {
                    // 起始节点和结束节点具有相同的父节点。
                    while (p2 != null) {
                        if (p1 == p2) {
                            // 结束节点的后续节点出现了起始节点，则进行互换。
                            var temp = startNode;
                            startNode = endNode;
                            endNode = temp;
                            handled = true;
                            break;
                        }
                        p2 = p2.nextSibling;
                    }//while
                    break;
                }
                p2 = p2.parentNode;
            }
            if (handled == true) {
                break;
            }
            p1 = p1.parentNode;
        }
    }
    var result = new Array();

    var nextNode = startNode;
    while (nextNode != null) {
        if (excludeReadonlyNode == true
            && nextNode.isContentEditable == false) {

        }
        else {
            result.push(nextNode);
        }
        if (nextNode == endNode) {
            // 遇到结束节点，则退出
            break;
        }
        // 获得下一个节点
        if (nextNode.firstChild != null) {
            // 获得第一个子节点
            nextNode = nextNode.firstChild;
        }
        else if (nextNode.nextSibling != null) {
            // 获得下一个平级节点
            nextNode = nextNode.nextSibling;
        }
        else {
            // 获得上级节点的下一个平级节点
            nextNode = nextNode.parentNode;
            while (nextNode != null) {
                if (nextNode.nextSibling != null) {
                    nextNode = nextNode.nextSibling;
                    break;
                }
                nextNode = nextNode.parentNode;
            }
        }
        //nextNode = GetNextNode(nextNode);
    }//while
    return result;
};

DCDomTools.hasAttriubte = function (element, attributeName) {
    if (element == null) {
        return false;
    }
    if (attributeName == null || attributeName.length == 0) {
        return false;
    }
    attributeName = attributeName.toLocaleString();
    if (element.hasAttribute) {
        return element.hasAttribute(attributeName);
    }
    if (element.attributes) {
        for (var iCount = 0; iCount < element.attributes.length; iCount++) {
            var attr = element.attributes[iCount];
            if (attr.nodeName == attributeName) {
                return true;
            }
        }
    }
    return false;
};

DCDomTools.ParseJSON = function (strJson) {
    if (typeof (JSON) == "undefined") {
        var v2 = window.eval("(" + strJson + ")");
        return v2;
    }
    var v = JSON.parse(strJson);
    return v;
};

// 动态判断并加载JQUERY库
DCDomTools.LoadJQuery = function (rootElement) {
    var input = DCDomTools.GetSettingsElement(rootElement);
    if( input != null )
    {
        var url = input.getAttribute("jqueryurl");
        if( url != null && url.length >0 )
        {
            var oScript = document.createElement("script");
            oScript.type = "text\/javascript";
            oScript.setAttribute("language", "javascript");
            oScript.setAttribute("async", "false");
            document.head.appendChild(oScript);
            oScript.src = url;
            return true;
        }
        return false;
    }
};
DCDomTools.GetSettingsElement = function ( rootElement ) {
    if( rootElement != null && rootElement.getAttribute && rootElement.getAttribute("dctype") == "WebWriterControl")
    {
        var input = document.getElementById(rootElement.id + "_Settings");
        return input;
    }
    return null;
};

// 模拟键盘事件
DCDomTools.fireKeyEvent = function (element , evtType, keyCode , ctrlKey ,altKey , shiftKey ) {
    var evtObj;
    if (document.createEvent) {
        if (window.KeyEvent) {//firefox 浏览器下模拟事件
            evtObj = document.createEvent('KeyEvents');
            evtObj.initKeyEvent(evtType, true, true, window, ctrlKey, altKey, shiftKey, false, keyCode, 0);
        } else {//chrome 浏览器下模拟事件
            evtObj = document.createEvent('UIEvents');
            evtObj.initUIEvent(evtType, true, true, window, 1);

            delete evtObj.keyCode;
            if (typeof evtObj.keyCode === "undefined") {//为了模拟keycode
                Object.defineProperty(evtObj, "keyCode", { value: keyCode });
            } else {
                evtObj.key = String.fromCharCode(keyCode);
            }

            if (typeof evtObj.ctrlKey === 'undefined') {//为了模拟ctrl键
                Object.defineProperty(evtObj, "ctrlKey", { value: ctrlKey });
                Object.defineProperty(evtObj, "shiftKey", { value: shiftKey });
                Object.defineProperty(evtObj, "altKey", { value: altKey });
            } else {
                evtObj.ctrlKey = true;
            }
        }
        element.dispatchEvent(evtObj);

    } else if (document.createEventObject) {//IE 浏览器下模拟事件
        evtObj = document.createEventObject();
        evtObj.keyCode = keyCode
        element.fireEvent('on' + evtType, evtObj);
    }
};

// 获得文档中同一组的单选框复选框文档元素
DCDomTools.GetCheckRadioBoxElementsByName = function (srcElement) {
    var result = new Array();
    var nodes = document.getElementsByTagName("INPUT");
    for (var iCount = 0; iCount < nodes.length; iCount++) {
        var node = nodes[iCount];
        if (node.type == srcElement.type && node.name == srcElement.name
            && node.name !== undefined
            && node.name !== null
            && node.name !== "") {
            result.push(node);
        }
    }
    if (result.length == 0) {
        result.push(srcElement);//如果没设置name则包含自身
    }
    return result;
};


// 判断指定的元素是否处于鼠标拖拽滚动的操作状态
DCDomTools.IsMouseDragScrollMode = function (rootElement) {
    if (rootElement == null) {
        return false;
    }
    return rootElement.flagMouseDragScroll == true;
};

// 设置鼠标拖拽滚动的操作模式
DCDomTools.setMouseDragScrollMode = function (rootElement, setValue) {
    if (rootElement == null) {
        return false;
    }
    if (setValue == false && typeof (rootElement.flagMouseDragScroll) == "undefined") {
        return false;
    }
    if (rootElement.flagMouseDragScroll == setValue) {
        // 模式没有发生改变，无需再设置
        return false;
    }
    rootElement.flagMouseDragScroll = setValue;
    if (setValue == true) {
        // 进入拖拽滚动模式
        // 备份已有的鼠标处理事件
        rootElement.backDCMouseDown = rootElement.onmousedown;
        rootElement.backDCMouseMove = rootElement.onmousemove;
        rootElement.backDCMouseUp = rootElement.onmouseup;
        rootElement.backDCClick = rootElement.onclick;
        rootElement.backDCDBLClick = rootElement.ondblclick;
        rootElement.backDCCursor = rootElement.style.cursor;
        rootElement.fixForDragScrollX = 0;
        rootElement.fixForDragScrollY = 0;
        rootElement.dcMouseDownFlag = false;
        rootElement.style.cursor = "default";
        rootElement.onmousedown = function (eventObject) {
            if (eventObject == null) {
                eventObject = window.event;
            }
            if (eventObject == null) {
                return;
            }

            var srcElement = this;
            if (srcElement.componentFromPoint) {
                var cmp = srcElement.componentFromPoint(eventObject.clientX, eventObject.clientY);
                if (cmp != null && cmp.length > 0 && cmp != "outside") {
                    // 不是在客户区中按下鼠标按键的，则退出
                    return;
                }
            }
            // 清空选择状态
            var sel = window.getSelection ? window.getSelection() : document.selection;
            if (sel != null && sel.removeAllRanges) {
                sel.removeAllRanges();
            }
            else if (sel != null && sel.clear) {
                sel.clear();
            }
            if (eventObject.button == 0 || eventObject.buttonID == 0) {
                // 鼠标左键按下，开始拖拽滚动
                srcElement.style.cursor = "all-scroll";
                srcElement.dcLastClientX = eventObject.clientX;
                srcElement.dcLastClientY = eventObject.clientY;
                srcElement.dcMouseDownFlag = true;
                DCDomTools.completeEvent(eventObject);
                if (srcElement.setCapture) {
                    srcElement.setCapture(true);
                }
            }
        };

        rootElement.onmousemove = function (eventObject) {
            if (eventObject == null) {
                eventObject = window.event;
            }
            if (eventObject == null) {
                return;
            }
            var srcElement = this;
            if (srcElement.dcMouseDownFlag == true) {
                // 处于拖拽模式
                var sx = eventObject.clientX - srcElement.dcLastClientX;
                var sy = eventObject.clientY - srcElement.dcLastClientY;
                srcElement.dcLastClientX = eventObject.clientX;
                srcElement.dcLastClientY = eventObject.clientY;
                srcElement.scrollLeft -= sx;
                srcElement.scrollTop -= sy;
                if (srcElement.setCapture) {
                    srcElement.setCapture(true);
                }
            }
            DCDomTools.completeEvent(eventObject);
        };

        rootElement.onmouseup = function (eventObject) {
            if (eventObject == null) {
                eventObject = window.event;
            }
            if (eventObject == null) {
                return;
            }
            var srcElement = this;
            if (srcElement.dcMouseDownFlag == true) {
                srcElement.style.cursor = "default";
                srcElement.dcMouseDownFlag = false;
                if (srcElement.releaseCapture) {
                    srcElement.releaseCapture();
                }
                DCDomTools.completeEvent(eventObject);
            }
        };

        rootElement.onclick = function (eventObject) {
            if (eventObject == null) {
                eventObject = window.event;
            }
            if (eventObject != null) {
                DCDomTools.completeEvent(eventObject);
            }
        };
        rootElement.ondblclick = function (eventObject) {
            if (eventObject == null) {
                eventObject = window.event;
            }
            if (eventObject != null) {
                DCDomTools.completeEvent(eventObject);
            }
        };
    }
    else {
        // 退出拖拽滚动模式
        // 还原鼠标处理事件
        rootElement.fixForDragScrollX = 0;
        rootElement.fixForDragScrollY = 0;
        rootElement.onmousedown = rootElement.backDCMouseDown;
        rootElement.onmousemove = rootElement.backDCMouseMove;
        rootElement.onmouseup = rootElement.backDCMouseUp;
        rootElement.onclick = rootElement.backDCClick;
        rootElement.ondblclick = rootElement.backDCDBLClick;
        rootElement.dcMouseDownFlag = false;
        rootElement.style.cursor = rootElement.backDCCursor;
        rootElement.backDCMouseDown = null;
        rootElement.backDCMouseMove = null;
        rootElement.backDCMouseUp = null;
        rootElement.backDCCursor = null;
        rootElement.backDCClick = null;
        rootElement.backDCDBLClick = null;
    }
    return true;
};




// 删除CSS中的属性
// 参数 rootNode:要操作的节点
//      deeply:是否处理子孙节点
DCDomTools.removeCssAttribute = function (rootNode, attributeName, deeply) {
    if (rootNode.style) {
        if (rootNode.style.removeAttribute) {
            rootNode.style.removeAttribute(attributeName);
        }
        else if (rootNode.style.removeProperty) {
            rootNode.style.removeProperty(attributeName);
        }
        if (deeply == true && rootNode.childNodes) {
            var nodes = rootNode.childNodes;
            for (var iCount = 0; iCount < nodes.length; iCount++) {
                this.removeCssAttribute(nodes[iCount], attributeName, true);
            }
        }
    }
};


// 删除子节点中的CSS中的属性
// 参数 rootNode:要操作的节点
//      deeply:是否处理子孙节点
DCDomTools.removeChildNodesCssAttribute = function (rootNode, attributeName, deeply) {
    if (rootNode != null && rootNode.childNodes) {
        var nodes = rootNode.childNodes;
        for (var iCount = 0; iCount < nodes.length; iCount++) {
            this.removeCssAttribute(nodes[iCount], attributeName, deeply);
        }
    }
};

DCDomTools.isDocumentFocused = function (doc) {
    if (doc == null) {
        doc = document;
    }

};

// 判断节点是否在文档碎片中
DCDomTools.isInDocumentFragment = function (node) {
    if (node == null) {
        return false;
    }
    while (true) {
        if (node == null || node.nodeName == "#document-fragment") {
            return true;
        }
        if (node.nodeName == "BODY" || node.nodeName == "#document") {
            return true;
        }
        node = node.parentNode;
    }
    return false;
};

// 判断节点是否在可编辑区域
DCDomTools.isContentEditable = function (node) {
    while (node != null) {
        if (node.isContentEditable == false) {
            return false;
        }
        if (node.isContentEditable == true) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
};

// 将数据转换为布尔值，若转换失败则返回默认值
DCDomTools.toBoolean = function (v, defaultValue) {
    if (v == null) {
        return defaultValue;
    }
    if (typeof (v) == "boolean") {
        return v;
    }
    if (typeof (v) != "string") {
        v = v.toString();
    }
    v = v.toLowerCase();
    if (v == "true") {
        return true;
    }
    if (v == "false") {
        return false;
    }
    return defaultValue;
};

// 获得节点在数组中的序号
DCDomTools.indexInArray = function (array, element) {
    if (array == null || element == null) {
        return -1;
    }
    for (var iCount = 0; iCount < array.length; iCount++) {
        if (array[iCount] == element) {
            return iCount;
        }
    }
    return -1;
};

// 创建一个二维数组
DCDomTools.create2DArray = function (length1, length2) {
    var result = new Array(length1);
    for (var iCount = 0; iCount < length1; iCount++) {
        result[iCount] = new Array(length2);
    }
    return result;
};

//在指定节点后插入新的节点
DCDomTools.insertAfter = function (oldNode, newNode) {
    var p = oldNode.parentNode;
    if (p != null) {
        if (oldNode.nextSibling == null) {
            p.appendChild(newNode);
        }
        else {
            p.insertBefore(newNode, oldNode.nextSibling);
        }
    }
};

// 向数组插入一个新的元素，返回插入元素后的新的数组
DCDomTools.insertElementToArray = function (array, index, newElement) {
    if (array == null) {
        array = new Array();
        array.push(newElement);
        return array;
    }
    if (index <= 0) {
        return array.unshift(newElement);
    }
    if (index >= array.length) {
        array.push(newElement);
        return array;
    }
    var a1 = array.slice(0, index);
    var a2 = array.slice(index + 1, array.length);
    a1.push(newElement);
    return a1.concat(a2);
};

// 获得指定名称的父节点
DCDomTools.getParentSpecifyNodeName = function (node, nodeName) {
    while (node != null) {
        if (node.nodeName == nodeName) {
            return node;
        }
        node = node.parentNode;
    }
    return null;
};

// 选中文档区域
DCDomTools.selectContent = function (startNode, startIndex, endNode, endIndex) {
    if (startNode == null && endNode == null) {
        return;
    }
    var range = null;
    if (document.createRange) {
        range = document.createRange();
    }
    else if (document.body.createRange) {
        range = document.body.createRange();
    }
    if (range != null) {
        if (startNode != null && startIndex >= 0) {
            if (range.setStart) {
                range.setStart(startNode, startIndex);
            }
        }
        if (endNode != null && endIndex >= 0) {
            if (range.setEnd) {
                range.setEnd(endNode, endIndex);
            }
        }
        if (range.select) {
            range.select();
        }
        else {
            var sel = DCDomTools.getSelection();
            if (sel.removeAllRanges) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }
};

// 比较两个节点在整体DOM树中的位置对比信息
DCDomTools.compareDOMTreePosition = function (node1, node2) {
    if (node1 == node2) {
        return 0;
    }
    if (node1.parentNode == node2.parentNode) {
        var idx1 = this.GetNodeIndex(node1);
        var idx2 = this.GetNodeIndex(node2);
        if (idx1 > idx2) {
            return 1;
        }
        else {
            return -1;
        }
    }
    var idx1 = new Array();
    var node = node1;
    while (node != null && node.parentNode) {
        idx1.push(this.GetNodeIndex(node));
        node = node.parentNode;
    }//while
    var idx2 = new Array();
    node = node2;
    while (node != null && node.parentNode) {
        idx2.push(this.GetNodeIndex(node));
        node = node.parentNode;
    }//while
    for (var iCount = 0; iCount < idx1.length && iCount < idx2.length; iCount++) {
        var dx = idx1[iCount] - idx2[iCount];
        if (dx > 0) {
            return 1;
        }
        else if (dx < 0) {
            return -1;
        }
    } //for
    if (idx1.length < idx2.length) {
        return 1;
    }
    else {
        return 0;
    }
};

// 获得文档节点全局唯一编号
DCDomTools.getGlobalNodeID = function (node) {
    if (node == null) {
        return null;
    }
    if (node.uniqueID) {
        return node.uniqueID;
    }
    return null;
};

// 复制属性值
DCDomTools.copyAttributes = function (srcNode, descNode) {
    if (srcNode == null || descNode == null) {
    }
    if (srcNode.attributes && descNode.attributes) {
        for (var iCount = 0; iCount < srcNode.attributes.length; iCount++) {
            var attr = srcNode.attributes[iCount];
            descNode.setAttribute(attr.nodeName, attr.nodeValue);
        }
    }
};

/**
Emulates MSIE function range.moveToPoint(x,y) b
returning the selection node info corresponding
to the given x/y location.

@param x the point X coordinate
@param y the point Y coordinate
@return the node and offset in characters as 
{node,offsetInsideNode} (e.g. can be passed to range.setStart) 
*/
DCDomTools.getSelectionNodeInfo = function (x, y) {
    // Implementation note: range.setStart offset is
    // counted in number of child elements if any or
    // in characters if there is no childs. Since we
    // want to compute in number of chars, we need to
    // get the node which has no child.
    var startRange = null;
    if (document.createRange) {
        startRange = document.createRange();
    }
    else if (document.body.createRange) {
        startRange = document.body.createRange();
    }
    var elem = document.elementFromPoint(x, y);
    if (elem == null) {
        return null;
    }
    var startNode = (elem.childNodes.length > 0 ? elem.childNodes[0] : elem);
    if (startNode.nodeName != "#text" && startNode.childNodes.length == 0) {
        return { node: startNode, offsetInsideNode: 0 };
    }
    var startCharIndexCharacter = -1;
    do {
        startCharIndexCharacter++;
        startRange.setStart(startNode, startCharIndexCharacter);
        startRange.setEnd(startNode, startCharIndexCharacter + 1);
        var rangeRect = startRange.getBoundingClientRect();
        if (rangeRect.left <= x && x <= rangeRect.right && rangeRect.top <= y && y <= rangeRect.bottom) {
            break;
        }
    } while (startCharIndexCharacter < startNode.length - 1);
    if (startCharIndexCharacter > 0) {
        var i = 0;
    }
    return { node: startNode, offsetInsideNode: startCharIndexCharacter };
};

DCDomTools.moveCaretToPoint = function (x, y) {
    var sel = DCDomTools.getSelection();
    var range = this.createSelectionRange();
    if (range.moveToPoint) {
        range.moveToPoint(x, y);
        return;
    }
    var info = this.getSelectionNodeInfo(x, y);
    if (info != null && info.node != null) {
        if (info.node.parentNode != null && info.node.parentNode.isContentEditable == true) {
            DCDomTools.MoveCaretToIndex(info.node, info.offsetInsideNode);
        }
    }
    return true;

};

// 获得表示选中区域的信息对象
DCDomTools.createSelectionRange = function () {
    var sel = DCDomTools.getSelection();
    var range = null;
    if (sel.getRangeAt && sel.rangeCount > 0) {
        range = sel.getRangeAt(0);
    }
    else if (sel.createRange) {
        range = sel.createRange();
    }
    else if (document.createRange) {
        range = document.createRange();
        sel.addRange(range);
    }
    else if (document.body.createRange) {
        range = document.body.createRange();
        sel.addRange(range);
    }
    return range;
};

// 快速判断是否为隐藏元素
DCDomTools.isHiddenElementFast = function (element) {
    if (element == null) {
        return true;
    }
    if (element.nodeName == "#text") {
        element = element.parentNode;
    }
    if (element.style.display == "none" || element.style.visibility == "hidden") {
        return true;
    }
    return false;
};

// 判断是否为隐藏的元素
DCDomTools.isHiddenElement = function (element) {
    if (element == null) {
        return true;
    }
    if (element.nodeName == "#text") {
        element = element.parentNode;
    }

    //    if (element.parentNode == null || element.parentNode.nodeName == "#document-fragment") {
    //        // 属于文档片段
    //        return false;
    //    }
    if (element.getClientRects) {
        var rects = element.getClientRects();
        if (rects == null || rects.length == 0) {
            return true;
        }
    }
    while (element != null && element.nodeName != "BODY") {
        if (element.style.display == "none" || element.style.visibility == "hidden") {
            return true;
        }
        element = element.parentNode;
    }
    return false;
};

// 判断元素是否在可视区域
DCDomTools.IsInVisibleArea = function (element, fixedHeaderHeight) {
    var left = element.offsetLeft;
    var top = element.offsetTop;
    var p = element.offsetParent;
    while (p != null) {
        if (p.clientHeight < p.scrollHeight) {
            if (top < p.scrollTop || top + element.offsetHeight > p.scrollTop + p.clientHeight) {
                return false;
            }
            if (left < p.scrollLeft || left + 10 > p.scrollLeft + p.clientWidth) {
                return false;
            }
        }
        if (p.nodeName == "BODY") {
            if (fixedHeaderHeight == null) {
                fixedHeaderHeight = 0;
            }
            if (isNaN(fixedHeaderHeight) == false && fixedHeaderHeight > 0) {
                if (top < p.scrollTop + fixedHeaderHeight || top + element.offsetHeight > p.scrollTop + fixedHeaderHeight + p.clientHeight) {
                    return false;
                }
            }
            break;
        }
        left = left + p.offsetLeft;
        top = top + p.offsetTop;
        p = p.offsetParent;
    }
    return true;
};

// 完成事件，事件不再后续分发,也不执行默认行为。
DCDomTools.completeEvent = function (eventObject) {
    if (eventObject == null) {
        if (window.event) {
            eventObject = window.event;
        }
    }
    if (eventObject != null) {
        eventObject.cancelBubble = true;
        if (eventObject.stopPropagation) {
            eventObject.stopPropagation();
        }
        if (eventObject.stopImmediatePropagation) {
            eventObject.stopImmediatePropagation();
        }
        if (eventObject.preventDefault) {
            eventObject.preventDefault();
        }
        eventObject.returnValue = false;
    }
};

//创建并添加一个CSS样式表引用
DCDomTools.createCssLinkElement = function (doc, url) {
    if (doc == null) {
        doc = document;
    }
    var head = doc.getElementsByTagName("head");
    if (head != null && head.length > 0) {
        var link = doc.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = url;
        head[0].appendChild(link);
        return link;
    }
    else {
        return null;
    }
};

// 插入子节点
DCDomTools.insertChildNode = function (parentNode, index, childNode) {
    if (parentNode == null) {
        return false;
    }
    if (childNode == null) {
        return false;
    }
    if (parentNode.nodeName == "#text"
            || parentNode.nodeName == "INPUT"
            || parentNode.nodeName == "TEXTAREA") {
        return false;
    }
    if (index < parentNode.childNodes.length) {
        var node = null;
        if (index <= 0) {
            node = parentNode.firstChild;
        }
        else {
            node = parentNode.childNodes[index];
        }
        parentNode.insertBefore(childNode, node);
    }
    else {
        parentNode.appendChild(childNode);
    }
};

// 删除HTML中的<script>元素
DCDomTools.removeScriptElement = function (htmlString) {
    if (htmlString == null || htmlString.length == 0) {
        return htmlString;
    }
    htmlString = this.removeSpecifyElement(htmlString, "script");
    htmlString = this.removeSpecifyElement(htmlString, "SCRIPT");
    return htmlString;
};

// 删除HTML中的指定名称的元素
DCDomTools.removeSpecifyElement = function (htmlString , tagName ) {
    if (htmlString == null || htmlString.length == 0) {
        return htmlString;
    }
    while (true) {
        var match = false;
        var index1 = htmlString.indexOf("<" + tagName );
        if (index1 >= 0) {
            var index2 = htmlString.indexOf("</" + tagName + ">", index1);
            if (index2 > 0) {
                var txt = htmlString.substr(0, index1);
                var txt2 = htmlString.substr(index2 + 9);
                htmlString = txt + txt2;
                match = true;
            }
        }
        if (match == false) {
            break;
        }
    }
    return htmlString;
};

// 获得最顶层的窗体对象
DCDomTools.GetTopWindow = function () {
    var tw = window;
    while (true) {
        var pw = null;
        if (tw.frameElement) {
            pw = tw.frameElement.ownerDocument.parentWindow;
        }
        if (pw != null) {
            tw = pw;
        }
        else {
            break;
        }
    }
    return tw;
};

DCDomTools.trim = function (str) {
    str = str || '';
    return str.replace(/^\s|\s$/g, '').replace(/\s+/g, ' ');
};


// 从一个HTML字符串中获得标题值
DCDomTools.GetTitleFromHtml = function (strHtml) {
    if (strHtml == null || strHtml.length == 0) {
        return null;
    }
    var index1 = strHtml.indexOf("<title>");
    if (index1 < 0) {
        index1 = strHtml.indexOf("<TITLE>");
    }
    if (index1 < 0) {
        return null;
    }
    var index2 = strHtml.indexOf("</title>");
    if (index2 < 0) {
        index2 = strHtml.indexOf("</TITLE>");
    }
    if (index2 < index1) {
        return null;
    }
    var result = strHtml.substring(index1 + 7, index2);
    result = DCDomTools.trim(result);
    return result;
};

DCDomTools.GetDocumentClientHeight = function () {
    var v1 = document.body.clientHeight;
    var v2 = document.documentElement.clientHeight;
    if (window.innerHeight)
    {
        v2 = window.innerHeight;
    }
    if (v1 > 0 && v2 > 0) {
        return Math.max(v1, v2);
    }
    if (v1 > 0) {
        return v1;
    }
    return v2;
};

DCDomTools.GetDocumentClientWidth = function () {
    var v1 = document.body.clientWidth;
    var v2 = document.documentElement.clientWidth;
    if (window.innerWidth)
    {
        v2 = window.innerWidth;
    }
    if (v1 > 0 && v2 > 0) {
        return Math.max(v1, v2);
    }
    if (v1 > 0) {
        return v1;
    }
};


DCDomTools.hasClass = function (elem, cls) {
    elem = elem || {};
    return new RegExp('\\b' + cls + '\\b').test(elem.className);
};

DCDomTools.addClass = function (elem, cls) {
    elem = elem || {};
    DCDomTools.hasClass(elem, cls) || (elem.className += ' ' + cls);
    //elem.className = elem.className;
    return this;
};

DCDomTools.removeClass = function (elem, cls) {
    elem = elem || {};
    if (DCDomTools.hasClass(elem, cls)) {
        var reg = new RegExp('\\b' + cls + '\\b');
        elem.className = elem.className.replace(reg, '');
    }
    return this;
};

//清除css属性
DCDomTools.removeCssAttr = function (elem, attr) {
    var s = elem.style;
    if (s != null) {
        if (s.removeProperty) {
            s.removeProperty(attr);
        } else {
            s.removeAttribute(attr);
        }
    }
};


/**
* @param text 键值对形式的字符串
* @return 返回键值对的数组
*/
DCDomTools.ParseAttributeString = function (text) {
    if (text == null || text == undefined || text == '') {
        return null;
    }
    var resultArray = new Array()//结果数组

    while (text.length > 0) {
        var newName = ""; //键
        var newValue = ""; //值
        var index = text.indexOf(":");
        if (index > 0) {
            newName = text.substring(0, index);
            text = text.substring(index + 1);
            if (text.slice(0, 1) == "\'") {//值里面以单引号开头,slice效率比indexOf更高
                var index2 = text.indexOf("\'", 1);
                if (index2 < 0) {
                    index2 = text.indexOf(";");
                }
                if (index2 >= 0) {
                    newValue = text.substring(1, index2);
                    text = text.substring(index2 + 1);
                    if (text.slice(0, 1) == "\'") {
                        text = text.substring(1);
                    }
                }
                else {
                    newValue = text.substring(1);
                    text = "";
                }
            } //if
            else {//值里面不以单引号开头
                var index3 = text.indexOf(";");
                if (index3 >= 0) {
                    newValue = text.substring(0, index3);
                    text = text.substring(index3 + 1);
                }
                else {
                    newValue = text;
                    text = "";
                }
            }
        }
        else {
            newName = text.trim();
            text = "";
        }
        //alert(newName);
        //alert(newValue);
        resultArray.push(newName);
        resultArray.push(newValue);
    }
    return resultArray;
};

DCDomTools.AddProperty = function (obj, propertyName, funcGetter, funcSetter) {
    if (obj == null) {
        return false;
    }
    if (propertyName == null || propertyName.length == 0) {
        return false;
    }
    if (funcGetter == null && funcSetter == null) {
        return false;
    }
    if (Object.defineProperty) {
        Object.defineProperty(obj, propertyName, {
            set: funcSetter,
            get: funcGetter
        });
    }
    else {
        try {
            if (funcGetter != null) {
                obj.prototype.__defineGetter__(propertyName, funcGetter);
            }
            if (funcGetter != null) {
                obj.prototype.__defineSetter__(propertyName, funcSetter);
            }
        } catch (ex) {
            
        }
    }
};

//**************************************************************************************************************
// 获得毫秒为单位的时刻数
DCDomTools.GetDateMillisecondsTick = function (dtm) {
    var v = dtm.getFullYear();
    v = v * 12 + dtm.getMonth();
    v = v * 30 + dtm.getDate();
    v = v * 24 + dtm.getHours();
    v = v * 60 + dtm.getMinutes();
    v = v * 60 + dtm.getSeconds();
    v = v * 1000 + dtm.getMilliseconds();
    return v;
};

//**************************************************************************************************************
// 获得毫秒为单位的当前时刻数
DCDomTools.GetCurrentDateMillisecondsTick = function () {
    return DCDomTools.GetDateMillisecondsTick(new Date());
};

// 获得指定元素后面的若干个后续元素。
DCDomTools.GetNextNodes = function (startNode, maxCount) {
    if (startNode == null) {
        return null;
    }
    if (isNaN(maxCount)) {
        maxCount = 0;
    }
    var result = new Array();
    var nextNode = startNode;
    while (nextNode != null) {
        DCDomTools.GetSubNodes(nextNode, maxCount, result);
        nextNode = DCDomTools.GetAbsNextSibling(nextNode);
        if (nextNode == null) {
            break;
        }
        else {
            result.push(nextNode);
            if (maxCount >= 0 && result.length >= maxCount) {
                return result;
            }
        }
    }
    function InnerGetNextNodes(node, list, maxCount) {
        for (var iCount = 0; iCount < node.childNodes.length; iCount++) {
            var subNode = node.childNodes[iCount];
            list.push(subNode);
            if (maxCount >= 0 && list.length >= maxCount) {
                break;
            }
            if (subNode.nodeType == 1) {
                InnerGetNextNodes(subNode, list, maxCount);
                if (maxCount >= 0 && list.length >= maxCount) {
                    break;
                }
            }
        }
    }
    InnerGetNextNodes(startNode, result, maxCount);
    return result;
};

// 获得指定元素所有的子孙元素,按照前序递归来获取。获得的列表不包含根元素本身。
DCDomTools.GetSubNodes = function (rootNode, maxCount , resultList ) {
    if (rootNode == null) {
        return ;
    }
    var result = null;
    if (resultList instanceof Array) {
        result = resultList;
    }
    else {
        result = new Array();
    }
    var nextNode = rootNode;
    function InnerGetNextNodes(node, list, maxCount) {
        for (var iCount = 0; iCount < node.childNodes.length; iCount++) {
            var subNode = node.childNodes[iCount];
            list.push(subNode);
            if (maxCount >= 0 && list.length >= maxCount) {
                break;
            }
            if (subNode.nodeType == 1) {
                InnerGetNextNodes(subNode, list, maxCount);
                if (maxCount >= 0 && list.length >= maxCount) {
                    break;
                }
            }
        }
    }
    if (isNaN(maxCount)) {
        maxCount = 0;
    }
    InnerGetNextNodes(rootNode, result, maxCount);
    return result;
};


// 获得DOM树中的绝对坐标上的下一个元素,搜索时包含子孙元素
DCDomTools.GetAbsNextSiblingIncludeSubNode = function (element) {
    if (element == null) {
        return null;
    }
    var nextNode = element;
    while (nextNode != null) {
        // 这里有可能导致死循环，需要判断 firstChild != element
        if (nextNode.firstChild != null && nextNode.firstChild != element ) {
            return nextNode.firstChild;
        }
        if (nextNode.nextSibling == null) {
            nextNode = nextNode.parentNode;
        }
        else {
            return nextNode.nextSibling;
        }
    }
    return null;
};


// 获得DOM树中的绝对坐标上的下一个元素
DCDomTools.GetAbsNextSibling = function (element) {
    if (element == null) {
        return null;
    }
    var nextNode = element;
    while (nextNode != null ) {
        if (nextNode.nextSibling == null) {
            nextNode = nextNode.parentNode;
        }
        else {
            return nextNode.nextSibling;
        }
    }
    return null;
};

// 获得DOM树中的绝对坐标上的上一个元素
DCDomTools.GetAbspreviousSibling = function (element) {
    if (element == null) {
        return null;
    }
    var nextNode = element;
    while (true) {
        if (nextNode.previousSibling == null) {
            nextNode = nextNode.parentNode;
        }
        else {
            return nextNode.previousSibling;
        }
    }
    return null;
};

// 获得DOM树中的绝对坐标上的上一个元素。搜索时包含子孙节点。
DCDomTools.GetAbspreviousSiblingIncludeSubNodes = function (element) {
    if (element == null) {
        return null;
    }
    var nextNode = element;
    while (true) {
        if (nextNode.previousSibling == null) {
            nextNode = nextNode.parentNode;
        }
        else {
            var nextNode = nextNode.previousSibling;
            while (nextNode.lastChild != null) {
                nextNode = nextNode.lastChild;
            }
            return nextNode;
        }
    }
    return null;
};


// 获得文档元素可供排版的客户区的宽度
DCDomTools.GetClientWidth = function (element) {
    if (element == null) {
        return 0;
    }
    var w = element.clientWidth;
    var pl = element.style.paddingLeft;
    if (pl != null && pl.length > 0) {
        pl = pl.replace("px", "");
    }
    var pw = parseFloat(pl);
    if (isNaN(pw) == false) {
        w = w - pw;
    }
    var pr = element.style.paddingRight;
    if (pr != null && pr.length > 0) {
        pr = pr.replace("px", "");
    }
    pw = parseFloat(pr);
    if (isNaN(pw) == false) {
        w = w - pw;
    }
    return w;
};

// 清空编辑器重做、撤销操作信息
DCDomTools.ClearUndo = function () {
    if (document.queryCommandSupported == null || document.queryCommandSupported("ms-clearUndoStack") == true) {
        document.execCommand("ms-clearUndoStack", false, null);
    }
};

// 设置文档获得焦点
DCDomTools.FoucsDocument = function ( target ) {
    //    var sel = document.selection;
    //    var range = sel.createRange();
    if (target != null) {
        if (target.focus) {
            target.focus();
        }
        if (target.setActive) {
            target.setActive();
        }
        return;
    }
    var frame = window.frameElement;
    if (frame != null) {
        if (frame.focus) {
            frame.focus();
        }
        if (frame.setActive) {
            frame.setActive();
        }
    }
    if (window.setActive) {
        window.setActive();
    }
    if (window.focus) {
        window.focus();
    }
    if (document.focus) {
        document.focus();
    }
    if (document.setActive) {
        document.setActive();
    }
};

// 设置框架内文档获得焦点
DCDomTools.FoucsFrameContent = function (frameElement) {
    if (frameElement == null) {
        return;
    }
    if (frameElement.focus) {
        frameElement.focus();
    }
    if (frameElement.setActive) {
        frameElement.setActive();
    }
    var win = frameElement.contentWindow;
    if (win != null) {
        if (win.setActive) {
            win.setActive();
        }
        if (win.focus) {
            win.focus();
        }
        var doc = win.document;
        if (doc != null) {
            if (doc.focus) {
                doc.focus();
            }
            if (doc.setActive) {
                doc.setActive();
            }
        }
    }
};

//判断是否为纯文本节点
DCDomTools.IsTextNode = function (node) {
    if (node == null) {
        return false;
    }
    if (node.nodeName && node.nodeName == "#text") {
        return true;
    }
    return false;
};

//**************************************************************************************************************
// 获得节点在其父节点中的子节点序号
DCDomTools.GetNodeIndex = function (node) {
    if (node == null || node.parentNode == null) {
        return -1;
    }
    var nodes = node.parentNode.childNodes;
    for (var iCount = 0; iCount < nodes.length; iCount++) {
        if (nodes[iCount] == node) {
            return iCount;
        }
    }
    return -1;
};

//**************************************************************************************************************
// 获得子节点在父节点的节点集合中的序号
DCDomTools.IndexOfChildNode = function (parentNode, childNode) {
    if (parentNode == null || childNode == null) {
        return -1;
    }
    var nodes = parentNode.childNodes;
    for (var iCount = 0; iCount < nodes.length; iCount++) {
        if (nodes[iCount] == childNode) {
            return iCount;
        }
    }
    return -1;
};

//移动并替换所有的置属子元素
DCDomTools.ReplaceAllNodes = function (rootNode, childNodes ,copyMode) {
    if (rootNode != null) {
        while (rootNode.lastChild != null) {
            rootNode.removeChild(rootNode.lastChild);
        }
        if (childNodes != null) {
            var len = childNodes.length;
            for (var iCount = 0; iCount < len; iCount++) {
                if (copyMode == true) {
                    rootNode.appendChild(childNodes[iCount].cloneNode(true));
                }
                else {
                    rootNode.appendChild(childNodes[iCount]);
                }
            }
        }
    }
};
//
// 删除指定元素的所有子元素
// 
DCDomTools.removeAllChilds = function (element) {
    if (element != null) {
        while (element.firstChild != null) {
            element.removeChild(element.firstChild);
        }
    }
};


//**************************************************************************************************************
// 获得两个节点共同的根节点
DCDomTools.GetSameRootNode = function (node1, node2) {
    if (node1 == node2) {
        return node1;
    }
    if (node1 == null || node2 == null) {
        return null;
    }
    var nodes1 = new Array();
    var p = node1;
    while (p != null) {
        nodes1.push(p);
        p = p.parentNode;
    }

    var nodes2 = new Array();
    p = node2;
    while (p != null) {
        nodes2.push(p);
        p = p.parentNode;
    }

    for (var iCount1 = 0 ; iCount1 < nodes1.length ; iCount1 ++ ) {
        var p1 = nodes1[iCount1];
        for (var iCount2 = 0; iCount2 < nodes2.length; iCount2++) {
            var p2 = nodes2[iCount2];
            if (p1 == p2) {
                return p1;
            }
        }
    }
    return null;
};

//*******************************************************************************
// 取消对指定元素的闪烁操作
DCDomTools.FlashElement = function (element) {
    if (DCDomTools.FlashInfos) {
        for (var iCount = 0; iCount < DCDomTools.FlashInfos.length; iCount++) {
            var obj = DCDomTools.FlashInfos[iCount];
            if (obj.element == element) {
                DCDomTools.FlashInfos.splice(iCount);
                break;
            }//if
        }//for
    }//if
};

//*******************************************************************************
// 闪烁指定文档元素
// 参数 element:文档元素对象
//      count:闪烁次数
//      borderColor:闪烁时使用的边框色
DCDomTools.FlashElement = function (element, count, borderColor) {
    if (element == null) {
        return false;
    }
    if (!element.getAttribute) {
        return false;
    }
    if (!DCDomTools.FlashInfos) {
        DCDomTools.FlashInfos = new Array();
    }
    for (var iCount = 0; iCount < DCDomTools.FlashInfos.length; iCount++) {
        var obj = DCDomTools.FlashInfos[iCount];
        if (obj.element == element) {
            obj.count = count;
            obj.color = borderColor;
            // 已经存在闪烁信息
            return;
        }
    }
    var obj2 = new Object();
    obj2.element = element;
    obj2.count = 5;
    obj2.color = borderColor;
    obj2.back = element.style.border;
    element.style.border = "1px solid " + borderColor;
    DCDomTools.FlashInfos.push(obj2);
    if (!DCDomTools.timerHandle) {
        DCDomTools.timerHandler = window.setTimeout("DCDomTools.InvokeFlashElement()", 300);
    }
    //alert("zzz");
};

DCDomTools.InvokeFlashElement = function () {
    if (DCDomTools.FlashInfos && DCDomTools.FlashInfos.length > 0) {
        for (var iCount = DCDomTools.FlashInfos.length - 1; iCount >= 0; iCount--) {
            var obj = DCDomTools.FlashInfos[iCount];
            obj.count--;
            if (obj.count <= 0) {
                // 闪烁结束
                obj.element.style.border = obj.back;
                DCDomTools.FlashInfos.splice(iCount);
                continue;
            }
            if ((obj.count % 2) == 0) {
                obj.element.style.border = "1px solid " + obj.color;
                //alert(obj.color);
            }
            else {
                obj.element.style.border = obj.back;
            }
        } //for
        if (DCDomTools.FlashInfos.length > 0) {
            DCDomTools.timerHandler = window.setTimeout(DCDomTools.InvokeFlashElement, 400);
        }
        else {
            DCDomTools.timerHandler = null;
        }
    }

};

// 根据URL加载JSON内容
// 参数：url:JSON访问地址；jsonName:数据名称
DCDomTools.LoadJsonByUrl = function (url) {
    if (url == null || url.length == 0) {
        return new Object();
    }
    var result = new Object();
    var settings = { async: false, dataType: "json" };
    DCDomTools.fixAjaxSettings(settings);
    $.ajax(url, settings ).done(function (data) {
        result = data;
    });
    return result;
};

//*****************************************************************************
// 使用XMLHTTP技术以GET方法获得一个页面内容,而且不采用异步模式，采用同步模式。
DCDomTools.GetContentByUrlNotAsync = function (url) {
    var result = "";
    var settings = { async: false };
    DCDomTools.fixAjaxSettings(settings);
    $.ajax(url, settings ).done(function (data, textStatus, jqXHR ) {
        result = data;
    });
    return result;
};

//*****************************************************************************
// 使用XMLHTTP技术以POST方法获得一个页面内容
DCDomTools.GetContentByUrl = function (url, promptError, readystatechangeCallback, parameter) {
    $.ajax(url, DCDomTools.fixAjaxSettings({ async: true, type: "POST" })).done(function (data, textStatus, jqXHR) {
        if (textStatus == "success")
        {
            readystatechangeCallback(data, jqXHR.status == 200, parameter, jqXHR);
        }
        result = data;
    });
    return true;
};

// 使用XMLHTTP技术以POST方法获得一个页面内容,而且不采用异步模式，采用同步模式,并且有回调函数
DCDomTools.PostContentByUrlNotAsyncHasCallback = function (url, promptError, readystatechangeCallback, parameter) {
    $.ajax(url, DCDomTools.fixAjaxSettings({ async: false, type: "POST" })).done(function (data, textStatus, jqXHR) {
        if (textStatus == "success")
        {
            readystatechangeCallback(data, jqXHR.status == 200, parameter, jqXHR);
        }
        result = data;
    });
    return true;
};

//*****************************************************************************
// 使用XMLHTTP技术以POST方法获得一个页面内容
DCDomTools.PostContentByUrl = function (url, promptError, readystatechangeCallback, parameter, content) {
    $.ajax(
        url,
        DCDomTools.fixAjaxSettings({ async: true, data: content, method: "POST", type: "POST" })
    ).done(function (data, textStatus, jqXHR) {
        if (textStatus == "success") {
            readystatechangeCallback(data, jqXHR.status == 200, parameter, jqXHR);
        }
        result = data;
    });
    return true;
};

DCDomTools.getResponseText = function (responseText, jqXHR) {
    if (responseText != null) {
        if (typeof (responseText) == "object") {
            responseText = responseText.responseText;
        }
    }
    if (responseText == null && typeof (jqXHR) == "object") {
        responseText = jqXHR.responseText;
    }
    return responseText;
};

//使用XMLHTTP技术以POST方法获得一个页面内容并返回一个结果,而且不采用异步模式，采用同步模式。 张昊 2017-2-15 EMREDGE-28
DCDomTools.PostContentByUrlNotAsync = function (url, promptError, content, parseJson) {
    var result = false;
    $.ajax(
        url,
        DCDomTools.fixAjaxSettings({ async: false, data: content, method: "POST", type: "POST" })
    ).always(
        function (data, textStatus, jqXHR) {
            data = DCDomTools.getResponseText(data, jqXHR);
            if (textStatus == "success") {
                var isJson = false;
                if (jqXHR.getResponseHeader) {
                    isJson = jqXHR.getResponseHeader("json") == "1";
                }
                if (isJson || parseJson == true) {
                    result = DCDomTools.ParseJSON(data);
                }
                else if (data == "true") {
                    result = true;
                }
                else if (data == "false") {
                    result = false;
                }
                else {
                    result = data;
                }
            }
            else {
                throw data;
                result = null;
            }
    });
    return result;
};

//**************************************************************************************************************
DCDomTools.showModalDialog = function (url, arguments, features) {
    var dtm1 = new Date();
    //alert(url);
    if (document.WriterControl) {
        var eventObject = new Object();
        eventObject.Message = url;
        eventObject.State = document.WriterControl.ErrorInfo.Error;
        document.WriterControl.MessageHandler(eventObject);
    }
    var result = null;
    if (window.showModalDialog) {
        result = window.showModalDialog(url, arguments, features);
    }
    else if (window.open) {
        result = window.open(url, null, features + ";modal=yes");
    }
    var dtm2 = new Date();
    // 比较两个时间差
    var tick = DCDomTools.GetDateMillisecondsTick(dtm2) - DCDomTools.GetDateMillisecondsTick(dtm1);
    if (tick < 500) {
        //alert("浏览器被设置为禁止弹出对话框了");
        if (document.WriterControl) {
            var eventObject = new Object();
            eventObject.Message = "浏览器被设置为禁止弹出对话框了";
            eventObject.State = document.WriterControl.ErrorInfo.Error;
            document.WriterControl.MessageHandler(eventObject);
        }
    }
    return result;
};

DCDomTools.addEventHandler = function (oTarget, sEventType, fnHandler) {
    if (oTarget == null || sEventType == null || fnHandler == null) {
        return;
    }
    $(oTarget).bind(sEventType, fnHandler);
};

DCDomTools.appendEventHandler = function (oTarget, sEventName, fnHandler) {
    if (oTarget == null || sEventType == null || fnHandler == null) {
        return;
    }
    $(oTarget).on(sEventType, fnHandler);
};


// 删除所有的子节点
DCDomTools.RemoveAllChildNodes = function (element) {
    if (element != null) {
        while (element.firstChild != null) {
            element.removeChild(element.firstChild);
        }
    }
};

DCDomTools.setActive = function (element) {
    //alert(element.focus);
    if (element == null) {
        return;
    }
    var flag = false;
    if (element.focus) {
        element.focus();
        flag = true;
    }
    if (element.setActive) {
        try {
            element.setActive();
            flag = true;
        }
        catch (ext) {
        }
    }
    if (flag) {
        return;
    }
    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        if (element.childNodes[iCount].focus) {
            element.childNodes[iCount].focus();
            return;
        }
    }
    if (this.isChrome) {
        var input = element.ownerDocument.createElement("input");
        input.setAttribute("type", "input");
        element.appendChild(input);
        input.focus();
        element.removeChild(input);
        return;
    }
};

DCDomTools.ScrollIntoView = function (element) {
    if (element == null) {
        return;
    }
    //    if (element.scrollIntoView) {
    //        element.scrollIntoView();
    //        return;
    //    }
    if (element.getAttribute("dc_type") != null) {
        var a = 0;
    }
    var p = element.parentNode;
    var pos = element.offsetTop;
    while (p != null && p.style) {
        if (p.style.overflowY == "auto" || p.style.overflowY == "scroll" || p == document.body) {
            p.scrollTop = pos - p.clientHeight * 0.4;
            return;
        }
        pos = pos + p.offsetTop;
        p = p.offsetParent;
    }
    //alert(element.offsetTop);
    p = element.offsetParent;
    if (p != null) {
        p.scrollTop = element.offsetTop;
    }
};

// 获得元素在文档中的绝对坐标边界矩形
DCDomTools.GetAbsBoundsInDocument = function (element) {
    var result = new Object();
    result.Left = 0;
    result.Top = 0;
    result.Width = 0;
    result.Height = 0;
    result.Right = 0;
    result.Bottom = 0;
    if (element != null) {
        result.Left = DCDomTools.GetViewLeftInDocument(element);
        result.Top = DCDomTools.GetViewTopInDocument(element);
        result.Width = element.offsetWidth;
        result.Height = element.offsetHeight;
    }
    result.Right = result.Left + result.Width;
    result.Bottom = result.Top + result.Height;

    return result;
};

DCDomTools.GetViewLeftInDocument = function (element) {
    if (element == null) {
        return 0;
    }
    var p = element;
    var result = 0;
    var rate = 1.0;
    while (p != null && p.tagName != "BODY") {
//        if (p.offsetParent != null) {
//            rate = parseFloat(p.offsetParent.style.zoom);
//            if (isNaN(rate) == true) {
//                rate = 1.0;
//            }
//        }
        result = result + p.offsetLeft * rate;
        p = p.offsetParent;
    }
    if (document.body.offsetLeft) {
        result += document.body.offsetLeft;
    }
    return result;
};

DCDomTools.GetViewTopInDocument = function (element) {
    if (element == null) {
        return 0;
    }
    var p = element;
    var result = 0;
    var rate = 1.0;
    while (p != null && p.tagName != "BODY") {
//        if (p.offsetParent != null) {
//            rate = parseFloat(p.offsetParent.style.zoom);
//            if (isNaN(rate) == true) {
//                rate = 1.0;
//            }
//        }
        result = result + p.offsetTop * rate;
        p = p.offsetParent;
    }
    if (document.body.offsetTop) {
        result += document.body.offsetTop;
    }
    return result;
};

//
// 获得元素的内部的HTML代码文本
//
DCDomTools.GetOuterHTML = function (element) {
    if (element == null) {
        return null;
    }
    if (element.outerHTML) {
        return element.outerHTML;
    }
    if (element.nodeName == "#text") {
        return element.nodeValue;
    }

    var result = "<" + element.nodeName + " ";
    for (var iCount = 0; iCount < element.attributes.length; iCount++) {
        var name = element.attributes[iCount].nodeName;
        var v = element.attributes[iCount].nodeValue;
        result = result + " " + name + "=\"" + v + "\"";
    }
    result = result + ">" + DCDomTools.GetInnerHTML(element) + "<\\" + element.nodeName + ">";
    return result;
};

//
// 获得元素的内部的HTML代码文本
//
DCDomTools.GetInnerHTML = function (element) {
    if (element == null) {
        return null;
    }
    var result = element.innerHTML;
    //alert(resul);
    return result;
};

//wyc20200528：判断该P标签的段落是否是只包含一个换行的空白段落
DCDomTools.IsLineBreakParagraph = function (element) {
    if (element == null || element == undefined) {
        return false;
    }
    if (element.nodeName == "P" &&
        ((element.childNodes.length == 1 && element.childNodes[0].nodeName == "BR")
            || (element.childNodes.length == 1 && element.childNodes[0].nodeName == "SPAN" && element.childNodes[0].childNodes.length == 1 && element.childNodes[0].childNodes[0].nodeName == "BR"))) {
        return true;
    } else {
        return false;
    }
};

//
// 获得元素的内部的纯文本
//
DCDomTools.GetInnerText = function (element) {
    if (element == null) {
        return null;
    }
    var result = "";
    //wyc20190506：添加判断若是输入域则从dc_innertext上取内容
    if (DCInputFieldManager.IsInputFieldElement(element) === true) {
        var innertext = element.getAttribute("dc_innertext");
        if (innertext !== null && innertext !== "" && innertext !== undefined) {
            result = innertext;
        }
    }
    //wyc20200527：针对单元格元素做特殊处理
    else if (element.nodeName == "TD") {
        for (var i = 0; i < element.childNodes.length; i++) {
            var tempelemenet = element.childNodes[i];

            if (DCDomTools.IsLineBreakParagraph(tempelemenet) == true) {
                //遇到内容完全为空白换行的段落，文本直接加上换行
                result = result + "\r\n";
            }
            else if (tempelemenet.nodeName == "P" && i != 0 && DCDomTools.IsLineBreakParagraph(tempelemenet.previousSibling) == false) {
                result = result + "\r\n" + tempelemenet.innerText;
            } else {
                result = result + tempelemenet.innerText;
            }
        }
    }
    //////////////////////////////////////////////////////////////
    else {
        result = element.innerText;//$(element).text();
    }
    result = result.replace(/\s/g, ' ');
    return result;
};

//
// 设置元素的内部的纯文本
//
DCDomTools.SetInnerText = function (element, text) {
    if (element == null) {
        return null;
    }
    //wyc20190506：添加判断若是输入域则连带修改dc_innertext
    if (DCInputFieldManager.IsInputFieldElement(element) === true) {
        element.setAttribute("dc_innertext", text);
    }
    //////////////////////////////////////////////////////////////
    //wyc20200311：若是单元格，采用特殊处理方式
    if (element.nodeName == "TD"
        /*&& element.parentElement.parentElement.parentElement.getAttribute("dctype") == "XTextTableElement"*/) {
        if (element.childNodes.length > 0 && element.childNodes[0].nodeName == "P") {
            var elementp = element.childNodes[0];
            var p = elementp.cloneNode(true);
            if (text == "") {//如果赋值为空字符则特殊处理
                p.innerHTML = "";
                element.innerHTML = "";
                var br = document.createElement("br");
                br.setAttribute("dcpf", "1");
                p.appendChild(br);
                element.appendChild(p);
                return;
            }
            text = text.replace(/ /g, "&ensp;");
            text = text.replace(/\r\n/g, "<br dcpf='1'>");
            text = text.replace(/\n/g, "<br dcpf='1'>");
            text = text.replace(/\r/g, "<br dcpf='1'>");
            var tszf = "<span>" + text + "</span>";
            var node = $(tszf)[0];
            p.innerHTML = "";
            p.appendChild(node);
            element.innerHTML = "";
            element.appendChild(p); 
        }
        if (element.getAttribute("id") != null) {
            DCWriterExpressionManager.ExecuteEffectExpression(element);
        }
        return;
    }
    /////////////////////////////////////////////
    $(element).text(text);
};


//
// 删除指定元素的所有子元素
// 
DCDomTools.ClearChild = function (element) {
    if (element != null) {
        while (element.firstChild != null) {
            element.removeChild(element.firstChild);
        }
    }
};

//
// 设置指定元素的内部HTML代码
// 
DCDomTools.SetInnerHTML = function (element, strHtml) {
    if (element.nodeName == "TD") {
        if (element.childNodes.length > 0 && element.childNodes[0].nodeName == "P") {
            var elementp = element.childNodes[0];
            var p = elementp.cloneNode(true);
            if (strHtml == "") {//如果赋值为空字符则特殊处理
                p.innerHTML = "";
                element.innerHTML = "";
                var br = document.createElement("br");
                br.setAttribute("dcpf", "1");
                p.appendChild(br);
                element.appendChild(p);
                return;
            }
            // 20200907 xym 添加表格的单元格支持html标签语言赋值
            text = WriterCommandModuleFormat.clearNoNeedText(strHtml, false, null, false, true);
            p.innerHTML = strHtml;
            element.innerHTML = "";
            element.appendChild(p); 
        }
        if (element.getAttribute("id") != null) {
            DCWriterExpressionManager.ExecuteEffectExpression(element);
        }
        return;
    }
    $(element).html(strHtml);
    
};

// 根据HTML代码创建文档节点
DCDomTools.createContextualFragment = function (html) {
    if (html == null || html.length == 0) {
        return null;
    }
    var range = document.createRange();
    var df = range.createContextualFragment(html);
    return df;
};

//
// 设置指定框架的元素的内部HTML代码
//
DCDomTools.SetFrameInnerHTML = function (frameElement, strHtml) {
    //alert(strHtml.length);
    if (frameElement != null && frameElement.contentWindow) {
        frameElement.contentWindow.document.write(strHtml);
        frameElement.contentWindow.document.close();
    }
};


//
// 设置指定框架元素的内容HTML代码
//
DCDomTools.GetFrameInnerHTML = function (frameElement) {
    if (frameElement != null && frameElement.contentWindow) {
        //var bodyElement = frameElement.contentWindow.document.body;
        var txt = frameElement.contentWindow.document.documentElement.innerHTML;
        txt = "<html>" + txt + "</html>";
        //alert(txt);
        return txt;
    }
    return null;
};

//
// 设置指定元素的内部HTML代码，并保持内容视图滚动不变
//
DCDomTools.SetInnerHTMLWithoutScroll = function (element, strHtml) {

    var fscrollLeft = element.scrollLeft;
    var fscrollTop = element.scrollTop;
    while (element.firstChild != null) {
        element.removeChild(element.firstChild);
    }
    if (strHtml != null) {
        if (this.isIE) {
            element.insertAdjacentHTML("afterBegin", strHtml);
        }
        else {
            var range = element.ownerDocument.createRange();
            range.selectNodeContents(element);
            range.collapse(true);
            var df = range.createContextualFragment(strHtml);
            element.appendChild(df);
        }
        element.scrollLeft = fscrollLeft;
        element.scrollTop = fscrollTop;
    }
};

// 在容器元素的指定位置插入HTML代码
DCDomTools.inertHTML = function (element, index, strHtml, htmlMode) {
    if (element == null) {
        return false;
    }
    
    var df = null;
    if (htmlMode) {
        // HTML模式
        var range = null;
        if (document.createRange) {
            range = document.createRange();
        } else if (document.body.createRange) {
            range = document.body.createRange();
        }
        if (range != null) {
            range.setStartBefore(element);
            if (range.createContextualFragment) {
                df = range.createContextualFragment(strHtml);
            }
        }
        // 20200804 xym 修复ie9以下出错问题
        if (df == null) {
            df = document.createDocumentFragment();
            var div = document.createElement("div");
            df.appendChild(div);
            div.outerHTML = strHtml;
        }
    } else {
        // 纯文本模式
        df = document.createTextNode(strHtml);
    }
    if (element.childNodes.length == 0) {
        // 没有子元素，则直接添加
        element.appendChild(df);
    } else {
        if (index <= 0) {
            // 插入到第一个位置
            element.insertBefore(df, element.firstChild);
        } else if (index >= element.childNodes.length) {
            // 追加内容
            element.appendChild(df);
        } else {
            // 插入到中间
            element.insertBefore(df, element.childNodes[index]);
        }
    }
};

//
// 在指定的位置插入HTML代码
//
DCDomTools.insertAdjacentHTML = function (element, where, strHtml) {
    if (strHtml != null) {
        if (element.insertAdjacentHTML) {
            element.insertAdjacentHTML(where, strHtml);
        }
        else {
            var range = document.createRange();
            range.setStartBefore(element);
            var df = range.createContextualFragment(strHtml);
            switch (where) {
                case "beforeBegin":
                    element.parentNode.insertBefore(df, element);
                    break;
                case "afterBegin":
                    element.insertBefore(df, element.firstChild);
                    break;
                case "beforeEnd":
                    element.appendChild(df);
                    break;
                case "afterEnd":
                    if (element.nextSibling == null)
                        element.parentNode.appendChild(df);
                    else
                        element.parentNode.insertBefore(df, element.nextSibling);
                    break;
            } //switch
        }
    }
};

//**************************************************************************************************************
// 获得节点在其父节点中的子节点序号
DCDomTools.GetNodeIndex = function (node) {
    if (node == null || node.parentNode == null) {
        return -1;
    }
    var nodes = node.parentNode.childNodes;
    for (var iCount = 0; iCount < nodes.length; iCount++) {
        if (nodes[iCount] == node) {
            return iCount;
        }
    }
    return -1;
};


//**************************************************************************************************************
// 移动插入点到指定元素前
DCDomTools.MoveCaretToIndex = function (element, index) {
    if (element == null) {
        return;
    }
    if (element.nodeName == "INPUT"
        || element.nodeName == "SELECT"
        || element.nodeName == "TEXTAREA") {
        if (element.focus) {
            element.focus();
        }
        if (element.select) {
            element.select();
        }
        if (element.setActive) {
            element.setActive();
        }
        if (element.value != null) {
            var len = element.value.length;
            if (index >= 0 && index <= len) {
                if (element.type == "text" || element.type == "password") {
                    element.selectionStart = index;
                    element.selectionEnd = index;
                }
            }
        }
    }
    else {
        var sParent = element.parentNode;
        while (sParent != null) {
            if (sParent.clientHeight < sParent.scrollHeight) {
                break;
            }
            sParent = sParent.parentNode;
        }
        if (sParent == null) {
            sParent = document.body;
        }
        var sLeft = sParent.scrollLeft;
        var sTop = sParent.scrollTop;
        if (element.focus) {
            element.focus();
        }
        if (element.getClientRects) {
            var node2 = element;
            if (index >= 0 && index < element.childNodes.length) {
                node2 = element.childNodes[index];
                if (!node2.getClientRects) {
                    node2 = element;
                }
            }
            var rects = node2.getClientRects();
            if (rects.length > 0) {
                var sel2 = DCDomTools.getSelection();
                var range = null;
                if (document.createRange) {
                    range = document.createRange();
                }
                else if (document.body.createRange) {
                    range = document.body.createRange();
                }
                //                if (range.moveToPoint) {
                //                    range.moveToPoint(
                //                        rects[0].left + document.body.scrollLeft,
                //                        rects[0].top + document.body.scrollTop);
                //                    sel2.addRange(range);
                //                    return;
                //                }
            }
        }

        var sel = DCDomTools.getSelection();
        //var range = document.createRange();
        //range.setStart(element, index);
        //sel.removeAllRanges();
        //sel.addRange(range);
        //sel.collapseToStart();
        if (sel.collapse) {
            sel.collapse(element, index);
        }

        if (sel.anchorNode == null) {
            sel = DCDomTools.getSelection();
            var range = null;
            if (document.createRange) {
                range = document.createRange();
            }
            else {
                range = sel.createRange();
            }
            if (range.setStart) {
                range.setStart(element, index);
            }
            else {
                // 插入一个临时的按钮 
                if (element.nodeName != "#text") {
                    var btn = document.createElement("input");
                    btn.type = "button";
                    DCDomTools.insertChildNode(element, index, btn);
                    if (btn.focus) {
                        btn.focus();
                    }
                    if (btn.setActive) {
                        btn.setActive();
                    }
                    element.removeChild(btn);
                }
            }
            //            else if (range.moveToElementText) {
            //                range.moveToElementText(element);
            //            }
            if (sel.removeAllRanges) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
        sParent.scrollLeft = sLeft;
        sParent.scrollTop = sTop;
    }
    return;
};

//**************************************************************************************************************
// 移动插入点到指定元素前
DCDomTools.MoveCaretTo = function (element) {
    if (element == null) {
        return;
    }
    var sel = DCDomTools.getSelection();
    if (sel.collapse
        && sel.baseOffset && sel.extentOffset && sel.baseOffset == sel.extentOffset) {//WYC20190924：添加条件只有当选区为0时才移动光标
        try {
            sel.collapse(element, 0);
            return;
        }
        catch (e) {
        }
        try {
            // 在IE中曾经报错。
            var range = document.createRange();
            range.selectNode(element);
            sel.removeAllRanges();

            sel.addRange(range);
        }
        catch (e) {

        }
        return;
        //        if (element.nodeName == "SELECT" || element.nodeName == "INPUT") {
        //            var p = element.parentNode;
        //            var index = DCDomTools.GetNodeIndex(element);
        //            sel.colapse(p, index);
        //        }
        //        else {
        //            sel.collapse(element, 0);
        //        }
    }
    else if (sel.createRange){//WYC20190926：当双击时导致产生选区，此处可能会报错
        var rng = sel.createRange();
        if (element.nodeType == 1
            && rng.moveToElementText) {
            rng.moveToElementText(element.parentNode);
            //rng.select();
            rng.collapse(false);
        }
        else {
            if (element.focus) {
                element.focus();
            }
            if (element.setActive) {
                element.setActive();
            }
        }
    }
    return;
};

//**************************************************************************************************************
// 移动插入点到指定元素后
DCDomTools.MoveCaretToEnd = function (element) {
    if (element == null) {
        return;
    }
    var sel = DCDomTools.getSelection();
    if (sel.collapse) {
        var index = 0;
        if (element.nodeName == "#text") {
            var txt = element.nodeValue;
            if (txt == null || txt.length == 0) {
                sel.collapse(element, 0);
            }
            else {
                sel.collapse(element, txt.length);
            }
        }
        else if (element.nodeName == "INPUT"
            && element.type == "text"
            || element.nodeName == "TEXTAREA") {
            element.focus();
            element.select();
            var txt = element.value;
            if (txt != null || txt.length > 0) {
                element.selectionStart = txt.length;
                element.selectionEnd = txt.length;
            }
        }
        else if (element.nodeName == "TABLE") {
            var index = DCDomTools.GetNodeIndex(element) + 1;
            sel.collapse(element.parentNode, index);
        }
        else {
            var child = element.lastChild;
            while (child != null) {
                if (child.nodeName == "#text") {
                    DCDomTools.MoveCaretToEnd(child);
                    return;
                }
                else if (child.nodeName == "INPUT" && child.type == "text"
                    || child.nodeName == "TEXTAREA") {
                    DCDomTools.MoveCaretToEnd(child);
                    return;
                }
                child = child.lastChild;
            }//while
            sel.collapse(element, element.childNodes.length);
        }
    }
    else {
        var rng = document.body.createTextRange();
        if (rng && rng.moveToElementText) {
            try {
                if (element.nodeType == 3) {
                    rng.moveToElementText(element.parentNode);
                }
                else {
                    rng.moveToElementText(element);
                }
            }
            catch (ext) {
                //debugger;
            }
            var nodes = element.parentNode.childNodes;
            var pos = 0;
            for (var iCount = 0; iCount < nodes.length; iCount++) {
                if (nodes[iCount].nodeType == 1) {
                    var txt = nodes[iCount].innerText;
                    if (txt != null) {
                        pos = pos + txt.length;
                    }
                }
                else if (nodes[iCount].nodeType == 3) {
                    pos = pos + nodes[iCount].nodeValue.length;
                }
                if (nodes[iCount] == element) {
                    break;
                }
            }//for

            rng.move("character", pos);
            rng.select();
            rng.collapse();
            rng.select();
        }
        else
        {
            var span = document.createElement("span");
            element.parentNode.insertAdjacentElement("afterEnd", span);
            if (span.focus) {
                span.focus();
            }
            if (span.setActive) {
                span.setActive();
            }
            span.parentNode.removeChild(span);
        }
    }
    return;
};

//**************************************************************************************************************
// 获得选中区域信息对象
DCDomTools.getSelection = function (element) {
    var doc = document;
    if (element != null) {
        if (element.nodeName == "#document") {
            doc = element;
        }
        else {
            doc = element.ownerDocument;
        }
    }
    if (doc == null) {
        doc = document;
    }
    if (doc.getSelection) {
        return doc.getSelection();
    }
    if (doc.selection) {
        return doc.selection;
    }
    if (doc.parentWindow) {
        if (doc.parentWindow.getSelection) {
            return doc.parentWindow.getSelection();
        }
    }
    if (window.getSelection) {
        return window.getSelection();
    }
    return null;
};

DCDomTools.clearSelection = function () {
    var sel = DCDomTools.getSelection(null);
    if (sel != null) {
        if (sel.anchorNode == sel.focusNode
            && sel.anchorOffset == sel.focusOffset) {
            // 无需操作
            return;
        }
        if (sel.collapseToStart) {
            sel.collapseToStart();
        }
        else if (sel.createTextRange) {
            var rng = sel.createTextRange();
            rng.collapse(true);
        }
    }
};

DCDomTools.hasSelection = function () {

    var sel = DCDomTools.getSelection();
    if (sel == null) {
        return false;
    }
    if (sel.getRangeAt) {
        var rng = sel.getRangeAt(0);
        if (rng.startContainer == rng.endContainer
            && rng.startOffset == rng.endOffset) {
            return true;
        }
    }
    return false;
};
//***********************************************************************************
// 获得被选中的所有节点
// 徐逸铭 徐逸铭 2019-5-24
DCDomTools.getSelectAlldoms = function () {
    var sel = DCDomTools.getSelection();
    if (sel == null) {
        return false;
    }
    if (sel.getRangeAt) {
        var range = sel.getRangeAt(0);
        var dom = range.commonAncestorContainer; //dom节点
        //如果只有文本
        if (dom.nodeName == "#text") {
            var lastArr = [];
            lastArr.push(dom.parentElement);
            return lastArr;
        }
        var start_index, end_index;
        //***************************************
        var endNode = range.endContainer;
        if (endNode.nodeName == "#text") {
            if (endNode.nodeType == 3 && endNode.length > range.endOffset && range.endOffset > 0) {
                // 拆分结尾文本节点
                var node2 = endNode.splitText(range.endOffset);
            }
        }
        var startNode = range.startContainer;
        if (startNode.nodeName == "#text") {
            if (startNode.nodeType == 3 && startNode.length > range.startOffset && range.startOffset > 0) {
                // 拆分起始文本节点
                var node2 = startNode.splitText(range.startOffset);
                if (startNode == endNode) {
                    endNode = node2;
                }
                startNode = node2;
            }
        }
        //****************************************
        if (startNode.nodeName == "#text" && startNode.parentElement.innerText != startNode.nodeValue) {
            if (startNode.nextElementSibling) {
                $(startNode.nextElementSibling).prepend($(startNode));
                startNode.nextElementSibling.normalize();
            } else {
                $(startNode).wrap("<span></span>");
            }
        }
        if (endNode.nodeName == "#text" && endNode.parentElement.innerText != endNode.nodeValue) {
            if (endNode.previousElementSibling) {
                $(endNode.previousElementSibling).append($(endNode));
                endNode.previousElementSibling.normalize();
            } else {
                $(endNode).wrap("<span></span>");
            }
        }
        var domArr = [];
        getAlldom(dom, domArr);
        for (var i = 0; i < domArr.length; i++) {
            if (startNode.nodeName == "#text") {
                if (startNode.parentElement == domArr[i]) {
                    start_index = i;
                }
            } else {
                if (startNode.children.length > 0) {
                    var startArr = [];
                    getAlldom(startNode, startArr)
                    if (startArr[startArr.length - 1] == domArr[i]) {
                        start_index = i;
                    }
                } else {
                    start_index = i;
                }
            }
            if (endNode.nodeName == "#text") {
                if (endNode.parentElement == domArr[i]) {
                    end_index = i;
                }
            } else {
                if (endNode.children.length > 0) {
                    var endArr = [];
                    getAlldom(endNode, endArr)
                    if (endArr[endArr.length - 1] == domArr[i]) {
                        end_index = i;
                    }
                } else {
                    end_index = i;
                }
            }
        }
        //console.log(start_index, end_index)
        var lastArr = [];
        if (startNode != dom) {
            for (var i = 0; i < domArr.length; i++) {
                if (i >= start_index && i <= end_index) {
                    lastArr.push(domArr[i]);
                }
            }
        } else {//全选
            lastArr = domArr;
        }
        //如果结束部分文本节点被拆分
        if (endNode.nodeType == 3 && endNode.length > range.endOffset && range.endOffset > 0) {
            lastArr.splice($.inArray(endNode.parentElement.parentElement, lastArr), 1);
        }
        //开始没有选择文本
        if (startNode.length == range.startOffset) {
            if (startNode.nodeName == "#text") {
                lastArr.splice($.inArray(startNode.parentElement, lastArr), 1);
            } else {
                lastArr.splice($.inArray(startNode, lastArr), 1);
            }
        }
        //结束没有选择文本
        if (range.endOffset == 0) {
            if (endNode.nodeName == "#text") {
                lastArr.splice($.inArray(endNode.parentElement, lastArr), 1);
            } else {
                lastArr.splice($.inArray(endNode, lastArr), 1);
            }
        }
        //保存父节点
        //lastArr.unshift(dom);
        //console.log(lastArr);
        return lastArr;
    }
    function getAlldom(dom, domArr) {
        for (var i = 0; i < dom.children.length; i++) {
            domArr.push(dom.children[i]);
            if (dom.children[i].children.length > 0) {
                getAlldom(dom.children[i], domArr);
            }
        }
    }
}
//***********************************************************************************
// 判断插入点是否在指定容器中
DCDomTools.ContainsSelection = function (element) {
    var sel = DCDomTools.getSelection(element);
    if (sel.focusNode != null) {
        var node = sel.focusNode;
        while (node != null) {
            if (node == element) {
                return true;
            }
            node = node.parentNode;
        }
    }
    return false;
};

DCDomTools.FillFrameContentNotAsync = function (frameElement, url , funcFilter ) {
    var result = false;
    $.ajax(url, DCDomTools.fixAjaxSettings( { async: false, method: "POST", type: "POST" })).done(function (data, textStatus, jqXHR) {
        if (data.responseText) {
            data = data.responseText;
        }
        if (typeof (funcFilter) == "function") {
            data = funcFilter(data);
        }
        DCDomTools.SetFrameInnerHTML(frameElement, data);
        result = true;
    });
    return result;
};

//WYC20191030:颜(我)色(抄)RGB(抄)与(抄)HEX(抄)转(抄)换(抄)
DCDomTools.colorRGBToHex = function (colorRGBString) {
    var that = colorRGBString;
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (/^(rgb|RGB)/.test(that)) {
        var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
        var strHex = "#";
        for (var i = 0; i < aColor.length; i++) {
            var hex = Number(aColor[i]).toString(16);
            if (hex === "0") {
                hex += hex;
            }
            strHex += hex;
        }
        if (strHex.length !== 7) {
            strHex = that;
        }
        return strHex;
    } else if (reg.test(that)) {
        var aNum = that.replace(/#/, "").split("");
        if (aNum.length === 6) {
            return that;
        } else if (aNum.length === 3) {
            var numHex = "#";
            for (var i = 0; i < aNum.length; i += 1) {
                numHex += (aNum[i] + aNum[i]);
            }
            return numHex;
        }
    }
    return that;
};
DCDomTools.colorHexToRGB = function (colorHexString) {
    var sColor = colorHexString.toLowerCase();
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return "RGB(" + sColorChange.join(",") + ")";
    }
    return sColor;
};
//-------------------------------------------------
DCDomTools.GetSizeFromSpecifyFont = function (fontname, fontsize) {
    var fn = "";
    var fs = "";
    if (fontname !== undefined && fontname !== null && fontname !== "") {
        fn = fontname;
    }
    if (fontsize !== undefined && fontsize !== null && fontsize !== "") {
        fs = fontsize;
    }
    var span = document.createElement("span");
    span.id="spanformeasure"
    span.innerText = "H";
    span.style.fontSize = fs;
    span.style.fontFamily = fn;
    document.body.appendChild(span);
    var length = span.offsetHeight;
    document.body.removeChild(span);
    return length;
};

//WYC20191216:处理按钮元素在前端切换图片数据
DCDomTools.ProcessButtonImg = function (element, eventname) {
    if (element == null || element.nodeName != "INPUT") {
        return;
    }
    var img64data = element.getAttribute("dc_imgbase64");
    var img64dataforover = element.getAttribute("dc_imgbase64forover");
    var img64datafordown = element.getAttribute("dc_imgbase64fordown");
    
    switch (eventname) {
        case "onload":
            if (img64data != null && img64data.length > 0) {
                element.style.backgroundImage = "url('data:image/png;base64, " + img64data + "')";
            }
            break;
        case "onmouseenter":
            if (img64dataforover != null && img64dataforover.length > 0) {
                element.style.backgroundImage = "url('data:image/png;base64, " + img64dataforover + "')";
            }
            break;
        case "onmouseleave":
            if (img64data != null && img64data.length > 0) {
                element.style.backgroundImage = "url('data:image/png;base64, " + img64data + "')";
            }
            break;
        case "onmousedown":
            if (img64datafordown != null && img64datafordown.length > 0) {
                element.style.backgroundImage = "url('data:image/png;base64, " + img64datafordown + "')";
            }
            break;
        case "onmouseup":
            if (img64data != null && img64data.length > 0) {
                var lastimg = "";
                if (element.focus) {
                    lastimg = img64dataforover;
                } else {
                    lastimg = img64data;
                }
                element.style.backgroundImage = "url('data:image/png;base64, " + lastimg + "')";
            }
            break;
        default:
            break;
    }
};

//WYC20191222：反转HTML元素的可见性
DCDomTools.ReverseElementVisibility = function (element) {
    //var element = document.WriterControl.GetContentDocument().getElementById(id);
    if (element != null && element.style) {
        if (element.style.display !== "none") {
            element.style.display = "none";
        } else {
            element.style.display = "";
        }
    }
};

//WYC20200915：处理html去除p元素将其子元素暴露出来
DCDomTools.RemoveHtmlParagraphElement = function (strHTML) {
    var div = document.createElement("div");
    div.innerHTML = strHTML;
    var ps = div.querySelectorAll("p");
    if (ps == null || ps.length > 1 || ps.length == 0) {
        return strHTML;
    } else {
        var tempdiv = document.createElement("div");
        for (var i = 0; i < div.childNodes.length; i++) {
            var node = div.childNodes[i].cloneNode(true);
            if (node.nodeName == "P") {
                for (var j = 0; j < node.childNodes.length; j++) {
                    tempdiv.appendChild(node.childNodes[j].cloneNode(true));
                }
            } else {
                tempdiv.appendChild(node);
            }
        }
        return tempdiv.innerHTML;
    }
};

//wyc20201116添加两个临时函数用于保存session内容，需要判断如果窗体顶层位于其它框架内则改变保存位置试图避开跨域问题
DCDomTools.GetDCSessionID20201022 = function () {
    var strCookie = document.cookie;
    if (strCookie != null && strCookie.length > 0) {
        var index = strCookie.indexOf("SessionId");
        if (index > 0) {

        }
    }
    if (window.top == window.self) {
        return window.top.dc_sessionid20201022;
    } else if (window.localStorage) {
        return window.localStorage["dc_sessionid20201022"];
    } else {
        return null;
    }
};
DCDomTools.SetDCSessionID20201022 = function (value) {
    if (window.top == window.self) {
        window.top.dc_sessionid20201022 = value;
    } else if (window.localStorage) {
        window.localStorage["dc_sessionid20201022"] = value;
    }
};
//wyc20201123:新增函数对movecaretto函数进行前处理与后处理，将表单模式下的属性暂时放开，避免69版本的火狐浏览器的兼容性问题
DCDomTools.processMoveCaret = function (type) {
    if (document.WriterControl) {
        var win = document.WriterControl.GetContentWindow();
        if (win != null && win.DCWriterControllerEditor.IsFormView() == true) {
            var doc = document.WriterControl.GetContentDocument();
            var contenttable = doc.getElementById("dctable_AllContent");
            var tr = contenttable.querySelector("tr");
            if (type == "pre") {
                tr.setAttribute("contenteditable", "true");
            } else if (type == "post") {
                tr.setAttribute("contenteditable", "false");
            }
        }
    }
};

//wyc20210121:调整设置元素四维边框的代码
DCDomTools.SetElementBorder = function (element, options) {
    if (element.hasAttribute == null || element.hasAttribute("dctype") == false) {
        return;
    }
    if (document.WriterControl != null) {
        var bleft = true;
        var bleftcolor = "";
        var bright = true;
        var brightcolor = "";
        var bbottom = true;
        var bbottomcolor = "";
        var btop = true;
        var btopcolor = "";
        var bwidth = "1px";
        var showNoneBorder = document.WriterControl.DocumentOptions.ViewOptions.ShowCellNoneBorder;

        var hassetborderstyle = false;
        if (options.BorderStyle &&
            (options.BorderStyle == "Dash" || options.BorderStyle == "Dot")) {
            hassetborderstyle = true;
        }
        var runtimeborderstyle = null;
        if (hassetborderstyle == false) {
            runtimeborderstyle = "solid";
        } else if (options.BorderStyle == "Dash") {
            runtimeborderstyle = "dashed";
        } else if (options.BorderStyle == "Dot") {
            runtimeborderstyle = "dotted";
        } else {
            runtimeborderstyle = "solid";
        }

        if (options.BorderWidth) {
            var i = parseInt(options.BorderWidth);
            if (i !== null && i !== undefined) {
                bwidth = i.toString() + "px";
            }
        }

        if (options.BorderLeft != null) {
            if (options.BorderLeft === "false" || options.BorderLeft === false) {
                bleft = false;
            } else if (options.BorderLeft === "true" || options.BorderLeft === true) {
                bleft = true;
            }
        }
        if (options.BorderRight != null) {
            if (options.BorderRight === "false" || options.BorderRight === false) {
                bright = false;
            } else if (options.BorderRight === "true" || options.BorderRight === true) {
                bright = true;
            }
        }
        if (options.BorderTop != null) {
            if (options.BorderTop === "false" || options.BorderTop === false) {
                btop = false;
            } else if (options.BorderTop === "true" || options.BorderTop === true) {
                btop = true;
            }
        }
        if (options.BorderBottom != null) {
            if (options.BorderBottom === "false" || options.BorderBottom === false) {
                bbottom = false;
            } else if (options.BorderBottom === "true" || options.BorderBottom === true) {
                bbottom = true;
            }
        }


        if (options.BorderLeftColor) {
            bleftcolor = options.BorderLeftColor;
        }
        if (options.BorderRightColor) {
            brightcolor = options.BorderRightColor;
        }
        if (options.BorderTopColor) {
            btopcolor = options.BorderTopColor;
        }
        if (options.BorderBottomColor) {
            bbottomcolor = options.BorderBottomColor;
        }

        if (bleft) {
            element.style.borderLeftWidth = bwidth;
            element.style.borderLeftStyle = runtimeborderstyle;
            element.style.borderLeftColor = bleftcolor;
        } else if (showNoneBorder) {
            element.style.borderLeftWidth = "1px";
            element.style.borderLeftStyle = runtimeborderstyle;
            element.style.borderLeftColor = "#D3D3D3";
        } else {
            element.style.borderLeftStyle = "none";
        }

        if (bright) {
            element.style.borderRightWidth = bwidth;
            element.style.borderRightStyle = runtimeborderstyle;
            element.style.borderRightColor = brightcolor;
        } else if (showNoneBorder) {
            element.style.borderRightWidth = "1px";
            element.style.borderRightStyle = runtimeborderstyle;
            element.style.borderRightColor = "D3D3D3";
        } else {
            element.style.borderRightStyle = "none";
        }

        if (btop) {
            element.style.borderTopWidth = bwidth;
            element.style.borderTopStyle = runtimeborderstyle;
            element.style.borderTopColor = btopcolor;
        } else if (showNoneBorder) {
            element.style.borderTopWidth = "1px";
            element.style.borderTopStyle = runtimeborderstyle;
            element.style.borderTopColor = "D3D3D3";
        } else {
            element.style.borderTopStyle = "none";
        }
        if (bbottom) {
            element.style.borderBottomWidth = bwidth;
            element.style.borderBottomStyle = runtimeborderstyle;
            element.style.borderBottomColor = bbottomcolor;
        } else if (showNoneBorder) {
            element.style.borderBottomWidth = "1px";
            element.style.borderBottomStyle = runtimeborderstyle;
            element.style.borderBottomColor = "D3D3D3";
        } else {
            element.style.borderBottomStyle = "none";
        }

        //拼接bd2019字符串用于组合边框信息
        var colorstring = "";
        var bdresult = "";
        if (bleftcolor == brightcolor
            && brightcolor == btopcolor
            && btopcolor == bbottomcolor) {
            colorstring = bleftcolor;
        } else {
            colorstring = bleftcolor + "," + btopcolor + "," + brightcolor + "," + bbottomcolor;
        }
        bdresult = colorstring + "|";
        if (bleft) {
            bdresult = bdresult + "1";
        } else {
            bdresult = bdresult + "0";
        }
        if (btop) {
            bdresult = bdresult + "1";
        } else {
            bdresult = bdresult + "0";
        }
        if (bright) {
            bdresult = bdresult + "1";
        } else {
            bdresult = bdresult + "0";
        }
        if (bbottom) {
            bdresult = bdresult + "1";
        } else {
            bdresult = bdresult + "0";
        }
        bdresult = bdresult + "|" + bwidth.replace("px", "");
        if (hassetborderstyle == true) {
            bdresult = bdresult + "|" + options.BorderStyle;
        }
        element.setAttribute("bd2019", bdresult);
    }
};

//wyc20210127:获取文档元素的自定义Attributes，将后端传递的name:value对转换成前端直接使用的JSON对象
DCDomTools.GetElementCustomAttributes = function (element) {
    if (element.hasAttribute && element.hasAttribute("dc_attributes") == false) {
        return null;
    }
    var resultobj = new Object();
    var obj = JSON.parse(element.getAttribute("dc_attributes"));
    if (obj == null || Array.isArray(obj) == false) {
        return null;
    }
    for (var i = 0; i < obj.length; i++) {
        var o = obj[i];
        if (o.Name) {
            resultobj[o.Name] = o.Value;
        }
    }
    return resultobj;
};
//wyc20210127:设置文档元素的自定义Attributes，将前端直接使用的JSON对象转换成后端识别的name:value对字符串
DCDomTools.SetElementCustomAttributes = function (element, obj) {
    if (typeof (obj) !== "object" || element == undefined || element.setAttribute == undefined) {
        return false;
    }
    var resultobj = new Array();
    for (var i in obj) {
        var o = new Object();
        o.Name = i;
        o.Value = obj[i].toString();
        resultobj.push(o);
    }
    element.setAttribute("dc_attributes", JSON.stringify(resultobj));
};

//  json2.js
//  2017-06-12

if (typeof JSON !== "object") {
    JSON = {};
}
(function () {
    "use strict";
    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    function f(n) {
        return (n < 10) ? "0" + n : n;
    }
    function this_value() {
        return this.valueOf();
    }
    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? (
                    this.getUTCFullYear()
                    + "-"
                    + f(this.getUTCMonth() + 1)
                    + "-"
                    + f(this.getUTCDate())
                    + "T"
                    + f(this.getUTCHours())
                    + ":"
                    + f(this.getUTCMinutes())
                    + ":"
                    + f(this.getUTCSeconds())
                    + "Z"
                )
                : null;
        };
        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }
    var gap;
    var indent;
    var meta;
    var rep;
    function quote(string) {
        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }
    function str(key, holder) {
        var i;
        var k;
        var v;
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];
        if (
            value
            && typeof value === "object"
            && typeof value.toJSON === "function"
        ) {
            value = value.toJSON(key);
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case "string":
                return quote(value);
            case "number":
                return (isFinite(value)) ? String(value) : "null";
            case "boolean":
            case "null":
                return String(value);
            case "object":
                if (!value) {
                    return "null";
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === "[object Array]") {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null";
                    }
                    v = partial.length === 0
                        ? "[]"
                        : gap
                            ? (
                                "[\n"
                                + gap
                                + partial.join(",\n" + gap)
                                + "\n"
                                + mind
                                + "]"
                            )
                            : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    (gap)
                                        ? ": "
                                        : ":"
                                ) + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (
                                    (gap)
                                        ? ": "
                                        : ":"
                                ) + v);
                            }
                        }
                    }
                }
                v = partial.length === 0
                    ? "{}"
                    : gap
                        ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                        : "{" + partial.join(",") + "}";
                gap = mind;
                return v;
        }
    }
    if (typeof JSON.stringify !== "function") {
        meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }
            } else if (typeof space === "string") {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (
                typeof replacer !== "object"
                || typeof replacer.length !== "number"
            )) {
                throw new Error("JSON.stringify");
            }

            return str("", { "": value });
        };
    }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {
            var j;

            function walk(holder, key) {
                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return (
                        "\\u"
                        + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                    );
                });
            }
            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {
                j = eval("(" + text + ")");
                return (typeof reviver === "function")
                    ? walk({ "": j }, "")
                    : j;
            }
            throw new SyntaxError("JSON.parse");
        };
    }
}());

// 返回指定类型的全部节点的数组
DCDomTools.allChildNodes = function (node, type) {
    // 1.创建全部节点的数组
    var allCN = [];
    // 2.递归获取全部节点
    var getAllChildNodes = function (node, type, allCN) {
        // 获取当前元素所有的子节点nodes
        var nodes = node.childNodes;
        // 获取nodes的子节点
        for (var i = 0; i < nodes.length; i++) {
            var child = nodes[i];
            // 判断是否为指定类型节点
            if (child.nodeType == type) {
                allCN.push(child);
            }
            getAllChildNodes(child, type, allCN);
        }
    }
    getAllChildNodes(node, type, allCN);
    // 3.返回全部节点的数组
    return allCN;
}

// 当前选中的文本节点
DCDomTools.selectNodes = function () {
    var needChangeArr = [];//needChangeArr存储选中的文本节点
    var lastArr = DCDomTools.GetSelectionNodes();
    if (lastArr.length == 0) {
        return lastArr;
    }
    var lastNode = lastArr.length - 1 >=0 ? lastArr[lastArr.length - 1] : null;
    if (lastNode != null && lastNode.nodeName != "#text") {
        lastArr = $.merge(lastArr, DCDomTools.allChildNodes(lastNode, 3));
    }
    var range = DCDomTools.getSelectionRange();
    if (range == null || range.cloneContents == null) {//20200824 xym 解决移动端输入文字报错问题
        return [];
    }
    if (range.startContainer != null && range.startContainer.nodeType == 3 && range.startContainer.textContent.length == range.startOffset && $.inArray(range.startContainer, lastArr) >= 0) {
        lastArr.splice($.inArray(range.startContainer, lastArr), 1);
    }
    if (range.endContainer != null && range.endOffset == 0) {
        var endArr = DCDomTools.allChildNodes(range.endContainer, 3);
        for (var i = 0; i < endArr.length; i++) {
            if ($.inArray(endArr[i], lastArr) >= 0) {
                lastArr.splice($.inArray(endArr[i], lastArr), 1);
            }
        }
        
    }
    var cloneDom = range.cloneContents();
    var div = $("<div></div>").append(cloneDom);
    var otherArr = DCDomTools.allChildNodes(div[0], 3);//存储选中的复制的文本节点
    for (var i = 0; i < otherArr.length; i++) {
        otherArr.splice(i, 1, otherArr[i].textContent);
    }
    for (var index = 0; index < lastArr.length; index++) {
        if (lastArr[index].nodeName == "#text" && $.inArray(lastArr[index].textContent, otherArr) >= 0) {//判断文本节点是否选中
            needChangeArr.push(lastArr[index]);
        }
    }
    return needChangeArr;
}

// 不可以删除的元素
DCDomTools.noDeleteNodes = function () {
    var noDelete = [];
    var selectNodes = DCDomTools.selectNodes();
    for (var i = 0; i < selectNodes.length; i++) {
        var noDeleteNode = $(selectNodes[i]).parents("[dc_deleteable='false']");
        if (noDeleteNode.length > 0 && $.inArray(noDeleteNode[0], noDelete) < 0) {
            var textArr = DCDomTools.allChildNodes(noDeleteNode[0], 3);
            var isFullSelect = true;
            for (var j = 0; j < textArr.length; j++) {
                if ($.inArray(textArr[j], selectNodes) < 0) {
                    isFullSelect = false;
                }
            }
            if (isFullSelect) {
                var needPush = true;
                $(noDeleteNode[0]).parents("[dc_deleteable='false']").each(function(){
                    if ($.inArray(this, noDelete) >= 0) {
                        needPush = false;
                    }
                })
                if (needPush) {
                    if (noDeleteNode[0].getAttribute("dctype") == "XTextCheckBoxElementBaseLabel") {
                        var isLeft = true;
                        if (noDeleteNode[0].firstChild.nodeName == "#text") {
                            isLeft = false;
                        }
                        if (isLeft) {
                            noDelete.push($(noDeleteNode[0]).prev()[0]);
                            noDelete.push(noDeleteNode[0]);
                        } else {
                            noDelete.push(noDeleteNode[0]);
                            noDelete.push($(noDeleteNode[0]).next()[0]);
                        }
                    } else {
                        noDelete.push(noDeleteNode[0]);
                    }
                }
            }
        }
    }
    return noDelete;
}

// 自定义删除接口
DCDomTools.delectNode = function (insertBr) {
    if (insertBr == null) {
        insertBr = false;
    }
    DCDomTools.completeEvent();
    var noDeleteNodes = DCDomTools.noDeleteNodes();
    var selectNodes = DCDomTools.selectNodes();
    for (var i = 0; i < noDeleteNodes.length; i++) {
        var nodePar = $(noDeleteNodes[i]).parents("[dctype='XTextTableElement'],[dctype='XTextInputFieldElement']")[0];
        if (nodePar != null) {
            var textNodeArr1 = DCDomTools.allChildNodes(nodePar, 3);
            var flag = true;
            for (var j = 0; j < textNodeArr1.length; j++) {
                if ($.inArray(textNodeArr1[j], selectNodes) < 0) {
                    flag = false;
                }
            }
            if (!flag) {
                textNodeArr1 = [];
            }
        } else {
            var textNodeArr1 = [];
        }
        var textNodeArr2 = DCDomTools.allChildNodes(noDeleteNodes[i], 3);
        var textNodeArr = $.merge(textNodeArr1, textNodeArr2);
        for (var j = 0; j < textNodeArr.length; j++) {
            if ($.inArray(textNodeArr[j], selectNodes) >= 0) {
                selectNodes.splice($.inArray(textNodeArr[j], selectNodes), 1);
            }
        }
    }
    if (selectNodes.length == 0) {
        var range = DCDomTools.getSelectionRange();
        return range;
    }
    // 判断节点是否在可编辑区域
    var isAllContentEditable = function (node) {
        while (node != null) {
            if (node.isContentEditable == false) {
                // return false;
            }
            if (node.isContentEditable == true) {
                return true;
            }
            node = node.parentNode || node.parentElement;
        }
        return false;
    };
    var lastArr = DCDomTools.GetSelectionNodes();//补充没有内容的不可删除元素（包括单复选框，表格）
    for (var i = 0; i < selectNodes.length; i++) {
        if (isAllContentEditable(selectNodes[i]) == true) {
            var $parent = $(selectNodes[i]).parent();
            if ($parent[0].nodeName == "P" && $parent.parent()[0].nodeName == "TD") {
                $(selectNodes[i]).replaceWith($("<br/>"));
            } else {
                $(selectNodes[i]).remove();
            }
        }
    }
    for (var i = 0; i < lastArr.length; i++) {
        if (lastArr[i].nodeType == 1 && !lastArr[i].getAttribute("dcignore")) {
            var dctype = lastArr[i].getAttribute("dctype");
            if (dctype == "XTextImageElement") {
                $(lastArr[i]).remove();
                continue;
            } else if (DCDomTools.allChildNodes(lastArr[i], 3).length == 0 && lastArr[i].getAttribute("dc_deleteable") != "false") {
                if (dctype != null || lastArr[i].nodeName == "SPAN") {
                    $(lastArr[i]).remove();
                    continue;
                }
            }
            if (lastArr[i].nodeName == "P" && lastArr[i].parentElement.nodeName != "TD" && lastArr[i].innerText.replace(/[\r\n]/g, "") == "") {
                if ($(lastArr[i]).find("[dc_deleteable='false']").length == 0) {
                    $(lastArr[i]).remove();
                    continue;
                }
            }
            if (lastArr[i].nodeName == "P" && lastArr[i].parentElement.nodeName == "TD" && lastArr[i].parentElement.innerText == "" && lastArr[i].innerText == "") {
                lastArr[i].innerHTML = "<br />";
                continue;
            }
            if(lastArr[i].nodeName == "BR"){
                if($(lastArr[i]).parent()[0].nodeName == "P" && $(lastArr[i]).parent().parent()[0].nodeName == "TD"){
                }else{
                    $(lastArr[i]).remove();
                    continue; 
                }
            }
        }
    }
    var sel = DCSelectionManager.getSelection();
    if (sel != null && sel.startContainer != null) {
        var range = DCDomTools.getSelectionRange();
        if (range != null && range.collapse) {
            range.collapse(true);
        }
        // 记录最后一次有效的当前状态
        DCSelectionManager.LastSelectionInfo = sel;
        DCSelectionManager.LastSelectionInfoWithFix = DCSelectionManager.getSelectionWithFix();//wyc20200217：补充更新当前光标所在位
    }
    var range = DCDomTools.getSelectionRange();
    var commonAncestorContainer = range.commonAncestorContainer;
    if (commonAncestorContainer.nodeName == "P" && insertBr == true) {
        if ((commonAncestorContainer.parentElement.nodeName == "TD" && commonAncestorContainer.parentElement.innerText == "") || commonAncestorContainer.innerText == "") {
            commonAncestorContainer.innerHTML = "<br />";
        }
    }
    return range;
}
///*
// *  base64.js
// *
// *  Licensed under the BSD 3-Clause License.
// *    http://opensource.org/licenses/BSD-3-Clause
// *
// *  References:
// *    http://en.wikipedia.org/wiki/Base64
// */
//; (function (global, factory) {
//    typeof exports === 'object' && typeof module !== 'undefined'
//        ? module.exports = factory(global)
//        : typeof define === 'function' && define.amd
//            ? define(factory) : factory(global)
//}((
//    typeof self !== 'undefined' ? self
//        : typeof window !== 'undefined' ? window
//            : typeof global !== 'undefined' ? global
//                : this
//), function (global) {
//    'use strict';
//    // existing version for noConflict()
//    global = global || {};
//    var _Base64 = global.Base64;
//    var version = "2.5.1";
//    // if node.js and NOT React Native, we use Buffer
//    var buffer;
//    if (typeof module !== 'undefined' && module.exports) {
//        try {
//            buffer = eval("require('buffer').Buffer");
//        } catch (err) {
//            buffer = undefined;
//        }
//    }
//    // constants
//    var b64chars
//        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
//    var b64tab = function (bin) {
//        var t = {};
//        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
//        return t;
//    }(b64chars);
//    var fromCharCode = String.fromCharCode;
//    // encoder stuff
//    var cb_utob = function (c) {
//        if (c.length < 2) {
//            var cc = c.charCodeAt(0);
//            return cc < 0x80 ? c
//                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
//                    + fromCharCode(0x80 | (cc & 0x3f)))
//                    : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
//                        + fromCharCode(0x80 | ((cc >>> 6) & 0x3f))
//                        + fromCharCode(0x80 | (cc & 0x3f)));
//        } else {
//            var cc = 0x10000
//                + (c.charCodeAt(0) - 0xD800) * 0x400
//                + (c.charCodeAt(1) - 0xDC00);
//            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
//                + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
//                + fromCharCode(0x80 | ((cc >>> 6) & 0x3f))
//                + fromCharCode(0x80 | (cc & 0x3f)));
//        }
//    };
//    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
//    var utob = function (u) {
//        return u.replace(re_utob, cb_utob);
//    };
//    var cb_encode = function (ccc) {
//        var padlen = [0, 2, 1][ccc.length % 3],
//            ord = ccc.charCodeAt(0) << 16
//                | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
//                | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
//            chars = [
//                b64chars.charAt(ord >>> 18),
//                b64chars.charAt((ord >>> 12) & 63),
//                padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
//                padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
//            ];
//        return chars.join('');
//    };
//    var btoa = global.btoa ? function (b) {
//        return global.btoa(b);
//    } : function (b) {
//        return b.replace(/[\s\S]{1,3}/g, cb_encode);
//    };
//    var _encode = function (u) {
//        const isUint8Array = Object.prototype.toString.call(u) === '[object Uint8Array]';
//        return isUint8Array ? u.toString('base64')
//            : btoa(utob(String(u)));
//    }
//    var encode = function (u, urisafe) {
//        return !urisafe
//            ? _encode(u)
//            : _encode(String(u)).replace(/[+\/]/g, function (m0) {
//                return m0 == '+' ? '-' : '_';
//            }).replace(/=/g, '');
//    };
//    var encodeURI = function (u) { return encode(u, true) };
//    // decoder stuff
//    var re_btou = new RegExp([
//        '[\xC0-\xDF][\x80-\xBF]',
//        '[\xE0-\xEF][\x80-\xBF]{2}',
//        '[\xF0-\xF7][\x80-\xBF]{3}'
//    ].join('|'), 'g');
//    var cb_btou = function (cccc) {
//        switch (cccc.length) {
//            case 4:
//                var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
//                    | ((0x3f & cccc.charCodeAt(1)) << 12)
//                    | ((0x3f & cccc.charCodeAt(2)) << 6)
//                    | (0x3f & cccc.charCodeAt(3)),
//                    offset = cp - 0x10000;
//                return (fromCharCode((offset >>> 10) + 0xD800)
//                    + fromCharCode((offset & 0x3FF) + 0xDC00));
//            case 3:
//                return fromCharCode(
//                    ((0x0f & cccc.charCodeAt(0)) << 12)
//                    | ((0x3f & cccc.charCodeAt(1)) << 6)
//                    | (0x3f & cccc.charCodeAt(2))
//                );
//            default:
//                return fromCharCode(
//                    ((0x1f & cccc.charCodeAt(0)) << 6)
//                    | (0x3f & cccc.charCodeAt(1))
//                );
//        }
//    };
//    var btou = function (b) {
//        return b.replace(re_btou, cb_btou);
//    };
//    var cb_decode = function (cccc) {
//        var len = cccc.length,
//            padlen = len % 4,
//            n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
//                | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
//                | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0)
//                | (len > 3 ? b64tab[cccc.charAt(3)] : 0),
//            chars = [
//                fromCharCode(n >>> 16),
//                fromCharCode((n >>> 8) & 0xff),
//                fromCharCode(n & 0xff)
//            ];
//        chars.length -= [0, 0, 2, 1][padlen];
//        return chars.join('');
//    };
//    var _atob = global.atob ? function (a) {
//        return global.atob(a);
//    } : function (a) {
//        return a.replace(/\S{1,4}/g, cb_decode);
//    };
//    var atob = function (a) {
//        return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
//    };
//    var _decode = buffer ?
//        buffer.from && Uint8Array && buffer.from !== Uint8Array.from
//            ? function (a) {
//                return (a.constructor === buffer.constructor
//                    ? a : buffer.from(a, 'base64')).toString();
//            }
//            : function (a) {
//                return (a.constructor === buffer.constructor
//                    ? a : new buffer(a, 'base64')).toString();
//            }
//        : function (a) { return btou(_atob(a)) };
//    var decode = function (a) {
//        return _decode(
//            String(a).replace(/[-_]/g, function (m0) { return m0 == '-' ? '+' : '/' })
//                .replace(/[^A-Za-z0-9\+\/]/g, '')
//        );
//    };
//    var noConflict = function () {
//        var Base64 = global.Base64;
//        global.Base64 = _Base64;
//        return Base64;
//    };
//    // export Base64
//    global.Base64 = {
//        VERSION: version,
//        atob: atob,
//        btoa: btoa,
//        fromBase64: decode,
//        toBase64: encode,
//        utob: utob,
//        encode: encode,
//        encodeURI: encodeURI,
//        btou: btou,
//        decode: decode,
//        noConflict: noConflict,
//        __buffer__: buffer
//    };
//    // if ES5 is available, make Base64.extendString() available
//    if (typeof Object.defineProperty === 'function') {
//        var noEnum = function (v) {
//            return { value: v, enumerable: false, writable: true, configurable: true };
//        };
//        global.Base64.extendString = function () {
//            Object.defineProperty(
//                String.prototype, 'fromBase64', noEnum(function () {
//                    return decode(this)
//                }));
//            Object.defineProperty(
//                String.prototype, 'toBase64', noEnum(function (urisafe) {
//                    return encode(this, urisafe)
//                }));
//            Object.defineProperty(
//                String.prototype, 'toBase64URI', noEnum(function () {
//                    return encode(this, true)
//                }));
//        };
//    }
//    //
//    // export Base64 to the namespace
//    //
//    if (global['Meteor']) { // Meteor.js
//        Base64 = global.Base64;
//    }
//    // module.exports and AMD are mutually exclusive.
//    // module.exports has precedence.
//    if (typeof module !== 'undefined' && module.exports) {
//        module.exports.Base64 = global.Base64;
//    }
//    else if (typeof define === 'function' && define.amd) {
//        // AMD. Register as an anonymous module.
//        define([], function () { return global.Base64 });
//    }
//    // that's it!
//    return { Base64: global.Base64 }
//}));


var LZString = (function () {

    // private property
    var f = String.fromCharCode;
    var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
    var baseReverseDic = {};

    function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
            baseReverseDic[alphabet] = {};
            for (var i = 0; i < alphabet.length; i++) {
                baseReverseDic[alphabet][alphabet.charAt(i)] = i;
            }
        }
        return baseReverseDic[alphabet][character];
    }

    var LZString = {
        compressToBase64: function (input) {
            if (input == null) return "";
            var res = LZString._compress(input, 6, function (a) { return keyStrBase64.charAt(a); });
            switch (res.length % 4) { // To produce valid Base64
                default: // When could this happen ?
                case 0: return res;
                case 1: return res + "===";
                case 2: return res + "==";
                case 3: return res + "=";
            }
        },

        decompressFromBase64: function (input) {
            if (input == null) return "";
            if (input == "") return null;
            return LZString._decompress(input.length, 32, function (index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
        },

        compressToUTF16: function (input) {
            if (input == null) return "";
            return LZString._compress(input, 15, function (a) { return f(a + 32); }) + " ";
        },

        decompressFromUTF16: function (compressed) {
            if (compressed == null) return "";
            if (compressed == "") return null;
            return LZString._decompress(compressed.length, 16384, function (index) { return compressed.charCodeAt(index) - 32; });
        },

        //compress into uint8array (UCS-2 big endian format)
        compressToUint8Array: function (uncompressed) {
            var compressed = LZString.compress(uncompressed);
            var buf = new Uint8Array(compressed.length * 2); // 2 bytes per character

            for (var i = 0, TotalLen = compressed.length; i < TotalLen; i++) {
                var current_value = compressed.charCodeAt(i);
                buf[i * 2] = current_value >>> 8;
                buf[i * 2 + 1] = current_value % 256;
            }
            return buf;
        },

        //decompress from uint8array (UCS-2 big endian format)
        decompressFromUint8Array: function (compressed) {
            if (compressed === null || compressed === undefined) {
                return LZString.decompress(compressed);
            } else {
                var buf = new Array(compressed.length / 2); // 2 bytes per character
                for (var i = 0, TotalLen = buf.length; i < TotalLen; i++) {
                    buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
                }

                var result = [];
                buf.forEach(function (c) {
                    result.push(f(c));
                });
                return LZString.decompress(result.join(''));

            }

        },


        //compress into a string that is already URI encoded
        compressToEncodedURIComponent: function (input) {
            if (input == null) return "";
            return LZString._compress(input, 6, function (a) { return keyStrUriSafe.charAt(a); });
        },

        //decompress from an output of compressToEncodedURIComponent
        decompressFromEncodedURIComponent: function (input) {
            if (input == null) return "";
            if (input == "") return null;
            input = input.replace(/ /g, "+");
            return LZString._decompress(input.length, 32, function (index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
        },

        compress: function (uncompressed) {
            return LZString._compress(uncompressed, 16, function (a) { return f(a); });
        },
        _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
            if (uncompressed == null) return "";
            var i, value,
                context_dictionary = {},
                context_dictionaryToCreate = {},
                context_c = "",
                context_wc = "",
                context_w = "",
                context_enlargeIn = 2, // Compensate for the first entry which should not count
                context_dictSize = 3,
                context_numBits = 2,
                context_data = [],
                context_data_val = 0,
                context_data_position = 0,
                ii;

            for (ii = 0; ii < uncompressed.length; ii += 1) {
                context_c = uncompressed.charAt(ii);
                if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                    context_dictionary[context_c] = context_dictSize++;
                    context_dictionaryToCreate[context_c] = true;
                }

                context_wc = context_w + context_c;
                if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
                    context_w = context_wc;
                } else {
                    if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                        if (context_w.charCodeAt(0) < 256) {
                            for (i = 0; i < context_numBits; i++) {
                                context_data_val = (context_data_val << 1);
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                            }
                            value = context_w.charCodeAt(0);
                            for (i = 0; i < 8; i++) {
                                context_data_val = (context_data_val << 1) | (value & 1);
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = value >> 1;
                            }
                        } else {
                            value = 1;
                            for (i = 0; i < context_numBits; i++) {
                                context_data_val = (context_data_val << 1) | value;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = 0;
                            }
                            value = context_w.charCodeAt(0);
                            for (i = 0; i < 16; i++) {
                                context_data_val = (context_data_val << 1) | (value & 1);
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else {
                                    context_data_position++;
                                }
                                value = value >> 1;
                            }
                        }
                        context_enlargeIn--;
                        if (context_enlargeIn == 0) {
                            context_enlargeIn = Math.pow(2, context_numBits);
                            context_numBits++;
                        }
                        delete context_dictionaryToCreate[context_w];
                    } else {
                        value = context_dictionary[context_w];
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }


                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    // Add wc to the dictionary.
                    context_dictionary[context_wc] = context_dictSize++;
                    context_w = String(context_c);
                }
            }

            // Output the code for w.
            if (context_w !== "") {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 8; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    } else {
                        value = 1;
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = (context_data_val << 1) | value;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = 0;
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 16; i++) {
                            context_data_val = (context_data_val << 1) | (value & 1);
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = value >> 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                } else {
                    value = context_dictionary[context_w];
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = (context_data_val << 1) | (value & 1);
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = value >> 1;
                    }


                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
            }

            // Mark the end of the stream
            value = 2;
            for (i = 0; i < context_numBits; i++) {
                context_data_val = (context_data_val << 1) | (value & 1);
                if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                } else {
                    context_data_position++;
                }
                value = value >> 1;
            }

            // Flush the last char
            while (true) {
                context_data_val = (context_data_val << 1);
                if (context_data_position == bitsPerChar - 1) {
                    context_data.push(getCharFromInt(context_data_val));
                    break;
                }
                else context_data_position++;
            }
            return context_data.join('');
        },

        decompress: function (compressed) {
            if (compressed == null) return "";
            if (compressed == "") return null;
            return LZString._decompress(compressed.length, 32768, function (index) { return compressed.charCodeAt(index); });
        },

        _decompress: function (length, resetValue, getNextValue) {
            var dictionary = [],
                next,
                enlargeIn = 4,
                dictSize = 4,
                numBits = 3,
                entry = "",
                result = [],
                i,
                w,
                bits, resb, maxpower, power,
                c,
                data = { val: getNextValue(0), position: resetValue, index: 1 };

            for (i = 0; i < 3; i += 1) {
                dictionary[i] = i;
            }

            bits = 0;
            maxpower = Math.pow(2, 2);
            power = 1;
            while (power != maxpower) {
                resb = data.val & data.position;
                data.position >>= 1;
                if (data.position == 0) {
                    data.position = resetValue;
                    data.val = getNextValue(data.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
            }

            switch (next = bits) {
                case 0:
                    bits = 0;
                    maxpower = Math.pow(2, 8);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    c = f(bits);
                    break;
                case 1:
                    bits = 0;
                    maxpower = Math.pow(2, 16);
                    power = 1;
                    while (power != maxpower) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (data.position == 0) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    c = f(bits);
                    break;
                case 2:
                    return "";
            }
            dictionary[3] = c;
            w = c;
            result.push(c);
            while (true) {
                if (data.index > length) {
                    return "";
                }

                bits = 0;
                maxpower = Math.pow(2, numBits);
                power = 1;
                while (power != maxpower) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (resb > 0 ? 1 : 0) * power;
                    power <<= 1;
                }

                switch (c = bits) {
                    case 0:
                        bits = 0;
                        maxpower = Math.pow(2, 8);
                        power = 1;
                        while (power != maxpower) {
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (resb > 0 ? 1 : 0) * power;
                            power <<= 1;
                        }

                        dictionary[dictSize++] = f(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 1:
                        bits = 0;
                        maxpower = Math.pow(2, 16);
                        power = 1;
                        while (power != maxpower) {
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (resb > 0 ? 1 : 0) * power;
                            power <<= 1;
                        }
                        dictionary[dictSize++] = f(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 2:
                        return result.join('');
                }

                if (enlargeIn == 0) {
                    enlargeIn = Math.pow(2, numBits);
                    numBits++;
                }

                if (dictionary[c]) {
                    entry = dictionary[c];
                } else {
                    if (c === dictSize) {
                        entry = w + w.charAt(0);
                    } else {
                        return null;
                    }
                }
                result.push(entry);

                // Add w+entry[0] to the dictionary.
                dictionary[dictSize++] = w + entry.charAt(0);
                enlargeIn--;

                w = entry;

                if (enlargeIn == 0) {
                    enlargeIn = Math.pow(2, numBits);
                    numBits++;
                }

            }
        }
    };
    return LZString;
})();