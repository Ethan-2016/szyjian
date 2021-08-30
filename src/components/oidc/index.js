import store from '@/store';
import Oidc from 'oidc-client';
import { oidcSettings } from '@/config/oidc';

Oidc.Log.logger = window.console;
// Oidc.Log.level = Oidc.Log.DEBUG;

const userManager = new Oidc.UserManager(oidcSettings);

userManager.setToken = function(token) {
  sessionStorage.setItem('token', token);
}

userManager.getToken = function() {
  return sessionStorage.getItem('token');
}

userManager.events.addUserLoaded(function(user) {
  userManager.setToken(user.access_token);
  store.commit('SET_LOGIN_STATE', true);
});

userManager.events.addUserUnloaded(function() {
  store.commit('SET_LOGIN_STATE', false);
  sessionStorage.removeItem('token');
})

export default {
  install: function(Vue) {
    Vue.prototype.$oidc = userManager;
  }
}

export { userManager };