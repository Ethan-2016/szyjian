<template>
  <!-- <el-scrollbar> -->
    <el-menu
      ref="menus,openeds,menuIndex"
      :default-active="menuItemIndex"
      :default-openeds="openeds"
    >
      <template v-for="(items, mindex) in menus">
        <el-submenu
          v-bind:key="mindex"
          :m-index="''+mindex"
          :index="''+mindex"
          v-if="items.childrens"
        >
          <template slot="title">• {{ items.title }}</template>
          <el-menu-item
            v-for="(children, cindex) in items.childrens"
            :key="mindex + '-' + cindex"
            :index="mindex + '-' + cindex"
            @click="clickMenuItem(mindex + '-' + cindex)"
          >{{ children }}</el-menu-item>
        </el-submenu>
        <el-menu-item
          v-bind:key="mindex"
          @click="clickMenuItem('' + mindex)"
          :index="''+mindex"
          v-else
        >• {{ items.title }}</el-menu-item>
      </template>
    </el-menu>
  <!-- </el-scrollbar> -->
</template>

<script>
export default {
  name: "secondMenu",
  props: {
    menus: Array,
    openeds: Array,
    menuIndex: String,
    bgc: {
      type: String,
      default: "rgba(70, 76, 91, 1)",
    },
  },
  data() {
    return {
      isArrow: false,
      menuBgcClass: {},
      menuItemIndex: this.menuIndex,
      isCollapse: false,
    };
  },
  mounted() {
    this.menuBgcClass = {
      "background-color": this.bgc,
    };
    if (
      sessionStorage.getItem("menuItemIndex") != null &&
      sessionStorage.getItem("menuItemIndex") != "null"
    ) {
      console.log(sessionStorage.getItem("menuItemIndex"));
      this.menuItemIndex = sessionStorage.getItem("menuItemIndex");
    }
    window.addEventListener("beforeunload", () => {
      if (
        this.menuItemIndex != null &&
        this.menuItemIndex != "null" &&
        this.menuItemIndex.length > 0
      ) {
        sessionStorage.setItem("menuItemIndex", this.menuItemIndex);
      }
    });
  },
  methods: {
    clickMenuItem(index) {
      this.menuItemIndex = index;
      sessionStorage.setItem("menuItemIndex", this.menuItemIndex);
      this.$emit("returnEvent", this.menuItemIndex);
    },
  },
};
</script>

<style lang="scss" scoped>
.el-menu {
  height: 100%;
  overflow: auto;
}
</style>
