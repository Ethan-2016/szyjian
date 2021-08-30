<template>
  <div id="title-info-bar-component" class="title-info-bar" v-show="topBarHide">
    <div class="left">
      <img class="logo" :src="logo" />
      <div class="navbar">
        <slot></slot>
      </div>
    </div>
    <div class="right" v-if="isLogin">
      <span class="iconfont user" title="头像"></span>
      <span class="name">欢迎，{{ userName }}</span>
      <span class="iconfont logout" title="退出" @click="logout" />
      <span class="btn-logout" @click="logout">退出</span>
    </div>
    <div class="right" v-else>
      <span class="iconfont login" @click="login"></span>
      <span class="btn-login" @click="login">登录</span>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import defaultLogo from "@/assets/img/logo.png";

export default {
  name: "topBar",
  props: {
    logo: {
      type: String,
      default: defaultLogo,
    },
    title: {
      default: "",
    },
    searchable: {
      default: true,
    },
  },
  computed: {
    // ...mapState({
    //   isLogin: (state) => state.app.isLogin,
    // }),
    ...mapGetters({
      isLogin: "isLogin",
      userInfo: "userInfo",
    }),
    userName: function () {
      var info = this.userInfo;
      // return (info.name || '无名氏');
      return (info.surname || "") + (info.name || "无名氏");
    },
  },
  data() {
    return {
      searching: false,
      search_key: "",
      fullscreen: false,
      topBarHide: true,
    };
  },
  mounted() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
    var isIE =userAgent.indexOf("compatible") > -1 &&userAgent.indexOf("MSIE") > -1 &&!isOpera; //判断是否IE浏览器
    var isIE11 = userAgent.indexOf("rv:11.0") > -1; //判断是否是IE11浏览器
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
    if (!isIE && !isEdge && !isIE11) {
      //兼容chrome和firefox
      var _beforeUnload_time = 0,
        _gap_time = 0;
      var is_fireFox = navigator.userAgent.indexOf("Firefox") > -1; //是否是火狐浏览器
      window.onunload = function () {
        _gap_time = new Date().getTime() - _beforeUnload_time;
        if (_gap_time <= 5) {
          localStorage.clear();
          localStorage.setItem('localStorageClear', 21)
        } else {
          //谷歌浏览器刷新
        }
      };
      window.onbeforeunload = function () {
        if (is_fireFox) {
          //火狐关闭执行
          localStorage.clear();
          localStorage.setItem('localStorageClear', 22)
        } else {
          //火狐浏览器刷新
        }
      };
    }
  },
  methods: {
    ...mapActions({
      logoutAction: "app/logout",
    }),
    login() {
      var cur = window.location;
      var to = `/login.html#/?returnUrl=${cur}`;
      window.location.href = to;
    },
    logout() {
      if (process.env.VUE_APP_USE_OIDC === "true") {
        this.$oidc.signoutRedirect();
      } else {
        this.logoutAction().then((resp) => {
          // localStorage.removeItem('access_token');
          localStorage.clear();
          localStorage.setItem('localStorageClear', 23)
          window.location.href = "/login.html";
        });
        // localStorage.removeItem("access_token");
        // this.$store.commit('SET_LOGIN_STATE', false);
        // window.location.href = "/login.html";
      }
    },
    // 瀏覽器關閉事件
  },
};
</script>

<style lang="scss" scoped>
#title-info-bar-component {
  // width: 100%;
  height: 40px;
  padding: 0 30px;
  background-color: #1bad96;
  // background-color: #07646B;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

#title-info-bar-component .right {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 20px;
  font-size: 14px;
  color: #fff;
  .btn-login {
    cursor: pointer;
  }
  .btn-logout {
    cursor: pointer;
  }
}

#title-info-bar-component .left {
  display: flex;
  flex-direction: row;
  align-items: center;
  .logo {
    width: 105px;
  }
}

#title-info-bar-component .right .icon-button {
  color: white;
  font-size: 24px;
  text-align: center;
  cursor: pointer;
}
.iconfont {
  font-size: 12px;
  text-align: center;
  &.user {
    border: 1px solid #fff;
    border-radius: 20px;
    padding: 2px;
    width: 14px;
  }
  &.login {
    font-weight: bold;
    font-size: 18px;
    cursor: pointer;
  }
  &.logout {
    font-weight: bold;
    font-size: 18px;
    cursor: pointer;
    padding-right: 5px;
  }
}

.name {
  padding: 0 12px;
  color: #fff;
}

#title-info-bar-component .title-search-box {
  min-width: 180px;
  width: 200px;
}
</style>

<style lang="scss">
#title-info-bar-component .right .el-input .el-input__inner {
  border-radius: 30px;
}

// .title-info-bar-component .el-menu {
//   background-color: transparent;
// }

#title-info-bar-component .el-menu.el-menu--horizontal {
  border: none;
}

#title-info-bar-component .el-menu > .el-menu-item {
  font-size: 16px;
}
</style>