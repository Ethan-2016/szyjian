<!--
 * @Autor: Linbaochang
 * @Date: 2021-01-25 09:46:24
 * @LastEditors: Linbaochang
 * @LastEditTime: 2021-01-26 09:51:33
-->
<template>
  <div class="depts-page">
    <div class="contentBox">
      <div class="depts-wrap">
        <div class="top-wrap">
          <el-button class="min-button active" @click="clickAddPart"
            >新增</el-button
          >
        </div>
        <div class="data-wrap">
          <div class="scroll-wrap">
            <el-table
              :header-cell-style="headClass"
              :data="formatTable"
              v-model="formatTable"
              border
              style="width: 80%"
            >
              <el-table-column type="index" label="序号" width="100px">
              </el-table-column>
              <el-table-column
                :prop="item.model"
                :label="item.name"
                :width="item.width"
                v-bind:key="index"
                v-for="(item, index) in formatTableData"
              >
                <template slot-scope="scope">
                  <div v-if="item.model == 'deptCode'">
                    <span>{{ scope.row[item.model] }}</span>
                  </div>
                  <div v-else-if="item.model == 'deptName'">
                    <span>{{ scope.row[item.model] }}</span>
                  </div>
                  <div v-else-if="item.model == 'intro'">
                    <span>{{ scope.row[item.model] }}</span>
                  </div>
                  <div v-else>
                    <el-switch
                      v-model="scope.row[item.model]"
                      disabled
                    ></el-switch>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100px">
                <template slot-scope="scope">
                  <div class="use-wrap">
                    <span @click="clickEditPart(scope.row)">编辑</span>
                    <span @click="clickDelPart(scope.row.id)">删除</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <!-- 新增 -->
            <el-dialog
              :title="changeDialogInfo.title"
              :visible.sync="changeDialogInfo.dialogVisible"
              custom-class="change-part-dialog"
              width="600px"
              @close="closeChangeDiaglog"
            >
              <div class="content-wrap">
                <div class="item-wrap">
                  <span>科室代码：</span>
                  <el-input
                    required
                    v-model="changeParams.deptCode"
                    placeholder="请输入内容"
                  ></el-input>
                </div>
                <div class="item-wrap">
                  <span>科室名称：</span>
                  <el-input
                    v-model="changeParams.deptName"
                    placeholder="请输入内容"
                  ></el-input>
                </div>
                <div class="item-wrap">
                  <span>科室简介：</span>
                  <el-input
                    v-model="changeParams.intro"
                    placeholder="请输入内容"
                  ></el-input>
                </div>
                <div class="item-wrap">
                  <span>是否启用：</span>
                  <el-switch
                    :active-value="true"
                    :inactive-value="false"
                    v-model="changeParams.enabled"
                  ></el-switch>
                </div>
              </div>

              <span slot="footer" class="dialog-footer">
                <el-button @click="handleChangePart">确定</el-button>
                <el-button
                  type="primary"
                  @click="changeDialogInfo.dialogVisible = false"
                  >取消</el-button
                >
              </span>
            </el-dialog>
            <!-- 编辑 -->
            <!-- 删除 -->
            <el-dialog
              width="300px"
              :title="deleteDialogInfo.title"
              :visible.sync="deleteDialogInfo.dialogVisible"
            >
              <span>你确定要删除该科室吗？</span>
              <span slot="footer" class="dialog-footer">
                <el-button @click="handleDeletePart">确定</el-button>
                <el-button
                  type="primary"
                  @click="deleteDialogInfo.dialogVisible = false"
                  >取消</el-button
                >
              </span>
            </el-dialog>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import SYS from "../../../../src/api/sys";
export default {
  data() {
    return {
      formatTableData: [],
      formatTable: [],
      changeParams: {
        deptCode: "",
        deptName: "",
        // 科室简介
        intro: "",
        enabled: false,
      },
      changeFlag: false,
      changeDialogInfo: {
        dialogVisible: false,
        title: "",
      },
      deleteDialogInfo: {
        dialogVisible: false,
        title: "",
      },
      rowInfo: {},
    };
  },
  created() {},
  mounted() {
    this.GetTableData();
  },
  methods: {
    headClass() {
      return "text-align: left;background-color:#E4E7ED;";
    },
    GetTableData() {
      this.formatTableData = [
        { name: "科室代码", model: "deptCode" },
        { name: "科室名称", model: "deptName" },
        { name: "科室简介", model: "intro" },
        { name: "是否启用", model: "enabled", temptype: "switch" },
      ];
      SYS.getDepts().then((res) => {
        this.formatTable = res.departments;
        this.tableData = JSON.parse(JSON.stringify(res.departments));
        console.log(res);
      });
    },
    clickAddPart() {
      this.changeDialogInfo.title = "新增科室";
      this.changeDialogInfo.dialogVisible = true;
      this.changeFlag = true;
      this.changeParams.enabled = false;
      this.$forceUpdate();
    },
    clickEditPart(row) {
      this.changeDialogInfo.title = "编辑科室";
      this.changeDialogInfo.dialogVisible = true;
      this.changeFlag = false;
      this.changeParams["deptCode"] = row.deptCode;
      this.changeParams["deptName"] = row.deptName;
      this.changeParams["enabled"] = row.enabled;
      this.changeParams["intro"] = row.intro;
      this.changeParams["id"] = row.id;
      this.$forceUpdate();
      this.rowInfo = row;
    },
    handleChangePart() {
      let params = {
        deptCode: this.changeParams.deptCode,
        deptName: this.changeParams.deptName,
        enabled: this.changeParams.enabled,
        intro: this.changeParams.intro,
      };
      !this.changeFlag && (params.id = this.changeParams.id);
      for (let key in this.changeParams) {
        if (key !== "id" && key !== "enabled" && !this.changeParams[key]) {
          this.$message({
            message: "请完善科室信息",
            type: "error",
          });
          return;
        }
      }
      if (!this.changeFlag) {
        SYS.putDepts(params).then((res) => {
          if (res == "") {
            this.$message.success("编辑成功");
            this.changeDialogInfo.dialogVisible = false;
          }
          this.GetTableData();
        });
      } else {
        SYS.postDepts(params).then((res) => {
          console.log(res);
          if (res == "") {
            this.$message.success("新增成功");
            this.changeDialogInfo.dialogVisible = false;
            this.GetTableData();
          }
        });
      }
    },
    clickDelPart(row) {
      this.deleteDialogInfo.title = "删除科室";
      this.deleteDialogInfo.dialogVisible = true;
      this.rowInfo = row;
    },
    closeChangeDiaglog() {
      this.changeFlag = false;
      this.changeDialogInfo.dialogVisible = false;
      this.changeParams = {
        deptCode: "",
        deptName: "",
        intro: "",
        enabled: false,
      };
    },
    handleDeletePart() {
      console.log(this.rowInfo);
      let id = this.rowInfo;
      SYS.deleteDepts(id).then((res) => {
        this.$message.success("删除成功");
        this.GetTableData();
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.depts-page {
  padding: 15px 22px 16px 20px;
  height: calc(100vh - 125px);
  background-color: #fff;
  .contentBox {
    width: 100%;
    border: 1px solid #ebeef5;
    display: flex;
    background-color: #fff;
    .depts-wrap {
      padding: 21px 22px 19px 25px;
      width: 100%;
      .top-wrap {
        display: flex;
        margin-bottom: 20px;
        .min-button {
          margin-left: 10px;
          color: #fff;
          background: #1bad96;
        }
      }
    }
  }
  .change-part-dialog {
    .el-dialog__header {
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 40px;
      .el-dialog__headerbtn {
        top: 13px;
      }
    }
    .el-dialog__body {
      .content-wrap {
        .item-wrap {
          display: flex;
          margin-left: 138px;
          margin-bottom: 10px;
          align-items: center;
          span {
            margin-right: 10px;
          }

          .el-input {
            width: 200px;
            height: 35px;
            input {
              height: 35px;
            }
          }
          .el-input__icon {
            line-height: 1;
          }
          .el-input__suffix {
            margin-right: 0;
            .el-icon-circle-close {
              color: red;
            }
          }
        }
        .item-wrap:nth-of-type(5),
        .item-wrap:nth-of-type(6) {
          margin-left: 166px;
        }
      }
    }
    .el-dialog__footer {
      padding: 20px;
      border-top: 1px solid #dcdfe6;
      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        button {
          width: 80px;
          height: 35px;
          background: #1bad96;
          color: #fff;
        }
        button:last-child {
          background: #efefef;
          color: #333;
          border: 0;
        }
      }
    }
  }
}
::v-deep .use-wrap {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  color: #1bad96;
  span:last-child {
    color: #f36d6e;
  }
}
</style>
