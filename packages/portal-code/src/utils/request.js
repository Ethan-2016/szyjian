/**
 * Created by sushi@szyjian.com
 */
import axios from 'axios';
import qs from 'qs';
import { Message, MessageBox } from 'element-ui';
import { userManager } from '@/components/oidc';

const service = axios.create({
  // baseURL: global.baseUrl, // "http://192.168.1.162:30018/",//process.env.VUE_APP_BASE_API, // api的base uri
  timeout: 60000, // request timeout
});

// if (process.env.VUE_APP_USE_OIDC === 'true') {
//   axios.defaults.withCredentials = false;
//   service.defaults.withCredentials = false;
// }

// request interceptor
service.interceptors.request.use(
  config => {
    /**
     * 使用本地存储做请求节流（当前仅做重复提交节流）
     * 在请求参数中添加data参数 intercept
     * param intercept 是否为提交请求
     */
    // console.log(config,'------------------');
    let str = config.url.split('?')[0];
    if (str && config.data && config.method.toLocaleLowerCase() !== 'get') {
      if (config.data.intercept) {
        delete config.data.intercept;
        let requestLocalInfo = sessionStorage.getItem('requestLocal');
        let requestTime = parseInt(new Date().getTime());
        let arr = str.split('/');
        let requestLocal = arr[arr.length - 1];
        if (requestLocalInfo) {
          requestLocalInfo = JSON.parse(requestLocalInfo);
          //请求位置一致，且时间小于3秒拦截请求
          if (requestTime - requestLocalInfo.requestTime < 3000 && requestLocal === requestLocalInfo.requestLocal) {
            return;
          }
        }
        sessionStorage.setItem(
          'requestLocal',
          JSON.stringify({
            requestLocal,
            requestTime,
          })
        );
      }
    }
    if (process.env.VUE_APP_USE_OIDC === 'true') {
      // 启用OIDC后，有oidc客户端管理token
      var token = userManager.getToken() || '';
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
      } else {
        userManager.getUser().then(user => {
          if (user) {
            config.headers['Authorization'] = 'Bearer ' + user.accessToken;
          }
        });
      }
    } else {
      let token = localStorage.getItem('access_token') || '';
      // 添加Authorization
      if (token.length > 0) {
        config.headers.common.Authorization = 'Bearer ' + token;
        //将token放到请求头发送给服务器,将tokenkey放在请求头中
        config.headers['Authorization'] = 'Bearer ' + token;
      }
    }
    // 根据url给卒中请求头设置WebSite
    if(window.location.href.includes('/stroke.html#/')){
      localStorage.setItem('WebSite',0)
      config.headers['WebSite'] = 0
    }else{
      config.headers['WebSite'] =localStorage.getItem('WebSite')||''
    }
    // window.location.href.includes('/stroke.html#/') ? (config.headers['WebSite'] = 0) : console.log('凸(艹皿艹 )');

    // if (config.url.indexOf("oauth") > -1) {
    //   config.baseURL = global.authUrl;
    // }
    // if (!config.url) config.url = "";

    if (config.method.toLocaleLowerCase() === 'delete') {
      // 如果是get请求，且params是数组类型如arr=[1,2]，则转换成arr=1&arr=2
      if (config.params) {
        config.paramsSerializer = function(params) {
          return qs.stringify(params, {
            arrayFormat: 'repeat',
          });
        };
      }
    }

    //如果是get请求，则加上时间戳（到分钟）
    if (config.method.toLocaleLowerCase() === 'get') {
      if (config.data) {
        config.url += '/' + config.data;
      }
      //设定一分钟更新一次时间戳
      let timeStamp = `t=${parseInt(new Date().getTime() / (1000 * 60))}`;
      if (config.url.indexOf('?') > -1) {
        timeStamp = '&' + timeStamp;
      } else {
        timeStamp = '?' + timeStamp;
      }

      config.url += timeStamp;
    }
    return config;
  },
  error => {
    console.error('error: ', error);
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  response => {
    let res = response.data;

    if (res.data != null && res.data.accessToken !== undefined) {
      return Promise.resolve(res);
    }
    return Promise.resolve(res);
    // if (res.code === 0) {
    //   return Promise.resolve(res);
    // } else {
    //   Message({ showClose: true, message: '功能异常，请联系技术支持人员！', type: 'error', duration: 3 * 1000});
    //   return Promise.reject(response);
    // }
  },
  error => {
    // console.log("error: ", error);
    // console.log("error: ", JSON.stringify(error));
    // console.log("error: ", error.response);
    let _response = error.response;
    if (error && error.response) {
      if (_response.status == 401 && _response.statusText == 'Unauthorized') {
        //授权失败
        console.log('授权失败');
        MessageBox.alert('登录过期,需要重新登录~', '提示', {
          confirmButtonText: '重新登录',
          callback: action => {
            if (action === 'confirm' || action === 'cancel') {
              localStorage.removeItem('access_token');
              if (process.env.VUE_APP_USE_OIDC === 'true') {
              } else {
                window.location.href = '/login/login.html';
              }
            }
          },
        });
      } else if (_response.status == 500 && _response.statusText == 'Internal Server Error') {
        if (window.location.href.includes('/stroke.html#/')) {
          let msg = _response.data.Msg;
          Message({
            message: msg || '请求失败，请联系管理员',
            type: 'error',
            duration: 3000,
          });
        }
      }
      // else {
      //   var msg;
      //   if(_response.data&&Object.prototype.toString.call(_response.data)==='[object Object]'){
      //     msg =  _response.data.Msg;
      //   }
      //   Message.closeAll();
      //   Message({
      //     message: msg || "请求失败，请联系管理员",
      //     type: "error",
      //     duration: 3000,
      //   });
      // }
    }
    return Promise.reject(_response.data);
  }
);

export default service;
