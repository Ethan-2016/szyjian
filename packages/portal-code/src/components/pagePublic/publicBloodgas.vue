<template>
  <!-- 血气 -->
  <div class="mainContent">
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
      <div class="block">
        <span>标本类型:</span>
        <el-select
          v-model="specimenType"
          size="small"
          @change="specimenTypeChange"
          placeholder="请选择"
        >
          <el-option
            v-for="(item, index) in specimenOptions"
            :key="index.value"
            :label="item.desc"
            :value="item.value"
          >
          </el-option>
        </el-select>
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
      <div class="right-content roll">
        <!-- <div class="topText">
          <div>
            <span>样本类型:</span>
            <el-input
              v-model="name"
              placeholder="请输入内容"
              size="small"
              class="minInput"
            ></el-input>
          </div>
          <div>
            <span>送检时间:</span>
            <el-input
              v-model="inspectionTime"
              placeholder="请输入内容"
              size="small"
              class="maxInput"
            ></el-input>
          </div>
          <div>
            <span>报告医生:</span>
            <el-input
              v-model="doctorName"
              placeholder="请输入内容"
              size="small"
              class="minInput"
            ></el-input>
          </div>
          <div>
            <span>报告时间:</span>
            <el-input
              v-model="reportTime"
              placeholder="请输入内容"
              size="small"
              class="maxInput"
            ></el-input>
          </div>
          <div>
            <span>审核医生:</span>
            <el-input
              v-model="auditDoctorName"
              placeholder="请输入内容"
              size="small"
              class="minInput"
            ></el-input>
          </div>
          <div>
            <span>审核时间:</span>
            <el-input
              v-model="auditTime"
              placeholder="请输入内容"
              size="small"
              class="maxInput"
            ></el-input>
          </div>
        </div> -->
        <el-form :inline="true" :model="formInline" class="topText">
          <el-form-item label="标本类型:">{{ formInline.name }}</el-form-item>
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
          <el-form-item label="审核时间:">{{
            formInline.auditTime
          }}</el-form-item>
        </el-form>
        <el-table :data="tableData" size="small" style="width: 100%" border>
          <el-table-column type="index" width="150" label="序号">
          </el-table-column>
          <el-table-column prop="parameterName" label="参数名称">
          </el-table-column>
          <el-table-column prop="parameterRange" label="参考范围">
          </el-table-column>
          <el-table-column prop="company" label="单位"> </el-table-column>
          <el-table-column prop="result" label="结果"> </el-table-column>
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
    bloodgas: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      value1: [
        moment(new Date()).subtract(30, "days"),
        moment().format("YYYY-MM-DD")
      ],
      formInline: {
        name: "", // 样本名
        inspectionTime: "", // 送检时间
        doctorName: "", // 报告医生
        reportTime: "", // 报告时间
        auditDoctorName: "", // 审核医生
        auditTime: "" //审核时间
      },
      NavigationData: [],
      tableData: [],
      specimenType: null,
      specimenOptions: [],
      resultId: null,
      Taketime: null, //时间戳
      eventime: null //检测时间
    };
  },
  watch: {
    bloodgas(newVal, oldVal) {
      console.log(newVal, oldVal, "*******");
      if (newVal != oldVal) {
        this.patientId = newVal;
        this.getBloodGas();
        if (!oldVal) {
          this.getProjectType();
        }
      }
    }
  },
  created() {
    if (this.bloodgas) {
      this.patientId = this.bloodgas;
      this.getBloodGas();
      this.getProjectType();
    }
  },
  methods: {
    getProjectType() {
      //标本类型
      Patient360.useAllEnum({
        isDic: false,
        Class: "SpecimenEnum"
      }).then(res => {
        this.specimenOptions = res.data || [];
      });
    },
    //查询血气列表
    getBloodGas() {
      Patient360.bloodGas(this.patientId, {
        StartTime: moment(this.value1[0]).format("YYYY-MM-DD"),
        EndTime: moment(this.value1[1]).format("YYYY-MM-DD"),
        specimenEnum: this.specimenType
      }).then(res => {
        this.NavigationData = res.data || [];
        if (this.NavigationData.length > 0) {
          let obj = this.NavigationData[0];
          this.resultId = obj.resultId;
          this.Taketime = obj.Taketime;
          this.eventime = obj.eventime;
          this.getBloodGasResult();
        }
      });
    },
    getBloodGasResult() {
      Patient360.bloodGasResult(this.patientId, {
        ResultIds: this.resultId,
        Taketime: this.Taketime,
        eventime: this.eventime
      }).then(res => {
        let dataObj = res.data;
        this.tableData = dataObj.allTestsResults || [];
        this.formInline = {
          name: dataObj.name, // 样本名
          inspectionTime: dataObj.inspectionTime, // 送检时间
          doctorName: dataObj.doctorName, // 报告医生
          reportTime: dataObj.reportTime, // 报告时间
          auditDoctorName: dataObj.auditDoctorName, // 审核医生
          auditTime: dataObj.auditTime //审核时间
        };
      });
    },
    dateChange(val) {
      //时间发生改变
      if (val) {
        this.getBloodGas();
      } else {
        this.$message.warning("时间不能为空");
      }
    },
    specimenTypeChange() {
      this.getBloodGas();
    },

    // 获取列表
    getTableId(item) {
      this.resultId = item.resultId;
      this.Taketime = item.Taketime;
      this.eventime = item.eventime;
      this.getBloodGasResult();
    }
  }
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
  width: 100%;
  height: 100%;
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
    .el-select {
      margin-right: 10px;
    }
  }
  .main-nav {
    display: flex;
    height: calc(100% - 52px);
    width: 100%;
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
      width: calc(100% - 260px);
      padding: 0 20px;
      .topText {
        ::v-deep {
          .el-form-item {
            margin-bottom: 10px;
            margin-right: 20px;
          }
        }
      }
    }
  }
}
</style>
