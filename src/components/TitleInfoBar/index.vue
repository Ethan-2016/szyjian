<template>
  <div id="title-info-bar-component">
    <div class="left">
      <img class="logo" src="@/assets/img/logo.png" />
      <div class="navbar">
        <slot></slot>
      </div>
    </div>
    <div class="right">
      <transition name="el-zoom-in-center">
        <div class="title-search-box" v-show="searching">
          <el-input size="mini" placeholder="请输入搜索关键字" v-model="search_key"></el-input>
        </div>
      </transition>
      <span class="icon-button el-icon-search" title="搜索" @click="toggleSearching" v-show="searchable"/>
      <span class="icon-button el-icon-switch-button" title="切换系统" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TitleInfoBar',
  props: {
    title: {
      default: ''
    },
    searchable: {
      default: true
    }
  },
  data() {
    return {
      searching: false,
      search_key: '',
    }
  },
  methods: {
    toggleSearching() {
      this.searching = !this.searching;
    }
  }
}
</script>

<style lang="scss" scoped>
#title-info-bar-component {
  width: 100%;
  height: 40px;
  padding: 0 30px;
  background-color: #1BAD96;
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
  width: calc(100% - 300px);
  .logo{
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

#title-info-bar-component .el-menu >.el-menu-item {
  font-size: 16px;
}
</style>