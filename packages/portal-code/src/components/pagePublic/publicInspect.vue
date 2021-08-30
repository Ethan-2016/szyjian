<template>
  <!-- 检查 -->
  <div class="mainContent">
    <iframe
      id="frame"
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
        <div class="block">
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
            @click="getTableId(item)"
            :class="resultId == item.resultId ? 'is-active' : ''"
          >
            <p>{{ item.name }}</p>
            <p>{{ item.time }}</p>
          </li>
        </ul>
        <div class="right-content roll">
          <div class="right-line" v-for="(item, index) in Details" :key="index">
            <p>{{ item.name }}</p>
            <p>{{ item.value }}</p>
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
  name: "publicInspect",
  props: {
    inspectParam: {
      //病人id
      type: String,
      default: null,
    },
  },
  data() {
    return {
      iframeUrl: "",
      NavigationData: [],
      Details: [],
      value1: [
        moment(new Date()).subtract(30, "days"),
        moment().format("YYYY-MM-DD"),
      ],
      inspectOptions: [],
      inspectType: "",
      patientId: "",
    };
  },
  created() {
    if (this.inspectParam) {
      this.patientId = this.inspectParam;
      this.getInspect().then((res) => {
        if (res.code === 200 && res.data && !res.data.isUrl) {
          this.getProjectType();
        }
      });
    }
  },
  watch: {
    inspectParam(newVal, oldVal) {
      console.log(newVal, oldVal, "*******");
      if (newVal != oldVal) {
        this.patientId = newVal;
        this.getInspect().then((res) => {
          if (!oldVal && !this.iframeUrl) {
            this.getProjectType();
          }
        });
      }
    },
  },
  methods: {
    getProjectType() {
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
    getInspect() {
      //获取检查信息
      return new Promise((resolve, reject) => {
        Patient360.inspect(this.patientId, {
          // isURL:false,
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
              this.NavigationData = resData.allTestCustomBackDto;
              this.resultId = this.NavigationData[0].resultId;
              this.getInspectDetail();
            }
          } else {
            this.$message.error(res.msg);
          }
          resolve(res);
        });
      });
    },
    getInspectDetail() {
      Patient360.inspectDetail({ ResultIds: this.resultId }).then((res) => {
        if (res.code === 200) {
          this.Details = res.data || [];
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 获取列表
    getTableId(id) {
      this.resultId = id;
      this.getInspectDetail();
    },
    dateChange(val) {
      //时间发生改变
      if (val) {
        this.getInspect();
      } else {
        this.$message.warning("时间不能为空");
      }
    },
    inspectTypeChange() {
      //检查类型发生改变
      this.getInspect();
    },
  },
  beforeDestroy() {
    let frame = document.querySelector("#frame");
    if (frame) {
      frame.src = "about:blank";
      try {
        frame.document.write("");
        frame.document.clear();
      } catch (e) {
        console.log(e);
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.mainContent {
  width: 100%;
  height: 700px;
  padding: 20px 0;
  font-size: 14px;
  .content-box {
    width: 100%;
    height: 100%;
  }
  .topContent {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 20px;
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
    height: calc(100% - 32px);
    ul {
      width: 260px;
      padding: 0;
      margin: 0;
      overflow: auto;
      border-top: 1px solid #efefef;
      border-radius: 1px solid #efefef;
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
      .right-line {
        p {
          padding: 5px 0;
        }
        p:first-child {
          font-size: 16px;
        }
        p:last-child {
          margin-left: 20px;
        }
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
