import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export const constantRoutes = [
  {
    path: "/",
    redirect: "index",
    component: () => import("./pages/index.vue"),
    meta: {
      title: "尚哲医健信息化软件",
      icon: "el-icon-star-off"
    },
    children: [
      {
        path: "/",
        name: "index",
        component: () => import("./pages/index.vue"),
        meta: {
          title: "工作平台",
          icon: "el-icon-s-marketing",
          affix: false
        }
      }
    ]
  },
  {
    path: "/oidc-callback",
    name: "oidcCallback",
    hidden: true,
    component: () => import("./pages/OidcCallBack.vue")
  },
  {
    path: "/oidc-callback-error",
    name: "oidcCallbackError",
    hidden: true,
    component: () => import("./pages/OidcCallbackError.vue"),
    meta: {
      isPublic: true
    }
  },
  {
    path: "/oidc-silent-renew",
    name: "oidcSilentRenew",
    hidden: true,
    component: () => import("./pages/OidcSilentRenew.vue"),
    meta: {
      isPublic: true
    }
  }
];

const fnCreateRouter = () =>
  new Router({
    scrollBehavior: () => ({ y: 0 }),
    mode: "history",
    routes: constantRoutes
  });

const router = fnCreateRouter();
let token = sessionStorage.getItem("access_token");
router.beforeEach((to, from, next) => {
  if (!token && !to.meta.isThrough) {
    localStorage.clear();
    localStorage.setItem("clearLocalStorage", "111");
    window.location.href = "/login.html";
  }
  next();
});

export function resetRouter() {
  const newRouter = fnCreateRouter();
  router.matcher = newRouter.matcher;
}

export default router;
