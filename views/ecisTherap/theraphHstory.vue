<!--
 * @Author: 吴应
 * @Date: 2021年8月23日20:19:34
 * @LastEditTime: 2021年8月23日20:19:39
 * @LastEditors: 吴应
 * @Description: In User Settings Edit
 * @FileName: 就诊区
 * @FilePath: src\benchs\ecis\views\ecisTherap\outpatientArea.vue
-->
<template>
  <div id="outpatient-area">
    <div class="top-action">
      <div class="right-input">
        <el-form :inline="true" :model="form" class="demo-form-inline">
          <el-form-item label="状态：">
            <el-select v-model="form.region">
              <el-option label="全部" value=""></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分级：">
            <el-select v-model="form.region">
              <el-option label="全部" value=""></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="科室：">
            <el-select v-model="form.region">
              <el-option label="全部" value=""></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="区域：">
            <el-select v-model="form.region">
              <el-option label="全部" value=""></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="搜索：">
            <el-input
              v-model="form.user"
              placeholder="患者ID/姓名/首诊医生"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="form.checked">关注</el-checkbox></el-form-item
          >
        </el-form>
      </div>
    </div>
    <div class="tabel-main">
      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="date" label="序号"> </el-table-column>
        <el-table-column prop="name" label="状态"> </el-table-column>
        <el-table-column prop="address" label="床号"> </el-table-column>
        <el-table-column prop="date" label="患者ID"> </el-table-column>
        <el-table-column prop="name" label="姓名"> </el-table-column>
        <el-table-column prop="address" label="性别"> </el-table-column>
        <el-table-column prop="date" label="年龄"> </el-table-column>
        <el-table-column prop="name" label="分诊时间"> </el-table-column>
        <el-table-column prop="address" label="费别"> </el-table-column>
        <el-table-column prop="date" label="分级"> </el-table-column>
        <el-table-column prop="name" label="绿色通道"> </el-table-column>
        <el-table-column prop="address" label="接诊时间"> </el-table-column>
        <el-table-column prop="name" label="诊断"> </el-table-column>
        <el-table-column prop="address" label="首诊医生"> </el-table-column>
        <el-table-column prop="name" label="滞留时间"> </el-table-column>
        <el-table-column prop="address" label="区域"> </el-table-column>
        <el-table-column prop="name" label="过敏"> </el-table-column>
        <el-table-column prop="address" label="传染病史"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small"
              >查看</el-button
            >
            <el-button type="text" size="small">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-content">
      <data-pagination
        :MaxResultCount="form.MaxResultCount"
        :totalCount="totalCount"
        :SkipCount="form.SkipCount"
        @paginationForm="paginationForm"
      ></data-pagination>
    </div>
  </div>
</template>
<script>
import dataPagination from "../../components/dataPagination.vue";
export default {
  name: "outpatientArea",
  components: {
    dataPagination,
  },
  data() {
    return {
      form: {
        checked: false,
        user: "",
        region: "",
        MaxResultCount: 30,
        SkipCount: 1,
      },
      totalCount: 0,
      tableData: [],
    };
  },
  methods: {
    /**获取分页结果
     *
     */
    paginationForm(obj) {
      this.form.MaxResultCount = obj.MaxResultCount;
      this.form.SkipCount = obj.SkipCount;
    },
    onSubmit() {
      console.log("submit!");
    },
  },
};
</script>
<style lang="scss" scoped>
#outpatient-area {
  padding: 12px;
  .top-action {
    .right-input {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }
  .tabel-main {
    margin-top: 10px;
  }
}
</style>