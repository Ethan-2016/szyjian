<template>
  <!-- 电子病历 -->
  <div class="mainContent" :style="{ height: mainContentHeight }">
    <iframe
      v-if="iframeUrl"
      :src="iframeUrl"
      frameborder="0"
      width="100%"
      height="100%"
    ></iframe>
    <div class="content-box" v-else>
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
        <div>
          <span>检查类型:</span>
          <el-select
            v-model="inspectType"
            size="small"
            @change="inspectTypeChange"
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in inspectOptions"
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
            <p>{{ item.time | filterDate }}</p>
          </li>
        </ul>
        <div class="right-content roll">
          <div class="right-line" v-for="(item, index) in Details" :key="index">
            <p class="title">{{ item.detail }}</p>
            <div style="white-space: pre-wrap; white-space: pre-line">
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Patient360 from "@/api/patient360.js";
import moment from "moment";
export default {
  name: "publicMedicalRecord",
  props: {
    medicalRecord: {
      //病人id
      type: Object,
      default: {},
    },
    mainContentHeight: {
      type: String,
      default: "70vh",
    },
  },
  data() {
    return {
      iframeUrl: "",
      value1: [
        moment(new Date()).subtract(30, "days"),
        moment().format("YYYY-MM-DD"),
      ],
      inspectType: "",
      inspectOptions: [],
      resultId: null,
      NavigationData: [],
      patientId: "",
      visitNum: "",
      Details: [],
    };
  },
  filters: {
    filterDate(val) {
      if (val) return moment(val).format("YYYY-MM-DD HH:mm");
    },
  },
  watch: {
    medicalRecord(newVal, oldVal) {
      console.log(newVal, oldVal, "*******");
      if (newVal != oldVal) {
        // this.patientId = newVal.patientId;
        this.patientId = newVal.Patient;
        this.visitNum = newVal.visitNum;
        this.getElectronicMedical().then((res) => {
          if (Object.keys(oldVal).length == 0 && !this.iframeUrl) {
            this.getProjectType();
          }
        });
      }
    },
  },
  created() {
    if (Object.keys(this.medicalRecord).length > 0) {
      // this.patientId = this.medicalRecord.PatientId;
      this.patientId = this.medicalRecord.Patient;
      this.visitNum = this.medicalRecord.visitNum;
      this.getElectronicMedical().then((res) => {
        if (res.code === 200 && res.data && !res.data.isUrl) {
          this.getProjectType();
        }
      });
    }
  },
  methods: {
    getProjectType() {
      //检查类型
      Patient360.useAllEnum({
        isDic: false,
        Class: "ProjectTypeEnum",
      }).then((res) => {
        this.inspectOptions = [];
        if (res.code == 200) {
          this.inspectOptions = res.data || [];
        }
      });
    },
    getElectronicMedical() {
      return new Promise((resolve, reject) => {
        Patient360.electronicMedical(this.patientId, {
          // isURL:false,
          visnum: this.visitNum,
          typeInspection: this.inspectType, //检查类型
          StartTime: moment(this.value1[0]).format("YYYY-MM-DD"),
          EndTime: moment(this.value1[1]).format("YYYY-MM-DD"),
        }).then((res) => {
          console.log(res);
          this.iframeUrl = "";
          this.NavigationData = [];
          if (res.code === 200 && res.data) {
            let resData = res.data;
            if (resData.isUrl) {
              this.iframeUrl = resData.url;
            } else {
              this.NavigationData = resData.allElectronicMedicals;
              this.resultId = this.NavigationData[0].resultId;
              this.getElectronicMedicalDetail();
            }
          } else {
            this.$$message.error(res.msg);
          }
          resolve(res);
        });
      });
    },
    getElectronicMedicalDetail() {
      //详情
      Patient360.electronicMedicalDetail({ ResultIds: this.resultId }).then(
        (res) => {
          if (res.code === 200) {
            this.Details = res.data || [];
          } else {
            this.$$message.error(res.msg);
          }
        }
      );
    },
    getTableId(id) {
      //点击右侧列表
      this.resultId = id;
      this.getElectronicMedicalDetail();
    },
    dateChange(val) {
      //时间
      if (val) {
        this.getElectronicMedical();
      } else {
        this.$message.warning("时间不能为空");
      }
    },
    inspectTypeChange() {
      //检查类型
      this.getElectronicMedical();
    },
  },
};
</script>

<style lang="scss" scoped>
.mainContent {
  width: 100%;
  height: 100%;
  font-size: 14px;
  .content-box {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 20px 20px 0;
  }
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
    width: 100%;
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
      width: calc(100% - 260px);
      padding: 0 20px;
      overflow: auto;
      .title {
        font-size: 26px;
        font-weight: bold;
        text-align: center;
        padding-bottom: 5px;
      }
    }
  }
}
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
</style>
