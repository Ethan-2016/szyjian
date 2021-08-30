<template>
  <div id="title-info-bar-component" v-show="topBarHide">
    <div class="left">
      <img class="logo" src="@/assets/img/logo.png" />
      <div class="navbar">
        <slot></slot>
      </div>
    </div>
    <div class="right">
      <span class="iconfont back" title="返回" @click="back"></span>
      <span class="icon-button el-icon-arrow-up" title="隐藏" @click="hide"></span>
      <span class="iconfont quanping" title="全屏" @click="fullScreen" />
      <span class="icon-button el-icon-close" title="关闭" @click="close" />
    </div>
  </div>
</template>

<script>
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
  data() {
    return {
      searching: false,
      search_key: "",
      fullscreen: false,
      topBarHide: true,
    };
  },
  methods: {
    close() {
      //清除之前选中二级菜单
      sessionStorage.setItem("menuItemIndex", null);
      sessionStorage.removeItem("menuItemIndex");
      let path = this.$route.path;
      if(path==="/saSchedule/saSchedule"){
        this.$emit('back')
      }else{
        window.location.href = '/';
      }
    },
    back(){
       window.history.back()
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

#title-info-bar-component .right {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: 20px;
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