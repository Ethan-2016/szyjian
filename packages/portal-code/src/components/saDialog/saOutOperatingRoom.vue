<template>
  <el-dialog
    :title="outRoomDialog.title"
    :visible.sync="outRoomDialog.visible"
    width="24%"
    :modal-append-to-body="false"
    @close="handleClose"
  >
    <div>
      <el-form ref="modelForm" :model="modelForm">
        <el-form-item size="mini" label="手术去向:" prop="whereaboutValue">
          <el-select size="mini" v-model="modelForm.whereaboutValue">
            <el-option
              v-for="i in surgeryWentList"
              :key="i.value"
              :label="i.name"
              :value="i.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          size="mini"
          class="where_about"
          v-show="modelForm.whereaboutValue === 2"
          label="计划类型:"
          prop="playType"
        >
          <el-radio size="mini" v-model="modelForm.playType" label="0"
            >计划转入ICU</el-radio
          >
          <el-radio size="mini" v-model="modelForm.playType" label="1"
            >非计划转入ICU</el-radio
          >
        </el-form-item>
        <!-- <el-form-item label="出室时间:" required class="time-pick">
                    <el-row>
                        <el-col :span="8">
                            <el-form-item prop="intoRoomDay">
                                <el-date-picker
                                    size="mini"
                                    type="date"
                                    placeholder="选择日期"
                                    v-model="modelForm.intoRoomDay"
                                ></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col style="text-align:center" :span="1">-</el-col>
                        <el-col :span="8">
                            <el-form-item prop="intoRoomTime">
                                <el-time-picker
                                    size="mini"
                                    placeholder="选择时间"
                                    format="HH:mm"
                                    v-model="modelForm.intoRoomTime"
                                ></el-time-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="2">
                            <el-button @click="currentTime" size="mini" type="primary">此刻</el-button>
                        </el-col>
                    </el-row>
                </el-form-item> -->
        <!-- <el-form-item size="mini" class="time-pick" label="出手术室:" prop="leaveTime">
                    <el-date-picker
                        v-model="modelForm.leaveTime"
                        type="datetime"
                        format="yyyy-MM-dd HH:mm"
                        placeholder="选择日期时间">
                    </el-date-picker>
                </el-form-item> -->
        <div class="leave-time">
          <span>出手术室:</span>
          <sz-datetime
            v-model="modelForm.leaveTime"
            format="yyyy-MM-dd HH:mm"
            valueFormat="yyyy-MM-dd HH:mm"
            width="193px"
            height="26px"
            placeholder="请输入"
            borderRadius="2px"
          ></sz-datetime>
        </div>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="outRoomDialog.visible = false"
        >取 消</el-button
      >
      <el-button size="mini" type="primary" @click="submitBtn">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: "saOutOperatingRoom",
  props: {
    outRoomDialog: {
      type: Object,
    },
  },
  data() {
    return {
      modelForm: {
        whereaboutValue: "", //手术去向
        playType: "", //计划类型
        leaveTime: "", //出院时间
        operStatus: 35, //手术状态
      },
      surgeryWentList: [
        { name: "PACU", value: 1 },
        { name: "ICU", value: 2 },
        { name: "病房", value: 3 },
        { name: "死亡", value: 4 },
        { name: "离院", value: 5 },
      ],
    };
  },
  methods: {
    submitBtn() {
      // this.modelForm.leaveTime = moment(this.modelForm.leaveTime).format("YYYY-MM-DD HH:mm");
      if (this.modelForm.whereaboutValue == "") {
        return this.$message.warning("请选择手术去向");
      }
      if (this.modelForm.leaveTime == "") {
        return this.$message.warning("请选择时间");
      }
      this.$emit("submitOutRoom", this.modelForm);
      this.outRoomDialog.visible = false;
    },
    handleClose() {
      this.outRoomDialog.visible = false;
    },
    getTime() {
      this.modelForm.leaveTime = new Date();
    },
    currentTime() {
      this.$nextTick(() => {
        this.modelForm.intoRoomDay = new Date();
        this.modelForm.intoRoomTime = new Date();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.leave-time {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  & > span {
    display: inline-block;
    width: 60px;
    margin-right: 12px;
  }
}
.time-pick {
  .el-date-editor {
    margin-top: 0px;
    width: 125px;
    ::v-deep input {
      padding: 0;
      text-align: center;
      width: 180px;
      height: 28px !important;
      line-height: 28px;
    }
    span {
      display: none;
    }
  }
}
</style>
