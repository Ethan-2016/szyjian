import Vue from 'vue';
// import Bench from './bench.vue';
import App from './App.vue'
import ElementUI from 'element-ui';
import store from '@/store';
import router from './router'

import '@/assets/themes/index.css';
import '@/assets/css/common.scss';
import './assets/css/common.scss';
import '@/assets/fonts/iconfont.css';

Vue.config.productionTip = false;

Vue.use(ElementUI);

new Vue({
    store: store,
    router: router,
    render: h => h(App),
}).$mount('#app');