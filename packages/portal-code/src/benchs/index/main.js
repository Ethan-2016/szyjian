import Vue from "vue";
import Bench from "./bench.vue";
import ElementUI from "element-ui";
import store from "@/store";
import router from "./router";
import Oidc from "@/components/oidc";

import "@/assets/themes/index.css";
import "@/assets/css/common.scss";
import "@/assets/fonts/iconfont.css";

Vue.config.productionTip = false;

Vue.use(ElementUI);
if (process.env.VUE_APP_USE_OIDC === "true") {
  Vue.use(Oidc);
}

new Vue({
  store: store,
  router: router,
  render: h => h(Bench)
}).$mount("#app");
