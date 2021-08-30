import Vue from "vue";
import Bench from "./bench.vue";
import ElementUI from "element-ui";
import store from "@/store/index";
import global from "@/global.config";
import "@/assets/themes/index.css";
import "@/assets/css/common.scss";
import "@/assets/fonts/iconfont.css";
Vue.config.productionTip = false;
Vue.prototype.waterMark = global.waterMark;
Vue.prototype.systemName = global.systemName;
Vue.prototype.hospitalLogo = global.hospitalLogo;
Vue.prototype.loginLeft = global.loginLeft;
Vue.use(ElementUI);
new Vue({
    store: store,
    render: (h) => h(Bench),
}).$mount("#app");