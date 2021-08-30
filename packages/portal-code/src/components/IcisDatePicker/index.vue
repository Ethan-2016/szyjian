<template>
  <div class="date-picker" v-if="!disabled" @click.stop ref="datePicker">
    <div class="dateShow" @click="openPanel($event)" :class="panelState ? 'checkClass' : ''">
      <span class="iconfont icon-shijian"></span>
      {{ showDateValue }}
      <i v-if="clear" class="clearDate iconfont icon-close" @click="clearBtn"></i>
    </div>
    <transition name="fadeDownBig">
      <div
        class="date-panel"
        v-if="panelState"
        @click="e => e.stopPropagation()"
        ref="selectDatePicker"
        @keydown.13="enterEvent"
      >
        <div class="dInput">
          <div class="first-time-span" :class="isBorder.time ? 'checkClass' : ''" @click="leftTimeClick">
            {{ dateTime }}
          </div>
          <div
            v-show="!isDateTime"
            class="dInput-time"
            :class="isBorder.hourMinutes ? 'checkClass' : ''"
            @click="rightTimeClick"
          >
            <input
              type="text"
              class="dInput-text"
              ref="hourInput"
              v-model="hourAndMinutes.hour"
              @click="hourClick"
              @blur="hourBlur"
              @keydown.39="leftKeyEvent"
              @input="changeTimeEvent($event, 'hour')"
            />
            <span class="dInput-colon">:</span>
            <input
              type="text"
              class="dInput-text"
              ref="minutesInput"
              v-model="hourAndMinutes.minutes"
              @click="minutesClick"
              @blur="minutesBlur"
              @focus="hourAndMinutes.minutes = ''"
              @keydown.37="rightKeyEvent"
              @input="changeTimeEvent($event, 'minutes')"
            />
          </div>
          <div v-if="isDateTime" class="dInput-time dInput-time-disInput">
            <span>00 : 00</span>
          </div>
        </div>
        <div class="topbar">
          <!-- &lt;&lt;  &gt;&gt;-->
          <div class="topbar-year">
            <span @click="leftBig" class="elIcon el-icon-caret-left"></span>
            <span class="year" @click="(panelType = 'year'), (panelState = true)">{{ checkYear }}年</span>
            <span @click="rightBig" class="elIcon el-icon-caret-right"></span>
          </div>
          <div class="topbar-month">
            <span @click="left" class="elIcon el-icon-caret-left"></span>
            <span class="month" @click="(panelType = 'month'), (panelState = true)">{{ changecheckMonth }}</span>
            <span @click="right" class="elIcon el-icon-caret-right"></span>
          </div>
        </div>
        <!-- 年面板 -->
        <div class="type-year" v-show="panelType === 'year'">
          <ul class="year-list">
            <li
              v-for="(item, index) in yearList"
              :key="index"
              @click="selectYear(item.year, item.disabled)"
              :class="item.disabled ? 'year-month-disabled' : ''"
            >
              <span :class="{ selected: item.year === checkYear }">{{ item.year }}</span>
            </li>
          </ul>
        </div>
        <!-- 月面板 -->
        <div class="type-year" v-show="panelType === 'month'">
          <ul class="year-list">
            <li
              v-for="(item, index) in monthList"
              :key="index"
              @click="selectMonth(item, item.disabled)"
              :class="item.disabled ? 'year-month-disabled' : ''"
            >
              <span :class="{ selected: item.value === checkMonth }">{{ item.label }}</span>
            </li>
          </ul>
        </div>
        <!-- 日期面板 -->
        <div class="date-group" v-show="panelType === 'date'">
          <div class="date-week">
            <span v-for="(item, index) in weekList" :key="index" class="weekday">{{ item.label }}</span>
          </div>
          <ul class="date-list">
            <li
              v-for="(item, index) in dateList"
              v-text="item.value"
              :class="{
                preMonth: item.previousMonth,
                nextMonth: item.nextMonth,
                selected: date === item.value && month === checkMonth && item.currentMonth,
                invalid: checkDay == item.value && item.currentMonth,
                dayDisabled: item.disabled,
              }"
              :key="index"
              @click="selectDate(item, item.disabled)"
            ></li>
          </ul>
        </div>
        <div class="date-footer">
          <button class="btn-text" @click="nowBtn">此刻</button>
          <button class="btn-primary" @click="submitDate">确定</button>
        </div>
      </div>
    </transition>
  </div>
  <div class="date-picker-disabled" v-else>
    <span class="iconfont icon-shijian"></span>
    {{ showDateValue }}
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'IcisDatePicker',
  data() {
    return {
      dateValue: '请填写日期', // 输入框显示日期
      // timeValue: null, //时间，支持输入四位自定化为时间
      date: new Date().getDate(), // 当前日期
      panelState: false, // 初始值，默认panel关闭
      month: new Date().getMonth(),
      checkMonth: new Date().getMonth(), // 当前选中月份--默认当前月
      checkYear: new Date().getFullYear(), // 当前选中年份--默认当前年份
      checkDay: new Date().getDate(), // 当前选中日期值
      panelType: 'date', // 默认日期面板
      weekList: [
        // 周
        { label: '日', value: 0 },
        { label: '一', value: 1 },
        { label: '二', value: 2 },
        { label: '三', value: 3 },
        { label: '四', value: 4 },
        { label: '五', value: 5 },
        { label: '六', value: 6 },
      ],
      monthList: [
        // 月
        { label: '一月', value: 0, disabled: false },
        { label: '二月', value: 1, disabled: false },
        { label: '三月', value: 2, disabled: false },
        { label: '四月', value: 3, disabled: false },
        { label: '五月', value: 4, disabled: false },
        { label: '六月', value: 5, disabled: false },
        { label: '七月', value: 6, disabled: false },
        { label: '八月', value: 7, disabled: false },
        { label: '九月', value: 8, disabled: false },
        { label: '十月', value: 9, disabled: false },
        { label: '十一月', value: 10, disabled: false },
        { label: '十二月', value: 11, disabled: false },
      ],
      hourAndMinutes: {
        hour: '00',
        minutes: '00',
      },
      oldHourAndMinutes: {
        oldHour: '00',
        oldMinutes: '00',
      },
      isBorder: {
        time: false,
        hourMinutes: false,
      },
    };
  },
  props: {
    // v-model
    value: {
      type: [Date, String, Number],
      default: '',
    },
    // 时间格式
    format: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    //默认显示
    placeholder: {
      type: String,
      default: '',
    },
    //是否禁用
    disabled: {
      type: [Boolean, String],
      default: false,
    },
    //可选时间范围
    disabledDate: {
      type: [Date, String, Number],
    },
    //可输入时间范围
    selectableRange: {
      type: [Date, String, Number],
    },
    // 清空时间按钮
    clear: {
      type: Boolean,
      default: true,
    },
    isDateTime: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    dateList() {
      //获取当月的天数
      let currentMonthLength = new Date(this.checkYear, this.checkMonth + 1, 0).getDate();
      //先将当月的日期塞入dateList
      let dateList = Array.from({ length: currentMonthLength }, (val, index) => {
        return {
          currentMonth: true,
          value: index + 1,
        };
      });
      // 获取当月1号的星期是为了确定在1号前需要插多少天
      let startDay = new Date(this.checkYear, this.checkMonth, 1).getDay();
      // 确认上个月一共多少天
      let previousMongthLength = new Date(this.checkYear, this.checkMonth, 0).getDate();
      // 在1号前插入上个月日期
      for (let i = 0, len = startDay; i < len; i++) {
        dateList = [
          {
            previousMonth: true,
            value: previousMongthLength - i,
            disabled: false,
          },
        ].concat(dateList);
      }
      // 补全剩余位置
      for (let i = 1, item = 1; i < 15; i++, item++) {
        dateList[dateList.length] = { nextMonth: true, value: i };
      }
      // console.log(dateList, "dateList");
      return dateList;
    },
    changecheckMonth() {
      return this.monthList[this.checkMonth].label;
    },
    yearList() {
      let dbDate = this.disabledDate && moment(this.disabledDate).format('YYYY');
      let arr = Array.from({ length: 12 }, (value, index) => parseFloat(this.checkYear) + index);
      let yearArr = [];
      arr.forEach(item => {
        yearArr.push({
          year: item,
          disabled: dbDate ? (item > dbDate ? true : false) : false,
        });
      });
      return yearArr;
    },
    dateTime() {
      let time = this.checkYear;
      if (this.checkMonth < 10) {
        time = time + '-' + '0' + (this.checkMonth + 1);
      } else {
        time = time + '-' + (this.checkMonth + 1);
      }
      // if (this.checkDay < 10) {
      time = time + '-' + this.checkDay;
      // } else {
      //   time = time + "-" + this.checkDay;
      // }
      return time;
    },
    showDateValue() {
      if (!this.value) return this.placeholder;
      return moment(this.dateValue).format(this.isDateTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm');
    },
  },
  watch: {
    'hourAndMinutes.hour'(val) {
      if (val > 23 || val < 0) {
        this.hourAndMinutes.hour = '';
      } else if (val.length > 2) {
        this.hourAndMinutes.hour = val.slice(1);
      }
      if (this.hourAndMinutes.hour && val > 2) {
        this.$refs.minutesInput && this.$refs.minutesInput.focus();
      }
    },
    'hourAndMinutes.minutes'(val) {
      if (val > 59 || val < 0) {
        this.hourAndMinutes.minutes = '';
      } else if (val.length > 2) {
        this.hourAndMinutes.minutes = val.slice(1);
      }
    },
    value: {
      handler(val, oldVal) {
        // console.log(val);
        if (val) {
          this.dateValue = moment(val).format(this.format);
          if (this.timeFormat) {
            this.timeValue = moment(val).format(this.timeFormat);
          }
        } else {
          this.dateValue = moment(Date.now()).format(this.format);
          // this.value = moment(Date.now()).format(this.format);
          if (this.timeFormat) {
            this.timeValue = moment(Date.now()).format(this.timeFormat);
          }
        }
        this.oldDateValue = moment(this.dateValue).format(this.format);
        this.checkYear = moment(this.dateValue).format('YYYY');
        this.checkMonth = parseFloat(moment(this.dateValue).format('MM')) - 1;
        this.checkDay = moment(this.dateValue).format('DD');
        this.hourAndMinutes.hour = moment(this.dateValue).format('HH');
        this.hourAndMinutes.minutes = moment(this.dateValue).format('mm');
        this.oldHourAndMinutes.oldHour = moment(this.dateValue).format('HH');
        this.oldHourAndMinutes.oldMinutes = moment(this.dateValue).format('mm');
      },
      immediate: true,
    },
    format() {
      if (this.value) {
        this.dateValue = moment(this.value).format(this.format);
        if (this.timeFormat) {
          this.timeValue = moment(this.value).format(this.timeFormat);
        }
      }
    },
    checkYear: {
      handler(val) {
        if (!this.disabledDate) return;
        if (val.disabled) {
          this.monthList.forEach(item => {
            item.disabled = true;
          });
        }
        let dbDate = this.disabledDate && moment(this.disabledDate).format('YYYY');
        if (val == dbDate) {
          this.monthList.forEach(item => {
            item.disabled = item.value > moment(this.disabledDate).format('M') - 1;
          });
        }
      },
      immediate: true,
    },
    checkMonth: {
      handler(val) {
        if (!this.disabledDate) return;
        let that = this;
        let dbDate = this.disabledDate && moment(this.disabledDate).format('M');
        if (val > dbDate - 1) {
          that.dateList.forEach(item => {
            item.disabled = true;
          });
        }
        nowMonth();
        this.$nextTick(() => {
          nowMonth();
        });
        function nowMonth() {
          if (val == dbDate - 1) {
            that.dateList.forEach(item => {
              item.disabled = item.previousMonth
                ? false
                : item.value > moment(that.disabledDate).format('D') || item.nextMonth;
            });
          }
        }
      },
      immediate: true,
    },
  },
  mounted() {
    document.addEventListener('click', this.windowClick);
    // document.addEventListener("scroll", this.windowScroll, true);
    document.addEventListener('keydown', this.enterEvent);
  },
  methods: {
    windowClick(e) {
      e.stopPropagation();
      if (!this.disabled) {
        if (!this.panelState) return;
        this.submitDate();
        this.panelState = false;
        this.isBorder.hourMinutes = false;
        this.isBorder.time = false;
        // console.log(456789);
      }
    },
    // windowScroll(e) {
    //   e.stopPropagation();
    //   this.$nextTick(() => {
    //     if (this.$refs.selectDatePicker) {
    //       let firstHeight =
    //         this.$refs.datePicker.getBoundingClientRect().top +
    //         this.$refs.datePicker.offsetHeight;
    //       let height = firstHeight - e.target.scrollTop;
    //       this.$refs.selectDatePicker.style.top = height + "px";
    //     }
    //   });
    // },
    openPanel(e) {
      let datePanel = document.querySelector('body .date-panel');
      datePanel && document.querySelector('body').removeChild(datePanel);
      //点击输入框
      this.panelState = true;
      this.panelType = 'date';
      this.$nextTick(() => {
        const body = document.querySelector('body');
        if (body.append) {
          body.append(this.$refs.selectDatePicker);
        } else {
          body.appendChild(this.$refs.selectDatePicker);
        }
        this.$refs.hourInput.select();
        this.isBorder.hourMinutes = true;
        let top = this.$refs.datePicker.getBoundingClientRect().top + this.$refs.datePicker.offsetHeight;
        let left = this.$refs.datePicker.getBoundingClientRect().left;
        let dateLeft = this.$refs.selectDatePicker.clientWidth;
        let dateTop = this.$refs.selectDatePicker.clientHeight;
        let bodyWidth = document.documentElement.clientWidth || document.body.clientWidth;
        let bodyHeight = document.documentElement.clientHeight || document.body.clientHeight;
        // console.log(bodyWidth, dateLeft, left);
        if (top + dateTop > bodyHeight) {
          top = bodyHeight - dateTop;
        }
        if (left + dateLeft > bodyWidth) {
          left = bodyWidth - dateLeft;
        }
        this.$refs.selectDatePicker.style.top = top + 'px';
        this.$refs.selectDatePicker.style.left = left + 'px';
      });
    },
    //此刻
    nowBtn(e) {
      e.preventDefault();
      this.panelState = false;
      let now = moment().format('YYYY-MM-DD HH:mm:ss');
      // console.log(this.showDateValue);

      this.$emit('input', now);
      if (this.oldDateValue != moment(now).format('YYYY-MM-DD HH:mm')) {
        this.$emit('change');
      }
    },
    clearBtn(e) {
      e.stopPropagation();
      this.dateValue = null;
      this.$emit('input', this.dateValue);
      this.$emit('change');
    },
    submitDate(e) {
      e && e.preventDefault();
      let second = moment(Date.now()).format('ss');
      // console.log(this.showDateValue);
      if (this.selectableRange) {
        let timeArr = this.selectableRange.split(':');
        if (this.hourAndMinutes.hour > timeArr[0]) {
          this.hourAndMinutes.hour = this.oldHourAndMinutes.oldHour;
          if (this.hourAndMinutes.minutes > timeArr[1]) {
            this.hourAndMinutes.minutes = this.oldHourAndMinutes.oldMinutes;
          }
          this.$message({
            type: 'warning',
            message: '不能大于当前时间',
          });
        }
        if (this.hourAndMinutes.hour == timeArr[0] && this.hourAndMinutes.minutes > timeArr[1]) {
          this.hourAndMinutes.minutes = this.oldHourAndMinutes.oldMinutes;
          this.$message({
            type: 'warning',
            message: '不能大于当前时间',
          });
        }
      }
      if (this.hourAndMinutes.hour.length > 2) {
        this.hourAndMinutes.hour = this.hourAndMinutes.hour.slice(1);
      }
      if (this.hourAndMinutes.minutes.length > 2) {
        this.hourAndMinutes.minutes = this.hourAndMinutes.minutes.slice(1);
      }
      this.dateValue =
        this.dateTime + ' ' + this.hourAndMinutes.hour + ':' + this.hourAndMinutes.minutes + ':' + second;
      this.$emit('input', moment(this.dateValue).format('YYYY-MM-DD HH:mm:ss'));
      if (this.oldDateValue != moment(this.dateValue).format('YYYY-MM-DD HH:mm')) {
        this.$emit('change');
        // console.log(123123);
      }
      this.panelState = false;
    },
    selectDate(item, falg) {
      if (falg) return;
      item.previousMonth && --this.checkMonth;
      item.nextMonth && ++this.checkMonth;
      //选择日期
      this.panelState = true;
      this.checkDay = item.value;
    },
    selectYear(item, falg) {
      if (falg) return;
      this.panelState = true;
      this.checkYear = item;
      this.panelType = 'month';
    },
    selectMonth(item, falg) {
      if (falg) return;
      this.panelState = true;
      this.checkMonth = item.value;
      this.panelType = 'date';
    },
    left() {
      this.panelState = true;
      if (this.panelType === 'year') this.checkYear--;
      else {
        if (this.checkMonth === 0) {
          this.checkYear--;
          this.checkMonth = 11;
        } else this.checkMonth--;
      }
    },
    leftBig() {
      this.panelState = true;
      if (this.panelType === 'year') this.checkYear -= 12;
      else this.checkYear--;
    },
    right() {
      this.panelState = true;
      if (this.panelType === 'year') this.checkYear++;
      else {
        if (this.checkMonth === 11) {
          this.checkYear++;
          this.checkMonth = 0;
        } else this.checkMonth++;
      }
    },
    rightBig() {
      this.panelState = true;
      if (this.panelType === 'year') this.checkYear += 12;
      else this.checkYear++;
    },
    hourClick() {
      this.$refs.hourInput.select();
    },
    rightTimeClick() {
      this.$refs.hourInput.select();
      this.isBorder.hourMinutes = true;
      this.isBorder.time = false;
    },
    leftTimeClick() {
      this.isBorder.time = true;
      this.isBorder.hourMinutes = false;
    },
    hourBlur() {
      if (!this.hourAndMinutes.hour) this.hourAndMinutes.hour = this.oldHourAndMinutes.oldHour;
      if (this.hourAndMinutes.hour < 10 && this.hourAndMinutes.hour.length < 2) {
        this.hourAndMinutes.hour = '0' + this.hourAndMinutes.hour;
      }
    },
    minutesBlur() {
      if (!this.hourAndMinutes.minutes) this.hourAndMinutes.minutes = this.oldHourAndMinutes.oldMinutes;
      if (this.hourAndMinutes.minutes < 10) {
        this.hourAndMinutes.minutes = '0' + this.hourAndMinutes.minutes;
      }
    },
    minutesClick(e) {
      this.$refs.minutesInput.select();
      e.stopPropagation();
    },
    rightKeyEvent() {
      this.oldHourAndMinutes.oldHour = this.hourAndMinutes.hour;
      this.hourAndMinutes.hour = '';
      this.$refs.hourInput.focus();
      // this.$refs.hourInput.select();
    },
    leftKeyEvent() {
      this.oldHourAndMinutes.oldMinutes = this.hourAndMinutes.minutes;
      this.hourAndMinutes.minutes = '';
      this.$refs.minutesInput.focus();
      // this.$refs.minutesInput.select();
    },
    changeTimeEvent(e, type) {
      // console.log(type);
      let value = e.target.value;
      const reg = /\D/g;
      if (value.match(reg)) {
        this.hourAndMinutes[type] = parseInt(value.replace(reg, '')) || '';
      }
    },
    enterEvent(e) {
      if (e.keyCode == 13 && this.panelState) {
        this.hourBlur();
        this.minutesBlur();
        this.submitDate();
      }
    },
  },
  beforeDestroy() {
    if (this.panelState) {
      document.querySelector('body').removeChild(this.$refs.selectDatePicker);
    }
    document.removeEventListener('click', this.windowClick);
    // document.removeEventListener("scroll", this.windowScroll);
    document.removeEventListener('keydown', this.enterEvent);
  },
};
</script>
<style lang="scss" scoped>
$shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
$theme-color: #00c8ad; //主题色
@import url('./font/iconfont.css');
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
  display: inline-block;
  .dateShow {
    text-align: left;
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    line-height: inherit;
    padding: 0 5px;
    border: 1px solid #dcdee2;
    border-radius: 4px;
    color: #606266;
    outline: 0;
    background-color: #fff;
    background-image: none;
    position: relative;
    cursor: text;
    transition: border 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    // margin-bottom: 6px;
    font-size: 14px !important;
    white-space: nowrap;
    .clearDate {
      position: absolute;
      right: 2px;
      /* top: 2px; */
      color: red;
      font-size: 12px;
      display: none;
    }
    &:hover {
      .clearDate {
        display: inline-block;
        &:hover {
          cursor: pointer;
        }
      }
    }
  }
  .dateShow {
    span {
      color: #c0c4cc;
      margin: 0 5px 0 0 !important;
    }
  }
}
.dInput {
  text-align: left;
  display: flex;
  margin-top: 15px;
  justify-content: space-around;
  .first-time-span {
    width: 143px;
    height: 35px;
    opacity: 1;
    background: #ffffff;
    border: 1px solid #dcdfe6;
    color: #606266;
    border-radius: 6px;
    font-size: 14px;
    padding-left: 16px;
    line-height: 35px;
  }
  .dInput-time {
    width: 143px !important;
    height: 35px !important;
    opacity: 1;
    background: #ffffff;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    display: flex;
    overflow: hidden;
    span:first-of-type {
      margin: 0;
      line-height: 30px;
      font-weight: bold;
      font-size: 16px !important;
      color: #606266;
    }
    .dInput-text {
      height: 100%;
      width: 34px;
      text-align: center;
      border: 0;
      // border-radius: 6px;
      margin: 0;
      padding: 0;
      color: #606266;
      font-size: 15px !important;
      background: transparent;
      outline: none;
    }
    .dInput-text:focus {
      background-color: rgb(207, 205, 205);
      color: transparent;
      text-shadow: 0 0 0 #000;
    }
    .dInput-text::selection {
      background-color: transparent;
      color: transparent;
      text-shadow: 0 0 0 #000;
    }

    .dInput-text::-moz-selection {
      background-color: transparent;
      color: transparent;
      text-shadow: 0 0 0 #000;
    }

    .dInput-text::-webkit-selection {
      background-color: transparent;
      color: transparent;
      text-shadow: 0 0 0 #000;
    }
  }
  .dInput-time.dInput-time-disInput {
    background-color: #e1e1e1;
    padding-left: 10px;
    font-weight: 100;
    span {
      font-weight: normal;
      line-height: 35px;
      color: #606266;
    }
  }
}
.checkClass {
  border: 1px solid #00c8ad !important;
}
input:focus {
  border-color: $theme-color;
  outline: 0;
}
.date-panel {
  position: absolute;
  z-index: 10000;
  width: 346px;
  height: 390px;
  border-radius: 6px;
  box-shadow: $shadow;
  background: #fff;
  input {
    height: 24px;
  }
}
.date-footer {
  width: 100%;
  height: 44px;
  padding: 5px;
  text-align: right;
  border-top: 1px solid #dee1e7;
  padding: 10px 20px 0 0;
  button {
    font-size: 18px;
  }
  .btn-primary {
    width: 56px;
    height: 30px;
  }
}
.topbar {
  padding-top: 8px;
  display: flex;
  justify-content: space-around;
  // margin: 10px 0;
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
  .elIcon {
    color: #1bad96;
    font-size: 22px;
    vertical-align: middle;
  }
  .year,
  .month {
    width: auto;
    margin: 0 5px;
    vertical-align: middle;
  }
}
ul {
  list-style: none;
  padding: 0;
  margin: 0 auto;
}
.year-list {
  height: 260px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  .selected {
    background: $theme-color;
    border-radius: 4px;
    color: #fff;
  }
  .year-month-disabled {
    background-color: #f5f7fa;
    cursor: not-allowed;
    span:hover {
      background-color: #f5f7fa;
      color: #000;
    }
  }
  li {
    display: inline-block;
    width: 70px;
    height: 50px;
    line-height: 50px;
    border-radius: 10px;
    cursor: pointer;
    overflow: hidden;
  }
  span {
    display: inline-block;
    // line-height: 16px;
    // padding: 8px;
    text-align: center;
    width: 100%;
    height: 100%;
    &:hover {
      background: #e1f0fe;
      color: $theme-color;
    }
  }
}
.date-week {
  width: 100%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  .weekday {
    display: inline-block;
    font-size: 13px;
    width: 30px;
    text-align: center;
  }
}

.date-list {
  width: 100%;
  text-align: left;
  height: 233px;
  overflow: hidden;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  li {
    display: inline-block;
    width: 31px;
    height: 31px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;
    color: #000;
    border: 1px solid #fff;
    border-radius: 4px;
    margin: 3px 6px;
    &:hover {
      // background: $theme-color;
      // border-radius: 50%;
      color: $theme-color;
    }
  }
  .dayDisabled {
    background-color: #f5f7fa;
    cursor: not-allowed;
    &:hover {
      color: #000;
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
.date-picker-disabled {
  text-align: left;
  display: inline-block;
  box-sizing: border-box;
  height: 32px;
  line-height: 32px;
  padding: 0 5px;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  color: #7e7e7f;
  outline: 0;
  background-color: #f5f7fa;
  background-image: none;
  cursor: text;
  transition: border 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  // margin-bottom: 6px;
  font-size: 14px !important;
  cursor: not-allowed;
  position: relative;
  width: 210px;
  span {
    margin-right: 5px;
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
