// axios.defaults.withCredentials = true;
var origin = window.location.origin;

if(window.location.pathname.indexOf('login.html')>-1){//如果在登录页,清除token
	localStorage.removeItem('Authorization');
}
if(origin.indexOf('localhost') > -1 || origin.indexOf('127.0.0.1') > -1 || origin.indexOf('192.168')){
	axios.defaults.baseURL = '/api/';	
} else {
	axios.defaults.baseURL = '/';
}
axios.defaults.timeout = '30000';
axios.create({
	headers: {
		'Content-Type': 'application/json'
	}
})
// 请求拦截器，为GET请求动态添加时间戳
axios.interceptors.request.use((config) => {
	// 添加Authorization
	if (localStorage.getItem('access_token')) {
		config.headers.common.Authorization = 'Bearer ' + localStorage.getItem('access_token')
	}
	//如果是get请求，则加上时间戳（到分钟）
	if (config.method.toLocaleLowerCase() === 'get') {
		//设定一分钟更新一次时间戳
		let timeStamp = `t=${parseInt(new Date().getTime()/(1000 * 60))}`;
		if (config.url.indexOf('?') > -1) {
			timeStamp = '&' + timeStamp;
		} else {
			timeStamp = '?' + timeStamp;
		}
		config.url += timeStamp;
	}
	return config;
}, error => {
	Message({
		showClose: true,
		message: '请求出错，请检查重试', // error,
		type: 'error'
	});
	return Promise.reject(error);
});

// 响应拦截器，处理常见错误
axios.interceptors.response.use((response) => {
	if(response.headers.authorization && window.location.pathname.indexOf('login.html') > -1){
		localStorage.setItem('Authorization', response.headers.authorization);
	} else if (response.headers.authorization && (window.location.pathname.indexOf('nursing-record.html') > -1 || window.location.href.indexOf('/emr/index.html') > -1)){
		localStorage.setItem('checkerauth', response.headers.authorization)
	}
	if(response.data.code === '401' || response.data.code === '400'){ // token失效或错误
		try{
			localStorage.setItem('loginErr', JSON.stringify(response)+' 来自axios.js')
		}catch(err) {

		}
		var url = window.location.href;
		if(url.indexOf('/ims') > -1 && window.location.pathname.indexOf('login.html') < 0){
			window.parent.location.href = window.location.origin + '/src/pages/ims/login.html';
		} else if(url.indexOf('/qc') > -1) {
			window.parent.location.href = window.location.origin + '/src/pages/qc/login.html';
		}
	}
	if (response.result) {
		if (response.result.status != 200) {
			Message({
				showClose: true,
				message: response.result.message,
				type: 'warning'
			});
		}
		return response.result;
	}
	return response;
}, error => {
	if (error && error.response) {
		if (error.response.data && error.response.data.message) {
			error.message = error.response.data.message;
		}
	}
	if(error.response && error.response.data.code=='401'){
		Message({
			showClose: true,
			message: '请重新登录',
			type: "error"
		});
	}else{
		Message({
			showClose: true,
			message: '请求出错，请检查重试', //error.message,
			type: "error"
		});
	}
	return Promise.reject(error);
});

var API = {};

API.POST = function(url, parameters) {
	return axios.post(url, parameters).then(res => res.data);
}

API.GET = (url, parameters) => {
	return axios.get(url, parameters).then(res => res.data);
}

API.DELETE = (url, parameters) => {
	return axios.delete(url, parameters).then(res => res.data);
}

API.PUT = (url, parameters) => {
	return axios.put(url, parameters).then(res => res.data);
}

API.PATCH = (url, parameters) => {
	return axios.patch(url, parameters).then(res => res.data);
}
