<template>
  <div id="title-info-bar-component" v-show="topBarHide">
    <div class="main-nav">
      <div class="left">
        <div class="menu-box" @click.stop="displayMenu = !displayMenu">
          <img class="menu" src="@/assets/img/menu.png" />
          <span class="title" v-if="titleVisible">
            {{ secondaryActiveId | title(secondaryMenus) }}
          </span>
        </div>
        <slot name="main-nav-left"></slot>
      </div>
      <div class="right">
        <span
          style="font-size: 20px; cursor: pointer"
          class="el-icon-refresh"
          title="刷新页面"
          @click.stop="$router.go(0)"
        />
        <span
          class="iconfont close_icon"
          title="返回平台页"
          @click.stop="backToHome"
          v-if="showBackTop"
        />
        <span class="iconfont fanhui" title="返回上一页" @click="back" />
        <span
          class="iconfont fangda"
          title="全屏"
          @click.stop="fullScreen"
          v-if="!fullscreen"
        />
        <span
          class="iconfont suoxiao"
          title="全屏"
          @click.stop="fullScreen"
          v-else
        />
        <slot name="icon-nav-right"></slot>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="iconfont touxiang-1">{{ userName }}</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item icon="iconfont password" :command="0"
              >修改密码</el-dropdown-item
            >
            <el-dropdown-item icon="iconfont logout" :command="1"
              >退出</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div
      class="nav-container-mask"
      v-show="displayMenu"
      @click.stop="displayMenu = !displayMenu"
    >
      <div class="nav-container">
        <a
          class="nav-btn"
          :class="{ active: secondaryActiveId == route.id }"
          v-for="(route, index) in secondaryMenus"
          :key="index"
          @click="jumpSecond(route)"
        >
          <img
            :src="
              $route.path.indexOf(route.displayName) !== 1
                ? require('@/benchs/icis/assets/img/icons/' +
                    route.icon +
                    '-active.png')
                : require('@/benchs/icis/assets/img/icons/' +
                    route.icon +
                    '.png')
            "
            v-if="route.icon"
            :alt="route.displayName"
          />
          {{ route.displayName }}
        </a>
      </div>
    </div>
    <div class="subnav-container" v-if="thirdMenus.length > 0">
      <a
        class="subnav-btn"
        :class="{ active: thirdActiveId == route.id }"
        v-for="(route, index) in thirdMenus"
        :key="index"
        @click.stop="jumpThird(route)"
      >
        {{ route.displayName }}
      </a>
    </div>
    <!-- 院前功能开始 -->
    <div class="triage-btn" v-if="showPatientInfo && aidActivePatient.carNum">
      <div
        v-if="!aidActivePatient.isHasRecord"
        @click="showModel('triageUpdata')"
      >
        <p><i class="icon iconfont icontubiao-99"></i></p>
        <p><span>未建档</span></p>
      </div>
      <div v-else class="finish">
        <p><i class="icon iconfont icontubiao-99"></i></p>
        <p><span>已建档</span></p>
      </div>
      <div
        v-if="!aidActivePatient.isRegister"
        @click="showModel('triageRegistration')"
      >
        <p><i class="icon iconfont icontubiao-100"></i></p>
        <p><span>未挂号</span></p>
      </div>
      <div v-else class="finish">
        <p><i class="icon iconfont icontubiao-100"></i></p>
        <p><span>已挂号</span></p>
      </div>
      <div v-if="!aidActivePatient.isRegister" @click="showModel('triagePay')">
        <p><i class="icon iconfont icontubiao-101"></i></p>
        <p><span>未缴费</span></p>
      </div>
      <div v-else class="finish">
        <p><i class="icon iconfont icontubiao-101"></i></p>
        <p><span>已缴费</span></p>
      </div>
      <div @click="showModel('triageGreenCH')">
        <p><i class="icon iconfont icontubiao-102"></i></p>
        <p><span>绿通信息</span></p>
      </div>
      <div @click="showModel('triageAdd')">
        <p><i class="icon iconfont icontubiao-103"></i></p>
        <p><span>添加患者</span></p>
      </div>
    </div>
    <!-- 院前功能结束 -->
    <!-- 预检分诊开始 -->
    <div class="triage-btn" v-if="secondaryActiveId=='8b58c05e-a79b-ecce-d436-39fd8d6a347b'">
      <div @click="showModel('stayTriage',true)">
        <div v-if="temporaryTotal == 0">
          <p><i class="icon iconfont icon-tubiao-103"></i></p>
          <p><span>待分诊患者</span></p>
        </div>
        <div v-else>
          <el-badge :value="temporaryTotal" class="item">
            <p><i class="icon iconfont icon-tubiao-103"></i></p>
            <p><span>待分诊患者</span></p>
          </el-badge>
        </div>
      </div>
      <div @click="showModel('fastChannel',true)">
        <p><i class="icon iconfont icon-tubiao-102"></i></p>
        <p><span>快速通道</span></p>
      </div>
    </div>
    <!-- 预检分诊结束 -->
    <el-dialog
      title="修改密码"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      style="width: 800px; margin: auto"
    >
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="原密码：" prop="currentPassword">
          <el-input
            type="password"
            v-model="ruleForm.currentPassword"
            placeholder="填写原密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码：" prop="newPassword">
          <el-input
            type="password"
            v-model="ruleForm.newPassword"
            placeholder="填写新密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码：" prop="checkPassword">
          <el-input
            type="password"
            v-model="ruleForm.checkPassword"
            placeholder="再次填写确认"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="dialogFormBtn">确 定</el-button>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Authorization from "@/api/auth.js";
import { mapGetters } from "vuex";
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
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      } else {
        if (this.ruleForm.checkPassword !== "") {
          this.$refs.ruleForm.validateField("checkPassword");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入新密码"));
      } else if (value !== this.ruleForm.newPassword) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      showPatientInfo: false, //院前
      searching: false,
      search_key: "",
      fullscreen: false,
      topBarHide: true,
      isActive: true,
      displayMenu: false,
      showBackTop: false,
      showThirdMenu: true,
      navData: [],
      secondaryActiveId: "", //当前显示的二级菜单id
      secondaryMenus: [], // 二级菜单
      thirdActiveId: "", //当前显示的三级菜单id
      thirdMenus: [],
      activateUrl: "",
      loop: true,
      currentPlatform: null, //此系统ID，顶级父极
      dialogFormVisible: false, //修改密码
      ruleForm: {
        currentPassword: "",
        newPassword: "",
        checkPassword: "",
      },
      rules: {
        currentPassword: [
          { required: true, message: "请输入原为密码", trigger: "blur" },
        ],
        newPassword: [
          { required: true, validator: validatePass, trigger: "blur" },
        ],
        checkPassword: [
          { required: true, validator: validatePass2, trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    
    displayMenu(v) {
      this.$emit("displayMenu", v);
    },
    $route(to, from) {
      this.activateUrl = window.location.pathname + "#" + to.path; //window.location.hash
      this.arrloop(this.secondaryMenus);
      let menu = this.secondaryMenus.filter(
        (m) => m.id == this.secondaryActiveId
      );
      // console.log(menu, "menu");
      if (menu.length > 0) {
        this.thirdMenus = menu[0].children;
      }
    },
  },
  computed: {
    ...mapGetters(["aidActivePatient", "temporaryTotal"]),
    userName() {
      var info = this.$store.state.app.userInfo;
      // return (info.name || '无名氏');
      return (info.surname || "") + (info.name || "无名氏");
    },
  },
  mounted() {
    window.addEventListener("click", this.eventListener);
    this.currentPlatform = sessionStorage.getItem("currentPlatform");
    if (!this.currentPlatform) {
      this.currentPlatform = localStorage.getItem("currentPlatform");
    }
    let m = this.$store.state.sys.ownerMenus.filter(
      (m) => m.id == this.currentPlatform
    );
    if (m.length === 0) return;
    this.secondaryMenus = m[0].children;
    this.secondaryActiveId =
      sessionStorage.getItem("currentSecondaryMenu") || "";
    if (!this.secondaryActiveId) {
      this.secondaryActiveId =
        localStorage.getItem("currentSecondaryMenu") || "";
    }
    this.thirdActiveId = sessionStorage.getItem("currentThirdMenus") || "";
    if (!this.thirdActiveId) {
      this.thirdActiveId = localStorage.getItem("currentThirdMenus") || "";
    }
    if (this.secondaryActiveId) {
      let menu = this.secondaryMenus.filter(
        (m) => m.id == this.secondaryActiveId
      );
      if (menu.length > 0) {
        this.thirdMenus = menu[0].children;
      }
    } else {
      let defaultvalue = this.secondaryMenus[0] || {};
      if (defaultvalue.children && defaultvalue.children.length > 0) {
        if (defaultvalue.url) {
          let menu = defaultvalue.children.filter(
            (m) => m.url == defaultvalue.url
          );
          if (menu.length > 0) {
            this.secondaryActiveId = menu[0].parentId || "";
            this.thirdActiveId = menu[0].id;
          } else {
            this.secondaryActiveId = defaultvalue.id || "";
            this.thirdActiveId = defaultvalue.children[0].id;
          }
        } else {
          this.secondaryActiveId = defaultvalue.id || "";
          this.thirdActiveId = defaultvalue.children[0].id;
        }
        this.thirdMenus = defaultvalue.children;
        sessionStorage.setItem("currentThirdMenus", this.thirdActiveId);
        localStorage.setItem("currentThirdMenus", this.thirdActiveId);
        sessionStorage.setItem("currentSecondaryMenu", this.secondaryActiveId);
        localStorage.setItem("currentSecondaryMenu", this.secondaryActiveId);
      }
    }
  },
  created() {
    if (this.$store.state.sys.ownerMenus.length > 1) {
      this.showBackTop = true;
    }
  },
  filters: {
    checkHTML(val) {
      return val.substr(-4);
    },
    title(val, menus) {
      let m = menus.filter((m) => m.id == val);
      if (m.length == 0) return "";
      return m[0].name;
    },
  },
  methods: {
    //关闭患者列表
    domClick() {
      this.$emit("domClick");
    },
    //显示分诊选择弹窗
    showModel(type, only) {
      if (only) {//独立的预检分诊
         sessionStorage.setItem("fastChannelData", "");
        this.$store.commit("previewTriage/showDrawerModel", type);
      } else {//院前的预检分诊
        this.$store.commit("aid/showModel", type);
        //用于createConfirm组件判断是否为新增患者
        if (type === "triageAdd") {
          sessionStorage.setItem("isTriageAdd", "true");
        } else {
          sessionStorage.setItem("isTriageAdd", "false");
        }
       
      }
    },
    eventListener() {
      this.displayMenu = false;
    },
    handleCommand(command) {
      console.log(typeof command, command);
      if (command === 0) {
        //修改密码
        this.dialogFormVisible = true;
        this.ruleForm = {
          currentPassword: "",
          newPassword: "",
          checkPassword: "",
        };
      } else if (command === 1) {
        //退出
        if (process.env.VUE_APP_USE_OIDC === "true") {
          this.$oidc.signoutRedirect();
        } else {
          localStorage.clear();
          localStorage.setItem("localStorageClear", 3);
          this.$store.commit("SET_LOGIN_STATE", false);
          window.location.href = "/login.html";
        }
      }
    },
    dialogFormBtn() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          Authorization.changePassword(this.ruleForm)
            .then((res) => {
              this.dialogFormVisible = false;
              if (res.error) {
                this.$message.error(res.error.message);
              } else {
                this.$message.success("修改密码成功！");
              }
            })
            .catch((err) => {
              this.$message.error(err.error.message);
            });
        } else {
          console.log("error submit!!");
        }
      });
    },
    arrloop(data) {
      if (Array.isArray(data) && data.length > 0) {
        data.forEach((d) => {
          if (d.url == this.activateUrl) {
            // //console.log(d,'ddddddddd')
            if (d.children.length > 0) {
              let u = d.children.filter((m) => m.url == d.url);
              if (u.length === 0) {
                // //console.log(u.length,u,'u.length及u')
                this.secondaryActiveId = d.parentId;
                this.thirdActiveId = d.id;
              } else {
                // //console.log(u,'uuuuuuuuuuuuu')
                this.secondaryActiveId = d.id;
                this.thirdActiveId = u[0].id;
              }
            } else {
              if (this.currentPlatform == d.parentId) {
                //等于顶级父极，说明此是二级菜单
                this.secondaryActiveId = d.id;
              } else {
                this.secondaryActiveId = d.parentId;
                this.thirdActiveId = d.id;
              }
            }
            sessionStorage.setItem(
              "currentSecondaryMenu",
              this.secondaryActiveId
            );
            localStorage.setItem(
              "currentSecondaryMenu",
              this.secondaryActiveId
            );
            sessionStorage.setItem("currentThirdMenus", this.thirdActiveId);
            localStorage.setItem("currentThirdMenus", this.thirdActiveId);
            // //console.log('this.secondaryActiveId:'+this.secondaryActiveId,'this.thirdActiveId:'+this.thirdActiveId)
          } else if (d.children && d.children.length > 0) {
            this.arrloop(d.children);
          }
        });
      }
    },
    /**
     * 返回首页
     */
    backToHome() {
      window.location.href = "/";
      // sessionStorage.removeItem("curTitle");
      sessionStorage.removeItem("currentSecondaryMenu");
      localStorage.removeItem("currentSecondaryMenu");
    },
    back() {
      window.history.back();
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
        localStorage.clear();
        localStorage.setItem("localStorageClear", 4);
        this.$store.commit("SET_LOGIN_STATE", false);
        window.location.href = "/login.html";
      }
    },
    jumpSecond(data) {
      //二级菜单跳转
      this.secondaryActiveId = data.id;
      sessionStorage.setItem("currentSecondaryMenu", this.secondaryActiveId);
      localStorage.setItem("currentSecondaryMenu", this.secondaryActiveId);
      if (data.children && data.children.length > 0) {
        this.thirdMenus = data.children;
        this.thirdActiveId = data.children[0].id;
        sessionStorage.setItem("currentThirdMenus", this.thirdActiveId);
        localStorage.setItem("currentThirdMenus", this.thirdActiveId);
      } else {
        this.thirdMenus = data.children;
      }
      if (data.url) {
        window.location.href = data.url;
      } else if (data.children && data.children.length > 0) {
        if (data.children[0].url) {
          window.location.href = data.children[0].url;
        }
      }
    },
    jumpThird(data) {
      //三级菜单跳转
      // //console.log(data,'点击三级菜单')
      this.thirdActiveId = data.id;
      sessionStorage.setItem("currentThirdMenus", this.thirdActiveId);
      localStorage.setItem("currentThirdMenus", this.thirdActiveId);
      if (data.url) {
        window.location.href = data.url;
      } else if (data.children && data.children[0].url) {
        window.location.href = data.children[0].url;
      }
    },
  },
  destroyed() {
    window.removeEventListener("click", this.eventListener);
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
  height: 45px;
  padding-right: 20px;
  //  .iconfont {
  //   display: block;
  //   width: 30px;
  //   &::after {
  //     content: "\e754";
  //     color: #167667;
  //     position: relative;
  //     left: -47px;
  //   }
  // }

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
    height: 45px;
    line-height: 45px;
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
  height: 35px;
  padding: 0 20px;
  background-color: #106659;
  display: flex;
  align-items: flex-end;
  box-sizing: border-box;
}
.nav-container-mask {
  position: absolute;
  z-index: 9999;
  top: 45px;
  left: 0;
  right: 0;
  bottom: 0;
  .nav-container {
    // position: absolute;
    // top: 45px;
    // left: 0;
    // z-index: 99;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 40px;
    width: 100%;
    height: 80px;
    background: #fff;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
  }
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
  font-weight: bold;
}
.logout,
.password {
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
.el-popover {
  padding: 5px 0;
  min-width: auto;
}
#title-info-bar-component .triage-btn {
  position: absolute;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 366px;
  height: 60px;
  right: 258px;
  top: 14px;
  // z-index: 99999;
  color: #fff;
  > div {
    width: 70px;
    height: 60px;
    background: #1bad96;
    border-radius: 5px;
    padding-top: 13px;
    cursor: pointer;
    > p {
      text-align: center;
      font-size: 14px;
      i {
        font-size: 20px;
        text-align: center;
      }
      .iconfont {
        margin-left: 0;
        margin-top: 15px;
      }
      span {
        line-height: 24px;
        text-align: center;
      }
    }
  }
  .finish {
    opacity: 0.5;
  }
}
//院前开始
.el-popover {
  padding: 5px 0;
  min-width: auto;
}
#title-info-bar-component .triage-btn {
  position: absolute;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 366px;
  height: 60px;
  right: 258px;
  top: 14px;
  // z-index: 99999;
  color: #fff;
  > div {
    width: 70px;
    height: 60px;
    background: #1bad96;
    border-radius: 5px;
    padding-top: 13px;
    cursor: pointer;
    > p {
      text-align: center;
      font-size: 14px;
      i {
        font-size: 20px;
        text-align: center;
      }
      .iconfont {
        margin-left: 0;
        margin-top: 15px;
      }
      span {
        line-height: 24px;
        text-align: center;
      }
    }
  }
  .finish {
    opacity: 0.5;
  }
}
//院前结束
//预检分诊开始
#title-info-bar-component .triage-btn {
  position: absolute;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 188px;
  height: 60px;
  right: 278px;
  top: 14px;
  color: #fff;
  > div {
    width: 80px;
    height: 60px;
    background: #1bad96;
    border-radius: 5px;
    padding-top: 13px;
    cursor: pointer;
    .el-badge {
      width: 100%;
      .el-badge__content.is-fixed {
        top: -14px;
      }
    }
    p {
      width: 100%;
      text-align: center;
      font-size: 14px;
      i {
        font-size: 20px;
        text-align: center;
      }
      .iconfont {
        margin-left: 0;
        margin-top: 15px;
      }
      span {
        line-height: 24px;
        text-align: center;
      }
    }
  }
  .finish {
    opacity: 0.5;
  }
}
//预检分诊结束
</style>
