import Vue from 'vue'
import store from '../index'
/**权限指令**/
const has = Vue.directive('has', {
  bind: function (el, binding, vnode) {
    // 获取按钮权限
    let Permissions = vnode.context.$route.meta.btnpermissions;
    console.log('permission',Permissions)
    if (!Vue.prototype.$_has(Permissions)) {
      let className=el.getAttribute("class")
      className=className.concat(" hidden")
      el.setAttribute("class",className)
    }
  }
});
// 权限检查方法
Vue.prototype.$_has = function (value) {
  let isExist = false;
  let PermissionsStr = store.getters.roles;
  if (PermissionsStr == undefined || PermissionsStr == null) {
    return false;
  }

  PermissionsStr.forEach((per)=>{
    if (value.indexOf(per) > -1) {
      isExist = true;
    }
  })
  return isExist;
};
export {has}