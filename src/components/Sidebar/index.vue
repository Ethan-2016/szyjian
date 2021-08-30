<template>
  <el-scrollbar>
    <el-menu
      :router="true"
      :show-timeout="200"
      :unique-opened="true"
      :collapse="isCollapse"
      class="el-menu-vertical"
      :default-active="defaultActive"
      mode="vertical">
      <slot></slot>
    </el-menu>
  </el-scrollbar>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Sidebar',
  props: {
    defaultActive: {
      type: String,
      default: '',
      require: true,
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    isCollapse() {
      return !this.sidebar.opened;
    }
  },
}
</script>
<style>
    .el-scrollbar__view {
      height: 100%;
    }
</style>

<style lang="scss" scoped>
    .el-scrollbar{
        width: 200px;
        height: 100%;
        overflow: auto;
    }

    .el-menu-vertical {
      height: 100%;
    }
</style>