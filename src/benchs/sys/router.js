
import Vue from 'vue';
import store from '@/store';
import Router from 'vue-router';
Vue.use(Router);
const router = new Router({
    routes: [
        {
            /* 权限设置 */
            path: "/",
            name: "index",
            component: () =>
                import ("./index.vue"),
            meta: {
                title: '权限设置' // 设置该路由在菜单中展示的名字
            },
            children: [
                {/* 用户管理 */
                    path: "/users",
                    name: "users",
                    component: () =>
                        import ("./views/users.vue"),
                    meta: {
                        title: '用户管理' // 设置该路由在菜单中展示的名字
                    },
                },{/* 科室人员管理 */
                    path: "/departmentStaff",
                    name: "departmentStaff",
                    component: () =>
                        import ("./views/departmentStaff.vue"),
                    meta: {
                        title: '科室人员管理' // 设置该路由在菜单中展示的名字
                    },
                },{/* 角色管理 */
                    path: "/roles",
                    name: "roles",
                    component: () =>
                        import ("./views/roles.vue"),
                    meta: {
                        title: '角色管理' // 设置该路由在菜单中展示的名字
                    },
                }, {/* 菜单管理 */
                    path: "/menus",
                    name: "menus",
                    component: () =>
                        import ("./views/menus.vue"),
                    meta: {
                        title: '菜单管理' // 设置该路由在菜单中展示的名字
                    },
                }, {/* 资源管理 */
                    path: "/resources",
                    name: "resources",
                    component: () =>
                        import ("./views/resources.vue"),
                    meta: {
                        title: '资源管理' // 设置该路由在菜单中展示的名字
                    },
                }, {/* 客户端管理 */
                    path: "/clients",
                    name: "clients",
                    component: () =>
                        import ("./views/clients.vue"),
                    meta: {
                        title: '客户端管理' // 设置该路由在菜单中展示的名字
                    },
                }, {/* API网关管理 */
                    path: "/gateway",
                    name: "gateway",
                    component: () =>
                        import ("./views/gateway.vue"),
                    meta: {
                        title: 'API网关管理' // 设置该路由在菜单中展示的名字
                    },
                },{/* 科室管理 */
                    path: "/dept",
                    name: "dept",
                    component: () =>
                        import ("./views/dept.vue"),
                    meta: {
                        title: '科室管理' // 设置该路由在菜单中展示的名字
                    },
                },{/* 文书管理 */
                    path: "/instrument",
                    name: "instrument",
                    component: () =>
                        import ("./views/instrument.vue"),
                    meta: {
                        title: '文书管理' // 设置该路由在菜单中展示的名字
                    },
                }
            ],
        }
    ],
});
// 出现了“Avoided redundant navigation to current location 'saSchedule'”报错
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
};
// 导航守卫
// 使用 router.beforeEach 注册一个全局前置守卫，判断用户是否登陆
if (process.env.VUE_APP_USE_OIDC === 'true') {
    // 使用OIDC协议后，鉴权和权限应该交由后端控制（有可能有第三方参与），如果用户未登录或身份错误后端会返回401，如果用户未被授权会返回403
    // 所以这里不在判断用户是登录
} else {
    let token = localStorage.getItem("access_token") || '';
    router.beforeEach((to, from, next) => {
        var isRequiresAuth = to.meta.requiresAuth == null || to.meta.requiresAuth === undefined || to.meta.requiresAuth;
        if (isRequiresAuth) {
            if ((token).length <= 0) {
                window.location.href = '/login.html';
            }
        }
        next()
    })
}

export default router;