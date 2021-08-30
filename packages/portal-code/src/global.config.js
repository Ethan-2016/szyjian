const baseUrl = "http://192.168.1.162:30001/";
// const baseUrl = "http://106.14.76.41:16233/"; // 远程地址
const waterMark = "尚哲医健";
const systemName = "急危重症一体化平台";
const hospitalLogo = "logo2.png";
const loginLeft = "left-login.png";
const websiteLogo = process.env.VUE_APP_WEBSITE_LOGO
const websiteTitle = process.env.VUE_APP_WEBSITE_TITLE
//是否启用设备采集时间，默认执行时间戳
const takeTime = false;
// OpenID认证服务器配置
const authorityConfig = {
  authority: process.env.VUE_APP_AUTHORITY_SERVER,
  client_id: 'web',
  redirect_uri: process.env.VUE_APP_OIDC_REDIRECT_URL,
  scope: "openid Administration",
  response_type: 'id_token token',
  post_logout_redirect_uri: process.env.VUE_APP_LOGOUT_REDIRECT_URL
}

export default {
  baseUrl,
  takeTime,
  waterMark,
  systemName,
  hospitalLogo,
  loginLeft,
};

export { authorityConfig }
