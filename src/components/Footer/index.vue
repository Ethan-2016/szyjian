<template>
  <div class="footerContent" :style="{ height, background }">
    <!-- <img src="@/assets/img/website_logo.png" class="logo-one" alt="" /> -->
    <img :src="Logo" class="logo-one" alt="" />
    <img src="../../assets/img/logo3.png" class="logo-two" alt="" />
    <slot name="footer-right"></slot>
  </div>
</template>

<script>
export default {
  name: 'saFooter',
  props: {
    height: {
      type: String,
      default: '30px',
    },
    background: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      Logo: '',
      // logo: process.env.VUE_APP_WEBSITE_LOGO, //../../benchs/sanesthesia/assets/img/logo.png
    };
  },
  mounted() {
    //
    let wudi = this.$route.path.slice(1, 20);
    let kongzifu = '';
    if (wudi != 'icisNursingPlatform') {
      localStorage.setItem('btnGroup', kongzifu);
    }
    //
    let logo = localStorage.getItem('logoInfo');
    console.log(logo, '======图片LOGO========');
    if (logo) {
      this.Logo = logo;
      // this.Logo = require(`@/assets${logo}`);
    }
  },
};
</script>

<style lang="scss" scoped>
.footerContent {
  // width: 100%;
  // height: 30px;
  // background: #dcdfe6;
  // box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.2);
  // display: flex;
  // align-items: center;
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: #dcdfe6;
  padding: 0 20px 0;
  .logo-one {
    display: block;

    width: 124px;
    margin-left: 1px;
  }
  .logo-two {
    display: block;
    height: 23px;
    width: 83px;
    margin-left: 24px;
  }
}
</style>
