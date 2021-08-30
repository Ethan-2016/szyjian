<template>
  <div class="date-box">
    <div class="month-boxs">
      <div class="date-month">
        <i class="iconfont jiantou-zuo" @click="lastMonth"></i>
        <i class="month">{{month}}</i>
        <i class="iconfont jiantou-you" @click="nextMonth"></i>
      </div>
      <div class="switch-btns">
        <div
          class="switch-btn"
          :class="{'switch-btn-sel' : switchValue==0}"
          @click="switchValue=0"
        >我的</div>
        <div
          class="switch-btn"
          :class="{'switch-btn-sel' : switchValue==1}"
          @click="switchValue=1"
        >全院</div>
      </div>
    </div>
    <div class="week-thead">
      <div class="week-th" v-for="(item,index) in weekHead" :key="index">{{item}}</div>
    </div>
    <div class="week-tbody">
      <div
        class="week-td"
        :class="{'week-td1' : !item.inNowMonth, 'week-td-sel' : dateIndex==item.val}"
        v-for="(item,index) in dateList"
        :key="index"
        @click="selectDate(item)"
      >
        <span>{{item.day}}</span>
        <span class="week-content">6台</span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
export default {
  model: {
    prop: "date",
    event: "returnEvent",
  },
  props: {
    date: String,
    // activeIndex: {
    //     type: Number,
    //     default: 0
    // }
  },
  data() {
    return {
      dateList: [],
      month: "",
      switchValue: 0,
      weekHead: ["一", "二", "三", "四", "五", "六", "日"],
      dateIndex: this.date,
    };
  },
  created() {
    this.month = moment().format("YYYY年MM月");
  },
  mounted() {},
  watch: {
    month(newValue) {
      this.initDates(newValue);
    },
  },
  methods: {
    initDates(val) {
      let dateArr = [];
      let day = moment(val, "YYYY年MM月").startOf("month").format("YYYY-MM-DD");
      let weekObj = this.filterWeek(day);
      let firstDay = moment(day)
        .subtract(weekObj.week - 1, "days")
        .format("YYYY-MM-DD");
      let firstWeekObj = this.filterWeek(firstDay);
      firstWeekObj.inNowMonth = firstWeekObj.month == this.month ? true : false;
      dateArr.push(firstWeekObj);
      for (let i = 1; i < 42; i++) {
        let day = moment(firstDay).add(i, "days").format("YYYY-MM-DD");
        let obj = this.filterWeek(day);
        obj.inNowMonth = obj.month == this.month ? true : false;
        dateArr.push(obj);
      }
      this.dateList = dateArr;
    },
    filterWeek(val) {
      let weekObj = {
        month: "",
        week: "",
        day: "",
        val: val,
      };
      weekObj.month = moment(val).format("YYYY年MM月");
      weekObj.day = moment(val).format("DD");
      switch (moment(val).format("dddd")) {
        case "Monday":
          weekObj.week = 1;
          break;
        case "Tuesday":
          weekObj.week = 2;
          break;
        case "Wednesday":
          weekObj.week = 3;
          break;
        case "Thursday":
          weekObj.week = 4;
          break;
        case "Friday":
          weekObj.week = 5;
          break;
        case "Saturday":
          weekObj.week = 6;
          break;
        case "Sunday":
          weekObj.week = 7;
          break;
        default:
          weekObj.week = "";
      }
      return weekObj;
    },
    lastMonth() {
      this.month = moment(this.month, "YYYY年MM月")
        .subtract(1, "months")
        .format("YYYY年MM月");
    },
    nextMonth() {
      this.month = moment(this.month, "YYYY年MM月")
        .add(1, "months")
        .format("YYYY年MM月");
    },
    selectDate(item) {
      if (item.inNowMonth) {
        this.dateIndex = item.val;
        this.$emit("returnEvent", item.val);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.date-box {
  width: 465px;
  border: 1px solid#E5E5E5;
  border-radius: 10px;
  padding-bottom: 20px;
  overflow: hidden;
}
.month-boxs {
  width: 100%;
  height: 55px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.date-month {
  display: inline-flex;
  align-items: center;
  .iconfont {
    color: #1bad96;
    font-size: 24px;
    cursor: pointer;
  }
  .month {
    margin: 0 10px;
  }
}
.switch-btns {
  width: 138px;
  height: 30px;
  line-height: 30px;
  border-radius: 15px;
  background-color: #d2d2d2;
  display: inline-flex;
  .switch-btn {
    width: 40%;
    text-align: center;
    border-radius: 15px;
    cursor: pointer;
  }
  .switch-btn-sel {
    background-color: #1bad96;
    color: #fff;
    width: 60%;
  }
}
.week-thead {
  width: 100%;
  height: 40px;
  display: flex;
  background-color: #1bad96;
  color: #fff;
  .week-th {
    width: 14.286%;
    height: 100%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
}
.week-tbody {
  display: flex;
  flex-wrap: wrap;
  .week-td {
    width: 14.286%;
    height: 71px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border: 1px solid #e5e5e5;
    cursor: pointer;
    .week-content {
      color: #1bad96;
      margin-top: 5px;
      font-size: 17px;
      font-weight: bold;
    }
  }
  .week-td1 {
    background-color: #F2F2F2;
    color: #b3b3b3;
    cursor: inherit;
    .week-content {
      color: #b3b3b3;
    }
  }
  .week-td-sel {
    border-color: #1bad96;
    box-shadow: 0px 0px 16px 0px #1bad96 inset;
  }
}
</style>
