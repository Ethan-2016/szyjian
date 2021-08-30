// const authorityConfig = {
//   authority: process.env.VUE_APP_AUTHORITY_SERVER,
//   client_id: 'web',
//   redirect_uri: process.env.VUE_APP_OIDC_REDIRECT_URL,
//   scope: "openid Administration",
//   response_type: 'id_token token',
//   post_logout_redirect_uri: process.env.VUE_APP_LOGOUT_REDIRECT_URL
// }
const oidcSettings = {
  authority: process.env.VUE_APP_AUTHORITY_SERVER,
  client_id: process.env.VUE_APP_CLIENTID,
  redirect_uri: process.env.VUE_APP_OIDC_CALLBACK,
  post_logout_redirect_uri: process.env.VUE_APP_LOGOUT_REDIRECT_URL,
  scope: 'openid Administration',
  response_type: 'id_token token',
  silent_redirect_uri: process.env.VUE_APP_SILENT_OIDC_CALLBACK,
  loadUserInfo: true,
}

export { oidcSettings };