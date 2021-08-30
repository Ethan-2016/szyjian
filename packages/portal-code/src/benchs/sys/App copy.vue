<template>
  <div id="content">
    <!-- <top-Bar title="系统设置"></top-Bar> -->
    <!-- <user-info title="系统设置"></user-info> -->
    <div class="child">
      <!-- <side-Bar default-active="users">
        <el-menu-item index="users">
          <span class="iconfont user2" />
          <span slot="title">用户管理</span>
        </el-menu-item>
        <el-menu-item index="roles">
          <span class="iconfont team" />
          <span slot="title">角色管理</span>
        </el-menu-item>
        <el-menu-item index="menu">
          <span class="iconfont appstore" />
          <span slot="title">菜单管理</span>
        </el-menu-item>
        <el-menu-item index="resources">
          <span class="iconfont appstore" />
          <span slot="title">资源管理</span>
        </el-menu-item>
        <el-menu-item index="clients">
          <span class="iconfont laptop" />
          <span slot="title">客户端管理</span>
        </el-menu-item>
        <el-menu-item index="gateway">
          <span class="iconfont luyou" />
          <span slot="title">API网关管理</span>
        </el-menu-item>
      </side-Bar> -->
      <!-- <el-scrollbar class="child-view">
        <router-view />
      </el-scrollbar> -->
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
// import Watermark from '@/utils/watermark';
// import userInfo from "@/components/saUserInfo/index";
// import titleInfoBar from "@/components/TitleInfoBar";
import sideBar from "@/components/Sidebar";
import topBar from "@/components/Topbar3/index.vue";

export default {
  name: "idm",
  components: {
    // sideBar,
    // topBar
  },
  data() {
    return {
      activeIndex: "1",
    };
  },
  computed: {},
  created: function () {},
  mounted: function () {
    // Watermark.set(process.env.VUE_APP_Watermark);
  },
};
</script>

<style lang="scss" scoped>
#content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.el-menu--horizontal > .el-menu-item {
  height: 80px;
  line-height: 80px;
}
.child {
  height: calc(100% - 80px);
  display: flex;
}
.child-view {
//   width: calc(100% - 200px);
//   overflow-y: auto;
//   padding: 20px;
  background-color: #f4f4f4;
}
</style>
