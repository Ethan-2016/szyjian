let Authorize = {};

/*登录*/ 
Authorize.login = function(params) {
	return API.POST( "/ims/login" , params);
}

/*获取登录用户信息*/ 
Authorize.getLoginUserInfo = function(params) {
	return API.GET( "/ims/authorize/info" , {params: params});
}