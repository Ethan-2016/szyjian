<template>
  <div
    :style="{
      width,
      height,
      'max-height': height,
      'border-radius': borderRadius,
      'border-color': isError || errorFormat ? errColor : borderColor,
      background,
    }"
    class="sz-datetime-content"
  >
    <div
      v-if="hasShortCutBtn"
      :style="{
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: '20px',
        cursor: 'pointer',
        'border-right': '1px solid ' + borderColor,
      }"
      @click="preDay()"
    >
      <i class="el-icon-arrow-left"></i>
    </div>
    <div
      :style="{
        position: 'relative',
        height: '100%',
        width: hasShortCutBtn ? 'calc(100% - 44px)' : '100%',
        'margin-left': hasShortCutBtn ? '22px' : '0',
      }"
      @click.stop
    >
      <div
        class="show-time"
        v-if="!isEditDatetime"
        :style="{
          'line-height': height,
          'border-radius': borderRadius,
          padding: showTimePadding,
          'font-size': fontSize,
          left: '0px',
          right: '0px',
          width: '100%',
          'background-color': disabled ? '#ddd' : background,
          cursor: disabled ? 'not-allowed' : 'auto',
          color: value ? '#181717' : 'rgb(188 190 194)',
          'text-align': value ? 'center' : 'left',
        }"
        @click="editDateTime"
        @dblclick="dblEditDateTime"
        @mouseover="isShowClear = true"
        @mouseleave="isShowClear = false"
      >
        {{ value | formatDateTime(format, placeholder) }}
        <i
          v-if="isClear && isShowClear && !isEditDatetime && value && !disabled"
          class="el-icon-circle-close"
          :style="{ height, 'line-height': height, 'font-size': fontSize }"
          @click.stop="clearDetetime"
        ></i>
      </div>
      <div
        class="sz-time-box"
        v-else
        @mousedown="mouseDownTimeBox"
        @mouseup="mouseUpTimeBox"
        :style="{ background, 'border-radius': borderRadius }"
      >
        <span
          v-if="value && !showTimeArr.length"
          @click.stop="openDateIcon"
          :style="{
            'line-height': height,
            display: 'block',
            'font-size': fontSize,
          }"
          class="date"
          >{{ dateStr }}</span
        >
        <input
          v-else
          v-model="timeStr"
          ref="timeInput"
          @input="checkTimeStr"
          @click.stop
          @dblclick="inputDblClick"
          :style="{ width: inputWidth, 'font-size': fontSize }"
        />
        <i
          v-if="!(value && !showTimeArr.length)"
          class="el-icon-date"
          :style="{ height, 'line-height': height, 'font-size': fontSize }"
          @click.stop="openDateIcon"
        ></i>
      </div>
      <el-date-picker
        v-if="isShowDatePicker"
        v-model="dateStr"
        ref="datePicker"
        type="date"
        :style="{ height: '100%' }"
        @blur="datePickerBlur"
        placeholder="选择日期"
      >
      </el-date-picker>
      <!-- :picker-options="pickerOptions" -->
    </div>
    <div
      v-if="hasShortCutBtn"
      :style="{
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: '20px',
        cursor: 'pointer',
        'border-left': '1px solid ' + borderColor,
      }"
      @click="afterDay()"
    >
      <i class="el-icon-arrow-right"></i>
    </div>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import moment from "moment";
export default {
  props: {
    value: {
      type: String | Object,
    },
    // defaultSelectTimeType: {
    //   default: "mm",
    //   type: String
    // },
    borderColor: {
      default: "#dcdfe6",
      type: String,
    },
    placeholder: {
      default: "",
      type: String,
    },
    errColor: {
      default: "red",
      type: String,
    },
    width: {
      default: "150px",
      type: String,
    },
    height: {
      default: "24px",
      type: String,
    },
    inputWidth: {
      default: "100%",
      type: String,
    },
    borderRadius: {
      default: "5px",
      type: String,
    },
    format: {
      default: "yyyy-MM-dd HH:mm:ss", //yyyy-MM-dd HH:mm:ss
      type: String,
    },
    valueFormat: {
      default: "yyyy-MM-dd HH:mm:ss", //yyyy-MM-dd HH:mm:ss
      type: String,
    },
    fontSize: {
      default: "12px", //yyyy-MM-dd HH:mm:ss
      type: String,
    },
    background: {
      default: "#fff", //yyyy-MM-dd HH:mm:ss
      type: String,
    },
    showTimePadding: {
      default: "0 5px", //yyyy-MM-dd HH:mm:ss
      type: String,
    },
    errorFormat: {
      default: false, //yyyy-MM-dd HH:mm:ss
      type: Boolean,
    },
    isClear: {
      default: true, //yyyy-MM-dd HH:mm:ss
      type: Boolean,
    },
    isDelTip: {
      default: false, //yyyy-MM-dd HH:mm:ss
      type: Boolean,
    },
    disabled: {
      default: false, //yyyy-MM-dd HH:mm:ss
      type: Boolean,
    },
    autoFocus: {
      default: false, //yyyy-MM-dd HH:mm:ss
      type: Boolean,
    },
    isEditDate: {
      default: false, //yyyy-MM-dd HH:mm:ss
      type: Boolean,
    },
    hasShortCutBtn: {
      default: false, //yyyy-MM-dd HH:mm:ss
      type: Boolean,
    },
  },
  filters: {
    formatDateTime(val, format, placeholder) {
      let datetime;
      if (val) {
        datetime = moment(val).format(format.replace(/d/g, "D"));
      } else {
        datetime = placeholder;
      }
      if (datetime == "Invalid date") {
        return "无效时间";
      } else {
        return datetime;
      }
    },
  },
  mounted() {
    if (this.autoFocus) {
      this.editDateTime();
    }
  },
  watch: {
    value: {
      handler(newVal, oldVal) {
        if (this.valueFormat) {
          let datetime = newVal; // || moment().format(this.valueFormat.replace(/d/g,"D"))
          this.handlerDate(this.valueFormat, datetime);
        }
      },
    },
    valueFormat: {
      handler(newVal, oldVal) {
        if (newVal) {
          let datetime = this.value; // || moment().format(this.valueFormat.replace(/d/g,"D"))
          this.handlerDate(newVal, datetime);
        }
      },
      immediate: true,
    },
    format: {
      handler(newVal, oldVal) {
        if (newVal) {
          let datetime =
            this.value || moment().format(this.valueFormat.replace(/d/g, "D"));
          this.handlerDate(this.valueFormat, datetime);
        }
      },
    },
    dateStr: {
      handler(newVal, oldVal) {
        // this.dateArr
        let valueFormat = this.dateArr.join("-").replace(/d/g, "D");
        let date = newVal ? moment(newVal).format(valueFormat) : null;
        this.dateStr = date;
        this.isEdit = true;
        // console.log("this.valueFormat", this.timeStr, this.valueFormat)
        if (this.timeStr) {
          this.saveEditVal();
        } else if (!this.valueFormat.includes("HH")) {
          this.saveEditVal();
        }
      },
      deep: true,
    },
  },
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
      datetime: "",
      datetimeObj: null,
      dateStr: "",
      dateArr: "",
      timeObj: null,
      timeArr: null,
      timeStr: "",
      showTimeArr: [],
      isEditDatetime: false,
      focusTimeType: "",
      isError: false,
      isShowClear: false,
      startPos: 0,
      endPos: 0,
      timer: null,
      inputClickTimer: null,
      isClick: false,
      isShowDatePicker: false,
      isEdit: false,
      isWheel: false,
    };
  },
  destroyed() {
    this.clearEvent();
  },
  methods: {
    preDay() {
      this.dateStr = moment(this.dateStr)
        .subtract(1, "d")
        .format(this.valueFormat.replace(/d/g, "D"));
    },
    afterDay() {
      this.dateStr = moment(this.dateStr)
        .add(1, "d")
        .format(this.valueFormat.replace(/d/g, "D"));
    },
    closeEdit(isClearDetetime) {
      let datetime = "";
      let nohasDate = false;
      let nohasTime = false;
      if (this.dateArr && this.dateArr.length) {
        datetime = this.dateStr;
      }
      if (this.timeArr && this.timeArr.length) {
        let timeStr = this.timeStr ? Object.values(this.timeObj).join(":") : "";
        if (datetime) {
          if (timeStr) {
            datetime = datetime + " " + timeStr;
          } else {
            nohasTime = true;
          }
        } else {
          if (this.dateArr && this.dateArr.length) {
            if (timeStr) {
              nohasDate = true;
            }
          } else {
            datetime = timeStr;
          }
        }
      }
      this.isShowClear = false;
      this.clearEvent();
      this.isEditDatetime = false;
      if (nohasDate) {
        // this.$message({
        //   type: 'warning',
        //   message: '没有选择日期'
        // });
        this.timeStr = "";
        return;
      }
      if (nohasTime) {
        // this.$message({
        //   type: 'warning',
        //   message: '没有填写时间'
        // });
        this.dateStr = "";
        return;
      }
      // console.log('isClearDetetime', isClearDetetime, this.isEdit, datetime, nohasDate, nohasTime)
      if (isClearDetetime===true || (this.isEdit && (datetime || (nohasDate && nohasTime && !datetime)))) {
        this.isEdit = false;
        this.$emit("input", datetime);
        this.$emit("change", datetime);
        this.$emit("update:errorFormat", false);
        this.clearEvent();
      }
    },
    saveEditVal() {
      let datetime = "";
      let nohasDate = false;
      let nohasTime = false;
      if (this.dateArr && this.dateArr.length) {
        datetime = this.dateStr;
      }
      if (this.timeArr && this.timeArr.length) {
        let timeStr = this.timeStr ? Object.values(this.timeObj).join(":") : "";
        if (datetime) {
          if (timeStr) {
            datetime = datetime + " " + timeStr;
          } else {
            nohasTime = true;
          }
        } else {
          if (this.dateArr && this.dateArr.length) {
            if (timeStr) {
              nohasDate = true;
            }
          } else {
            datetime = timeStr;
          }
        }
      }
      if (nohasDate) {
        this.timeStr = "";
      }
      if (nohasTime) {
        this.dateStr = "";
      }
      // console.log('this.value', this.value)
      if (datetime != this.value) {
        this.$emit("input", datetime);
        this.$emit("update:errorFormat", false);
        if (!this.valueFormat.includes("HH")) {
          this.closeEdit();
        }
      }
    },
    clearEvent() {
      document.onkeydown = null;
      document.removeEventListener("click", this.closeEdit);
      document.removeEventListener("mousewheel", this.wheel, { passive: true });
    },
    clearDetetime() {
      this.isEdit = true;
      if (!this.isDelTip) {
        this.timeStr = "";
        this.dateStr = "";
        this.timeObj = {};
        this.closeEdit(true);
        return;
      }
      this.$confirm("此操作将删除该时间, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.timeStr = "";
          this.dateStr = "";
          this.timeObj = {};
          this.closeEdit(true);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    handlerDate(valueFormat, datetime, isEmptyTime) {
      let keys = valueFormat.split(/[-\s:]/);
      let showKeys = this.format.split(/[-\s:]/);
      let values = []; //datetime ? datetime.split(/[-\s:]/) : []
      let datetimeObj = {};
      let dateObj = {};
      let timeObj = {};
      let dateTypeArr = ["yyyy", "MM", "dd"];
      let timeTypeArr = ["HH", "mm", "ss"];
      let dateArrValue = [];
      let dateArrKey = [];
      let handlerDate;
      if (datetime) {
        handlerDate = moment(datetime).format(valueFormat.replace(/d/g, "D"));
      }
      if (handlerDate && handlerDate != "Invalid date") {
        // keys.length==values.length &&
        this.isError = false;
        values = handlerDate.split(/[-\s:]/);
      } else if (handlerDate && handlerDate == "Invalid date") {
        let datetime = moment().format(valueFormat.replace(/d/g, "D"));
        values = datetime.split(/[-\s:]/);
        this.$message({
          message: "日期时间格式错误",
          type: "warning",
          duration: 2000,
        });
        this.isError = true;
      }
      keys.forEach((item, index) => {
        datetimeObj[item] = values[index];
        if (dateTypeArr.includes(item)) {
          dateArrKey.push(item);
          if (values[index]) {
            dateArrValue.push(values[index]);
            dateObj[item] = values[index];
          }
        }
        if (timeTypeArr.includes(item)) {
          timeObj[item] = values[index] || "00";
        }
      });
      let showTimeArray = [];
      let showTimeValArr = [];
      showKeys.forEach((item, index) => {
        if (timeTypeArr.includes(item)) {
          showTimeArray.push(item);
          showTimeValArr.push(timeObj[item]);
        }
      });
      this.dateStr = dateArrValue.join("-");
      this.dateArr = dateArrKey;
      this.datetimeObj = Object.assign({}, datetimeObj);
      this.timeObj = Object.assign({}, timeObj);
      this.timeArr = Object.keys(this.timeObj);
      this.showTimeArr = showTimeArray;
      this.timeStr = datetime && !isEmptyTime ? showTimeValArr.join(":") : "";
    },
    checkTimeStr() {
      // if(!this.timeStr){
      //   this.timeStr = ''
      //   this.timeObj = {}
      //   return
      // }
      this.isEdit = true;
      if (this.timeStr.length < 2) {
        if (isNaN(+this.timeStr)) {
          this.timeStr = "";
        } else if (this.timeStr.length == 1 && +this.timeStr > 2) {
          this.timeStr = "0" + this.timeStr + ":00";
          this.checkTimeStr();
        }
        return;
      } else if (this.timeStr.length >= 2 && !this.timeStr.includes(":")) {
        if (isNaN(+this.timeStr)) {
          this.timeStr = "";
          return;
        }
      }
      let input = this.$refs["timeInput"];
      // let selectionStart = input.selectionStart
      let selectionEnd = input.selectionEnd;
      let pos = Math.floor(selectionEnd / 4);
      let timeStrArr = this.timeStr.split(":");
      let value = timeStrArr[pos];
      let type = this.showTimeArr[pos];
      let res = this.checkValue(value, type);
      timeStrArr = [];
      this.showTimeArr.forEach((item, index) => {
        timeStrArr.push(this.timeObj[item]);
      });
      this.timeStr = timeStrArr.join(":");
      this.timeObj = Object.assign({}, this.timeObj);
      this.saveEditVal();
      // console.log("pospospos",pos, timeStrArr.length - 1, res, type)
      if (!this.isWheel) {
        setTimeout(() => {
          if (res <= 2 || type !== "HH") {
            if (pos == timeStrArr.length - 1 && res > 5) {
              let input = this.$refs["timeInput"];
              input.select();
              input.selectionStart = pos * 3;
              input.selectionEnd = pos * 3 + 2;
            } else {
              input.select();
              input.selectionStart = pos * 3 + 2;
              input.selectionEnd = pos * 3 + 2;
            }
          } else if (pos < timeStrArr.length - 1) {
            input.select();
            pos++;
            input.selectionStart = pos * 3;
            input.selectionEnd = pos * 3 + 2;
          }
        }, 0);
      } else {
        this.isWheel = false;
      }
    },
    checkValue(value, type) {
      if (isNaN(+value)) {
        value = "00";
      } else {
        if (value.length > 2) {
          if (+value.substr(0, 2) > 5) {
            value = value.substr(0, 2);
          }
        }
        let max = 60;
        if (type == "HH") {
          max = 24;
        } else {
          max = 60;
        }
        if (+value >= max) {
          value = max - 1;
        } else if (+value < 0) {
          value = "00";
        }
      }
      value = +value + "";
      this.timeObj[type] = value.padStart(2, "0");
      return this.timeObj[type];
    },
    editDateTime() {
      if (this.disabled) {
        return;
      }
      // clearTimeout(this.timer);
      let that = this;
      // this.timer = setTimeout(function(){
      // clearTimeout(this.timer);
      document.body.click();
      that.isEditDatetime = true;
      if (!that.value) {
        setTimeout(() => {
          that.handlerDate(
            that.valueFormat,
            moment().format(that.valueFormat.replace(/d/g, "D")),
            true
          );
          that.$refs["timeInput"].focus();
        }, 0);
      } else {
        if (that.timeArr.length) {
          that.handlerDate(that.valueFormat, that.value);
          that.initInputFocus();
          setTimeout(() => {
            let input = that.$refs["timeInput"];
            if (input) {
              //决定初始化时选HH，还是选mm
              input.selectionStart = 0; //that.value.length;
              input.selectionEnd = 0; //that.value.length;
              that.selectTxt();
            }
          }, 0);
        } else {
          that.focusDatePicker();
        }
      }
      document.addEventListener("click", that.closeEdit);
      document.onkeydown = (e) => {
        that.keyEventHandler(e);
      };
      document.addEventListener("mousewheel", this.wheel, { passive: false });
      // }, 100)
    },
    wheel(event) {
      var delta = 0;
      event.preventDefault();
      if (!event) event = window.event;
      if (event.wheelDelta) {
        //IE、chrome浏览器使用的是wheelDelta，并且值为“正负120”
        delta = event.wheelDelta / 120;
        if (window.opera) delta = -delta; //因为IE、chrome等向下滚动是负值，FF是正值，为了处理一致性，在此取反处理
      } else if (event.detail) {
        //FF浏览器使用的是detail,其值为“正负3”
        delta = -event.detail / 3;
      }
      if (delta) {
        this.handle(delta);
      }
      return false;
    },
    //上下滚动时的具体处理函数
    handle: debounce(
      function (delta) {
        this.isWheel = true;
        let input = this.$refs["timeInput"];
        clearTimeout(this.setTimeoutWheelId);
        let selectionStart = input.selectionStart;
        let selectionEnd = input.selectionEnd;
        if (delta > 0) {
          //向下滚动
          if (this.timeStr.includes(":")) {
            let timeStrArr;
            if (this.timeStr.substring(0, input.selectionStart).includes(":")) {
              timeStrArr = this.timeStr.split(":");
              timeStrArr[1] = (++timeStrArr[1]).toString();
              if (+timeStrArr[1] > 59) {
                timeStrArr[1] = "0";
              }
            } else {
              timeStrArr = this.timeStr.split(":");
              timeStrArr[0] = (++timeStrArr[0]).toString();
              if (+timeStrArr[0] > 23) {
                timeStrArr[0] = "0";
              }
            }
            this.timeStr = timeStrArr.join(":");
          } else {
            this.timeStr = (++this.timeStr).toString();
            if (+this.timeStr > 23) {
              this.timeStr = "0";
            }
          }
          // console.log("--------", "鼠标向上", input.selectionStart, this.timeStr, this.timeObj)
        } else {
          //向上滚动
          // console.log("--------", "鼠标向下", input.selectionStart)
          if (this.timeStr.includes(":")) {
            let timeStrArr;
            if (this.timeStr.substring(0, input.selectionStart).includes(":")) {
              timeStrArr = this.timeStr.split(":");
              timeStrArr[1] = (--timeStrArr[1]).toString();
              if (+timeStrArr[1] < 0) {
                timeStrArr[1] = "59";
              }
            } else {
              timeStrArr = this.timeStr.split(":");
              timeStrArr[0] = (--timeStrArr[0]).toString();
              if (+timeStrArr[0] < 0) {
                timeStrArr[0] = "23";
              }
            }
            this.timeStr = timeStrArr.join(":");
          } else {
            this.timeStr = (--this.timeStr).toString();
            if (+this.timeStr < 0) {
              this.timeStr = "23";
            }
          }
        }
        setTimeout(() => {
          input.selectionStart = selectionStart;
          input.selectionEnd = selectionEnd;
        });
        this.checkTimeStr();
      },
      150,
      { leading: true, trailing: false }
    ),
    dblEditDateTime() {
      if (this.disabled) {
        return;
      }
      // clearTimeout(this.timer);
      clearTimeout(this.inputClickTimer);
      document.body.click();
      this.isEditDatetime = true;
      let that = this;
      document.addEventListener("click", that.closeEdit);
      document.onkeydown = (e) => {
        this.keyEventHandler(e);
      };
      if (this.value) {
        let that = this;
        setTimeout(() => {
          let input = that.$refs["timeInput"];
          input.select();
          input.selectionStart = 0;
          input.selectionEnd = input.value.length;
        }, 0);
        return;
      }
      this.handlerDate(
        this.valueFormat,
        moment().format(this.valueFormat.replace(/d/g, "D"))
      );
      if (this.timeArr.length) {
        // this.initInputFocus()
        let that = this;
        setTimeout(() => {
          let input = that.$refs["timeInput"];
          input.selectionStart = 0;
          input.selectionEnd = input.value.length;
          that.startPos = 0;
          that.endPos = input.value.length;
        }, 0);
      } else {
        this.focusDatePicker();
      }
    },
    inputDblClick(){
      if(!this.timeStr){
        let nowDatetime = moment().format(this.valueFormat.replace(/d/g,"D"))
        let datetime;
        if(this.dateStr){
          datetime = this.dateStr + ' ' + nowDatetime.split(" ")[1]
        } else {
          datetime = nowDatetime
        }
        this.timeStr = nowDatetime.split(" ")[1]
        this.$emit("input", datetime);
      }else {
        let input = this.$refs["timeInput"];
        input.selectionStart = 0;
        input.selectionEnd = input.value.length;
        this.startPos = 0;
        this.endPos = input.value.length;
      }
    },
    initInputFocus() {
      this.$nextTick(() => {
        if (this.timeArr) {
          this.selectTxt();
          // this.focusTimeType = this.defaultSelectTimeType
        }
      });
    },
    selectTxt() {
      let input = this.$refs["timeInput"];
      // let endPos = this.timeStr.indexOf(":", this.startPos)
      let clickPos = input.selectionStart;
      let selectionStart = input.selectionStart;
      let selectionEnd = input.selectionEnd;
      input.select();
      if (selectionStart == selectionEnd) {
        if (this.startPos == 0 && this.endPos == 0) {
          input.selectionStart = 0;
          input.selectionEnd = 2;
          this.startPos = 0;
          this.endPos = 2;
        } else {
          let num = Math.floor(clickPos / 3);
          this.startPos = num * 3;
          this.endPos = num * 3 + 2;
          input.selectionStart = num * 3;
          input.selectionEnd = num * 3 + 2;
        }
      } else {
        input.selectionStart = selectionStart;
        input.selectionEnd = selectionEnd;
        this.startPos = selectionStart;
        this.endPos = selectionEnd;
      }
    },
    changeInput(item, key) {
      this.checkTimeStr();
    },
    mouseDownTimeBox() {
      if (this.timeArr.length) {
        clearTimeout(this.inputClickTimer);
        let that = this;
        this.isClick = true;
        let input = that.$refs["timeInput"];
        input.selectionStart = input.selectionEnd;
        this.inputClickTimer = setTimeout(function () {
          that.isClick = false;
        }, 300);
      } else {
        this.focusDatePicker();
      }
    },
    mouseUpTimeBox() {
      clearTimeout(this.inputClickTimer);
      if (this.isClick) {
        clearTimeout(this.inputClickTimer);
        this.initInputFocus();
      }
    },
    focusDatePicker() {
      this.isShowDatePicker = true;
      this.$nextTick(() => {
        this.$refs.datePicker.focus();
      });
    },
    datePickerBlur() {
      this.$emit("update:isEditDate", false);
    },
    keyEventHandler(e) {
      let event = e || window.event; // 标准化事件对象
      let index, key;
      let input = this.$refs["timeInput"];
      let timeStrArr = this.timeStr.split(":");
      let selectionStart = input.selectionStart;
      let selectionEnd = input.selectionEnd;
      let pos = Math.floor(selectionEnd / 3);
      switch (
        event.keyCode // 获取当前按下键盘键的编码
      ) {
        case 13:
          this.closeEdit(false);
          break;
        case 37: // 按下左箭头键
          if (selectionStart != selectionEnd && pos >= 1) {
            setTimeout(() => {
              input.select();
              pos--;
              input.selectionStart = pos * 3;
              input.selectionEnd = pos * 3 + 2;
            }, 0);
          }
          break;
        case 39: // 按下右箭头键
          if (selectionStart != selectionEnd && pos < timeStrArr.length - 1) {
            setTimeout(() => {
              input.select();
              pos++;
              input.selectionStart = pos * 3;
              input.selectionEnd = pos * 3 + 2;
            }, 0);
          }
          break;
        // case 38: // 按下上箭头键
        //   break;
        // case 40: // 按下下箭头键
        //   break;
      }
    },
    openDateIcon() {
      if (this.isEditDatetime) {
        this.isShowDatePicker = true;
        this.$nextTick(() => {
          this.$refs.datePicker.focus();
          this.$emit("update:isEditDate", true);
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
$font-size: 14px;
.sz-datetime-content {
  position: relative;
  border: 1px solid #ccc;
  color: rgb(24, 23, 23);
}
.show-time {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  text-align: center;
  // cursor: text;
  font-size: $font-size;
  z-index: 1;
  padding: 0 5px;
  box-sizing: border-box;
  .el-icon-circle-close {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 5px;
    cursor: pointer;
    color: red;
  }
}
.sz-time-box {
  display: flex;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  padding: 0 5px;
  // cursor: text;
  z-index: 1;
  .split-sign {
    padding: 0 2px;
    display: inline-flex;
    align-items: center;
    user-select: none;
    transform: translateY(-1px);
  }
  input {
    height: 100%;
    width: 100%;
    outline: none;
    border: none;
    padding: 0;
    border-radius: none;
    box-sizing: border-box;
    text-align: center;
    vertical-align: middle;
    font-size: $font-size;
  }
  i {
    display: inline-block;
    position: absolute;
    right: 5px;
    display: inline-block;
    padding: 0 5px 0 1px;
    cursor: pointer;
  }
  .date {
    width: 100%;
    height: 100%;
    text-align: center;
    font-size: $font-size;
  }
  & > span {
    display: flex;
    height: 100%;
  }
}
.el-input {
  position: absolute;
  opacity: 0;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  width: 100%;
  z-index: 0;
  ::v-deep {
    input {
      height: 100%;
    }
  }
}
</style>