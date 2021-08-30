<template>
  <!-- 检验 -->
  <div class="mainContent" :style="{ height: mainContentHeight }">
    <div class="topContent">
      <div class="block">
        <span>时间:</span>
        <el-date-picker
          v-model="value1"
          :clearable="false"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          @change="dateChange"
        >
        </el-date-picker>
      </div>
    </div>
    <div class="main-nav" v-if="NavigationData.length > 0">
      <ul class="roll">
        <li
          v-for="(item, index) in NavigationData"
          :key="index"
          :index="item.resultId"
          @click="getTableId(item.resultId)"
          :class="resultId == item.resultId ? 'is-active' : ''"
        >
          <p>{{ item.name }}</p>
          <p>{{ item.time }}</p>
        </li>
      </ul>
      <div class="right-content" v-if="tableData.length > 0">
        <el-form :inline="true" :model="formInline" class="topText">
          <el-form-item label="样本类型:">{{ formInline.name }}</el-form-item>
          <el-form-item label="送检时间:">{{
            formInline.inspectionTime
          }}</el-form-item>
          <el-form-item label="报告医生:">{{
            formInline.doctorName
          }}</el-form-item>
          <el-form-item label="报告时间:">{{
            formInline.reportTime
          }}</el-form-item>
          <el-form-item label="审核医生:">{{
            formInline.auditDoctorName
          }}</el-form-item>
        </el-form>
        <el-table
          :data="tableData"
          border
          size="small"
          style="width: 100%"
          height="400px"
          max-height="100%"
        >
          <el-table-column
            type="index"
            width="150"
            label="序号"
          ></el-table-column>
          <el-table-column
            prop="inspectionItems"
            label="检验项目"
          ></el-table-column>
          <el-table-column prop="result" label="结果"> </el-table-column>
          <el-table-column prop="company" label="单位"> </el-table-column>
          <el-table-column
            prop="referenceValue"
            label="参考值"
          ></el-table-column>
          <el-table-column prop="abnormal" label="异常"> </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import Patient360 from "@/api/patient360.js";
import moment from "moment";
export default {
  props: {
    test: {
      type: String,
      default: null,
    },
    mainContentHeight: {
      type: String,
      default: "70vh",
    },
  },
  data() {
    return {
      value1: [
        moment(new Date()).subtract(30, "days"),
        moment().format("YYYY-MM-DD"),
      ],
      NavigationData: [],
      resultId: null,
      tableData: [],
      patientId: null,
      formInline: {
        name: "", // 样本名
        inspectionTime: "", // 送检时间
        doctorName: "", // 报告医生
        reportTime: "", // 报告时间
        auditDoctorName: "", // 审核医生
      },
    };
  },
  watch: {
    test(newVal, oldVal) {
      console.log(newVal, oldVal, "*******");
      if (newVal != oldVal) {
        this.patientId = newVal;
        this.getTestList();
      }
    },
  },
  created() {
    if (this.test) {
      this.patientId = this.test;
      this.getTestList();
    }
  },
  methods: {
    getTestList() {
      Patient360.test(this.patientId, {
        StartTime: moment(this.value1[0]).format("YYYY-MM-DD"),
        EndTime: moment(this.value1[1]).format("YYYY-MM-DD"),
      }).then((res) => {
        if (res.code == 200) {
          this.NavigationData = res.data || [];
          if (this.NavigationData.length > 0) {
            this.resultId = this.NavigationData[0].resultId;
            this.getTestResult();
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getTestResult() {
      Patient360.testResult({ ResultIds: this.resultId }).then((res) => {
        if (res.code == 200) {
          let dataObj = res.data;
          this.tableData = dataObj.allTestsResults || [];
          this.formInline = {
            name: dataObj.name, // 样本名
            inspectionTime: dataObj.inspectionTime, // 送检时间
            doctorName: dataObj.doctorName, // 报告医生
            reportTime: dataObj.reportTime, // 报告时间
            auditDoctorName: dataObj.auditDoctorName, // 审核医生
          };
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    dateChange(val) {
      //时间
      if (val) {
        this.getTestList();
      } else {
        this.$message.warning("时间不能为空");
      }
    },
    getTableId(resultId) {
      //点击侧边栏
      if (resultId != this.resultId) {
        this.resultId = resultId;
        this.getTestResult();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.roll {
  &::-webkit-scrollbar {
    position: absolute;
    bottom: 0;
    display: block;
    overflow: auto;
    height: 5px;
    width: 5px;
  }
  /*定义滚动条轨道 内阴影+圆角*/
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #fff;
  }

  /*定义滑块 内阴影+圆角*/
  &::-webkit-scrollbar-thumb {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #bfbfbf;
  }
}
.mainContent {
  ::v-deep {
    th {
      text-align: center;
      background-color: #e4e7ed;
      font-size: 14px;
    }
  }
  padding: 20px 20px 0;
  font-size: 14px;
  .topContent {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    span {
      margin-right: 10px;
    }
    .block {
      margin-right: 10px;
    }
  }
  .main-nav {
    height: calc(100% - 52px);
    display: flex;
    ul {
      width: 260px;
      padding: 0;
      margin: 0;
      overflow: auto;
      border-top: 1px solid #efefef;
      border-right: 1px solid #efefef;
      li {
        height: 50px;
        border-bottom: 1px solid #efefef;
        padding: 5px;

        p {
          padding-bottom: 5px;
        }
        p:first-child {
          font-size: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        p:last-child {
          padding-left: 10px;
        }
        &.is-active {
          color: #00c8ad;
          background-color: #e6faf7;
        }
      }
    }
    .right-content {
      width: calc(100% - 250px);
      padding-left: 10px;
      .topText {
        ::v-deep {
          .el-form-item {
            margin-bottom: 10px;
            margin-right: 20px;
          }
        }
      }
      .page-public-table-box {
        height: calc(100% - 52px);
      }
    }
  }
}
</style>
<style lang="scss">
.page-public-table-box .el-table--scrollable-y .el-table__body-wrapper {
  &::-webkit-scrollbar {
    position: absolute;
    bottom: 0;
    display: block;
    overflow: auto;
    height: 5px;
    width: 5px;
  }
  /*定义滚动条轨道 内阴影+圆角*/
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #fff;
  }

  /*定义滑块 内阴影+圆角*/
  &::-webkit-scrollbar-thumb {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #bfbfbf;
  }
}
</style>