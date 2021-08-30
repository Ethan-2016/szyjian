<template>
  <el-table-column :label="coloumnHeader.headerName" :prop="coloumnHeader.headerField" >
    <template v-for="item in coloumnHeader.children">
      <table-column v-if="item.children && item.children.length" :key="item.id" :coloumn-header="item"></table-column>
      <el-table-column v-else :key="item.id" :label="item.headerName" :prop="item.headerField" ></el-table-column>
    </template>
  </el-table-column>
</template>

<script>
export default {
  name: 'tableColumn',
  props: {
    coloumnHeader: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>

</style>