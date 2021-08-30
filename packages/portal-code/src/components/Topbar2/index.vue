<template>
  <div id="title-info-bar-component" v-show="topBarHide">
    <div class="left">
      <img class="logo" src="@/assets/img/logo.png" />
      <div class="navbar">
        <slot></slot>
      </div>
    </div>
    <div class="right">
      <div class="tool">
        <span class="iconfont zuojiantou" title="返回" @click="back" v-if="backShow" />
        <span class="icon-button el-icon-arrow-up" title="隐藏" @click="hide"></span>
        <span class="iconfont quanping" title="全屏" @click="fullScreen" />
      </div>
      <div class="user">
        <span class="iconfont user" title="头像"></span>
        <span class="name">欢迎，{{userName}}</span>
        <span class="iconfont logout" title="退出" @click="logout" />
        <span @click="logout">退出</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: "topBar",
  props: {
    title: {
      default: "",
    },
    searchable: {
      default: true,
    },
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
    }),
    userName: function() {
      var info = this.userInfo;
      return (info.surname || '') + (info.name || '未知姓名');
    }
  },
  data() {
    return {
      searching: false,
      search_key: "",
      fullscreen: false,
      topBarHide: true,
      backShow: false
    };
  },
  mounted() {
  },
  updated() {
    if (this.$route.path == '/saManagement/saReport' || this.$route.path == '/saManagement/saPandect') {
        this.backShow = true;
    }else{
        this.backShow = false;
    }
  },
  methods: {
    ...mapActions({
      logoutAction: 'app/logout'
    }),
    logout() {
      this.logoutAction().then(resp => {
        localStorage.removeItem("access_token");
        window.location.href = "/login.html";
      });
    },
    back() {
      this.$router.push({
        name: "saManagement/saOverview",
      });
    },
    hide() {
      // this.topBarHide = false;
    },
    fullScreen() {
      let element = document.documentElement;
      if (this.fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullScreen) {
          element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          // IE11
          element.msRequestFullscreen();
        }
      }
      this.fullscreen = !this.fullscreen;
    },
  },
};
</script>

<style lang="scss" scoped>
#title-info-bar-component {
  width: 100%;
  height: 40px;
  padding: 0 30px;
  background-color: #1bad96;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

#title-info-bar-component .right .user::before {
  display: none;
}

#title-info-bar-component .right {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 20px;
  color: #fff;
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
  margin-left: 15px;
}
.iconfont {
  color: white;
  font-size: 16px;
  text-align: center;
  cursor: pointer;
  margin-left: 15px;
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