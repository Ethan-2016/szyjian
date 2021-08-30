<template>
  <div class="main-content">
    <img
      src="../../../assets/img/theme.png"
      alt="急危重症一体化平台"
      class="theme-name"
    />
    <ul>
      <li
        @click="jumpTo(menu)"
        v-for="(menu, index) in ownerMenus"
        :class="menu.icon"
        :key="index"
      >
        <img
          v-if="menu.icon == 'icon-before'"
          src="@/assets/img/icons/ico_before.png"
        />
        <img
          v-if="menu.icon == 'icon-preTriage'"
          src="@/assets/img/icons/icon-preTriage.png"
        />
        <img
          v-if="menu.icon == 'icon-ambulance'"
          src="@/assets/img/icons/icon-ambulance.png"
        />
        <img
          v-else-if="menu.icon == 'icon-management'"
          src="@/assets/img/icons/ico_management.png"
        />
        <img
          v-else-if="menu.icon == 'icon-sa'"
          src="@/assets/img/icons/ico_sa.png"
        />
        <img
          v-else-if="menu.icon == 'icon-dayOp'"
          src="@/assets/img/icons/ico_dayOp.png"
        />
        <img
          v-else-if="menu.icon == 'icon-icis'"
          src="@/assets/img/icons/ico_icis.png"
        />
        <img
          v-else-if="menu.icon == 'icon-stroke'"
          src="@/assets/img/icons/ico_stroke.png"
        />
        <img
          v-else-if="menu.icon == 'icon-chest'"
          src="@/assets/img/icons/ico_chest.png"
        />
        <img
          v-else-if="menu.icon == 'icon-statistic'"
          src="@/assets/img/icons/ico_statistic.png"
        />
        <img
          v-else-if="menu.icon == 'icon-dictionary'"
          src="@/assets/img/icons/ico_dic.png"
        />
        <img
          v-else-if="menu.icon == 'icon-setting'"
          src="@/assets/img/icons/ico_setting.png"
        />
        <p>{{ menu.name }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "index",
  data() {
    return {
      icon: "ico_setting",
    };
  },
  computed: {
    ...mapGetters(["userToken", "workBenches", "ownerMenus"]),
  },
  created() {
    console.log(this.ownerMenus);
    if (process.env.VUE_APP_USE_OIDC === "true") {
      // 使用OIDC进行第三方登录
      console.info(
        "系统使用OIDC进行认证，认证服务器地址：" +
          process.env.VUE_APP_AUTHORITY_SERVER
      );
      var token = this.$oidc.getToken() || "";
      if (!token) {
        this.$oidc.getUser().then((user) => {
          if (user) {
            this.$oidc.setToken(user.access_token);
          } else {
            this.$oidc.signinRedirect();
          }
        });
      }
    } else {
      // 不适用第三方登录，使用本地登录
      try {
        localStorage.setItem(
          "loginErr",
          "/Users/shij/www/ICIS/src/benchs/icis/router.js"
        );
      } catch (err) {}
      if (!this.userToken) {
        window.location.href = "/login.html";
      }
    }
  },
  mounted() {
    // if (this.workBenches.length == 0) {
    //   this.$store.dispatch('app/user/platforms');
    // }
    // if (this.ownerMenus.length == 0) {
    //   this.$store.dispatch('sys/menu/owner');
    // }
  },
  methods: {
    jumpTo(platform) {
      localStorage.setItem("currentPlatform", platform.id);
      localStorage.setItem("currentSecondaryMenu", "");
      sessionStorage.setItem("currentPlatform", platform.id);
      sessionStorage.setItem("currentSecondaryMenu", "");
      if (platform.url) {
        window.location.href = platform.url;
      } else if (platform.children.length > 0) {
        let item1 = platform.children[0];
        if (item1.url) {
          window.location.href = item1.url;
        } else if (item1.children.length > 0) {
          let item2 = item1.children[0];
          if (item2.url) {
            window.location.href = item2.url;
          }
        }
      } else {
        this.$message.warning("该系统无菜单，请联系管理员！");
      }
    },
    DefaultJump() {},
  },
};
</script>

<style lang="scss" scoped>
.main-content {
  width: 100%;
  height: 100%;
  background: url("../../../assets/img/bg_platform.jpg") no-repeat center center
    scroll;
  background-size: cover;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  .theme-name {
    width: 548px;
    margin-bottom: 80px;
  }
  ul {
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    max-width: 1520px;
    li {
      width: 221px;
      height: 254px;
      cursor: pointer;
      vertical-align: middle;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 0 14px 50px;
      transition: all 0.3s;
      img {
        height: 70px;
        margin-bottom: 40px;
      }
      p {
        font-size: 24px;
        color: #fff;
        line-height: 40px;
      }
      &:hover {
        transform: scale(1.1);
      }
      &.icon-preTriage {
        background: #33d3bd;
        box-shadow: 0px 10px 14px #33d3bd;
      }
      &.icon-ambulance {
        background: #f7cd93;
        box-shadow: 0px 10px 14px #f7cd93;
      }
      &.icon-management {
        background: #7cd4ff;
        box-shadow: 0px 10px 14px #7cd4ff;
      }
      &.icon-icis {
        background: #5ec895;
        box-shadow: 0px 10px 14px #5ec895;
      }
      &.icon-stroke {
        background: #3bb8f8;
        box-shadow: 0px 10px 14px #3bb8f8;
      }
      &.icon-chest {
        background: #5ec895;
        box-shadow: 0px 10px 14px #5ec895;
      }
      &.icon-dayOp {
        background: #6eaafb;
        box-shadow: 0px 10px 14px #6eaafb;
      }
      &.icon-before {
        background: #b2a6e8;
        box-shadow: 0px 10px 14px #b2a6e8;
      }
      &.icon-setting {
        background: #80c269;
        box-shadow: 0px 10px 14px #80c269;
      }
      &.icon-statistic {
        background: #f6bc6c;
        box-shadow: 0px 10px 14px #f6bc6c;
      }
      &.icon-dictionary {
        background: #b477db;
        box-shadow: 0px 10px 14px #b477db;
      }
      &.icon-sa {
        background: #ff7e98;
        box-shadow: 0px 10px 14px #ff7e98;
      }
    }
  }
}

@media screen and (max-width: 1360px) {
  .main-content {
    .theme-name {
      width: 500px;
      margin-bottom: 80px;
    }
    ul {
      width: 970px;
      li {
        width: 141px;
        height: 169px;
        img {
          height: 50px;
          margin-bottom: 30px;
        }
        p {
          font-size: 16px;
          color: #fff;
          line-height: 40px;
        }
      }
    }
  }
}
@media screen and (max-width: 1500px) {
  .main-content {
    .theme-name {
      width: 450px;
      margin-bottom: 80px;
    }
    ul {
      li {
        width: 165px;
        height: 198px;
        img {
          height: 50px;
          margin-bottom: 30px;
        }
        p {
          font-size: 19px;
          color: #fff;
          line-height: 40px;
        }
      }
    }
  }
}
</style>
