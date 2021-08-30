<template>
  <!-- :style="{'background-color': bgc}" -->
  <div class="menu-items" :style="menuBgcClass" ref="menus">
    <div class="item-blank" :class="{ 'menu-item-last': menuIndex == 0 }"></div>
    <div
      class="menu-item"
      :class="{
        'menu-item-select': menuIndex == index,
        'menu-item-last': menuIndex == index + 1,
        'menu-item-next': menuIndex == index - 1,
      }"
      v-for="(item, index) in menus"
      :key="index"
      @click="clickItem(index)"
    >
      <div
        class="menu-item-inside"
        :style="menuIndex == index ? menuBgcClass : ''"
      >
        {{item.name || item  }}
      </div>
    </div>
    <div
      class="item-blank"
      :class="{ 'menu-item-next': menuIndex == menus.length - 1 }"
    ></div>
    <!-- <i class="el-icon-arrow-right arrow-icon" v-if="isArrow"></i> -->
  </div>
</template>

<script>
export default {
  name: "sjMenu",
  model: {
    prop: "activeIndex",
    event: "returnEvent",
  },
  props: {
    menus: Array,
    activeIndex: {
      type: Number,
      default: 0,
    },
    bgc: {
      type: String,
      default: "#fff",
    },
  },
  data() {
    return {
      menuIndex: this.activeIndex,
      isArrow: false,
      menuBgcClass: {},
    };
  },
  mounted() {
    // let itemNum = this.$refs.menus.clientWidth / 130;
    // this.isArrow = itemNum < this.menus.length? true:false;
    // console.log('------------------',itemNum);
    this.menuBgcClass = {
      "background-color": this.bgc,
    };
    this.$on("menuIndex", (menuIndex) => {
      this.activeIndex = menuIndex;
    });
  },
  methods: {
    clickItem(index) {
      this.menuIndex = index;
      console.log('menus',this.menus)
      this.$emit("returnEvent", index);
    },
  },
};
</script>

<style lang="scss" scoped>
.menu-items {
  display: flex;
  height: 40px;
  width: 100%;
  color: #fff;
  font-size: 14px;
  background-color: #fff;
  overflow-x: auto;
  position: relative;
}
// .menu-item-length{
//     min-width: 130px;
// }
.item-blank {
  background-color: #1bad96;
  padding: 15px;
}
.menu-item {
  height: 100%;
  // display: inline-flex;
  background-color: #1bad96;
  cursor: pointer;
  // text-align: center;
  padding: 0 5px;
}
.menu-item-select {
  background-color: #1bad96;
  color: #1bad96;
  font-weight: 500;
  font-weight: bold;
  .menu-item-inside {
    background-color: #fff;
    padding: 0 13px;
  }
}
.menu-item-inside {
  // width: 100%;
  // width: 130px;
  height: 100%;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  font-size: 16px;
  font-weight: bold;
}
.menu-item-last {
  // border-bottom-right-radius: 10px;
}
.menu-item-next {
  // border-bottom-left-radius: 10px;
}
.arrow-icon {
  font-size: 36px;
  margin-left: 10px;
  color: #fff;
  cursor: pointer;
  position: absolute;
  right: 0;
  height: 100%;
  width: 35px;
  background: wheat;
  align-items: center;
  display: inline-flex;
}
</style>
