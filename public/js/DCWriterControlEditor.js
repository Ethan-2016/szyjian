// DCWriter 的WEB控件的内容编辑使用的ＪＳ代码，编制袁永福2015-5-24 
//
//  编辑器客户端处理对象
//**************************************************************************************************************
  
var DCWriterControllerEditor = new Object();
 
// 获得当前元素
DCWriterControllerEditor.CurrentElement = function (funcFilter) {
    var sel = DCSelectionManager.getSelection();
    //20200805 xym 修复IE8上获取不到当前元素问题
    if (DCSelectionManager.LastSelectionInfo != null && (sel.startContainer == null || $(sel.startContainer).parents("body")[0] != document.body)) {
        sel = DCSelectionManager.LastSelectionInfo;
    }
    //修复IE上获取不到input的节点
    if (sel.startContainer == null && $("[dctype='XTextInputFieldElement']:focus")[0]) {
        sel.startContainer = $("[dctype='XTextInputFieldElement']:focus")[0];
    }
    if (sel == null || sel.startContainer == null) {
        return null;
    }
    var node = sel.startContainer;
    if (typeof (funcFilter) != "undefined") {
        // 指定的参数
        while (node != null) {
            if (typeof (funcFilter) == "function") {
                // 参数为一个函数，则执行函数
                if (funcFilter(node) == true) {
                    return node;
                }
            }
            else if (typeof (funcFilter) == "string") {
                // 参数为一个字符串，则进行节点名称的匹配
                if (node.nodeName == funcFilter) {
                    return node;
                }
            }
            node = node.parentNode;
        } //while
    }
    if (typeof (funcFilter) != "undefined") {
        // 指定了过滤条件但未命中，则返回空对象
        return null;
    }
    return sel.startContainer;
};

// 获得 divAllContainer
// IE有个BUG，document.execCommand(alignleft)可能会清掉divAllContainer元素的ID属性值，在此进行修正
DCWriterControllerEditor.getdivAllContainer = function () {
    var div = document.getElementById("divAllContainer");
    if (div == null) {
        var div2 = document.getElementById("divDocumentBody_0");
        if (div2 != null) {
            div = div2.parentNode;
            div.id = "divAllContainer";
            return div;
        }
        else {
            return null;
        }
    }
    else {
        //this.backOfdivAllContainer = div;
        return div;
    }
};

// 获得文档参数值
DCWriterControllerEditor.GetVarialbeValue = function (vName) {
    return document.body.getAttribute("dvvar_" + vName);
    
};

// 获取当前是否是表单模式
DCWriterControllerEditor.IsFormView = function () {
    var formview = document.body.getAttribute("formview");
    var formview2 = null;    
    if (document.WriterControl != null && document.WriterControl.Options != null) {
        formview2 = document.WriterControl.Options.FormView;
    }
    var isformview = formview == "Strict" || formview == "Normal";
    var isformview2 = formview2 == "Strict" || formview == "Normal";
    if (isformview || isformview2) {
        return true;
    } else {
        return false;
    }
};

//@method 设置注册码
//@param strCode 新注册码。
//@returns 一个布尔值，表示操作是否成功
DCWriterControllerEditor.SetRegisterCode = function (strCode) {
    var url = document.body.getAttribute("servicepageurl");
    if (url != null && url.length > 0) {
        url = url + "?setregisgercode=1";
        var result = DCDomTools.PostContentByUrlNotAsync(url, false, strCode);
        return result;
    }
    return false;
};


// 获得固定页眉的高度
DCWriterControllerEditor.getFixedHeaderHeight = function () {
    var divHeader = document.getElementById("divXTextDocumentHeaderElement");
    if (divHeader != null) {
        if (divHeader.style.position == "fixed" || divHeader.style.position == "relative") {
            return divHeader.scrollHeight;
        }
    }
    return 0;
};

// 为固定页眉而调整文档的滚动量
DCWriterControllerEditor.fixScrollPositionForFixedHeader = function () {
    var divHeader = document.getElementById("divXTextDocumentHeaderElement");
    if (divHeader != null) {
        if (divHeader.style.position == "fixed" || divHeader.style.position == "relative") {
            document.body.scrollTop = document.body.scrollTop - divHeader.scrollHeight;
        }
    }
};

//@method 触发编辑器控件事件处理
//@param eventObject 事件对象
//@param eventName 事件名称
DCWriterControllerEditor.executeWriterControlEventHandler = function (eventObject, eventName) {
    if (eventObject != null && eventObject.cancelBubble == true) {
        // 参数指明不再触发后续事件
        return;
    }
    var ctl = document.WriterControl;// this.GetWriterControlElement();
    if (ctl != null) {
        ctl.raiseDCClientEvent(eventObject, eventName);
    }
};


// 初始化对象
DCWriterControllerEditor.Init = function () {

    if (window.frameElement != null && window.frameElement.parentNode != null) {
        var wc = window.frameElement.parentNode;
        if (wc.getAttribute("dctype") == "WebWriterControl") {
            document.WriterControl = wc;
        }
        //DuRui-2020.07.21新增
        var isMobileDr = /(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent);
        //判断是否为手机端
        if (isMobileDr && document.body.getAttribute("ismobiledevice") == "true") {
            //水印取消显示
            document.getElementById("lblDCWebWriterControlControlInfo").parentNode.style.display = "none"; 
            document.getElementById("divXTextDocumentHeaderElement").style.display = "none"; 
            document.getElementById("divXTextDocumentFooterElement").style.display = "none";
            var isTab = document.getElementById("divDocumentBody_0").childNodes
            //修改手机端显示全屏
            var tab = document.getElementById("dctable_AllContent").style.width = "100%";
            document.getElementById("dcGlobalRootElement").style.backgroundColor = "rgb(245, 245, 245)";
            
            var Input = $("[dctype='XTextInputFieldElement']");
            var Radio = $("[dctype='XTextCheckBoxElementBaseLabel']").parent();
            //输入域样式
            Input.each(function () {
                if (this.nodeName == "SELECT") {
                    this.style.border = "none";
                    this.style.fontFamily = "微软雅黑";
                    this.style.fontSize = "13pt";
                    this.style.width = "40%";
                    this.style.backgroundColor = "white";
                    this.style.color = "rgb(128, 128, 128) ";
                    this.removeAttribute('autowidth');
                    this.style.marginLeft = "5%";
                    //下拉多选样式修改
                    if (this.getAttribute("multiple") == "multiple") {
                        this.style.fontSize = "13pt";
                        this.style.height = "1.6em";
                        $(this).focus(function () {
                            $(this).css('height', '')
                        });
                        $(this).blur(function () {
                            $(this).css('height', '1.6em')
                        })
                        var Div = $("<div class='housing-label'>未选择</div>");
                        Div.insertAfter($(this));
                        $(".housing-label").css({
                            "color": "#807979",
                            "margin-top": "25px",
                            "border-top": "1px solid #e0d7d7",
                            "padding-top": "10px",
                            "overflow": "auto",
                            "font-size": "13pt"
                        });
                        $("select[multiple=multiple]").attr("class", "Sele")
                        $('.Sele').change(function () {
                            var s = $(this).find('option').not(function () { return !this.selected }).map(function () {
                                return $(this).text();
                            }).get().join('，');
                            s = s || '未选择';
                            $(this).parent().find('.housing-label').html(s);
                        });
                    }

                } else if (this.nodeName == "SPAN") {
                    this.style.backgroundColor = "white";
                    this.style.marginLeft = "5%";
                    this.style.fontFamily = "微软雅黑";
                    this.style.verticalAlign = "middle";
                    this.style.fontSize = "11pt";

                    this.setAttribute("contenteditable", "true")

                    //Label.each(function () {
                    //    if (this.nodeName ==  "LABEL") {
                    //        this.setAttribute("contenteditable", "true")
                    //    }
                    //});

                    //边框隐藏
                    $(this).find("[dctype='start'],[dctype='end']").css({ "opacity": 0 });
                } else if (this.nodeName == "INPUT") {
                    this.style.width = "40%";
                    this.style.fontFamily = "微软雅黑";
                    if (this.getAttribute("type") == "datetime-local") {
                        this.setAttribute("type", "data")
                        this.style.borderRight = "0";
                        this.style.borderLeft = "0";
                        this.style.backgroundColor = "white";
                        this.style.marginLeft = "5%";
                        this.style.fontSize = "13pt";
                        $(this).focus(function () {
                            document.activeElement.blur();
                        });
                    };
                    if (this.getAttribute("type") == "number") {
                        this.style.borderRight = "0";
                        this.style.borderLeft = "0";
                        this.style.backgroundColor = "white";
                        this.style.marginLeft = "5%";
                        $(this).focus(function () {
                            document.activeElement.blur();
                        });
                    }
                }
            });
            //单复选框样式
            Radio.each(function () {
                var radio = this.getElementsByTagName("label");
                $(radio).wrapAll("<div id='Radio'></div>")
                for (var i = 0; i < radio.length; i++) {
                    if (i % 2 != 0) {
                        var Br = $("<br>");
                        Br.insertBefore($(radio[i]));
                        radio[i].style.marginRight = "1.5rem";
                    }
                    if (i != 0) {
                        radio[i].style.display = "inline-block";
                        radio[i].style.width = "39%";
                        radio[i].style.marginLeft = "1rem";
                        radio[i].style.marginTop = "1rem";
                        radio[i].style.textIndent = "-1.2rem";
                        radio[i].style.verticalAlign = "top";
                        radio[i].style.fontFamily = "微软雅黑";
                        radio[i].style.fontSize = "13pt";
                    }
                }
                $(this).children()[0].style.width = "100%";
            });

            //护理文书样式
            if (isTab.length == 1) {
                $(isTab[0]).css({ "white-space": "nowrap" });
                var flag = true
                $(isTab[0]).find("[dcpf='1']").css({ "display": "none" });
                var span = isTab[0].childNodes
                for (var i = 0; i < span.length; i++) {
                    if (span[0].firstChild.getAttribute("style") == span[i].firstChild.getAttribute("style")) {
                        $(span[i]).css({
                            "display": "inline-block",
                            "margin": "5px"
                        });
                    } else if (span[i].firstChild.getAttribute("style") == "display: none;") {
                        $(span[i]).css({ "display": "none" });
                    } else {
                        if (flag) {
                            var Br = $("<br>");
                            Br.insertBefore($(span[i]));
                            flag = false;
                        }
                        $(span[i]).css({
                            "display": "inline-block",
                            "margin": "5px"
                        });
                    }

                }
            }

        }
    }

    // 获得客户端事件对象
    document.DCGetClientEventHandler = function (eventName) {
        if (document.WriterControl != null) {
            var func = document.WriterControl[eventName];
            if (typeof (func) == "function") {
                return func;
            }
        }
        var func2 = document.body[eventName];
        if (typeof (func2) == "function") {
            return func2;
        }
        return null;
    };

    // 获得指定名称的字符串资源
    document.GetDCWriterString = function (name, parameters) {
        if (name == null && name.length == 0) {
            return name;
        }
        var strs = document.DCWriterStringsContainer;

        if (document.WriterControl != null) {
            strs = document.WriterControl.DCWriterStringsContainer;
        }
        if (strs != null) {
            name = name.toLowerCase();
            var text = strs[name];
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
        }
        return name;
    };

    // 动态绑定输入域事件
    var allInputElements = new Array();
    var funcGetInputElements = function (list, tagName) {
        var elements = document.getElementsByTagName(tagName);
        for (var iCount = 0; iCount < elements.length; iCount++) {
            if (elements[iCount].getAttribute("dctype") == "XTextInputFieldElement") {
                list.push(elements[iCount]);
            }
        }
    }


    //拖放对象,触发对象
    this.readonly = document.body.getAttribute("readonly") == "true";
    var div = DCWriterControllerEditor.getdivAllContainer();
    //    if (div != null) {
    //        this.readonly = div.getAttribute("contenteditable") != "true";
    //    }
    if (this.readonly == false) {
        //document.designMode = "on";
        try {
            if (document.queryCommandSupported == null || document.queryCommandSupported("enableObjectResizing") == true) {
                document.execCommand("enableObjectResizing", false, true);
            }
        }
        catch (e) {
        }
        try {
            if (document.queryCommandSupported == null || document.queryCommandSupported("enableInlineTableEditing") == true) {
                document.execCommand("enableInlineTableEditing", false, true);
            }
        }
        catch (e) {
        }
    }

    document.setMouseDragScroll = function (setValue) {
        DCDomTools.setMouseDragScrollMode(document.body);
    };

    DCWriterControllerEditor.servicePageURL = document.body.getAttribute("servicepageurl");
    // 开始计算服务器回话超时检测
    //DCWriterControllerEditor.resetSessionTimeout();

    var bodyClick = function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        DCDropdownControlManager.DisableDropdownControlDelay(0);
        if (DCDragResizeManager.HandleBodyClick(eventObject) == true) {
            return;
        }
        //DCDocumentCommentManager.SetCurrentDocumentCommentBySelection();
        if (DCDropdownControlManager.showingDropdownControl != true) {
            //debugger;
            var div = DCDropdownControlManager.GetDropdownContainer();
            if (div != null && div.style.display != "none") {
                if (DCDropdownControlManager.GetTickSpan() < 1000) {
                }
                var p = null;
                // 获得触发事件的来源
                if (eventObject.srcElement) {
                    p = eventObject.srcElement;
                }
                else if (eventObject.target) {
                    p = eventObject.target;
                }
                // 判断是否为下拉列表容器元素的子内容
                while (p != null) {
                    if (p == div) {//|| p == div.currentElement) {
                        //alert("aaaa" + eventObject);
                        return;
                    }
                    p = p.parentNode;
                }
                //debugger;
                // 20191104 xuyiming 修复DCWRITER-2917
                DCDropdownControlManager.CloseDropdownControl(null, false);
            }
        }


        var node = eventObject.srcElement ? eventObject.srcElement : eventObject.target;
        if (node.id == DCDragResizeManager.IDForResizeBox) {
            return;
        }
        if (node.id == "divHeaderFooterFlag") {
            return;
        }
        if (node == document.body) {
            return;
        }
        var inContent = DCDomTools.isContentEditable( node );

        if (inContent == false) {
            var sel = DCDomTools.getSelection();
            // 点击超过文档内容容器，则选中文档容器
            if (node != null) {
                while (node != null) {
                    if (node.parentNode != null && node.parentNode.isContentEditable == true) {
                        DCDomTools.MoveCaretTo(node);//修复病程不可编辑时不能选中问题
                        return ;
                    }
                    node = node.parentNode;
                }
            }
            //DCSelectionManager.focusFirstEditableArea();
        } //if

        DCSelectionManager.TickDelayDetectSelectionChanged = null;
        DCSelectionManager.detectSelectionChanged();
        DCWriterControllerEditor.executeWriterControlEventHandler(eventObject, "ondocumentclick");
    };

    $(document.body).on("click", bodyClick);

    var bodyondeactivate = function (eventObject) {
        if (DCDropdownControlManager.showingDropdownControl != true) {
            //alert("dddddddd");
            DCDropdownControlManager.CloseDropdownControl();
        }
    };

    var funcOnDocumentScroll = function () {
        var tickSpan = DCDropdownControlManager.GetDropdownControlDisplayMillisecondsSpan();
        if (tickSpan == 0 || tickSpan > 300) {
            DCDropdownControlManager.CloseDropdownControl();
        }
        var divHeader = document.getElementById("divXTextDocumentHeaderElement");
        if (divHeader != null && divHeader.style.position == "relative") {
            // 固定表头的
            divHeader.style.top = Math.max(0, document.body.scrollTop - 1);
        }
        var trRegisterInfo = document.getElementById("trRegisterInfo");
        if (trRegisterInfo != null && trRegisterInfo.style.position == "relative") {
            trRegisterInfo.style.top = Math.max(0, document.body.scrollTop - 1);
        }
    };

    $(document).on("resizestart", function () {
        DCWriterControllerEditor.ExecuteAutoZoom();
        DCDropdownControlManager.CloseDropdownControl();
        //DCWriterControllerEditor.SetContainerHeightForMobileDevice();
    });

    $(window).on("resize", function () {
      //  DCWriterControllerEditor.OnDocumentResize(); MVC下无限触发，暂时屏蔽下
    });

    //rootElement.frameDocument.ondeactivate = function () { this.body.CloseDropdownControl(); };
    //rootElement.frameDocument.onfocusout = function () { this.body.CloseDropdownControl(); };
    $(window).on("blur", function () {
        DCDropdownControlManager.CloseDropdownControlWithCheckTimeSpan();
    });

    /* 对于IE浏览器，用户点击下拉列表会在click事件之前触发deactive事件，导致下拉列表功能失效。
    因此屏蔽此功能。
    $(window).on("deactivate", function () {
    //window.setTimeout(DCDropdownControlManager.CloseDropdownControlWithCheckTimeSpan, 50);
    });*/

    $(window).on("scroll", funcOnDocumentScroll);
    //    try {
    //        window.onscroll = funcOnDocumentScroll;
    //    }
    //    catch (ext) {
    //    }
    $(window).on("move", function () {
        DCDropdownControlManager.CloseDropdownControl();
    });

    //rootElement.frameDocument.onfocusout = function () { this.body.CloseDropdownControl(); };
    $(document.body).on("scroll", function () {
        funcOnDocumentScroll();
    });

    $(document.body).on("dblclick", function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        DCWriterControllerEditor.executeWriterControlEventHandler(eventObject, "ondocumentdblclick");
    });


    $(document.body).on("mousedown", function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        if (WriterCommandModuleTable.HandleMouseEvent(eventObject, 1) == true) {
            return;
        }
        DCWriterControllerEditor.executeWriterControlEventHandler(eventObject, "ondocumentmousedown");
    });

    $(document.body).on("mousemove", function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        if (DCDragResizeManager.HandleBodyMouseMove(eventObject) == true) {
            return;
        }
        if (WriterCommandModuleTable.HandleMouseEvent(eventObject, 0) == true) {
            return;
        }
        DCWriterControllerEditor.executeWriterControlEventHandler(eventObject, "ondocumentmousemove");
    });

    $(document.body).on("mouseup", function (eventObject) {
        if (window.CurrentFormatBrush != null) {
            // 正在执行格式刷功能
            WriterCommandModuleFormat.ApplyBrushFormat(eventObject);
            return;
        }
        eventObject = DCDomTools.FixEventObject(eventObject);
        if (WriterCommandModuleFormat.ApplyBrushFormat(eventObject) == true) {
            return false ;
        }
        if (DCDragResizeManager.HandleBodyMouseUp(eventObject) == true) {
            return;
        }
        if (WriterCommandModuleTable.HandleMouseEvent(eventObject, 2) == true) {
            return;
        }
        DCWriterControllerEditor.executeWriterControlEventHandler(eventObject, "ondocumentmouseup");
    });

 
    DCWriterControllerEditor.ExecuteAutoZoom();
};

// 文档大小发生改变时处理
DCWriterControllerEditor.OnDocumentResize = function () {
    DCWriterControllerEditor.ExecuteAutoZoom();
    DCDropdownControlManager.CloseDropdownControl();
    DCDragResizeManager.UpdateHandlerPosition();
    var lblControlInfo = document.getElementById("lblDCWebWriterControlControlInfo");
    if (lblControlInfo != null) {
        // 设置控件信息标签元素
        var cell = DCDomTools.getParentSpecifyNodeName(lblControlInfo, "TD");
        if (cell != null && cell.previousSibling != null) {
            lblControlInfo.style.left = 4 - cell.previousSibling.offsetWidth;
        }
    }
    //DCWriterControllerEditor.SetContainerHeightForMobileDevice();
};
 

// 判断服务器会话是否超时
DCWriterControllerEditor.isSessionTimeout = function () {
    var url = document.body.getAttribute("servicepageurl")
        + "?dcwritertestsessiontimeout="
        + document.body.getAttribute("controlinstanceid");
    var result = true;
    var funcCallback = function (responseText) {
        if (responseText != null && responseText.indexOf("dcwritersessiontimeoutflag") >= 0) {
            result = false;
        }
    };
    var txt = DCDomTools.GetContentByUrlNotAsync(url);
    if (txt != null && txt.indexOf("sessionok") >= 0) {
        return true;
    }
    else {
        return false;
    }
};
 
//**************************************************************************************************************
// 判断是否存在指定名称的服务器事件
DCWriterControllerEditor.HasServerEvent = function (eventName) {
    var eventNameList = document.body.getAttribute("servereventnamelist");
    if (eventNameList != null && eventNameList.length > 0) {
        if (eventNameList.indexOf(eventName) >= 0) {
            return true;
        }
    }
    return false;
};

// 为移动设备来设置文档元素高度
DCWriterControllerEditor.SetContainerHeightForMobileDevice = function () {
    ////alert(document.body.scrollHeight);
    //return;
    //if (document.body.getAttribute("ismobiledevice") == "true") {
    //    // 移动模式
    //    if (document.body.getAttribute("autoheightinmobiledevice") == "true") {
    //        var frame = window.frameElement;
    //        if (frame != null) {
    //            if (document.body.scrollHeight > 0) {
    //                //frame.scrolling = "no";
    //                frame.style.height = document.body.scrollHeight + 4;
    //                frame.height = document.body.scrollHeight + 4;
    //                frame.parentNode.style.height = "";
    //            }
    //        }
    //    }
    //}
};

//**************************************************************************************************************
// 执行视图自动缩放
DCWriterControllerEditor.ExecuteAutoZoom = function () {
    ////return;
    //if (document.body.getAttribute("autozoom") != "true") {
    //    return;
    //}
    //var element = document.getElementById("dctable_AllContent");
    //if (element != null) {
    //    var contentWidth = 0;
    //    if (element.contentWidth) {
    //        contentWidth = element.contentWidth;
    //    }
    //    else {
    //        element.contentWidth = element.offsetWidth;
    //        contentWidth = element.offsetWidth;
    //    }
    //    var rate = (document.body.clientWidth - 8) / contentWidth;
    //    if (rate < 0.4) {
    //        rate = 0.4;
    //    }
    //    //        if (rate < 1) {
    //    //            rate = 1;
    //    //        }
    //    var rootElement = document.body; //.getElementById("dctable_AllContent"); // document.body;
    //    var oldRate = parseFloat(rootElement.style.zoom);
    //    if (oldRate != rate) {
    //        rootElement.style.zoom = rate;
    //        //rootElement.style.width = contentWidth * rate;
    //        //DCWriterControllerEditor.SetContainerHeightForMobileDevice();
    //    }

    //}
};

//**************************************************************************************************************
// 执行标签点击操作
DCWriterControllerEditor.OnLabelClick = function (srcElement) {
    if (srcElement == null) {
        // ID为空则不执行操作
        return;
    }
    var targetElement = null;
    var dcfor = srcElement.getAttribute("for");
    if (dcfor != null && dcfor.length > 0) {
        targetElement = document.getElementById(dcfor);
    }
    //if (targetElement == null) {
    //    dcfor = srcElement.getAttribute("dcfor");
    //    if (dcfor != null && dcfor.length > 0) {
    //        var $t = $("*[idback='" + dcfor + "']", document.body);
    //        if ($t.length > 0) {
    //            targetElement = $t[0];
    //        }
    //    }
    //}
    if (targetElement == null) {
        // 没有找到元素对象则不处理
        return;
    }
    if (targetElement.nodeName == "INPUT"
        && (targetElement.type == "checkbox" || targetElement.type == "radio")) {
        // 处理单选框和复选框
        if (targetElement.getAttribute("readonly") != "true") {
            targetElement.checked = !targetElement.checked;
            DCWriterControllerEditor.HandleCheckedChanged(targetElement);
        }
        // DCDomTools.MoveCaretTo(targetElement);
        DCDomTools.MoveCaretToIndex(targetElement, 0);
    }
    else if (targetElement.nodeName == "INPUT"
        || targetElement.nodeName == "SELECT"
        || targetElement.nodeName == "TEXTAREA") {
        // 处理其他表单元素，使其获得输入焦点。
        //DCDomTools.setActive(element);
        if (targetElement.select) {
            targetElement.select();
        }
        if (targetElement.focus) {
            targetElement.focus();
        }
    }
    else if (targetElement.nodeName == "SPAN") {
        // 疑似输入域元素
        DCWriterControllerEditor.SetFocus(targetElement);
    }
};
//**************************************************************************************************************
// 设置元素文本值
DCWriterControllerEditor.SetElementText = function (id, newText) {
    if (id == null) {
        return false;
    }
    var elements = null;
    if (id.nodeName) {
        if (id.nodeName == "#text") {
            // 输入为一个HTML纯文本元素
            id.nodeValue = newText;
            return true;
        }
        // 输入的为一个HTML元素
        elements = new Array();
        elements.push(id);
    }
    else {
        // 输入的为一个ID号
        element = document.getElementById(id);
        if (element != null) {
            elements = new Array();
            elements.push(element);
            var p = element.parentNode;
            while (p != null) {
                if (p.id == "divXTextDocumentFooterElement"
                    || p.id == "divXTextDocumentHeaderElement") {
                    // 属于页眉页脚中，可能存在重复ID号。
                    elements = $("[id='" + id + "']");
                    break;
                }
                p = p.parentNode;
            }
        }
    }
    if (elements == null || elements.length == 0 ) {
        return false;
    }
    var printMode = document.body.getAttribute("printhtml") == "true";
    for (var iCount = 0; iCount < elements.length; iCount++) {
        element = elements[iCount];
        if (element.tagName == "TD") {
            // var result = DCDomTools.SetInnerText(element, newText);
            var result = DCDomTools.SetInnerHTML(element, newText);
        }
        else if (element.tagName == "INPUT"
            || element.tagName == "SELECT"
            || element.tagName == "TEXTAREA") {
            element.setAttribute("dc_innertext", newText);
            element.value = DCWriterControllerEditor.GetFormatedText(element, newText);
            element.Modified = true;
            DCDomTools.addClass(element, "TagColorForModifiedField");
            if (DCInputFieldManager.IsInputFieldElement(element) == true) {
                DCInputFieldManager.UpdateInnerValue(element);
                DCInputFieldManager.HandleInputFieldEvent(null, element, "onchange");//程序设置值时添加触发表达式
            }
        }
        else if (DCInputFieldManager.IsInputFieldElement(element) == true) {
            DCInputFieldManager.SetCurrentInputFieldValue(newText, newText, false, element, true);
            element.Modified = true;
            DCDomTools.addClass(element, "TagColorForModifiedField");
            DCInputFieldManager.HandleInputFieldEvent(null, element, "onchange");//程序设置值时添加触发表达式
            //element.style.width = "auto";
        }
        else {
            DCDomTools.SetInnerText(element, newText);
            //20200921 xym 修复标签文本修改内容无法保存问题
            if (element.getAttribute("dctype") == "XTextLabelElement") {
                element.setAttribute("dc_text", newText);
            }
        }
    }
    return true;
};


// 设置选框元素的选中状态
DCWriterControllerEditor.SetElementCheckedByID = function (id, checked, specifyElement) {
    if (checked !== true && checked !== false) {
        console.log("SetElementCheckedByID：checked必须为布尔值");
        return false;
    }
    var element = null;
    if (id != null) {
        element = document.getElementById(id);
    } else if (specifyElement) {
        element = specifyElement;
    }
    
    if (element === null) {
        console.log("SetElementCheckedByID：元素没有找到");
        return false;
    }
    if (element.nodeName === "INPUT" &&
        (element.type === "radio" || element.type === "checkbox")) {
        if (element.checked !== checked) {
            if (element.checked) {
                $(element).data('waschecked', true);
            } else {
                $(element).data('waschecked', false);
            }
            element.checked = checked;
            DCWriterControllerEditor.HandleCheckedChanged(element);
        }
        return true;
    } else {
        console.log("SetElementCheckedByID：找到的元素状态不对");
        return false;
    }
};

//**************************************************************************************************************
// 获得元素文本值
DCWriterControllerEditor.GetElementText = function (id, isHasTag) {
    if (id == null) {
        return null;
    }
    var element = null;
    var result = null;
    if (id.nodeName) {
        if (id.nodeName == "#text") {
            // 输入为一个HTML纯文本元素
            return id.nodeValue;
        }
        // 输入的为一个HTML元素
        element = id;
    } else {
        // 输入的为一个ID号
        element = document.getElementById(id);
    }
    if (element == null) {
        var elements = document.getElementsByName(id);
        if (elements != null && elements.length > 0) {
            if (elements[0].nodeName == "INPUT" &&
                (elements[0].type == "checkbox" || elements[0].type == "radio")) {
                // 遇到单选框或者复选框
                result = "";
                for (var iCount = 0; iCount < elements.length; iCount++) {
                    var e = elements[iCount];
                    if (e.checked == true && e.value != null && e.value.length > 0) {
                        if (result.length > 0) {
                            result = result + ",";
                        }
                        result = result + e.value;
                    }
                } //for
                return result;
            }
        }
        return null;
    }
    if (element.tagName == "TD") {
        return DCDomTools.GetInnerText(element);
    } else if (element.tagName == "SELECT") {
        if (element.selectedIndex >= 0) {
            var opt = element.options[element.selectedIndex];
            var txt = opt.text;
            if (txt == null || txt.length == 0) {
                txt = opt.value;
            }
            return txt;
        } else {
            return "";
        }
    } else if (element.tagName == "INPUT" ||
        element.tagName == "TEXTAREA") {
        return element.value;
    }

    result = "";
    for (var iCount2 = 0; iCount2 < element.childNodes.length; iCount2++) {
        var node = element.childNodes[iCount2];
        if (node.nodeName == "#text") {
            result = result + node.nodeValue;
        } else if (node.nodeName == "STYLE") { // 20191023 xuyiming 获取元素text值时忽略css样式

        } else if (node.getAttribute && node.getAttribute("dcignore") == "1") { // 忽略掉的元素

        } else if (node.nodeName == "BR" && isHasTag) {
            result += '\n'
        } else {
            result = result + DCWriterControllerEditor.GetElementText(node, isHasTag);
        }
    }
    // 20200702 xym 将ensp;空格替换为标准空格
    var reg = new RegExp(String.fromCharCode(8194), "g");
    result = result.replace(reg, " ");
    // 将160字符转换为标准空格
    result = result.replace(String.fromCharCode(160), " ");
    return result;
    //return element.innerText;
};
//**************************************************************************************************************
// 获得元素InnerValue文本
DCWriterControllerEditor.GetElementInnerValueStringByID = function (id) {
    var element = document.getElementById(id);
    if (element == null) {
        return null;
    }
    return DCWriterControllerEditor.GetElementInnerValueString(element);
};
DCWriterControllerEditor.GetElementInnerValueString = function (element) {
    if (element == null) {
        return null;
    }
    if (element.tagName == "TD") {
        return DCDomTools.GetInnerText(element);
    }
    else if (element.tagName == "INPUT"
        || element.tagName == "SELECT"
        || element.tagName == "TEXTAREA") {
        var v = element.value;
        //alert(v);
        return v;
    }
    if (DCInputFieldManager.IsInputFieldElement(element))
        var innerValue = element.getAttribute("dc_innervalue");
    if (innerValue != null && innerValue.length > 0) {
        return innerValue;
    }
    var result = "";
    for (var iCount = 0; iCount < element.childNodes.length; iCount++) {
        var node = element.childNodes[iCount];
        if (node.nodeType == "#text") {
            result = result + node.value;
        }
        else if (node.getAttribute && node.getAttribute("dcignore") != "1") {
            result = result + DCWriterControllerEditor.GetElementText(node);
        }
    } //for
    return result;
};
//**************************************************************************************************************
// 设置元素InnerValue文本
DCWriterControllerEditor.SetElementInnerValueString = function (id, newValue,newText) {
    var newObj = {
        text: newText || newValue,
        value: newValue
    }
    //console.log(newObj);
    if (newText) {//输入两个值时，即newText存在
        DCWriterControllerEditor.SetElementText(id, newObj.text);
    }

    var element = document.getElementById(id);
    if (element == null) {
        return false;
    }
    if (element.tagName == "TD") {
        element.value = newValue
        return true;
    }
    else if (element.tagName == "INPUT"
        || element.tagName == "SELECT"
        || element.tagName == "TEXTAREA") {
        element.value = newValue
        return true;
    }
    if (DCInputFieldManager.IsInputFieldElement(element)) {
        element.setAttribute("dc_innervalue", newValue);
        return true;
    }
};
//**************************************************************************************************************
// 获得元素数值
DCWriterControllerEditor.GetElementNumericValue = function (id) {
    var value = DCWriterControllerEditor.GetElementInnerValueStringByID(id);
    if (value == null) {
        return NaN;
    } else {
        return parseFloat(value);
    }
};

//**************************************************************************************************************
// 处理单选框、复选框勾选改变事件
DCWriterControllerEditor.HandleCheckedChanged = function (element) {  
    // 设置相关元素的可编辑行为
    var ids = element.getAttribute("editabletargetids");
    if (ids != null && ids.length > 0) {
        var items = ids.split(",");
        for (var iCount = 0; iCount < items.length; iCount++) {
            var targetElement = document.getElementById(items[iCount]);
            if (targetElement != null) {
                var setting = targetElement.getAttribute("dc_elementidforeditabledependent");
                var newValue = element.checked;
                if (setting == "!" + element.id) {
                    newValue = !newValue;
                }
                if (targetElement.isContentEditable != newValue) {
                    if (targetElement.parentNode.isContentEditable == newValue) {
                        targetElement.contentEditable = "inherit";
                    }
                    else {
                        if (newValue == true) {
                            targetElement.contentEditable = true;
                        }
                        else {
                            targetElement.contentEditable = false;
                        }
                    }
                }
            }
        }
    }
    var nodes = DCDomTools.GetCheckRadioBoxElementsByName(element);
    if (element.nodeName === "INPUT" && element.type === "radio") {
        // 遇到单选框
        var $radio = $(element);
        var $nodes = $(nodes);
        if ($radio.data('waschecked') == true) {
            $radio.prop('checked', false);
            $nodes.data('waschecked', false);
            $radio.data('waschecked', false);
        } else {
            $radio.prop('checked', true);
            $nodes.data('waschecked', false);
            $radio.data('waschecked', true);
        }
        // xuyiming 20190905 防止单选框选中状态丢失
        setTimeout(function () {
            if ($radio.data("waschecked") == true) {
                element.checked = true;
            }
            else {
                element.checked = false;
            }
            //$radio.prop('checked',waschecked);
        },100)
    }
    
    for (var iCount2 = 0; iCount2 < nodes.length; iCount2++) {
        var node = nodes[iCount2];
        //WYC20190723：在这里添加前端的单选多选框图片替换逻辑
        DCWriterControllerEditor.HandleCheckedImageChangedByCheckedID(node.id);

        if (node !== element && node.type === "radio") {
            DCWriterControllerEditor.HandleLinkChecked(node);
        }
    }//for
    DCWriterExpressionManager.ExecuteEffectExpression(element);//WYC20190621:移到底下来，当所有值设置完毕后再执行
};

//处理单选多选框的选中指示图片的切换 wuyichao 20190723
DCWriterControllerEditor.HandleCheckedImageChangedByCheckedID = function (id) {
    var imageid = id + "_image";
    var imageelement = document.getElementById(imageid);
    if (imageelement !== null && imageelement.nodeName === "IMG") {
        var imgurl = DCWriterControllerEditor.GetDefaultCheckRadioImageByID(id);
        imageelement.setAttribute("src", imgurl);
    }
};

//根据给定的单选多选框的ID的样式和选中状态获取默认的图片 wuyichao 20190723
DCWriterControllerEditor.GetDefaultCheckRadioImageByID = function (id) {
    //目前先留出接口，以后可以会改进成支持自定义勾选图片的功能，眼下只使用默认图片
    var radiocheckelement = document.getElementById(id);
    if (radiocheckelement !== null && radiocheckelement.nodeName === "INPUT") {
        var visualstyle = radiocheckelement.getAttribute("dc_visualstyle");
        var bradio = (radiocheckelement.type === "radio" && visualstyle !== "CheckBox" && visualstyle !== "SystemCheckBox") ||
            (radiocheckelement.type === "checkbox" && (visualstyle == "RadioBox" || visualstyle == "SystemRadioBox"));
        var bcheck = radiocheckelement.checked;

        var filename = "";
        if (bradio === true && bcheck === true) {
            filename = "rachecked.png";
        } else if (bradio === false && bcheck === true) {
            filename = "chchecked.png";
        } else if (bradio === true && bcheck === false) {
            filename = "raunchecked.png";
        } else if (bradio === false && bcheck === false) {
            filename = "chunchecked.png";
        }
        var fileurl = document.WriterControl.getAttribute("servicepageurl") + "?dcwres=" + filename;
        return fileurl;
    }
    return null;
};

//处理单选框，复选框勾选联动其他单选复选的内容修改 防止迭代错误 张昊 2017-2-17
DCWriterControllerEditor.HandleLinkChecked = function (element) {
    DCWriterExpressionManager.ExecuteEffectExpression(element);
    // 设置相关元素的可编辑行为
    var ids = element.getAttribute("editabletargetids");
    if (ids != null && ids.length > 0) {
        var items = ids.split(",");
        for (var iCount = 0; iCount < items.length; iCount++) {
            var targetElement = document.getElementById(items[iCount]);
            if (targetElement != null) {
                var setting = targetElement.getAttribute("dc_elementidforeditabledependent");
                var newValue = element.checked;
                if (setting == "!" + element.id) {
                    newValue = !newValue;
                }
                if (targetElement.isContentEditable != newValue) {
                    if (targetElement.parentNode.isContentEditable == newValue) {
                        targetElement.contentEditable = "inherit";
                    }
                    else {
                        if (newValue == true) {
                            targetElement.contentEditable = true;
                        }
                        else {
                            targetElement.contentEditable = false;
                        }
                    }
                }
            }
        }
    }
};

//**************************************************************************************************************
// 获得格式化后的文本 袁永福2015-6-27
DCWriterControllerEditor.GetFormatedText = function (element, text) {
    var f = element.getAttribute("dc_displayformat");
    var ismobile = document.body.getAttribute("ismobiledevice") == "true"
    if (f != null && f.length > 0) {
        var nodeName = element.nodeName;
        if (element.nodeName.toLowerCase() == "input") {
            var inputType = element.getAttribute("type");
            switch (f) {
                //输出格式为日期样式，将下拉框转成日期下拉框 
                case "Format:yyyy-MM-dd;Style:DateTime":
                    element.setAttribute("dc_innereditstyle", "Date");
                    break;
                default:
            }
            if (inputType != null) {
                inputType = inputType.toLowerCase();
                if (inputType == "date"
                    // || inputType == "datetime"
                    || (inputType == "datetime-local" && ismobile == false)
                    || inputType == "time") {
                    // 无需进行转换
                    return text;
                }
            }
        }
        var txt = DCWriterControllerEditor.GetElementText(element);
        var newText = ValueFormater.Execute(f, txt, text);
        return newText;
    }
    return text;
};


//*************************************************
// 设置输入域获得焦点
DCWriterControllerEditor.SetFocus = function (element) {
    if (element == null) {
        return;
    }
    if (element.nodeName) {
    }
    else {
        element = document.getElementById(element);
    }
    if (element != null && element.nodeName) {
        if (window.focus) {
            window.focus();
        }
        DCDomTools.FoucsDocument();
//        var pn = element;
//        while (pn != null) {
//            if (pn.parentNode != null && pn.parentNode.isContentEditable == false) {
//                if (pn.focus) {
//                    pn.focus();
//                }
//                if (pn.active) {
//                    pn.setActive();
//                }
//                break;
//            }
//            pn = pn.parentNode;
//        }
        DCSelectionManager.DelayDetectSelectionChanged(1);
        if (element.nodeName == "INPUT"
            || element.nodeName == "SELECT" 
            || element.nodeName == "TEXTAREA") {
            DCDomTools.MoveCaretToIndex(element, 0);
        }
        else if (element.nodeName == "IMG") {
            if (element.nextSibling) {
                setTimeout(function () {
                    DCDomTools.MoveCaretToIndex(element.nextSibling, 0);
                },10)
            } else {
                setTimeout(function () {
                    DCDomTools.MoveCaretToEnd(element.parentNode || element.parentElement);
                }, 10)
            }
        }
        else {
            var aBack = element.getAttribute("contenteditable");
            element.removeAttribute("contenteditable");
            try {
                DCDomTools.MoveCaretToIndex(element, 1);
            }
            finally {
                if (aBack != null) {
                    element.setAttribute("contenteditable", aBack);
                }
            }
        }
        DCDropdownControlManager.DisableDropdownControlDelay(2000);
        DCSelectionManager.DelayDetectSelectionChanged(0);
        DCSelectionManager.detectSelectionChanged();
        DCInputFieldManager.HandleInputFieldEvent(null, element, "onfocus");
    }
};





//***************************************
// 判断能否在文档的当前位置插入元素
DCWriterControllerEditor.CanInsertElementAtCurentPosition = function (elementType) {
    // var sel = DCSelectionManager.LastSelectionInfoWithFix;
    // if (sel == null) {
    //     sel = DCSelectionManager.getSelectionWithFix();
    // }
    //wyc20210126：新增对子文档的特殊判断
    if (elementType === "XTextSubDocumentElement") {
        var currentinput = DCSelectionManager.GetCurrentInputField();
        var currenttablecell = WriterCommandModuleTable.getCurrentCell();
        if (currentinput == null && currenttablecell == null) {
            return true;
        } else {
            return false;
        }
    }
    ///////////////////////////////////////
    var sel = DCSelectionManager.getSelectionWithFix();//20200402 xuyiming 修复DCWRITER-3133
    if (DCSelectionManager.LastSelectionInfoWithFix != null && (sel.startContainer == null || document.body.contains(sel.startContainer) == false)) {
        sel = DCSelectionManager.LastSelectionInfoWithFix;
    }
    if (sel.currentContainer != null && sel.currentContainer.id != "divDocumentBody_0") {//暂时这样写，可能会有问题
        var node = sel.currentContainer;
        while (node != null) {
            var nodeName = node.nodeName;
            if (nodeName == "SPAN"
                || nodeName == "DIV"
                || nodeName == "TD"
                || nodeName == "TR"
                || nodeName == "TABLE"
                || nodeName == "LABEL"
                || nodeName == "A") {
                if (node.isContentEditable == false) {
                    var dcType = node.getAttribute("dctype");
                    if (dcType == "start"
                        || dcType == "end"
                        || dcType == "backgroundtext") {
                        node = node.parentNode;
                        continue;
                    }
                    return false;
                }
                else {
                    return true;
                }
            }
            node = node.parentNode;
        }
    }
    return false;
};
//*************************************************
// 在文档的当前位置插入HTML字符串，并在包括在一个SPAN中。
DCWriterControllerEditor.InsertHtmlAtCurentPosition = function (strHtml) {
    var span = document.createElement("SPAN");
    $(span).html(strHtml);

    var curField = DCSelectionManager.GetCurrentInputField();
    DCWriterControllerEditor.InsertElementAtCurentPosition(span, true);
    //解决 回车粘贴保存多出空行问题
    if (span.nextElementSibling != null && span.nextElementSibling.nodeName == "BR" && span.parentNode.childNodes.length == 2) {
        //span.nextElementSibling.setAttribute("dcpf", "1");
        span.nextElementSibling.remove();
    }
    if (curField != null && curField.nodeName == "SPAN") {
        DCInputFieldManager.FixInputFieldElementDomForBackgroundText(curField);
    }
};

//********************************************
//获取所有病程
DCWriterControllerEditor.GetCourseRecords = function (id) {
    var result = new Array();
    function createSubDoc(subDoc, index) {
        var obj = new Object();
        obj.Element = subDoc; 
        obj.Modified = subDoc.getAttribute("modified");
        obj.ElementID = subDoc.id;
        obj.Message = null;
        obj.Type = "XTextSubDocumentElement";
        obj.ExcludeKeywordText = null;
        obj.Index = index;
        obj.setModified = function (v) {
            var flag = false;
            if (this.Element) {
                this.Element.setAttribute("modified", v);
                flag = true;
            }
            return flag;
        };
        obj.getModified = function () {
            var modified = ""
            if (this.Element) {
                modified = this.Element.getAttribute("modified");
            }
            return modified;
        };
        obj.Select = function () {
            DCDomTools.FoucsDocument();
            DCWriterControllerEditor.SetFocus(this.Element);
            if (this.Element.scrollIntoView) {
                this.Element.scrollIntoView();
            } else {
                DCDomTools.ScrollIntoView(this.Element);
            }
            DCWriterControllerEditor.fixScrollPositionForFixedHeader();
        }
        return obj;
    };
    if (id) {
        var temp = document.getElementById(id);
        if (temp && temp.getAttribute("dctype") == "XTextSubDocumentElement") {
            result.push(createSubDoc(temp, 0));
        }
    } else {
        var indexCount = 0;
        var records = document.getElementsByTagName("DIV");
        if (records && records.length > 0) {
            for (var i = 0; i < records.length; i++) {
                if (records[i].getAttribute("dctype") == "XTextSubDocumentElement") {
                    result.push(createSubDoc(records[i], i));
                }
            }
        }
    }
    return result;
}
//**************************************************
//前端插入xml文档（包括病程记录） 2019-04-23
//@param strHtml 文档字符串
//@param flag 是否是病程记录
//@param options 病程记录属性
DCWriterControllerEditor.InsertHtmlAtCurentPositionFromCourseRecord = function (strHtml, flag, options) {
    if (DCWriterControllerEditor.CanInsertElementAtCurentPosition("XTextSubDocumentElement") == false) {
        console.log("检测到当前有输入域或表格单元格，不允许插入子文档");
        return;
    }
    var div = document.createElement("DIV");
    if (flag) { //插入病程记录
        CreateDivSubDoc(div, options);
    }
    $(div).html(strHtml);
    var curField = DCSelectionManager.GetCurrentInputField();
    DCWriterControllerEditor.InsertElementAtCurentPosition(div, true);
    if (curField != null && curField.nodeName == "SPAN") {
        //解决TEMPLATE-91 2019-10-10 hulijun
        if (curField.getAttribute && curField.getAttribute("empty") == "1") {
            curField.setAttribute("empty", "");
        }
        DCInputFieldManager.FixInputFieldElementDomForBackgroundText(curField);
    }
    DCWriterControllerEditor.InitFileContentDom(div, true);
    DCInputFieldManager.FixAllInputFieldElementDom();
};
//************************************************
function CreateDivSubDoc(div, options) {
    var strAttr = "";
    var attrs = options.Attributes;
    if (attrs) {
        for (var p in attrs) {
            strAttr += '{"Name":"' + p + '","Value":"' + attrs[p] + '"},';
        }
        strAttr = strAttr.substr(0, strAttr.length - 1);
        strAttr = "[" + strAttr + "]";
    }
    div.setAttribute("dctype", "XTextSubDocumentElement");
    div.setAttribute("dc_attributes", strAttr);
    div.setAttribute("dc_autofixtextmode", "Auto");
    div.setAttribute("dc_compressownerlinespacing", "true");
    div.setAttribute("dc_enablepermission", "True");
    div.setAttribute("dc_forecolorvalueforcollapsed", "#00000000");
    div.setAttribute("dc_iscollapsed", "true");
    div.setAttribute("modified", "false");
    if (options.ID) {
        div.setAttribute("id", options.ID);
    }
    if (options.NewPage) {
        div.setAttribute("dc_newpage", options.NewPage);
        }
    if (options.DCTitle) {
        div.setAttribute("dc_title", options.DCTitle);
    }

    if (options.Contenteditable) {
        div.setAttribute("contenteditable", options.Contenteditable);
    }

    div.setAttribute("dc_contentreadonly", "False");
    if (options.Contenteditable.toLowerCase() == "false") {
        div.setAttribute("dc_contentreadonly", "True");
    }

    if (options.Title) {
        div.setAttribute("title", options.Title);
    }
    if (options.Style) {
        div.setAttribute("style", options.Style);
    }
}

//设置病程状态
DCWriterControllerEditor.EditorSetState = function(subDoc, editable, strStyle) {
    if (!subDoc) {
        return;
    }
    //BSDCWRIT-194
    subDoc.setAttribute("contenteditable", editable);//true 可编辑
    if (DCWriterControllerEditor.IsFormView()) {//表单模式 病程不可编辑
        subDoc.setAttribute("contenteditable", "false");
    }
    subDoc.setAttribute("dc_contentreadonly", "False");//不只读
    if (editable.toString().toLowerCase() == "false") {
        subDoc.setAttribute("dc_contentreadonly", "True");//只读
    }

    $(subDoc).find('[dctype="XTextInputFieldElement"]').each(function () {
        this.setAttribute("contenteditable", editable);//true 可编辑

        this.setAttribute("dc_contentreadonly", "False");
        this.setAttribute("ircr", "false");
        if (editable.toString().toLowerCase() == "false") {
            this.setAttribute("dc_contentreadonly", "True");//只读
            this.setAttribute("ircr", "true");//只读
        }
    })
    $(subDoc).find('[dctype="XTextRadioBoxElement"],[dctype="XTextCheckBoxElement"]').each(function () {
        this.setAttribute("disabled", "false");
        if (editable.toString().toLowerCase() == "false") {
            this.setAttribute("disabled", "true");//不可操作
        } else {
            this.removeAttribute("disabled");//可操作
        }
    })
    if (strStyle) {
        subDoc.setAttribute("style", strStyle);
    }
}

//前端插入xml文档（包括病程记录） 2019-08-20
//@param strHtml 文档字符串
//@param flag 是否是病程记录
//@param options 病程记录属性
//@param element 元素，指定元素后插入
DCWriterControllerEditor.InsertHtmlAfterElement = function (strHtml, flag, options, element) {
    if (strHtml == null || element == null) {
        return false;
    }
    var div = document.createElement("DIV");
    $(div).html(strHtml);
    if (flag) { //插入病程记录
        CreateDivSubDoc(div, options);
        $(element).after(div);
        DCWriterControllerEditor.InitFileContentDom(div, true); 
    } else {
        if (div.childNodes.length > 0) {
            // 20200111 xuyiming 添加插入xml文档时判断插入到输入域中不换行
            // if ($(element).parents("[dctype='XTextInputFieldElement']").length == 0) {
            //     var br = document.createElement("br");
            //     $(element).after(br);
            // }
            for (var i = div.childNodes.length - 1; i >= 0; i--) {
                $(element).after(div.childNodes[i]);
            }
            if (element.parentNode.getAttribute && element.parentNode.getAttribute("empty") == "1") {
                element.parentNode.setAttribute("empty", "");
            }
            DCWriterControllerEditor.InitFileContentDom(element.parentNode, true);
        }             
    }
    DCInputFieldManager.FixAllInputFieldElementDom();
};
//***********************************************************
DCWriterControllerEditor.handleElementById = function (id, position) {
    var ele = document.getElementById(id);
    if (ele == null) {
        return null;
    }
    var type = ele.getAttribute("dctype");
    if (type == "XTextInputFieldElement" && ele.tagName == "INPUT") {
        return null;
    }
    else if (type == "XTextInputFieldElement" && ele.tagName == "SPAN") {
        if (ele.childNodes) {
            var result;
            for (var i = 0; i < ele.childNodes.length; i++) {
                var innerEle = ele.childNodes[i];
                if (innerEle.tagName == "LABEL" && innerEle.getAttribute("dctype") && innerEle.getAttribute("dctype") == "backgroundtext") {
                    innerEle.parentNode.removeChild(innerEle);
                }
                if (position.toLowerCase() == "start" && innerEle.tagName == "SPAN" && innerEle.getAttribute("dctype") && innerEle.getAttribute("dctype") == "start") {
                    result = innerEle;
                }
            }
            if (position.toLowerCase() == "end") {
                result = ele.childNodes[ele.childNodes.length - 2];
            }
            return result;
        };
    }
};

// 20200915 xym 添加触发修改内容事件EventChangeContent，参数为当前位置的信息
DCWriterControllerEditor.HandleEventChangeContent = function () {
    if (document.WriterControl != null
        && document.WriterControl.EventChangeContent != null
        && typeof (document.WriterControl.EventChangeContent) == "function") {
        var sel = DCSelectionManager.getSelection();
        if (sel != null && sel.startContainer != null) {
            var result = document.WriterControl.EventChangeContent(sel);
            if (result === false) {
                return false;
            }
        }

    }
}

//********************************************************
DCWriterControllerEditor.getInnerElementById = function (id) {
    var ele = document.getElementById(id);
    var type = ele.getAttribute("dctype");
    if (type == "XTextInputFieldElement" && ele.tagName == "INPUT") {
        return null;
    }
    else if (type == "XTextInputFieldElement" && ele.tagName == "SPAN") {
        var div = document.createElement("DIV");
        for (var i = 0; i < ele.childNodes.length; i++) {
            if (ele.childNodes[i].nodeName == "SPAN" && ele.childNodes[i].getAttribute("dctype")) {
                var temp = ele.childNodes[i].getAttribute("dctype");
                if (temp == "start" || temp == "end") {
                    continue;
                }
            };
            div.appendChild(ele.childNodes[i].cloneNode(true));
        };
        return div;
    } else if (type = "XTextSubDocumentElement") {
        return ele;
    }
};

//***********************************************
// 在文档的当前位置插入元素
DCWriterControllerEditor.InsertElementAtCurentPosition = function (element, autoFocus) {
    if (element == null) {
        return false;
    }
    var sel = DCSelectionManager.getSelectionAndUpdateLastSelectionInfo();
    if (sel.currentContainer != null) {
        var range = null;
        if (document.createRange) {
            range = document.createRange();
        }
        else if (document.body.createRange) {
            range = document.body.createRange();
        }
        else if (sel.instance && sel.instance.createRange) {
            range = sel.instance.createRange();
        }
        //wyc20200425：如果当前节点为文本则针对文本的父元素进行平级插入，避开大量插入时造成多层嵌套问题
        // if (sel.currentContainer.nodeName == "#text") {
        //     var parent = sel.currentContainer.parentElement;
        //     var parent2 = parent.parentElement;
        //     if (parent.nextSibling == undefined || parent.nextSibling == null) {
        //         parent2.appendChild(element);
        //     } else {
        //         parent2.insertBefore(element, parent.nextSibling);
        //     }
        // }
        ///////////////////////////////////////////////
        if (range != null && range.setStart) {
            //20200727 xym 修复IE无法插入问题
            var currentContainer = sel.currentContainer;
            if(currentContainer){
                var preNode = currentContainer.parentElement || currentContainer.parentNode;
            }
            if (currentContainer && currentContainer.nodeName == "#text" && preNode &&  preNode.nodeName != "P" && preNode.childNodes.length == 1) {
                if (preNode.innerText.length == sel.currentOffset) {
                    if (preNode.getAttribute("dctype") == "end") {
                        if (DCWriterControllerEditor.IsFormView() == true && $(preNode).parents("[dctype='XTextInputFieldElement']").length == 1) {
                            $(preNode).before($(element));
                        } else {
                            $(preNode).parent().after($(element));
                        }
                    } else {
                        $(preNode).after($(element));
                    }
                } else if (sel.currentOffset == 0) {
                    if (preNode.getAttribute("dctype") == "start") {
                        if (DCWriterControllerEditor.IsFormView() == true && $(preNode).parents("[dctype='XTextInputFieldElement']").length == 1) {
                            $(preNode).after($(element));
                        } else {
                            $(preNode).parent().before($(element));
                        }
                    } else {
                        $(preNode).before($(element));
                    }
                } else {
                    range.setStart(currentContainer, sel.currentOffset);
                    range.collapse(true);
                    range.insertNode(element);
                }
            } else if (currentContainer.nodeName == "IMG" || currentContainer.nodeName == "INPUT" || currentContainer.nodeName == "SELECT" || currentContainer.nodeName == "BR" || currentContainer.nodeName == "HR") {//xym 20200720 修改一些插入错误问题
                $(currentContainer).after(element);
            } else if (currentContainer.getAttribute && currentContainer.getAttribute("dctype") == "XTextLabelElement" && sel.currentOffset == 0) {
                // 20210303 xym 修复BSDCWRIT-175(插入错误问题)
                $(currentContainer).before(element);
            } else {
                range.setStart(currentContainer, sel.currentOffset);
                range.collapse(true);
                range.insertNode(element);
            }
        }
        else if (range != null && range.parentElement )
        {
            var pe = range.parentElement();
            pe.appendChild(element);
        }
        else {
            var container = sel.currentContainer;
            if (DCMultiDocumentManager.isInDocument(container) == false) {
                // 不在文档区域，操作失败
                return;
            }
            if (DCDomTools.IsTextNode(container)) {
                var pNode = container.parentNode;
                if (sel.currentOffset == 0) {
                    pNode.insertBefore(element, container);
                }
                else {
                    if (container.nextSibling == null) {
                        pNode.appendChild(element);
                    }
                    else {
                        pNode.insertBefore(element, container);
                    }
                }
            }
            else {
                var insertIndex = sel.currentOffset;
                if (insertIndex >= container.childNodes.length) {
                    container.appendChild(element);
                }
                else {
                    container.insertBefore(element, container.childNodes[insertIndex]);
                }
            }
        }
        // 为了特殊元素进行修正
        var pNode = element.parentNode || element.parentElement;
        if (pNode != null) {
            // 删除所有空白内容的文本节点
            for (var iCount = pNode.childNodes.length - 1; iCount >= 0; iCount--) {
                var sn = pNode.childNodes[iCount];
                if (sn.nodeName == "#text" && sn.length == 0) {
                    pNode.removeChild(sn);
                }
            }
        }
        var beforeFlag = false;
        if (pNode != null && pNode.firstChild == element) {
            beforeFlag = true;
        }
        else if (pNode != null && pNode.lastChild == element) {
            beforeFlag = false;
        }
        else {
            beforeFlag = true;
        }
        if (DCWriterControllerEditor.IsFormView() == true && $(element).parents("[dctype='XTextInputFieldElement']").length == 1) {//表单模式特殊处理
            var $parentNode = $(element).parent();
            if ($parentNode.attr("dctype") == "start") {
                $parentNode.after($(element));
            } else if ($parentNode.attr("dctype") == "end") {
                $parentNode.before($(element));
            } else if ($parentNode.attr("dctype") == "backgroundtext") {
                // 20201214 xym 修复表单模式下粘贴会插入输入域背景文本问题
                $parentNode.replaceWith($(element));
            }
        } else {
            while (pNode != null) {
                if (pNode.getAttribute && pNode.getAttribute("dcignore") == "1") {
                    var dctype = pNode.getAttribute("dctype");
                    if (dctype == "end" && beforeFlag == false) {
                        pNode = pNode.parentNode || pNode.parentElement;
                        if (range.currentOffset > 0) {
                            beforeFlag = false;
                        }
                    }
                    else if (dctype == "start" && beforeFlag == true) {
                        pNode = pNode.parentNode || pNode.parentElement;
                    }
                    // 插入到特别的元素内部，则挑出来重新放置
                    element.parentNode.removeChild(element);
                    var c2 = pNode.parentNode || pNode.parentElement;
                    if (beforeFlag) {
                        c2.insertBefore(element, pNode);
                    }
                    else {
                        if (pNode.nextSibling == null) {
                            c2.appendChild(element);
                        }
                        else {
                            c2.insertBefore(element, pNode.nextSibling);
                        }
                    }
                    DCInputFieldManager.FixInputElementDom(pNode);
                    break;
                }
                pNode = pNode.parentNode || pNode.parentElement;
            } //while
        }
        //20190627 xuyiming 将关闭下拉菜单移到下面，避免有下拉菜单的输入域粘贴到输入域开始位置
        DCDropdownControlManager.CloseDropdownControl();
        // DCDomTools.FoucsDocument();
        DCInputFieldManager.FixInputElementDom($(element).parents("[dctype='XTextInputFieldElement']")[0]);
        // 修复丢失事件问题
        DCWriterControllerEditor.InitFileContentDom(element, true);
        // xym 20200811 修复插入元素保存后多出一空白行问题
        var nextNode = element.nextSibling || element.nextElementSibling;
        var parentNode = $(element).parent()[0];
        if (nextNode == null) {
            nextNode = element.previousSibling || element.previousElementSibling;
        }
        if (nextNode != null && nextNode.nodeName == "BR" && parentNode != null && parentNode.nodeName == "P" && parentNode.childNodes.length == 2) {
            $(nextNode).remove();
        }
        if (autoFocus) {
            DCDomTools.FoucsDocument();
            //20190627 xuyiming 在光标位置粘贴后把光标移到粘贴内容的最后
            if (element.nodeName == "BR") {
                // 20201216 xym 修复IE浏览器下文本输入域回车换行异常(BSDCWRIT-15)
                var parentNode = $(element).parent()[0];
                var _index = $.inArray(element, parentNode.childNodes);
                DCDomTools.MoveCaretToIndex(parentNode, _index + 1);
            } else {
                DCDomTools.MoveCaretToEnd(element);
            }
        }
        // 20201218 xym 修复撤销重做时插入内容不保存过程问题(BSDCWRIT-48)
        DCDomTools.BubbleRaiseChanged();
        return true;
    }
    return false;
};




// 开始启用文档内容修改监视
DCWriterControllerEditor.StartDetectContentChange = function () {
    //console.log("StartDetectContentChange");
    if (DCWriterControllerEditor.readonly == true) {
        // 控件是只读的，不监视
        return;
    }
    var func = function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        //console.log('zzzzzzzzz');
        if (DCWriterControllerEditor.readonly == false) {
            var field = DCSelectionManager.GetCurrentInputField();// DCWriterControllerEditor.CurrentInputField;
            if (field != null && field.getAttribute("readonly") != "true") {
                // 当前输入域元素内容不只读
                //wyc20210204:新增验证最大输入长度与限制输入字符
                if (DCInputFieldManager.validateMaxInputLength(field, eventObject) == false) {
                    eventObject.returnValue = false;
                    eventObject.cancelBubble = true;
                    return;
                }
                if (DCInputFieldManager.validateLimitedInputChars(field, eventObject) == false) {
                    eventObject.returnValue = false;
                    eventObject.cancelBubble = true;
                    return;
                }
                DCInputFieldManager.FixInputElementDomWithDetectBorderElement(field);
                if (DCWriterControllerEditor.GetElementText(field, true) != "") {
                    //if (DCWriterControllerEditor.FixInputElementDom(field)) {
                    if (DCInputFieldManager.HideBackgroundText(field)) {
                        if (field.childNodes.length > 1) {
                            // DCDomTools.MoveCaretTo(field.childNodes[1]);
                            DCDomTools.MoveCaretToIndex(field.childNodes[1], 0);
                        }
                    }
                }
            }
        }
        DCWriterControllerEditor.FalgDetectContentChange = true;
    };
    DCWriterControllerEditor.FalgDetectContentChange = false;
    $(document.body).on("cut", func);
    $(document.body).on("paste", func);
    $(document.body).on("keydown", func);
    $(document.body).on("dragend", func);

    var func2 = function () {
        if (DCWriterControllerEditor.FalgDetectContentChange == true) {
            DCWriterControllerEditor.FalgDetectContentChange = false;
            var field = DCSelectionManager.GetCurrentInputField();
            if (field != null && field.getAttribute("readonly") != "true") {
                DCInputFieldManager.HandleInputFieldEvent(null, field, "onchange");
            }
        }
    };
    DCWriterControllerEditor.TimerDetectContentChange = window.setInterval(func2, 500);

    var funcKeyDown = function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        DCDragResizeManager.HandleBodyClick(eventObject);//WYC20190909:若图片删除则立刻隐藏外框DIV
        DCSelectionManager.IgnoreDropdownStateOnce = true;
        if (eventObject != null && eventObject.type == "keydown"
            && (eventObject.charCode == 0 || eventObject.charCode == null)) {
            var srcElement = null;
            if (eventObject.srcElement) {
                srcElement = eventObject.srcElement;
            }
            else if (eventObject.target) {
                srcElement = eventObject.target;
            }

            if (eventObject.keyCode == 39) {
                // 右光标键
                var nextNode = null;
                if (srcElement != null
                        && srcElement.nodeName == "INPUT"
                        && srcElement.type == "text"
                        && srcElement.readOnly == false
                        && srcElement.disabled == false) {
                    var moveFlag = false;
                    if (srcElement.value == null || srcElement.value.length == 0) {
                        moveFlag = true;
                    }
                    else if (srcElement.selectionEnd == srcElement.selectionStart
                        && srcElement.selectionEnd == srcElement.value.length) {
                        moveFlag = true;
                    }
                    if (moveFlag == true) {
                        nextNode = DCDomTools.GetAbsNextSibling(srcElement);
                    }
                }
                else {
                    var sel = DCSelectionManager.getSelection();
                    if (sel != null
                        && sel.startContainer != null
                        && sel.startContainer == sel.currentContainer
                        && sel.startOffset == sel.currentOffset) {
                        var node = sel.startContainer;
                        if (node.nodeName == "#text") {
                            var txt = node.nodeValue;
                            if (txt != null && sel.startOffset == txt.length) {
                                //node = node.parentNode;
                            }
                            else {
                                return;
                            }
                        }
                    }
                    nextNode = DCDomTools.GetAbsNextSibling(node);
                    if (nextNode != null
                        && nextNode.nodeName == "INPUT"
                        && nextNode.type == "text"
                        && nextNode.readOnly == false
                        && nextNode.disabled == false) {
                        if (nextNode.disabled == true || nextNode.readonly == true) {
                            nextNode = null;
                        }
                    }
                    else {
                        nextNode = null;
                    }
                }
                if (nextNode != null) {
                    if (nextNode.nodeName == "INPUT") {
                        if (nextNode.disabled == true) {
                            return;
                        }
                    }
                    DCDomTools.completeEvent(eventObject);
                    DCDomTools.MoveCaretToIndex(nextNode, 0);
                    return false;
                }
            }
            else if (eventObject.keyCode == 32) {
                if (document.getElementById("divDropdownContainer").style.display == "none") {
                    
                } else {
                    var ctl = document.WriterControl;
                    if (ctl != null && ctl.EventAfterSpace != null
                        && typeof (ctl.EventAfterSpace) == "function") {
                        var result = ctl.EventAfterSpace.call(ctl, eventObject);
                    }
                    if (result == false) {
                        return false;
                    }
                }
                //chrome,Firefox宋体下空格问题 2019-07-16 hulijun
                var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
                var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1; //判断Chrome浏览器
                var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
                if (isChrome || isFF) {
                    var curField = DCSelectionManager.getSelection().GetCurrentInputField();
                    if (curField) {
                        if (curField.isContentEditable == false || curField.readOnly == true) {
                            // 只读输入域不输入空格
                            DCDomTools.completeEvent(eventObject);
                            return;
                        }
                        if (curField.nodeName == "INPUT") {
                            //input输入域
                            return;
                        }
                    } else if (DCWriterControllerEditor.IsFormView() == true) {
                        //取消默认事件
                        DCDomTools.completeEvent(eventObject);
                        return false;
                    }
                    //修复选中其他元素，输入空格，没有删除其他元素bug
                    var range = DCDomTools.getSelectionRange();
                    DCDomTools.delectNode();
                    //取消默认事件
                    DCDomTools.completeEvent(eventObject);
                    //在光标处插入&ensp;
                    var box = document.createElement("span");
                    box.innerHTML = "&ensp;";
                    var textNode = box.firstChild;
                    //20191128 xuyiming 表单模式下在输入域前后输入空格
                    if (DCWriterControllerEditor.IsFormView() == true && DCSelectionManager.GetCurrentInputField() == curField && range.collapsed && range.startContainer) {
                        var startNode = range.startContainer;
                        startNode = DCDomTools.IsTextNode(startNode) ? (startNode.parentNode || startNode.parentElement) : startNode;
                        if (startNode.getAttribute("dctype") == "start") {
                            $(startNode).after(textNode);
                        } else if (startNode.getAttribute("dctype") == "end") {
                            $(startNode).before(textNode);
                        } else {
                            DCWriterControllerEditor.InsertElementAtCurentPosition(textNode, true);
                        }
                    } else {
                        DCWriterControllerEditor.InsertElementAtCurentPosition(textNode, true);
                    }
                    if(curField){
                        DCInputFieldManager.FixInputElementDom(curField);
                    }
                    DCDomTools.MoveCaretToEnd(textNode);
                    DCWriterControllerEditor.HandleEventChangeContent();
                }
            }
            else if (eventObject.keyCode == 37) {
                // 左光标键
                var preNode = null;
                var srcElement = null;
                if (eventObject.srcElement) {
                    srcElement = eventObject.srcElement;
                }
                else if (eventObject.target) {
                    srcElement = eventObject.target;
                }
                if (srcElement != null
                        && srcElement.nodeName == "INPUT"
                        && srcElement.type == "text"
                        && srcElement.readOnly == false
                        && srcElement.disabled == false) {
                    var moveFlag = false;
                    if (srcElement.value == null || srcElement.value.length == 0) {
                        moveFlag = true;
                    }
                    else if (srcElement.selectionEnd == srcElement.selectionStart
                        && srcElement.selectionEnd == 0) {
                        moveFlag = true;
                    }
                    if (moveFlag == true) {
                        preNode = DCDomTools.GetAbspreviousSibling(srcElement);
                    }
                }
                else {
                    var sel = DCSelectionManager.getSelection();
                    if (sel != null
                        && sel.startContainer != null
                        && sel.startContainer == sel.currentContainer
                        && sel.startOffset == sel.currentOffset) {
                        var node = sel.startContainer;
                        if (node.nodeName == "#text") {
                            if (sel.startOffset > 1) {
                                return;
                            }
                        }
                        else if (sel.startOffset > 0) {
                            var node2 = node.childNodes[sel.startOffset - 1];
                            if (node2.nodeName == "INPUT"
                                && node2.type == "text"
                                && node2.readOnly == false
                                && node2.disabled == false) {
                                DCDomTools.completeEvent(eventObject);
                                DCDomTools.MoveCaretToEnd(node2);
                                return false;
                            }
                        }
                    }
                    preNode = DCDomTools.GetAbspreviousSibling(node);
                    if (preNode != null
                        && preNode.nodeName == "INPUT"
                        && preNode.type == "text") {
                        if (preNode.disabled == true || preNode.readonly == true) {
                            preNode = null;
                        }
                    }
                    else {
                        preNode = null;
                    }
                }
                if (preNode != null) {
                    //                    var index = 0;
                    //                    if (preNode.nodeName == "INPUT") {
                    //                        if (preNode.disabled == true) {
                    //                            return;
                    //                        }
                    //                        else {
                    //                            if (preNode.value != null) {
                    //                                index = preNode.value.length;
                    //                            }
                    //                            else {
                    //                                index = 0;
                    //                            }
                    //                        }
                    //                    }
                    DCDomTools.completeEvent(eventObject);
                    DCDomTools.MoveCaretToEnd(preNode);
                    return false;
                }
            }
            else if (eventObject.keyCode == 8) {
                // Backspace 键，删除前面的内容
                //WYC20200221:若当前contenteditable为false，不允许删除
                if (DCWriterControllerEditor.CanInsertElementAtCurentPosition() == false) {
                    return;
                }
                if (srcElement != null) {
                    // 文本输入框，不处理
                    if (srcElement.nodeName == "INPUT" && srcElement.type == "text") {
                        return;
                    }
                    if (srcElement.nodeName == "TEXTAREA") {
                        return;
                    }
                }
                var sel = DCSelectionManager.getSelection();
                if (sel != null
                        && sel.startContainer != null
                        && sel.startContainer == sel.currentContainer
                        && sel.startOffset == sel.currentOffset) {
                    // 没有选择内容
                    var node = sel.startContainer;
                    if (DCDomTools.IsTextNode(node)) {
                        node = node.parentNode;
                        if (node.getAttribute("dctype") == "XTextInputFieldElement") {
                            // 是输入域的直接文本节点,可以删除
                            return true;
                        }
                    }
                    var dcType = node.getAttribute("dctype");
                    if (dcType == "start" || dcType == "end" || dcType == "backgroundtext" || dcType == "XTextInputFieldElement") {
                        if(dcType == "end"){
                            if (node.previousSibling != null && node.previousSibling.getAttribute && node.previousSibling.getAttribute("dctype") == "backgroundtext") {
                                DCDomTools.MoveCaretToEnd(node.previousSibling.previousSibling);
                            } else if (node.previousSibling.nodeName != "BR") {
                                DCDomTools.MoveCaretToEnd(node.previousSibling);
                            }
                        }
                        // 输入域的边界元素，不能直接删除
                        eventObject.cancelBubble = true;
                        return false;
                    }
                    node = node.parentNode;
                    if (node != null) {
                        // 再次判断一下
                        var dcType = node.getAttribute("dctype");
                        if (dcType == "start" || dcType == "end" || dcType == "backgroundtext") {
                            if(dcType == "end"){
                                if (node.previousSibling.getAttribute && node.previousSibling.getAttribute("dctype") == "backgroundtext") {
                                    DCDomTools.MoveCaretToEnd(node.previousSibling.previousSibling);
                                } else if (node.previousSibling.nodeName != "BR") {
                                    DCDomTools.MoveCaretToEnd(node.previousSibling);
                                }
                            }
                            // 输入域的边界元素，不能直接删除
                            DCDomTools.completeEvent(eventObject);
                            return false;
                        }
                    }
                } else if (DCDomTools.noDeleteNodes().length > 0) {
                    //xuyiming 20190830 解决模板工具里设置元素不能删除，但在B端能选中后删除
                    var lastRange = DCDomTools.delectNode(true);
                    DCDomTools.MoveCaretToIndex(lastRange.startContainer, lastRange.startOffset);
                }
            }
            else if (eventObject.keyCode == 46) {
                // DELETE键，删除当前内容
                //WYC20200221:若当前contenteditable为false，不允许删除
                if (DCWriterControllerEditor.CanInsertElementAtCurentPosition() == false) {
                    return;
                }
                if (srcElement != null) {
                    // 文本输入框，不处理
                    if (srcElement.nodeName == "INPUT" && srcElement.type == "text") {
                        return;
                    }
                    if (srcElement.nodeName == "TEXTAREA") {
                        return;
                    }
                }
                var sel = DCSelectionManager.getSelection();
                if (sel != null
                        && sel.startContainer != null
                        && sel.startContainer == sel.currentContainer
                        && sel.startOffset == sel.currentOffset) {
                    // 没有选择内容
                    var node = sel.startContainer;
                    //WYC20191118添加一处判断
                    if (node.nodeName == "P" && sel.startOffset == 0
                        && node.firstChild.getAttribute
                        && node.firstChild.getAttribute("dc_deleteable")=="false") {
                        xinputElement.push(node.firstChild);
                    }
                    var searchNext = false;
                    if (DCDomTools.IsTextNode(node)) {
                        if (node.nodeValue != null) {
                            if (node.nodeValue.length == sel.startOffset) {
                                searchNext = true;
                            }
                        }
                    }
                    else {
                        if (node.childNodes.length == sel.startOffset) {
                            searchNext = true;
                        }
                    }
                    if (searchNext) {
                        // 搜索下一个元素
                        while (node != null) {
                            if (node.nextSibling == null) {
                                node = node.parentNode;
                            }
                            else {
                                node = node.nextSibling;
                                break;
                            }
                        } //while
                    }
                    if (DCDomTools.IsTextNode(node)) {
                        node = node.parentNode;
                        if (node.getAttribute("dctype") == "XTextInputFieldElement") {
                            // 是输入域的直接文本节点,可以删除
                            return true;
                        }
                    }
                    var dcType = node.getAttribute("dctype");
                    if (dcType == "start" || dcType == "end" || dcType == "backgroundtext" || dcType == "XTextInputFieldElement") {
                        // 输入域的边界元素，不能直接删除
                        DCDomTools.completeEvent(eventObject);
                        return false;
                    }
                    node = node.parentNode;
                    if (node != null) {
                        // 再次判断一下
                        var dcType = node.getAttribute("dctype");
                        if (dcType == "start" || dcType == "end" || dcType == "backgroundtext") {
                            // 输入域的边界元素，不能直接删除
                            DCDomTools.completeEvent(eventObject);
                            return false;
                        }
                    }
                } else if (DCDomTools.noDeleteNodes().length > 0) {
                    //xuyiming 20190830 解决模板工具里设置元素不能删除，但在B端能选中后删除
                    var lastRange = DCDomTools.delectNode(true);
                    DCDomTools.MoveCaretToIndex(lastRange.endContainer, lastRange.endOffset);
                }
            }
            else if (eventObject.keyCode == 88) {//Ctrl + V
                //hulijun 20210319 DCWRITER-3689
                DCWriterCommandMananger.SelectionExecuteCommand("Copy", false, null);

                if (DCDomTools.noDeleteNodes().length > 0) {
                    var lastRange = DCDomTools.delectNode(true);
                    DCDomTools.MoveCaretToIndex(lastRange.endContainer, lastRange.endOffset);
                    DCDomTools.completeEvent(eventObject);
                    return false;
                }
            }
        }
        var element = DCSelectionManager.GetCurrentInputField();
        if (element != null) {
            DCInputFieldManager.HandleInputFieldEvent(eventObject, element, "onkeydown");
        }
        if (eventObject.cancelBubble == false) {
            WriterCommandModuleTable.HandleTableHotKey(eventObject);
        }
        //xym 20200728 修改选中不可删除元素时，阻止键盘操作
        if (eventObject.ctrlKey == false) {//修复键盘按下ctrl时不阻止键盘操作
            if (DCDomTools.noDeleteNodes().length > 0) {
                DCDomTools.completeEvent(eventObject);
                return false;
            }
        }
        return true;
    };

    //    document.onkeydown = function (eventObject) {
    //        funcKeyDown(eventObject);
    //    }
    $(document.body).on("keydown", function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        if (DCDropdownControlManager.PreFilterKeyDown(eventObject) == true) {
            return;
        }
        if (DCDragResizeManager.PreFilterKeyDown(eventObject) == true) {
            return;
        }
        if (funcKeyDown(eventObject) != false) {
            DCWriterControllerEditor.executeWriterControlEventHandler(eventObject, "ondocumentkeydown");
        }
    });

    //WYC20190605：记录当前是否处于输入法输入的模式
    DCWriterControllerEditor.OnIMEMode = false;
    $(document.body).on("compositionstart", function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        var curField = DCSelectionManager.getSelection().GetCurrentInputField();
        var bgtxt = $(curField).find("[dctype='backgroundtext']");
        // debugger;
        if (bgtxt.length == 1 && bgtxt.text() == "") {
            bgtxt.remove();
        }
        if($(curField).css("display") == "inline-block"){
            bgtxt.attr("contenteditable", true);//20200922 xym 解决固定宽度输入域输入中文字符问题
        }
        //console.log("compositionstart");
        DCWriterControllerEditor.OnIMEMode = true;
        //console.log(DCWriterControllerEditor.OnIMEMode);
    });
    $(document.body).on("compositionend", function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        var curField = DCSelectionManager.getSelection().GetCurrentInputField();
        $(curField).find("[dctype='backgroundtext']").attr("contenteditable", false);//20200922 xym 解决固定宽度输入域输入中文字符问题
        //console.log("compositionend");
        DCWriterControllerEditor.OnIMEMode = false;
        //console.log(DCWriterControllerEditor.OnIMEMode);
    });
    ///////////////////////////////////////////////////

    $(document.body).on("keypress", function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        DCWriterControllerEditor.KeyPressFlagOnce = true;
        var field = DCSelectionManager.GetCurrentInputField();
        if (field != null) {
            DCInputFieldManager.HandleInputFieldEvent(eventObject, field, "onkeypress");
        }
        DCWriterControllerEditor.executeWriterControlEventHandler(eventObject, "ondocumentkeypress");
    });

    $(document.body).on("keyup", function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        DCWriterControllerEditor.executeWriterControlEventHandler(eventObject, "ondocumentkeyup");
    });


    $(document.body).on("mousedown", function (eventObject) {
        eventObject = DCDomTools.FixEventObject(eventObject);
        if (eventObject == null) {
            return;
        }
        var e = null;
        if (eventObject.srcElement) {
            e = eventObject.srcElement;
        }
        else if (eventObject.target) {
            e = eventObject.target;
        }
        if (e != null && e.nodeName == "INPUT") {
            if (document.activeElement != e) {
                if (e.readOnly == false && e.disabled == false) {
                    try {
                        e.focus();
                        if (e.select) {
                            e.select();
                        }
                        if (e.type == "text") {
                            e.selectionStart = 0;
                            e.selectionEnd = 0;
                        }
                    }
                    catch (ex) {
                        var msg = ex.message;
                    }
                }
            }
        }
    });
};
 
  
//***********************************************************************************
// 启动编辑器JS处理模块
//***********************************************************************************
function GlobalStartDCWriterWebControlJS() {

    var dcAsmVersion = "20210415222835";
    if (document.body != null) {
        document.body.setAttribute("dcasmversion", dcAsmVersion);
    }

    // 获得顶层的编辑器控件对象
    var frame = window.frameElement;
    if (frame != null) {
        var ctl = frame.parentNode;
        if (ctl.getAttribute("dctype") == "WebWriterControl") {
            document.WriterControl = ctl;
            if (ctl.getAttribute("dcasmversion") != dcAsmVersion) {
                var text = "检测到主页面JS版本不一致，建议在主页面中设置为<script src=\""
                    + ctl.getAttribute("servicepageurl") + "?js=" + dcAsmVersion + "\"></script>，或者清空浏览器缓存。";
                if (ctl.Options.ShowJSVersionConflictTip == false) {
                    console.log(text);
                } else {
                    var div = document.createElement("div");
                    div.setAttribute("style", "border:1px solid red;background-color:yellow");
                    div.innerText = text;
                    document.body.insertBefore(div, document.body.firstChild);
                }
            }
            //            if (ctl.HiddenAppProcessing) {
            //                // 隐藏上层的加载等待界面
            //                ctl.HiddenAppProcessing();
            //            }
        }
    }

    
    if (document.body.getAttribute("printhtml") == "true") {
        // 打印用的HTML文档
        //DCWriterControllerEditor.OnDocumentResize();
        $(document.body).on("click", function (e) {
            WriterCommandModuleFile.HandleMouseClickForJumpPrintMode(e);
        });
        //启用自定义快捷菜单
        StartUIEditor("preview");
        return;
    }
    // 调整页眉高度
    var divHeader = document.getElementById("divXTextDocumentHeaderElement");
    if (divHeader != null && divHeader.style.position == "fixed") {
        divHeader.parentNode.style.height = divHeader.offsetHeight;
    }

    // 初始化编辑器处理器
    DCWriterControllerEditor.Init();

    // 上一次插入点所在的输入域
    DCWriterControllerEditor.CurrentInputField = null;
    // 启动输入域控制器
    DCInputFieldManager.Start();

    DCSelectionManager.Start();

    // 开始执行内容修改监视
    DCWriterControllerEditor.StartDetectContentChange();
    // 开始监测输入域背景文字可见性
    //DCWriterControllerEditor.StartDetectBackgroundTextVisible();
    // 启动文档批注处理模块
    DCDocumentCommentManager.Start();
    // 启动表达式处理模块
    DCWriterExpressionManager.Start();
    // 启动文件上传处理模块
    DCFileUploadManager.Start();
    // 设置当前节点
    //debugger;
    var func = function (rootElement) {
        if (rootElement == null) {
            return null;
        }
        for (var iCount = 0; iCount < rootElement.childNodes.length; iCount++) {
            var node = rootElement.childNodes[iCount];
            if (node.getAttribute) {
                if (node.getAttribute("dc_webclientselected") == "true") {
                    //debugger;
                    node.removeAttribute("dc_webclientselected");
                    return node;
                }
                else {
                    var node2 = func(node);
                    if (node2 != null) {
                        return node2;
                    }
                }
            }
        }
        return null;
    };

    var currentElement = func(DCWriterControllerEditor.getdivAllContainer());
    //alert(currentElement);
    if (currentElement != null) {
        // 当前元素对象
        try {
            DCWriterControllerEditor.SetFocus(currentElement);
            DCDomTools.selectContent(
                            currentElement,
                            0,
                            currentElement,
                            currentElement.childNodes.length
                            );
            if (currentElement.scrollIntoView) {
                currentElement.scrollIntoView();
            }
        } catch (e) {
            console.log(e);
    }
    }

    // 设置当前文档
    var currentDocumentIndex = parseInt(document.body.getAttribute("currentdocumentindex"));
    if (isNaN(currentDocumentIndex) == false && currentDocumentIndex > 0) {
        DCMultiDocumentManager.selectDocument(currentDocumentIndex);
        window.setTimeout("DCMultiDocumentManager.selectDocument(" + currentDocumentIndex + ")", 1000);
    }
    DCWriterControllerEditor.SetContainerHeightForMobileDevice();
    DCWriterControllerEditor.OnDocumentResize();

    StartUIEditor();

    // 启动多文档处理模块
    DCMultiDocumentManager.Start();
    //window.setInterval("document.body.dcExpressionFunctionStackCount = 0;", 1000);


};


// 启动UEditor编辑器功能模块
function StartUIEditor(mode) {

    // 空白的插件 
    var blankPlugins = function () {
        this.ready = function () { };
        this.call = function () { };
    };

    UE.plugins['table'] = blankPlugins;
    UE.plugins['tablesort'] = blankPlugins;
    UE.plugins['paste'] = blankPlugins;
    UE.plugins['keystrokes'] = blankPlugins;
    //try {
    var opts = new Object();
    opts.InstanceSource = "DCWriterControlEditor.StartUIEditor()";
    opts.scaleEnabled = true;
    opts.tableDragable = false;
    opts.tableDragable = false;
    opts.autoHeightEnabled = false;
    opts.imageScaleEnabled = false;
    if (document.WriterControl != null) {
        if (document.WriterControl.Options != null && document.WriterControl.Options.ClientContextMenuType == "Custom") {
            opts.enableContextMenu = true;
            if (mode == "preview") {//设置预览的快捷菜单
                opts.contextMenu = document.WriterControl.previewContextMenu;
            } else {
            opts.contextMenu = document.WriterControl.contextMenu;
        }
        }
        else {
            opts.enableContextMenu = false;
            document.runtimeEnableContextMenu = false;
        }
    }
    if (opts.contextMenu == null || typeof (opts.contextMenu.push) != "function") {
        opts.contextMenu = new Array();
    }
    var clearTempMenu = false;
    if (opts.contextMenu.length == 0) {
        opts.contextMenu.push("-");
        clearTempMenu = true;
    }

    // 重写内部函数
    UE.utils.loadFile = function () { };
    UE.Editor.prototype.loadServerConfig = function () { };
    UE.Editor.prototype.render = function () { };

    // 创建内置编辑器对象
    window.uiEditor = new UE.ui.Editor(opts);
    opts = window.uiEditor.options;
    window.UEOptions = opts;
    if (clearTempMenu == true) {
        opts.contextMenu.pop();
    }

    var bodyElement = document.getElementById("divDocumentBody_0");
    if (bodyElement == null) {
        bodyElement = document.body;
    }
    // 重写内部函数
    UE.dom.domUtils.findParentByTagName = function (node, tagNames, includeSelf, excludeFn) {
        tagNames = UE.utils.listToMap(UE.utils.isArray(tagNames) ? tagNames : [tagNames]);
        return UE.dom.domUtils.findParent(node, function (node) {
            if (node == window.uiEditor.body) {
                return false;
            }
            return tagNames[node.tagName] && !(excludeFn && excludeFn(node));
        }, includeSelf);
    };

    // 重写内部函数
    UE.dom.domUtils.isBody = function (node) {
        return node == window.uiEditor.body;
    };

    //UE.ui.UIBase.prototype.render = function (holder) {
    //    return 0;
    //};
    //UE.ui.EditorUI.prototype.render = function (holder) {
    //    return 0;
    //};
    /**
    * 编辑器初始化并绑定到一个文档对象中，袁永福到此一游..
    * @method _setup
    * @private
    * @param { Element } doc 编辑器Iframe中的文档对象
    */
    window.uiEditor.BindingDocument = function (doc) {

        if (window.frameElement == null) {
            return;
        }
        // DCWriter编辑器添加的代码
        if (document.WriterControl != null) {
            document.WriterControl.UE = UE;
            document.WriterControl.uiEditor = window.uiEditor;
        }

        $(bodyElement).on("blur", function () {
            // 失去输入焦点的时候隐藏弹出的快捷菜单。
            //UE.ui.Popup.postHide();
        });

        var me = this,
            options = me.options;
        //if (ie) {
        //    doc.body.disabled = true;
        //    doc.body.contentEditable = true;
        //    doc.body.disabled = false;
        //} else {
        //    doc.body.contentEditable = true;
        //}
        //doc.body.spellcheck = false;
        me.document = doc;
        me.window = doc.defaultView || doc.parentWindow;
        me.iframe = me.window.frameElement;
        me.body = bodyElement;// doc.body;
        me.selection = new UE.dom.Selection(doc);
        //gecko初始化就能得到range,无法判断isFocus了
        var geckoSel;
        if (UE.browser.gecko && (geckoSel = this.selection.getNative())) {
            geckoSel.removeAllRanges();
        }
        this._initEvents();
        ////为form提交提供一个隐藏的textarea
        //for (var form = this.iframe.parentNode; !domUtils.isBody(form) ; form = form.parentNode) {
        //    if (form.tagName == 'FORM') {
        //        me.form = form;
        //        if (me.options.autoSyncData) {
        //            domUtils.on(me.window, 'blur', function () {
        //                setValue(form, me);
        //            });
        //        } else {
        //            domUtils.on(form, 'submit', function () {
        //                setValue(this, me);
        //            });
        //        }
        //        break;
        //    }
        //}
        if (options.initialContent) {
            if (options.autoClearinitialContent) {
                var oldExecCommand = me.execCommand;
                me.execCommand = function () {
                    me.fireEvent('firstBeforeExecCommand');
                    return oldExecCommand.apply(me, arguments);
                };
                this._setDefaultContent(options.initialContent);
            } else
                this.setContent(options.initialContent, false, true);
        }

        //编辑器不能为空内容

        if (UE.dom.domUtils.isEmptyNode(me.body)) {
            var temp = '<br/>';
            if (document.body.getAttribute("ismobiledevice") !== "true") {
                if (browser !== undefined && browser.ie) { //防止移动端browser未定义
                    temp = '';
                }
            }
            me.body.innerHTML = '<p>' + temp + '</p>';
        }
        //如果要求focus, 就把光标定位到内容开始
        if (options.focus) {
            setTimeout(function () {
                me.focus(me.options.focusInEnd);
                //如果自动清除开着，就不需要做selectionchange;
                !me.options.autoClearinitialContent && me._selectionChange();
            }, 0);
        }
        if (!me.container ) {
            if (this.iframe == null) {
                me.container = document.body;
            }
            else {
                me.container = this.iframe.parentNode;
            }
        }
        
        if (options.fullscreen && me.ui) {
            me.ui.setFullScreen(true);
        }

        try {
            me.document.execCommand('2D-position', false, false);
        } catch (e) {
        }
        try {
            me.document.execCommand('enableInlineTableEditing', false, false);
        } catch (e) {
        }
        try {
            me.document.execCommand('enableObjectResizing', false, false);
        } catch (e) {
        }

        //挂接快捷键
        //me._bindshortcutKeys();
        me.isReady = 1;
        me.fireEvent('ready');
        options.onready && options.onready.call(me);
         
        !options.isShow && me.setHide();
        options.readonly && me.setDisabled();
         
    };
    if (document.body.getAttribute("ismobilelayout") != "true") {
        window.uiEditor.BindingDocument.call(window.uiEditor, document);
    }
    document.body.style.overflowY = "";

    //window.uiEditor.ui = { id: "dcwirer" };

    //window.uiEditor.ui = UE.ui;
    //window.uiEditor.ui.id = "dcwriter";
    //window.uiEditor.render( bodyElement.id);
    //window.uiEditor.ui.id = bodyElement.id;
    //}
    //catch (ext) {
    //    console.log(ext.toString());
    //}
};

DCWriterControllerEditor.InitImageDom = function (element) {
    if (element.getAttribute("readonlyflag") != "true") {
        element.onclick = function (event) {
            DCInputFieldManager.executClientJavaScript(event, element, 'click');
        };
        element.ondblclick = function (event) {
            DCInputFieldManager.executClientJavaScript(event, element, 'dblclick');
        };
    }
};

DCWriterControllerEditor.BindInputFieldEvent = function (element) {
    var eventNames = element.getAttribute("eventlist");
    if (eventNames != null && eventNames.length > 0) {
        var names = eventNames.split("|");
        for (var iCount = 0; iCount < names.length; iCount++) {
            var ename = names[iCount];
            switch (ename) {
                case "onmousedown":
                    element.onmousedown = function (event) {
                        DCInputFieldManager.HandleInputFieldEvent(event, element, "onmousedown");
                    };
                    break;
                case "onmouseenter":
                    element.onmouseenter = function (event) {
                        DCInputFieldManager.HandleInputFieldEvent(event, element, "onmouseenter");
                    };
                    break;
                case "onmouseleave":
                    element.onmouseleave = function (event) {
                        DCInputFieldManager.HandleInputFieldEvent(event, element, "onmouseleave");
                    };
                    break;
                case "onfocus":
                    element.onfocus = function (event) {
                        DCInputFieldManager.HandleInputFieldEvent(event, element, "onfocus");
                    };
                    break;
                case "onblur":
                    element.onblur = function (event) {
                        DCInputFieldManager.HandleInputFieldEvent(event, element, "onblur");
                    };
                    break;
                case "onfocus":
                    element.onfocus = function (event) {
                        DCInputFieldManager.HandleInputFieldEvent(event, element, "onfocus");
                    };
                    break;
                case "onchange":
                    element.onchange = function (event) {
                        DCInputFieldManager.HandleInputFieldEvent(event, element, "onchange");
                    };
                    break;
                case "onclick":
                    element.onclick = function (event) {
                        DCInputFieldManager.HandleInputFieldEvent(event, element, "onclick");
                    };
                    break;
                case "ondblclick":
                    element.ondblclick = function (event) {
                        DCInputFieldManager.HandleInputFieldEvent(event, element, "ondblclick");
                    };
                    break;
                case "onkeydown":
                    element.onkeydown = function (event) {
                        DCInputFieldManager.HandleInputFieldEvent(event, element, "onkeydown");
                    };
                    break;
                case "onkeypress":
                    element.onkeypress = function (event) {
                        DCInputFieldManager.HandleInputFieldEvent(event, element, "onkeypress");
                    };
                    break;
            }
        }
    }
};

DCWriterControllerEditor.InitInputFieldDom = function (element) {
    if (element.nodeName == "SPAN") {
        // 初始化输入域DOM结构
        DCInputFieldManager.FixSpanInputElementDomForDocumentLoad(element);
        //this.setAttribute("dctempid", tempIDCount.toString());
        //tempIDCount++;
    }
    //wyc20200825:将包含内容复制的表达式设置扩散到子元素的输入域上确保子元素改变时也能触发父输入域的复制操作
    var names = element.getAttribute("effectexpression");
    if (names != null && names.length > 0 && names.indexOf("DCCopySource") !== -1) {
        var fields = element.querySelectorAll("[dctype='XTextInputFieldElement']");
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var subnames = field.getAttribute("effectexpression");
            if (subnames == null || subnames.length == 0) {
                subnames = names;
            } else {
                subnames = subnames + "," + names;
            }
            field.setAttribute("effectexpression", subnames);
        }
    }
    //wyc20200530：单独处理INPUT输入域隐藏边框字符的问题
    var ShowFieldBorderElement = document.Options != null && document.Options.ViewOptions.ShowFieldBorderElement == true;
    if (element.nodeName == "INPUT" && ShowFieldBorderElement == false) {
        var preelement = element.previousSibling;
        var nextelement = element.nextSibling;
        if (preelement != null && preelement.nodeName == "LABEL" && preelement.getAttribute("for") == element.id) {
            preelement.style.visibility = "hidden";
        }
        if (nextelement != null && nextelement.nodeName == "LABEL" && nextelement.getAttribute("for") == element.id) {
            nextelement.style.visibility = "hidden";
        }
    }
    //////////////////////////////////////////////////////
    DCWriterControllerEditor.BindInputFieldEvent(element);
};

//WYC20200219:在这里处理内容锁的逻辑
DCWriterControllerEditor.InitElementContentLock = function (element) {
    var contentlockinfo = element.getAttribute("dc_contentlock");
    //wyc20201010：针对表格内含输入域的情况下做特殊处理，将单元格的用户锁信息扩散到内部所有输入域上
    if (element.nodeName == "TD" && contentlockinfo != null && contentlockinfo.length > 0) {
        var fields = element.querySelectorAll("[dctype='XTextInputFieldElement']");
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            field.setAttribute("inheritcontentlock", contentlockinfo);
        }
    }
    //若处于表单模式下，对非输入域的其它元素不做处理，其可编辑性由整个文档顶层的contenteditable统一锁住
    if (this.IsFormView() == true && element.getAttribute("dctype") != "XTextInputFieldElement") {
        return;
    }
    if (element.getAttribute("dctype") == "XTextInputFieldElement") {
        if (contentlockinfo == null || contentlockinfo.length == 0) {
            contentlockinfo = element.getAttribute("inheritcontentlock");
        }
    }
    var AuthorisedUserIDArray = new Array();
    var temparray = contentlockinfo.split(";");
    for (var i = 0; i < temparray.length; i++) {
        var keypairarray = temparray[i].split(":");
        if (keypairarray[0] == "OwnerUserID") {
            AuthorisedUserIDArray.push(keypairarray[1]);
        } else if (keypairarray[0] == "AuthorisedUserIDList") {
            var idlist = keypairarray[1].split(",");
            for (var j = 0; j < idlist.length; j++) {
                AuthorisedUserIDArray.push(idlist[j]);
            }
        }
    }
    var currentuserid = document.WriterControl.Options.CurrentUserID;
    if (currentuserid !== null &&
        currentuserid !== undefined &&
        currentuserid.length > 0 &&
        AuthorisedUserIDArray.length > 0 &&
        AuthorisedUserIDArray.indexOf(currentuserid) >= 0) {
        //debugger;
        //wyc20201010:输入域则不管contenteditable因为可能有别的机制限制直接编辑
        if (element.getAttribute("dctype") == "XTextInputFieldElement") {
            if (element.nodeName == "INPUT") {
                element.removeAttribute("readonly");
            }
            element.setAttribute("class", "InputFieldNormal");
            element.removeAttribute("ircr");
        } else if (element.isContentEditable == false) {
            element.setAttribute("contenteditable", "true");
        }
    } else {
        if (element.isContentEditable == true) {
            element.setAttribute("contenteditable", "false");
        }       
        if (element.getAttribute("dctype") == "XTextInputFieldElement") {
            if (element.nodeName == "INPUT") {
                element.setAttribute("readonly", "true");
            }
            element.setAttribute("class", "InputFieldReadonly");
            element.setAttribute("ircr", "true");
        }
    }
};

//WYC20200512：在这里处理所有表格元素
DCWriterControllerEditor.InitTableElement = function (element) {
    //取消表格框线，所有框线样式由单元格来决定
    element.style.borderWidth = "0px";
    var rows = element.querySelectorAll("tr");
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.getAttribute && row.getAttribute("dc_visible") == "false") {
            row.style.display = "none";
        }
        if (DCDomTools.getIEVersion() != -1 && row.hasAttribute("dcrowheightforie")) {
            row.setAttribute("height", row.getAttribute("dcrowheightforie"));
        }
        row.removeAttribute("dcrowheightforie");
    }
    //wyc20200917：读取单元格的标记处理，防止自身框线覆盖了右格或下格的框线
    //var cells = element.querySelectorAll("td");
    //for (var i = 0; i < cells.length; i++) {
    //    var cell = cells[i];
    //    if (cell.getAttribute && cell.getAttribute("rightrevert") == "1") {
    //        cell.style.borderRightStyle = "revert";
    //    }
    //    if (cell.getAttribute && cell.getAttribute("bottomrevert") == "1") {
    //        cell.style.borderBottomStyle = "revert";
    //    }
    //}

    //主要是初始化一下无边框线颜色时的显示
    //if (document.WriterControl != null) {
    //    var showcellnoneborder = document.WriterControl.DocumentOptions.ViewOptions.ShowCellNoneBorder;
    //    var nonebordercolor = document.WriterControl.DocumentOptions.ViewOptions.NoneBorderColor;
        
    //}
};


//@method 初始化输入域DOM结构
//@param element 输入域元素对象
DCWriterControllerEditor.InitXTextElementDom = function (element) {
    //WYC20200304：处理所有LI元素
    if (element.nodeName == "LI" && element.parentElement.nodeName == "UL") {
        var formatinfo = element.parentElement.getAttribute("dcparagraphlistformat");
        element.id = "dc" + formatinfo;
    }

    //WYC20200512：处理所有表格元素
    if (element.nodeName == "TABLE" && element.getAttribute("dctype") == "XTextTableElement") {
        DCWriterControllerEditor.InitTableElement(element);
    }

    //WYC20200731：根据文档选项处理分页符的可见性
    if (element.getAttribute("dctype") == "XTextPageBreakElement") {
        if (document.WriterControl != null &&
            document.WriterControl.DocumentOptions != null &&
            document.WriterControl.DocumentOptions.ViewOptions.ShowPageBreak == false) {
            element.style.display = "none";
        }
    }

    //WYC20200303：处理表单下的特殊情况，将非输入域的所有可编辑状态改成不可编辑
    if (DCWriterControllerEditor.IsFormView() == true
        && DCInputFieldManager.IsInputFieldElement(element) == false
        && $(element).parents("[dctype='XTextInputFieldElement']").length == 0
        && element.isContentEditable && element.isContentEditable == true) {
        element.setAttribute("contenteditable", "false");
    }
    //WYC：处理基于用户权限内容锁
    var contentlockinfo = element.getAttribute("dc_contentlock");
    if (contentlockinfo == null || contentlockinfo.length == 0) {
        contentlockinfo = element.getAttribute("inheritcontentlock")
    }
    if (contentlockinfo !== null && contentlockinfo.length >0) {
        DCWriterControllerEditor.InitElementContentLock(element);
    }

    if (element.getAttribute("dctype") == "XTextImageElement" && element.tagName == "img") {
        // 初始化图片元素
        DCWriterControllerEditor.InitImageDom(element);
    }
    else if (element.getAttribute("dctype") == "XTextChartElement") {
        // 初始化输入域元素
        DCChartManager.UpdateChartElement(element);
    }
    else if (element.getAttribute("dctype") == "XTextInputFieldElement") {
        // 初始化输入域元素
        // 20201116 xym 修复可能清空输入域输入的内容的问题
        var txt = DCWriterControllerEditor.GetElementText(element);
        if (txt != null && txt != "") {
            element.removeAttribute("empty");
        }
        DCWriterControllerEditor.InitInputFieldDom(element);
    }
    else if (element.nodeName == "LABEL") {
        // 初始化标签元素
        if (element.getAttribute("readonly") != "true") {
            var dcfor = element.getAttribute("dcfor");
            if (dcfor != null && dcfor.length > 0) {
                element.onclick = function () {
                    DCWriterControllerEditor.OnLabelClick(this);
                };
            }
        }
    }
    else if (element.nodeName == "INPUT") {
        if (element.getAttribute("chkbingevent") == "1") {
            element.removeAttribute("chkbingevent");
            if (element.checked) {
                $(element).data('waschecked', true);
            } else {
                $(element).data('waschecked', false);
            }
            element.onclick = function () {
                DCWriterControllerEditor.HandleCheckedChanged(this);
                DCInputFieldManager.executClientJavaScript(event, this, 'click');
            };
            element.ondblclick = function () {
                DCInputFieldManager.executClientJavaScript(event, this, 'dblclick');
            };
        }
    }
};
//伍贻超20180703：这里的hasroot传入bool值，代表element是一个带根的HTML元素，函数会遍历并处理根下面子节点
//否则会认为element是一串同级别元素的组合，会直接遍历元素并处理
DCWriterControllerEditor.InitFileContentDom = function (element, hasroot) {
    if (hasroot) {
        $("*", element).each(function () {

            DCWriterControllerEditor.InitXTextElementDom(this);
        });
    } else {
        (element).each(function () {

            DCWriterControllerEditor.InitXTextElementDom(this);
        });
    }
};

// 文档完全加载成功后的处理
$(document).ready(function () {
    
    document.IsIE7 = false;
    if (navigator && navigator.appName == "Microsoft Internet Explorer") {
        var ver = navigator.appVersion;
        if (ver != null) {
            if (ver.indexOf("MSIE 8.") >= 0
                || ver.indexOf("MSIE 9.") >= 0
                || ver.indexOf("MSIE 7.") >= 0
                || ver.indexOf("MSIE 6.") >= 0) {
                document.IsIE7 = true;
            }
        }
    }

    //debugger;

    // 获得顶层的编辑器控件对象
    var frame = window.frameElement;
    if (frame != null) {
        var ctl = frame.parentNode;
        if (document.getElementById("OverloadMaxWebOnlineNumber") != null) {
            // 文档状态不对，超出并发数限制，不处理。
            if (ctl != null && ctl.HiddenAppProcessing) {
                ctl.HiddenAppProcessing();
            }
            return;
        }

        if (ctl != null && ctl.getAttribute("dctype") == "WebWriterControl") {
            document.WriterControl = ctl;

            window.dcsid = ctl.dcsid;

            // 判断是否为逻辑删除状态
            //document.IsLogicDelete = ctl.IsLogUserEditTrack();
             
        }
    }
    if (window.handler_ActiveSession != null) {
        window.clearTimeout(window.handler_ActiveSession);
        window.handler_ActiveSession = null;
    }
    function StartActiveSession() {
        if (window.handler_ActiveSession != null) {
            window.clearTimeout(window.handler_ActiveSession);
            window.handler_ActiveSession = null;
        }
        var h44 = window.setTimeout(function () {
            window.handler_ActiveSession = null;
            var url2 = document.body.getAttribute("servicepageurl");
            if (url2 != null && url2.length > 0) {
                url2 = url2 + "?eawols=1";
                $.ajax(url2, DCDomTools.fixAjaxSettings({ type: 'POST' }));
            }
        }, 30 * 1000);
        window.handler_ActiveSession = h44;
    }
    $(document.body).on("keydown", StartActiveSession);
    $(document.body).on("click", StartActiveSession);
    

    //    if (document.WriterControl != null && typeof (document.WriterControl.FrameLoad) == "function") {
    //        document.WriterControl.FrameLoad.call(document.WriterControl);
    //    }
    var isEditMode = document.body.getAttribute("contentrendermode") == "NormalHtmlEditable";

    if (isEditMode == true) {
        // 处于编辑模式。
        DCWriterControllerEditor.InitFileContentDom(document, true);
    }
    //添加签名是否失效提示
    //DCFileUploadManager.DomFixSignImage();

    GlobalStartDCWriterWebControlJS();

    if (isEditMode == true
        && navigator
        && navigator.appCodeName == "Mozilla") {
        // 针对FIREFOX进行修正，删除多余的br元素
        $("br[type=_moz]").each(function () {
            this.parentNode.removeChild(this);
        });
    }

    // 处理页眉页脚
    $("#divXTextDocumentHeaderElement,#divXTextDocumentHeaderForFirstPage,#divXTextDocumentFooterElement,#divXTextDocumentFooterElementForFirstPage").each(
        function () {
            if (this.getAttribute("dcsave") == "1") {
                this.onfocus = function (eventObj) {
                    this.style.border = "1px dotted black";
                    var divFlag = document.getElementById("divHeaderFooterFlag");
                    if (divFlag == null) {
                        divFlag = document.createElement("div");
                        divFlag.id = "divHeaderFooterFlag";
                        divFlag.style.backgroundColor = "aliceblue";
                        divFlag.style.border = "1px solid black";
                        divFlag.style.position = "absolute";
                        divFlag.style.textAlign = "center";
                    }
                    divFlag.style.display = "";
                    divFlag.style.height = this.offsetHeight + "px";
                    divFlag.style.width = "80px";
                    divFlag.innerText = this.title;
                    var vleft = DCDomTools.GetViewLeftInDocument(this);
                    vleft = vleft - 82;
                    divFlag.style.left = vleft + "px";
                    this.parentNode.insertBefore(divFlag, this);
                };
                this.onresize = function (eventObj) {
                    var divFlag = document.getElementById("divHeaderFooterFlag");
                    if (divFlag == null && divFlag.style.display != "none") {
                        divFlag.style.height = this.offsetHeight + "px";
                    }
                };
                this.onblur = function (eventObje) {
                    this.style.border = "1px dotted white";
                    var divFlag = document.getElementById("divHeaderFooterFlag");
                    if (divFlag != null) {
                        divFlag.style.display = "none";
                    }
                };
            }
        });
    $(document).on("copy", function (eventObj) {
        // debugger;
        eventObj = DCDomTools.FixEventObject(eventObj);
        //20190717 xuyiming 添加复制拦截事件
        if (document.WriterControl != null
            && document.WriterControl.EventBeforeCopy != null
            && typeof (document.WriterControl.EventBeforeCopy) == "function") {
            var result = document.WriterControl.EventBeforeCopy(eventObj);
            if (result === false) {
                return false;
            }
        }
        // 存储复制信息
        document.WriterControl.copyText = DCWriterControllerEditor.getSelectionText();
    }).on("cut", function (eventObj) {
        // debugger;
        eventObj = DCDomTools.FixEventObject(eventObj);
        //20191112 xuyiming 添加剪切拦截事件
        if (document.WriterControl != null
            && document.WriterControl.EventBeforeCut != null
            && typeof (document.WriterControl.EventBeforeCut) == "function") {
            var result = document.WriterControl.EventBeforeCut(eventObj);
            if (result === false) {
                return false;
            }
        }
        // 存储复制信息
        document.WriterControl.copyText = DCWriterControllerEditor.getSelectionText();
    });
    DCWriterControllerEditor.getSelectionText = function () {//获取选中文本
        var text;
        // 存储复制信息
        var range = DCDomTools.getSelectionRange();
        if (range != null && range.cloneContents) {
            var copyText = range.cloneContents();
            var div = document.createElement("div");
            div.appendChild(copyText);
            text = div.innerHTML;
        }
        if (text == "") {
            if (window.getSelection) {
                text = window.getSelection().toString();
            } else if (document.selection && document.selection.createRange) {
                text = document.selection.createRange().text;
            }
        }
        if(text == ""){
            var activeTextarea = document.activeElement;//可使用Document.activeElement 来返回当前的焦点元素.
            //兼容ie中input元素
            if (activeTextarea != null && activeTextarea.selectionStart != undefined) {
                text = activeTextarea.value.substring(
                    activeTextarea.selectionStart, activeTextarea.selectionEnd
                );
            }
        }
        return text;
    }
    if (isEditMode == true) {


        //alert("event focus");
        //$("label").on("focusin", function (element) {
        //    alert('focusin');
        //});
        //$("label").on("focus", function (element) {
        //    alert('focus');
        //});
        document.tmrFixInputFieldDom = null;

        //        document.onkeydown = function (eventObj) {
        //            // 每按下一次键盘按键则延时10秒钟修复当前输入域的DOM状态。
        //            if (document.tmrFixInputFieldDom != null) {
        //                window.clearTimeout(document.tmrFixInputFieldDom);
        //            }
        //            document.tmrFixInputFieldDom = window.setTimeout(
        //            DCInputFieldManager.FixInputElementDomWithDetectBorderElement(),
        //            10 * 1000);
        //        };
        $(document).on("selectionchange", function (e) {
            //debugger;
            //var srcElement = null;
            //if (e == null) {
            //    e = window.event;
            //}
            //srcElement = e.srcElement || e.target;
            var e = DCWriterControllerEditor.CurrentElement();
            while (e != null) {
                if (e == DCDropdownControlManager.GetDropdownContainer(false)) {
                    // 焦点在下拉区域中，不处理。
                    return;
                }
                e = e.parentNode;
            }
            var funcSel = function () {
                var oldField = document.CurrentInputField;
                var field = DCSelectionManager.GetCurrentInputField();
                if (oldField != field) {
                    document.CurrentInputField = field;
                    if (oldField != null) {
                        DCInputFieldManager.FixInputFieldElementDomForBackgroundText(oldField);
                    }
                    if (field != DCDropdownControlManager.GetCurrentEditInputField()) {
                        DCDropdownControlManager.CloseDropdownControl();
                    }
                }
            };
            DCDocumentCommentManager.ActiveCurrentComment();
            if (document.WriterControl != null) {
                DCWriterControllerEditor.executeWriterControlEventHandler(null, "SelectionChanged");
            }
        });

        var ieVersion = DCDomTools.getIEVersion();
        if (ieVersion <= 9 && ieVersion >= 0 ) {
            if (document.WriterControl != null) {
                var bhBackIE9 = 0;
                var fixIE9 = function () {
                    //debugger;
                    var ctl = document.WriterControl;
                    if (ctl != null) {
                        var bhie9 = ctl.clientHeight - 10;
                        if (bhie9 != bhBackIE9) {
                            bhBackIE9 = bhie9;
                            document.body.style.height = bhie9 + "px";
                        }
                    }
                };
                //fixIE9();
                //window.onresize = fixIE9;
                window.setInterval(fixIE9, 200);
            }
        }

        if (document.IsIE7 == true) {



            //debugger;
            // 修正IE7/8的一个BUG
            var bhBack = 0;
            var funcFixIE78 = function () {
                var ctl = document.WriterControl;
                //if (ctl != null) {
                //    var bh = ctl.clientHeight - document.body.bottomMargin - document.body.topMargin - 10;
                //    if (bh != bhBack) {
                //        bhBack = bh;
                //        document.body.style.height = bh + "px";
                //    }
                //}
                var actElement = document.activeElement;

                var sel = DCDomTools.getSelection();
                if (sel.TextRange != null && sel.TextRange.length > 0) {
                    var rng = sel.TextRange.item(0);
                    var p = rng.parentElement();
                }
                var node = DCWriterControllerEditor.CurrentElement();
                var root = document.getElementById("divDocumentBody_0");
                var checkFoucs = true;
                if (DCDropdownControlManager.isDropdownControlVisible()) {
                    // 正在显示下拉列表
                    checkFoucs = false;
                    return;
                }
                if (node != null && node.ownerDocument != document) {
                    checkFoucs = false;
                    // 焦点在其他文档之中。
                    return;
                }
                if (ctl != null && ctl.isShowingDialog() == true) {
                    // 正在显示对话框。
                    checkFoucs = false;
                    return;
                }
                if (node == null) {
                    // 遇到其他情况，不处理。 
                    return;
                }
                if (checkFoucs == true)
                //&& DCDropdownControlManager.isDropdownControlVisible() == false)
                {

                    var rp = node.parentNode;
                    var centerElement = null;
                    for (var iCount = 0; iCount < document.body.childNodes.length; iCount++) {
                        if (document.body.childNodes[iCount].nodeName == "CENTER") {
                            centerElement = document.body.childNodes[iCount];
                            break;
                        }
                    } //for

                    var isInRoot = false;
                    var isInCenter = false;
                    while (rp != null) {
                        if (rp == root) {
                            isInRoot = true;
                        }
                        if (rp == centerElement) {
                            isInCenter = true;
                        }
                        rp = rp.parentNode;
                    }
                    if (isInRoot == false && isInCenter == true) {
                        //debugger;
                        // 不在正文区域，则设置第一个可编辑的元素来获取焦点。
                        function GetEditableNode(root) {
                            if (root == null || root.childNodes == null) {
                                return null;
                            }
                            var nodes = root.childNodes;
                            var len = nodes.length;
                            for (var iCount = 0; iCount < len; iCount++) {
                                var subNode = nodes[iCount];
                                if (subNode.isContentEditable == true) {
                                    return subNode;
                                }
                                var n2 = GetEditableNode(subNode);
                                if (n2 != null) {
                                    return n2;
                                }
                            }
                            return null;
                        };
                        var fen = GetEditableNode(root);
                        if (fen != null) {
                            // DCDomTools.MoveCaretTo(fen);
                            DCDomTools.MoveCaretToIndex(fen, 0);
                            //DCDomTools.setActive(fen);
                            return;
                        }
                    }
                }
                if (node != null
                    && node.getAttribute
                    && node.getAttribute("dctype") == "backgroundtext") {
                    var field = node.parentNode;
                    var bkt = field.getAttribute("dc_backgroundtext");
                    var innerText = node.innerText;
                    if (bkt != null && bkt != innerText) {
                        // 背景文本发生变化
                        if (bkt.length < innerText.length) {
                            var txt = innerText.substr(0, innerText.length - bkt.length);
                            var txtNode = document.createTextNode(txt);
                            field.insertBefore(txtNode, node);
                            field.removeChild(node);
                            DCDomTools.MoveCaretToEnd(txtNode);
                            return;
                            ////debugger;
                            //var txtNode = document.createTextNode(txt);
                            //var tempNode = document.createElement("span");
                            //tempNode.innerText = "|";
                            //field.insertBefore(txtNode, node);
                            //DCDomTools.MoveCaretTo(tempNode);
                            //tempNode.focus();
                            //field.removeChild(tempNode);
                            //return;
                        }
                    }
                    DCDomTools.MoveCaretToEnd(node.parentNode.firstChild);
                    return;
                }
                if (node != null && node.parentNode != null) {
                    var p = node.parentNode;
                    if (p.getAttribute && p.getAttribute("dctype") == "backgroundtext") {
                        DCDomTools.MoveCaretToEnd(p.parentNode.firstChild);
                        return;
                    }
                }
            };
            window.setInterval(funcFixIE78, 200);
        }

        if (DCWriterControllerEditor.readonly == false) {
            if (document.body != null && DCDomTools.hasAttriubte(document.body, "ismobilelayout")) {
                $(document.body).on("input", function (eventObj) {
                    eventObj = DCDomTools.FixEventObject(eventObj);
                    var element = eventObj.srcElement || eventObj.target;
                    if (element != null && element.nodeName == "TEXTAREA") {
                        element.style.height = "auto";
                        element.style.height = (element.scrollHeight + 3) + "px";
                    }
                });

                $("textarea").each(function () {
                    this.style.height = (this.scrollHeight + 3) + "px";
                });
            }

            var $rootDiv = $("div[dctype='XTextDocumentBodyElement']");


            // 设置控件是否允许拖拽内容
            $rootDiv.each(function (index, element) {
                if (element.getAttribute("allowdrop") == "true") {
                    // 允许拖拽
                    element.ondragenter = function (event) {
                        DCMultiDocumentManager.handleDocumentDragEvent(event, 'ondragenter');
                    };
                    element.ondragleave = function (event) {
                        DCMultiDocumentManager.handleDocumentDragEvent(event, 'ondragleave');
                    };
                    element.ondragover = function (event) {
                        DCMultiDocumentManager.handleDocumentDragEvent(event, 'ondragover');
                    };
                    element.ondrop = function (event) {
                        DCMultiDocumentManager.handleDocumentDragEvent(event, 'ondrop');
                    };
                }
                else {
                    // 不允许拖拽
                    element.ondragenter = function (event) {
                        DCDomTools.completeEvent(event);
                    };
                    element.ondragleave = function (event) {
                        DCDomTools.completeEvent(event);
                    };
                    element.ondragover = function (event) {
                        DCDomTools.completeEvent(event);
                    };
                    element.ondrop = function (event) {
                        DCDomTools.completeEvent(event);
                    };
                }
            });

            // 控件内容不只读
            //xuyiming 20200612 修复页眉页脚输入域的修复结构问题
            $(document.body).on("input", function (eventObj) {
                // 标记浏览器触发input事件。
                document.hasInputEvent = true;
                //console.log(this.innerText);
                eventObj = DCDomTools.FixEventObject(eventObj);
                // 20191104 xuyiming 修复在输入域前后面输入文本所导致的问题
                var curField = DCSelectionManager.getSelection().GetCurrentInputField();
                if (curField && DCSelectionManager.GetCurrentInputField() != curField) {
                    var range = DCDomTools.getSelectionRange();
                    var commonAncestorContainer = range.commonAncestorContainer;
                    while(commonAncestorContainer!=null){
                        if (commonAncestorContainer.getAttribute && commonAncestorContainer.nodeName == "SPAN" && commonAncestorContainer.getAttribute("dcignore") == "1"){
                            if (commonAncestorContainer.getAttribute("dctype") == "end" && commonAncestorContainer.innerText.length == range.startOffset) {
                                if (eventObj.inputType == "insertCompositionText") {
                                } else {
                                    DCInputFieldManager.FocusOwnerInputField(curField);
                                    if (curField.nextSibling) {
                                        DCDomTools.MoveCaretToIndex(curField.nextSibling, eventObj.data ? eventObj.data.length : 0);
                                    } else {
                                        DCDomTools.MoveCaretToEnd(curField);
                                    }
                                }
                                break;
                            } else if (commonAncestorContainer.getAttribute("dctype") == "start" && commonAncestorContainer.innerText.length != range.startOffset) {
                                DCInputFieldManager.FocusOwnerInputField(curField);
                                var editMode = curField.getAttribute("dc_innereditstyle");
                                if (editMode || editMode != "Numeric") {
                                    setTimeout(function () {
                                        DCDomTools.MoveCaretToIndex(curField, 0);
                                    }, 10);
                                }
                                break;
                            }
                        }
                        commonAncestorContainer = commonAncestorContainer.parentNode || commonAncestorContainer.parentElement;
                    }
                    DCInputFieldManager.FixInputElementDom(curField);
                }
                if (typeof (eventObj.isComposing) == "undefined" && typeof (eventObj.inputType) == "undefined") {
                    // 两种属性都没有实现，可能是IE/EDGE浏览器。
                    DCSelectionManager.UpdateOldSelectionState();
                }
                else if (eventObj.inputType == "insertCompositionText") {
                    if (eventObj.data != null && eventObj.data.charCodeAt(0) < 128) {
                        // 输入法中的正常文本
                        // 更新DCSelectionManager状态，暂停文档状态检查
                        //window.setTimeout(DCSelectionManager.UpdateLastSelectionState(), 0);
                        //DCSelectionManager.UpdateOldSelectionState();
                        //DCInputFieldManager.FixInputFieldElementDomForBackgroundText();
                        //DCSelectionManager.UpdateLastSelectionState();
                        //DCSelectionManager.KeyPressFlagOnce = true;
                        //DCSelectionManager.TickDelayDetectSelectionChanged = DCDomTools.GetDateMillisecondsTick(new Date()) + 5000;
                        //DCInputFieldManager.SetStartTickForFixInputElementDom(1000);
                    }
                    else {
                        // 输入法完成，取消限制
                        window.setTimeout(DCInputFieldManager.FixInputFieldElementDomForBackgroundText, 100);
                        //DCInputFieldManager.FixInputFieldElementDomForBackgroundText();
                        //DCSelectionManager.ResetOldSelectionState();
                        //DCSelectionManager.KeyPressFlagOnce = false;
                        //DCSelectionManager.TickDelayDetectSelectionChanged = 0;
                    }
                }
                else if (eventObj.inputType == "insertText") {
                    // 输入正常的文本
                    DCInputFieldManager.FixInputFieldElementDomForBackgroundText();
                    //if (eventObj.data.length == 1 && eventObj.data.charCodeAt(0) == 32) {
                    //    if (DCDomTools.hasSelection() == false) {
                    //        DCWriterControllerEditor.InsertHtmlAtCurentPosition("&ensp;");
                    //        DCDomTools.completeEvent(eventObj);
                    //        return;
                    //    }
                    //}
                    var EventChangeContent = true;
                }
                else if (eventObj.inputType == "deleteContentBackward") {
                    //xuyiming 20200612 修复删除到输入域没有文字时更新输入域结构
                    if (DCWriterControllerEditor.GetElementText(curField) == "") {
                        DCInputFieldManager.FixInputFieldElementDomForBackgroundText();
                    }
                    var EventChangeContent = true;
                }
                else if (eventObj.isComposing == true) {
                    // firefox 不支持 eventObj.inputType
                    DCSelectionManager.UpdateOldSelectionState();
                }
                if (curField) {
                    if (curField.nodeName == "SPAN" && (curField.getAttribute("dc_specifywidth") && parseFloat(curField.getAttribute("dc_specifywidth")) > 0) || (curField.getAttribute("dc_specifywidthinpixel") && parseFloat(curField.getAttribute("dc_specifywidthinpixel")) > 0)) {
                        var a = $(curField).outerWidth();
                        if (curField.className.indexOf("InputFieldInvalidateValue") >= 0) {
                            a -= 2;
                        }
                        var flag = a > parseFloat($(curField).css("min-width"));
                        curField.style.display = flag ? "inline" : "inline-block";
                        curField.style.textIndent = "0";
                        if ($(curField).parent().css("line-height") != "normal") {
                            curField.style.lineHeight = flag ? "inherit" : "1";
                        }
                        if ($(curField).find(">[dctype='end']")[0]) {
                            $(curField).find(">[dctype='end']")[0].style.float = flag ? "none" : "right";
                        }
                    }
                    // var pNode = $(curField).parent("p:first");
                    // var isTextIndent = parseFloat(pNode.css("text-indent"))
                    // if (isNaN(isTextIndent) == false && isTextIndent != 0) {
                    //     var brArr = $(curField).find("br");
                    //     brArr.each(function () {
                    //         var _next = this.nextSibling || this.nextElementSibling;
                    //         if (_next.nodeName == "#text") {
                    //             $(_next).wrap("<span style='display:inline-block;'></span>")
                    //         }
                    //     });
                    // }
                    //内容修改后，需给对应属性赋值
                    DCInputFieldManager.UpdateInnerValue(curField);
                }
                if(EventChangeContent == true){
                    DCWriterControllerEditor.HandleEventChangeContent();
                }
                //console.log(">>>" + this.innerText);
            }).on("compositionend", function(eventObj){
                // 20191112 xuyiming 输入法完成后修复输入域样式
                eventObj = DCDomTools.FixEventObject(eventObj);
                var curField = DCSelectionManager.getSelection().GetCurrentInputField();
                if (curField && DCSelectionManager.GetCurrentInputField() != curField) {
                    if (eventObj.data != null) {
                        setTimeout(function () {
                            DCInputFieldManager.FixInputElementDom(curField);
                        }, 10);
                    }
                }
                DCWriterControllerEditor.HandleEventChangeContent();
            });

            $rootDiv.on("keypress", function (eventObj) {
                //debugger;

                //DCInputFieldManager.FixInputFieldElementDomForBackgroundText();
            });

            $rootDiv.on("keyup", function (eventObj) {
                eventObj = DCDomTools.FixEventObject(eventObj);
                if (eventObj.keyCode == 13) {
                    //xuyiming 20190902 有序、无序列表设置后继续增加列表项时清除p标签
                    $rootDiv.find("li p").each(function () {
                        var p = this.parentNode;
                        while (this.firstChild != null) {
                            //console.log(this.firstChild.innerHTML);
                            //不可见字符问题
                            if (this.firstChild.nodeName == "#text") {
                                if (this.firstChild.nodeValue.match(/\u200B/)) {
                                    this.firstChild.nodeValue = this.firstChild.nodeValue.replace(/\u200B/g, "");
                                }
                            }
                            p.insertBefore(this.firstChild, this);
                        }
                        p.removeChild(this);
                    });
                }
                //wyc20200421:追加对表格单元格的处理
                var currentcell = WriterCommandModuleTable.getCurrentCell();
                if (currentcell != null && currentcell.getAttribute && currentcell.getAttribute("id") != null) {
                    DCWriterExpressionManager.ExecuteEffectExpression(currentcell);
                }
            });
            
            var tempIDCounter = 0;
            $rootDiv.on("paste", function (eventObj) {
                //debugger;
                eventObj = DCDomTools.FixEventObject(eventObj);
                //添加事件 2019-05-29 hulijun
                // DCWriterControllerEditor.executeWriterControlEventHandler(eventObj, "EventBeforePaste");
                if (document.WriterControl != null
                    && document.WriterControl.EventBeforePaste != null
                    && typeof (document.WriterControl.EventBeforePaste) == "function") {
                    var result = document.WriterControl.EventBeforePaste(eventObj);
                    if (result === false) {
                        return false;
                    }     
                }
                //20191129 xuyiming 光标所在位置不可编辑时不粘贴
                var srcElement = eventObj.srcElement || eventObj.target;
                if (srcElement.isContentEditable == false) {
                    return;
                }
                var acceptDataFormats = null;
                var supportText = true; // 支持粘贴纯文本
                var supportHtml = true; // 支持粘贴HTML文本
                var isIE = false;
                if (document.WriterControl != null && document.WriterControl.DocumentOptions != null && document.WriterControl.DocumentOptions.BehaviorOptions != null) {
                    acceptDataFormats = document.WriterControl.DocumentOptions.BehaviorOptions.AcceptDataFormats;
                }
                if (acceptDataFormats == null) {
                    acceptDataFormats = "All";
                }
                var cbData = eventObj.clipboardData;
                if (cbData == null) {
                    cbData = window.clipboardData;
                    isIE = true;
                }               
                if (acceptDataFormats != null && acceptDataFormats.length > 0) {
                    supportText = acceptDataFormats == "All" || acceptDataFormats.indexOf("Text") >= 0;
                    supportHtml = acceptDataFormats == "All" || acceptDataFormats.indexOf("Html") >= 0;
                }
                //处理输入域内的粘贴操作
                var curField = DCSelectionManager.GetCurrentInputField();
                if (curField != null && curField.nodeName == "SPAN") {
                    cbData = eventObj.clipboardData;
                    if (cbData == null) {
                        cbData = window.clipboardData;
                    }
                    curField.setAttribute("dctempid", Math.random());
                    var handleFlag = false;
                    var srcHtml;
                    if (cbData != null && cbData.getData) {
                        if (supportHtml === true) {
                            srcHtml = cbData.getData("text/html") || cbData.getData("text");
                        }
                        if (supportText == true && !srcHtml) {
                            if (result) {
                                srcHtml = cbData.getData("text/html") || cbData.getData("text");
                            } else {
                                srcHtml = cbData.getData("text");
                            }
                        }
                    }
                } else if (curField != null && curField.nodeName == "INPUT") {
                    return;
                }
                //输入域外的粘贴处理逻辑
                if (cbData) {
                    if (supportHtml == true) {
                        // 系统支持接收HTML格式。
                        var srcHtml;
                        if (isIE) {
                            try {
                                srcHtml = cbData.getData("html");
                            }
                            catch (e) {
                            }
                        }
                        else {
                            srcHtml = cbData.getData("text/html") || cbData.getData("text");
                        }
                    }
                    if (supportText == true && !srcHtml) {
                        // 系统接受纯文本数据
                        var srcHtml;
                        try {
                            if (result) {
                                srcHtml = cbData.getData("text/html") || cbData.getData("text");
                            } else {
                                srcHtml = cbData.getData(isIE ? "Text" : "text/plain");
                            }
                        }
                        catch (e) {
                        }
                    }
                }
                srcHtml = WriterCommandModuleFormat.clearNoNeedText(srcHtml, supportHtml == true ? false : true, result, true);//传输值
                if(srcHtml == null || srcHtml.length == 0){
                    return;
                }
                DCDomTools.completeEvent(eventObj);
                DCDomTools.delectNode();
                DCWriterControllerEditor.InsertHtmlAtCurentPosition(srcHtml);
                var curField = DCSelectionManager.GetCurrentInputField();
                if (curField != null && curField.getAttribute("dctempid") == null) {
                    curField.setAttribute("dctempid", tempIDCounter.toString());
                    tempIDCounter++;
                }
                // 存储当前位置
                var old_sel = DCSelectionManager.getSelection();
                var func13 = function () {
                    //return;
                    if (curField != null && curField.nodeName == "SPAN") {
                        DCInputFieldManager.FixInputFieldElementDomForBackgroundText(curField);
                        // 在少数情况下,特别在FireFox中，黏贴操作导致当前输入域元素发生了复制，
                        // 在此进行判断并删除自动复制的元素
                        $("span[dctempid='" + curField.getAttribute("dctempid") + "']").each(function () {
                            if (this != curField) {
                                this.parentNode.removeChild(this);
                            }
                        });
                    }
                    /*
                     * 20201231 xym 处理IE下粘贴后光标有问题
                     */
                    // 再次获取当前位置
                    var sel = DCSelectionManager.getSelection();
                    if (sel == null || sel.startContainer == null) {
                        return;
                    }
                    if (old_sel == null || old_sel.startContainer == null) {
                        return;
                    }
                    if (sel.startContainer != old_sel.startContainer || sel.startOffset != old_sel.startOffset) {
                        // 当前位置变化，重置光标位置
                        DCDomTools.MoveCaretToIndex(old_sel.startContainer, old_sel.startOffset);
                    }
                    clearTimeout(func13);
                };
                window.setTimeout(func13, 0);
            });

            $rootDiv.on("compositionend", function (eventObj) {
                // 处理输入法完成事件
                eventObj = DCDomTools.FixEventObject(eventObj);
                var field = DCSelectionManager.GetCurrentInputField();
                if (field != null) {
                    window.setTimeout(function () {
                        DCInputFieldManager.FixInputFieldElementDomForBackgroundText(field);
                    },
                   50);
                }
            });

            var needRecalc = false;
            if (DCWriterControllerEditor.IsFormView()==true) {
                if (DCDomTools.getIEVersion() == 9) {
                    needRecalc = true;
                }
            }
            var handleRecalc = null;
            $rootDiv.on("keydown", function (eventObj) {
                // 处理键盘事件
                //return;
                //debugger;
                eventObj = DCDomTools.FixEventObject(eventObj);
                //if (DCDomTools.getIEVersion() > 0)
                {
                    // 在IE浏览器中，光标处于输入域结束文本后面敲回车时，会复制输入域，在此进行修复。
                    // xuyiming 20191014 光标处于输入域开始文本前面敲回车时，也会复制输入域，在此进行修复
                    if (eventObj.ctrlKey == false
                        && eventObj.shiftKey == false
                        && eventObj.altKey == false
                        && eventObj.keyCode == 13) {
                        var fieldForFix = null;
                        var isEnd = true;
                        var sel = DCSelectionManager.getSelection();
                        //debugger;
                        if (sel != null && sel.hasSelection == false)
                        {
                            // 没有高亮度选中内容
                            var node = sel.startContainer;
                            if (node != null) {
                                if (node.nodeName == "SPAN"
                                    && node.getAttribute("dctype") == "end"
                                    && sel.startOffset == node.innerText.length) {
                                    fieldForFix = node.parentNode;
                                }
                                else if (node.nodeName == "#text"
                                    && sel.startOffset == node.length
                                    && node.parentNode.getAttribute("dctype") == "end") {
                                    fieldForFix = node.parentNode.parentNode;
                                    // xuyiming 20191126 暂时修复固定宽度输入域后面回车问题
                                    if (DCInputFieldManager.IsInputFieldElement(fieldForFix) == true && node.parentNode.style.float == "right") {
                                        node.parentNode.style.float = "none";
                                        setTimeout(function () {
                                            node.parentNode.style.float = "right";
                                        }, 5)
                                    }
                                }
                                if (node.nodeName == "SPAN"
                                    && node.getAttribute("dctype") == "start"
                                    && sel.startOffset == 0) {
                                    fieldForFix = node.parentNode;
                                    isEnd = false;
                                }
                                else if (node.nodeName == "#text"
                                    && sel.startOffset == 0
                                    && node.parentNode.getAttribute("dctype") == "start") {
                                    fieldForFix = node.parentNode.parentNode;
                                    isEnd = false;
                                }
                            }
                            if (fieldForFix != null) {
                                //if (fieldForFix.parentNode.nodeName == "P" ||
                                //    fieldForFix.parentNode.nodeName == "TD") {
                                //    fieldForFix = fieldForFix.parentNode;
                                //}
                                //var pe = document.createElement("p");
                                //if (fieldForFix.nodeName == "P") {
                                //    pe.className = fieldForFix.className;
                                //    pe.align = fieldForFix.align;
                                //}
                                //pe.appendChild(document.createElement("br"));
                                //if (fieldForFix.nextSibling == null) {
                                //    fieldForFix.parentNode.appendChild(pe);
                                //}
                                //else {
                                //    fieldForFix.parentNode.insertBefore(pe, fieldForFix.nextSibling);
                                //}
                                //DCDomTools.MoveCaretTo(pe);
                                //DCDomTools.completeEvent(eventObj);
                                //return;

                                var tempID3 = Math.random().toString();
                                fieldForFix.setAttribute("tempid", tempID3);
                                var isFirst = true;
                                window.setTimeout(function () {
                                    $("span[tempid='" + tempID3 + "']").each(function () {
                                        if (isFirst == true) {
                                            isFirst = false;
                                            if (this != fieldForFix) {
                                                if (isEnd) {
                                                    DCWriterControllerEditor.BindInputFieldEvent(this);
                                                } else {
                                                    this.parentNode.replaceChild(document.createElement("BR"), this);
                                                }
                                                
                                            }
                                        }
                                        else {
                                            if (isEnd) {
                                                this.parentNode.replaceChild(document.createElement("BR"), this);
                                            } else {
                                                DCWriterControllerEditor.BindInputFieldEvent(this);
                                                
                                            }
                                        }
                                    });
                                }, 50);
                                return;
                            }
                        }
                    }
                }
                var srcElement = eventObj.srcElement || eventObj.target;
                if (srcElement != null && (srcElement.nodeName == "INPUT" || srcElement.nodeName == "TEXTAREA")) {
                    // 标准文本输入框，则不进行后续处理。
                    return;
                }
                if (needRecalc) {
                    if (handleRecalc != null) {
                        window.clearTimeout(handleRecalc);
                    }
                    handleRecalc = window.setTimeout(function () {
                        // 修改IE9下表单模式中输入时出现残影在问题。
                        // 故意修改DOM结构，强制浏览器刷新页面。
                        var p = srcElement;
                        while (p != null) {
                            if (p.nodeName == "SPAN") {
                                var tempSpan = document.createElement("span");
                                tempSpan.innerText = "1";
                                var nextNode = p.nextSibling;
                                if (nextNode != null) {
                                    p.parentNode.insertBefore(tempSpan, nextNode);
                                    p.parentNode.removeChild(nextNode);
                                }
                                else {
                                    p.parentNode.appendChild(tempSpan);
                                }
                                if (nextNode != null) {
                                    p.parentNode.insertBefore(nextNode, tempSpan);
                                }
                                window.setTimeout(function () { p.parentNode.removeChild(tempSpan); }, 0);

                                break;
                            }
                            p = p.parentNode;
                        }
                    }, 300);
                }
                //if (eventObj.ctrlKey == true && eventObj.keyCode == 89) {
                //    // 遇到Ctrl+Y，重做操作。
                //    if (document.WriterControl != null) {
                //        document.WriterControl.Redo();
                //    }
                //    else {
                //        DCUndoRedo.Redo();
                //    }
                //    DCDomTools.completeEvent(eventObj);
                //    return;
                //}
                //if (eventObj.ctrlKey == true && eventObj.keyCode == 90) {
                //    // 遇到Ctrl+Z，撤销操作。
                //    if (document.WriterControl != null) {
                //        document.WriterControl.Undo();
                //    }
                //    else {
                //        DCUndoRedo.Undo();
                //    }
                //    DCDomTools.completeEvent(eventObj);
                //    return;
                //}

                //if (eventObj.altKey == false
                //    && eventObj.ctrlKey == false
                //    && eventObj.shiftKey == false
                //    && (eventObj.keyCode == 13)) {
                //    // 处理回车键
                //    var sel = DCSelectionManager.getSelection();
                //    if (sel.startContainer == sel.currentContainer
                //        && sel.startOffset == sel.currentOffset) {
                //        // 没有选中内容的回车键，则进行输入域状态判断
                //        window.setTimeout(function () {
                //            var sel = DCSelectionManager.getSelection();
                //            var node = sel.startContainer;
                //            if (node != null && node.nodeName == "SPAN") {
                //                if (node.getAttribute("dctype") == "start" || node.getAttribute("dctype") == "end") {
                //                    if (node.childNodes.length == 1 && node.firstChild.nodeName == "BR") {
                //                        var brNode = node.firstChild;
                //                        if (node.parentNode.parentNode != null) {
                //                            node.parentNode.parentNode.replaceChild(brNode, node.parentNode);
                //                        }
                //                    }
                //                }
                //            }
                //            //debugger;
                //        }, 50);
                //    }
                // }
                if (eventObj.altKey == false
                    && eventObj.ctrlKey == false
                    && eventObj.shiftKey == false
                    && (eventObj.keyCode == 8 || eventObj.keyCode == 46)) {
                    // 单纯的Backspace或者Delete键
                    var sel = DCSelectionManager.getSelection();
                    if (sel.currentContainer.nodeName == "LI") {
                        if (sel.currentContainer.lastChild.nodeName == "P") {
                            $(sel.currentContainer.lastChild).remove();
                        }
                        return;
                    }
                    if (sel.currentContainer.parentNode.nodeName == "LI") {
                        if (sel.currentContainer.parentNode.lastChild.nodeName == "P") {
                            $(sel.currentContainer.parentNode.lastChild).remove();
                        }
                        return;
                    }
                    if (sel.currentContainer.parentNode.parentNode.nodeName == "LI") {
                        if (sel.currentContainer.parentNode.parentNode.lastChild.nodeName == "P") {
                            $(sel.currentContainer.parentNode.parentNode.lastChild).remove();
                        }
                        return;
                    }
                    if (eventObj.keyCode == 8 && sel.isCollapsed == true) {
                        // 处理backspace 键
                        var sel = DCSelectionManager.getSelection();
                        var preNode = sel.GetPreNode();
                        if (preNode.nodeName == "#text") {
                            //WYC20191018:当前删除元素为上下标内唯一的字符，需要特殊处理
                            if (preNode.length == 1 &&
                                (preNode.parentNode.nodeName === "SUB" || preNode.parentNode.nodeName === "SUP")) {
                                if (preNode.parentNode.previousSibling.nodeName == "#text") {
                                    preNode.parentNode.style.fontSize = preNode.parentNode.previousSibling.parentNode.style.fontSize;
                                } else {
                                    preNode.parentNode.style.fontSize = preNode.parentNode.previousSibling.style.fontSize;
                                }
                                
                            } else {
                                preNode = preNode.parentNode;
                            }
                        }
                        // 处理回车生成空span的特殊情况,删除空span并重新赋值
                        if (preNode.nodeName == "SPAN" && preNode.innerText == "") {

                            //单复选框 右对齐 2019-01-11 hulijun
                            var firstChild = preNode.firstChild;
                            if (firstChild && firstChild.nodeName == "INPUT") {
                                if (firstChild.getAttribute("dc_deleteable") == "false") {
                                    // 不能被删除的标签,则移动插入点
                                    // DCDomTools.MoveCaretTo(preNode);
                                    DCDomTools.MoveCaretToIndex(preNode, 0);
                                } else {
                                    preNode.parentNode.removeChild(preNode);
                                }
                                // 不执行默认操作
                                DCDomTools.completeEvent(eventObj);
                                return;
                            }

                            $(preNode).remove();
                            preNode = sel.GetPreNode();
                        }
                        //WYC20191113:当光标位于段落尾部且该段落最后元素是一个BR时，删除BR并重新赋值
                        if (sel.startContainer.nodeName == "P" && sel.startContainer.lastChild == preNode && preNode.nodeName == "BR") {
                            $(preNode).remove();
                            preNode = sel.GetPreNode();
                        }
                        //处理光标置入段落结尾处导致获取的Node是段落的情况 WYC20191010 
                        //20191014 xuyiming 需要考虑光标不在输入域所在段落的情况
                        if (preNode.nodeName == "P" && sel.startContainer == preNode && DCInputFieldManager.IsInputFieldElement(preNode.lastChild) == true) {
                            preNode = preNode.lastChild.lastChild;
                        }
                        //处理标签删除问题
                        if (preNode.nodeName == "P" && preNode.lastChild.getAttribute && preNode.lastChild.getAttribute("dctype") == "XTextLabelElement") {
                            preNode = preNode.lastChild;
                        }
                        if (preNode.nodeName == "P" && preNode.lastChild.getAttribute) {//判断单复选框是否右对齐并且在最后
                            var _child = preNode.lastChild;
                            if (_child.childNodes.length == 1 && _child.firstChild.nodeName == "INPUT") {
                                if (_child.firstChild.getAttribute("type") == "checkbox" || _child.firstChild.getAttribute("type") == "radio") {
                                    var a = _child.previousSibling || _child.previousElementSibling;
                                    if (a != null) {
                                        preNode = a;
                                    }
                                }
                            }
                        }
                        if (preNode.nodeName == "DIV" && preNode.getAttribute("dctype") == "XTextDocumentHeaderElement") {
                            DCDomTools.completeEvent(eventObj);
                            return;
                        }
                        if (preNode != null && preNode.getAttribute) {
                            if (DCInputFieldManager.IsInputFieldElement(preNode) == true) {
                                // 在一个输入域之中
                                var preNode2 = sel.GetPreNode();
                                if(sel.startContainer == preNode && sel.startOffset != preNode.childNodes.length){
                                    return;
                                }
                                if (preNode != preNode2) {
                                    // 在一个输入域之中
                                } else {
                                    // 紧跟在一个输入域之后
                                    if (preNode.getAttribute("dc_contentreadonly") && preNode.getAttribute("dc_contentreadonly").toLowerCase() == "true") {
                                        if (preNode.getAttribute("dc_deleteable") == "false") {
                                            if (preNode.previousSibling) {
                                                DCDomTools.MoveCaretToEnd(preNode.previousSibling);
                                            } else {
                                                DCDomTools.MoveCaretToIndex(preNode.parentNode || preNode.parentElement, 0);
                                            }
                                        } else {
                                            // 删除输入域
                                            preNode.parentNode.removeChild(preNode);
                                        }
                                    } else {
                                        DCDomTools.MoveCaretToIndex(preNode.lastChild, 0);
                                    }
                                    DCDomTools.completeEvent(eventObj);
                                    return;
                                }
                            }
                            else if (preNode.getAttribute("dctype") == "start") {
                                // 在一个输入域的前置边界元素之后
                                var inputElement = preNode.parentNode;
                                if (DCInputFieldManager.IsEmptyInputFieldElement(inputElement) == true) {
                                    // 遇到一个内容空白的输入域
                                    if (inputElement.getAttribute("dc_deleteable") == "false") {
                                        // 不能被删除的输入域,则移动插入点
                                        // DCDomTools.MoveCaretTo(inputElement.firstChild);
                                        DCDomTools.MoveCaretToIndex(inputElement.firstChild, 0);
                                    }
                                    else {
                                        // 20191128 xuyiming 表单模式下不删除直接子输入域
                                        if (DCWriterControllerEditor.IsFormView() == true) {
                                            var isContenteditable = inputElement.getAttribute("contenteditable");
                                            if (isContenteditable && isContenteditable.toLowerCase() == "true") {
                                                // DCDomTools.MoveCaretTo(inputElement.firstChild);
                                                DCDomTools.MoveCaretToIndex(inputElement.firstChild, 0);
                                            } else {
                                                // 删除输入域
                                                inputElement.parentNode.removeChild(inputElement);
                                            }
                                        } else {
                                            // xym 20200811 处理输入域删除后当前行为空时的情况
                                            var pNode = $(inputElement).parent();
                                            if (pNode[0] != null && pNode[0].nodeName == "P" && pNode[0].childNodes.length == 1) {
                                                $(inputElement).replaceWith($("<br>"));
                                            }else{
                                                $(inputElement).remove();
                                            }
                                            // inputElement.parentNode.removeChild(inputElement);
                                        }
                                    }
                                    // 不执行默认操作
                                    DCDomTools.completeEvent(eventObj);
                                    return;
                                }
                            }
                            else if (preNode.getAttribute("dctype") == "end") {
                                // 在一个输入域后置元素之后,直接向前移动一下。
                                // DCDomTools.MoveCaretTo(preNode);
                                if (preNode.previousSibling.getAttribute && preNode.previousSibling.getAttribute("dctype") == "backgroundtext") {
                                    DCDomTools.MoveCaretToEnd(preNode.previousSibling.previousSibling);
                                } else {
                                    DCDomTools.MoveCaretToEnd(preNode.previousSibling);
                                }
                                var preInput = preNode.parentNode || preNode.parentElement;
                                if (preInput.getAttribute("dc_contentreadonly") && preInput.getAttribute("dc_contentreadonly").toLowerCase() == "true" && preInput.getAttribute("dc_deleteable") == "false") {
                                    if (preInput.previousSibling) {
                                        DCDomTools.MoveCaretToEnd(preInput.previousSibling);
                                    } else {
                                        DCDomTools.MoveCaretToIndex(preInput.parentNode || preInput.parentElement, 0);
                                    }
                                }
                                
                                DCDomTools.completeEvent(eventObj);
                                return;
                            }
                            else if (preNode.getAttribute("dctype") == "backgroundtext") {
                                // 在一个背景文字之后,则移动插入点
                                var inputElement = preNode.parentNode;
                                if (inputElement != null) {
                                    DCDomTools.MoveCaretToEnd(inputElement.firstChild);
                                }
                                DCDomTools.completeEvent(eventObj);
                                return;
                            }
                            //标签删除属性无效
                            else if (preNode.getAttribute("dctype") == "XTextLabelElement") {
                                if (preNode.getAttribute("dc_deleteable") == "false") {
                                    // 不能被删除的标签,则移动插入点
                                    // DCDomTools.MoveCaretTo(preNode);
                                    DCDomTools.MoveCaretToIndex(preNode, 0);
                                } else {
                                    preNode.parentNode.removeChild(preNode);
                                }
                                // 不执行默认操作
                                DCDomTools.completeEvent(eventObj);
                                return;
                            }
                            //单复选框 左对齐 2019-01-11 hulijun
                            if (preNode.nodeName == "LABEL") {
                                if (preNode.getAttribute("dc_deleteable") == "false") {
                                    // 不能被删除的标签,则移动插入点
                                    // DCDomTools.MoveCaretTo(preNode);
                                    DCDomTools.MoveCaretToIndex(preNode, 0);
                                } else {
                                    if(preNode.getAttribute("dctype")=="XTextCheckBoxElementBaseLabel"){
                                        // 20200918 xym 修复单复选框无法删除完全的问题
                                        var _node = preNode.previousSibling || preNode.previousElementSibling;
                                        var _nodeT = preNode.nextSibling || preNode.nextElementSibling;
                                        if (_node != null && _node.nodeType == 1 && _node.childNodes.length == 1 && _node.firstChild.nodeName == "INPUT" && _node.firstChild.id == preNode.getAttribute("for")) {
                                            var span = $("<span></span>");
                                            $(_node).replaceWith(span);
                                        }
                                        if(_nodeT != null && _nodeT.nodeType == 1 && _nodeT.childNodes.length == 1 && _nodeT.firstChild.nodeName == "INPUT" && _nodeT.firstChild.id == preNode.getAttribute("for")){
                                            var span = $("<span></span>");
                                            $(_nodeT).replaceWith(span);
                                        }
                                    }
                                    preNode.parentNode.removeChild(preNode);
                                    if (span != null && span.parent().length == 1 && span.parent()[0].childNodes.length == 1 && span.parent()[0].nodeName == "P") {
                                        span.replaceWith($("<br>"));
                                    }
                                }
                                // 不执行默认操作
                                DCDomTools.completeEvent(eventObj);
                                return;
                            }
                            
                            // 处理backspace键后输入域变成纯文本
                            if (preNode.nodeName == "P") {
                                var thisP = DCWriterControllerEditor.CurrentElement();
                                if (thisP.nodeName != "P") {
                                    thisP = $(thisP).parents("p")[0];
                                }
                                if (thisP == preNode) {//在当前行中，执行默认操作
                                    return;
                                }
                                if (preNode.innerText.replace(/[\r\n]/g, "") == "") {
                                    $(preNode).remove();
                                    return false;
                                }
                                if (thisP.innerText && thisP.innerText.replace(/[\r\n]/g, "") == "") {
                                    $(thisP).remove();
                                    DCInputFieldManager.FocusAdjacent("afterEnd", preNode);
                                    return false;
                                }
                                DCInputFieldManager.FocusAdjacent("afterEnd", preNode);
                                while (thisP.firstChild != null) {
                                    preNode.appendChild(thisP.firstChild);
                                }
                                $(thisP).remove();
                                return false;
                            }
                        }
                    }
                    if (eventObj.keyCode == 46 && sel.isCollapsed == true) {
                        // 处理delete键
                        var sel = DCSelectionManager.getSelection();
                        var nextNode = sel.GetNextNode();
                        if (nextNode.nodeName == "#text") {
                            nextNode = nextNode.parentNode;
                        }
                        //WYC20191018：右边要删除的是上下标，需要特别处理
                        if (nextNode.nodeName === "SUB" || nextNode.nodeName === "SUP") {
                            if (nextNode.innerText.length == 1) {//上下标只有一个字，照常复制字体
                                if (nextNode.previousSibling.nodeName == "#text") {
                                    nextNode.style.fontSize = nextNode.previousSibling.parentNode.style.fontSize;
                                } else {
                                    nextNode.style.fontSize = nextNode.previousSibling.style.fontSize;
                                }
                            } else {
                                //右边的上下标内字符不只一个，需要特殊处理
                            }
                        }

                        //单复选框 右对齐 2019-01-11 hulijun
                        if (nextNode.nodeName == "LABEL") {
                            if (nextNode.getAttribute("dc_deleteable") == "false") {
                                // DCDomTools.MoveCaretTo(nextNode);
                                DCDomTools.MoveCaretToIndex(nextNode, 0);
                            } else if(nextNode.getAttribute("dctype") == "backgroundtext") {//20200811 xym 处理delete遇到输入域背景文字时
                                DCDomTools.MoveCaretToIndex($(nextNode).next()[0], 0);
                            } else{
                                nextNode.parentNode.removeChild(nextNode);
                            }
                            // 不执行默认操作
                            DCDomTools.completeEvent(eventObj);
                            return;
                        }
                        if (nextNode.nodeName == "SPAN") {
                            //单复选框 右对齐 2019-01-11 hulijun
                            var firstChild = nextNode.firstChild;
                            if (firstChild && firstChild.nodeName == "INPUT") {
                                if (firstChild.getAttribute("dc_deleteable") == "false") {
                                    // DCDomTools.MoveCaretTo(nextNode);
                                    DCDomTools.MoveCaretToIndex(nextNode, 0);
                                } else {
                                    nextNode.parentNode.removeChild(nextNode);
                                }
                                // 不执行默认操作
                                DCDomTools.completeEvent(eventObj);
                                return;
                            }
                        }
                        //处理标签删除问题
                        if (nextNode.nodeName == "P" && nextNode.firstChild.getAttribute && nextNode.firstChild.getAttribute("dctype") == "XTextLabelElement") {
                            nextNode = nextNode.firstChild;
                        }
                        if (nextNode != null && nextNode.getAttribute) {
                            //标签删除属性无效
                            if (nextNode.getAttribute("dctype") == "XTextLabelElement") {
                                if (nextNode.getAttribute("dc_deleteable") == "false") {
                                    // 不能被删除的标签,则移动插入点
                                    // DCDomTools.MoveCaretTo(nextNode);
                                    DCDomTools.MoveCaretToIndex(nextNode, 0);
                                } else {
                                    nextNode.parentNode.removeChild(nextNode);
                                }
                                // 不执行默认操作
                                DCDomTools.completeEvent(eventObj);
                                return;
                            }

                            if (DCInputFieldManager.IsInputFieldElement(nextNode) == true) {
                                var nextNode2 = sel.GetNextNode();
                                if (nextNode != nextNode2) {
                                    // 在文本输入域之中
                                }
                                else {
                                    // 后面紧跟着一个输入域，则进入这个输入域
                                    // 20191128 xuyiming 表单模式下不删除直接子输入域
                                    if (DCWriterControllerEditor.IsFormView() == true) {
                                        var isContenteditable = nextNode.getAttribute("contenteditable");
                                        if (isContenteditable && isContenteditable.toLowerCase() == "true") {
                                            DCDomTools.MoveCaretToEnd(nextNode.firstChild);
                                        } else {
                                            // 删除输入域
                                            nextNode.parentNode.removeChild(inputElement);
                                        }
                                    } else if (nextNode.getAttribute("dc_deleteable") == "false") {
                                        if (nextNode.getAttribute("dc_contentreadonly") && nextNode.getAttribute("dc_contentreadonly").toLowerCase() == "true") {
                                            //只读输入域，不移动插入点
                                        } else {
                                            // 不能被删除的标签,则移动插入点
                                            DCDomTools.MoveCaretToEnd(nextNode.firstChild);
                                        }
                                    } else {
                                        // 删除输入域
                                        nextNode.parentNode.removeChild(nextNode);
                                    }
                                    DCDomTools.completeEvent(eventObj);
                                    return;
                                }
                            }
                            var inputElement = nextNode.parentNode;
                            if (inputElement != null) {
                                var isDeleteable = inputElement.getAttribute("dc_deleteable") != "false";
                                if (nextNode.getAttribute("dctype") == "start") {
                                    // 在一个输入域的前置边界元素之前，则移动到输入域内部
                                    DCDomTools.MoveCaretToEnd(inputElement.firstChild);
                                    DCDomTools.completeEvent(eventObj);
                                    return;
                                }
                                else if (nextNode.getAttribute("dctype") == "backgroundtext") {
                                    // 遇到背景文字则移动插入点
                                    // DCDomTools.MoveCaretTo(inputElement.lastChild);
                                    DCDomTools.MoveCaretToIndex(inputElement.lastChild, 0);
                                    //// 在背景文字元素之前
                                    //if (isDeleteable == false) {
                                    //    // 不能被删除的输入域,则移动插入点
                                    //    DCDomTools.MoveCaretTo(inputElement.lastChild);
                                    //}
                                    //else {
                                    //    // 删除输入域
                                    //    inputElement.parentNode.removeChild(inputElement);
                                    //}
                                    DCDomTools.completeEvent(eventObj);
                                    return;
                                }
                                else if (nextNode.getAttribute("dctype") == "end") {
                                    // 在输入域后置边界元素之前
                                    if (isDeleteable == false
                                        || DCInputFieldManager.IsEmptyInputFieldElement(inputElement) == false) {
                                        // 被标记为不能删除的输入域,或者有内容的输入域，则移动插入点
                                        DCDomTools.MoveCaretToEnd(inputElement);
                                    }
                                    else {
                                        // 20191128 xuyiming 表单模式下不删除直接子输入域
                                        if (DCWriterControllerEditor.IsFormView() == true) {
                                            var isContenteditable = inputElement.getAttribute("contenteditable");
                                            if (isContenteditable && isContenteditable.toLowerCase() == "true") {
                                                DCDomTools.MoveCaretToEnd(inputElement);
                                            } else {
                                                // 删除输入域
                                                inputElement.parentNode.removeChild(inputElement);
                                            }
                                        } else {
                                            // xym 20200811 处理输入域删除后当前行为空时的情况
                                            var pNode = $(inputElement).parent();
                                            if (pNode[0] != null && pNode[0].nodeName == "P" && pNode[0].childNodes.length == 1) {
                                                $(inputElement).replaceWith($("<br>"));
                                            } else {
                                                $(inputElement).remove();
                                            }
                                            // inputElement.parentNode.removeChild(inputElement);
                                        }
                                    }
                                    DCDomTools.completeEvent(eventObj);
                                    return;
                                }
                            }
                        }
                    }

                    if (sel.isCollapsed == true) {
                        // 处于单独选择模式
                        var c3 = sel.startContainer;
                        while (c3 != null) {
                            if (c3.nodeName == "SPAN" && c3.childNodes.length == 0) {
                                // 在FIREFOX的少数情况下出现空白的SPAN元素，则删除掉。
                                c3.removeNode();
                            }
                            if (c3.nodeName != "#text") {
                                break;
                            }
                            c3 = c3.parentNode;
                        } //while
                    }
                    if (document.IsLogicDelete == true) {
                        // 逻辑删除状态******************************
                        var bolIsDeletedKey = eventObj.keyCode == 46;
                        var deletedNodes = null;
                        var bolisCollapsed = sel.isCollapsed;
                        if (sel.isCollapsed) {
                            // 没有选中任何内容，则删除插入点处的一个字符
                            deletedNodes = new Array();
                            var node = sel.currentContainer;
                            var index = sel.currentOffset;
                            var currentOffset = sel.currentOffset;
                            function SearchPreviousContent(startNode) {
                                while (startNode != null) {
                                    if (startNode.nodeName == "#text") {
                                        if (startNode.parentNode.getAttribute("dcignore") != "1") {
                                            currentOffset = startNode.length;
                                            break;
                                        }
                                    }
                                    //if (startNode.getAttribute && startNode.getAttribute("dcignore") == "1") {
                                    //    // 遇到忽略的元素
                                    //    startNode = DCDomTools.GetAbspreviousSibling(startNode);
                                    //}
                                    //else {
                                        startNode = DCDomTools.GetAbspreviousSiblingIncludeSubNodes(startNode);
                                    //}
                                }
                                return startNode;
                            }
                            if (bolIsDeletedKey == false && node.nodeName == "#text" && currentOffset == 0) {
                                // backspace键，而且在一个文本块最前面，则删除文本节点之前的内容。
                                node = SearchPreviousContent(node);
                            }
                            else if (node.nodeName != "#text") {
                                
                                // 不是文本节点
                                if (bolIsDeletedKey) {
                                    // 遇到Delete键,则找到插入点后面的第一个可以操作的文本元素
                                    while (node != null) {
                                        if (node.nodeName == "#text") {
                                            break;
                                        }
                                        if (node.nodeName == "IMG") {
                                            // 图片元素

                                        }
                                        if (node.getAttribute && node.getAttribute("dcignore") == "1") {
                                            // 遇到忽略的元素
                                            node = DCDomTools.GetAbsNextSibling(node);
                                        }
                                        else {
                                            node = DCDomTools.GetAbsNextSiblingIncludeSubNode(node);
                                        }
                                    }//while
                                }
                                else {
                                    if (node.getAttribute && node.getAttribute("dctype") == "end") {
                                        //debugger;
                                    }
                                    //console.log(node.outerHTML);
                                    // 遇到backspace键，则找到插入点前面到第一个可以操作的文本节点
                                    node = SearchPreviousContent(node);
                                    //console.log("222:" + node.nodeName + " #" + node.nodeValue);
                                }
                            }
                            if (node != null && node.nodeName == "#text" && currentOffset > 0) {
                                // 插入点位于一个文本节点中间，则拆分文本节点。
                                if (bolIsDeletedKey) {
                                    // Delete键，删除光标之后的一个字符。
                                    if (currentOffset == node.length) {
                                        // 插入点紧跟在一个文本节点后面，则找到下一个节点
                                        var nodes = DCDomTools.GetNextNodes(node, 10);
                                        for (var iCount = 0; iCount < nodes.length; iCount++) {
                                            var node2 = nodes[iCount];
                                            if (node2.nodeName == "#text") {
                                                if (node2.length > 1) {
                                                    node2.splitText(1);
                                                }
                                                deletedNodes.push(node2);
                                                break;
                                            }
                                            else if (node2.nodeName == "IMG") {
                                                deletedNodes.push(node2);
                                                break;
                                            }
                                        }//for
                                    }
                                    else {
                                        var node2 = node.splitText(currentOffset);
                                        if (node2.length > 1) {
                                            node2.splitText(1);
                                        }
                                        deletedNodes.push(node2);
                                    }
                                }
                                else {
                                    // Backspace键，删除光标之前的一个字符。
                                    var node2 = node.splitText(currentOffset);
                                    if (node.length > 1) {
                                        // 文字长度超过1，则再次分割
                                        node = node.splitText(node.length - 1);
                                    }
                                    deletedNodes.push(node);
                                }
                            }
                        }
                        else {
                            deletedNodes = DCDomTools.GetSelectionNodes();
                        }
                        if (deletedNodes != null && deletedNodes.length > 0) {
                            DCDropdownControlManager.CloseDropdownControl();
                            var newFocusNode = null;
                            for (var iCount = 0; iCount < deletedNodes.length; iCount++) {
                                var node = deletedNodes[iCount];
                                var canDelete = true;
                                if (node.parentNode != null) {
                                    if (node.parentNode.getAttribute("dcignore") == "1") {
                                        // 被忽略的元素不逻辑删除
                                        canDelete = false;
                                    }
                                    else if (DCDomTools.StartsWith( node.parentNode.className , "DCLogicDeleted")) {
                                        // 已经被逻辑删除的内容不能重复逻辑删除
                                        canDelete = false;
                                    }
                                }
                                if (canDelete && node.nodeName == "#text") {
                                    // 设置逻辑删除标记
                                    var newNode = document.createElement("span");
                                    newNode.className = "DCLogicDeletedCurrent";
                                    //newNode.setAttribute("dcignore", "1");
                                    //newNode.setAttribute("dcdeleted", "1");
                                    newNode.title = "被删除";
                                    node.parentNode.insertBefore(newNode, node);
                                    if (node.style && node.style !== null) {//WYC:前端逻辑删除不显示痕迹了
                                        node.style.display = "none";
                                    }
                                    newNode.appendChild(node);                                    
                                }
                                if (bolIsDeletedKey || newFocusNode == null) {
                                    // Delete键
                                    newFocusNode = newNode;
                                }
                            }//for
                            if (newFocusNode != null) {
                                if (bolIsDeletedKey ) {
                                    // Delete键，光标在元素前面
                                    DCDomTools.MoveCaretToEnd(newFocusNode);
                                }
                                else {
                                    // Backspace键，光标在元素后面
                                    // DCDomTools.MoveCaretTo(newFocusNode);
                                    DCDomTools.MoveCaretToIndex(newFocusNode, 0);
                                }
                                // 记录重做、撤销信息
                                DCUndoRedo.LogUndo();
                            }
                            // 完全取消本次键盘事件的默认操作。
                            DCDomTools.completeEvent(eventObj);
                            return;
                        }
                    }
                    else {
                        window.setTimeout(
                            DCInputFieldManager.FixInputFieldElementDomForBackgroundText,
                            50);
                    }
                } // eventObj.keyCode == 8 || eventObj.keyCode == 46
                else if (eventObj.keyCode == 39 // 右光标键
                        || eventObj.keyCode == 37 // 左光标键
                        || eventObj.keyCode == 38 // 上光标键
                        || eventObj.keyCode == 40// 下光标键
                        || eventObj.keyCode == 35 // End
                        || eventObj.keyCode == 36 // Home
                        || eventObj.keyCode == 33 // Page up
                        || eventObj.keyCode == 34 // Page down 
                        ) {
                    // 可能导致插入点发生改变的按键事件
                    var oldSel = DCSelectionManager.getSelection();

                }
                else if (eventObj.altKey == false
                    && eventObj.ctrlKey == false
                    && eventObj.shiftKey == false) {

                    if (eventObj.keyCode >= 32 && eventObj.keyCode <= 126) {
                        // 输入普通字符
                        var sel = DCSelectionManager.getSelection();
                        var field = sel.GetCurrentInputField();
                        if (field != null && DCInputFieldManager.IsBackgroundTextVisible(field)) {
                            if (typeof (window.TH_UpdateBackground) == "number") {
                                window.clearTimeout(window.TH_UpdateBackground);
                            }
                            window.TH_UpdateBackground = window.setTimeout(function () {
                                DCInputFieldManager.FixInputFieldElementDomForBackgroundText(field);
                            },
                            100);
                        }
                        else if (eventObj.keyCode > 256) {

                        }
                    }
                }
                switch (eventObj.keyCode) {

                }
            });


            //            $(document.body).on("mousemove", function (eventObj) {
            //                eventObj = FixEventObject(eventObj);
            //                if (WriterCommandModuleTable.HandleMouseEvent(eventObj, 0) == true) {
            //                    return;
            //                }
            //            });

            //            $(document.body).on("mousedown", function (eventObj) {
            //                eventObj = FixEventObject(eventObj);
            //                if (WriterCommandModuleTable.HandleMouseEvent(eventObj, 1) == true) {
            //                    return;
            //                }
            //            });

            //            $(document.body).on("mouseup", function (eventObj) {
            //                eventObj = FixEventObject(eventObj);
            //                if (WriterCommandModuleTable.HandleMouseEvent(eventObj, 2) == true) {
            //                    return;
            //                }
            //            });
            if (document.getElementById("divDocumentBody_0") != null) {
                $(document.body).on("click", function () {
                    DCSelectionManager.UpdateSelectionChangedForClick();
                });
            }


            var SetFrameHeightForAutoHeight = null;

            // 用户正在处理窗体大小改变事件
            var bolHandingResizeEvent = false;
            var resizeRootElement = document.getElementById("dctable_AllContent");
            if (resizeRootElement == null) {
                resizeRootElement = document.getElementById("divAllContainer");
                if (resizeRootElement != null) {
                    resizeRootElement = resizeRootElement.parentNode;
                }
            }
            // 是否为移动设备
            var bolIsMobileDevice = document.body.getAttribute("ismobiledevice") == "true";
            if (resizeRootElement != null
                && bolIsMobileDevice
                && document.body.getAttribute("autoheightinmobiledevice") == "true"
                && window.frameElement != null) {
                // 设置外置框架元素的高度为文档内容高度。
                SetFrameHeightForAutoHeight = function (setFlag) {
                    var frame = window.frameElement;
                    if (frame != null) {
                        if (setFlag != false) {
                            bolHandingResizeEvent = true;
                        }
                        var h = 0;
                        if (resizeRootElement != null) {
                            var element = resizeRootElement.lastChild;
                            if (element.tagName) {
                                h = element.offsetTop + element.offsetHeight + 3;
                            }
                        }
                        if (resizeRootElement.scrollHeight > 10) {
                            //var h = resizeRootElement.scrollHeight + 3;
                            if (typeof (document.body.zoomRate) == "number") {
                                h = h * document.body.zoomRate;
                            }
                            h = h + 3;
                            frame.style.height = h + "px";
                            if (setFlag != false) {
                                window.setTimeout(function () { bolHandingResizeEvent = false; }, 100);
                            }
                        }
                    }
                }
                window.setInterval(SetFrameHeightForAutoHeight, 500);
            }
            document.body.zoomRate = 1.0;
            if (document.body.getAttribute("autozoom") == "true") {
                // 启用自动缩放视图来填满宽度
                if (resizeRootElement != null) {

                    function GetWindowClientWith() {
                        return window.innerWidth;
                    }
                    resizeRootElement.nativeWidth = resizeRootElement.scrollWidth + 10;
                    function window_OnResize() {
                        if (resizeRootElement.style.display == "none") {
                            return;
                        }
                        //                        //                        alert(window.screen.orientation);
                        //                        //                        if (window.screen.orientation) {
                        //                        //                            alert(window.screen.orientation.angle);
                        //                        //                        }
                        //                        //alert(bolHandingResizeEvent);
                        //                        //alert("zzz:" + window.innerWidth);
                        //                        if (bolHandingResizeEvent == true) {
                        //                            //                            var w = GetWindowClientWith();
                        //                            //                            if (typeof (window.lastWidth) == "number") {
                        //                            //                                w = window.lastWidth / w;
                        //                            //                                if (w > 1.3 || w < 0.7) {
                        //                            //                                    // 宽度发生了巨大的变化，突破这个限制
                        //                            //                                }
                        //                            //                                else {
                        //                            //                                    return;
                        //                            //                                }
                        //                            //                            }
                        //                            //                            else {
                        //                            //                                return;
                        //                            //                            }
                        //                            return;
                        //                        }
                        //                        //alert("rrrrr" + bolRunning);
                        //                        bolHandingResizeEvent = true;
                        var funcResze = function () {
                            window.tmrResize = null;
                            var width = GetWindowClientWith();

                            if (width > 0) {
                                width = width - 16;
                                var rate = width * 1.0 / resizeRootElement.nativeWidth;
                                if (rate <= 0) {
                                    //rate = 1;
                                }
                                //if (bolIsMobileDevice == true) {
                                var st = document.body.style;
                                st.zoom = rate;
                                if (st.setProperty) {
                                    st.setProperty("-moz-transform", "scale(" + rate + ")");
                                    st.setProperty("-moz-transform-origin", "top center");
                                    st.setProperty("transform-origin", "top center");
                                }
                                //                                }
                                //                                else {
                                //                                    var st = resizeRootElement.style;
                                //                                    st.zoom = rate;
                                //                                    if (st.setProperty) {
                                //                                        st.setProperty("-moz-transform", "scale(" + rate + ")");
                                //                                        st.setProperty("-moz-transform-origin", "top center");
                                //                                    }
                                //                                }
                                document.body.zoomRate = rate;
                                //$("#lblDCWebWriterControlControlInfo").text(rate);
                                //alert(width + "   Rate:" + rate);
                            }
                            resizeRootElement.style.display = "";
                            if (SetFrameHeightForAutoHeight != null) {
                                SetFrameHeightForAutoHeight(false);
                            }
                            window.setTimeout(function () {
                                window.lastWidth = GetWindowClientWith();
                                bolHandingResizeEvent = false;
                                if (window.frameElement != null) {
                                    //window.frameElement.style.height = (rate * document.body.scrollHeight ) + "px";
                                }
                                //alert(window.innerWidth + " R:" + resizeRootElement.scrollWidth);
                            }, 100);
                            //bolRunning = false;
                        };

                        if (bolIsMobileDevice == true) {
                            // 移动设备中，需要将元素暂时隐藏一会。让浏览器自己调整一下状态。
                            //alert("hide");
                            resizeRootElement.style.display = "none";
                            //alert("hide");
                        }
                        window.setTimeout(funcResze, 200);
                    }

                    //var langspace = window.innerWidth > window.innerHeight;

                    function IslandscapeOrportrait() {
                        var Islandscape;
                        var orientation;
                        var supportOrientation = (typeof window.orientation === 'number' && typeof window.onorientationchange === 'object');
                        if (supportOrientation) {
                            orientation = window.orientation;
                            switch (orientation) {
                                case 90:
                                case -90:
                                    orientation = 'landscape';
                                    break;
                                default:
                                    orientation = 'portrait';
                                    break;
                            }
                        } else {
                            //top.window获取最顶层窗口
                            orientation = (top.window.innerWidth > top.window.innerHeight) ? 'landscape' : 'portrait';
                        }
                        if (orientation == 'landscape') {
                            Islandscape = true; //横屏
                        } else {
                            Islandscape = false; //竖屏
                        }
                        return Islandscape;
                    };

                    var currentIslandscapeOrportrait = null;
                    $(window).on("resize", function () {
                        if (bolIsMobileDevice == true) {
                            // 移动设备中
                            var io = IslandscapeOrportrait();
                            //alert(io);
                            if (currentIslandscapeOrportrait == null || currentIslandscapeOrportrait != io) {
                                currentIslandscapeOrportrait = io;
                                window_OnResize();
                            }
                        }
                        else {
                            // PC浏览器中
                            window_OnResize();
                        }
                        //alert("W:" + window.innerWidth + "  H:" + window.innerHeight + " Ori:" + window.orientation);
                        //                        alert(window.innerWidth + "  INNER " + window.innerHeight + "  " + window.orientation + "  SC:" + window.screen.orientation);
                        //                        return;
                        //                        if (bolIsMobileDevice == true) {
                        //                            // 对于移动设备，进行额外判断
                        //                            var newLan = window.innerWidth > window.innerHeight;
                        //                            if (newLan == langspace) {
                        //                                return;
                        //                            }
                        //                            langspace = newLan;
                        //                        }
                        //                        alert(langspace);
                    });

                    if (bolIsMobileDevice == false) {
                        // 对于非移动设备，加载文档的时候执行一次大小调整。
                        window_OnResize();
                    }
                } //if (resizeRootElement != null) 
            } //if (document.body.getAttribute("autozoom") == "true") 
        }
    }
    var item = '';
    if (window.frameElement != null) {
        document.WriterControl = window.frameElement.parentNode;
    }
    var ctl = document.WriterControl;
    if (ctl != null) {
        if (typeof (window.MouseDragScrollMode) == "boolean") {
            ctl.setMouseDragScrollMode(window.MouseDragScrollMode, window.frameElement);
        }
    }
    if (ctl != null && window.for_LoadPrintPreview != true) {
        // 计算性能指数
        ctl.serverPerformances = new Object();
        ctl.contentDocument = document;
        ctl.contentBody = document.body;
        ctl.contentWindow = window;
        if (ctl.contentBody != null) {
            // 总字符数
            ctl.serverPerformances.characters = parseInt(document.body.getAttribute("serverchars"));
            // 服务器端耗时毫秒数
            ctl.serverPerformances.serverTicks = parseInt(document.body.getAttribute("serverticks"));
            if (isNaN(ctl.totalServerTicks)) {
                //alert("zzzzzzzzzzzzz");
                ctl.serverPerformances.totalServerTicks = parseInt(document.body.getAttribute("dcservertick"));
            }
            else {
                ctl.serverPerformances.totalServerTicks = ctl.totalServerTicks;
            }
            ctl.serverPerformances.maxOnlineNumber = parseInt(document.body.getAttribute("maxonlinenumber"));
            ctl.serverPerformances.currentOnlineNumber = parseInt(document.body.getAttribute("currentonlinenumber"));
            if (isNaN(ctl.serverPerformances.characters)
                || isNaN(ctl.serverPerformances.serverTicks)) {
                ctl.serverPerformances.clientTicks = 0;
            }
            else {
                if (ctl.startTimeForLoadDocumentFormFile) {
                    var tickStart = DCDomTools.GetDateMillisecondsTick(ctl.startTimeForLoadDocumentFormFile);
                    var tick = DCDomTools.GetDateMillisecondsTick(new Date());
                    // 客户端耗时毫秒数
                    ctl.serverPerformances.clientTicks = tick - tickStart;
                }
            }
            ctl.getServerPerformances = function () {
                return ctl.serverPerformances;
            }
        }
        if (ctl.DocumentOptions != null) {
            document.Options = ctl.DocumentOptions;
        }
        if (ctl.HiddenAppProcessing) {
            ctl.HiddenAppProcessing();
        }

        // 触发子文档加载事件
        for (item in ctl) {
            if (item.indexOf('dcondocumentload_') == 0) {
                var f = ctl[item];
                if (typeof (f) == 'function') {
                    f();
                }

            }
        }

        //if (document.body.onloadRaised != true) {
            // 触发自定义的DocumentLoad事件
        //    document.body.onloadRaised = true;
            DCWriterControllerEditor.executeWriterControlEventHandler(null, "DocumentLoad");
            DCWriterControllerEditor.executeWriterControlEventHandler(null, "onDocumentLoad");
       // }

        if (DCUndoRedo && DCUndoRedo.Start) {
            DCUndoRedo.Start();
        }
        //if (ctl.DocumentLoad != null && typeof (ctl.DocumentLoad) == "function") {
        //    // 触发自定义的DocumentLoad事件
        //    ctl.DocumentLoad.call(ctl);
        //}

    }

    if (document.WriterControl != null) {
        var txt = document.body.getAttribute("statustextforwebclient");
        if (txt != null && txt.length > 0) {
            document.WriterControl.SetStatusText(txt);
        }
    }

    if (document.WriterControl != null
        && typeof (document.WriterControl.onloadconentonce) == "function") {
        var func = document.WriterControl.onloadconentonce;
        document.WriterControl.onloadconentonce = null;
        window.setTimeout(func, 50);
        //func.call(document);
    }
});
 