<template>
  <div id="content">
    <template>
      <div class="login-form">
        <div class="left">
          <img :alt="systemName" :src="require('@/assets/img/' + loginLeft)" />
        </div>
        <div class="right">
          <div class="form-logo">
            <img :src="require('@/assets/img/' + hospitalLogo)" />
            <span>{{ this.systemName }}</span>
          </div>
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="账密登录" name="first">
              <div class="form-input-group">
                <el-input
                  placeholder="请输入账号/工号"
                  v-model="userName"
                  :class="{ err: loginErr && !userName }"
                  @keyup.enter.native="dispatchSubmit"
                >
                  <template slot="prepend">
                    <span class="iconfont user" />
                  </template>
                </el-input>
                <el-input
                  placeholder="请输入密码"
                  type="password"
                  v-model="password"
                  :class="{ err: loginErr && !password }"
                  @keyup.enter.native="dispatchSubmit"
                >
                  <template slot="prepend">
                    <span class="iconfont password" />
                  </template>
                </el-input>
                <el-alert
                  :title="errMsg"
                  v-if="loginErr"
                  class="error iconfont warning"
                  type="error"
                  :closable="false"
                ></el-alert>
              </div>
            </el-tab-pane>
            <el-tab-pane label="CA登录" name="second" disabled>CA登录</el-tab-pane>
          </el-tabs>
          <div class="form-submit-button" @click="dispatchSubmit">登 录</div>
        </div>
      </div>
    </template>
    <p class="copy-right">版权所有© 深圳市尚哲医健科技有限公司</p>
  </div>
</template>

<script>
import qs from 'qs';
import SYS from '@/api/sys.js';
export default {
  name: 'Bench',
  data() {
    return {
      systemName: this.systemName,
      loginText: '登录',
      loginWay: 'password',
      videoSupported: false,
      userName: '',
      password: '', // "1q2w3E*",
      activeName: 'first',
      loginErr: false,
      errMsg: '',
      returnUrl: '',
      configinfo: {
        logoPicUrl2Login: process.env.VUE_APP_WEBSITE_LOGO,
        logoPicUrl2Nav: process.env.VUE_APP_WEBSITE_LOGO,
        siteName: process.env.VUE_APP_WEBSITE_TITLE,
        siteTitle: process.env.VUE_APP_WEBSITE_TITLE,
      },
    };
  },
  mounted() {
    const query = qs.parse(location.hash.substring(3));
    this.returnUrl = query.returnUrl || '';

    window.localStorage.setItem('configinfo', JSON.stringify(this.configinfo));
  },
  updated() {
    setTimeout(() => {
      this.loginErr = false;
      this.errMsg = '';
    }, 5000);
  },
  methods: {
    gotoHome() {
      if (this.returnUrl.length > 0) {
        window.location.href = this.returnUrl;
      } else {
        window.location.href = '/';
      }
    },
    dispatchSubmit() {
      if (!this.userName || !this.password) {
        this.errMsg = '请先输入账号或密码。';
        this.loginErr = true;
      } else {
        if (this.loginWay === 'password') {
          const loading = this.$loading({
            lock: true,
            text: '登录中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0,5)',
          });

          this.$store
            .dispatch('app/user/login', {
              userName: this.userName,
              password: this.password,
            })
            .then(() => {
              loading.close();
              this.$store
                .dispatch('app/user/profile')
                .then(resp => {
                  console.log(resp, '平台接口');
                  SYS.getInfo().then(res => {
                    localStorage.setItem('logoInfo', res.icon);
                    localStorage.setItem('hospitalName', res.name);
                  });
                  this.$store.dispatch('sys/menu/owner').then(resp => {
                    console.log(resp, '菜单接口');
                    let menus = resp;
                    if (menus.length > 0) {
                      if (menus.length === 1) {
                        window.location.href = menus[0].url;
                        localStorage.setItem('currentPlatform', menus[0].id);
                      } else {
                        //跳转至平台页
                        window.location.href = '/';
                      }
                    } else {
                      this.$message.warning('无访问权限,请联系管理员~');
                    }
                  });
                })
                .catch(err => {
                  this.loginErr = true;
                  this.errMsg = '用户不存在！';
                  console.log(err, '获取用户信息');
                });
              // this.$store.dispatch("GetWorkbenchs");
              // // window.location.href = "/index.html";
            })
            .catch(err => {
              console.log(err, '登录错误信息');
              loading.close();
              if (err == 'Error: Network Error') {
                this.loginErr = true;
                this.errMsg = '网络错误，请检查网络连接是否正常';
              } else {
                this.loginErr = true;
                this.errMsg = '账号或密码错误';
              }
            });
        }
      }
    },
    handleClick() {},
  },
};
</script>

<style lang="scss" scoped>
#content {
  height: 100%;
  width: 100%;
  background-image: url('~@/assets/img/bg-login.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Microsoft YaHei Regular', 'Microsoft YaHei Regular-Regular';
}

.login-form {
  position: relative;
  background: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 2px 2px 3px #aaaaaa;
  .left {
    padding-left: 10px;
    box-shadow: 5px 0px 10px #ccc;
    img {
      width: 642px;
      height: 417px;
    }
  }
  .right {
    margin: 0 60px;
    width: 300px;
  }
}

.login-form .form-logo {
  display: flex;
  align-items: center;
  margin-bottom: 42px;
  img {
    width: 48px;
    height: 48px;
  }
  span {
    color: #20af98;
    font-family: Source Han Sans CN Bold;
    font-size: 26px;
    padding-left: 6px;
    font-weight: bold;
  }
}

.login-form .form-input-group {
  position: relative;
  padding-bottom: 36px;
}

.login-form .form-input-group .el-input {
  margin-top: 13px;
  border: 1px solid #1bad96;
  border-radius: 23px;
  width: 99%;
  &.err {
    border-color: #f00;
  }
}

.login-form .form-input-group .error {
  color: #f00;
  font-size: 14px;
  position: absolute;
  bottom: 10px;
  left: 0;
  background: transparent;
  padding: 0;
  span {
    font-size: 14px;
    padding-right: 6px;
  }
}

.login-form .form-condition-group {
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.login-form .form-submit-button {
  border-radius: 23px;
  background-image: linear-gradient(to right, #1bad96, #5dd090);
  color: white;
  width: 100%;
  height: 46px;
  line-height: 46px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0px 8px 8px #e1e1e1;
  font-family: Source Han Sans CN Medium;
  font-size: 16px;
}

.copy-right {
  width: 100%;
  text-align: center;
  color: #fff;
  font-size: 14px;
  position: absolute;
  bottom: 30px;
  font-weight: 400;
  font-family: Source Han Sans CN Regular, Source Han Sans CN Regular-Regular;
}
</style>

<style lang="scss">
.login-form .el-tabs .el-tabs__item {
  font-size: 16px;
}
.login-form .form-input-group .el-input .el-input-group__prepend {
  border: none;
  background-color: #fff;
  border-radius: 23px 0 0 23px;
}
.login-form .form-input-group .el-input .el-input__inner {
  border: none;
  border-radius: 0 23px 23px 0;
  height: 44px;
  line-height: 44px;
}
</style>
