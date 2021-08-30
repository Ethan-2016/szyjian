<template>
  <div id="title-info-bar-component" v-show="topBarHide">
    <div class="main-nav">
      <div class="left">
        <div class="menu-box" @click="displayMenu = !displayMenu">
          <img class="menu" src="@/assets/img/menu.png" />
          <span class="title" v-if="titleVisible">
            <!--{{ currentSecondaryMenu | title(secondaryMenus) }}-->
            {{ activeSecMenus }}
          </span>
        </div>
        <slot name="main-nav-left"></slot>
      </div>
      <div class="right">
        <!-- <span
          class="icon-button el-icon-arrow-up"
          title="隐藏"
          @click="hide"
        ></span> -->
        <span
          class="iconfont close_icon"
          title="返回平台页"
          @click="backToHome"
          v-if="showBackTop"
        />
        <span class="iconfont fanhui" title="返回上一页" @click="back" />
        <span
          class="iconfont fangda"
          title="全屏"
          @click="fullScreen"
          v-if="!fullscreen"
        />
        <span
          class="iconfont suoxiao"
          title="全屏"
          @click="fullScreen"
          v-else
        />
        <el-popover
          placement="bottom"
          width="80"
          trigger="hover"
          class="user-pop"
        >
          <span class="iconfont logout" title="退出" @click="logout">退出</span>

          <span class="iconfont touxiang-1" title="头像" slot="reference">{{
            userName
          }}</span>
        </el-popover>
      </div>
    </div>
    <div
      class="nav-container"
      v-show="displayMenu"
      @click="displayMenu = !displayMenu"
    >
      <!-- <a class="nav-btn" @click="backToHome">首页</a> -->
      <a
        class="nav-btn"
        @click="jumpTo(route, 'second')"
        :class="{ active: activeSecMenus == route.displayName }"
        v-for="(route, index) in secondaryMenus"
        :key="index"
      >
        <img
          :src="
            $route.path.indexOf(route.displayName) !== 1
              ? require('@/benchs/icis/assets/img/icons/' +
                  route.icon +
                  '-active.png')
              : require('@/benchs/icis/assets/img/icons/' + route.icon + '.png')
          "
          v-if="route.icon"
          :alt="route.displayName"
        />
        {{ route.displayName }}
      </a>
    </div>
    <div class="subnav-container" v-if="showThirdMenu">
      <a
        class="subnav-btn"
        :class="{ active: $route.meta.title == route.displayName }"
        v-for="(route, index) in thirdMenus"
        :key="index"
        @click="jumpTo(route, 'third')"
      >
        {{ route.displayName }}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "topBar",
  props: {
    searchable: {
      default: true,
    },
    titleVisible: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    // currentSecondaryMenu() {
    // $route: {
    //     immediate: true,
    //     handler: function (to, from) {
    //         // var m = this.secondaryMenus.filter(m => m.id == this.currentSecondaryMenu);
    //         let len = this.secondaryMenus.length
    //         let name;
    //         for (let i = 0; i < len; i++) {
    //             if (this.isHasRouteName(this.secondaryMenus[i])) {
    //                 name = this.secondaryMenus[i].name;
    //                 break;
    //             }
    //         }
    //         var m = this.secondaryMenus.filter(m => m.name == name);
    //         if (m.length == 0) {
    //             this.thirdMenus = [];
    //         } else {
    //             if (m[0].enabled == true) {
    //                 if (m[0].children.length > 0) {
    //                     this.showThirdMenu = true;
    //                 } else {
    //                     this.showThirdMenu = false;
    //                 }
    //                 this.thirdMenus = m[0].children;
    //             } else {
    //                 this.thirdMenus = [];
    //             }
    //         }
    //         console.info('currentSecondaryMenu', this.secondaryMenus, m, this.thirdMenus, name);
    //     }
    // }
  },
  computed: {
    userName() {
      var info = this.$store.state.app.userInfo;
      return (info.surname || "") + (info.name || "无名氏");
    },
    activeSecMenus() {
      return this.getActiveSecMenus(this.secondaryMenus);
    },
    thirdMenus() {
      let thirdMenus = [];
      let name = this.getActiveSecMenus(this.secondaryMenus);
      var m = this.secondaryMenus.filter((m) => m.name == name);
      if (m.length == 0) {
        thirdMenus = [];
      } else {
        if (m[0].enabled == true) {
          if (m[0].children.length > 0) {
            this.showThirdMenu = true;
          } else {
            this.showThirdMenu = false;
          }
          thirdMenus = m[0].children;
        } else {
          thirdMenus = [];
        }
      }
      return thirdMenus;
    },
  },
  mounted() {
    let m = this.$store.state.sys.ownerMenus.filter(
      (m) => m.id == localStorage.getItem("currentPlatform")
    );
    if (m.length === 0) return;
    this.secondaryMenus = m[0].children;
    // console.log('this.secondaryMenus', this.secondaryMenus);
    this.currentSecondaryMenu =
      localStorage.getItem("currentSecondaryMenu") || "";
    if (this.currentSecondaryMenu) {
    } else {
      this.currentSecondaryMenu = this.secondaryMenus[0].id;
    }
  },
  created() {
    if (this.$store.state.app.workBenches.length > 1) {
      this.showBackTop = true;
    }
  },
  filters: {
    checkHTML(val) {
      return val.substr(-4);
    },
    title(val, menus) {
      console.log("filters", val, menus);
      let m = menus.filter((m) => m.id == val);
      if (m.length == 0) return "";
      return m[0].name;
    },
  },
  data() {
    return {
      searching: false,
      search_key: "",
      fullscreen: false,
      topBarHide: true,
      isActive: true,
      displayMenu: false,
      showBackTop: false,
      showThirdMenu: true,
      secondaryMenus: [], // 二级菜单
      currentSecondaryMenu: "",
      // thirdMenus: [] // 三级菜单
    };
  },
  methods: {
    /**
     * 返回首页
     */
    backToHome() {
      window.location.href = "/";
      // sessionStorage.removeItem("curTitle");
      localStorage.removeItem("currentSecondaryMenu");
    },
    back() {
      window.history.back();
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
    logout() {
      if (process.env.VUE_APP_USE_OIDC === "true") {
        this.$oidc.signoutRedirect();
      } else {
        localStorage.removeItem("access_token");
        this.$store.commit("SET_LOGIN_STATE", false);
        window.location.href = "/login.html";
      }
    },
    jumpTo(data, level) {
      if (level === "second") {
        localStorage.setItem("currentSecondaryMenu", data.id);
        this.currentSecondaryMenu = data.id;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    },
    GetTitle() {},
    getActiveSecMenus(menus) {
      let title;
      for (let i = 0; i < menus.length; i++) {
        if (this.isHasRouteName(menus[i])) {
          title = menus[i].name;
          break;
        }
      }
      // console.log(title);
      return title;
    },
    isHasRouteName(menu) {
      if (menu.name === this.$route.meta.title) {
        return true;
      } else {
        if (menu.children && menu.children.length) {
          let res;
          for (let i = 0; i < menu.children.length; i++) {
            if (this.isHasRouteName(menu.children[i])) return true;
          }
        }
        return false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#title-info-bar-component {
  /*position: fixed;
    top: 0;
    left: 0;
    z-index: 99999;*/
  width: 100%;
  // height: 90px;
  background-color: #106659;
}

#title-info-bar-component .main-nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

#title-info-bar-component .right {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: #fff;
  height: 48px;
  padding-right: 20px;

  .name {
    cursor: pointer;
    font-size: 14px;
  }
}

#title-info-bar-component .left {
  display: flex;
  flex-direction: row;
  align-items: center;

  .menu-box {
    display: flex;
    align-items: center;
    // width: 134px;
    height: 48px;
    line-height: 48px;
    background: #106659;
    cursor: pointer;
    padding-left: 20px;
    .title {
      user-select: none;
    }
  }

  .menu {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .title {
    display: inline-block;
    margin-left: 9px;
    font-size: 18px;
    font-weight: bold;
    line-height: 24px;
    color: #fff;
  }
}

#title-info-bar-component .subnav-container {
  // width: 100%;
  height: 42px;
  padding: 0 20px;
  background-color: #106659;
  display: flex;
  align-items: flex-end;
}

.nav-container {
  position: absolute;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  top: 48px;
  left: 0;
  z-index: 2001;
  padding: 0 40px;
  width: 100%;
  height: 80px;
  background: #fff;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
}

.nav-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 35px;
  background: #eff3f6;
  border-radius: 5px;
  margin-right: 10px;
  background: #eff3f6;
  border-radius: 5px;
  font-size: 14px;

  font-weight: 700;
  text-align: left;
  color: #4d4d4d;
  cursor: pointer;
  padding: 0 15px;

  img {
    display: inline-block;
    margin-right: 7px;
    width: 19px;
  }

  &.active,
  &:hover {
    background: #1bad96;
    border-radius: 5px;
    color: #ffffff;
  }
}

.subnav-btn {
  padding: 0 15px;
  height: 35px;
  line-height: 35px;
  background: #1bad96;
  border-radius: 5px 5px 0px 0px;
  font-weight: 700;
  text-align: center;
  color: #fff;
  cursor: pointer;
  margin-right: 2px;

  &.active {
    background: #f2f7fa;
    color: #1bad96;
  }
}

.btn-logout {
  cursor: pointer;
}

.logout {
  font-weight: bold;
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
  font-size: 20px;
  text-align: center;
  cursor: pointer;
  margin-left: 15px;
}

.logout {
  font-size: 14px;
  color: #4d4d4d;
  line-height: 20px;

  &::before {
    font-size: 18px;
    padding-right: 5px;
  }
}

.touxiang-1 {
  font-size: 16px;
  line-height: 20px;

  &::before {
    font-size: 20px;
    padding-right: 5px;
  }
}

#title-info-bar-component .title-search-box {
  min-width: 180px;
  width: 200px;
}
</style
><style lang="scss">
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

.el-popover {
  padding: 5px 0;
  min-width: auto;
}
</style>
