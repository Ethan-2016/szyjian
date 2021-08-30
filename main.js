/*
 * @Author: 吴应
 * @Date: 2021年6月11日10:16:02
 * @LastEditTime: 2021年6月11日10:16:07
 * @LastEditors: 吴应
 * @Description: In User Settings Edit
 * @FilePath: src\benchs\ecis\main.js
 */
import Vue from 'vue';
import App from './App.vue'
import ElementUI from 'element-ui';
import store from '@/store';
import router from './router';
import Ripple from 'vue-ripple-directive';
import DialogDrag from '@/utils/directives.js';

// import '@/assets/themes/index.css';
import '@/assets/fonts/iconfont.css';
import './static/css/fonts/iconfont.css';
import './static/css/theme/index.css';
import './assets/css/common.scss';

Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.directive('ripple', Ripple);
Vue.directive('dialogDrag', DialogDrag);

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');