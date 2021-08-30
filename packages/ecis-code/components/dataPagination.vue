<!--
 * @Author: 吴应
 * @Date: 2021年5月6日16:05:25
 * @LastEditTime: 2021年5月6日16:05:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FileName: 分页封装
 * @FilePath: src\benchs\ecis\components\dataPagination.vue
-->
<template>
  <div class="pagination-main">
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="paginationForm.SkipCount"
      :page-sizes="[15, 30, 45, 60]"
      :page-size="paginationForm.MaxResultCount"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalCount"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "dataPagination",
  props: {
    MaxResultCount: {
      type: [String, Number],
      required: true,
      default: 10,
    },
    SkipCount: {
      type: [String, Number],
      required: true,
      default: 1,
    },
    totalCount: {
      type: [String, Number],
      required: true,
      default: 0,
    },
  },
  data() {
    return {
      paginationForm: {
        MaxResultCount: this.MaxResultCount,
        SkipCount: this.SkipCount,
      },
    };
  },
  mounted(){
    // console.log(this.paginationForm);
  },
  methods: {
    handleSizeChange(val) {
      this.paginationForm.MaxResultCount = val;
      this.$emit("paginationForm", this.paginationForm);
    },
    handleCurrentChange(val) {
      this.paginationForm.SkipCount = val;
      this.$emit("paginationForm", this.paginationForm);
    },
  },
};
</script>
<style lang="scss"></style>
