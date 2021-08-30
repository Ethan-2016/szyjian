<!--
 * @Author: 吴应
 * @Date: 2020-10-21 08:52:20
 * @LastEditTime: 2020-12-15 11:59:30
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \work\ICIS\src\benchs\preHospital\layout\index.vue
-->
<template>
  <div class="index-content">
    <topbar @displayMenu="displayMenuChange" ref="topBarContent">
      <!-- <template slot="theme-picker">
        <i
          class="icon iconfont icon-tubiao-98"
          @click="themeChange"
          title="切换主题"
        ></i>
      </template> -->
    </topbar>
    <div class="child-page" @click="closeMenu">
      <router-view v-if="freshFlag"></router-view>
    </div>
    <footer>
      <div>
        <img src="../static/img/logo.png" alt="尚哲医健" />
        <span class="version">版本：V1.0.1</span>
      </div>
    </footer>
    <el-drawer
      :title="drawerTitle"
      size="100%"
      :visible.sync="drawer"
      @close="drawerClose"
      :key="timer"
    >
      <component :is="templatName" @drawerClose="drawerClose"></component>
    </el-drawer>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import Topbar from "@/components/Topbar3/index.vue";
export default {
  name: "Layout",
  components: {
    Topbar,
  },
  computed: {
    ...mapGetters(["theme", "showDrawerModel"]),
    routes() {
      return this.$router.options.routes;
    },
    subRoutes() {
      return this.$router.options.routes.filter((route) => {
        return this.$route.path.indexOf(route.name) === 1;
      });
    },
  },
  data() {
    return {
      timer: "",
      drawerTitle: "",
      templatName: "fastChannel",
      drawer: false,
      themeValue: "light", //主题颜色
      freshFlag: true,
      displayMenu: false,
    };
  },
  watch: {
    //监听弹窗类型
    showDrawerModel: {
      immediate: true,
      handler(value) {
        this.modelSelect(value);
      },
    },
  },
  created() {
    //获取本地保存的主题，若无存储，显示默认日间主题
    this.themeValue = localStorage.getItem("theme") ?? "light";
    window.document.documentElement.setAttribute("data-theme", this.themeValue);
    //设置待分诊患者角标
    this.setTemporaryTotal();
  },
  methods: {
    ...mapActions({
      setTemporaryTotal: "previewTriage/temporaryTotal",
    }),
    //关闭菜单
    closeMenu() {
      if (this.$refs.topBarContent.displayMenu) {
        this.$refs.topBarContent.displayMenu = false;
      }
    },
    //显示模块配置
    modelSelect(type) {
      this.timer = new Date().getTime();
      if (type == "fastChannel") {
        this.drawerTitle = "快速通道登记";
        this.templatName = type;
        this.drawer = true;
      } else if (type == "stayTriage") {
        this.drawerTitle = "待分诊患者";
        this.templatName = type;
        this.drawer = true;
      } else {
        this.drawer = false;
      }
    },
    //关闭弹窗
    drawerClose(state) {
      this.$store.commit("previewTriage/showDrawerModel", "");
      if (state) {
        this.setTemporaryTotal();
        this.$router.push({ path: "/medicalRecord/fastChannelPage" });
      }
    },
    //模式切换
    themeChange() {
      this.themeValue == "light"
        ? (this.themeValue = "dark")
        : (this.themeValue = "light");
      this.$store.commit("aid/theme", this.themeValue);
      window.document.documentElement.setAttribute(
        "data-theme",
        this.themeValue
      );
    },
    displayMenuChange(v) {
      this.displayMenu = v;
    },
  },
};
</script>

<style lang="scss" scoped>
.index-content {
  min-width: 1366px;
}
.clinic-diagnosis {
  max-width: 325px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  div {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 42px;
    padding: 0 20px;
    background: #BCBCBC;
    img {
      display: inline-block;
      margin-right: 15px;
      height: 25px;
    }
  }
}

::v-deep {
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active, 2.1.8 版本以下 */ {
    opacity: 0;
  }
}
</style>
<style lang="scss">
@import "@../../../assets/css/_handle.scss";

#title-info-bar-component {
  @include background_image("background_image1");
}
footer {
  @include background_image("background_image1");
  position: relative;
}
.subnav-btn {
  @include background_color("background_color3");
}
.subnav-btn.active {
  @include background_image("background_image2");
  @include font_color("font_color1");
}
.theme-picker {
  .el-input {
    width: 110px;
    .el-select__caret {
      color: #fff;
    }
  }
  .el-input__icon {
    line-height: 30px;
  }
  .el-input__inner {
    line-height: 30px;
    height: 30px;
    @include background_color("background_color2");
    color: #fff !important;
  }
}
.version {
  position: absolute;
  right: 10px;
  color: #fff;
}
.create-triage {
  .el-dialog__body {
    > div {
      height: 525px;
      display: flex;
      justify-content: center;
    }
  }
}
.el-dialog__body {
  .triage-pay {
    color: #000;
    height: 525px;
    padding: 0 200px;
    .triage-pay-main {
      margin-bottom: 30px;
      width: 450px;
      height: 420px;
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      box-shadow: 0px 0px 5px 5px rgba(0, 0, 0, 0.1);
      .main-top {
        position: relative;
        text-align: center;
        p {
          line-height: 66px;
          font-size: 16px;
          font-weight: 700;
        }
        i {
          position: absolute;
          width: 65px;
          height: 28px;
          line-height: 28px;
          background: rgb(254, 0, 0, 0.2);
          border-radius: 5px;
          color: #fe0000;
          top: 19px;
          left: 22px;
        }
      }
      .main-center {
        margin: 0 22px;
        padding: 10px 0;
        border-top: #e6e6e6 1px solid;
        border-bottom: #e6e6e6 1px solid;
        height: 260px;
        overflow-y: scroll;
        .list-child {
          padding-left: 28px;
        }
        p {
          display: flex;
          justify-content: space-between;
          line-height: 26px;
          span {
            flex: 1;
            margin: 0 6px;
            border-bottom: 1px dashed #1bad97;
            position: relative;
            top: -12px;
          }
        }
      }
      .main-bottom {
        margin: 0 22px;
        padding: 10px 0;
        p {
          font-size: 16px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          line-height: 24px;
          font-weight: 700;
          span {
            flex: 1;
            margin: 0 6px;
            border-bottom: 1px dashed #1bad97;
            position: relative;
            top: -12px;
          }
        }
      }
    }
    .triage-pay-btn {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
  .pay-main {
    height: 525px;
    color: #000;
    line-height: 30px;
    padding: 0 150px;
    span {
      color: #fe0000;
    }
    .pay-img {
      margin-top: 30px;
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
}
.back-btn {
  position: absolute;
  right: 20px;
  top: 70px;
}
</style>
