<template>
  <!-- 医嘱 -->
  <div class="mainContent">
    <div class="topContent">
      <div class="block">
        <span>医嘱关键字:</span>
        <el-input
          size="small"
          v-model="keyword"
          @change="keywordChange"
        ></el-input>
      </div>
      <div class="block">
        <span>开立时间:</span>
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
      <div class="block">
        <span>状态:</span>
        <el-select
          v-model="state"
          size="small"
          placeholder="请选择"
          @change="stateChange"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.desc"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <el-table :data="tableData" border size="small" style="width: 100%">
      <el-table-column type="index" width="150" label="序号"> </el-table-column>
      <el-table-column prop="displayStatus" label="状态">
        <!-- <template slot-scope="scope">
          {{ scope.row.displayStatus | filterState }}
        </template> -->
      </el-table-column>
      <el-table-column prop="startTimes" label="开始时间"> </el-table-column>
      <el-table-column
        prop="longOrderOrTemporaryOrder"
        label="长/临"
      ></el-table-column>
      <el-table-column prop="medicalAdvice" label="医嘱内容"></el-table-column>
      <el-table-column prop="dose" label="剂量"> </el-table-column>
      <el-table-column prop="frequency" label="频次"> </el-table-column>
      <el-table-column prop="usage" label="用法"> </el-table-column>
      <el-table-column prop="medicalCount" label="医嘱数量"></el-table-column>
      <el-table-column prop="count" label="数量"> </el-table-column>
      <el-table-column prop="company" label="单位"> </el-table-column>
      <el-table-column prop="endTimes" label="结束时间"> </el-table-column>
      <el-table-column prop="openDoctor" label="开立医生"> </el-table-column>
    </el-table>
  </div>
</template>

<script>
import Patient360 from "@/api/patient360.js";
import moment from "moment";
export default {
  props: {
    medicalAdvice: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      keyword: null, // 医嘱关键字
      value1: [
        moment(new Date()).subtract(30, "days"),
        moment().format("YYYY-MM-DD")
      ],
      state: null, // 状态
      patientId: null,
      tableData: [],
      options: []
    };
  },
  watch: {
    medicalAdvice(newVal, oldVal) {
      console.log(newVal, oldVal, "*******");
      if (newVal != oldVal) {
        this.patientId = newVal;
        this.getMedicalAdvice();
        if (!oldVal) {
          this.getUseAllEnum();
        }
      }
    }
  },
  created() {
    if (this.medicalAdvice) {
      this.patientId = this.medicalAdvice;
      this.getMedicalAdvice();
      this.getUseAllEnum();
    }
  },
  filters: {
    filterState(number) {
      let state = "";
      if (number == 0) {
        state = "已暂停";
      } else if (number == 1) {
        state = "未提交";
      } else if (number == 2) {
        state = "全部";
      } else if (number == 3) {
        state = "已提交";
      }
      return state;
    }
  },
  methods: {
    getMedicalAdvice() {
      Patient360.medicalAdvice(this.patientId, {
        keyword: this.keyword, //医嘱名称筛选
        StartTime: moment(this.value1[0]).format("YYYY-MM-DD"),
        EndTime: moment(this.value1[1]).format("YYYY-MM-DD"),
        displayStatusEnum: this.state //状态
      }).then(res => {
        this.tableData = res.data || [];
      });
    },
    getUseAllEnum() {
      Patient360.useAllEnum({
        isDic: false,
        Class: "DisplayStatusEnum"
      }).then(res => {
        this.options = res.data || [];
      });
    },
    dateChange(val) {
      //时间
      if (val) {
        this.getMedicalAdvice();
      } else {
        this.$message.warning("时间不能为空");
      }
    },
    stateChange() {
      this.getMedicalAdvice();
    },
    keywordChange() {
      this.getMedicalAdvice();
    }
  }
};
</script>

<style lang="scss" scoped>
.mainContent {
  padding: 20px;
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
    .el-input {
      width: 200px;
    }
  }
  ::v-deep {
    th {
      text-align: center;
      background-color: #e4e7ed;
      font-size: 14px;
    }
  }
}
</style>
