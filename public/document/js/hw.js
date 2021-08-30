//获取设备状态
function initHwPlugin(){

	var message = "init";
	//注册init事件，向插件请求设备状态。
	var evt = document.createEvent("CustomEvent");
	evt.initCustomEvent('hanvon_initEvent', true, false, message);
	document.dispatchEvent(evt);
	console.log('汉王');
	//监听inited事件，获取当前设备状态。
	document.addEventListener("initedEvent",function(evt){
        /*
            监听initedEvent事件获取设备初始化状态。
        */
        if(evt.detail){
            // document.getElementById("pluginapp").removeAttribute("disabled");
            // document.getElementById("pluginapp1").removeAttribute("disabled");
            // document.getElementById("pluginapp2").removeAttribute("disabled");
            console.log("设备初始化成功");
        }else{
            console.log("设备初始化失败");
        }
    });
}

function hwSign(signid, signType) {
	/*
		参数说明
		signid:页面接收签字图片数据的img元素id名称
		corp：公司名称
		pen_w:笔迹粗细设置
		pic_w：签字窗口宽
		pic_h：签字窗口高
		imageType:生成签名图片类型
		message：拼接全部参数传给chrome插件，注：分为可传不带签字图片参数也可传带签字图片参数两种方式
	*/
	var signid = signid;
	var curr_title = parent.parent.document.title;//推屏设置标志，必须参数，需要当前页面的title值。
	var corp = "";
	var pen_w = "2";//笔宽值自定义设置，取值范围：1-4，取值类型：整数
	/***********************/
	//OrgX:签名窗口弹出时显示在屏幕位置的X坐标值。
	//OrgY:签名窗口弹出时显示在屏幕位置的Y坐标值。
	//OrgX与OrgY不设置时，签名窗口弹出时，默认显示在屏幕正中间。
	/**********************/
	var OrgX = "700";
	var OrgY = "400";

	var pic_w = "550";//添加窗口关闭按钮后，建议窗体最低宽度设置为550，界面显示美观正常。
	var pic_h = "300";
	var imageType = "3";//生成签名图片的类型 1->BMP(图片数据支持2MB以下), 2->JPG, 3->PNG, 4->GIF
	var fpr_req = signType;//0--签名 1--指纹+签名， 2--- 指纹 

	var message = signid+";" + curr_title +";"+corp+";"+pen_w+";"+ OrgX + ";"+ OrgY + ";"+pic_w+";"+pic_h+";"+imageType + ";" + fpr_req +";";
	
	console.log('parent.document.title', parent.document.title);
	var evt = document.createEvent("CustomEvent");
	evt.initCustomEvent('hanvon_signProEvent', true, false, message);
	document.dispatchEvent(evt);
};

document.addEventListener("hanvonSigndataEvent",function(evt){
    /*
      监听hanvonSigndataEvent事件获取签名数据值。
    */
    var obj = evt.detail;
    var signimg = obj.whichsign;//签名按钮ID值
    console.log(signimg, '汉王图片');
    var signdata = obj.signdata;//签名数据
	console.log(signdata, '汉王图片');
	
	exitFullscreen();
});

document.addEventListener("hanvonEventName",function(evt) {
//     /*
//       监听hanvonEventName事件获取页面指定元素签名数据值。
//     */
//     var signimg = document.getElementById("signimg").src;
//     var signimg1 = document.getElementById("signimg1").src;
	exitFullscreen();
    console.log('回调');
});

// 全屏方法
function launchFullscreen(element) {
	if (element.requestFullscreen) {
		element.requestFullscreen()
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen()
	} else if (element.msRequestFullscreen) {
		element.msRequestFullscreen()
	} else if (element.webkitRequestFullscreen) {
		element.webkitRequestFullScreen()
	}
}

// 退出全屏
function exitFullscreen() {
	if (document.exitFullscreen) {
	 document.exitFullscreen()
	} else if (document.msExitFullscreen) {
	 document.msExitFullscreen()
	} else if (document.mozCancelFullScreen) {
	 document.mozCancelFullScreen()
	} else if (document.webkitExitFullscreen) {
	 document.webkitExitFullscreen()
	}
}