import request from "@/utils/request";
import qs from "qs";

// const client_id = "pc";
// const client_id = "vue.client"
const client_secret = "1q2w3e*";
const Authorization = {};

Authorization.LoginWithUsername = function(userName, password) {
  var formData = {
    client_id: "vue.client",
    // client_secret: client_secret,
    grant_type: "password",
    username: userName,
    password: password
  };
  return request({
    url: "/api/oauth/connect/token",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify(formData),
    method: "post"
  });
};

Authorization.LoginWithThirdSso = function(sso) {
  var formData = {
    client_id: "vue.client",
    grant_type: "third_sso",
    sso_token: sso
  };
  return request({
    url: "/api/oauth/connect/token",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify(formData),
    method: "post"
  });
};

Authorization.getPlatform = function() {
  return request({
    // url: '/api/identity/menuset/platformServices',
    url: "/api/identity/menu/platforms",
    method: "GET"
  });
};

Authorization.getProfile = function() {
  return request({
    // url: '/api/identity/my-profile',
    url: "/api/identity/profile/my",
    method: "GET"
  });
};

Authorization.changePassword = function(data) {
  return request({
    url: "/api/identity/my-profile/change-password",
    data: data,
    method: "POST"
  });
};

//获取签名权限
Authorization.getSignature = function(data) {
  return request({
    url: "/api/identity/users/signature/fetch",
    data,
    method: "POST"
  });
};
export default Authorization;
