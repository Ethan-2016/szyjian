/*
 * @Author: 吴应
 * @Date: 2021年8月19日16:10:57
 * @LastEditTime: 2021年8月19日16:11:00
 * @LastEditors: 吴应
 * @Description: In User Settings Edit
 * @FilePath: src\benchs\ecis\router.js
 */
// import { isMoment } from 'moment';
import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

/* Layout */
import Layout from './layout/index.vue';
const router = new Router({
  routes: [{
      /* 急诊诊疗 */
      path: '/ecisTherap/outpatientArea',
      name: 'outpatientArea',
      component: Layout,
      redirect: '/ecisTherap/outpatientArea',
      meta: {
        title: '就诊区',
        icon: 'nursing'
      },
      children: [{
          path: '/ecisTherap/outpatientArea',
          name: 'outpatientArea',
          component: () => import('./views/ecisTherap/outpatientArea'),
          meta: {
            title: '就诊区'
          }
        },
        {
          path: '/ecisTherap/rescueArea',
          name: 'rescueArea',
          component: () => import('./views/ecisTherap/rescueArea'),
          meta: {
            title: '抢救区'
          }
        },
        {
          path: '/ecisTherap/observingArea',
          name: 'observingArea',
          component: () => import('./views/ecisTherap/observingArea'),
          meta: {
            title: '留观区'
          }
        },
        {
          path: '/ecisTherap/theraphHstory',
          name: 'theraphHstory',
          component: () => import('./views/ecisTherap/theraphHstory'),
          meta: {
            title: '就诊历史'
          }
        },
      ]
    },
    {
      /* 医生工作站 */
      path: '/doctorWorkstation/patientInformation',
      name: 'PatientInformation',
      component: Layout,
      redirect: '/doctorWorkstation/patientInformation',
      meta: {
        title: '患者主页',
        icon: 'nursing'
      },
      children: [{
          /* 患者主页 */
          path: '/doctorWorkstation/patientInformation',
          name: 'patientInformation',
          component: () => import('./views/doctorWorkstation/patientInformation'),
          meta: {
            title: '患者主页'
          }
        },
        {
          /* 医嘱开立 */
          path: '/doctorWorkstation/createOrders',
          name: 'createOrders',
          component: () => import('./views/doctorWorkstation/createOrders'),
          meta: {
            title: '医嘱开立'
          }
        },
        {
          /* 电子病历 */
          path: '/doctorWorkstation/ecisEmr',
          name: 'ecisEmr',
          component: () => import('./views/doctorWorkstation/ecisEmr'),
          meta: {
            title: '电子病历'
          }
        },
        {
          /* 用血申请 */
          path: '/doctorWorkstation/applyBlood',
          name: 'applyBlood',
          component: () => import('./views/doctorWorkstation/applyBlood'),
          meta: {
            title: '用血申请'
          }
        },
        {
          /* 手术申请 */
          path: '/doctorWorkstation/applySurgery',
          name: 'applySurgery',
          component: () => import('./views/doctorWorkstation/applySurgery'),
          meta: {
            title: '手术申请'
          }
        },
        {
          /* 会诊管理 */
          path: '/doctorWorkstation/consultationManage',
          name: 'consultationManage',
          component: () => import('./views/doctorWorkstation/consultationManage'),
          meta: {
            title: '会诊管理'
          }
        },
        {
          /* 全景视图 */
          path: '/doctorWorkstation/panoramicView',
          name: 'panoramicView',
          component: () => import('./views/doctorWorkstation/panoramicView'),
          meta: {
            title: '全景视图'
          }
        },

        {
          /* 打印中心 */
          path: '/doctorWorkstation/printCenter',
          name: 'printCenter',
          component: () => import('./views/doctorWorkstation/printCenter'),
          meta: {
            title: '打印中心'
          }
        },
        {
          /* 患者360 */
          path: '/doctorWorkstation/patient360',
          name: 'patient360',
          component: () => import('./views/doctorWorkstation/patient360'),
          meta: {
            title: '患者360'
          }
        },
      ]
    },
    {
      /* 基础配置 */
      path: '/baseSetting/ordersSetting',
      name: 'baseSetting',
      component: Layout,
      redirect: '/baseSetting/ordersSetting',
      meta: {
        title: '医嘱设置',
        icon: 'nursing'
      },
      children: [{
        path: '/baseSetting/ordersSetting',
        name: 'ordersSetting',
        component: () => import('./views/baseSetting/ordersSetting'),
        meta: {
          title: '医嘱设置'
        }
      }]
    },
  ]
});
// 出现了“Avoided redundant navigation to current location 'saSchedule'”报错
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};
// 导航守卫
// 使用 router.beforeEach 注册一个全局前置守卫，判断用户是否登陆
if (process.env.VUE_APP_USE_OIDC === 'true') {
  // 使用OIDC协议后，鉴权和权限应该交由后端控制（有可能有第三方参与），如果用户未登录或身份错误后端会返回401，如果用户未被授权会返回403
  // 所以这里不在判断用户是登录
} else {
  let token = localStorage.getItem('access_token') || '';
  router.beforeEach((to, from, next) => {
    var isRequiresAuth = to.meta.requiresAuth == null || to.meta.requiresAuth === undefined || to.meta.requiresAuth;
    if (isRequiresAuth) {
      if (token.length <= 0) {
        window.location.href = '/login.html';
      }
    }
    next();
  });
}
export default router;