/**
 * @author 苏适
 * @description 系统全局状态管理
 */
import Authorization from "@/api/auth";

let app = {
  state: {
    // isLogin: false,
    token: null, // 当前登录用户使用的令牌
    userInfo: {}, // 当前登录的用户基本信息
    // userName: '',
    // userRole: '',
    workBenches: [] // 当前用户所拥有的模块（一级菜单）.
  },

  getters: {
    // 当前用户是否已经登录，通过令牌进行判断，有令牌则已经登录，否则没有登录
    isLogin(state, getter, rootState) {
      let t = state.token ?? "";
      if (t) return true;
      return false;
    },

    // 当前登录用户的令牌
    userToken(state, getter) {
      return state.token;
    },

    // 当前用户基本信息
    userInfo(state, getter) {
      return state.userInfo;
    },

    // 当前用户的模块（一级菜单）
    workBenches(state, getter) {
      return state.workBenches;
    }
  },

  mutations: {
    // 设置当前用户的令牌
    ["app/token"]: (state, value) => {
      state.token = value;
    },
    // 设置当前登录用户基本信息
    ["app/userInfo"]: (state, value) => {
      state.userInfo = value;
    },
    // 设置当前用户的模块（一级菜单）
    ["app/workBenches"]: (state, value) => {
      state.workBenches = value;
    }
    // SET_LOGIN_STATE: (state, value) => {
    //   state.isLogin = value;
    // },
    // SET_TOKEN: (state, token) => {
    //   state.token = token;
    // },
    // SET_USERNAME: (state, name) => {
    //   state.userName = name;
    // },
    // SET_USEROLE: (state, role) => {
    //   state.userRole = role;
    // },
    // SET_PROFILE: (state, value) => {
    //   state.userInfo = value;
    // },
    // SET_WORKBENCHES: (state, benches) => {
    //   state.workBenches = benches;
    // },
    // SET_MENU: (state, value) => {
    //   state.platformData = value;
    // }
  },

  actions: {
    // 用户登录
    ["app/user/login"]({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        Authorization.LoginWithUsername(userInfo.userName, userInfo.password)
          .then(resp => {
            commit("app/token", resp.access_token); // 保存用户已经登录的令牌
            // commit('SET_LOGIN_STATE', true);
            // commit('SET_TOKEN', resp.access_token);
            // commit('SET_USERNAME', resp.data[0].userName);
            // commit('SET_USEROLE', resp.data[0].roleName);
            localStorage.setItem("access_token", resp.access_token);
            sessionStorage.setItem("access_token", resp.access_token);
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    // 获取用户基本信息
    ["app/user/profile"]({ commit }) {
      console.info("loading user profile");
      return new Promise((resolve, reject) => {
        Authorization.getProfile()
          .then(resp => {
            // commit('SET_PROFILE', resp);
            console.log(resp, 1111111111111111111);
            commit("app/userInfo", resp);
            resolve(resp);
          })
          .catch(err => {
            reject(err);
          });
      });
    },

    // 获取用户的模块（一级菜单）
    ["app/user/platforms"]({ commit }) {
      return new Promise((resolve, reject) => {
        Authorization.getPlatform()
          .then(resp => {
            commit("app/workBenches", resp.items);
            resolve(resp);
          })
          .catch(err => {
            reject(err);
          });
      });
    },

    // 登出,清空令牌和当前的用户基本信息
    ["app/logout"]({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state === null) reject();
        // commit('SET_TOKEN', '');
        commit("app/token", "");
        commit("app/userInfo", {});
        commit("app/workBenches", []);
        localStorage.removeItem("access_token");
        resolve();
      });
    }
  }
};

export default app;
