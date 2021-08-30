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
 
// 判断是否是通过服务器页面加载资源内容的。-
// 如果本函数返回True,则ReferencePathForDebug属性无效。
//
function DCIsResourceFromServicePage() {
    return "12345678" === "12345678";
}

// 当客户端以<script type="text/javascript" src="ShowDocumentImageService.aspx?js=1"></script>引用本JS文件内容时。
// 则服务端故意将"% # ServicePage # %"替换为"12345678"。此时DCIsResourceFromServicePage()返回值固定为true.
//
// 如果以<script type="text/javascript" src="ctlReference/DCWriterControl.js"></script>引用JS文件内容时，
// 则本代码不变，则返回值固定为false。


// DCWriter 的ＷＥＢ控件使用的ＪＳ代码，编制袁永福2018-5-24
//debugger;

// 客户端控件支持的属性名组成的数组，注释后面的是默认值。
// 这里列出的属性名是DCSoft.Writer.Controls.WebWriterControlOptions中所有公开的属性名。
// 这里使用代码注释预留一个位置，在DCSoft.Writer.Controls.Web.WC_JS中执行替换操作。
var AttributeNamesForWriterControlOptions = [
	"AdditionPageTitle" , // 类型:System.String
	"AJAXAsync" , // 类型:System.Boolean,默认值:True
	"AllowCopy" , // 类型:System.Boolean,默认值:True
	"AllowDrop" , // 类型:System.Boolean,默认值:True
	"AttachedAJAXHeader" , // 类型:System.String
	"AutoGenerateCABFile" , // 类型:System.Boolean,默认值:True
	"AutoGenerateOrderedList" , // 类型:System.Boolean,默认值:False
	"AutoHeightInMobileDevice" , // 类型:System.Boolean,默认值:True
	"AutoLine" , // 类型:System.Boolean,默认值:False
	"AutoPostBack" , // 类型:System.Boolean,默认值:True
	"AutoSaveIntervalInSecond" , // 类型:System.Int32,默认值:0
	"AutoZoom" , // 类型:System.Boolean,默认值:False
	"BackgroundTextOutputMode" , // 类型:DCSoft.Writer.DCBackgroundTextOutputMode,默认值:Output
	"BaseUrl" , // 类型:System.String
	"BrowserStyle" , // 类型:DCSoft.Common.XWebBrowsersStyle,默认值:AutoDetect
	"CABUrl" , // 类型:System.String
	"CABVersion" , // 类型:System.String
	"Chartset" , // 类型:System.String,默认值:gb2312
	"ClientContextMenuType" , // 类型:DCSoft.Writer.Controls.WebClientContextMenuType,默认值:None
	"ClientID" , // 类型:System.String
	"ClientMachineName" , // 类型:System.String
	"CommentVisibility" , // 类型:DCSoft.Writer.Controls.FunctionControlVisibility,默认值:Auto
	"CommentVisible" , // 类型:System.Boolean,默认值:False
	"CompressSessionData" , // 类型:System.Boolean,默认值:True
	"ContentEncoding" , // 类型:System.Text.Encoding
	"ContentRenderMode" , // 类型:DCSoft.Writer.Controls.WebWriterControlRenderMode,默认值:PageImage
	"ControlName" , // 类型:System.String
	"CrossDomain" , // 类型:System.Boolean,默认值:False
	"CurrentLoadOptions" , // 类型:DCSoft.Writer.Controls.WebWriterControlLoadDocumentOptions
	"CurrentUserID" , // 类型:System.String
	"CurrentUserName" , // 类型:System.String
	"CurrentUserPermissionLevel" , // 类型:System.Int32,默认值:0
	"CustomCSSString" , // 类型:System.String
	"CustomizeSpanInputElementBorderCssStyle" , // 类型:System.String
	"CustomLogoImage" , // 类型:System.String
	"CustomSessionID" , // 类型:System.Int32
	"DebugMode" , // 类型:System.Boolean,默认值:False
	"DocumentBufferedName" , // 类型:System.String
	"DocumentOptions" , // 类型:DCSoft.Writer.DocumentOptions
	"EnableBrowseCache" , // 类型:System.Boolean,默认值:True
	"EnabledClientContextMenu" , // 类型:System.Boolean,默认值:False
	"EnableEncryptView" , // 类型:System.Boolean,默认值:True
	"EnableLandscapeView" , // 类型:System.Boolean,默认值:True
	"EnablePermission" , // 类型:System.Boolean,默认值:False
	"EnableValueFormat" , // 类型:System.Boolean,默认值:True
	"ExcludeKeywords" , // 类型:System.String
	"ExcludeLogicDeleted" , // 类型:System.Boolean,默认值:False
	"FieldBorderPrintVisibility" , // 类型:DCSoft.Writer.DCRenderVisibility,默认值:Default
	"FixedHeader" , // 类型:System.Boolean,默认值:False
	"ForHtmlEditable" , // 类型:System.Boolean,默认值:False
	"FormView" , // 类型:DCSoft.Writer.Controls.FormViewMode,默认值:Disable
	"ForPrint" , // 类型:System.Boolean,默认值:False
	"FreeSelection" , // 类型:System.Boolean,默认值:False
	"GenerateFormElement" , // 类型:System.Boolean,默认值:False
	"HeaderFooterEditable" , // 类型:System.Boolean,默认值:False
	"HeaderFooterSelect" , // 类型:System.Boolean,默认值:False
	"HeightCompress" , // 类型:System.Boolean,默认值:True
	"ImageDataEmbedInHtml" , // 类型:System.Boolean,默认值:False
	"IndentHtmlCode" , // 类型:System.Boolean,默认值:False
	"InnerSPBDCS" , // 类型:System.String
	"InsertImageButtonID" , // 类型:System.String
	"IsMobileDevice" , // 类型:DCSoft.Writer.Controls.DCOptionMode,默认值:AutoDetect
	"isTransformLandscape" , // 类型:System.Boolean,默认值:True
	"KBLibraryUrl" , // 类型:System.String
	"KeepLineBreak" , // 类型:System.Boolean,默认值:True
	"LicenseServicePageUrl" , // 类型:System.String
	"LocalFileMode" , // 类型:System.Boolean,默认值:False
	"LocalServerPort" , // 类型:System.Int32,默认值:2020
	"LogUserEditTrack" , // 类型:System.Boolean,默认值:False
	"MaxPageCount" , // 类型:System.Int32,默认值:0
	"MinContentPixelHeight" , // 类型:System.Int32,默认值:0
	"MobileLayoutMode" , // 类型:DCSoft.Writer.Controls.WebClientMobileLayoutMode,默认值:None
	"MultiDocument" , // 类型:System.Boolean,默认值:False
	"MultiPage" , // 类型:System.Boolean,默认值:False
	"NarrowBorder" , // 类型:System.Boolean,默认值:False
	"OldBrowser" , // 类型:System.Boolean,默认值:False
	"OutputFieldBorderChar" , // 类型:System.Boolean,默认值:False
	"OutputHeaderFooter" , // 类型:System.Boolean,默认值:True
	"OutputJavaScript" , // 类型:System.Boolean,默认值:True
	"OutputRowHeight" , // 类型:System.Boolean,默认值:True
	"PageBackColor" , // 类型:System.Drawing.Color,默认值:Color [White]
	"PageName" , // 类型:System.String
	"PageShadow" , // 类型:System.Boolean,默认值:True
	"PageViewInMobileDevice" , // 类型:System.Boolean,默认值:False
	"PageZoomRate" , // 类型:System.Single,默认值:1
	"PixelPageSpacing" , // 类型:System.Int32,默认值:20
	"PositiveSpecifyWidthFieldAsInputElement" , // 类型:System.Boolean,默认值:False
	"PreviewUseAdvancedLayout" , // 类型:System.Boolean,默认值:False
	"PrintCollate" , // 类型:System.Boolean,默认值:False
	"PrintCopies" , // 类型:System.Int32,默认值:1
	"PrintMode" , // 类型:DCSoft.Printing.DCPrintMode,默认值:Normal
	"PrintSpecifyPageIndexsString" , // 类型:System.String
	"PrintZoomRate" , // 类型:System.Single,默认值:1
	"Readonly" , // 类型:System.Boolean,默认值:False
	"ReferencePathForDebug" , // 类型:System.String
	"RegisterCodeIndex" , // 类型:System.Int32,默认值:-1
	"ResourceReferencePath" , // 类型:System.String
	"SerializeParameterValue" , // 类型:System.Boolean,默认值:True
	"ServerEventNameList" , // 类型:System.String
	"ServerSleepForDebug" , // 类型:System.Int32,默认值:0
	"ServicePageURL" , // 类型:System.String
	"SessionTimeout" , // 类型:System.Int32,默认值:0
	"ShowDebugInfo" , // 类型:System.Boolean,默认值:False
	"ShowJSVersionConflictTip" , // 类型:System.Boolean,默认值:True
	"ShowMainDocumentBodyWhenMultiDocument" , // 类型:System.Boolean,默认值:True
	"ShowMarginLine" , // 类型:System.Boolean,默认值:False
	"ShowPageBorderLine" , // 类型:System.Boolean,默认值:True
	"SupportActiveX" , // 类型:System.Boolean,默认值:True
	"SupportFixedWidthInputFieldElement" , // 类型:System.Boolean,默认值:True
	"TransformUseBase64" , // 类型:System.Boolean,默认值:False
	"UrlEncodeCountForPostData" , // 类型:System.Int32,默认值:2
	"UseClassAttribute" , // 类型:System.Boolean,默认值:False
	"UseDCWriterMiniJS" , // 类型:DCSoft.Writer.DCBooleanValueHasDefault,默认值:Default
	"ViewStyle" , // 类型:DCSoft.Writer.Serialization.Html.WriterHtmlViewStyle,默认值:Page
	"WorkspaceBackColor" , // 类型:System.Drawing.Color,默认值:Color [AppWorkspace]
	"WorkspaceBackColorString" , // 类型:System.String
	"WorkspaceBackgroundImage" , // 类型:System.String
	"WriteJSStringResourcesInDocument" , // 类型:System.Boolean,默认值:False
	"WriterControlWebServiceUrl" , // 类型:System.String
	"WriteScriptRefence"  // 类型:System.Boolean,默认值:True

];

//@method 绑定元素对象，准备创建编辑器控件客户端。
//@param rootElement HTML元素对象，一般为DIV。
function BindingDCWriterClientControl(rootElement) {
    if (rootElement === null) {
        return false;
    }
    // 设置默认的参数
    rootElement.Options = {
    };
   

    rootElement.DocumentOptions = {
        "SecurityOptions": {
            "CAMode": "Software",
            "CAServerIP": null,
            "CAServerPort": 0,
            "CreatorTipFormatString": null,
            "DeleterTipFormatString": null,
            "AutoEnablePermissionWhenUserLogin": true,
            "EnablePermission": true,
            "CanModifyDeleteSameLevelContent": true,
            "RealDeleteOwnerContent": false,
            "ShowPermissionTip": true,
            "PowerfulSignDocument": true,
            "EnableLogicDelete": true,
            "ShowLogicDeletedContent": true,
            "ShowPermissionMark": true,
            "TrackVisibleLevel0": {
                "Enabled": true,
                "BackgroundColor": "Transparent",
                "BackgroundColorString": null,
                "UnderLineColor": "LightBlue",
                "UnderLineColorString": "#ADD8E6",
                "UnderLineColorNum": 1,
                "DeleteLineColor": "Coral",
                "DeleteLineColorString": "#FF7F50",
                "DeleteLineNum": 1
            },
            "TrackVisibleLevel1": {
                "Enabled": true,
                "BackgroundColor": "Transparent",
                "BackgroundColorString": null,
                "UnderLineColor": "Blue",
                "UnderLineColorString": null,
                "UnderLineColorNum": 1,
                "DeleteLineColor": "Red",
                "DeleteLineColorString": null,
                "DeleteLineNum": 1
            },
            "TrackVisibleLevel2": {
                "Enabled": true,
                "BackgroundColor": "LightYellow",
                "BackgroundColorString": "#FFFFE0",
                "UnderLineColor": "Blue",
                "UnderLineColorString": null,
                "UnderLineColorNum": 2,
                "DeleteLineColor": "Red",
                "DeleteLineColorString": null,
                "DeleteLineNum": 2
            },
            "TrackVisibleLevel3": {
                "Enabled": true,
                "BackgroundColor": "LightYellow",
                "BackgroundColorString": "#FFFFE0",
                "UnderLineColor": "Blue",
                "UnderLineColorString": null,
                "UnderLineColorNum": 2,
                "DeleteLineColor": "Red",
                "DeleteLineColorString": null,
                "DeleteLineNum": 2
            }
        },
        "ViewOptions": {
            "FieldBorderElementPixelWidth": 1.0,
            "NewInputContentUnderlineColor": "Transparent",
            "NewInputContentUnderlineColorValue": null,
            "SupportUG": false,
            "HiddenTableBorderJumpPrintPage": false,
            "ImageInterpolationMode": "High",
            "EmphasisMarkSize": 10.0,
            "MaskColorForJumpPrint": "#0000FF",
            "MaskColorForJumpPrintValue": null,
            "BothBlackWhenPrint": false,
            "ProtectedContentBackColor": "",
            "ProtectedContentBackColorValue": null,
            "DefaultLineColorForImageEditor": "",
            "DefaultLineColorForImageEditorValue": null,
            "ShowInputFieldStateTag": true,
            "SectionBorderVisibility": "All",
            "TableCellBorderVisibility": "All",
            "ShowPageBreak": false,
            "DefaultAdornTextType": "DataSource",
            "AdornTextVisibility": "Hidden",
            "AdornTextBackColor": "#808080",
            "AdornTextBackColorValue": "#64808080",
            "ShowGrayMaskOverDisableContentParty": true,
            "ShowFormButton": false,
            "PageMarginLineLength": 30,
            "DefaultInputFieldHighlight": "Enabled",
            "HighlightProtectedContent": false,
            "ShowLineNumber": false,
            "UseLanguage2": false,
            "SpecifyExtenGridLineStep": 0.0,
            "GridLineStyle": "Solid",
            "EnableRightToLeft": true,
            "AutoZoomDropdownListFontSize": true,
            "DropdownListFontSize": 0.0,
            "DropdownListFontName": null,
            "ShowBackgroundCellID": false,
            "ShowExpressionFlag": true,
            "CommentFontName": null,
            "CommentFontSize": 10.0,
            "CommentDateFormatString": "yyyy-MM-dd HH:mm",
            "OldWhitespaceWidth": false,
            "ShowGridLine": false,
            "EnableEncryptView": true,
            "GridLineColor": "Gray",
            "GridLineColorValue": null,
            "PreserveBackgroundTextWhenPrint": false,
            "PrintBackgroundText": false,
            "IgnoreFieldBorderWhenPrint": true,
            "PrintGridLine": false,
            "PrintImageAltText": false,
            "ShowHeaderBottomLine": true,
            "HeaderBottomLineWidth": 1.0,
            "ShowCellNoneBorder": true,
            "NoneBorderColor": "LightGrey",
            "NoneBorderColorValue": null,
            "GraphicsSmoothingMode": "None",
            "TextRenderStyle": "ClearTypeGridFit",
            "ShowParagraphFlag": false,
            "HiddenFieldBorderWhenLostFocus": true,
            "ShowFieldBorderElement": true,
            "FieldBorderColor": "",
            "FieldBorderColorValue": null,
            "ShowPageLine": true,
            "RichTextBoxCompatibility": false,
            "MinTableColumnWidth": 50.0,
            "DefaultInputFieldTextColor": "Transparent",
            "DefaultInputFieldTextColorValue": null,
            "EnableFieldTextColor": false,
            "FieldTextColor": "Black",
            "FieldTextColorValue": null,
            "FieldTextPrintColor": "Transparent",
            "FieldTextPrintColorValue": null,
            "ReadonlyFieldBackColor": "LightGrey",
            "ReadonlyFieldBackColorValue": null,
            "FieldBackColor": "AliceBlue",
            "FieldBackColorValue": null,
            "FieldHoverBackColor": "LightBlue",
            "FieldHoverBackColorValue": null,
            "FieldFocusedBackColor": "LightBlue",
            "FieldFocusedBackColorValue": null,
            "FieldInvalidateValueForeColor": "LightCoral",
            "FieldInvalidateValueForeColorValue": null,
            "FieldInvalidateValueBackColor": "LightPink",
            "FieldInvalidateValueBackColorValue": "#FFB6C1",
            "ReadonlyFieldBorderColor": "Gray",
            "TagColorForReadonlyField": "Gray",
            "TagColorForReadonlyFieldValue": null,
            "TagColorForModifiedField": "Blue",
            "TagColorForModifiedFieldValue": null,
            "TagColorForNormalField": "Red",
            "TagColorForNormalFieldValue": "#FF0000",
            "TagColorForValueInvalidateField": "Red",
            "TagColorForValueInvalidateFieldValue": null,
            "ReadonlyFieldBorderColorValue": null,
            "UnEditableFieldBorderColor": "Red",
            "UnEditableFieldBorderColorValue": null,
            "NormalFieldBorderColor": "Blue",
            "NormalFieldBorderColorValue": null,
            "BackgroundTextColor": "Gray",
            "BackgroundTextColorValue": null,
            "SelectionHighlight": "MaskColor",
            "SelectionHightlightMaskColor": "#0000FF",
            "SelectionHightlightMaskColorValue": null,
            "LayoutDirection": "LeftToRight"
        },
        "BehaviorOptions": {
            "AutoClearInvalidateCharacter": true,
            "ShowNoLicenseFunctionRisk": true,
            "EnableAIForSuspiciousContent": false,
            "EncodingCodePageForWriteRTF": 936,
            "AutoSaveScriptAssemblyToTempFile": true,
            "EnabledShowWinTaskBarProgress": true,
            "CompressXMLContent": false,
            "SpeedupByMultiThread": true,
            "LocalAutoSaveWorkDirectory": null,
            "NewExpressionExecuteMode": true,
            "AutoFocusWhenOpenDocument": true,
            "LockScrollPositionWhenStrictFormViewMode": false,
            "CheckedValueBindingHandledForTableRow": true,
            "EnableContentChangedEventWhenLoadDocument": false,
            "EnableCollapseSection": false,
            "MaxTextLengthForPaste": 0,
            "OutputFieldBorderTextToContentText": true,
            "AutoShowScriptErrorMessage": false,
            "AutoClearTextFormatWhenPasteOrInsertContent": false,
            "AutoDocumentValueValidate": false,
            "AutoSaveIntervalInSecond": 0,
            "EnableContentLock": true,
            "MinCountForDropdownListSpellCodeArea": 4,
            "AutoFixElementIDWhenInsertElements": true,
            "MaxZoomRate": 5.0,
            "MinZoomRate": 0.2,
            "RemoveLastParagraphFlagWhenInsertDocument": false,
            "MoveCaretWhenDeleteFail": true,
            "DoubleCompressHtmlWhitespace": true,
            "AllowDeleteJumpOutOfField": true,
            "ContinueHeaderParagrahStyle": false,
            "ActiveCheckInstallWindowsMediaPlayer": false,
            "EnableChineseFontSizeName": true,
            "MaximizedPrintPreviewDialog": false,
            "RaiseQueryListItemsWhenUserEditText": false,
            "AppErrorHandleMode": "ThrowException",
            "XMLContentEncodingName": null,
            "AutoAssistInsertString": false,
            "AutoAssistInsertStringDetectTextLength": 0,
            "AutoTranslateSourceString": null,
            "AutoTranslateDescString": null,
            "AutoScrollToCaretWhenGotFocus": false,
            "MoveFocusHotKey": "Tab",
            "EnabledElementEvent": true,
            "ShowTooltip": true,
            "DoubleClickToEditComment": true,
            "DataObjectRange": "OS",
            "CommentEditableWhenReadonly": false,
            "CommentVisibility": "Auto",
            "AllowDragContent": false,
            "AcceptDataFormats": "All",
            "CreationDataFormats": "All",
            "FormView": "Disable",
            "PreserveClipbardDataWhenExit": false,
            "FastInputMode": false,
            "CompressLayoutForFieldBorder": true,
            "SmoothScrollView": true,
            "AutoActiveSystemTaskbarBeforeShowDialog": false,
            "EnableCalculateControl": true,
            "EnableEditElementValue": true,
            "TitleForToolTip": null,
            "AutoUppercaseFirstCharInFirstLine": false,
            "AutoRefreshUserTrackInfos": false,
            "ValidateIDRepeatMode": "None",
            "IgnorePrintableAreaOffset": false,
            "PageLineUnderPageBreak": false,
            "ParagraphFlagFollowTableOrSection": true,
            "NotificationWorkingTimeout": 2000,
            "HandleCommandException": true,
            "GeneratePageContentVersion": false,
            "DisplayFormatToInnerValue": true,
            "AutoUpdateButtonVisible": false,
            "StdLablesForImageEditor": null,
            "EnableCheckControlLoaded": false,
            "EnableDeleteReadonlyEmptyContainer": true,
            "SimpleElementProperties": false,
            "EnableHyperLink": true,
            "MinImageFileSizeForConfirmCompressSaveMode": 51200,
            "ImageCompressSaveMode": "Prompt",
            "FillCommentToUserTrackList": false,
            "PromptJumpBackForSearch": true,
            "EnableSetJumpPrintPositionWhenPreview": true,
            "ExtendingPrintDialog": true,
            "ImageShapeEditorBackgroundMenuItemConfig": null,
            "MoveFieldWhenDragWholeContent": true,
            "EnableLogUndo": true,
            "ShowDebugMessage": false,
            "EnableCompressUserHistories": true,
            "EnableElementEvents": true,
            "CloneSerialize": true,
            "WeakMode": false,
            "ForceCollateWhenPrint": false,
            "ThreeClickToSelectParagraph": true,
            "DoubleClickToSelectWord": true,
            "EnableKBEntryRangeMask": true,
            "PromptForExcludeSystemClipboardRange": true,
            "PromptForRejectFormat": true,
            "AutoIgnoreLastEmptyPage": true,
            "ValidateUserIDWhenEditDeleteComment": false,
            "InsertCommentBindingUserTrack": false,
            "PowerfulCommentCommand": true,
            "AutoCreateInstanceInProperty": false,
            "GlobalSpecifyDebugModeValue": false,
            "SpecifyDebugMode": false,
            "EnableDataBinding": true,
            "ForcePopupFormTopMost": false,
            "OutputFormatedXMLSource": true,
            "TableCellOperationDetectDistance": 3,
            "WidelyRaiseFocusEvent": false,
            "ExcludeKeywords": null,
            "InsertDocumentWithCheckMRID": "None",
            "DisableCheckMRIDWhenMRIDIsEmptyForOuterDataObject": false,
            "CustomWarringCheckMRID": null,
            "CustomPromptForbitCheckMRID": null,
            "DesignMode": false,
            "EnableControlHostAtDesignTime": true,
            "DebugMode": false,
            "EnableCopySource": true,
            "EnableExpression": true,
            "Printable": true,
            "OutputBackgroundTextToRTF": true,
            "EnableScript": true,
            "DefaultEditorActiveMode": "None",
            "PromptProtectedContent": "Details"
        },
        "EditOptions": {
            "CopyWithoutInputFieldStructure": false,
            "CopyInTextFormatOnly": false,
            "CloneWithoutElementBorderStyle": true,
            "CloneWithoutLogicDeletedContent": false,
            "GridLinePreviewText": "DCWriter是南京都昌信息科技有限公司自主研发的专业的电子病历文档编辑器。",
            "ClearFieldValueWhenCopy": false,
            "KeepTableWidthWhenInsertDeleteColumn": true,
            "FixSizeWhenInsertImage": true,
            "FixWidthWhenInsertImage": true,
            "FixWidthWhenInsertTable": true,
            "TabKeyToFirstLineIndent": true,
            "AutoInsertTableRowWhenMoveToNextCell": true,
            "TabKeyToInsertTableRow": true,
            "ValueValidateMode": "LostFocus"
        }
    };

    // 复制选项属性
    if (rootElement.attributes != null && rootElement.attributes.length > 0) {
        for (var iCount = 0; iCount < rootElement.attributes.length; iCount++) {
            var attrName = rootElement.attributes[iCount].name.toLowerCase();
            for (var iCount2 = 0; iCount2 < AttributeNamesForWriterControlOptions.length; iCount2++) {
                if (AttributeNamesForWriterControlOptions[iCount2].toLowerCase() == attrName) {
                    if (attrName != "documentoptions") {
                        // 对于IE浏览器，会检索到DocumentOptions属性，导致错误。
                        rootElement.Options[AttributeNamesForWriterControlOptions[iCount2]] = rootElement.attributes[iCount].value;
                        break;
                    }
                }
            }
        }
    }

    rootElement.Options.ControlName = rootElement.id;
    rootElement.Options.AttachedAJAXHeader = null;



    //// 获得对象在文档视图中的绝对左边边界。
    //rootElement.GetAbsBoundsInDocument = function () {
    //    return DCDomTools.GetAbsBoundsInDocument(rootElement);
    //};

    //@method 创建编辑器客户端架构
    //@param successCallback 创建成功后的回调函数。
    rootElement.BuildFrame = function (successCallback) {
        this.onloadconentonce = null;
        rootElement.FrameBuilded = true;
        if (DCIsResourceFromServicePage() == true) {
            // 从服务页面加载资源内容，则ReferencePathForDebug属性无效。
            rootElement.Options.ReferencePathForDebug = null;
            rootElement.setAttribute("referencepathfordebug", "");
        }
        if (typeof (JSON) == "undefined") {
            this.appendChild(document.createTextNode("本浏览器不支持JSON对象，本功能无法实现。"));
            return;
        }
        

        DCWriterEnsureJQuery();
        var svrUrl = this.Options.ServicePageURL;
        if (svrUrl != null && svrUrl.length > 0 ) {
            var index = svrUrl.indexOf("?");
            if (index > 0) {
                this.Options.ServicePageURL = svrUrl.substring(0, index);
            }
        }
        this.setAttribute("ServicePageURL", this.Options.ServicePageURL);
        this.setAttribute("referencepathfordebug", this.Options.ReferencePathForDebug);
        this.setAttribute("contentreandermode", this.Options.ContentRenderMode);
        this.setAttribute("dctype", "WebWriterControl");
        this.setAttribute("insertimagebuttonid", this.Options.InsertImageButtonID);
         

        // 清空所有子元素
        while (this.firstChild != null) {
            this.removeChild(this.firstChild);
        }
        this.appendChild(document.createTextNode("正在初始化DCWriter控件..."));
        this.Options.ControlName = this.id;
        var name1 = "documentoptions.behavioroptions.";
        var name2 = "documentoptions.viewoptions.";
        var name3 = "documentoptions.editoptions.";
        var name4 = "documentoptions.securityoptions.";
        for (var iCount = 0; iCount < this.attributes.length; iCount++) {
            var attrName = this.attributes[iCount].name;
            var attrValue = this.attributes[iCount].value;
            if (DCDomTools.StartsWith(attrName.toLowerCase(), name1) == true) {
                this.DocumentOptions.BehaviorOptions[attrName.substr(name1.length)] = attrValue;
            }
            if (DCDomTools.StartsWith(attrName.toLowerCase(), name2) == true) {
                this.DocumentOptions.ViewOptions[attrName.substr(name2.length)] = attrValue;
            }
            if (DCDomTools.StartsWith(attrName.toLowerCase(), name3) == true) {
                this.DocumentOptions.EditOptions[attrName.substr(name3.length)] = attrValue;
            }
            if (DCDomTools.StartsWith(attrName.toLowerCase(), name4) == true) {
                this.DocumentOptions.SecurityOptions[attrName.substr(name4.length)] = attrValue;
            }
        }//for
        var opts = {
            "Options": this.Options,
            "DocumentOptions": this.DocumentOptions
        };

        var jsonText = JSON.stringify(opts);
        //alert(jsonText);
        //console.log(jsonText);
        var svcurl = this.Options.ServicePageURL + "?initstructure=1";
        var settings = {
            url: svcurl,
            async: true,
            method: "POST",
            type: "POST",
            context: this,
            data: jsonText
        };
        DCDomTools.fixAjaxSettings(settings, rootElement);
        $.ajax(
            svcurl,
            settings).always(
                function (responseText, textStatus, jqXHR) {
                    var sid = null;
                    if (jqXHR && jqXHR.getResponseHeader) {
                        sid = jqXHR.getResponseHeader("dc_sessionid");
                    }
                    else if (responseText && responseText.getResponseHeader) {
                        sid = responseText.getResponseHeader("dc_sessionid");
                    }
                    if (sid != null && sid.length > 0) {
                        DCDomTools.SetDCSessionID20201022(sid);//window.top.dc_sessionid20201022 = sid;
                    }
                    var sessioninof = DCDomTools.GetDCSessionID20201022()
                    if (sessioninof == null) {
                        this.setAttribute("dc_sessionid", "");
                    }
                    else {
                        this.setAttribute("dc_sessionid", sessioninof);
                    }
                    if (typeof (responseText) == "object") {
                        
                        responseText = responseText.responseText;
                    } 
                    if (responseText == null || responseText.length == 0) {
                        this.appendChild(document.createTextNode("未构造任何内容,请仔细检查系统配置的ServicePageUrl【"));
                        var ae = document.createElement("a"); ///
                        ae.href = this.Options.ServicePageURL;
                        ae.target = "_blank";
                        ae.innerText = this.Options.ServicePageURL;
                        this.appendChild(ae);
                        this.appendChild(document.createTextNode("】,请确定浏览器能通过网络或网关能访问该地址。"));
                        return;
                    }
                    //console.log(responseText);

                    //while (this.firstChild != null) {
                    //    this.removeChild(this.firstChild);
                    //}
                    var back = this.getAttribute("style");
                    if (textStatus == "success") {
                        if (typeof (successCallback) == "function") {
                            //window.setTimeout(successCallback, 10);
                            this.onloadconentonce = successCallback;
                            //successCallback();
                        }
                        //var sid = jqXHR.getResponseHeader("dcsid");
                        //if (sid != null && sid.length > 0) {
                        //    //this.setAttribute("dcsid", sid);
                        //    this.dcsid = sid;
                        //    this.getDCSID = function () {
                        //        return sid;
                        //    };
                        //}
                    }
                    var strFlag = "dcwriter-version";
                    if (responseText.indexOf(strFlag) < 0) {
                        responseText = "<b>设置错误：请检查ServerPageUrl:" + rootElement.getAttribute("servicepageurl") + "</b>" + responseText;
                    }
                    $(this).html(responseText);
                    //var sid = document.body.getAttribute("dc_sessionid20201022");
                    //if (sid != null && sid.length > 0) {
                    //    this.setAttribute("dc_sessionid", sid);
                    //}
                    if (back != null) {
                        this.setAttribute("style", back);
                    }
                    if (textStatus == "success") {
                        this.style.overflow = "";
                        if (this.InsertImageByJsonText == null) {
                            StartDCWriterClientControl(this);
                        }
                    }
                    else {
                        this.insertBefore(document.createTextNode(svcurl), this.firstChild);
                        this.style.overflow = "auto";
                    }
                });
    };
};


// 确认是否加载了JQuery库
function DCWriterEnsureJQuery(loadCallback) {
    if (typeof (jQuery) == "undefined") {
        var input = document.getElementById("dcwriter_jquery_url");
        if (input != null) {
            var url = input.value;
            if (url != null && url.length > 0) {
                var winWait = null;
                var oScript = document.createElement("script");
                //oScript.onload = function () { alert("zzzzzzzzzzzzzzzz"); if (winWait != null) { winWait.close(); winWait = null; } };
                oScript.type = "text\/javascript";
                oScript.setAttribute("language", "javascript");
                oScript.setAttribute("async", "false");
                oScript.setAttribute("defer", "false");
                if (typeof (loadCallback) == "function") {
                    oScript.onreadystatechange = function () {
                        if (this.readyState == "complete") {
                            loadCallback();
                        }
                    };
                }
                oScript.src = url;
                if (document.head) {
                    document.head.appendChild(oScript);
                }
                else if (document.body.firstChild != null) {
                    document.body.insertBefore(oScript, document.body.firstChild);
                }
                else {
                    document.body.appendChild(oScript);
                }
                //winWait = window.open("", "_blank","dialog2=yes");
                if (typeof (jQuery) == "undefined") {
                    // 还是没加载成功
                    //alert("DCWriter运行需要jQuery。")
                }
                // 此处存在潜在的隐患，如果用户也是动态加载JQuery，则可能造成冲突。
            }
        }
        return true;
    }
    return false;
};

// 初始化编辑器客户端控件  袁永福2018-6-9
function StartDCWriterClientControl(rootElement) {

    //alert("开始初始化控件");

    if (rootElement == null) {
        return false;
    }
    document.WriterControl = rootElement;
    rootElement.setAttribute("dcasmversion", "20210415222835");
    var optNode = document.getElementById(rootElement.id + "_WebWriterControlOptions");
    if (optNode != null) {
        rootElement.WebWriterControlOptions = optNode.value;
    }

    if (rootElement.BuildFrame == null) {
        BindingDCWriterClientControl(rootElement);
    }
    if (DCIsResourceFromServicePage() == true) {
        // 从服务页面加载资源内容，则ReferencePathForDebug属性无效。
        if (rootElement.Options != null) {
            rootElement.Options.ReferencePathForDebug = null;
        }
        rootElement.setAttribute("referencepathfordebug", "");
    }
    if (rootElement.Options != null
        && typeof (rootElement.Options.UseDCWriterMiniJS) == "string"
        && rootElement.Options.UseDCWriterMiniJS.toLowerCase() == "true") {
        // 使用加密JS代码，则ReferencePathForDebug属性也无效。
        if (rootElement.Options != null) {
            rootElement.Options.ReferencePathForDebug = null;
        }
        rootElement.setAttribute("referencepathfordebug", "");
    }
    window.setInterval(function () {
        var frame = document.getElementById(rootElement.id + "_PreviewFrame");
        if (frame != null
            && frame.offsetHeight > 0
            && rootElement.ToolbarForPrintPreview != null
            && rootElement.ToolbarForPrintPreview.offsetHeight > 0) {
            var h = rootElement.clientHeight - rootElement.ToolbarForPrintPreview.offsetHeight - 1;
            if (frame.lastHeight != h) {
                frame.lastHeight = h;
                frame.style.height = h + "px";
            }
        }
    }, 100);

    //是否记录用户痕迹
    rootElement.IsLogUserEditTrack = function () {
        var v = this.getAttribute("LogUserEditTrack");
        if (v == "true" || v == "TRUE" || v == "True") {
            return true;
        }
        else {
            return false;
        }
    };

    // dom dom节点
    // xuyiming 20200103 添加重新加载处理dom下面的子节点,参数默认是整个html
    rootElement.InitFileContentDom = function (dom) {
        var win = rootElement.GetContentWindow();
        var DOM = dom ? dom : rootElement.GetContentDocument();
        if (win != null && DOM != null && win.WriterCommandModuleFormat) {
            $(DOM).find("[dctype='XTextInputFieldElement']").each(function () {
                if ($(this).find("[dctype='XTextInputFieldElement']").length == 0) {
                    $(this).attr("empty", rootElement.GetElementTextByID(this) != "" ? "" : 1);
                }
            })
            return win.DCWriterControllerEditor.InitFileContentDom(DOM, true);
        }
    }

    // 开始执行格式刷功能
    rootElement.BeginFormatBrush = function (usePstyle) {
        var win = rootElement.GetContentWindow();
        if (win != null && win.WriterCommandModuleFormat) {
            return win.WriterCommandModuleFormat.BeginFormatBrush(usePstyle);
        }
    };

    // 插入文档批注
    rootElement.NewComment = function (options) {
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCDocumentCommentManager) {
            return win.DCDocumentCommentManager.NewComment(options);
        }
    };

    //@method 设置边框打印可见性和颜色
    //@param where 修改什么 tableID,或者[tableID,row数,cell数]
    //@param option 对象 包括bordersetting,color
    //@returns true:完成了操作。false:没有完成操作。
    rootElement.setTableBorderVisible = function (where, option) {
        var win = rootElement.GetContentWindow();
        if (win != null && win.WriterCommandModuleTable) {
            return win.WriterCommandModuleTable.setTableBorderVisible(where, option);
        }
        return false;
    };

    //@method 执行黏贴操作。
    rootElement.DCPaste = function () {
        var doc = rootElement.GetContentDocument();
        if (doc != null) {
            window.setTimeout(function () {
                DCDomTools.FoucsDocument(doc);
                //doc.designMode = "on";
                var result = doc.execCommand("paste", true);
                if (result == false) {
                    //window.alert(rootElement.GetDCWriterString("JS_WarringPaste"));
                    var eventObject = new Object();
                    eventObject.Message = rootElement.GetDCWriterString("JS_WarringPaste");
                    eventObject.State = rootElement.ErrorInfo.NotSupportedError;
                    rootElement.MessageHandler(eventObject);
                }
                //doc.designMode = "false";
            }, 50);
        }
    };

    rootElement.AboutControl = function () {
        var frame = rootElement.ShowMaskDialog();
        if (frame != null) {
            var rnd = new Date().valueOf();
            //var txt = DCDomTools.GetContentByUrlNotAsync(rootElement.getAttribute("servicepageurl") + "?dcaboutcontrol=" + rnd);
            frame.src = rootElement.getAttribute("servicepageurl") + "?dcaboutcontrol=" + rnd;
        }
    };



    //rootElement.Undo = function(){
    //    rootElement.DCExecuteCommand("undo");
    //};
    //rootElement.Redo = function () {
    //    rootElement.DCExecuteCommand("redo");
    //};
    //@method 下载当前编辑的文档为本地文件
    //@param strFormat 文件格式。目前支持的文件格式有 xml , pdf , rtf , txt ,html , longimage(长图片文件)
    rootElement.DownLoadFile = function (strFormat) {
        var frm = document.createElement("form");
        if (strFormat == null || strFormat.length == 0) {
            strFormat = "xml";
        }
        frm.action = rootElement.getAttribute("servicepageurl") + "?getfilecontentspecifyformat=" + strFormat;
        //WYC20191221：新增是否进行BASE64转码的标记
        if (this.IsUseBase64Transfer() == true) {
            frm.action = frm.action + "&transformusebase64=true";
        }
        frm.action = DCDomTools.appendSessionIDToUrl(frm.action);
        frm.method = "POST";
        frm.target = "_blank";
        var field = document.createElement("input");
        field.type = "hidden";
        field.name = "filecontent";
        var postData = this.GetContentHtml(true, true, true);
        field.value = postData;
        frm.appendChild(field);
        document.body.appendChild(frm);
        frm.submit();
        document.body.removeChild(frm);
    };

    //@method 设置快捷菜单
    //@param jsonContextMenu json格式的快捷菜单定义对象
    rootElement.SetContextMenu = function (jsonContextMenu) {
        rootElement.contextMenu = jsonContextMenu;
        var win = this.GetContentWindow();
        if (win != null && win.UEOptions) {
            if (win.document.runtimeEnableContextMenu == false) {
                //alert(rootElement.GetDCWriterString("JS_FailSetContextMenu"));// "无法设置快捷菜单，必须在页面HTML中静态的设置容器DIV元素的ClientContextMenuType属性值。");
                var eventObject = new Object();
                eventObject.Message = rootElement.GetDCWriterString("JS_FailSetContextMenu");
                eventObject.State = rootElement.ErrorInfo.NotSupportedError;
                rootElement.MessageHandler(eventObject);
                return false;
            }
            var menu = win.UEOptions.contextMenu;
            if (menu != null) {
                while (menu.length > 0) {
                    menu.pop();
                }
                if (jsonContextMenu instanceof Array) {
                    for (var iCount = 0; iCount < jsonContextMenu.length; iCount++) {
                        menu.push(jsonContextMenu[iCount]);
                    }
                }
                return true;
            }
        }
        return false;
    };

    //设置预览页面中的自定义快捷菜单
    rootElement.SetPreviewContextMenu = function (jsonContextMenu) {
        rootElement.previewContextMenu = jsonContextMenu;
        var win = this.GetPreviewContentDocument();
        if (win != null && win.UEOptions) {
            if (win.document.runtimeEnableContextMenu == false) {
                //alert(rootElement.GetDCWriterString("JS_FailSetContextMenu"));// "无法设置快捷菜单，必须在页面HTML中静态的设置容器DIV元素的ClientContextMenuType属性值。");
                var eventObject = new Object();
                eventObject.Message = rootElement.GetDCWriterString("JS_FailSetContextMenu");
                eventObject.State = rootElement.ErrorInfo.NotSupportedError;
                rootElement.MessageHandler(eventObject);
                return false;
            }
            var menu = win.UEOptions.contextMenu;
            if (menu != null) {
                while (menu.length > 0) {
                    menu.pop();
                }
                if (jsonContextMenu instanceof Array) {
                    for (var iCount = 0; iCount < jsonContextMenu.length; iCount++) {
                        menu.push(jsonContextMenu[iCount]);
                    }
                }
                return true;
            }
        }
        return false;
    };

    //@method 单(复)选框自定义外观
    //@param url 引入css路径
    rootElement.setCustomizeRadioAndCheckBoxStyle = function (json, url) {
        //引入css
        var doc = rootElement.GetContentDocument();
        DCDomTools.createCssLinkElement(doc, url);
        //事件
        //console.log(json);
        for (var i = 0; i < json.length; i++) {
            var obj = json[i];
            var dc_visualstyle = obj["visualstyle"];
            var cssArr = obj["cssArr"];
            var $input = $(doc).find("input[dc_visualstyle='" + dc_visualstyle + "']");
            //添加css样式
            $input.each(function () {
                if (!$(this).parent().hasClass(cssArr[0])) {
                    $(this).parent().addClass(cssArr[0]);
                }
                if ($(this).prop("checked")) {
                    $(this).parent().addClass(cssArr[1]);
                }
            });
            setSome(cssArr);
        }
        function setSome(cssArr) {
            $(doc).find("body").delegate("." + cssArr[0], "click", function (ev) {
                debugger;
                var ev = window.event || ev;
                var target = ev.srcElement ? ev.srcElement : ev.target;
                if (target.nodeName == "SPAN") {
                    //点击span时，运行input点击事件
                    target.getElementsByTagName("input")[0].click();
                } else if (target.nodeName == "INPUT") {
                    var $inputs = $(doc).find("input[name='" + $(this).find("input").attr("name") + "']");
                    if ($(this).find("input").attr("type") == "radio") {
                        $inputs.each(function () {
                            $(this).parents().removeClass(cssArr[1]);
                        })
                    }
                    $(this).find("input").is(":checked") ? $(this).addClass(cssArr[1]) : $(this).removeClass(cssArr[1]);
                }
            });
        }
    }


    //@method 设置注册码序号。
    //@param index 序号
    //@returns 一个布尔值，表示操作是否成功
    rootElement.SetRegisterCodeIndex = function (index) {
        var url = rootElement.getAttribute("servicepageurl");
        if (url != null && url.length > 0) {
            url = url + "?setregistercodeindex=" + index;
            var result = DCDomTools.PostContentByUrlNotAsync(url, false, "");
            if (result == true && rootElement.Options != null) {
                rootElement.Options.RegisterCodeIndex = index;
            }
            return result;
        }
        return false;
    };

    //@method 设置注册码
    //@param strCode 新注册码。
    //@returns 一个布尔值，表示操作是否成功
    rootElement.SetRegisterCode = function (strCode) {
        var win = this.GetContentWindow();
        if (win != null && win.DCWriterControllerEditor != null) {
            win.DCWriterControllerEditor.SetRegisterCode(strCode);
            return true;
        }
        return false;
    };

    //@method 判断编辑器是否运行在移动设备中。
    rootElement.IsMobileDevice = function () {
        var doc = this.GetContentDocument();
        if (doc != null && doc.body != null && doc.body.getAttribute("ismobiledevice") == "true") {
            return true;
        }
        else {
            return false;
        }
    };

    // 返回字体大小和字体名称
    // 返回一个对象，fontSize 字体大小 单位为px，fontFamily 字体名称
    // {fontSize: "16px", fontFamily: "楷体"} 
    rootElement.getFontObject = function () {
        var win = rootElement.GetContentWindow();
        if (win != null && win.WriterCommandModuleFormat) {
            var fontSize = win.WriterCommandModuleFormat.getFontSize();
            var fontFamily = win.WriterCommandModuleFormat.getFontFamily();
            return {
                "fontSize": fontSize,
                "fontFamily": fontFamily
            }
        }
    };

    rootElement.GetChartElementDataByID = function (id) {
        var doc = rootElement.GetContentDocument();
        var element = doc.getElementById(id);
        if (element === null || element.getAttribute == undefined || element.getAttribute("dctype") !== "XTextChartElement") {
            console.log("SetChartElementDataByID：元素没有找到");
            return false;
        }
        
        var obj = JSON.parse(element.getAttribute("chartdatas"));
        return obj;
    };

    rootElement.SetChartElementDataByID = function (id, obj) {
        var doc = rootElement.GetContentDocument();
        var element = doc.getElementById(id);
        if (element === null || element.getAttribute == undefined || element.getAttribute("dctype") !== "XTextChartElement") {
            console.log("SetChartElementDataByID：元素没有找到");
            return false;
        }
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCChartManager) {
            element.setAttribute("chartdatas", JSON.stringify(obj));
            win.DCChartManager.UpdateChartElement(element);
            return true;
        }
        return false;
    };


    //@method 获得指定编号的元素的文本内容
    //@param id 元素编号
    rootElement.GetElementTextByID = function (id, isHasTag) {
        var win = this.GetContentWindow();
        var returnStr;
        if (win != null && win.DCWriterControllerEditor) {
            //20191108 xuyiming 解决DCWRITER-2931 当报告处于预览状态的时候,调用GetElementTextByID接口获取到的文字只有一行
            if (rootElement.IsPrintPreview() == true) {
                if (typeof (id) == 'string') {
                    var str = "";
                    var iframePreview = document.getElementById(this.id + "_PreviewFrame");
                    var doc = iframePreview.contentWindow.document || iframePreview.contentDocument;
                    var $nodes = $(doc).find("[id='" + id + "']");
                    var lastNode = $nodes[$nodes.length - 1];
                    $nodes.each(function () {
                        str += win.DCWriterControllerEditor.GetElementText(this);
                        if (isHasTag && this != lastNode) {
                            str += "\n";
                        }
                    });
                    returnStr = str;
                } else {
                    returnStr = win.DCWriterControllerEditor.GetElementText(id);
                }
            } else {
                returnStr = win.DCWriterControllerEditor.GetElementText(id, isHasTag);
            }
        }
        // 添加GetElementTextByID获取不到元素,返回null
        if (returnStr == null) {
            return null;
        }
        return returnStr;
    };

    //@method 获得文档中所有的输入域元素
    //@param excludeReadonly :是否排除只读输入域
    //@param excludeHiddenElement :是否排除隐藏输入域
    rootElement.GetAllInputFields = function (excludeReadonly, excludeHiddenElement) {
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCInputFieldManager) {
            return win.DCInputFieldManager.getAllInputFields(excludeReadonly, excludeHiddenElement);
        }
        return false;
    };

    //@method 获得指定编号的元素的文本内容
    //@param id 元素编号，或者文档元素本身。
    //@param newText 新的文本值
    //@returns 返回一个布尔值，表示操作是否成功。
    rootElement.SetElementTextByID = function (id, newText) {
        var win = this.GetContentWindow();
        if (win != null && win.DCWriterControllerEditor && newText != null) {
            newText = newText.toString();
            //BSDCWRIT-186
            var arr = newText.split('\n');
            var str = ""; 
            for (var i = 0; i < arr.length; i++) {
                str += arr[i] + "<br>";
            }
            str = str.substring(0, str.length - 4);
            return win.DCWriterControllerEditor.SetElementText(id, str);
        }
        return "";
    };

    rootElement.SetElementCheckedByID = function (id, checked) {
        var win = this.GetContentWindow();
        if (win != null && win.DCWriterControllerEditor) {
            return win.DCWriterControllerEditor.SetElementCheckedByID(id, checked);
        }
        return false;
    };

    //@method 获得指定编号的元素的innervalue内容(dc_innervalue)
    //@param id 元素编号
    rootElement.GetElementInnerValueStringByID = function (id) {
        var win = this.GetContentWindow();
        if (win != null && win.DCWriterControllerEditor) {
            return win.DCWriterControllerEditor.GetElementInnerValueStringByID(id);
        }
        return "";
    };

    //@method 设置指定编号的元素的innervalue内容(dc_innervalue)
    //@param id 元素编号，或者文档元素本身。
    //@param newText 新的文本值
    //@param newValue 新的value值
    //输入两个值只修改value，输入三个值修改value和text
    //@returns 返回一个布尔值，表示操作是否成功。
    rootElement.SetElementInnerValueStringByID = function (id, newValue, newText) {
        var win = this.GetContentWindow();
        if (win != null && win.DCWriterControllerEditor) {
            return win.DCWriterControllerEditor.SetElementInnerValueString(id, newValue, newText);
        }
        return "";
    };

    //@method 获得被选中的文本内容.
    rootElement.SelectionText = function () {
        var win = this.GetContentWindow();
        if (win != null && win.WriterCommandModuleFile) {
            return win.WriterCommandModuleFile.getSelectionText();
        }
        return null;
    };

    //@method 获得被选中的XML代码.
    rootElement.SelectionXml = function () {
        var win = this.GetContentWindow();
        if (win != null && win.WriterCommandModuleFile) {
            return win.WriterCommandModuleFile.getSelectionXml(false, true);
        }
        return null;
    };

    //@method 获得被选中的文本内容.
    // nativeHtml 是否清理HTML DOM （true:不清理；false或者为空:清理）
    rootElement.SelectionHtml = function (nativeHtml) {//SelectionHtml方法添加参数来判断是否清理HTML的DOM（true:不清理；false或者为空:清理）
        var win = this.GetContentWindow();
        if (win != null && win.WriterCommandModuleFile) {
            return win.WriterCommandModuleFile.getSelectionHtml(false, nativeHtml);
        }
        return null;
    };

    rootElement.GetHtml = function () {
        var win = this.GetContentWindow();
        if (win != null && win.WriterCommandModuleFile) {
            return win.WriterCommandModuleFile.GetFileContentHtml();
        }
        return null;
    };

    // @method 获得当前元素
    // @param funcFilter 过滤器，可以为一个函数，一个指定的NodeName字符串，或者为空。
    rootElement.CurrnetElement = function (funcFilter) {
        var win = this.GetContentWindow();
        if (win != null && win.DCWriterControllerEditor) {
            return win.DCWriterControllerEditor.CurrentElement(funcFilter);
        }
        return null;
    };

    // 返回字体大小
    //徐逸铭 20190522
    rootElement.getFontSize = function () {
        var win = rootElement.GetContentWindow();
        if (win != null && win.WriterCommandModuleFormat) {
            return win.WriterCommandModuleFormat.getFontSize();
        }
    };

    // 获得当前输入域对象
    rootElement.CurrentInputField = function () {
        return this.CurrnetElement(function (element) {
            if (element.getAttribute && element.getAttribute("dctype") == "XTextInputFieldElement") {
                return true;
            }
            return false;
        });
        ////wyc20210126：修正为更准确的判断
        //var win = this.GetContentWindow();
        //if (win !== null && win.DCSelectionManager) {
        //    return win.DCSelectionManager.GetCurrentInputField();
        //} else {
        //    return null;
        //}
    };

    // 获得当前表格行对象
    rootElement.CurrentTableRow = function () {
        var win = this.GetContentWindow();
        if (win !== null && win.WriterCommandModuleTable) {
            return win.WriterCommandModuleTable.getCurrentRow();
        } else {
            return null;
        }
    };

    rootElement.SetTableRowCrossPage = function (tableRow, isCross) {
        if ((isCross === true || isCross === false) && tableRow !== null && tableRow.nodeName.toLowerCase() === "tr") {
            tableRow.setAttribute("dc_newpage", isCross);
            return true;
        } else {
            return false;
        }
    };

    //设置表格的行高
    rootElement.SetTableHeight = function (tableID, newHeight) {
        var doc = rootElement.GetContentDocument();
        var table = doc.getElementById(tableID);
        newHeight = Math.max(newHeight, 15);

        if (table.childNodes[1] && table.childNodes[1].localName == "tbody") {
            var list = table.childNodes[1].childNodes;
            for (var i = 0; i < list.length; i++) {
                list[i].height = parseInt(newHeight);
                list[i].style.height = newHeight + "px";
                list[i].setAttribute("dc_specifyheight", parseInt(newHeight) * 3.125);
                list[i].removeAttribute("height");
            }
        }
        
        //var funcCheckHeight = function () {
        //    if (Math.abs(newHeight - rowElement.offsetHeight) > 3) {
        //        // 高度设置失败，说明高度设置不合理，则删除相关属性。
        //        rowElement.removeAttribute("dc_specifyheight");
        //        rowElement.style.height = "";
        //    }
        //    else {
        //        DCDomTools.BubbleRaiseChanged();
        //    }
        //};
        //window.setTimeout(funcCheckHeight, 10);
    }
    // 获得当前表格单元格对象
    rootElement.CurrentTableCell = function () {
        var win = this.GetContentWindow();
        if (win !== null && win.WriterCommandModuleTable) {
            return win.WriterCommandModuleTable.getCurrentCell();
        } else {
            return null;
        }
    };

    rootElement.SetTableCellBorder = function (cellElement,options) {
        var win = this.GetContentWindow();
        if (win !== null && win.WriterCommandModuleTable) {
            win.WriterCommandModuleTable.setTableCellBorder(cellElement, options);
        }
    };

    rootElement.SetTableBorder = function (tableElement, options) {
        var win = this.GetContentWindow();
        if (win !== null && win.WriterCommandModuleTable) {
            win.WriterCommandModuleTable.setTableBorder(tableElement, options);
        }
    };

    rootElement.SetFieldDropListFont = function (fontname, fontsize) {
        var win = this.GetContentWindow();
        if (win !== null && win.WriterCommandModuleTable) {
            win.DCInputFieldManager.FontName = fontname;
            win.DCInputFieldManager.FontSize = fontsize;
        }
    };

    // 获得当前表格对象
    rootElement.CurrentTable = function () {
        var win = this.GetContentWindow();
        if (win !== null && win.WriterCommandModuleTable) {
            return win.WriterCommandModuleTable.getCurrentTable();
        } else {
            return null;
        }
    };



    // 获得当前选中区域
    rootElement.DocumentSelection = function () {
        var win = this.GetContentWindow();
        if (win != null && win.DCSelectionManager) {
            return win.DCSelectionManager.getSelection();
        }
    };

    rootElement.getServerInfoJson = function () {
        var url = this.getAttribute("servicepageurl") + "?getserverinfo=1&tick=" + Math.random().toString();
        var txt = DCDomTools.GetContentByUrlNotAsync(url);
        var result = JSON.parse(txt);
        return result;
    };

    //@method 设置状态栏文本
    rootElement.SetStatusText = function (text) {
        var ctl = rootElement.StatusUIElement;
        if (ctl == null) {
            ctl = rootElement.getAttribute("statusuielement");
        }
        if (typeof (ctl) == "string") {
            ctl = document.getElementById(ctl);
        }
        if (ctl != null) {
            if (typeof (ctl) == "function") {
                ctl.call(this, text);
            }
            else if (ctl.nodeName) {
                ctl.innerText = text;
            }
        }
        //console.log("DCWriter:" + text);
    };

    //@methdod 根据BASE64字符串插入图片
    //@param jsonText Base64字符串
    rootElement.InsertImageByJsonText = function (jsonText) {
        var win = this.GetContentWindow();
        if (win != null && win.DCFileUploadManager != null) {
            win.DCFileUploadManager.InsertImageByJsonText(jsonText);
        }
    };

    if (rootElement.getAttribute("contentrendermode") == "ActiveXControl") {
        // 采用ActiveX控件的形式
        document.addEventListener("onkeydown", function (eventObj) {
            if (eventObj.keyCode == 8) {
                // 首先让编辑器试图处理back键
                if (rootElement.HandleBackspace() == true) {
                    // 若编辑器成功的处理了back键，则浏览器无需处理
                    return false;
                }
            }
            return true;
        });
    }

    // 获得显示文档内容的容器窗体对象
    rootElement.GetContentWindow = function (forceUseEditFrame) {
        var iframe = document.getElementById(this.id + "_Frame");
        var previewframe = document.getElementById(this.id + "_PreviewFrame");
        if (forceUseEditFrame === true) {
            if (iframe != null) {
                return iframe.contentWindow;
            } else {
                return null;
            }           
        } else if (forceUseEditFrame === false) {
            if (previewframe != null) {
                return previewframe.contentWindow;
            } else {
                return null;
            }
        }
        //wyc20210224：不强制指定时编辑预览窗体哪个显示就返回哪个
        else if (iframe != null && iframe.style.display != "none") {
            return iframe.contentWindow;
        } else if (previewframe != null && previewframe.style.display != "none") {
            return previewframe.contentWindow;
        } else {
            return null;
        }
   
        //if (iframe == null) {
        //    return null;
        //}
        //else if (iframe.style.display != "none") {
        //    return iframe.contentWindow;
        //}
        ////wyc20200605:预览模式下新增机制强制使用编辑模式下的frame和相关功能
        //if (forceUseEditFrame === true) {
        //    iframe = document.getElementById(this.id + "_Frame");
        //} else if (forceUseEditFrame === false){
        //    iframe = document.getElementById(this.id + "_PreviewFrame");
        //}
        //if (iframe != null) {
        //    return iframe.contentWindow;
        //}
        //return null;
    };

    // 获得显示文档内容的容器窗体对象
    rootElement.GetContentDocument = function () {
        var iframe = document.getElementById(this.id + "_Frame");
        if (iframe == null) {
            return null;
        }
        else {
            return iframe.contentWindow.document;
        }
    };
    //获取预览页面的document
    rootElement.GetPreviewContentDocument = function () {
        var iframe = document.getElementById(this.id + "_PreviewFrame");
        if (iframe == null) {
            return null;
        }
        else {
            return iframe.contentWindow.document;
        }
    };

    // 获得显示文档内容的容器窗体对象
    rootElement.GetContentContainer = function () {
        var iframe = document.getElementById(this.id + "_Frame");
        if (iframe == null) {
            return null;
        }
        else {
            return iframe.contentWindow.document.getElementById("divDocumentBody_0");
        }
    };

    //清除正文内容
    rootElement.ClearDocumentBody = function () {
        var iframe = document.getElementById(this.id + "_Frame");
        if (iframe == null) {
            return false;
        }
        else {
            var result = iframe.contentWindow.document.getElementById("divDocumentBody_0").innerHTML = "<p><br></p>";
            if (result == "<p><br></p>") {
                return true;
            }
        }
        return false;
    };

    //拖放对象,触发对象
    this.id = rootElement.id;
    rootElement.frameElement = document.getElementById(rootElement.id + "_Frame");

    //DCDomTools.SetFrameInnerHTML(rootElement.frameElement, htmlSourceElement.value);
    //htmlSourceElement.parentNode.removeChild(htmlSourceElement);

    // 检查HTML内容是否正确
    rootElement.checkResponseContent = function (responseText) {
        if (responseText != null && typeof (responseText) == "string") {
            if (responseText.indexOf("dcwritersessiontimeoutflag") >= 0) {
                // 出现了会话超时标记
                var doc = this.GetContentDocument();
                if (doc != null) {
                    var lbl = doc.getElementById("divAlertSessionTimeout");
                    if (lbl != null) {
                        lbl.style.display = "";
                    }
                }
                //alert(rootElement.GetDCWriterString("JS_SessionTimeout"));
                var eventObject = new Object();
                eventObject.Message = rootElement.GetDCWriterString("JS_SessionTimeout");
                eventObject.State = rootElement.ErrorInfo.Error;
                rootElement.MessageHandler(eventObject);
                rootElement.HiddenAppProcessing();
                return false;
            }
        }
        return true;
    };

    // 初始化控件属性值
    var funcInitPropertyInstance = function () {
        // 获得承载内容的window对象 
        //rootElement.contentWindow = rootElement.frameElement.contentWindow;
        //if (rootElement.contentWindow != null) {
        //    // 获得内容文档对象
        //    rootElement.contentDocument = rootElement.contentWindow.document;
        //}
        //if (rootElement.contentDocument != null) {
        //    // 获得文档内容正文对象
        //    rootElement.contentBody = rootElement.contentDocument.body;
        //    rootElement.contentDocument.WriterControl = rootElement;
        //}
        // 服务器页面地址
        rootElement.servicePageURL = rootElement.getAttribute("ServicePageURL");
        //rootElement.frameElement.RootWriterControl = rootElement;
        // 设置文档配置
        var doc = rootElement.GetContentDocument();
        if (rootElement.DocumentOptions != null && doc != null) {
            doc.Options = rootElement.DocumentOptions;
        }
    }

    funcInitPropertyInstance();

    var contentRenderMode = rootElement.getAttribute("contentrendermode");
    if (contentRenderMode == "") {

    }
    // 设置控件处于鼠标拖拽滚动模式
    // @setValue 布尔值，是否设置拖拽滚动模式
    rootElement.setMouseDragScrollMode = function (setValue, specifyIFrame) {
        //rootElement.MouseDragScrollMode = setValue;

        var funcSetCursor = function (doc) {
            var tab = doc.getElementById("dctable_AllContent");
            if (tab != null) {
                if (setValue) {
                    tab.style.cursor = "";
                }
                else {
                    tab.style.cursor = "auto";
                }
            }

        }
        //if (this.contentBody == null) {
        //    // 文档还未加载完成
        //    this.dcondocumentload_SetDragScrollMode = function () {
        //        DCDomTools.setMouseDragScrollMode(
        //            this.body,
        //            setValue);
        //        funcSetCursor();
        //    }
        //    return;
        //}
        //else {
        //    this.dcondocumentload_SetDragScrollMode = null;
        //}

        var iframe = document.getElementById(this.id + "_PreviewFrame");
        if (iframe == null || iframe.offsetHeight == 0) {
            iframe = document.getElementById(this.id + "_Frame");
        }
        if (specifyIFrame != null) {
            iframe = specifyIFrame;
        }
        if (iframe != null
            && iframe.contentWindow != null
            && iframe.contentWindow.document != null
            && iframe.contentWindow.document.body != null) {
            iframe.contentWindow.MouseDragScrollMode = setValue;
            var doc = iframe.contentWindow.document;
            var result = DCDomTools.setMouseDragScrollMode(doc.body, setValue);
            funcSetCursor(doc);
            return result;
        }

        //if (rootElement.contentWindow != null
        //    && rootElement.contentWindow.document.body != null) {
        //    var result = this.contentWindow.DCDomTools.setMouseDragScrollMode(
        //        this.contentWindow.document.body,
        //        setValue);
        //    funcSetCursor();
        //    return result;
        //}
        return false;
    };

    //    rootElement.IsMouseDragScrollMode = function () {
    //        if (this.frameWindow != null
    //            && this.frameWindow.DCDomTools != null
    //            && this.frameWindow.document.body != null) {
    //            return this.frameWindow.DCDomTools.IsMouseDragScrollMode(
    //                this.frameWindow.document.body);
    //        }
    //        return false;
    //    };


    // 触发编辑器客户端事件
    rootElement.raiseDCClientEvent = function (eventObject, eventName) {
        if (eventObject != null && eventObject.cancelBubble == true) {
            // 参数指明不再触发后续事件
            return;
        }
        var func = this[eventName];
        if (typeof (func) == "function") {
            return func.call(rootElement, eventObject);
        }
        var script = this.getAttribute(eventName);
        if (script != null && script.length > 0) {
            var func = window[script];
            if (typeof (func) == "function") {
                func.call(rootElement, eventObject);
            }
            else {
                //eval.apply(rootElement);
                return eval.call(rootElement, script);
            }
        }
    };

    //@method 移动输入焦点到指定地点
    //@param sWhere 要移动的目标,可选值有beforeBegin,afterBegin,beforeEnd,afterEnd
    //@param element 要移动的元素对象
    //@returns true:完成了操作，移动了插入点位置。false:没有完成操作。
    rootElement.FocusAdjacent = function (sWhere, element) {
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCInputFieldManager) {
            return win.DCInputFieldManager.FocusAdjacent(sWhere, element);
        }
        return false;
    };

    // 获得对象在文档视图中的绝对左边边界。
    rootElement.GetAbsBoundsInDocument = function () {
        return DCDomTools.GetAbsBoundsInDocument(rootElement);
    };

    //@method 对文档根元素列表进行排序
    //@param sortFunction 两个节点内容比较函数
    //@root 根节点对象，如果为空，则获得文档中正文容器元素。
    //@returns true:操作修改了文档内容;false:没有修改文档内容。
    rootElement.SortRootContent = function (sortFunction, root) {
        if (root != null) {
            var result = DCDomTools.sortChildNodes(root, sortFunction);
            return result;
        } 
        var doc = this.GetContentDocument();
        if (doc != null) {
            var root = doc.getElementById("divDocumentBody_0");
            if (root != null) {
                var result = DCDomTools.sortChildNodes(root, sortFunction);
                return result;
            }
        }
        return false;
    };

    //@method 设置续打模式
    //@param setValue 布尔值，是否启用续打模式。
    rootElement.SetJumpPrintMode = function (setValue) {
        var iframePreview = document.getElementById(this.id + "_PreviewFrame");
        if (iframePreview != null && iframePreview.offsetHeight == 0) {
            // 有打印预览区域，但没有显示出来，则处理失败。
            return false;
        }
        if (iframePreview == null) {
            iframePreview = document.getElementById(this.id + "_Frame");
        }
        if (iframePreview != null) {
            iframePreview.contentWindow.WriterCommandModuleFile.JumpPrintModeCommand(setValue);
            return true;
        }
        return false;
    };
    //获取最后一次续打位置
    rootElement.GetLastJumpPrintPosition = function () {
        var iframePreview = document.getElementById(this.id + "_PreviewFrame");
        if (iframePreview == null) {
            iframePreview = document.getElementById(this.id + "_Frame");
        }
        if (iframePreview != null) {
            var p = iframePreview.contentWindow.WriterCommandModuleFile.LastJumpPrintPosition;
            return p;
        }
        return null;
    };
    //设置续打位置
    rootElement.SetLastJumpPrintPosition = function (position,endposition) {
        var iframePreview = document.getElementById(this.id + "_PreviewFrame");
        if (iframePreview == null) {
            iframePreview = document.getElementById(this.id + "_Frame");
        }
        if (iframePreview != null) {
            var p = iframePreview.contentWindow.WriterCommandModuleFile.SetJumpPrintPosition(position, endposition);
            return p;
        }
        return false;
    };

    //@method 获取文档页数
    rootElement.GetDocumentPageNum = function () {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcgetdocumentpagenum=xml" +
            "&tick=" + new Date().valueOf();
        //WYC20191221：新增是否进行BASE64转码的标记
        if (this.IsUseBase64Transfer() == true) {
            url = url + "&transformusebase64=true";
        }
        // 创建服务URL地址
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”
        var postData = this.GetContentHtml(true, true);
        var result = null;

        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    var resultstring = DCDomTools.HTMLDecode(responseData.result);
                    result = parseInt(resultstring);
                } else {
                    rootElement.RuntimeError(responseData.message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: false,
            data: postData,
            error: function (responseText, textStatus, jqXHR) {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        return result;
    };

    //@method 打印文档
    rootElement.PrintDocument = function (settings) {
        var iframeContent = document.getElementById(this.id + "_Frame");
        if (iframeContent.style.display != "none") {
            // 正在编辑文档内容，则直接打印文档
            var doc = rootElement.GetContentDocument();
            // 20200622 xuyiming 修复分页预览模式下无法打印文档问题
            if (doc.body.getAttribute("contentrendermode") == "PagePreviewHtml") {
                iframeContent.contentWindow.WriterCommandModuleFile.FilePrint(settings);
            } else {
                var postData = this.GetContentHtml(true, true);
                return this.InnerLoadPrintPreview("getprintpreview", postData, true, settings);
            }
        }
        else {
            var iframePreview = document.getElementById(this.id + "_PreviewFrame");
            if (iframePreview != null && iframePreview.offsetHeight == 0) {
                // 有打印预览区域，但没有显示出来，则处理失败。
                return false;
            }
            if (iframePreview == null) {
                iframePreview = document.getElementById(this.id + "_Frame");
            }
            if (iframePreview != null) {
                // 处于打印预览，则打印正在预览的内容。
                iframePreview.contentWindow.WriterCommandModuleFile.FilePrint(settings);
            }
        }
    };

    // 获得本地WEB服务器页面地址
    rootElement.GetLocalServicePageUrl = function () {
        var port = rootElement.getAttribute("localserverport");
        if (port == "99999") {
            // 特殊的标记，直接返回远程服务器页面地址，进入调试状态。
            return rootElement.getAttribute("servicepageurl");
        }
        if (port == null || port.length == 0) {
            port = "2020";// 默认端口号定义在C#代码RunClientConfig.DefaultLocalServerPort中。
        }
        if (port != null && port.length > 0 && isNumber(port)) {
            var dcasmversion = rootElement.getAttribute("dcasmversion");
            var url = "http://localhost:" + port + "/";
            // 执行本地服务器测试
            var testResult = DCDomTools.GetContentByUrlNotAsync(url + "?runclient=test" + dcasmversion);
            if (testResult != null) {
                if (testResult.indexOf("ok") >= 0) {
                    // 测试通过
                    return url;
                }
            }
            // 执行远程服务器测试。
            var startUrl = rootElement.getAttribute("servicepageurl");
            testResult = DCDomTools.GetContentByUrlNotAsync(startUrl + "?runclient=test" + dcasmversion);
            if (testResult != null && testResult.indexOf("ERROR:") >= 0)
            {
                window.alert(testResult);
                return null;
            }
            window.open(
                startUrl + "?runclient=getexe" + dcasmversion + "&port=" + port,
                "_blank");
            alert("将运行本地WEB服务器，发布地址为【" + url + "】,正在下载EXE程序文件，请下载后点击运行EXE程序文件。然后在浏览器中重复本次操作。");
        }
        return null;
    };

    //20200805:后端WC_DCWriterFrontEndPrint测试
    rootElement.LocalPrintDocument = function (options) {

        var showuistring = options != null && options.ShowUI != null && (options.ShowUI === true || options.ShowUI === "true") ? "true" : "false";
        var printername = options != null && options.PrinterName != null ? options.PrinterName.toString() : "";
        var printpagerange = options != null && options.PrintPageRange != null ? options.PrintPageRange.toString() : "";
        var asyncvar = options != null && options.Async != null && (options.Async == true || options.Async == "true") ? true : false;

        var offsetx = options != null && options.OffsetX != null ? options.OffsetX.toString() : "";
        var offsety = options != null && options.OffsetY != null ? options.OffsetY.toString() : "";
        var autofitpagesize = options != null && options.AutoFitPageSize != null && (options.AutoFitPageSize === true || options.AutoFitPageSize === "true") ? "true" : "false";

        // 获得服务器页面地址
        var servicePageUrl = rootElement.GetLocalServicePageUrl();// rootElement.getAttribute("servicepageurl");
        if (servicePageUrl == null || servicePageUrl.length == 0) {
            // 操作失败
            return false;
        }
        var url = servicePageUrl + "?dcwriterfrontendprint=1"
            + "&showui=" + showuistring
            + "&printername=" + printername
            + "&printpagerange=" + printpagerange
            + "&offsetx=" + offsetx
            + "&offsety=" + offsety
            + "&autofitpagesize=" + autofitpagesize
            + "&tick=" + new Date().valueOf();
        // 创建服务URL地址b
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”

        //WYC20200106：新增是否进行BASE64转码的标记
        if (this.IsUseBase64Transfer() == true) {
            url = url + "&transformusebase64=true";
        }

        var htmlContent = "";
        var win = this.GetContentWindow(true);
        if (win != null && win.WriterCommandModuleFile) {
            htmlContent = win.WriterCommandModuleFile.GetFileContentHtml();
            htmlContent = win.WriterCommandModuleFile.EncodeContentHtmlForPost(htmlContent);
        }
        var result = false;
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {
                var temparray = responseText.split("$dcsuccesssplit$");
                var success = temparray[0];
                var temparray2 = temparray[1].split("$dcmessageplit$");
                var responsehtml = temparray2[1];
                var message = temparray2[0];
                if (success == "true") {
                    result = true
                } else {
                    rootElement.RuntimeError(message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: asyncvar,
            data: htmlContent,
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        return result;
    }

    //wyc20200917:利用前端服务打印批量文档
    rootElement.LocalPrintDocuments = function (options) {

        if (options == undefined || options == null || Array.isArray(options.Files) == false) {
            console.log("需要从options.Files中接收要打印的XML文件数组");
            return;
        }
        var showuistring = options != null && options.ShowUI != null && (options.ShowUI === true || options.ShowUI === "true") ? "true" : "false";
        var printername = options != null && options.PrinterName != null ? options.PrinterName.toString() : "";
        var printpagerange = options != null && options.PrintPageRange != null ? options.PrintPageRange.toString() : "";
        var asyncvar = options != null && options.Async != null && (options.Async == true || options.Async == "true") ? true : false;

        // 获得服务器页面地址
        var servicePageUrl = rootElement.GetLocalServicePageUrl();// rootElement.getAttribute("servicepageurl");
        if (servicePageUrl == null || servicePageUrl.length == 0) {
            // 操作失败
            return false;
        }
        var url = servicePageUrl + "?dcwriterfrontendprintspecifyxml=1"
            + "&showui=" + showuistring
            + "&printername=" + printername
            + "&printpagerange=" + printpagerange
            + "&tick=" + new Date().valueOf();

        // 创建服务URL地址b
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”

        var result = false;
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {
                var temparray = responseText.split("$dcsuccesssplit$");
                var success = temparray[0];
                var temparray2 = temparray[1].split("$dcmessageplit$");
                var responsehtml = temparray2[1];
                var message = temparray2[0];
                if (success == "true") {
                    result = true
                } else {
                    rootElement.RuntimeError(message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: asyncvar,
            data: JSON.stringify(options.Files),
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        return result;
    }


    //20200110 xuyiming 添加传入打印预览的HTML获取打印时的HTML接口GetPrintNowHTML
    //wyc20200624：将代码合并进getprintpreviewhtml内
    rootElement.GetPrintNowHTML = function (xmlstring) {
        if (xmlstring == null) {
            return false;
        }
        
        var isLandscape = xmlstring.indexOf("landscape=\"True\"") == -1 ? false : true;
        var div = document.createElement("div");
        div.innerHTML = xmlstring;
        var dcRootCenter = div.querySelector("#dcRootCenter");
        $(dcRootCenter).find("div[name = dcHiddenElementForPrint]").hide();
        var tables = dcRootCenter.querySelectorAll("table");
        for (var iCount = 0; iCount < tables.length; iCount++) {
            var table = tables[iCount];
            if (table.id == "dctable_AllContent") {
                if (table.getAttribute("haspageborder") != "true") {
                    // 没有页面边框，则设置表格边框为空。
                    table.style.border = "0px none white";
                }
                if (table.style.removeAttribute) {
                    table.style.removeAttribute("border-radius");
                }
                table.style.borderRadius = "";
                var contentRow = table.rows[0];
                if (table.rows) {
                    contentRow = table.rows[0];
                }
                else if (table.firstChild.nodeName == "TD") {
                    contentRow = table.firstChild;
                }
                else if (table.firstChild.nodeName == "TBODY") {
                    contentRow = table.firstChild.firstChild;
                }
                if (contentRow != null) {
                    contentRow.removeAttribute("height");
                }
                for (var iCount2 = 0; iCount2 < contentRow.childNodes.length; iCount2++) {
                    var tdNode = contentRow.childNodes[iCount2];
                    if (tdNode.nodeName == "TD") {
                        if (tdNode.id == "dcGlobalRootElement") {
                            tdNode.width = "";
                        }
                    }
                }
            } //if
        } //for
        var ps = "@page{margin-left:0cm;margin-top:0cm;margin-right:0cm;margin-bottom:0cm;";
        if (isLandscape) {
            ps += "size: landscape;";
        }
        ps += "}";
        var html = "<html><head><style> P{margin:0px}  " + ps + " </style>";
        var styleString = "";
        var styleElement = div.querySelector("#dccontentstyle");
        if (styleElement != null) {
            styleString = styleElement.innerHTML;
        }
        styleElement = div.querySelector("#dccustomcontentstyle");
        if (styleElement != null) {
            styleString = styleString + "\r\n" + styleElement.innerHTML;
        }
        if (styleString.length > 0) {
            html = html + "<style>" + styleString + "</style>";
        }
        html = html + "<style>.hiddenforprint{display:none;}</style>";
        html = html + "</head><body style='padding-left:1px;padding-top:0px;padding-right:0px;padding-bottom:0px;margin:0px"
        html = html + "'>" + dcRootCenter.innerHTML;
        html = html + "</body></html>";
        return html;
    }

    //@method 传入html打印文档
    rootElement.PrintByHtml = function (string, settings) {
        var PrintWindowWidth = "450";
        var PrintWindowHeight = "470";
        var PrintWindowTop = "100";
        var PrintWindowLeft = "400";
        var autoClose = true;
        if (settings != null && settings.AutoClose && (settings.AutoClose == false || settings.AutoClose == "false")) {
            autoClose = false;
        }
        if (settings != null && settings.PrintWindowWidth) {
            PrintWindowWidth = settings.PrintWindowWidth.toString();//parseInt(settings.PrintWindowWidth);
        }
        if (settings != null && settings.PrintWindowHeight) {
            PrintWindowHeight = settings.PrintWindowHeight.toString();//parseInt(settings.PrintWindowWidth);
        }
        if (settings != null && settings.PrintWindowTop) {
            PrintWindowTop = settings.PrintWindowTop.toString();//parseInt(settings.PrintWindowWidth);
        }
        if (settings != null && settings.PrintWindowLeft) {
            PrintWindowLeft = settings.PrintWindowLeft.toString();//parseInt(settings.PrintWindowWidth);
        }
        var oPrntWin = window.open("", "_blank", "width=" + PrintWindowWidth + ",height=" + PrintWindowHeight + ",left=" + PrintWindowLeft + ",top=" + PrintWindowTop + ",menubar=yes,toolbar=no,location=no,scrollbars=yes,resizable=yes");

        var html = rootElement.GetPrintNowHTML(string);
        oPrntWin.document.write(html);
        $(oPrntWin.document).ready(function () {
            if (document.WriterControl != null
                && document.WriterControl.EventBeforePrint != null
                && typeof (document.WriterControl.EventBeforePrint) == "function") {
                if (document.WriterControl.EventBeforePrint.call(
                    document.WriterControl,
                    oPrntWin.document) === false) {
                    //wyc20200709：若返回false直接关闭窗体不打印了
                    oPrntWin.close();
                    return;
                }
            }
            setTimeout(function () {
                oPrntWin.print();
                if (autoClose === true) {
                    oPrntWin.close(); // 关闭弹出式窗体
                }
            }, 100);
        });

    }

    // 获得打印工具条对象
    rootElement.GetToolbarForPrintPreview = function () {
        var tbr = this.ToolbarForPrintPreview;
        if (tbr == null) {
            tbr = this.getAttribute("toolbarforprintpreview");
        }
        if (tbr != null && typeof (tbr) == "string") {
            tbr = document.getElementById(tbr);
        }
        return tbr;
    };

    //@method 关闭打印预览
    rootElement.ClosePrintPreview = function () {
        var iframeContent = document.getElementById(this.id + "_Frame");
        var iframePreview = document.getElementById(this.id + "_PreviewFrame");
        if (iframePreview == null) {
            return false;
        }
        iframeContent.style.display = "";
        iframePreview.style.display = "none";
        // 获得打印用的工具条
        var tbr = this.GetToolbarForPrintPreview();
        if (tbr != null) {
            tbr.style.display = "none";
        }
        iframePreview.contentWindow.document.write("");
        iframePreview.contentWindow.document.close();
        return true;
    };

    //获取 条形码/二位码
    rootElement.CreateBarcodeElement = function (options, flag) {
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCBarcodeManager != null) {
            var result = win.DCBarcodeManager.createBarcodeElement(options, flag);
            return result;
        }
        
    }
    //@method 留痕合并文档，并以打印预览的方式展示。
    //@param args.OldUserID 旧用户名
    //@param args.OldUerName 旧用户姓名
    //@param args.OldSaveTime 旧的文件保存时间
    //@param args.OldPermissionLevel 旧的文件保存时间
    //@param args.OldFileName 旧文件名
    //@param args.NewUserID  新用户编号
    //@param args.NewUserName 新用户名
    //@param args.NewSaveTime 新文件保存时间
    //@param args.NewPermissionLevel 新文件保存时间
    //@param args.NewFileName 新文件名
    //@param args.FileFormat 文件格式
    rootElement.MergeDocumentByFileName = function (args) {
        if (args == null) {
            // 参数为空
            return false;
        }
        args.FileNameMode = true;
        args.ClientOptions = this.GetWebWriterControlOptionString();
        var postData = JSON.stringify(args);
        return this.InnerLoadPrintPreview("dcmergedocument", postData);
    };

    //@method 留痕合并文档，并以打印预览的方式展示。
    //@param args.OldUserID 旧用户名
    //@param args.OldUerName 旧用户姓名
    //@param args.OldSaveTime 旧的文件保存时间
    //@param args.OldPermissionLevel 旧的文件保存时间
    //@param args.OldFileContent 旧文件内容
    //@param args.NewUserID  新用户编号
    //@param args.NewUserName 新用户名
    //@param args.NewSaveTime 新文件保存时间
    //@param args.NewPermissionLevel 新文件保存时间
    //@param args.NewFileContent 新文件内容
    //@param args.FileFormat 文件格式
    rootElement.MergeDocumentByFileContent = function (args) {
        if (args == null) {
            // 参数为空
            return false;
        }
        args.FileNameMode = false;
        args.ClientOptions = this.GetWebWriterControlOptionString();
        var postData = JSON.stringify(args);
        return this.InnerLoadPrintPreview("dcmergedocument", postData, false);//20200807 xym 修复留痕合并文档显示工具条
    };



    //@method 判断当前控件是否处于打印预览模式。
    rootElement.IsPrintPreview = function () {
        var iframePreview = document.getElementById(this.id + "_PreviewFrame");
        if (iframePreview == null) {
            return false;
        }
        if (iframePreview.style.display == "none") {
            return false;
        }
        return true;
    };

    //@method 加载打印预览
    //@param container 承载打印预览内容的HTML容器元素
    rootElement.LoadPrintPreview = function (settings) {
        var postData = this.GetContentHtml(true, true);
        return this.InnerLoadPrintPreview("getprintpreview", postData, false, settings);
    };

    //@method 加载打印预览
    //@param container 承载打印预览内容的HTML容器元素
    rootElement.LoadPrintPreviewWithPermissionMark = function (settings) {
        var postData = this.GetContentHtml(true, true);
        if (settings === undefined || settings === null) {
            settings = {
                "ShowPermissionMark": true,
                "ShowPermissionTip": true,
                "ShowLogicDeletedContent": true
            }
        } else {
            settings.ShowPermissionMark = true;
            settings.ShowPermissionTip = true;
            settings.ShowLogicDeletedContent = true;
        }
        return this.InnerLoadPrintPreview("getprintpreview", postData, false, settings);
    };

    //@method 获取打印预览时的HTML
    rootElement.GetPrintPreviewHTML = function (settings) {
        var dcRootCenter = null;
        var isLandscape = false;
        //如果在预览状态下则直接取dcRootCenter，否则通过请求后台获取预览HTML
        if (this.IsPrintPreview() == true) {
            dcRootCenter = document.getElementById(rootElement.id + "_PreviewFrame").contentWindow.document.body.querySelector("#dcRootCenter");
        } else {          
            var resultHTML = "";
            var postData = this.GetContentHtml(true, true);
            var servicePageUrl = this.getAttribute("servicepageurl");
            // 创建服务URL地址
            var url = servicePageUrl + "?getprintpreview=1&tick=" + new Date().valueOf();
            if (settings != null && settings.PageIndexs != null && settings.PageIndexs.length > 0) {
                // 传递页码序号。
                url = url + "&pageindexs=" + settings.PageIndexs;
            }

            //WYC20191220：新增根据参数让后台输出留痕预览
            if (settings != null && (settings.ShowPermissionMark === true
                || settings.ShowPermissionMark === "true")) {
                url = url + "&showpermissionmark=true";
            }
            if (settings != null && (settings.ShowLogicDeletedContent === true
                || settings.ShowLogicDeletedContent === "true")) {
                url = url + "&showlogicdeletedcontent=true";
            }
            if (settings != null && (settings.ShowPermissionTip === true
                || settings.ShowPermissionTip === "true")) {
                url = url + "&showpermissiontip=true";
            }

            //WYC20191221：新增是否进行BASE64转码的标记
            if (this.IsUseBase64Transfer() == true) {
                url = url + "&transformusebase64=true";
            }

            var settings2 = {
                method: "POST",
                type: "POST",
                data: postData,
                processData: false,
                async: false
            };

            if (typeof (contextObj) != "undefined") {
                settings2.context = contextObj;
            }
            DCDomTools.fixAjaxSettings(settings2);
            $.ajax(
                url,
                settings2
            ).always(function (responseText, textStatus, jqXHR) {
                if (typeof (responseText) == "object") {
                    responseText = responseText.responseText;
                }
                if (responseText == null || responseText.length == 0) {
                    // 遇到过responseText参数类型为#document类型，因此额外再尝试读取数据。YYF2020-3-20
                    if (typeof (jqXHR) == "object") {
                        responseText = jqXHR.responseText;
                    }
                }
                resultHTML = responseText;
            });

            //wyc20200624整合之前的getprintnowhtml的代码
            isLandscape = resultHTML.indexOf("landscape") == -1 ? false : true;
            var div = document.createElement("div");
            div.innerHTML = resultHTML;
            dcRootCenter = div.querySelector("#dcRootCenter");
        }

        $(dcRootCenter).find("div[name = dcHiddenElementForPrint]").hide();
        var tables = dcRootCenter.querySelectorAll("table");
        for (var iCount = 0; iCount < tables.length; iCount++) {
            var table = tables[iCount];
            if (table.id == "dctable_AllContent") {
                if (table.getAttribute("haspageborder") != "true") {
                    // 没有页面边框，则设置表格边框为空。
                    table.style.border = "0px none white";
                }
                if (table.style.removeAttribute) {
                    table.style.removeAttribute("border-radius");
                }
                table.style.borderRadius = "";
                var contentRow = table.rows[0];
                if (table.rows) {
                    contentRow = table.rows[0];
                }
                else if (table.firstChild.nodeName == "TD") {
                    contentRow = table.firstChild;
                }
                else if (table.firstChild.nodeName == "TBODY") {
                    contentRow = table.firstChild.firstChild;
                }
                if (contentRow != null) {
                    contentRow.removeAttribute("height");
                }
                for (var iCount2 = 0; iCount2 < contentRow.childNodes.length; iCount2++) {
                    var tdNode = contentRow.childNodes[iCount2];
                    if (tdNode.nodeName == "TD") {
                        if (tdNode.id == "dcGlobalRootElement") {
                            tdNode.width = "";
                        }
                    }
                }
            } //if
        } //for
        var ps = "@page{margin-left:0cm;margin-top:0cm;margin-right:0cm;margin-bottom:0cm;";
        if (isLandscape) {
            ps += "size: landscape;";
        }
        ps += "}";
        var html = "<html><head><style> P{margin:0px}  " + ps + " </style>";
        var styleString = "";
        var styleElement = dcRootCenter.querySelector("#dccontentstyle");
        if (styleElement != null) {
            styleString = styleElement.innerHTML;
        }
        styleElement = dcRootCenter.querySelector("#dccustomcontentstyle");
        if (styleElement != null) {
            styleString = styleString + "\r\n" + styleElement.innerHTML;
        }
        if (styleString.length > 0) {
            html = html + "<style>" + styleString + "</style>";
        }

        //wyc2020062：在这里添加处理续打的遮罩：抄代码
        var MaskImgHTML = "";
        var printdocument = document.getElementById(rootElement.id + "_PreviewFrame").contentWindow.document;
        var win = rootElement.GetContentWindow();
        if (win.WriterCommandModuleFile.IsJumpPrintMode() == true) {
            // 处于续打模式
            var jumpMask = printdocument.getElementById("divJumpPrintMask");
            var h = jumpMask.offsetHeight - 3;//修改续打时一些细微差别
            //记录最后一次续打的位置
            var divs = printdocument.getElementsByTagName("DIV");
            for (var iCount = divs.length - 1; iCount >= 0; iCount--) {
                var divHeader = divs[iCount];
                if (divHeader.id == "divXTextDocumentHeaderElement") {
                    // 遍历所有的页眉元素，修正续打位置
                    var startPageIndex = parseInt(divHeader.getAttribute("pageindex"));
                    var headerTop = win.DCDomTools.GetViewTopInDocument(divHeader);
                    if (headerTop <= h) {
                        // 这页出现了续打
                        var jumpPrintPos = h - headerTop;
                        var imgSrc = printdocument.body.getAttribute("servicepageurl") + "?dcwritergetwhiteimage=1";
                        var isLandscape = printdocument.body.getAttribute("landscape") == "true";
                        if (isLandscape) {
                            var strMask = "<img id='jumpPrintMask' pageindex='" + startPageIndex + "' jumppos='" + jumpPrintPos + "' src='" + imgSrc + "' style='position:absolute;    transform-origin: 0 0;transform: rotate(-90deg);;background-color:white;z-index:10000;left:-5px;top:1100px; width: 1100px;height:" + h + "px;border:1px solid white' />"; //IE7不支持rotate
                        } else {
                            var strMask = "<img id='jumpPrintMask' pageindex='" + startPageIndex + "' jumppos='" + jumpPrintPos + "' src='" + imgSrc + "' style='position:absolute;background-color:white;z-index:10000;left:-1px;top:0px;width:100%;height:" + h + "px;border:1px solid white' />";

                        }
                        MaskImgHTML = strMask;
                        for (var pi = 0; pi < rootElement.childNodes.length; pi++) {
                            var pdiv = rootElement.childNodes[pi];
                            if (pdiv.innerHTML != undefined) {
                                var pi2 = parseInt(pdiv.getAttribute("pageindex"));
                            }

                            if (isNaN(pi2) == false && pi2 >= startPageIndex) {
                                MaskImgHTML = MaskImgHTML + "\r\n" + win.DCDomTools.removeScriptElement(DCDomTools.GetOuterHTML(pdiv));
                            }
                        }
                        break;
                    }
                }
            }
        }


        html = html + "<style>.hiddenforprint{display:none;}</style>";
        html = html + "</head><body style='padding-left:1px;padding-top:0px;padding-right:0px;padding-bottom:0px;margin:0px"
        html = html + "'>" + MaskImgHTML + dcRootCenter.innerHTML;
        html = html + "</body></html>";

        //测试，开个新窗口看下效果
        //var oPrntWin = window.open("", "_blank", "width=450,height=470,left=100,top=400,menubar=yes,toolbar=no,location=no,scrollbars=yes,resizable=yes");
        //oPrntWin.document.open();
        //$(oPrntWin.document).ready(function () {

        //});
        //oPrntWin.document.write(html);
        //oPrntWin.document.close();
        //oPrntWin.document.title = document.title;
        //////////////////////////////////////////////

        return html;
    };

    //@method 加载打印预览
    //@param container 承载打印预览内容的HTML容器元素
    rootElement.InnerLoadPrintPreview = function (webMethodName, postData, printDirect, settings) {
        var iframeContent = document.getElementById(this.id + "_Frame");
        var iframePreview = document.getElementById(this.id + "_PreviewFrame");
        if (iframePreview == null) {
            return false;
        }
        if (printDirect == false) {
            if (iframePreview.offsetHeight > 0) {
                // 已经处于打印预览模式，不再执行后续操作。
                //iframePreview.contentWindow.WriterCommandModuleFile.FilePrint();
                return true;
            }
        }
        var servicePageUrl = this.getAttribute("servicepageurl");
        // 创建服务URL地址
        var url = servicePageUrl + "?" + webMethodName + "=1&tick=" + new Date().valueOf();
        if (settings != null && settings.PageIndexs != null && settings.PageIndexs.length > 0) {
            // 传递页码序号。
            url = url + "&pageindexs=" + settings.PageIndexs;
        }

        //WYC20191220：新增根据参数让后台输出留痕预览
        if (settings != null && (settings.ShowPermissionMark === true
            || settings.ShowPermissionMark === "true")) {
            url = url + "&showpermissionmark=true";
        }
        if (settings != null && (settings.ShowLogicDeletedContent === true
            || settings.ShowLogicDeletedContent === "true")) {
            url = url + "&showlogicdeletedcontent=true";
        }
        if (settings != null && (settings.ShowPermissionTip === true
            || settings.ShowPermissionTip === "true")) {
            url = url + "&showpermissiontip=true";
        }

        //WYC20191221：新增是否进行BASE64转码的标记
        if (this.IsUseBase64Transfer() == true) {
            url = url + "&transformusebase64=true";
        }

        var win = iframePreview.contentWindow;
        win.document.write(this.GetDCWriterString("JS_LoadingPrintPreview"));
        win.document.close();
        iframeContent.style.display = "none";
        iframePreview.style.display = "";

        if (printDirect == false) {

            // 获得打印用的工具条
            var tbr = this.GetToolbarForPrintPreview();
            if (tbr != null) {
                // 显示打印预览用的工具条
                if (tbr.parentNode != this) {
                    this.insertBefore(tbr, iframePreview);
                }
                tbr.style.display = "";
                tbr.disabled = true;
                $("*", tbr).each(function () { this.disabled = true; });
            }
        }

        var settings2 = {
            method: "POST",
            type: "POST",
            data: postData,
            processData: false,
            async: true
        };
        if (typeof (contextObj) != "undefined") {
            settings2.context = contextObj;
        }
        DCDomTools.fixAjaxSettings(settings2);
        $.ajax(
            url,
            settings2
        ).always(function (responseText, textStatus, jqXHR) {
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (printDirect == true) {
                iframePreview.style.display = "none";
                iframeContent.style.display = "";
            }
            if (typeof (responseText) == "object") {
                responseText = responseText.responseText;
            }
            if (responseText == null || responseText.length == 0) {
                // 遇到过responseText参数类型为#document类型，因此额外再尝试读取数据。YYF2020-3-20
                if (typeof (jqXHR) == "object") {
                    responseText = jqXHR.responseText;
                }
            }
            win.for_LoadPrintPreview = true;
            if (tbr != null) {
                tbr.disabled = false;
                $("*", tbr).each(function () { this.disabled = false; });
            }
            win.document.write(responseText);
            if (textStatus == "success") {
                win.document.onreadystatechange = function (e) {
                    if (win.document.readyState === "complete") {
                        // 20210311 xym 解决打印预览时缩小字体填充超出问题
                        $(win.document).find("[nowfontsize]").each(function () {
                            var span = $(this);
                            var isWhiteSpace = span.css("white-space") == "nowrap";
                            var table = span.parents("table[dctype='XTextTableElement']");
                            if (span.length == 1 && table.length > 0 && isWhiteSpace) {
                                var nowFontSize = parseFloat(span.css("font-size"));
                                var autofixfontsize = parseFloat(span.attr("nowfontsize")) * 4 / 3;
                                if (autofixfontsize != nowFontSize) {
                                    var zoomStr = autofixfontsize / nowFontSize;
                                    span.css("zoom", zoomStr);
                                }
                            }
                        })
                        // 触发控件的EventAfterPrintPreview事件。
                        // 绑定该事件的形式为 ctl.EventAfterPrintPreview = function( doc ){};
                        // 在事件函数中， this表示编辑器控件，doc表示打印预览中的文档对象。
                        if (rootElement.EventAfterPrintPreview != null
                            && typeof (rootElement.EventAfterPrintPreview) == "function") {
                            rootElement.EventAfterPrintPreview.call(rootElement, win.document);
                        }
                        if (printDirect == true) {
                            // 立即打印
                            win.WriterCommandModuleFile.FilePrint(settings);
                        }
                    };
                }
            }
            else {
                if (responseText == null || responseText.length < 10) {
                    win.document.write("<span style='color:red;font-weight:bold'>错误:<br/>" + url + "</span>");
                }
            }
            win.document.close();
        });
    };

    //打印预览 （根据指定Html） 解决3104多文档合并续打 2020-2-25 hulijun 
    rootElement.PrintPreviewByHtml = function (html) {

        var iframeContent = document.getElementById(this.id + "_Frame");
        var iframePreview = document.getElementById(this.id + "_PreviewFrame");
        if (iframePreview == null) {
            return false;
        }
        if (iframePreview.offsetHeight > 0) {
            // 已经处于打印预览模式，不再执行后续操作。
            return true;
        }

        var win = iframePreview.contentWindow;
        win.document.write(this.GetDCWriterString("JS_LoadingPrintPreview"));
        win.document.close();
        iframeContent.style.display = "none";
        iframePreview.style.display = "";

        // 获得打印用的工具条
        var tbr = this.GetToolbarForPrintPreview();
        if (tbr != null) {
            // 显示打印预览用的工具条
            if (tbr.parentNode != this) {
                this.insertBefore(tbr, iframePreview);
            }
            tbr.style.display = "";
            tbr.disabled = true;
            $("*", tbr).each(function () { this.disabled = true; });
        }
        
        //---------------------------
        win.for_LoadPrintPreview = true;
        if (tbr != null) {
            tbr.disabled = false;
            $("*", tbr).each(function () { this.disabled = false; });
        }
        
        //-----------------------
        win.document.write(html);
        win.document.onreadystatechange = function (e) {
            if (win.document.readyState === "complete") {
                // 触发控件的EventAfterPrintPreview事件。
                // 绑定该事件的形式为 ctl.EventAfterPrintPreview = function( doc ){};
                // 在事件函数中， this表示编辑器控件，doc表示打印预览中的文档对象。
                if (rootElement.EventAfterPrintPreview != null
                    && typeof (rootElement.EventAfterPrintPreview) == "function") {
                    rootElement.EventAfterPrintPreview.call(rootElement, win.document);
                }
            };
        }
        win.document.close();
        //----------------------
    }

    rootElement.GetWebWriterControlOptionString = function () {
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input == null) {
            return null;
        }
        else {
            return input.value;
        }
    };

    // 从HTML字符串加载文档内容
    rootElement.LoadDocumentFromHtmlText = function (htmlContent) {
        if (rootElement.checkResponseContent(htmlContent) == false) {
            return false;
        }

        var tick = 0;
        if (typeof (DCDomTools) != "undefined") {
            DCDomTools.GetDateMillisecondsTick(new Date());
        }
        var doc = this.GetContentDocument();
        doc.write(htmlContent);
        doc.close();

        //$(rootElement.contentDocument).html(htmlContent);

        //DCDomTools.SetFrameInnerHTML(rootElement.frameElement, htmlContent);
        funcInitPropertyInstance();
        if (typeof (DCDomTools) != "undefined") {
            tick = DCDomTools.GetDateMillisecondsTick(new Date()) - tick;
        }
        if (doc.body != null) {
            doc.body.setAttribute("loadtick", tick);
        }

        window.setTimeout(DCWriterEnsureJQuery, 500); //////////////////////////////////////////////

        return true;
        //}
        //window.setTimeout(func, 1000);
    };
    rootElement.AutosSaveUrl = function (url, html) {
        DCWriterEnsureJQuery();

        // 显示等待界面
        //rootElement.ShowAppProcessing();
        // 创建服务URL地址
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”
        rootElement.startTimeForLoadDocumentFormFile = new Date();

        // 采用Ajax技术来加载文档内容
        var postData = "";

        postData = "html=" + html;

        //var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        //if (input != null) {
        //    postData = "webwritercontroloptions=" + input.value;
        //}
        var settings = {
            method: "POST",
            type: "POST",
            data: html,
            processData: false
        };
        DCDomTools.fixAjaxSettings(settings);
        if (typeof (contextObj) != "undefined") {
            settings.context = contextObj;
        }
        $.ajax(
            url,
            settings
        );
        return true;
    };

    rootElement.InnerLoadDocumentContentFromUrl = function (url, callBack, contextObj,fileName) {
        DCWriterEnsureJQuery();

        // 显示等待界面
        //rootElement.ShowAppProcessing();
        // 创建服务URL地址
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”
        rootElement.startTimeForLoadDocumentFormFile = new Date();

        // 采用Ajax技术来加载文档内容
        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = "webwritercontroloptions=" + input.value;
        }
        if (fileName != null) {
            postData += "&filename=" + encodeURIComponent(fileName);
        }
        var settings = {
            method: "POST",
            type: "POST",
            data: postData,
            processData: false
        };

        DCDomTools.fixAjaxSettings(settings);

        if (typeof (contextObj) != "undefined") {
            settings.context = contextObj;
        }
        $.ajax(
            url,
            settings
        ).always(callBack);
        //var result = DCDomTools.GetContentByUrl(url, false, func);
        //var tick999 = DCDomTools.GetDateMillisecondsTick(new Date()) - startTick;
        //return DCWriterControllerClass.LoadDocumentFormFile(this, fileName, fileFormat);
        return true;
    };
    //判断字符串是否为数字
    function isNumber(val) {
        var regPos = /^\d+(\.\d+)?$/; //非负浮点数
        var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
        if (regPos.test(val) || regNeg.test(val)) {
            return true;
        } else {
            return false;
        }
    }

    // 设置文档参数
    rootElement.SetDocumentParameterValue = function (name, pValue) {
        if (rootElement.ParameterValues == null) {
            rootElement.ParameterValues = new Object();
        }
        if (typeof (pValue) == "string" || Array.isArray(pValue) == true) {
            rootElement.ParameterValues[name] = pValue;
        } else {
            var pValue2 = {};
            for (var i in pValue) {
                pValue2[i.toLowerCase()] = pValue[i];
            }
            rootElement.ParameterValues[name] = pValue2;
        }
        
    };

    // 获得文档参数值
    rootElement.GetDocumentParameterValue = function (name , autoCreate ) {
        if (rootElement.ParameterValues == null) {
            if (autoCreate == true) {
                rootElement.ParameterValues = new Object();
            }
            else {
                return null;
            }
        }
        var result = rootElement.ParameterValues[name];
        if (result == null && autoCreate == true) {
            result = new Object();
            rootElement.ParameterValues[name] = result;
        }
        return result;
    };

    // 将数据从数据源写入到文档中。
    rootElement.GetDataSourceBindingDescriptionsJSON = function () {
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCDataSource != null) {
            var result = win.DCDataSource.GetDataSourceBindingDescriptionsJSON();
            return result;
        }
        return 0;
    };

    //清空所有输入域
    rootElement.ClearAllFields = function () {
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCInputFieldManager != null) {
            win.DCInputFieldManager.clearAllFields();
        }
    }

    //清空数据源
    rootElement.ClearAllParameterValue = function () {
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCDataSource != null) {
            win.DCDataSource.ClearDataSource();
            rootElement.ParameterValues = null;
        }
    }

    // 将数据从数据源写入到文档中。
    rootElement.WriteDataFromDataSourceToDocument = function () {
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCDataSource != null) {
            var result = win.DCDataSource.WriteDataFromDataSourceToDocument();
            return result;
        }
        return 0;
    };

    // 将数据从文档写入到数据源。
    rootElement.WriteDataFromDocumentToDataSource = function () {
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCDataSource != null) {
            var result = win.DCDataSource.WriteDataFromDocumentToDataSource();
            return result;
        }
        return 0;
    };

    // WriteDataToTr向表格行中写入数据
    // tr 传入表格行节点
    // data 可传入{} or []
    // {}: 根据数据源绑定路径来赋值
    // []: 根据顺序来赋值
    rootElement.WriteDataToTr = function (tr, data) {
        var win = rootElement.GetContentWindow();
        if (win != null && win.WriterCommandModuleTable != null) {
            var result = win.WriterCommandModuleTable.WriteDataToTr(tr, data);
            return result;
        }
    }

    //获取病程文档字符串
    //@param fileFormat 字符串格式
    //@param id 病程ID
    rootElement.SaveSubDocumentToString = function (options) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");

        var usebase64 = options != undefined && options.UseBase64 != undefined && (options.UseBase64 == true || options.UseBase64 == "true") ? "true" : "false";
        var subdocid = options != undefined && options.SubDocID != undefined ? options.SubDocID : "";
        var fileformat = options != undefined && options.FileFormat != undefined ? options.FileFormat : "xml";
        var commitusertraces = options != undefined && options.CommitUserTrace != undefined && (options.CommitUserTrace == true || options.CommitUserTrace == "true") ? "true" : "false";
        var outputformatxml = options != undefined && options.OutputFormatXML != undefined && (options.OutputFormatXML == false || options.OutputFormatXML == "false") ? "false" : "true";

        var url = servicePageUrl + "?savesubdocumenttostring=" + encodeURI(fileformat)
            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode")
            + "&subdocumentid=" + subdocid
            + "&commitusertraces=" + commitusertraces
            + "&outputformatxml=" + outputformatxml
            + "&usebase64=" + usebase64
            + "&tick=" + new Date().valueOf();
        // 创建服务URL地址
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”

        var htmlContent = "";
        var win = this.GetContentWindow();
        if (win != null && win.WriterCommandModuleFile) {
            htmlContent = win.WriterCommandModuleFile.GetFileContentHtml();
            htmlContent = win.WriterCommandModuleFile.EncodeContentHtmlForPost(htmlContent);
        }
        var result = "";
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {
                var temparray = responseText.split("$dcsuccesssplit$");
                var success = temparray[0];
                var temparray2 = temparray[1].split("$dcmessageplit$");
                var responsehtml = temparray2[1];
                var message = temparray2[0];
                if (success == "true") {
                    result = responsehtml;//.replace(" ", " ");;//wyc20200618：这里有可能会生成一个特殊的空格字符
                } else {
                    rootElement.RuntimeError(message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };

        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: false,
            data: htmlContent,
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        return result;
    };

    //获取病程文档字符串
    //@param fileFormat 字符串格式
    //@param id 病程ID
    rootElement.SaveSubDocumentToBase64String = function (fileFormat, id) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?savesubdocumenttostring=" + encodeURI(fileFormat)
            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode")
            + "&subdocumentid=" + id
            + "&usebase64=true"
            + "&tick=" + new Date().valueOf();
        // 创建服务URL地址
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”

        var htmlContent = "";
        var win = this.GetContentWindow();
        if (win != null && win.WriterCommandModuleFile) {
            htmlContent = win.WriterCommandModuleFile.GetFileContentHtml();
            htmlContent = win.WriterCommandModuleFile.EncodeContentHtmlForPost(htmlContent);
        }
        var result = "";
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {
                var temparray = responseText.split("$dcsuccesssplit$");
                var success = temparray[0];
                var temparray2 = temparray[1].split("$dcmessageplit$");
                var responsehtml = temparray2[1];
                var message = temparray2[0];
                if (success == "true") {
                    result = responsehtml;//.replace(" ", " ");;//wyc20200618：这里有可能会生成一个特殊的空格字符
                } else {
                    rootElement.RuntimeError(message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };

        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: false,
            data: htmlContent,
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        return result;
    };

    //获取文档字符串
    //@param fileFormat 字符串格式
    rootElement.SaveDocumentToString = function (options) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var fileformat = options != undefined && options.FileFormat != undefined ? options.FileFormat : "xml";
        var commitusertraces = options != undefined && options.CommitUserTrace != undefined && (options.CommitUserTrace == true || options.CommitUserTrace == "true") ? "true" : "false";
        var outputformatxml = options != undefined && options.OutputFormatXML != undefined && (options.OutputFormatXML == false || options.OutputFormatXML == "false") ? "false" : "true";
        var url = servicePageUrl + "?savedocumenttostring=" + encodeURI(fileformat)
            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
            + "&commitusertraces=" + commitusertraces
            + "&outputformatxml=" + outputformatxml
            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
        // 创建服务URL地址b
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”

        //WYC20200106：新增是否进行BASE64转码的标记
        if (this.IsUseBase64Transfer() == true) {
            url = url + "&transformusebase64=true";
        }

        var htmlContent = "";
        var win = this.GetContentWindow();
        if (win != null && win.WriterCommandModuleFile) {
            htmlContent = win.WriterCommandModuleFile.GetFileContentHtml();
            htmlContent = win.WriterCommandModuleFile.EncodeContentHtmlForPost(htmlContent);
        }
        var result = "";
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {
                var temparray = responseText.split("$dcsuccesssplit$");
                var success = temparray[0];
                var temparray2 = temparray[1].split("$dcmessageplit$");
                var responsehtml = temparray2[1];
                var message = temparray2[0];
                if (success == "true") {
                    result = responsehtml;//.replace(" ", " ");//wyc20200618：这里有可能会生成一个特殊的空格字符
                    if (message != null && message.length > 0) {
                        console.log(message);
                    }
                } else {
                    rootElement.RuntimeError(message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: false,
            data: htmlContent,
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax( settings );
        return result;
    };

    //提交文档中的痕迹
    rootElement.CommitDocumentUserTrace = function () {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dccommitdocumentusertrace=1"
            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
        // 创建服务URL地址b
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”

        //WYC20200106：新增是否进行BASE64转码的标记
        if (this.IsUseBase64Transfer() == true) {
            url = url + "&transformusebase64=true";
        }

        var htmlContent = this.GetContentHtml(true, true);
        var result = false;
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (textStatus == "success") {
                var temparray = responseText.split("$dcsuccesssplit$");
                var success = temparray[0];
                var temparray2 = temparray[1].split("$dcmessageplit$");
                var responsehtml = temparray2[1];
                var message = temparray2[0];

                //var responseData = JSON.parse(responseText);
                if (success == "true") {
                    rootElement.ServerMessage = message;//responseData.message;
                    var resposeHTML = responsehtml;//DCDomTools.HTMLDecode(responseData.result);
                    if (rootElement.CallbackForLoadDocumentHtml(resposeHTML, textStatus, jqXHR) == true) {
                        rootElement.FileFormat = "xml";
                        result = true;
                    }
                } else {
                    rootElement.HiddenAppProcessing();
                    rootElement.RuntimeError(message);
                    result = false;
                }
            } else {
                rootElement.HiddenAppProcessing();
                rootElement.RuntimeError(responseText, textStatus, jqXHR);
                result = false;
            }
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: false,
            data: htmlContent,
            error: function (responseText, textStatus, jqXHR) {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        return result;
    };

    //wyc20201124:获取文档中的痕迹列表
    rootElement.GetDocumentUserTrackInfos = function (IsUpdate) {
        //debugger;
        var resultjsonstring = null;
        var doc = rootElement.GetContentDocument();
        var input = $(doc).find("#" + rootElement.id + "_usertrackinfoobjstring")[0];
        if (input != null && input.value) {
            resultjsonstring = input.value;
        }
        if (IsUpdate == true) {//请求后台获取新的痕迹列表数据
            // 获得服务器页面地址
            var servicePageUrl = rootElement.getAttribute("servicepageurl");
            var url = servicePageUrl + "?dcgetusertrackinfos=1"
                + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
                + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
            // 创建服务URL地址b
            url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”

            //WYC20200106：新增是否进行BASE64转码的标记
            if (this.IsUseBase64Transfer() == true) {
                url = url + "&transformusebase64=true";
            }

            var htmlContent = this.GetContentHtml(true, true);
            var result = false;
            var funcCallback = function (responseText, textStatus, jqXHR) {
                if (textStatus == "success") {
                    var temparray = responseText.split("$dcsuccesssplit$");
                    var success = temparray[0];
                    var temparray2 = temparray[1].split("$dcmessageplit$");
                    var responsehtml = temparray2[1];
                    var message = temparray2[0];

                    //var responseData = JSON.parse(responseText);
                    if (success == "true") {
                        rootElement.ServerMessage = message;//responseData.message;
                        input.value = responsehtml;
                        resultjsonstring = responsehtml;
                    } else {
                        rootElement.HiddenAppProcessing();
                        rootElement.RuntimeError(message);
                        result = false;
                    }
                } else {
                    rootElement.HiddenAppProcessing();
                    rootElement.RuntimeError(responseText, textStatus, jqXHR);
                    result = false;
                }
            };
            var settings = {
                method: "POST",
                type: "POST",
                url: url,
                async: false,
                data: htmlContent,
                error: function (responseText, textStatus, jqXHR) {
                    rootElement.ConnectionError(responseText, textStatus, jqXHR);
                },
                success: funcCallback
            };
            DCDomTools.fixAjaxSettings(settings);
            $.ajax(settings);
        }
        return JSON.parse(resultjsonstring);
    };


    //获取文档Base64字符串
    //@param fileFormat 字符串格式
    rootElement.SaveDocumentToBase64String = function (options) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");

        var fileformat = options != undefined && options.FileFormat != undefined ? options.FileFormat : "xml";
        var commitusertraces = options != undefined && options.CommitUserTrace != undefined && (options.CommitUserTrace == true || options.CommitUserTrace == "true") ? "true" : "false";
        var url = servicePageUrl + "?savedocumenttobase64string=" + encodeURI(fileformat)
            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
            + "&commitusertraces=" + commitusertraces
            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
        // 创建服务URL地址
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”

        //WYC20200106：新增是否进行BASE64转码的标记
        if (this.IsUseBase64Transfer() == true) {
            url = url + "&transformusebase64=true";
        }

        var htmlContent = "";
        var win = this.GetContentWindow();
        if (win != null && win.WriterCommandModuleFile) {
            htmlContent = win.WriterCommandModuleFile.GetFileContentHtml();
            htmlContent = win.WriterCommandModuleFile.EncodeContentHtmlForPost(htmlContent);
        }
        var result = "";
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {
                var temparray = responseText.split("$dcsuccesssplit$");
                var success = temparray[0];
                var temparray2 = temparray[1].split("$dcmessageplit$");
                var responsehtml = temparray2[1];
                var message = temparray2[0];
                if (success == "true") {
                    result = responsehtml;
                    if (message != null && message.length > 0) {
                        console.log(message);
                    }
                } else {
                    rootElement.RuntimeError(message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: false,
            data: htmlContent,
            //processData: false,
            error: function (responseText, textStatus, jqXHR) {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        return result;
    };

    //调用后台的ReleaseSession命令
    rootElement.ReleaseSession = function () {
        var result = "";
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?releasesession=" + encodeURI("1")
            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
        // 创建服务URL地址
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”

        var htmlContent = "";
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: false,
            data: htmlContent,
            //processData: false,
            error: function (request) {
            },
            success: function (data) {
                result = data;
            }
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax( settings );
        return result;
    };

    //WYC20200220：重置文档修改状态
    rootElement.ResetDocumentModified = function () {
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCMultiDocumentManager) {
            win.DCMultiDocumentManager.reset();
            win.DCMultiDocumentManager.Start();
        } else {
            console.log("ResetDocumentModified：失败")
        }
        
    };

    /*rootElement.getServerInfo = function () {
        var doc = this.GetContentDocument();
        if (doc != null && doc.body != null) {
            var result = new Object();
            // 总的输出字符数
            result.characters = parseInt(doc.body.getAttribute("serverchars"));
            // 总字符数
            ctl.serverPerformances.characters = parseInt(document.body.getAttribute("serverchars"));
            // 服务器端耗时毫秒数
            ctl.serverPerformances.serverTicks = parseInt(document.body.getAttribute("serverticks"));
            ctl.serverPerformances.totalServerTicks = ctl.totalServerTicks;
            ctl.serverPerformances.maxOnlineNumber = parseInt(document.body.getAttribute("maxonlinenumber"));
            ctl.serverPerformances.currentOnlineNumber = parseInt(document.body.getAttribute("currentonlinenumber"));

        }
        else {
            return new Object();
        }
    };*/

    //获取所有病程
    rootElement.GetCourseRecords = function (id) {
        var arr;
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCWriterControllerEditor) {
            arr = win.DCWriterControllerEditor.GetCourseRecords(id);
        }
        return arr;
    }

    //根据XML获取HTML
    //@param strXML XML字符串
    //@param type {one:整个html，two:body内的html}
    rootElement.getHtmlByXMLString = function (strXML, type) {
        var obj = {
            "file": strXML,//xml文档 
            "format": "xml",//xml文档格式
            "base64": "false",//是否是base64字符串
            "type": type//end     
        };
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcwritergethtmlbyfile=xml&tick=" + new Date().valueOf();

        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        };

        var result="";
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    result = DCDomTools.HTMLDecode(responseData.result);
                } else {
                    rootElement.RuntimeError(responseData.message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: false,
            data: {
                "param": JSON.stringify(obj),
                "webwritercontroloptions": postData
            },
            error: function (responseText, textStatus, jqXHR) {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        return result;
    };

    rootElement.getNavigator = function () {
        var win = rootElement.GetContentWindow();
        if (win != null && win.WriterCommandModuleTools) {
            return win.WriterCommandModuleTools.GetNavigator();
        }

    }

    //签名
    rootElement.CASignature = function (obj, callback) {
        var win = rootElement.GetContentWindow();
        if (win != null && win.DCFileUploadManager) {
            //插入签名图片
            win.DCFileUploadManager.InsertSignImage(obj);
        }

        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?casignature=xml" +
            "&contentrendermode=" + rootElement.getAttribute("contentrendermode") +
            "&elementid=" + obj.id + 
            "&role=" + obj.role +
            "&tick=" + new Date().valueOf();
        //WYC20191221：新增是否进行BASE64转码的标记
        if (this.IsUseBase64Transfer() == true) {
            url = url + "&transformusebase64=true";
        }
        // 创建服务URL地址
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”
        var postData = this.GetContentHtml(true, true);

        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    responseData.result = DCDomTools.HTMLDecode(responseData.result);
                    if (callback) {
                        callback(responseData);
                    }
                } else {
                    rootElement.RuntimeError(responseData.message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            //async: false,
            data: postData,
            error: function (responseText, textStatus, jqXHR) {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
    };
    //重新签名
    rootElement.CAReSignature = function (obj, callback) {
        var imgElement = rootElement.GetContentDocument().getElementById(obj.id);
        if (!imgElement) {
            Error("未获找到重签的签名图片！");
            return;
        }
        if (obj.role && obj.role == "1") {
            imgElement.setAttribute("dc_bstrpfx", obj.bstrpfx);
            imgElement.setAttribute("dc_bstrpwd", obj.bstrpwd);
        }
        
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?casignature=xml" +
            "&contentrendermode=" + rootElement.getAttribute("contentrendermode") +
            "&elementid=" + obj.id +
            "&role=" + obj.role +
            "&tick=" + new Date().valueOf();
        //WYC20191221：新增是否进行BASE64转码的标记
        if (this.IsUseBase64Transfer() == true) {
            url = url + "&transformusebase64=true";
        }
        // 创建服务URL地址
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”
        var postData = this.GetContentHtml(true, true);

        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    responseData.result = DCDomTools.HTMLDecode(responseData.result);
                    if (callback) {
                        callback(responseData);
                    }
                } else {
                    rootElement.RuntimeError(responseData.message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            //async: false,
            data: postData,
            error: function (responseText, textStatus, jqXHR) {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
    };
    //多文档合并成一个预览HTML 异步
    //@param obj:{ 
    //            "files": arr,//数组对象，存的是xml文档 
    //            "format": "xml",//xml文档格式
    //            "base64": "false",//是否是base64字符串
    //            "megedoc": "false"//是否合并
    //            "modefile": "xmlstring"//病程合并模式下提供页眉页脚的主文档XML字符串
    //            "splitmode": "none"//各个文件合并时中间的分隔模式，"none"不分隔，"pagebreak"换新页，"linebreak"，用换行符分隔，"line"，用水平线分隔
    //}
    rootElement.getHtmlByFiles = function (obj, callback) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcwritergetpreviewhtmlbyfiles=xml&tick=" + new Date().valueOf();

        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        };

        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    var resposeHTML = DCDomTools.HTMLDecode(responseData.result);
                    if (callback) {
                        callback(resposeHTML);
                    }
                } else {
                    rootElement.RuntimeError(responseData.message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };

        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            data: {
                "param": JSON.stringify(obj),
                "webwritercontroloptions": postData
            },
            error: function (responseText, textStatus, jqXHR) {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
    };


    //@param obj:{ 
    //            "files": arr,//数组对象，存的是xml文档 
    //            "base64": "false",//是否是base64字符串
    //            "megedoc": "false"//是否合并
    //            "modefile": "xmlstring"//病程合并模式下提供页眉页脚的主文档XML字符串
    //            "splitmode": "none"//各个文件合并时中间的分隔模式，"none"不分隔，"pagebreak"换新页，"linebreak"，用换行符分隔，"line"，用水平线分隔
    //            "filename": ""//导出PDF的文件名
    //}
    rootElement.GetPDFByFiles = function (obj, callback) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcgetpdfbyfiles=xml&tick=" + new Date().valueOf();

        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        };

        var frm = document.createElement("form");
        frm.action = url;
        //WYC20191221：新增是否进行BASE64转码的标记
        if (this.IsUseBase64Transfer() == true) {
            frm.action = frm.action + "&transformusebase64=true";
        }
        frm.method = "POST";
        frm.target = "_blank";

        var field = document.createElement("input");
        field.type = "hidden";
        field.name = "param";
        field.value = JSON.stringify(obj);

        var field2 = document.createElement("input");
        field2.type = "hidden";
        field2.name = "webwritercontroloptions";
        field2.value = postData;

        frm.appendChild(field);
        frm.appendChild(field2);
        document.body.appendChild(frm);
        frm.submit();
        document.body.removeChild(frm);



        //var settings = {
        //    method: "POST",
        //    type: "POST",
        //    url: url,
        //    async: false,
        //    data: {
        //        "param": JSON.stringify(obj),
        //        "webwritercontroloptions": postData
        //    },
        //    error: function (request) {
        //        ConnectionError();
        //    }
        //};
        //DCDomTools.fixAjaxSettings(settings);
        //$.ajax(settings);
    };

    rootElement.ErrorInfo = {
        Error : "000",
        ErrorMsg : "抱歉，出错了！",
        ConnectionError : "001",//连接失败
        ConnectionErrorMsg : "连接失败！",
        RuntimeError : "002",//后台处理失败
        RuntimeErrorMsg : "抱歉，出错了！",
        NotSupportedError : "003",//不支持
        NotSupportedErrorMsg: "抱歉，出错了！"
    };
    
    rootElement.ConnectionError = function (responseText, textStatus, jqXHR) {
        responseText = DCDomTools.getResponseText(responseText);
        if (responseText == null || responseText.length == 0) {
            alert("未知错误!");
        }
        else {
            this.LoadDocumentFromHtmlText(responseText);
        }
        this.ServerMessage = this.ErrorInfo.ConnectionErrorMsg;
        var eventObject = new Object();
        eventObject.Message = this.ErrorInfo.ConnectionErrorMsg;
        eventObject.State = this.ErrorInfo.ConnectionError;
        this.MessageHandler(eventObject);
    }
    rootElement.RuntimeError = function (message) {
        var eventObject = new Object();
        if (message) {
            this.ServerMessage = message;
            eventObject.Message = message;
        } else {
            this.ServerMessage = this.ErrorInfo.RuntimeErrorMsg;
            eventObject.Message = this.ErrorInfo.RuntimeErrorMsg;
        }
        eventObject.State = this.ErrorInfo.RuntimeError;
        this.MessageHandler(eventObject);
    }

    rootElement.Error = function(message) {
        var eventObject = new Object();
        if (message) {
            this.ServerMessage = message;
            eventObject.Message = message;
        } else {
            this.ServerMessage = this.ErrorInfo.ErrorMsg;
            eventObject.Message = this.ErrorInfo.ErrorMsg;
        }
        eventObject.State = this.ErrorInfo.Error;
        this.MessageHandler(eventObject);
    }

    //处理提示信息
    rootElement.MessageHandler = function (eventObj) {
        if (!eventObj) {
            eventObj = new Object();
        }
        eventObj.cancelBubble = false;

        var func = this["EventMessageHandler"];
        if (func && typeof (func) == "function") {
            func.call(rootElement, eventObj)
        }
        if (eventObj.cancelBubble == true) {
            return;
        } else if (eventObj.Message) {
            console.log(eventObj.Message);
        }
    }
    //多文档合并成一个预览HTML 异步
    //@param obj:{ 
    //            "files": arr,//数组对象，存的是xml文档 
    //            "format": "xml",//xml文档格式
    //            "base64": "false",//是否是base64字符串
    //}
    rootElement.getHtmlsByFiles = function (obj, callback) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcwritergetpreviewhtmlsbyfiles=xml&tick=" + new Date().valueOf();

        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        };

        var win = this.GetContentWindow();
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    var resposeHTML = DCDomTools.HTMLDecode(responseData.result);
                    if (callback) {
                        callback(resposeHTML);
                    }
                } else {
                    rootElement.RuntimeError(responseData.message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            data: {
                "param": JSON.stringify(obj),
                "webwritercontroloptions": postData
            },
            error: function (responseText, textStatus, jqXHR) {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
    };

    //数据源绑定生成打印HTML
    //@param obj:{ 
    //            "modeIsBase64":"false",//模板是否是base64字符串
    //            "xmlMode": "",//模板文档 
    //            "dataSourceName": "Patient",//数据源名称
    //            "dataSource": "<a><Name>赵六</Name><Age>43</Age></a>",//数据
    //            "format": "xml",//xml字符串绑定数据源
    //}
    rootElement.getHtmlByFileWithSource = function (obj) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcwritergetpreviewhtmlbyfilewithsource=xml&tick=" + new Date().valueOf();

        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        };

        var result="";
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    var resposeHTML = DCDomTools.HTMLDecode(responseData.result);
                    result = resposeHTML;
                } else {
                    rootElement.RuntimeError(responseData.message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
        };

        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: false,
            data: {
                "param": JSON.stringify(obj),
                "webwritercontroloptions": postData
            },
            error: function (responseText, textStatus, jqXHR) {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        return result;
    };

    //根据XML获取HTML
    //@param strXML XML文档的base64字符串
    //@param type {one:整个html，two:body内的html}
    rootElement.getHtmlByXMLBase64String = function (strXML, type) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcwritergetpreviewhtmlbyxmlbase64string=" + type + "&tick=" + new Date().valueOf();

        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        };

        var result="";
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    var resposeHTML = DCDomTools.HTMLDecode(responseData.result);
                    result = resposeHTML;
                } else {
                    rootElement.RuntimeError(responseData.message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
            
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: false,
            data: {
                "fileContent": strXML,
                "webwritercontroloptions": postData
            },
            error: function (responseText, textStatus, jqXHR) {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        return result;
    };
    //插入XML
    //@param xmlContent 文档字符串
    //@param flag 是否是病程记录
    //@param options 病程记录属性
    //@param element 指定元素后插入
    //@param async 异步，默认true：异步，false:同步
    rootElement.InsertXmlString = function (xmlContent, flag, option, element, async) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcwriterinsertxmlstring=xml&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
        rootElement.ShowAppProcessing();
        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        };
        var result = false;
        var win = this.GetContentWindow();
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    var resposeHTML = DCDomTools.HTMLDecode(responseData.result);
                    if (resposeHTML != null && resposeHTML.length > 0 && win != null && win.DCWriterControllerEditor != null) {
                        resposeHTML = DCDomTools.RemoveHtmlParagraphElement(resposeHTML);
                        //wyc20201218：插入元素覆盖当前选中的元素
                        var sel = win.getSelection();
                        if (sel != null && sel.isCollapsed == false) {
                            win.DCDomTools.delectNode(true);
                        }
                        //////////////////////////
                        if (element) {
                            win.DCWriterControllerEditor.InsertHtmlAfterElement(resposeHTML, flag, option, element);
                        } else if (flag && (flag == true || flag == "true")) {
                            win.DCWriterControllerEditor.InsertHtmlAtCurentPositionFromCourseRecord(resposeHTML, flag, option);
                        } else {
                            win.DCWriterControllerEditor.InsertHtmlAtCurentPosition(resposeHTML);
                        }
                        rootElement.HiddenAppProcessing();
                        result = true;
                    }
                } else {
                    rootElement.HiddenAppProcessing();
                    rootElement.RuntimeError(responseData.message);
                }
            } else {
                rootElement.HiddenAppProcessing();
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
            
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async:async,
            data: {
                "fileContent": xmlContent,
                "webwritercontroloptions": postData
            },
            error: function (responseText, textStatus, jqXHR) {
                rootElement.HiddenAppProcessing();
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        //同步 返回
        if (async==false) {
            return result;
        }
    };

    //插入XML
    //@param xmlContent 文档Base64字符串
    //@param flag 是否是病程记录
    //@param options 病程记录属性
    rootElement.InsertXmlBase64String = function (xmlContent, flag, option, element, async) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcwriterinsertxmlbase64string=xml&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
        rootElement.ShowAppProcessing();
        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        };
        var result = false;
        var win = this.GetContentWindow();
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    var resposeHTML = DCDomTools.HTMLDecode(responseData.result);
                    if (resposeHTML != null && resposeHTML.length > 0 && win != null && win.DCWriterControllerEditor != null) {
                        if (element) {
                            win.DCWriterControllerEditor.InsertHtmlAfterElement(resposeHTML, flag, option, element);
                        } else {
                            win.DCWriterControllerEditor.InsertHtmlAtCurentPositionFromCourseRecord(resposeHTML, flag, option);
                        }
                        rootElement.HiddenAppProcessing();
                        result = true;
                    }
                } else {
                    rootElement.HiddenAppProcessing();
                    rootElement.RuntimeError(responseData.message);
                }
            } else {
                rootElement.HiddenAppProcessing();
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
            
        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            async: async,
            data: {
                "fileContent": xmlContent,
                "webwritercontroloptions": postData
            },
            error: function (responseText, textStatus, jqXHR) {
                rootElement.HiddenAppProcessing();
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
        //同步 返回
        if (async == false) {
            return result;
        }
    };

    //获取元素内XML
    rootElement.GetElementInnerXmlById = function (id) {
        var win = this.GetContentWindow();
        if (win != null && win.WriterCommandModuleFile != null && win.DCWriterControllerEditor != null) {
            var element = win.DCWriterControllerEditor.getInnerElementById(id);
            return win.WriterCommandModuleFile.getInnerXmlByElement(element);
        }
        else {
            return "";
        }
    };

    //设置病程状态
    //editable 可否编辑
    //strStyle 病程样式
    rootElement.SetSubDocumentState = function (editable, strStyle) {
        var win = this.GetContentWindow(); 
        if (win != null && win.DCWriterControllerEditor != null) {
            var focusNode = win.getSelection().focusNode;
            var subDoc = getSubDocument(focusNode);
            if (subDoc) {
                win.DCWriterControllerEditor.EditorSetState(subDoc, editable, strStyle);
            }
        }
    };

    function getSubDocument(focusNode) {
        if (!focusNode) {
            return null;
        }

        if (focusNode.nodeName == "DIV" && focusNode.attributes["dctype"].value == "XTextSubDocumentElement") {
            return focusNode;
        } else if (focusNode.nodeName == "DIV" && focusNode.attributes["dctype"].value == "XTextDocumentBodyElement") {
            return null;
        }else {
            return getSubDocument(focusNode.parentNode);
        }
    }

    ///在文档末尾追加病程记录，options参数同InsertSubDocuments
    rootElement.AppendSubDocuments = function (options) {
        var doc = document.WriterControl.GetContentDocument();
        var body = doc.getElementById("divDocumentBody_0");
        if (body != null && body.lastChild) {
            this.InsertSubDocuments(options, body.lastChild);
        }
    }

    //@param options:{ 
    //            "Files": 批量生成子文档的文档数组 
    //            "Options": 批量生成子文档的文档选项数组
    //            "afterElement": 在指定的元素后插入，若为空，则在当前位置处插入
    //}
    rootElement.InsertSubDocuments = function (options, afterElement) {
        //防御：
        if (options == null || options.Files == null || $.isArray(options.Files) == false) {
            console.log("InsertSubDocuments参数不对");
            return;
        }
        if (options == null || options.Options == null || $.isArray(options.Options) == false
            || options.Files.length != options.Options.length) {
            console.log("InsertSubDocuments参数不对");
            return;
        }
        var win = this.GetContentWindow();
        if ((win == null || win.DCWriterControllerEditor.CanInsertElementAtCurentPosition("XTextSubDocumentElement") == false)
            && afterElement === undefined) {
            console.log("检测到当前有输入域或表格单元格，不允许插入子文档");
            return;
        }

        var base64 = "false";
        if (options.Usebase64 == true || options.Usebase64 == "true") {
            base64 = "true";
        }

        var showmaskui = options.ShowMaskUI == true || options.ShowMaskUI == "true" ? true : false;
        var obj = {
            "file": options.Files,//xml文档
            "format": "xml",//xml文档格式
            "base64": base64,//是否是base64字符串
            "type": "two",//{one:整个html，two:body内的html}
            "usesubdoc": "true",
            "forprint": "false",
            "subdocopts": options.Options
        }
        if (showmaskui === true) {
            rootElement.ShowAppProcessing();
        }

        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcwritergethtmlbyfile=xml&tick=" + new Date().valueOf();
        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        };
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    var resposeHTML = DCDomTools.HTMLDecode(responseData.result);
                    if (resposeHTML != null && resposeHTML.length > 0 && win != null && win.DCWriterControllerEditor != null) {
                        var div = document.createElement("DIV");
                        $(div).html(resposeHTML);
                        var subdocs = div.querySelectorAll("[dctype='XTextSubDocumentElement']");
                        for (var i = 0; i < subdocs.length; i++) {
                            var subdoc = subdocs[i];
                            if (subdoc.hasAttribute("tagvalue")) {
                                var str = subdoc.getAttribute("tagvalue");
                                subdoc.setAttribute("style", str);
                                subdoc.removeAttribute("tagvalue");
                            }
                        }
                        if (afterElement === undefined || afterElement === null) {
                            win.DCWriterControllerEditor.InsertElementAtCurentPosition(div, true);
                        } else {
                            win.DCWriterControllerEditor.InsertHtmlAfterElement(div.innerHTML, false, null, afterElement)
                        }

                        //wyc20201104：添加一个回调事件
                        if (rootElement.EventAfterInsertSubDocuments != null
                            && typeof (rootElement.EventAfterInsertSubDocuments) == "function") {
                            rootElement.EventAfterInsertSubDocuments.call(rootElement, div);
                        }
                    }
                } 
            }
            if (showmaskui === true) {
                rootElement.HiddenAppProcessing();
            }
        };

        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            data: {
                "param": JSON.stringify(obj),
                "webwritercontroloptions": postData
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
    };

    //插入XML
    //@param obj:{ 
    //            "file": arr,//xml文档 
    //            "format": "xml",//xml文档格式
    //            "base64": "false",//是否是base64字符串
    //            "type":{one:整个html，two:body内的html}
    //            "position":{"start":在目标容器的头部插入，"end":在目标容器的尾部插入}
    //}
    rootElement.InsertXmlById = function (obj, id) {
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcwritergethtmlbyfile=xml&tick=" + new Date().valueOf();
        rootElement.ShowAppProcessing();
        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        };
        if (obj.position == null) {
            obj.position = "start";
        }

        var win = this.GetContentWindow();
        var funcCallback = function (responseText, textStatus, jqXHR) {
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {
                var responseData = JSON.parse(responseText);
                if (responseData.success == "true") {
                    var resposeHTML = DCDomTools.HTMLDecode(responseData.result);
                    if (resposeHTML != null && resposeHTML.length > 0 && win != null && win.DCWriterControllerEditor != null) {
                        // 20191212 xuyiming 解决DCWRITER-2916
                        resposeHTML = resposeHTML.replace(/\<p/g, "<span").replace(/\<\/p\>/g, "</span><br dcpf='1'/>").toString();
                        var resulthtml = resposeHTML.substring(0, resposeHTML.lastIndexOf("<br dcpf='1'/>"));  //删除最终的换行
                        var ele = win.DCWriterControllerEditor.handleElementById(id, obj.position);
                        win.DCWriterControllerEditor.InsertHtmlAfterElement(resulthtml, false, null, ele);
                        $(ele).parent("[dctype='XTextInputFieldElement']").find("style").each(function(){
                            var sty=$(win.document).find("style#dccustomcontentstyle");
                            sty.text(sty.text()+$(this).text());
                        });
                        rootElement.HiddenAppProcessing();
                    }
                } else {
                    rootElement.HiddenAppProcessing();
                    rootElement.RuntimeError(responseData.message);
                }
            }else {
                rootElement.HiddenAppProcessing();
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
            
        };

        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            data: {
                "param": JSON.stringify(obj),
                "webwritercontroloptions": postData
            },
            error: function (responseText, textStatus, jqXHR) {
                rootElement.HiddenAppProcessing();
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
    };

    // 修改文档设置
    rootElement.ChangeDocumentSettings = function (options) {
        var svcUrl = rootElement.getAttribute("servicepageurl") + "?changedocumentsettings=1&tick=" + new Date().valueOf();
        var win = rootElement.GetContentWindow();
        var optElement = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (optElement != null) {
            options.WebOptions = optElement.value;
        }
        else {
            return false;
        }
        rootElement.ShowAppProcessing();
        options.DocumentHtml = win.WriterCommandModuleFile.EncodeContentHtmlForPost( win.WriterCommandModuleFile.GetFileContentHtml());
        
        var settings = {
            method: "POST",
            type: "POST",
            url: svcUrl,
            data: JSON.stringify( options), 
            //error: function () {
            //    alert("Connection error");
            //},
            complete: rootElement.CallbackForLoadDocumentHtml
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);
    };
     
    rootElement.CallbackForLoadDocumentHtml = function (responseText, textStatus, jqXHR) {
        var result = false;
        var scrollPositionX = 0;
        var scrollPositionY = 0;
        var descDoc = rootElement.GetContentDocument();
        if (rootElement.preserveScrollPosition == true && descDoc && descDoc.body != null) {
            scrollPositionX = descDoc.body.scrollLeft;
            scrollPositionY = descDoc.body.scrollTop;
        }
        responseText = DCDomTools.getResponseText(responseText, jqXHR);
        if (responseText == null || responseText.length == 0) {
            rootElement.HiddenAppProcessing();
            responseText = rootElement.GetDCWriterString("JS_ReturnNoneContent_Url", rootElement.getAttribute("servicepageurl"));
        }
        if (textStatus == "success") {
            if (jqXHR != null) {
                rootElement.totalServerTicks = jqXHR.getResponseHeader("dcservertick");
            }
            else {
                //rootElement.totalServerTicks = this.xhr.getResponseHeader("dcservertick");
            }
            if (responseText != "#nochanged#") {
                 rootElement.LoadDocumentFromHtmlText(responseText);
            }
            result = true;
        }
        else {
            rootElement.LoadDocumentFromHtmlText("<b style='color:red;word-break:break-all;'>" + textStatus + ":<br/>" + this.url + "</b><br/>" + responseText);
        }
        //if (textStatus != "success") {
            // HTTP不是正常的，隐藏等待界面。
            rootElement.HiddenAppProcessing();
        //}
        if (rootElement.preserveScrollPosition == true
            && (scrollPositionX > 0 || scrollPositionY > 0)) {
            $(descDoc).ready(function () {
                if (descDoc.body != null
                    && descDoc.body.scrollLeft == 0
                    && descDoc.body.scrollTop == 0) {
                    // 没有被用户滚动过，试图设置加载文档前的滚动位置。
                    descDoc.body.scrollLeft = scrollPositionX;
                    descDoc.body.scrollTop = scrollPositionY;
                }
            });
        }
        return result ;
    };

    //编辑器加载文档字符串
    //@param fileContent 文档字符串
    //@param fileFormat 字符串格式
    rootElement.LoadDocumentFromString = function (fileContent, fileFormat) {
        DCWriterEnsureJQuery();
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcwriterloaddocumentfromstring=" + encodeURI(fileFormat)
            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
        // 关闭打印预览功能
        this.ClosePrintPreview();    
        // 显示等待界面
        rootElement.ShowAppProcessing();
        // 创建服务URL地址
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”
         
        // 采用Ajax技术来加载文档内容
        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        }

        fileContent = encodeURIComponent(fileContent);
        var funcCallback = function (responseText, textStatus, jqXHR) {
            responseText = DCDomTools.getResponseText(responseText, jqXHR);
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {
                var temparray = responseText.split("$dcsuccesssplit$");
                var success = temparray[0];
                var temparray2 = temparray[1].split("$dcmessageplit$");
                var responsehtml = temparray2[1];
                var message = temparray2[0];

                //var responseData = JSON.parse(responseText);
                if (success == "true") {
                    rootElement.ServerMessage = message;//responseData.message;
                    var resposeHTML = responsehtml;//DCDomTools.HTMLDecode(responseData.result);
                    if (rootElement.CallbackForLoadDocumentHtml(resposeHTML, textStatus, jqXHR) == true) {
                        //rootElement.FileName = fileName;
                        rootElement.FileFormat = fileFormat;
                    }                    
                } else {
                    rootElement.HiddenAppProcessing();
                    rootElement.RuntimeError(message);
                }
            } else {
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
                rootElement.HiddenAppProcessing();
                rootElement.RuntimeError(responseData.message);
            }

        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            data: {
                "fileContent": fileContent,
                "webwritercontroloptions": postData
            },
            error: function (responseText, textStatus, jqXHR) {
                rootElement.HiddenAppProcessing();
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);

        document.WriterControl = rootElement;
        $.ajax(settings);

        //伍贻超2019/3/26 添加是否自动保存
        var AutoSaveIntervalInSecond = rootElement.DocumentOptions.BehaviorOptions.AutoSaveIntervalInSecond;
        if (AutoSaveIntervalInSecond != null && AutoSaveIntervalInSecond != "") {
            if (isNumber(AutoSaveIntervalInSecond) && AutoSaveIntervalInSecond > 0) { //判断是否为数字
                //根据AutoSaveIntervalInSecond的值设置每几秒保存一次
                clearInterval(i);
                i = window.setInterval(function AutoSave() {
                    //文档内容是否改变
                    if (rootElement.getModified() === true) {
                        var interval = rootElement.DocumentOptions.BehaviorOptions.AutoSaveIntervalInSecond;
                        if (isNumber(interval) && interval <= 0 && i !== null) {
                            clearInterval(i);//如果文档选项关闭自动保存则清除计数
                            i = null;
                        }

                        var html = "";
                        var win = rootElement.GetContentWindow();
                        if (win !== null && win.WriterCommandModuleFile) {
                            html = win.WriterCommandModuleFile.GetFileContentHtml();
                            html = win.WriterCommandModuleFile.EncodeContentHtmlForPost(html);
                        }
                        // 创建自动保存URL地址
                        var url_AutoSave = servicePageUrl + "?dcwriterdraftsavefilecontent=" + encodeURI(fileName)
                            + "&fileformat=" + fileFormat
                            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
                            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
                        url_AutoSave = url_AutoSave.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”
                        rootElement.AutosSaveUrl(url_AutoSave, html);
                    }
                }, AutoSaveIntervalInSecond * 1000);
            }
        }
        return true;
    };

    function GetCurrentIFrameElement(rootElement) {
        for (var iCount = 0; iCount < rootElement.childNodes.length; iCount++) {
            var node = rootElement.childNodes[iCount];
            if (node.nodeName == "IFRAME") {
                if (node.style.display == null || node.style.display.length == 0 ) {
                    return node;
                }
            }
        }
        return null;
    }

    rootElement.CheckForWattingMessage = function (responseText , targetDoc ) {
        var id_divMsg = "divWaittingMsg";
        if (targetDoc == null) {
            var targetFrame = GetCurrentIFrameElement(rootElement);
            if (targetFrame != null) {
                targetDoc = targetFrame.contentWindow.document;
            }
        }
        responseText = DCDomTools.getResponseText(responseText);
        if (responseText != null && responseText.length > 10 && responseText.substr(0, 12) == "waittingmsg:") {
            rootElement.HiddenAppProcessing();
            var msg = responseText.substr(12);
            if (targetDoc != null) { 
                var divMsg = targetDoc.getElementById(id_divMsg);
                if (divMsg == null) {
                    divMsg = targetDoc.createElement("div");
                    divMsg.id = id_divMsg;
                    divMsg.setAttribute("style", "border:2px solid red;background-color:yellow;font-size:20pt;border-radius:5px");
                    targetDoc.body.insertBefore(divMsg, targetDoc.body.firstChild);
                }
                divMsg.style.display = "";
                divMsg.innerText = msg;

                var div2 = targetDoc.getElementById("divWarringOverload2020");
                if (div2 != null) {
                    div2.parentNode.removeChild(div2);
                }
            }
            return true;
        }
        else {
            if (targetDoc != null) {
                var divMsg = targetDoc.getElementById(id_divMsg);
                if (divMsg != null) {
                    divMsg.parentNode.removeChild(divMsg);
                }
            }
        }
        return false;
    }

    //编辑器加载文档Base64字符串
    //@param fileContent 文档字符串
    //@param fileFormat 字符串格式
    rootElement.LoadDocumentFromBase64String = function (fileContent, fileFormat) {
        DCWriterEnsureJQuery();
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        var url = servicePageUrl + "?dcwriterloaddocumentfrombase64string=" + encodeURI(fileFormat)
            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
        // 关闭打印预览功能
        this.ClosePrintPreview();    
        // 显示等待界面
        rootElement.ShowAppProcessing();
        // 创建服务URL地址
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”

        // 采用Ajax技术来加载文档内容
        var postData = "";
        var input = document.getElementById(rootElement.id + "_WebWriterControlOptions");
        if (input != null) {
            postData = input.value;
        }
        var funcCallback = function (responseText, textStatus, jqXHR) {
            responseText = DCDomTools.getResponseText(responseText, jqXHR);
            if (rootElement.CheckForWattingMessage(responseText) == true ) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
             if (textStatus == "success") {

                var temparray = responseText.split("$dcsuccesssplit$");
                var success = temparray[0];
                var temparray2 = temparray[1].split("$dcmessageplit$");
                var responsehtml = temparray2[1];
                var message = temparray2[0];

                if (success == "true") {
                    var resposeHTML = responsehtml;//DCDomTools.HTMLDecode(responseData.result);
                    rootElement.ServerMessage = message;
                    if (rootElement.CallbackForLoadDocumentHtml(resposeHTML, textStatus, jqXHR) == true) {
                        //rootElement.FileName = fileName;
                        rootElement.FileFormat = fileFormat;
                    }                   
                } else {
                    rootElement.HiddenAppProcessing();
                    rootElement.RuntimeError(message);
                }
            } else {
                rootElement.HiddenAppProcessing();
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }

        };
        var settings = {
            method: "POST",
            type: "POST",
            url: url,
            data: {
                "fileContent": fileContent,
                "webwritercontroloptions": postData
            },
            error: function (responseText, textStatus, jqXHR) {
                rootElement.HiddenAppProcessing();
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            },
            success: funcCallback
        };
        DCDomTools.fixAjaxSettings(settings);
        $.ajax(settings);

        //伍贻超2019/3/26 添加是否自动保存
        var AutoSaveIntervalInSecond = rootElement.DocumentOptions.BehaviorOptions.AutoSaveIntervalInSecond;
        if (AutoSaveIntervalInSecond != null && AutoSaveIntervalInSecond != "") {
            if (isNumber(AutoSaveIntervalInSecond) && AutoSaveIntervalInSecond > 0) { //判断是否为数字
                //根据AutoSaveIntervalInSecond的值设置每几秒保存一次
                clearInterval(i);
                i = window.setInterval(function AutoSave() {
                    //文档内容是否改变
                    if (rootElement.getModified() === true) {
                        var interval = rootElement.DocumentOptions.BehaviorOptions.AutoSaveIntervalInSecond;
                        if (isNumber(interval) && interval <= 0 && i !== null) {
                            clearInterval(i); //如果文档选项关闭自动保存则清除计数
                            i = null;
                        }

                        var html = "";
                        var win = rootElement.GetContentWindow();
                        if (win !== null && win.WriterCommandModuleFile) {
                            html = win.WriterCommandModuleFile.GetFileContentHtml();
                            html = win.WriterCommandModuleFile.EncodeContentHtmlForPost(html);
                        }
                        // 创建自动保存URL地址
                        var url_AutoSave = servicePageUrl + "?dcwriterdraftsavefilecontent=" + encodeURI(fileName)
                            + "&fileformat=" + fileFormat
                            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
                            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
                        url_AutoSave = url_AutoSave.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”
                        rootElement.AutosSaveUrl(url_AutoSave, html);
                    }
                }, AutoSaveIntervalInSecond * 1000);
            }
        }
        return true;
    };

    //@method 加载指定名称的文件
    // @param fileName  文件名
    // @param fileFormat 文件格式
    // @returns 布尔值，操作是否成功

    var i = null;
    var filename_d = "";
    rootElement.LoadDocumentFromFile = function (fileName, fileFormat) {
        //var startTick = DCDomTools.GetDateMillisecondsTick(new Date());
        DCWriterEnsureJQuery();

        if (rootElement.isShowingDialog(false) == true) {
            // 正在显示对话框，表示执行其他的操作界面，无法执行本操作。
            return false;
        }
        // 关闭打印预览功能
        this.ClosePrintPreview();
        if (fileFormat == null) {
            fileFormat = "xml";
        }
        if (fileName == null || fileName.length == 0) {
            // 传入的文件名为空
            return false;
        }
        // 获得服务器页面地址
        var servicePageUrl = rootElement.getAttribute("servicepageurl");
        // 设置加载文档的时刻
        var startTimeForLoadDocumentFormFile = new Date();
        // 显示等待界面
        rootElement.ShowAppProcessing();
        // 创建服务URL地址
        var url = servicePageUrl + "?dcwritergetfulldocumenthtml=xml" //+ encodeURI(fileName)
            + "&fileformat=" + fileFormat
            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
        url = url.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”
        var scrollPositionX = 0;
        var scrollPositionY = 0;
        var descDoc = this.GetContentDocument();
        rootElement.startTimeForLoadDocumentFormFile = new Date();

        if (rootElement.preserveScrollPosition == true && descDoc.body != null) {
            scrollPositionX = descDoc.body.scrollLeft;
            scrollPositionY = descDoc.body.scrollTop;
        }


        var funcCallback = function (responseText, textStatus, jqXHR) {
            responseText = DCDomTools.getResponseText(responseText, jqXHR);
            if (rootElement.CheckForWattingMessage(responseText) == true) {
                // 检测到延时等待信息，则退出本操作。
                return;
            }
            if (textStatus == "success") {

                var temparray = responseText.split("$dcsuccesssplit$");
                var success = temparray[0];
                var temparray2 = temparray[1].split("$dcmessageplit$");
                var responsehtml = temparray2[1];
                var message = temparray2[0];

                if (success == "true") {
                    var resposeHTML = responsehtml;//DCDomTools.HTMLDecode(responseData.result);
                    rootElement.ServerMessage = message;
                    if (rootElement.CallbackForLoadDocumentHtml(resposeHTML, textStatus, jqXHR) == true) {
                        rootElement.FileName = fileName;
                        rootElement.FileFormat = fileFormat;                    
                    }
                } else {
                    rootElement.HiddenAppProcessing();
                    rootElement.RuntimeError(message);
                }
            } else {
                rootElement.HiddenAppProcessing();
                rootElement.ConnectionError(responseText, textStatus, jqXHR);
            }
            
            return;
        };
        document.WriterControl = rootElement;
        rootElement.InnerLoadDocumentContentFromUrl(url, funcCallback, null, fileName);

        //杜康亮2018/11/9 添加是否自动保存
        // var AutoSaveIntervalInSecond = rootElement.getAttribute("AutoSaveIntervalInSecond");
        var AutoSaveIntervalInSecond = rootElement.DocumentOptions.BehaviorOptions.AutoSaveIntervalInSecond;
        if (AutoSaveIntervalInSecond != null && AutoSaveIntervalInSecond != "") {
            if (isNumber(AutoSaveIntervalInSecond) && AutoSaveIntervalInSecond > 0) { //判断是否为数字
                //根据AutoSaveIntervalInSecond的值设置每几秒保存一次
                clearInterval(i);
                i = window.setInterval(function AutoSave() {
                    //文档内容是否改变
                    if (rootElement.getModified() === true) {
                        var interval = rootElement.DocumentOptions.BehaviorOptions.AutoSaveIntervalInSecond;
                        if (isNumber(interval) && interval <= 0 && i !== null) {
                            clearInterval(i);//如果文档选项关闭自动保存则清除计数
                            i = null;
                        }

                        var html = "";
                        var win = rootElement.GetContentWindow();
                        if (win !== null && win.WriterCommandModuleFile) {
                            html = win.WriterCommandModuleFile.GetFileContentHtml();
                            html = win.WriterCommandModuleFile.EncodeContentHtmlForPost(html);
                        }

                        // 创建自动保存URL地址
                        var url_AutoSave = servicePageUrl + "?dcwriterdraftsavefilecontent=" + encodeURI(fileName)
                            + "&fileformat=" + fileFormat
                            + "&controlinstanceid=" + rootElement.getAttribute("controlinstanceid")
                            + "&contentrendermode=" + rootElement.getAttribute("contentrendermode") + "&tick=" + new Date().valueOf();
                        url_AutoSave = url_AutoSave.replace(/\+/g, "%2B");  //文档传参数转译文档名中的“+”
                        rootElement.AutosSaveUrl(url_AutoSave, html);                        
                    }
                }, AutoSaveIntervalInSecond * 1000);
            }
        }
        //var result = DCDomTools.GetContentByUrl(url, false, func);
        //var tick999 = DCDomTools.GetDateMillisecondsTick(new Date()) - startTick;
        //return DCWriterControllerClass.LoadDocumentFormFile(this, fileName, fileFormat);
        return true;
    };

    //@method 设置当前用户信息
    //@param userID 用户名
    //@param userName 用户姓名
    //@param userLevel 用户授权等级
    //@param savedTime 保存时间
    //@param clientName 客户端名称
    rootElement.SetUserInfo = function (userID, userName, userLevel, savedTime, clientName) {
        var win = this.GetContentWindow();
        var obj = new Object();
        obj.UserID = userID;
        obj.UserName = userName;
        obj.UserLevel = userLevel;
        obj.SavedTime = savedTime;
        obj.ClientName = clientName;
        rootElement.UserInfo = obj;

        if (win != null && win.WriterCommandModuleFile != null) {
            return win.WriterCommandModuleFile.SetUserInfo(userID, userName, userLevel, savedTime, clientName);
        }
        else {
            return true;
        }
    };

    // 保存文件
    // 
    rootElement.SaveDocumentToFile = function (fileName, format) {
        DCWriterEnsureJQuery();

        if (rootElement.isShowingDialog(false) == true) {
            // 正在显示对话框，表示执行其他的操作界面，无法执行本操作。
            return false;
        }
        var win = this.GetContentWindow();
        if (win != null && win.WriterCommandModuleFile != null) {
            return win.WriterCommandModuleFile.OuterFileSave(fileName, format);
        }
        else {
            return true;
        }
    };

    // 重置修改标记
    // onlyText boolean true表示重置Text修改标记
    rootElement.resetModified = function (onlyText) {
        if (onlyText == null) {
            onlyText = false;
        }
        var win = this.GetContentWindow();
        if (win != null && win.DCMultiDocumentManager != null) {
            if (onlyText == true) {
                return win.DCMultiDocumentManager.resetTextModified();
            } else {
                return win.DCMultiDocumentManager.resetModified();
            }
        }
        else {
            return null;
        }
    };

    // 控件文档内容是否改变
    // onlyText boolean true表示控件文档Text内容是否改变
    rootElement.getModified = function (onlyText) {
        if (onlyText == null) {
            onlyText = false;
        }
        var win = this.GetContentWindow();
        if (win != null && win.DCMultiDocumentManager != null) {
            if (onlyText == true) {
                return win.DCMultiDocumentManager.getTextModified();
            } else {
                return win.DCMultiDocumentManager.getModified();
            }
        }
        else {
            return null;
        }
    };

    rootElement.getAllSubDocumentInfos = function () {
        var win = this.GetContentWindow();
        if (win != null && win.DCMultiDocumentManager != null) {
            return win.DCMultiDocumentManager.getAllDocumentInfos();
        }
        else {
            return null;
        }
    };

    // 获得所有的子文档元素对象
    rootElement.getSubDocuments = function () {
        var win = this.GetContentWindow();
        if (win != null && win.DCSubDocumentManager != null) {
            return win.DCSubDocumentManager.getSubDocuments();
        }
        else {
            return null;
        }
    };

    // 选择指定编号的子文档
    rootElement.selectSubDocument = function (index) {
        var win = this.GetContentWindow();
        if (win != null && win.DCMultiDocumentManager != null) {
            return win.DCMultiDocumentManager.selectDocument(index);
        }
        else {
            return null;
        }
    };

    // 获得当前子文档信息
    rootElement.getCurrentSubDocumentInfo = function () {
        var win = this.GetContentWindow();
        if (win != null && win.DCMultiDocumentManager != null) {
            return win.DCMultiDocumentManager.getCurrentInfo();
        }
        else {
            return null;
        }
    };

    // @method 执行编辑器命令
    rootElement.DCExecuteCommand = function (commandName, showUI, parameter) {
        if (rootElement.isShowingDialog() == true) {
            // 表示正在显示对话框，执行其他操作。
            return null;
        }
        var forceUseEditFrame = null;
        //数组中的命令需要强制使用预览contentwindow
        var arr = ["jumpprintmode"];
        if ($.inArray(commandName.toLowerCase(), arr) != -1) {
            forceUseEditFrame = false;
        }
        var win = this.GetContentWindow(forceUseEditFrame);
        if (win != null && win.DCWriterCommandMananger != null) {
            var result = win.DCWriterCommandMananger.DCExecuteCommand(commandName, showUI, parameter);
            //20190715 xuyiming 首行缩进出现问号，“&#8203;”转成问号，“/\u200B/”表示出现“不可见字符”
            if (commandName.toLowerCase() == "indent") {
                var doc = rootElement.GetContentDocument();
                var boddy = doc.getElementsByTagName("body")[0];
                findText(boddy);
            }
            function findText(dom) {
                for (var i = 0; i < dom.childNodes.length; i++) {
                    if (dom.childNodes[i].nodeName == "#text") {
                        if (dom.childNodes[i].nodeValue.match(/\u200B/)) {
                            dom.childNodes[i].nodeValue = dom.childNodes[i].nodeValue.replace(/\u200B/g, '');
                        }
                    } else if (dom.childNodes[i].childNodes) {
                        findText(dom.childNodes[i]);
                    }
                }
            }
            return result;
        }
        else {
            return null;
        }
    };

    rootElement.IsOldIE = function () {
        var result = false;
        if (navigator && navigator.appName == "Microsoft Internet Explorer") {
            var ver = navigator.appVersion;
            if (ver != null) {
                if (ver.indexOf("MSIE 8.") >= 0
                    || ver.indexOf("MSIE 9.") >= 0
                    || ver.indexOf("MSIE 7.") >= 0
                    || ver.indexOf("MSIE 6.") >= 0) {
                    result = true;
                }
            }
        }
        return result;
    };

    rootElement.IsUseBase64Transfer = function () {
        var isoldie = false;
        if (navigator && navigator.appName == "Microsoft Internet Explorer") {
            var ver = navigator.appVersion;
            if (ver != null) {
                if (ver.indexOf("MSIE 8.") >= 0
                    || ver.indexOf("MSIE 9.") >= 0
                    || ver.indexOf("MSIE 7.") >= 0
                    || ver.indexOf("MSIE 6.") >= 0) {
                    isoldie = true;
                }
            }
        }
        var isusebase64_2 = false;
        var win = this.GetContentWindow();
        if (win != null && win.document && win.document.body) {
            isusebase64_2 = win.document.body.getAttribute("transformusebase64") == "true";//这一句不知道会不会出问题
        }
        var isusebase64_1 = this.getAttribute("transformusebase64") == "true"
        if ((isusebase64_1 == true || isusebase64_2 == true) && isoldie == false) {
            return true;
        } else {
            return false;
        }
    };

    rootElement.GetContentHtml = function (inluceWebConrolOptions , encodeData , forceUseEditFrame ) {
        var win = this.GetContentWindow(forceUseEditFrame);
        if (win != null && win.WriterCommandModuleFile != null) {
            return win.WriterCommandModuleFile.GetFileContentHtml(inluceWebConrolOptions, encodeData);                  
        }
        else {
            return "";
        }
    };

    var insertImageButtonID = rootElement.getAttribute("insertimagebuttonid");
    if (insertImageButtonID != null
        && insertImageButtonID.length > 0
        && document.getElementById(insertImageButtonID) != null) {
        // 定义一个函数，将透明的上传图片的内置框架元素放置到上传图片按钮上面。
        var funcBindInsertImageButton = function () {
            var frameID = rootElement.id + "_UploadFrameSimple";
            var frameElement = document.getElementById(frameID);
            if (frameElement == null) {
                frameElement = document.createElement("iframe");
                frameElement.id = frameID;
                frameElement.style.opacity = "0.01";
                frameElement.style.position = "absolute";
                frameElement.scrolling = "no";
                rootElement.appendChild(frameElement);
            }
            if (rootElement.isShowingDialog()) {
                // 正在显示对话框，无法执行操作。
                frameElement.style.display = "none";
                return;
            }
            else {
                frameElement.style.display = "";
            }
            if (frameElement.contentWindow != null
                && frameElement.contentWindow.document != null
                && frameElement.contentWindow.document.getElementById("form1") == null) {
                // 内容为空，则设置内容
                var svr = rootElement.getAttribute("servicepageurl");
                if (svr != null && svr.length > 0) {
                    frameElement.src = svr + "?imagemode=1&dcwriteruploadfile=2";
                }
                else {
                    svr = rootElement.getAttribute("referencepathfordebug");
                    if (svr != null && svr.length > 0) {
                        frameElement.src = svr + "/DCUploadFileSimple.htm";
                    }
                }

                var imgID = "img" + new Date().valueOf();
                frameElement.fileID = imgID;
                frameElement.accept = "image/png,image/gif,image/jpeg,image/bmp";
                // 提交操作回调函数
                frameElement.okCallback = function () {
                    if (rootElement.isShowingDialog() == true) {
                        return false;
                    }
                    var man = rootElement.GetContentWindow().DCFileUploadManager;
                    if (man) {
                        if (man.CanUploadImage(true) == false) {
                            return false;
                        }
                        man.UploadImageCallback(imgID);
                    }
                    return true;
                };
            }
            var btn2 = document.getElementById(insertImageButtonID);
            if (btn2 == null) {
                // 没找到按钮
                frameElement.style.display = "none";
                return;
            }
            else {
                frameElement.style.dispaly = "";
            }
            frameElement.style.left = DCDomTools.GetViewLeftInDocument(btn2) + "px";
            frameElement.style.top = DCDomTools.GetViewTopInDocument(btn2) + "px";
            frameElement.style.width = btn2.offsetWidth + "px";
            frameElement.style.height = btn2.offsetHeight + "px";
            frameElement.style.border = "1px solid black";
            frameElement.style.zIndex = 100004;
        };
        window.setInterval(funcBindInsertImageButton, 400);
    };

    // 获得文档中所有的单选框或复选框对象
    // type :radio、checkbox 
    // name: 元素的name属性（可不传参数：表示获取所有）
    rootElement.GetAllCheckboxOrRadio = function (type, name) {
        var result;
        var win = this.GetContentWindow();
        if (win != null && win.DCInputFieldManager != null) {
            result = win.DCInputFieldManager.getAllCheckboxOrRadio(type, name);
        }
        return result;
    }

    // 显示控件的遮盖面板 *********************************************************************
    rootElement.showMaskPanel = function (contentElement, delayMilliSeconds) {
        if (typeof (delayMilliSeconds) == "number" && delayMilliSeconds > 0) {
            // 延时显示
            if (rootElement.timeoutForShowMaskPanel != null) {
                // 取消上一次的延时执行的任务
                window.clearTimeout(rootElement.timeoutForShowMaskPanel);
            }
            rootElement.timeoutForShowMaskPanel = window.setTimeout(this, delayMilliSeconds, contentElement);
            return;
        }
        var mask = document.getElementById(this.id + "_ControlMask");
        if (mask != null) {
            mask.style.display = "";
            if ($(rootElement).css("position") != "absolute") {
                rootElement.style.position = "relative";
            }
            var left1 = 0;
            var top1 = 0;

            // if ($(".layui-body").offset() != null) {
            //     left1 = this.offsetLeft;
            //     top1 = this.offsetTop;
            // } else {
            //     left1 = DCDomTools.GetViewLeftInDocument(this);
            //     top1 = DCDomTools.GetViewTopInDocument(this);
            // }

            //mask.style.position = "absolute";
            //修改遮罩position 2019-04-15 hulijun
            if (rootElement.ControlMaskPosition && mask.id.indexOf("_ControlMask")>=0) {
                mask.style.position = rootElement.ControlMaskPosition;
            } else {
                mask.style.position = "absolute";
            }

            mask.style.left = left1 + "px";
            mask.style.top = top1 + "px";
            mask.style.width = "100%";
            mask.style.height = "100%";
            mask.style.overflow = "hidden";
            mask.PoffsetWidth = this.offsetWidth;
            mask.PoffsetHeight = this.offsetHeight;
            // mask.style.width = this.offsetWidth + "px";
            // mask.style.height = this.offsetHeight + "px";
            mask.currentContentElement = contentElement;
            if (contentElement != null) {
                contentElement.style.display = "";

                //contentElement.style.position = "absolute";
                //修改logoposition 2019-04-15 hulijun
                if (rootElement.ProcessingPosition && contentElement.id.indexOf("_Processing")>=0) {
                    contentElement.style.position = rootElement.ProcessingPosition;
                } else if (rootElement.DialogPosition && contentElement.id.indexOf("_Dialog") >= 0) {
                    contentElement.style.position = rootElement.DialogPosition;
                }else {
                    contentElement.style.position = "absolute";
                }

                var v = mask.offsetLeft + (mask.offsetWidth - contentElement.offsetWidth) / 2;
                contentElement.style.left = v + "px";
                v = mask.offsetTop + (mask.offsetHeight - contentElement.offsetHeight) / 2;
                contentElement.style.top = v + "px";
                contentElement.style.zIndex = mask.style.zIndex + 1;
            }
            // 检测遮盖面板布局的函数
            var checkMaskSizeFunc = function () {
                if (mask.style.display != "none") {
                    var parentNode = mask.parentNode;
                    if ($(parentNode).css("position") != "absolute") {
                        parentNode.style.position = "relative";
                    }
                    var left2 = 0;
                    var top2 = 0;
                    // if ($(".layui-body").offset() != null) {
                    //     left2 = parentNode.offsetLeft;
                    //     top2 = parentNode.offsetTop;
                    // } else {
                    //     left2 = DCDomTools.GetViewLeftInDocument(parentNode);
                    //     top2 = DCDomTools.GetViewTopInDocument(parentNode);
                    // }
                    var modified = false;
                    if (mask.style.left != left2 + "px") {
                        mask.style.left = left2 + "px";
                        modified = true;
                    }
                    if (mask.style.top != top2 + "px") {
                        mask.style.top = top2 + "px";
                        modified = true;
                    }
                    if (mask.PoffsetWidth != rootElement.offsetWidth) {
                        mask.PoffsetWidth = rootElement.offsetWidth;
                        modified = true;
                    }
                    if (mask.PoffsetHeight != rootElement.offsetHeight) {
                        mask.PoffsetHeight = rootElement.offsetHeight;
                        modified = true;
                    }
                    // if (mask.style.width != rootElement.offsetWidth + "px") {
                    //     mask.style.width = rootElement.offsetWidth + "px";
                    //     modified = true;
                    // }
                    // if (mask.style.height != rootElement.offsetHeight + "px") {
                    //     mask.style.height = rootElement.offsetHeight + "px";
                    //     modified = true;
                    // }
                    if (modified == true) {
                        var ce = mask.currentContentElement;
                        if (ce != null && ce.style.display != "none") {
                            var v = mask.offsetLeft + (mask.offsetWidth - ce.offsetWidth) / 2;
                            ce.style.left = v + "px";
                            v = mask.offsetTop + (mask.offsetHeight - ce.offsetHeight) / 2;
                            ce.style.top = v + "px";
                        }
                    }
                    window.setTimeout(checkMaskSizeFunc, 400);
                }
            };
            window.setTimeout(checkMaskSizeFunc, 400);
            if (contentElement.focus) {
                contentElement.focus();
            }
            if (contentElement.setActive) {
                try {
                    contentElement.setActive();
                }
                catch (err) {
                }
            }
            return true;
        }
        return false;
    };

    // 隐藏控件的遮盖面板 *********************************************************************
    rootElement.hiddenMaskPanel = function () {
        if (rootElement.timeoutForShowMaskPanel != null) {
            // 取消上一次的延时执行的任务
            window.clearTimeout(rootElement.timeoutForShowMaskPanel);
            rootElement.timeoutForShowMaskPanel = null;
        }
        var lbl = document.getElementById(this.id + "_ControlMask");
        if (lbl != null) {
            lbl.style.display = "none";
        }
    };
    // 显示操作等待界面 ***********************************************************************
    rootElement.ShowAppProcessing = function () {
        rootElement.showMaskPanel(document.getElementById(this.id + "_Processing"), 0);

    };
    // 隐藏操作等待界面 ***********************************************************************
    rootElement.HiddenAppProcessing = function () {
        rootElement.hiddenMaskPanel();
        var lbl2 = document.getElementById(this.id + "_Processing");
        if (lbl2 != null) {
            lbl2.style.display = "none";
        }
    };

    rootElement.GetDialogContentFrameElement = function () {
        return document.getElementById(this.id + "_DialogContent");
    };

    // @method 显示遮盖对话框
    // @param clientWidth 所需的客户区宽度
    // @param clientHeight 所需的客户区高度
    // @param title  标题
    // @returns 对话框容器元素
    rootElement.ShowMaskDialog = function (clientWidth, clientHeight, title) {

        DCWriterEnsureJQuery();

        if (title == null || title.length == 0) {
            title = rootElement.GetDCWriterString("JS_Dialog");
        }
        // 设置标题
        $("#" + this.id + "_DialogTitle").text(title);
        //var titleBox = document.getElementById(this.id + "_DialogTitle");
        //// 清空所有内容
        //while (titleBox.firstChild != null) {
        //    titleBox.removeChild(titleBox.firstChild);
        //}
        //// 设置标题
        //titleBox.appendChild(document.createTextNode(title));
        var dlg = document.getElementById(this.id + "_Dialog");
        var frame = this.GetDialogContentFrameElement();
        // 20200303 xuyiming 对话框显示时先执行默认设置
        if (clientWidth != null) {
            dlg.style.width = (clientWidth + 6) + "px";
            frame.style.width = clientWidth + "px";
        } else {
            dlg.style.width = "430px";
            frame.style.width = "";
        }
        if (clientHeight != null) {
            dlg.style.height = (clientHeight + 22) + "px";
            frame.style.height = clientHeight + "px";
        } else {
            dlg.style.height = "220px";
            frame.style.height = "";
        }
        rootElement.showMaskPanel(dlg);
        return frame;
    };

    // ************************************************************************
    // @method 关闭遮盖对话框
    rootElement.CloseMaskDialog = function (clearContent) {
        var box = document.getElementById(this.id + "_Dialog");
        rootElement.hiddenMaskPanel();
        var box = document.getElementById(this.id + "_Dialog");
        if (box != null) {
            box.style.display = "none";
        }
        var frame = this.GetDialogContentFrameElement();
        if (frame != null && clearContent != false ) {
            frame.src = "about:blank";
        }
    };


    // ************************************************************************
    //@method 开始执行上传图片操作
    rootElement.EditUploadImage = function () {
        var frame = document.getElementById(this.id + "_Dialog");
        if (frame != null) {
            if (rootElement.showMaskPanel(frame)) {
                var func = function () {
                    rootElement.hiddenMaskPanel();
                    frame.style.display = "none";
                };
                var win = this.GetContentWindow();
                win.DCFileUploadManager.BeginUploadImage(this.GetDialogContentFrameElement(), func);
            }
        }
    };

    //// 检查是否正在显示对话框
    //rootElement.checkShowingDialog = function () {
    //    if (this.isShowingDialog()) {
    //        alert(rootElement.GetDCWriterString("JS_PromptShowingDialog"));
    //        return false;
    //    }
    //    return true;
    //}

    // 判断是否正在显示对话框
    rootElement.isShowingDialog = function (showMessage) {
        var lbl = document.getElementById(this.id + "_ControlMask");
        if (lbl != null && lbl.style.display != "none") {
            if (showMessage == true) {
                //alert(rootElement.GetDCWriterString("JS_PromptShowingDialog"));
                var eventObject = new Object();
                eventObject.Message = rootElement.GetDCWriterString("JS_PromptShowingDialog");
                eventObject.State = rootElement.ErrorInfo.Error;
                rootElement.MessageHandler(eventObject);
            }
            return true;
        }
        return false;
    };

    // 获得指定名称的字符串资源
    rootElement.GetDCWriterString = function (name, parameters) {
        if (name == null || name.length == 0) {
            return name;
        }
        if (rootElement.DCWriterStringsContainer == null) {
            return name;
        }
        //if (rootElement.DCWriterStringsContainer != null) {
        name = name.toLowerCase();
        var text = rootElement.DCWriterStringsContainer[name];
        if (typeof (text) == "string" && text.length > 0) {
            for (var iCount = 1; iCount < arguments.length; iCount++) {
                var v = arguments[iCount];
                var strV = "";
                if (typeof (v) != "undefined" && v != null) {
                    strV = v.toString();
                }
                text = text.replace("{" + (iCount - 1) + "}", strV);
            }
            return text;
        }
        //}
        return name;
    };

    //获得编辑器的XMLText 张昊 2017-2-15 EMREDGE-28
    rootElement.GetXmlContent = function () {
        var win = this.GetContentWindow();
        if (win != null && win.WriterCommandModuleFile != null) {
            return win.WriterCommandModuleFile.GetXmlContent();
        }
        else {
            return "";
        }
    };

    //wyc20200703：获取文档页面设置信息
    rootElement.GetDocumentPageSettings = function () {
        var doc = this.GetContentDocument();
        if (doc != null && doc.body != null && doc.body.getAttribute) {
            var result = new Object();
            result.PaperKind = doc.body.getAttribute("paperkind");
            result.PaperHeight = doc.body.getAttribute("paperheight");
            result.PaperWidth = doc.body.getAttribute("paperwidth");
            result.LeftMargin = doc.body.getAttribute("leftmargin");
            result.TopMargin = doc.body.getAttribute("topmargin");
            result.BottomMargin = doc.body.getAttribute("bottommargin");
            result.RightMargin = doc.body.getAttribute("rightmargin");
            result.HeaderDistance = doc.body.getAttribute("headerdistance");
            result.FooterDistance = doc.body.getAttribute("footerdistance");
            result.Landscape = doc.body.getAttribute("landscape");
            result.unit = "Millimeter";
            return result;
        } else {
            return null;
        }
    };

    //WYC20200303：设置容器元素的内容只读特性
    rootElement.SetElementContentReadonly = function (element,breadonly) {
        var elementtype = null;
        if (element == null) {
            console.log("SetElementContentReadonly的元素为空")
            return;
        } else if (element != null && element != undefined) {
            elementtype = element.getAttribute("dctype");
        }
        var isreadonly = null;
        if (breadonly == true || (breadonly.toLowerCase && breadonly.toLowerCase() == "true")) {
            isreadonly = true;
        } else if (breadonly == false || (breadonly.toLowerCase && breadonly.toLowerCase() == "false")) {
            isreadonly = false;
        }
        if (isreadonly == null) {
            return;
        }
        var islegaltype = elementtype == "XTextTableElement"
            || elementtype == "XTextInputFieldElement"
            || elementtype == "XTextSubDocumentElement"
            || (element.nodeName == "TR" && element.parentNode.getAttribute("dctype") == "XTextTableElement")
            || (element.nodeName == "TD" && element.parentNode.parentNode.getAttribute("dctype") == "XTextTableElement");
        if (islegaltype == false) {
            return;
        }
        var isinputfield = elementtype == "XTextInputFieldElement";
        var isformview = DCWriterControllerEditor.IsFormView();
        //后端属性正常写
        if (isreadonly == true) {
            element.setAttribute("dc_contentreadonly", "True");
        } else {
            element.setAttribute("dc_contentreadonly", "False");
        }
        //前台属性要根据表单状态与是否是输入域以及元素当前继承下来的可编辑性综合处理
        if (isformview == false) {
            //正常情况直接设置
            if (isreadonly == true) {
                element.setAttribute("contenteditable", "false");
            } else {
                element.setAttribute("contenteditable", "true");
            }
        } else {
            //表单情况下，只对输入域进行设置，其它元素默认不应该更改原有的可编辑性
            if (isinputfield == true) {
                if (isreadonly == true) {
                    element.setAttribute("contenteditable", "false");
                } else {
                    element.setAttribute("contenteditable", "true");
                }
            }
        }
    };

    //@method DCWriter编辑器控件客户端自我检测
    //@returns 布尔值，检测是否通过。
    rootElement.DCWebWriterControlSelfChecking = function () {
        //debugger;
        if (rootElement.getAttribute('dctype') != 'WebWriterControl') {
            return false;
        }
        var funcShowErrorMessage = function (element, msg) {
            var node = document.createElement('div');
            node.style.fontSize = '20px';
            node.style.fontWeight = 'bold';
            node.style.color = 'red';
            node.style.backgroundColor = 'yellow';
            node.style.border = '1px solid black';
            node.appendChild(document.createTextNode('编辑器控件[' + element.id + ']自检错误：' + msg));
            if (element.firstChild == null) {
                element.appendChild(node);
            }
            else {
                element.insertBefore(node, element.firstChild);
            }
        };

        var servicePageUrl = rootElement.getAttribute('servicepageurl');
        var referencePath = rootElement.getAttribute("referencepathfordebug");
        if ((servicePageUrl == null || servicePageUrl.length == 0) && (referencePath == null || referencePath.length == 0)) {
            funcShowErrorMessage(rootElement, '没配置ServicePageUrl或ReferencePathForDebug属性!');
        }
        else {
            //var settings = { url: servicePageUrl + "?dcwritertest=1" };
            //DCDomTools.fixAjaxSettings(settings);
            //$.ajax( settings ).complete(function (jqXHR, textStatus) {
            //    if (jqXHR.status != 200) {
            //        funcShowErrorMessage(rootElement, '配置的服务器页面地址[' + servicePageUrl + ']测试未通过,HTTP状态为:' + xmlhttp.status);
            //    }
            //    else {
            //        var txt = jqXHR.responseText;
            //        if (txt == null || txt.indexOf('dcwriter_test_ok') < 0) {
            //            funcShowErrorMessage(rootElement, '配置的服务器页面地址[' + servicePageUrl + ']测试未通过，返回:' + txt);
            //        }
            //    }
            //});

        }
        return true;
    };

    //@method DCWriter编辑器控件客户端自我检测
    //@returns 布尔值，检测是否通过。
    rootElement.DCWebWriterControlSelfChecking = function () {

    };

    // 加载初始化的文档内容
    for (var iCount = 0; iCount < rootElement.childNodes.length; iCount++) {
        var node = rootElement.childNodes[iCount];
        if (node.nodeName == "TEXTAREA" && node.getAttribute("dctype") == "DCHtmlSource") {
            var msg = rootElement.GetDCWriterString("JS_LoadingFile_Name", node.title);
            var win = rootElement.GetContentWindow();
            win.document.write(msg);
            win.document.close();

            var htmlresult = node.value;;
            //debugger;
            if (htmlresult.indexOf("&") != -1) {
                htmlresult = DCDomTools.HTMLDecode(node.value);
            }
            rootElement.LoadDocumentFromHtmlText(htmlresult);
            node.parentNode.removeChild(node);

            break;
        }
    } //for

    return true;
};

//@method 自动创建编辑器框架。
function DCWriterAutoLoadControl() {
    if (document.readyState == "complete") {
        var divs = document.getElementsByTagName("DIV");
        if (divs != null && divs.length > 0) {
            for (var iCount = 0; iCount < divs.length; iCount++) {
                var div = divs[iCount];
                if (div.getAttribute("autobuildwebwriterControl") != "true") {
                    continue;
                }
                if (div.FrameBuilded == true) {
                    continue;
                }
                BindingDCWriterClientControl(div);
                div.BuildFrame();
            }
        }
    }
}

if (document.addEventListener) {
    // Use the handy event callback
    document.addEventListener("DOMContentLoaded", DCWriterAutoLoadControl, false);

    // A fallback to window.onload, that will always work
    window.addEventListener("load", DCWriterAutoLoadControl, false);

    // If IE event model is used
} else if (document.attachEvent) {
    // ensure firing before onload,
    // maybe late but safe also for iframes
    document.attachEvent("onreadystatechange", DCWriterAutoLoadControl);
}