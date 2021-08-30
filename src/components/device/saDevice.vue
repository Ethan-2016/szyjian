<template>
  <div class="device">
    <a href="javascript:void(0)" @click="drawerBtn">
      <span class="iconfont qiehuan"></span>
      <span class="text">生命体征</span>
    </a>
    <div class="list drawer" :class="{ show: drawerShow }" v-if="showNameObj">
      <!-- <div class="itm">
        <div class="title">ECG_PVCs</div>
        <div class="number">{{ deviceData.ECG_PVCs }}</div>
      </div> -->
      <!-- <div class="itm">
        <div class="title">ECG_ST-I</div>
        <div class="number">{{deviceData.ECG_ST-I}}</div>
      </div>-->
      <div class="itm">
        <div class="title">无创血压</div>
        <div class="number">
          {{ deviceData["NIBP_SYS"]
          }}{{ deviceData["NIBP_DIA"] ? "/" + deviceData["NIBP_DIA"] : ""
          }}{{ deviceData["NIBP_MAP"] ? "/" + deviceData["NIBP_MAP"] : "" }}
        </div>
      </div>
      <div class="itm">
        <div class="title">有创血压</div>
        <div class="number">
          {{ deviceData["P1_SYS"]
          }}{{ deviceData["P1_DIA"] ? "/" + deviceData["P1_DIA"] : ""
          }}{{ deviceData["P1_MAP"] ? "/" + deviceData["P1_MAP"] : "" }}
        </div>
      </div>
      <div class="itm">
        <div class="title">血氧饱和度</div>
        <div class="number">{{ deviceData["SpO2"] }}</div>
      </div>
      <div class="itm">
        <div class="title">呼吸</div>
        <div class="number">{{ deviceData["RR"] }}</div>
      </div>
      <div class="itm">
        <div class="title">心率</div>
        <div class="number">{{ deviceData["HR"] }}</div>
      </div>
      <div class="itm blue">
        <div class="title">体温</div>
        <div class="number">{{ deviceData["Temp"] }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Report from "@/benchs/sanesthesia/api/saReport";
import AnesRecord from "@/benchs/sanesthesia/api/AnesRecord";
// import global from "@/global.config";
import moment from "moment";

export default {
  props: {
    refTransferedData: {
      type: Array,
      default() {
        return [];
      },
    },
    reportObj: {
      type: Object,
      default() {
        return {};
      },
    },
    timeBox: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      drawerShow: false,
      hasAnesData: false, //是否读取麻醉机数据
      observationData: {},
      anesthesiaData: {},
      anesthesia1Data: {},
      deviceMonitorData: [],
      deviceAnesTime: "", //麻醉机时间
      deviceAnesData: [], //存放麻醉机数据
      deviceTime: "",
      selectedRoomCode: "",
      selectedRoomArea: "",
      // transferedData: [], //选择的检测项目
      eventInterval: null,
      displayNameList: [
        "P1_DIA",
        "P1_SYS",
        "P1_MAP",
        "NIBP_DIA",
        "NIBP_SYS",
        "NIBP_MAP",
        "SpO2",
        "RR",
        "HR",
        "Temp",
      ],
      showNameObj: null,
      operStatusTime: "",
      operId: "",
    };
  },
  watch: {
    // refTransferedData(val) {
    //   console.log("--------------------------", val)
    //   this.transferedData = val;
    //   if (this.transferedData != undefined && this.transferedData.length > 0) {
    //     if (
    //       this.transferedData.filter((data) => data.deviceType == 1).length > 0
    //     ) {
    //       this.hasAnesData = true;
    //     } else {
    //       this.hasAnesData = false;
    //     }
    //   }
    // },
    reportObj(val) {
      if (this.$route.query.Pacu == "true") {
        this.selectedRoomCode = val.pacuBed;
      } else {
        this.selectedRoomCode = val.roomCode;
      }
      this.GetHardwareData();
    },
    timeBox: {
      handler(val) {
        if (
          (this.$route.query.Pacu == "true" && val[8].operStatusTime) ||
          (this.$route.query.Pacu == "false" && val[6].operStatusTime)
        ) {
          this.operStatusTime =
            this.$route.query.Pacu == "true"
              ? +new Date(val[8].operStatusTime)
              : +new Date(val[6].operStatusTime);
          let curTime = +new Date();
          if (+new Date(this.operStatusTime) < +new Date()) {
            if (this.eventInterval != null) {
              clearInterval(this.eventInterval);
            }
            this.observationData = {};
            this.anesthesiaData = {};
            this.anesthesia1Data = {};
            return true;
          }
        } else {
          this.operStatusTime = "";
        }
        if (this.eventInterval != null) {
          clearInterval(this.eventInterval);
        }
        this.eventInterval = setInterval(() => {
          this.GetHardwareData();
        }, 30000);
        return true;
      },
      immediate: true,
    },
  },
  computed: {
    deviceData() {
      return Object.assign(
        this.observationData,
        this.anesthesiaData,
        this.anesthesia1Data
      );
    },
  },
  mounted() {
    this.selectedRoomArea = localStorage.getItem("SelectedRoomArea");
    this.operId = JSON.parse(localStorage.getItem("patientInfo")).operId;
  },
  destroyed() {
    clearInterval(this.eventInterval);
  },
  methods: {
    drawerBtn() {
      this.drawerShow = !this.drawerShow;
    },
    /**
     * 获取硬件设备数据
     */
    GetHardwareData() {
      const type = 0;
      let roomCode = this.selectedRoomCode;
      let area = this.selectedRoomArea;
      if (+new Date(this.operStatusTime) < +new Date()) {
        if (this.eventInterval != null) {
          clearInterval(this.eventInterval);
        }
        this.observationData = {};
        this.anesthesiaData = {};
        return true;
      }
      AnesRecord.monitoringItems()
        .then(({ code, msg, data }) => {
          // console.log("code, msg, data", code, msg, data)
          if (code == 200) {
            this.showNameObj = {};
            this.monitoringItemsData = data;
            data.forEach((item) => {
              if (this.displayNameList.includes(item.itemName)) {
                this.showNameObj[item.itemName] = item.itemName;
              }
            });
          }
        })
        .catch(({ msg }) => {
          this.$message.error(msg);
        })
        .finally(() => {
          //获取监护仪数据
          let startTime = +new Date(sessionStorage.getItem("theStartTime"));
          let curDate = +new Date();
          let minutes5 = Math.floor(this.minutesDiff(startTime, curDate) / 1);
          let time = moment(startTime + minutes5 * 1 * 60 * 1000).format(
            "YYYY-MM-DD HH:mm"
          );
          Report.SelectDeviceData(this.operId, type, roomCode, area, "")
            .then(({ data, code, msg }) => {
              // console.log("获取监护仪数据", data)
              if (code == 200) {
                if (data == null) {
                  return;
                }

                let deviceMonitorData = data;
                let monitorpairs = [];
                // console.log("---------->", deviceMonitorData)
                this.monitoringItemsData.forEach((item) => {
                  let monitorpairObj = {
                    MonitorP: item.itemName,
                  };
                  let isDisplayVal = false;
                  if (this.displayNameList.includes(item.itemName)) {
                    isDisplayVal = true;
                    this.observationData[item.itemName] = ""
                  }
                  deviceMonitorData.observationDatas.find((observationData) => {
                    // console.log("============>", observationData.category, item.itemName)
                    if (observationData.category == item.itemName) {
                      monitorpairObj[time] = observationData.result;
                      if (isDisplayVal) {
                        this.observationData[item.itemName] =
                          observationData.result;
                      }
                      monitorpairs.push(monitorpairObj);
                    }
                  });
                });
                this.observationData = Object.assign({}, this.observationData);
                // if(monitorpairs.length){
                //   this.saveMonitoringTimeData(monitorpairs, time)
                // }
              }
            })
            .catch(({ msg }) => {
              // console.error("GetDeviceMonitorData");
            });

          //获取麻醉机数据
          // Report.SelectDeviceData(this.operId,1, roomCode, area, 2)
          //   .then(({ data, code, msg }) => {
          //     // console.log("获取麻醉机数据", data)
          //     if (code == 200) {
          //       if (data == null) {
          //         return;
          //       }
          //       let deviceMonitorData = data.anesthesia_data;
          //       let monitorpairs = []
          //       this.monitoringItemsData.forEach(item=>{
          //         if(deviceMonitorData[item.itemName]){
          //           let monitorpairObj = {
          //             MonitorP: item.itemName
          //           }
          //           monitorpairObj[time] = deviceMonitorData[item.itemName]
          //           monitorpairs.push(monitorpairObj)
          //           if(this.displayNameList.includes(item.itemName)){
          //             this.anesthesiaData[item.itemName] = deviceMonitorData[item.itemName]
          //           }
          //         }
          //       })
          //       this.anesthesiaData = Object.assign({}, this.anesthesiaData)
          //       if(monitorpairs.length){
          //         this.saveMonitoringTimeData(monitorpairs, time)
          //       }
          //     }
          //   })
          //   .catch(({ msg }) => {
          //     // console.error("GetDeviceAnesData");
          //   })

          Report.SelectDeviceData(this.operId, 1, roomCode, area, 1)
            .then(({ data, code, msg }) => {
              // console.log("获取血气机数据", data) anesthesia1
              if (code == 200) {
                if (data == null) {
                  return;
                }
                let deviceMonitorData = data.anesthesia_data;
                let anesthesia1s = [];
                this.monitoringItemsData.forEach((item) => {
                  if (deviceMonitorData[item.itemName]) {
                    let monitorpairObj = {
                      MonitorP: item.itemName,
                    };
                    monitorpairObj[time] = deviceMonitorData[item.itemName];
                    anesthesia1s.push(monitorpairObj);
                    if (this.displayNameList.includes(item.itemName)) {
                      this.anesthesia1Data[item.itemName] =
                        deviceMonitorData[item.itemName];
                    }
                  }
                });
                this.anesthesia1Data = Object.assign({}, this.anesthesia1Data);
                // if(anesthesia1s.length){
                //   this.saveMonitoringTimeData(anesthesia1s, time)
                // }
              }
            })
            .catch(({ msg }) => {
              // console.error("GetDeviceAnesData");
            });
        });
      return true;
    },
    minutesDiff(startTime, endTime) {
      // 开始时间
      let date1 = +startTime;
      // 结束时间
      let date2 = +endTime;
      let dateDiff = date2 - date1;
      return Math.round(dateDiff / 1000 / 60);
    },
    GetDateDiffSecond(startTime, endTime) {
      //将计算间隔类性字符转换为小写
      var sTime = new Date(startTime); //开始时间
      var eTime = new Date(endTime); //结束时间
      //作为除数的数字
      return parseInt((eTime.getTime() - sTime.getTime()) / parseInt(1000));
    },
    ConvertDate(strTime) {
      let year = strTime.substr(0, 4);
      let month = strTime.substr(4, 2);
      let day = strTime.substr(6, 2);
      let hour = strTime.substr(8, 2);
      let minute = strTime.substr(10, 2);
      let second = strTime.substr(12, 2);
      return (
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hour +
        ":" +
        minute +
        ":" +
        second
      );
    },
    saveMonitoringTimeData(monitorsData, time) {
      Report.saveMonitoringTimeData(this.operId, monitorsData, time)
        .then(({ data, code, msg }) => {
          if (code === 200) {
            this.$emit("refreshComponent");
          } else {
            this.$message.error(msg);
          }
        })
        .catch(({ msg }) => {
          this.$message.error(msg);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.device {
  display: flex;

  a {
    background: #464c5b;
    border-radius: 10px 0px 0px 10px;
    color: #fff;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    padding: 0 10px;
    height: 160px;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    box-shadow: -2px 0px 10px #999;
    width: 20px;

    .iconfont {
      margin-bottom: 5px;
      color: #13C1AD;
      font-weight: bold;
      font-size: 18px;
      margin-right: 0;
      padding-right: 0;
    }
  }

  .list {
    width: 0;
    transition: width 0.8s;
    // display: none;
    background: #464c5b;
    // padding: 12px 0 12px 8px;
    border-radius: 0px 0px 0px 10px;

    .itm {
      background: #595e6c;
      border-radius: 10px 0px 0px 10px;
      margin-bottom: 7px;
      padding: 10px 10px 5px 10px;
      color: #f3b70d;
      margin: 12px 0 12px 8px;

      .title {
        text-align: left;
        margin-bottom: 10px;
        min-width: 60px;
      }

      .number {
        text-align: right;
        font-size: 18px;
        font-weight: bold;
        min-height: 24px;
      }

      &.green {
        color: #36b42d;
      }

      &.blue {
        color: #1deaea;
      }
    }

    &.show {
      width: 135px;
      // display: block;
    }
  }
}
</style>
