<template>
  <div class="date-picker" @click.stop>
    <input
      class="sj-input"
      ref="sj-input"
      v-model="dateValue"
      @click="openPanel($event)"
      @blur="eventListener"
      @input="inputDate"
      @keyup.enter="submit"
      :placeholder="placeholder"
    />
    <!-- 动画特效 -->
    <transition name="fadeDownBig">
      <div class="date-panel" v-if="panelState">
        <div class="topbar">
          <!-- &lt;&lt;  &gt;&gt;-->
          <span @click="leftBig" class="el-icon-d-arrow-left"></span>
          <span @click="left" class="el-icon-arrow-left"></span>
          <span class="year" @click="(panelType = 'year'), (panelState = true)"
            >{{ tmpYear }}年</span
          >
          <span
            class="month"
            @click="(panelType = 'month'), (panelState = true)"
            >{{ changeTmpMonth }}</span
          >
          <span @click="right" class="el-icon-arrow-right"></span>
          <span @click="rightBig" class="el-icon-d-arrow-right"></span>
        </div>
        <!-- 年面板 -->
        <div class="type-year" v-show="panelType === 'year'">
          <ul class="year-list">
            <li
              v-for="(item, index) in yearList"
              :key="index"
              @click="selectYear(item)"
            >
              <span :class="{ selected: item === tmpYear }">{{ item }}</span>
            </li>
          </ul>
        </div>
        <!-- 月面板 -->
        <div class="type-year" v-show="panelType === 'month'">
          <ul class="year-list">
            <li
              v-for="(item, index) in monthList"
              :key="index"
              @click="selectMonth(item)"
            >
              <span :class="{ selected: item.value === tmpMonth }">{{
                item.label
              }}</span>
            </li>
          </ul>
        </div>
        <!-- 日期面板 -->
        <div class="date-group" v-show="panelType === 'date'">
          <span
            v-for="(item, index) in weekList"
            :key="index"
            class="weekday"
            >{{ item.label }}</span
          >
          <ul class="date-list">
            <li
              v-for="(item, index) in dateList"
              v-text="item.value"
              :class="{
                preMonth: item.previousMonth,
                nextMonth: item.nextMonth,
                selected:
                  date === item.value &&
                  month === tmpMonth &&
                  item.currentMonth,
                invalid: validateDate(item),
              }"
              :key="index"
              @click="selectDate(item)"
            ></li>
          </ul>
        </div>
        <div class="date-footer">
          <button class="btn-clear" @click="clearBtn">清空</button>
          <button class="btn-text" @click="nowBtn">此刻</button>
          <button class="btn-primary" @click="saveBtn">确定</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import moment from "moment";
export default {
  name: "SjDatePicker",
  data() {
    return {
      //现在选中的年月日  new Date(this.tmpYear, this.tmpMonth, this.nowValue)
      dateValue: "", // 输入框显示日期
      timeValue: null, //时间，支持输入四位自定化为时间
      timeFormat: null, //输入时间
      date: new Date().getDate(), // 当前日期
      panelState: false, // 初始值，默认panel关闭
      month: new Date().getMonth(),
      tmpMonth: new Date().getMonth(), // 当前选中月份--默认当前月
      tmpYear: new Date().getFullYear(), // 当前选中年份--默认当前年份
      nowValue: 0, // 当前选中日期值
      panelType: "date", // 默认日期面板
      isChange: false, //是否改变日期
      weekList: [
        // 周
        { label: "日", value: 0 },
        { label: "一", value: 1 },
        { label: "二", value: 2 },
        { label: "三", value: 3 },
        { label: "四", value: 4 },
        { label: "五", value: 5 },
        { label: "六", value: 6 },
      ],
      monthList: [
        // 月
        { label: "一月", value: 0 },
        { label: "二月", value: 1 },
        { label: "三月", value: 2 },
        { label: "四月", value: 3 },
        { label: "五月", value: 4 },
        { label: "六月", value: 5 },
        { label: "七月", value: 6 },
        { label: "八月", value: 7 },
        { label: "九月", value: 8 },
        { label: "十月", value: 9 },
        { label: "十一月", value: 10 },
        { label: "十二月", value: 11 },
      ],
    };
  },
  props: {
    value: {
      type: [Date, String],
      default: "",
    },
    format: {
      type: String,
      default: "YYYY-MM-DD",
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  computed: {
    dateList() {
      //获取当月的天数
      let currentMonthLength = new Date(
        this.tmpYear,
        this.tmpMonth + 1,
        0
      ).getDate();
      //先将当月的日期塞入dateList
      let dateList = Array.from(
        { length: currentMonthLength },
        (val, index) => {
          return {
            currentMonth: true,
            value: index + 1,
          };
        }
      );
      // 获取当月1号的星期是为了确定在1号前需要插多少天
      let startDay = new Date(this.tmpYear, this.tmpMonth, 1).getDay();
      // 确认上个月一共多少天
      let previousMongthLength = new Date(
        this.tmpYear,
        this.tmpMonth,
        0
      ).getDate();
      // 在1号前插入上个月日期
      for (let i = 0, len = startDay; i < len; i++) {
        dateList = [
          { previousMonth: true, value: previousMongthLength - i },
        ].concat(dateList);
      }
      // 补全剩余位置
      for (let i = 1, item = 1; i < 15; i++, item++) {
        dateList[dateList.length] = { nextMonth: true, value: i };
      }
      return dateList;
    },
    changeTmpMonth() {
      return this.monthList[this.tmpMonth].label;
    },
    yearList() {
      return Array.from({ length: 12 }, (value, index) => this.tmpYear + index);
    },
  },
  watch: {
    value(val, oldVal) {
      //console.log(oldVal,val,'监听到变化')
      if (val) {
        this.dateValue = moment(val).format(this.format);
        if (this.timeFormat) {
          this.timeValue = moment(val).format(this.timeFormat);
        }
      }
    },
    format() {
      if (this.value) {
        this.dateValue = moment(this.value).format(this.format);
        if (this.timeFormat) {
          this.timeValue = moment(this.value).format(this.timeFormat);
        }
      }
    },
  },
  created() {
    // //console.log(this.value,this.format,moment(this.value).format(this.format),moment(this.value).format('YYYY-MM-DD HH:mm'),'日期控件')
    this.dataChange();
  },
  mounted() {
    window.addEventListener("click", this.eventListener);
  },
  methods: {
    eventListener() {
      if (this.value) {
        this.dateValue = moment(this.value).format(this.format);
      } else {
        if(this.panelState == false){
          this.dateValue = "";
        }
      }
      this.panelState = false;
    },
    dataChange() {
      let arr = this.format.split(" ");
      if (arr.length > 1) {
        this.timeFormat = arr[1];
        if (this.value) {
          this.timeValue = moment(this.value).format(this.timeFormat);
        }
      }
      if (this.value) {
        this.dateValue = moment(this.value).format(this.format);
        this.nowValue = new Date(this.dateValue).getDate();
        this.tmpMonth = new Date(this.dateValue).getMonth();
        this.tmpYear = new Date(this.dateValue).getFullYear();
      } else {
        this.timeValue = moment().format(this.timeFormat);
      }
    },
    openPanel(e) {
      //点击输入框
      this.panelState = true;
      this.panelType = "date";
      if (this.value) {
        this.dateValue = moment(this.value).format(this.timeFormat);
        //console.log(this.dateValue,'日期时间')
        e.currentTarget.select();
      } else {
        this.nowValue = new Date().getDate();
        this.dateValue = moment(new Date()).format(this.timeFormat);
        e.currentTarget.select();
      }
    },
    inputDate() {
      this.panelState = true;
      //输入框实时输入
      //console.log(this.dateValue)
      if (this.dateValue === null) return; //
      this.dateValue = this.dateValue.replace(/[^\d{2}:\d{2}:\d{2}]/g, ""); //验证格式
      //console.log(typeof this.dateValue,this.dateValue,'时间')
      if (this.dateValue.length > 8) {
        this.dateValue = this.dateValue.substr(8);
      }
      if (this.dateValue) {
        //substr() 开始位置，截图长度
        if (this.dateValue.length > this.timeFormat.length) {
          //控制时间长度
          this.dateValue = this.dateValue.substr(0, this.timeFormat.length);
        }
        if (this.dateValue.length === 1 && this.dateValue > 2) {
          this.dateValue = "0".concat(this.dateValue);
        }
        if (
          this.dateValue.length === 3 &&
          this.dateValue[0] != ":" &&
          this.dateValue.substr(2, 1) != ":"
        ) {
          //console.log(this.dateValue.length,this.dateValue.substr(2, 1))
          this.dateValue =
            this.dateValue.substr(0, 2) +
            ":" +
            this.dateValue.substr(2, this.dateValue.length);
        }
        if (this.dateValue.substr(0, 2).length === 2) {
          //时
          let timeN = this.dateValue.substr(0, 2);
          //console.log(timeN,'处理')
          if (timeN > 23) {
            this.dateValue = this.changeStr(this.timeValue, 0, "23");
            this.dateValue =
              this.dateValue.substr(0, 2) +
              ":" +
              this.dateValue.substr(2, this.dateValue.length);
          } else if (timeN[0] != ":" && timeN[1] != ":" && isNaN(timeN)) {
            this.dateValue = "";
          }
        } else if (this.dateValue.substr(3, 2).length === 2) {
          //分
          let timeN1 = this.dateValue.substr(3, 2);
          if (timeN1 > 59) {
            this.dateValue = this.changeStr(this.dateValue, 3, "59");
          } else if (isNaN(timeN1)) {
            this.dateValue = "";
          }
        }
        if (this.dateValue.split(":")[0].length > 2) {
          this.dateValue =
            this.dateValue.split(":")[0].substr(0, 2) +
            ":" +
            this.dateValue.split(":")[1];
          // this.dateValue = this.dateValue.substr(0, 2) + ':' + this.dateValue.substr(2,this.dateValue.length);
        }
        if (this.dateValue.split(":")[1] > 59) {
          this.dateValue = this.changeStr(this.dateValue, 3, "59");
        }

        this.timeValue = this.dateValue;

        // if(this.dateValue=="0"){
        //   console.log(this.dateValue)
        //   this.dateValue = null
        // }
      }
    },
    changeStr(str, index, changeStr) {
      //字符串指定位置替换
      //str:原始字符串，index开始位置,changeStr改变后的字
      return (
        str.substr(0, index) + changeStr + str.substr(index + changeStr.length)
      );
    },
    submit() {
      //输入框回车键
      this.saveBtn();
    },
    nowBtn() {
      //此刻
      let now = moment().format(this.format);
      this.$emit("input", now); //回传给父组件
      this.$emit("change", now); //发生改变
      // this.panelState = !this.panelState;
      this.panelState = false;
    },
    // 清空时间
    clearBtn() {
      this.dateValue = null;
      // const input = document.getElementsByClassName('sj-input');
      this.$refs["sj-input"].focus();
      this.nowValue = null;
      this.$emit("input", this.dateValue); //回传给父组件
      this.$emit("change", this.dateValue); //发生改变
      this.panelState = !this.panelState;
    },
    saveBtn() {
      //确定按钮
      let update = null;
      let selectDay = new Date(this.tmpYear, this.tmpMonth, this.nowValue);
      if (this.nowValue === 0) {
        update = moment().format("YYYY-MM-DD") + " " + this.timeValue;
      } else {
        if (this.timeValue !== null && this.timeValue !== " ") {
          update =
            moment(selectDay).format("YYYY-MM-DD") + " " + this.timeValue;
        } else {
          update = moment(selectDay).format("YYYY-MM-DD");
        }
      }
      let regTime = this.timeValue.split(":");
      if (regTime.length <= 1 || !regTime || !this.dateValue) {
        // this.dateValue = null
        if (this.isChange == false) {
          update = null;
          this.nowValue = null;
        } else {
          update =
            moment(selectDay).format("YYYY-MM-DD") +
            " " +
            moment().format("HH:mm");
        }
        this.isChange = false;
        // this.isChange = !this.isChange
      }
      console.log(this.dateValue,update)
      this.$emit("input", update); //回传给父组件
      this.$emit("change", update); //发生改变
      // this.panelState = !this.panelState;
      this.panelState = false;
    },
    selectDate(item) {
      //选择日期
      //console.log(item,'选择日期')
      this.panelState = true;
      this.isChange = true;
      this.nowValue = item.value;
    },
    left() {
      this.panelState = true;
      if (this.panelType === "year") this.tmpYear--;
      else {
        if (this.tmpMonth === 0) {
          this.tmpYear--;
          this.tmpMonth = 11;
        } else this.tmpMonth--;
      }
    },
    leftBig() {
      this.panelState = true;
      if (this.panelType === "year") this.tmpYear -= 12;
      else this.tmpYear--;
    },
    right() {
      this.panelState = true;
      if (this.panelType === "year") this.tmpYear++;
      else {
        if (this.tmpMonth === 11) {
          this.tmpYear++;
          this.tmpMonth = 0;
        } else this.tmpMonth++;
      }
    },
    rightBig() {
      this.panelState = true;
      if (this.panelType === "year") this.tmpYear += 12;
      else this.tmpYear++;
    },

    validateDate(item) {
      this.panelState = true;
      if (this.nowValue === item.value && item.currentMonth) return true;
    },

    selectYear(item) {
      this.panelState = true;
      this.tmpYear = item;
      this.panelType = "month";
    },
    selectMonth(item) {
      this.panelState = true;
      this.tmpMonth = item.value;
      this.panelType = "date";
    },

    formatDate(date, fmt = this.format) {
      // 长度为10的时候末尾补3个0
      if (date === null || date === "null") {
        return "--";
      }
      date = new Date(Number(date));
      var o = {
        "M+": date.getMonth() + 1, // 月份
        "d+": date.getDate(), // 日
        "h+": date.getHours(), // 小时
        "m+": date.getMinutes(), // 分
        "s+": date.getSeconds(), // 秒
        "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
        S: date.getMilliseconds(), // 毫秒
      };
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length === 1
              ? o[k]
              : ("00" + o[k]).substr(("" + o[k]).length)
          );
      }
      return fmt;
    },
  },
  destroyed() {
    window.removeEventListener("click", this.eventListener);
  },
};
</script>
<style lang="scss" scoped>
$shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
$theme-color: #00c8ad; //主题色

button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  padding: 2px 5px;
  &.btn-text {
    border: none;
    color: $theme-color;
  }
  &.btn-clear {
    border: none;
    color: $theme-color;
  }
  &.btn-primary:hover {
    background: #fff;
    border-color: #00c8ad;
    color: #00c8ad;
  }
}
button + button {
  margin-left: 10px;
}
.date-picker {
  position: relative;
  width: 210px;
  text-align: center;
  color: #000000;
  input {
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
    height: 32px;
    padding: 4px 5px;
    border: 1px solid #dcdee2;
    border-radius: 4px;
    color: #000000;
    outline: 0;
    background-color: #fff;
    background-image: none;
    position: relative;
    cursor: text;
    transition: border 0.2s ease-in-out, background 0.2s ease-in-out,
      box-shadow 0.2s ease-in-out;
    margin-bottom: 6px;
  }
  input:focus {
    border-color: $theme-color;
    outline: 0;
  }
  .date-panel {
    width: 220px;
    position: absolute;
    left: -40px;
    z-index: 9999;
    box-shadow: $shadow;
    background: #fff;
    input {
      height: 24px;
    }
  }
  .date-footer {
    padding: 5px;
    text-align: right;
  }
}

.topbar {
  padding-top: 8px;
  span {
    display: inline-block;
    width: 20px;
    height: 30px;
    line-height: 30px;
    color: #515a6e;
    cursor: pointer;
    &:hover {
      color: $theme-color;
    }
  }
  .year,
  .month {
    width: 60px;
  }
}
ul {
  list-style: none;
  padding: 0;
  margin: 0 auto;
}
.year-list {
  height: 200px;
  width: 210px;
  .selected {
    background: $theme-color;
    border-radius: 4px;
    color: #fff;
  }
  li {
    display: inline-block;
    width: 70px;
    height: 50px;
    line-height: 50px;
    border-radius: 10px;
    cursor: pointer;
  }
  span {
    display: inline-block;
    line-height: 16px;
    padding: 8px;
    &:hover {
      background: #e1f0fe;
      color: $theme-color;
    }
  }
}
.weekday {
  display: inline-block;
  font-size: 13px;
  width: 30px;
  text-align: center;
}
.date-list {
  width: 210px;
  text-align: left;
  height: 180px;
  overflow: hidden;
  margin-top: 4px;
  li {
    display: inline-block;
    width: 28px;
    height: 28px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;
    color: #000;
    border: 1px solid #fff;
    border-radius: 4px;
    &:hover {
      // background: $theme-color;
      // border-radius: 50%;
      color: $theme-color;
    }
  }
  .selected {
    color: $theme-color;
    font-weight: 700;
  }
  .invalid {
    background: $theme-color;
    color: #fff !important;
    border-radius: 50%;
  }
  .preMonth,
  .nextMonth {
    //上个月，下个月
    color: #c0c4cc;
  }
}

.fadeDownBig-enter-active,
.fadeDownBig-leave-active,
.fadeInDownBig {
  -webkit-animation-duration: 0.5s;
  animation-duration: 0.5s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}
.fadeDownBig-enter-active {
  -webkit-animation-name: fadeInDownBig;
  animation-name: fadeInDownBig;
}
.fadeDownBig-leave-active {
  -webkit-animation-name: fadeOutDownBig;
  animation-name: fadeOutDownBig;
}
@-webkit-keyframes fadeInDownBig {
  from {
    opacity: 0.8;
    -webkit-transform: translate3d(0, -4px, 0);
    transform: translate3d(0, -4px, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}
@keyframes fadeInDownBig {
  from {
    opacity: 0.8;
    -webkit-transform: translate3d(0, -4px, 0);
    transform: translate3d(0, -4px, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}
@-webkit-keyframes fadeOutDownBig {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.8;
    -webkit-transform: translate3d(0, -4px, 0);
    transform: translate3d(0, -4px, 0);
  }
}
@keyframes fadeOutDownBig {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
