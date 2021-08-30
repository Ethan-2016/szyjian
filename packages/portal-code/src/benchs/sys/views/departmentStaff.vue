<template>
  <div class="patient-management-content">
    <div class="contentBoxSystem">
      <div class="patient-management-menu">
        <div class="leftContent">
          <div class="title">
            <i></i><span>科室管理</span>
            <el-button
              style="margin-left: 10px"
              type="primary"
              @click="clickAddPart"
              size="mini"
              >新增</el-button
            >
          </div>
          <el-table
            :header-cell-style="headClass"
            :cell-style="cellClass"
            :row-style="rowClass"
            :data="departments"
            border
            stripe
            row-key="id"
            highlight-current-row
            default-expand-all
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            @row-click="selectDept"
            style="width: 100%"
          >
            <el-table-column
              prop="deptName"
              label="名称"
              width="80px"
            ></el-table-column>
            <el-table-column
              prop="intro"
              label="简称"
              width="70px"
            ></el-table-column>
            <el-table-column
              prop="deptCode"
              label="科室代码"
              width="80px"
            ></el-table-column>
            <el-table-column prop="enabled" label="启用" width="70px">
              <template slot-scope="scope">
                <el-switch v-model="scope.row.enabled" disabled></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div class="use-wrap">
                  <span @click.stop="clickEditPart(scope.row)">编辑</span>
                  <span @click.stop="clickDelPart(scope.row.id)">删除</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <!-- 新增 -->
          <el-dialog
            :title="changeDialogInfo.title"
            :visible.sync="changeDialogInfo.dialogVisible"
            custom-class="change-part-dialog"
            width="400px"
            @close="closeChangeDiaglog"
          >
            <div class="content-wrap">
              <div class="item-wrap">
                <span>上层科室：</span>
                <el-select
                  size="mini"
                  v-model="changeParams.parentDeptId"
                  placeholder="请选择上层科室"
                >
                  <el-option
                    v-for="item in deptData"
                    :key="item.id"
                    :label="item.deptName"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </div>
              <div class="item-wrap">
                <span>科室代码：</span>
                <el-input
                  required
                  size="mini"
                  v-model="changeParams.deptCode"
                  placeholder="请输入内容"
                ></el-input>
              </div>
              <div class="item-wrap">
                <span>科室名称：</span>
                <el-input
                  size="mini"
                  v-model="changeParams.deptName"
                  placeholder="请输入内容"
                ></el-input>
              </div>
              <div class="item-wrap">
                <span>科室简介：</span>
                <el-input
                  size="mini"
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
      <div class="rightContent">
        <div class="command-bar">
          <div>
            <label>关键字：</label>
            <el-input
              size="mini"
              placeholder="请输入"
              v-model="filter"
              @change="filterChange"
            ></el-input>
          </div>
          <el-button type="primary" size="mini" @click="createUser"
            >新增</el-button
          >
        </div>
        <el-table
          :data="userData"
          size="mini"
          v-loading="tableLoading"
          stripe
          border
        >
          <!-- <el-table-column type="selection"  width="55"></el-table-column> -->
          <el-table-column
            type="index"
            label="序号"
            width="50"
          ></el-table-column>
          <el-table-column
            prop="userName"
            label="账号"
            min-width="100"
          ></el-table-column>
          <el-table-column label="姓名" prop="sureName" min-width="60">
            <template slot-scope="scope">{{ scope.row | sureName }}</template>
          </el-table-column>
          <el-table-column label="角色" min-width="120">
            <template slot-scope="scope">{{ scope.row | roleText }}</template>
          </el-table-column>
          <el-table-column label="签名" min-width="140">
            <template slot-scope="scope">
              <img
                style="height: 20px"
                :src="scope.row.extraProperties.Signature"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="联系电话"
            prop="phoneNumber"
            min-width="100"
          ></el-table-column>
          <el-table-column prop="unit" label="职称"></el-table-column>
          <el-table-column prop="dept" label="科室"></el-table-column>
          <el-table-column label="是否启用">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.lockoutEnabled"
                active-color="#13ce66"
                inactive-color="#ff4949"
              >
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="180">
            <template slot-scope="scope">
              <div class="button-group">
                <el-button
                  type="text"
                  size="mini"
                  @click="resetPasswordBtn(scope.row)"
                  >重置密码</el-button
                >
                <el-button type="text" size="mini" @click="editUser(scope.row)"
                  >编辑</el-button
                >
                <el-button
                  type="text"
                  style="color: red"
                  size="mini"
                  @click="deleteUser(scope.row.id)"
                  >删除</el-button
                >
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- <div class="paging-warpper">
          <el-pagination
            :hide-on-single-page="true"
            :total="users.count"
            :current-page="users.pageIndex"
            :page-size="users.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div> -->
      </div>

      <!-- 用户信息 -->
      <el-dialog
        ref="usersDialog"
        :visible.sync="usersDialog.visible"
        width="60%"
        :title="usersDialog.title"
      >
        <div style="height: 640px">
          <el-form
            ref="updateUserInfo"
            :rules="userRules"
            :model="userInfo"
            label-width="80px"
          >
            <el-col :span="12">
              <el-form-item label="账号" prop="userName">
                <el-input
                  style="width: 80%"
                  size="mini"
                  placeholder="请输入用户工号"
                  v-model="userInfo.userName"
                  :disabled="usersDialog.state === 1"
                  @input="
                    userInfo.userName = userInfo.userName
                      ? userInfo.userName.replace(/\s+/g, '')
                      : ''
                  "
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="医护类型" prop="title">
                <el-select
                  v-model="userInfo.extraProperties.Branch"
                  placeholder="请选择"
                  size="mini"
                >
                  <el-option :key="1" label="医生" :value="1"></el-option>
                  <el-option :key="2" label="护士" :value="2"></el-option>
                  <el-option :key="3" label="其他" :value="3"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input
                  style="width: 80%"
                  size="mini"
                  placeholder="请输入用户姓名"
                  v-model="userInfo.name"
                  @input="
                    userInfo.name = userInfo.name
                      ? userInfo.name.replace(/\s+/g, '')
                      : ''
                  "
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="职位" prop="">
                <el-input
                  style="width: 80%"
                  size="mini"
                  placeholder="请输入职位"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="密码"
                prop="password"
              >
                <el-input
                  style="width: 80%"
                  size="mini"
                  type="password"
                  placeholder="请输入初始密码"
                  :disabled="usersDialog.disabled"
                  v-model="userInfo.password"
                  @input="
                    userInfo.password = userInfo.password
                      ? userInfo.password.replace(/\s+/g, '')
                      : ''
                  "
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="职称" prop="name">
                <el-input
                  style="width: 80%"
                  size="mini"
                  placeholder="请输入职称"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="角色" prop="roles">
                <el-select
                  v-model="userInfo.roles"
                  multiple
                  placeholder="请选择"
                  size="mini"
                >
                  <el-option
                    v-for="(item, index) of rolesList"
                    :key="index"
                    :label="item.name"
                    :value="item.name"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phoneNumber">
                <el-input
                  style="width: 80%"
                  size="mini"
                  placeholder="请输入联系电话"
                  v-model="userInfo.phoneNumber"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属科室" class="c-tree" prop="dept">
                <el-tree
                  ref="tree"
                  :data="departments"
                  @check-change="handleCheckChange"
                  @node-click="nodeClick"
                  :props="defaultProps"
                  show-checkbox
                  :check-strictly="true"
                  node-key="id"
                  :highlight-current="true"
                ></el-tree>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="科室权限" class="c-tree" prop="">
                <el-tree
                  ref="purviewtree"
                  :data="departments"
                  :props="defaultProps"
                  show-checkbox
                  node-key="id"
                  :highlight-current="true"
                ></el-tree>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="上传签名" prop="extraProperties.Signature">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                >
                  <img
                    v-if="userInfo.extraProperties.Signature"
                    :src="userInfo.extraProperties.Signature"
                    class="avatar"
                  />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
              </el-form-item>
            </el-col>
            <!-- <el-form-item>
              <div class="button-group">
                <el-button type="primary" size="mini" @click="handleUpdateUser"
                  ><span class="iconfont save" />保存</el-button
                >
                <el-button size="mini" @click="usersDialog.visible = false"
                  ><span class="iconfont close" />取消</el-button
                >
              </div>
            </el-form-item> -->
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" size="mini" @click="handleUpdateUser"
            ><span class="iconfont save" />保存</el-button
          >
          <el-button size="mini" @click="usersDialog.visible = false"
            ><span class="iconfont close" />取消</el-button
          >
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import SYS from "@/api/sys.js";
export default {
  name: "departmentStaff",
  computed: {
    ...mapState({
      users: (state) => state.sys.users_paging,
      depts: (state) => state.sys.depts,
      units: (state) => state.sys.units,
    }),
  },
  filters: {
    branchText: function (value) {
      if (!value) return "";
      if (value == "doctor") {
        return "医生";
      } else if (value == "nurse") {
        return "护士";
      } else {
        return "";
      }
    },
    roleText: function (value) {
      if (value.roles) {
        return value.roles.join();
      }
      if (value.extraProperties.roles) {
        return value.extraProperties.roles.join();
      }
    },
    sureName: function (value) {
      if (value.sureName) return value.sureName;
      if (value.name) return value.name;
    },
  },
  data() {
    return {
      checkedId:"",
      defaultProps: {
        children: "children",
        label: "deptName",
      },
      deptId: null,
      initId: null,
      tableLoading: false,
      userData: [],
      isActiveTypeListMenu: null,
      departments: [],
      /* */
      usersDialog: {
        title: "",
        visible: false,
        state: null, //0-新增 1-编辑
      },
      userInfo: {
        id: null,
        userName: "", //工号
        name: "", //姓名
        password: "",
        email: "",
        phoneNumber: "",
        roles: [],
        extraProperties: { Signature: "" }, //扩展属性
        menus: "",
      }, //弹窗数据
      userRules: {
        name: [{ required: true, message: "请输入用户姓名", trigger: "blur" }],
        userName: [{ required: true, message: "请输入用户账号", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        // dept: [{ required: true, message: " ", trigger: "change" }],
      },
      rolesList: [],
      filter: "", //删选条件
      changeDialogInfo: {
        dialogVisible: false,
        title: "",
      },
      deleteDialogInfo: {
        dialogVisible: false,
        title: "",
      },
      deptData: [],
      changeParams: {
        deptCode: "",
        deptName: "",
        parentDeptId: "",
        // 科室简介
        intro: "",
        enabled: false,
      },
    };
  },
  mounted() {
    SYS.getPagedRoles({
      //角色列表
      pageIndex: 1,
      pageSize: 1000,
    })
      .then((res) => {
        this.rolesList = res.items;
      })
      .catch((err) => {
        console.log(err, "角色err");
      });
    this.initPage();
  },
  methods: {
    async initPage() {
      await this.getDeptList();
      await this.defaultId();
      await this.refresh();
    },
    defaultId() {
      return new Promise((resolve) => {
        this.deptId = this.initId;
        resolve();
      });
    },
    headClass() {
      return "padding:0;line-height:35px;text-align: left;background-color:#1BAD96;color:#fff";
    },
    cellClass() {
      return "padding:0;height:35px;line-height:35px;text-align: left";
    },
    rowClass({ row, rowIndex }) {
      if (this.deptId == row.id) {
        return { "background-color": "#A4DED5!important", color: "#fff" };
      }
    },
    clickAddPart() {
      this.changeDialogInfo.title = "新增科室";
      this.changeDialogInfo.dialogVisible = true;
      this.changeFlag = true;
      this.changeParams.enabled = false;
      this.getDeptList();
      this.$forceUpdate();
    },
    clickEditPart(row) {
      this.changeDialogInfo.title = "编辑科室";
      this.changeDialogInfo.dialogVisible = true;
      this.changeFlag = false;
      this.changeParams["parentDeptId"] = row.parentDeptId;
      this.changeParams["deptCode"] = row.deptCode;
      this.changeParams["deptName"] = row.deptName;
      this.changeParams["enabled"] = row.enabled;
      this.changeParams["intro"] = row.intro;
      this.changeParams["id"] = row.id;
      this.getDeptList();
      this.$forceUpdate();
      this.rowInfo = row;
    },
    clickDelPart(row) {
      this.deleteDialogInfo.title = "删除科室";
      this.deleteDialogInfo.dialogVisible = true;
      this.rowInfo = row;
    },
    handleDeletePart() {
      console.log(this.rowInfo);
      let id = this.rowInfo;
      SYS.deleteDepts(id)
        .then((res) => {
          this.$message.success("删除成功");
          this.getDeptList();
        })
        .catch((err) => {
          this.$message({
            message: err.error.message,
            type: "error",
          });
        });
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
    handleChangePart() {
      let params = {
        parentDeptId: this.changeParams.parentDeptId,
        deptCode: this.changeParams.deptCode,
        deptName: this.changeParams.deptName,
        enabled: this.changeParams.enabled,
        intro: this.changeParams.intro,
      };
      !this.changeFlag && (params.id = this.changeParams.id);
      for (let key in this.changeParams) {
        // if (key !== "id" && key !== "enabled" &&  !this.changeParams[key]) {
        if (key !== "id" && key !== "enabled" &&(key=='deptName' && !this.changeParams['deptName'])) {
          this.$message({
            message: "请填写科室名称",
            type: "error",
          });
          return;
        }
      }
      if (!this.changeFlag) {
        SYS.putDepts(params)
          .then((res) => {
            if (res == "") {
              this.$message.success("编辑成功");
              this.changeDialogInfo.dialogVisible = false;
            }
            this.getDeptList();
          })
          .catch((err) => {
            this.$message({
              message: err.error.message,
              type: "error",
            });
          });
      } else {
        SYS.postDepts(params)
          .then((res) => {
            console.log(res);
            if (res == "") {
              this.$message.success("新增成功");
              this.changeDialogInfo.dialogVisible = false;
              this.getDeptList();
            }
          })
          .catch((err) => {
            this.$message({
              message: err.error.message,
              type: "error",
            });
          });
      }
    },
    selectDept(row, column, event) {
      console.log(row);
      this.deptId = row.id;
      this.refresh();
    },
    //
    documentClick(menu, m) {
      this.isActiveTypeListMenu = m;
      let id = menu.id;
      SYS.getDeptsMembers(id).then((res) => {});
    },
    returnNewList(arr, list) {
      arr.forEach((item) => {
        list.push({
          id: item.id,
          deptName: item.deptName,
        });
        if (item.children.length > 0) {
          this.returnNewList(item.children, list);
        }
      });
      return list;
    },
    getDeptList() {
      return new Promise((resolve) => {
        SYS.getDepts().then((res) => {
          this.departments = res.departments;
          this.initId = this.departments[0].id;
          this.deptData = [];
          this.returnNewList(res.departments, this.deptData);
          resolve();
        });
      });
    },
    beforeAvatarUpload(file) {
      console.log(file, "beforeAvatarUpload");
      const isImage = file.type.split("/")[0] == "image";
      if (!isImage) {
        this.$message.error("上传签名只支持图片格式!");
      } else {
        this.getBase64(file).then((res) => {
          this.userInfo.extraProperties.Signature = this.Signature = res;
          this.$forceUpdate();
        });
      }
    },
    getBase64(file) {
      //转为base64格式
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        let imgResult = "";
        reader.readAsDataURL(file);
        reader.onload = function () {
          imgResult = reader.result;
        };
        reader.onerror = function (error) {
          reject(error);
        };
        reader.onloadend = function () {
          resolve(imgResult);
        };
      });
    },

    limitSpace(e) {
      console.log(e, e.keyCode);
    },
    refresh() {
      return new Promise((resolve) => {
        this.tableLoading = true;
        console.log(this.deptId);
        SYS.getDeptsMembers(this.deptId)
          .then((res) => {
            this.userData = res;
            this.tableLoading = false;
            resolve();
          })
          .catch((err) => {
            this.tableLoading = false;
          });
      });
    },
    filterChange(val) {
      (this.users.pageIndex = 1), (this.users.pageSize = 10), this.refresh();
    },
    handleCheckChange(val) {
      console.log(val);
    },
    createUser() {
      //新增按钮
      this.userInfo = {
        id: null,
        userName: "",
        name: "",
        password: "",
        email: "",
        phoneNumber: "",
        roles: [],
        extraProperties: { Signature: "" },
        menus: "",
      };
      this.getDeptList();
      this.usersDialog = {
        title: "新增用户",
        state: 0,
        visible: true,
      };
    },
    resetPasswordBtn(user) {
      this.$prompt("请重置密码:", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputType: "password",
        inputPattern: /^[a-zA-Z\d_\*]{1,}$/, //字母或者数字
        inputErrorMessage: "密码不能为空！",
      })
        .then(({ value }) => {
          SYS.resetPassword(user.id, value)
            .then((res) => {
              console.log(res);
              if (res) {
                this.$message.error("重置密码失败~");
              } else {
                this.$message.success("重置密码成功~");
                this.refresh();
              }
            })
            .catch((err) => {
              console.error("重置密码：", err);
            });
        })
        .catch(() => {});
    },
    editUser(user) {
      //编辑按钮
      this.usersDialog = {
        title: "编辑用户",
        state: 1,
        visible: true,
        disabled :true
      };
      if (!user.roles) user.roles = user.extraProperties.roles || [];
      // if(user.roles.length==0){
      //     this.$store.dispatch('sys/users/getroles',user.id).then(resp=>{
      //         this.userInfo = resp;
      //     })
      // } else {
      //     this.userInfo = user;
      // }
      this.userInfo = JSON.parse(JSON.stringify(user));
      console.log(this.userInfo);
    },
    handleUpdateUser() {
      console.log(this.userInfo);
      // this.userInfo.menus = this.$refs.tree.getCheckedNodes(false, true);
      // this.$nextTick(()=>{
      //   console.log(this.$refs.tree.getCheckedKeys());
      //   console.log(this.$refs.purviewtree.getCheckedKeys());
      // })
      if (this.usersDialog.state === 0) {
        //新增
        if (
          this.userInfo.password &&
          this.userInfo.name &&
          this.userInfo.userName
        ) {
          const loading = this.$loading({
            lock: true,
            text: "创建用户中...",
            spinner: "el-icon-loading",
          });
          this.$store
            .dispatch("sys/users/create", this.userInfo)
            .then((resp) => {
              console.log(resp, "创建用户");
              if (resp.error) {
                loading.close();
                this.$message.error(`创建用户失败`);
              } else {
                this.usersDialog.visible = false;
                this.refresh(); //更新用户列表
                loading.close();
                this.$message.success("创建用户成功");
              }
            })
            .catch((err) => {
              console.log(err);
              loading.close();
            });
        } else {
          this.$message.warning("请填必填参数");
        }
      } else if (this.usersDialog.state === 1) {
        //编辑
        if (this.userInfo.name && this.userInfo.userName) {
          const loading = this.$loading({
            lock: true,
            text: "编辑用户中...",
            spinner: "el-icon-loading",
          });
          this.$store
            .dispatch("sys/users/update", this.userInfo)
            .then((resp) => {
              console.log(resp, "编辑用户");
              if (resp.error) {
                loading.close();
                this.$message.error(`编辑用户失败`);
              } else {
                this.usersDialog.visible = false;
                loading.close();
                this.refresh(); //更新用户列表
                this.$message.success("编辑用户成功");
              }
            })
            .catch((err) => {
              console.error(err);
              loading.close();
            });
        } else {
          this.$message.warning("请填必填参数");
        }
      }
    },
    deleteUser(id) {
      this.$confirm(
        "此操作将永久删除用户后将无法恢复，确认要删除吗？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          const loading = this.$loading({
            lock: true,
            text: "删除用户中",
            spinner: "el-icon-loading",
          });
          this.$store
            .dispatch("sys/users/delete", id)
            .then((resp) => {
              if (resp.error) {
                loading.close();
                this.$message.error(`删除失败！`);
              } else {
                this.usersDialog.visible = false;
                this.refresh(); //更新用户列表
                loading.close();
                this.$message.success("删除成功！");
              }
            })
            .catch((err) => {
              loading.close();
              console.log(err);
            });
        })
        .catch(() => {
          console.log(err);
        });
    },

    handleSizeChange(val) {
      this.users.pageSize = val;
      this.refresh();
    },
    handleCurrentChange(val) {
      this.users.pageIndex = val;
      this.refresh();
    },
    // 所在科室只能单选且当选中所在科室 科室权限也相应选中
    handleCheckChange(data, checked, indeterminate){
      if(checked == true){
        this.checkedId = data.id;
        this.$refs.tree.setCheckedNodes([data]);
        this.$refs.purviewtree.setCheckedNodes([data]);
      }
    },
    nodeClick(data,checked,node){
      console.log(data,checked,node);
      this.checkedId = data.id;
      this.$refs.tree.setCheckedNodes([data]);
      this.$refs.purviewtree.setCheckedNodes([data]);
    },
  },
  //科室权限
};
</script>

<style lang="scss" scoped>
::v-deep .el-table__body tr.current-row > td {
  color: #fff;
  background-color: #A4DED5 !important;
}
.patient-management-content {
  padding: 5px 10px 12px;
  height: calc(100vh - 125px);
  background-color: #fff;
  border: 1px solid #efefef;
  border-radius: 5px;
  .contentBoxSystem {
    padding: 20px;
    display: flex;
    .patient-management-menu {
      overflow: auto;
      width: 600px;
      height: calc(100vh - 152px);
      background: #fff;
      user-select: none;
      border-right: 1px solid #efefef;
      .leftContent {
        padding: 5px 9px 0 11px;
        ::v-deep .typeList {
          margin-top: 15px;
          .el-icon-s-operation {
            color: #1bad96;
            margin-right: 5px;
          }
          .el-icon-edit-outline {
            color: #1bad96;
            margin-right: 8px;
          }
          .el-icon-delete {
            color: #1bad96;
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
                margin-left: 20px;
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
              // .item-wrap:nth-of-type(5),
              // .item-wrap:nth-of-type(6) {
              // margin-left: 166px;
              // }
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
        ::v-deep .el-table__header {
          height: 35px;
          line-height: 35px;
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
        .title {
          font-size: 16px;
          color: #1bad96;
          font-weight: 700;
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          i {
            display: inline-block;
            width: 5px;
            height: 14px;
            background: #1bad96;
            border-radius: 3px;
            margin-right: 11px;
          }
        }
        .searchInput {
          margin-bottom: 19px;
        }
      }
      .menu-item {
        padding: 0 15px;
        height: 45px;
        line-height: 45px;
        color: #999;
        cursor: pointer;
      }
      .active-menu-item {
        color: #fff;
        background: #1bad96;
      }
    }
    .rightContent {
      width: 100%;
      padding: 16px 25px 19px 24px;

      .command-bar {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 10px;
        .el-input {
          width: 200px;
        }
      }
    }
  }

  .paging-warpper {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 15px;
  }
  .avatar-uploader::v-deep {
    .el-upload {
      border: 1px dashed #c0c4cc;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      &:hover {
        border-color: #409eff;
      }
    }
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 90px;
    line-height: 90px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    // height: 178px;
    display: block;
  }
}
.c-tree {
  ::v-deep .el-form-item__content {
    height: 300px;
    border: 1px solid #ebeef5;
    overflow: auto;
  }
}
::v-deep .activeTypeListMenu {
  background: rgb(228, 231, 237);
}
</style>

