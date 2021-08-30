<template>
  <div class="patient-management-content">
    <div class="contentBoxSystem">
      <div class="patient-management-menu">
        <div class="leftContent">
          <div class="title"><i></i><span>人员管理</span></div>
          <div
            class="typeList"
            v-for="(menu, m) in departments"
            :key="m"
            :index="m.toString()"
            :class="{ activeTypeListMenu: isActiveTypeListMenu == m }"
            @click="documentClick(menu, m)"
          >
            <i class="el-icon-s-operation"></i>{{ menu.deptName }}
          </div>
        </div>
      </div>
      <div class="rightContent">
        <div class="command-bar">
          <div>
            <label>账号/姓名/角色：</label>
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
        <el-table :data="users.items" size="mini" stripe border>
          <!-- <el-table-column type="selection"  width="55"></el-table-column> -->
          <el-table-column
            type="index"
            label="序号"
            width="100"
          ></el-table-column>
          <el-table-column
            prop="userName"
            label="账号"
            min-width="180"
          ></el-table-column>
          <el-table-column label="姓名" prop="sureName" min-width="180">
            <template slot-scope="scope">{{ scope.row | sureName }}</template>
          </el-table-column>
          <el-table-column label="角色" min-width="260">
            <template slot-scope="scope">{{ scope.row | roleText }}</template>
          </el-table-column>
          <el-table-column label="签名" min-width="160">
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
          <!-- <el-table-column prop="unit" label="职称"></el-table-column> -->
          <!-- <el-table-column prop="dept" label="科室"></el-table-column> -->
          <!-- <el-table-column  label="是否启用">
               <template slot-scope="scope">
                    <el-switch
                        v-model="scope.row.lockoutEnabled"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                        >
                    </el-switch>
               </template>
            </el-table-column> -->
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
        <div class="paging-warpper">
          <el-pagination
            :hide-on-single-page="true"
            :total="users.count"
            :current-page="users.pageIndex"
            :page-size="users.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 用户信息 -->
      <el-dialog
        ref="usersDialog"
        :visible.sync="usersDialog.visible"
        width="30%"
        :title="usersDialog.title"
      >
        <div>
          <el-form
            ref="updateUserInfo"
            :rules="userRules"
            :model="userInfo"
            label-width="80px"
          >
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
              <!-- :οnkeyup="userInfo.userName=userInfo.userName.replace(/\s+/g,'')" -->
            </el-form-item>
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
            <el-form-item
              label="密码"
              prop="password"
              v-if="usersDialog.state === 0"
            >
              <el-input
                style="width: 80%"
                size="mini"
                type="password"
                placeholder="请输入初始密码"
                v-model="userInfo.password"
                @input="
                  userInfo.password = userInfo.password
                    ? userInfo.password.replace(/\s+/g, '')
                    : ''
                "
              ></el-input>
            </el-form-item>
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
            <!-- <el-form-item label="职称" prop="title">
                        <el-select v-model="userInfo.extraProperties.title" placeholder="请选择" size="mini">
                            <el-option key="doctor" label="医生" value="doctor"></el-option>
                            <el-option key="nurse" label="护士" value="nurse"></el-option>
                        </el-select>
                    </el-form-item> -->
            <el-form-item label="联系电话" prop="phoneNumber">
              <el-input
                style="width: 80%"
                size="mini"
                placeholder="请输入联系电话"
                v-model="userInfo.phoneNumber"
              ></el-input>
            </el-form-item>
            <!-- <el-form-item label="是否启用" prop="lockoutEnabled">
                        <el-switch
                            v-model="userInfo.lockoutEnabled"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                            >
                        </el-switch>
                    </el-form-item> -->
            <!-- <el-form-item label="所在科室" prop="dept">
                        <el-select v-model="userInfo.dept" placeholder="请选择" size="mini">
                            <el-option v-for="unit in units" :key="unit.id" :label="unit.name" :value="unit.id"></el-option>
                        </el-select>
                    </el-form-item> -->
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
            <el-form-item>
              <div class="button-group">
                <el-button type="primary" size="mini" @click="handleUpdateUser"
                  ><span class="iconfont save" />保存</el-button
                >
                <el-button size="mini" @click="usersDialog.visible = false"
                  ><span class="iconfont close" />取消</el-button
                >
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import SYS from "@/api/sys.js";
export default {
  name: "users",
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
      isActiveTypeListMenu: null,
      departments: [],
      // defaultProps: {
      defaultProps: {
        label: "moduleName",
        children: "children",
      },
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
      }, //弹窗数据
      userRules: {
        name: [{ required: true, message: "请输入用户姓名", trigger: "blur" }],
        userName: [
          { required: true, message: "请输入用户账号", trigger: "blur" },
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
      rolesList: [],
      filter: "", //删选条件
    };
  },
  mounted: function () {
    this.refresh("加载中...");
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
    this.getDeptList();
  },
  methods: {
    documentClick(menu, m) {
      this.isActiveTypeListMenu = m;
      let id = menu.id;
      SYS.getDeptsMembers(id).then((res) => {});
    },
    getDeptList() {
      SYS.getDepts().then((res) => {
        this.departments = res.departments;
        console.log(this.departments);
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
    refresh(title) {
      const loading = this.$loading({
        lock: true,
        text: title,
        spinner: "el-icon-loading",
      });
      this.$store
        .dispatch("sys/users/paging", {
          pageIndex: this.users.pageIndex,
          pageSize: this.users.pageSize,
          filter: this.filter,
        })
        .then((resp) => {
          loading.close();
        })
        .catch((err) => {
          loading.close();
        });
    },
    filterChange(val) {
      (this.users.pageIndex = 1), (this.users.pageSize = 10), this.refresh();
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
      };
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
  },
};
</script>

<style lang="scss" scoped>
.patient-management-content {
  padding: 15px 20px 12px;
  height: calc(100vh - 125px);
  background-color: #fff;
  border: 1px solid #efefef;
  border-radius: 5px;
  .contentBoxSystem {
    padding: 20px;
    display: flex;
    .patient-management-menu {
      overflow: auto;
      width: 200px;
      height: calc(100vh - 152px);
      background: #fff;
      user-select: none;
      border-right: 1px solid #efefef;
      .leftContent {
        padding: 25px 9px 0 11px;
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
::v-deep .activeTypeListMenu {
  background: rgb(228, 231, 237);
}
</style>

