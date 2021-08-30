<template>
  <div>
    <span class="weui-switch" :class="{'weui-switch-on' : me_checked}" :value="value" @click="toggle"></span>
  </div>
</template>

<script>
  export default {
    props: {
      value: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        me_checked: this.value
      }
    },
    watch: {
      me_checked(val) {
        this.$emit('childByValue', val);
      }
    },
    methods: {
      toggle() {
        this.me_checked = !this.me_checked;
        // this.$emit('childByValue', this.me_checked);
      }
    }
  }
</script>

<style>
  .weui-switch {
    display: block;
    position: relative;
    width: 40px;
    height: 20px;
    outline: 0;
    border-radius: 16px;
    box-sizing: border-box;
    background-color: rgb(234, 236, 240);
    transition: background-color 0.1s, border 0.1s;
    cursor: pointer;
    margin: 0 auto;
  }
  .weui-switch:before {
    content: " ";
    position: absolute;
    top: 0;
    left: 0;
    width: 40px;
    height: 20px;
    border-radius: 15px;
    background-color: rgb(234, 236, 240);
    transition: transform 0.35s cubic-bezier(0.45, 1, 0.4, 1);
  }
  .weui-switch:after {
    content: " ";
    position: absolute;
    top: 1.5px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 15px;
    background-color: #fff;
    transition: transform 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
  }
  .weui-switch-on {
    border-color: rgb(27, 173, 150);
    background-color: rgb(27, 173, 150);
  }
  .weui-switch-on:before {
    border-color: rgb(27, 173, 150);
    background-color: rgb(27, 173, 150);
  }
  .weui-switch-on:after {
    transform: translateX(20px);
  }
</style>