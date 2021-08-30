<template>
  <div class="content">
    <div class="command-bar">
      <div>
        <label>名称：</label>
        <el-input
          size="mini"
          placeholder="请输入"
          v-model="filter"
          @change="filterChange"
        ></el-input>
      </div>
      <el-button type="primary" size="mini" @click="createRole">新增</el-button>
    </div>
    <el-table :data="roles.items" size="mini" stripe border>
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="index" label="序号" width="100"></el-table-column>
      <el-table-column
        prop="name"
        label="名称"
        min-width="100"
      ></el-table-column>
      <el-table-column label="描述" min-width="160">
        <template slot-scope="scope">{{ scope.row | remarkText }}</template>
      </el-table-column>
      <!-- <el-table-column prop="isPublic" label="是否启用">
                <template slot-scope="scope">
                    <el-switch
                        v-model="scope.row.isPublic"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                        >
                    </el-switch>
               </template>
            </el-table-column> -->
      <el-table-column fixed="right" label="操作" width="180">
        <template slot-scope="scope">
          <div class="button-group">
            <el-button type="text" size="mini" @click="editRole(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="text"
              style="color: red"
              size="mini"
              @click="deleteRole(scope.row.id)"
              >删除</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="paging-warpper">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :total="roles.count"
        :current-page="roles.pageIndex"
        :page-sizes="[10, 20, 60, 100]"
        :page-size="roles.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
    <el-dialog
      ref="dialogEditRole"
      :visible.sync="roleDialog.visible"
      width="30%"
      :title="roleDialog.title"
      top="5vh"
    >
      <el-form
        class="c-form"
        :model="roleInfo"
        :rules="updateRoleRules"
        label-width="80px"
      >
        <el-form-item label="名称:" prop="name">
          <el-input
            size="mini"
            placeholder="请输入角色名称"
            v-model="roleInfo.name"
          ></el-input>
        </el-form-item>
        <el-form-item label="备注:" prop="remark">
          <el-input
            rows="4"
            placeholder="请输入描述"
            v-model="roleInfo.remark"
            type="textarea"
          ></el-input>
        </el-form-item>
        <!-- <el-form-item label="是否启用:">
                    <el-switch
                    v-model="roleInfo.value"
                    active-color="#13ce66"
                    inactive-color="#ff4949">
                    </el-switch>
                </el-form-item> -->
        <el-form-item label="菜单权限:" class="c-tree">
          <el-tree
            ref="tree"
            :data="menuData"
            show-checkbox
            node-key="id"
            highlight-current
            :props="defaultProps"
          >
          </el-tree>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="handleUpdateRole"
          ><span class="iconfont save"> 确定</span></el-button
        >
        <el-button size="mini" @click="roleDialog.visible = false"
          ><span class="iconfont close"> 取消</span></el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Log } from "oidc-client";
import { mapState, mapGetters } from "vuex";

export default {
  name: "roles",
  computed: {
    ...mapState({
      roles: (state) => state.sys.roles_paging,
    }),
    ...mapGetters(["ownerMenus"]),
    watchList: function () {
      const obj = {};
      Object.keys(this.roleInfo).forEach((key) => {
        obj[key] = this.roleInfo[key];
      });
      // console.log(obj,'watchList')
      return obj;
    },
  },
  watch: {
    watchList: {
      deep: true,
      handler: function (newValue, oldValue) {
        if (newValue == oldValue) {
          this.editChanged = false;
          // console.log('watchList',this.editChanged)
        } else {
          this.editChanged = true;
          // console.log('watchList',this.editChanged)
        }
      },
    },
  },
  filters: {
    remarkText: function (value) {
      if (value.remark) return value.remark;
      if (value.extraProperties.Remark) return value.extraProperties.Remark;
    },
  },
  data() {
    return {
      editChanged: false,
      roleDialog: {
        visible: false,
        title: "",
        state: null, //0-新增,  1-编辑
      },
      roleInfo: {
        extraProperties: {},
      },
      createRoleRules: {
        name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
      },
      updateRoleRules: {
        name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
      },
      treeChangeData: [], //权限树改变
      menuData: [],
      menusChange: [], //权限树granted为true的数据id
      defaultProps: {
        label: "name",
        children: "children",
      },
      filter: "",
    };
  },

  mounted: function () {
    this.menuData = this.ownerMenus;
    this.getRolesList();

    // 第一次默认在本地拿;
    // this.$store
    //   .dispatch("sys/menu/owner")
    //   .then((resp) => {
    //     loading.close();
    //     this.menuData = resp;
    //     this.menuMenthods(this.menuData);
    //     console.log(this.$refs.tree, "tree", this.menusChange);
    //     this.$refs.tree.setCheckedKeys([this.menusChange]);
    //   })
    //   .catch((err) => {
    //     loading.close();
    //     console.log(err, "编辑err");
    //     // this.$message.error(err);
    //   });
  },
  methods: {
    //   check消失
    // getRowKeys(row) {
    //   return row.index;
    // },
    getRolesList() {
      //角色列表
      //   console.log(this.roles);
      const loading = this.$loading({
        lock: true,
        text: "角色加载中",
        spinner: "el-icon-loading",
      });
      this.$store
        .dispatch("sys/roles/paging", {
          pageIndex: this.roles.pageIndex,
          pageSize: this.roles.pageSize,
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
      (this.roles.pageIndex = 1),
        (this.roles.pageSize = 10),
        this.getRolesList();
    },
    handleSizeChange(val) {
      this.roles.pageSize = val;
      this.getRolesList();
    },
    handleCurrentChange(val) {
      this.roles.pageIndex = val;
      this.getRolesList();
    },
    createRole() {
      //新增按钮
      this.roleDialog = {
        title: "新增",
        visible: true,
        state: 0,
      };
      this.roleInfo = {
        id: null,
        name: "",
        remark: "",
        isDefault: true,
        menus: "",
      };
    },

    handleUpdateRole() {
      // console.log(this.$refs.tree.getCheckedKeys());
      // console.log(this.$refs.tree.getCheckedNodes());
      this.roleInfo.menus = this.$refs.tree.getCheckedNodes(false, true);
      if (this.roleDialog.state === 0) {
        //新增
        // this.roleInfo = JSON.parse(JSON.stringify(this.roleInfo));
        this.roleInfo.name = this.roleInfo.name.replace(/^\s*|\s*$/g, "");
        if (this.roleInfo.name != "") {
          const loading = this.$loading({
            lock: true,
            text: "保存中...",
            spinner: "el-icon-loading",
          });
          this.$store
            .dispatch("sys/roles/create", this.roleInfo)
            .then((resp) => {
              if (resp.code && resp.code != 200) {
                loading.close();
                this.$message.error(`创建角色失败！`);
              } else {
                this.$message.success(`角色:${this.roleInfo.name}创建成功！`);
                this.roleDialog.visible = false;
                loading.close();
                this.getRolesList();
              }
            })
            .catch((err) => {
              console.error(err);
              loading.close();
              this.$message.error("创建角色失败！");
            });
        } else {
          this.$message.warning("请填必填项！");
        }
      } else if (this.roleDialog.state === 1) {
        //编辑
        const loading = this.$loading({
          lock: true,
          text: "保存中...",
          spinner: "el-icon-loading",
        });
        this.$store
          .dispatch("sys/roles/update", this.roleInfo)
          .then((resp) => {
            this.$message.success(`角色:${this.roleInfo.name}编辑成功`);
            this.roleDialog.visible = false;
            loading.close();
            this.getRolesList();
          })
          .catch((err) => {
            console.error(err);
            loading.close();
            this.$message.error("编辑失败");
          });
      }
    },
    editRole(row) {
      //打开编辑   console.log(this.roleInfo)
      //   console.log(this.menuData);
      this.roleInfo = JSON.parse(JSON.stringify(row));
      this.roleInfo.remark = this.roleInfo.extraProperties.Remark;
      this.roleDialog = {
        title: "编辑",
        visible: true,
        state: 1,
      };
      const loading = this.$loading({
        lock: true,
        text: "加载角色菜单中",
        spinner: "el-icon-loading",
      });
      this.$store
        .dispatch("sys/roles/menus", this.roleInfo.id)
        .then((resp) => {
          //根据角色id查询相应菜单
          console.log(resp);
          loading.close();
          let menus = resp.extraProperties.menus;
          console.log(menus);
          this.$refs.tree.setCheckedNodes([]); //只要包含父节点，那么他的子菜单为全部选中状态
          menus.forEach((value) => {
            this.$nextTick(() => {
              this.$refs.tree.setChecked(value.id, true, false);
            });
          });
        })
        .catch((err) => {
          loading.close();
          console.log(err, "编辑err");
          // this.$message.error(err);
        });
    },
    deleteRole(role) {
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
            text: "删除角色中",
            spinner: "el-icon-loading",
          });
          this.$store
            .dispatch("sys/roles/delete", role)
            .then((resp) => {
              this.$message.success("删除成功！");
              loading.close();
              this.getRolesList();
            })
            .catch((err) => {
              loading.close();
              this.$message.error("删除失败！");
              console.error(err);
            });
        })
        .catch(() => {
          loading.close();
          this.$message.error("删除失败！");
          console.error(err);
        });
    },
    menuMenthods(data) {
      data.forEach((item) => {
        if (item.granted) {
          this.menusChange.push(item.id);
        }
        if (item.children.length > 0) {
          this.menuMenthods(item.children);
        }
      });
    },
  },
  created: function () {
    this.getRolesList();
    this.menuData = this.ownerMenus;
    console.log(this.menuData);
  },
};
</script>

<style lang="scss" scoped>
.paging-warpper {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 10px;
}
.c-form::v-deep {
  .el-form-item {
    margin-bottom: 10px;
    .el-form-item__content {
      width: 80%;
    }
    &.c-tree {
      .el-form-item__content {
        height: 400px;
        border: 1px solid #ebeef5;
        overflow: auto;
      }
    }
    &.button-group {
      text-align: right;
    }
  }
  .el-form--label-top .el-form-item__label {
    padding: 0;
  }
}
</style>