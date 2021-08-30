<template>
  <div class="content">
    <user-info-bar></user-info-bar>
    <router-view></router-view>
  </div>
</template>

<script>
import userInfoBar from '@/components/saUserInfo/index';
import { mapGetters } from "vuex";

export default {
  name: "Index",
  components: {
    userInfoBar
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["token", "workBenches"]),
  },
  // created: function () {
  //   if (process.env.VUE_APP_USE_OIDC === 'true') {
  //     // 启用了OIDC认证,则启用oidc客户端进行认证
  //     console.info('系统使用OIDC进行认证，认证服务器地址：' + process.env.VUE_APP_AUTHORITY_SERVER);
  //     var token = this.$oidc.getToken() || '';
  //     if (!token) {
  //       this.$oidc.getUser().then(user => {
  //         debugger;
  //         if (user) {
  //           this.$oidc.setToken(user.accessToken);
  //         } else {
  //           this.$oidc.signinRedirect();
  //         }
  //       })
  //     }
  //   } else {
  //     if (this.token === null || this.token === "undefined") {
  //       window.location.href = "/login.html";
  //     } else {
  //       // window.location.href = "/platform.html";
  //       // window.location.href = "/icis.html";
  //     }
  //   }
  // },
  mounted() {
    console.info('index.html loaded.');
  },
  destroyed() {
  },
  methods: {
    goto(target) {
      window.location.href = target.url;
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  height: 100%;
  font-family: "Microsoft YaHei Regular", "Microsoft YaHei Regular-Regular";
}
</style>
