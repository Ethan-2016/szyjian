<template>
  <div class="content">
    <div class="command-bar">
      <el-button type="primary" size="mini" @click="editMenuDia({}, 'new')"
        >新增</el-button
      >
    </div>
    <el-table
      :data="menus"
      style="width: 100%"
      row-key="id"
      border
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column type="index" label="序号" align="center" width="80" />
      <el-table-column prop="sort" label="排序" width="120" align="left" />
      <el-table-column prop="name" label="名称" min-width="120" />
      <el-table-column
        prop="url"
        label="地址"
        show-overflow-tooltip
        min-width="200"
      />
      <el-table-column fixed="right" label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="editMenuDia(scope.row, 'edit')"
            >编辑</el-button
          >
          <el-button
            type="text"
            size="mini"
            @click="editMenuDia(scope.row, 'sub')"
            >添加子菜单</el-button
          >
          <!-- <el-button type="text" size="mini" @click="addSubMenuDia(scope.row)">添加子菜单</el-button> -->
          <el-button
            type="text"
            style="color: red"
            @click="deleteMenu(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
      <!-- <el-table-column label="层级" align="center" width="80">
        <template slot-scope="scope">
          {{ scope.row.level | levelText }}
        </template>
      </el-table-column> -->
      <!-- <el-table-column label="是否启用" align="center" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.enabled"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="submitSingalData(scope.row)"
          >
          </el-switch>
        </template>
      </el-table-column> -->
    </el-table>

    <!-- 菜单信息 -->
    <el-dialog
      :title="menuDialog.title"
      :visible.sync="menuDialog.visible"
      width="30%"
      class="dialog-menu"
    >
      <el-form :rules="updateMenuRules" :model="singalMenu">
        <el-form-item
          label="父菜单:"
          prop="parentName"
          v-if="menuDialog.type == 'sub'"
        >
          <el-input
            size="mini"
            placeholder="顶层菜单"
            v-model="singalMenu.parentName"
            :disabled="disableParent"
          ></el-input>
        </el-form-item>
        <el-form-item label="菜单:" prop="name">
          <el-input
            size="mini"
            placeholder="请输入菜单名"
            v-model="singalMenu.name"
          ></el-input>
        </el-form-item>
        <el-form-item label="显示名称:" prop="displayName">
          <el-input
            size="mini"
            placeholder="请输入显示名称"
            v-model="singalMenu.displayName"
          ></el-input>
        </el-form-item>
        <el-form-item label="地址:" prop="url">
          <el-input
            size="mini"
            placeholder="请输入菜单地址"
            v-model="singalMenu.url"
          ></el-input>
        </el-form-item>
        <el-form-item label="排序:" prop="sort">
          <el-input
            size="mini"
            placeholder="请输入菜单排序"
            v-model="singalMenu.sort"
          ></el-input>
        </el-form-item>
        <el-form-item label="图标:" prop="icon">
          <el-input size="mini" v-model="singalMenu.icon"></el-input>
          <!-- <el-select v-model="singalMenu.icon" placeholder="请选择" size="mini">
            <el-option
              v-for="unit in units"
              :key="unit.id"
              :label="unit.name"
              :value="unit.id"
            ></el-option>
          </el-select> -->
        </el-form-item>
        <!-- <el-form-item label="是否启用:">
          <el-switch
            v-model="singalMenu.enabled"
            active-color="#13ce66"
            inactive-color="#ff4949"
          >
          </el-switch>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="submitSingalData(singalMenu)"
          size="mini"
          >确 定</el-button
        >
        <el-button @click="menuDialog = false" size="mini">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { createLogger, mapGetters } from "vuex";
import Utils from "@/assets/js/table_tree";
export default {
  name: "menu_mgr",
  computed: {
    ...mapGetters(["ownerMenus"]),
  },
  watch: {},
  filters: {
    levelText(value) {
      if (!value) return "";
      if (value == 1) {
        return "一级";
      } else if (value == 2) {
        return "二级";
      } else if (value == 3) {
        return "三级";
      } else if (value == 4) {
        return "四级";
      }
    },
  },
  data() {
    // 子菜單驗證規則和排序規則
    var checkSort = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入排序"));
      } else {
        callback();
      }
    };
    return {
      menuDialog: {
        visible: false,
        title: "",
        type: "", //new新增 sub添加子菜单  edit编辑
      },
      menus: [], //菜单列表
      singalMenu: {}, //弹窗数据
      disableParent: false, //是否父极菜单
      updateMenuRules: {
        parentName: [
          { required: true, message: "请输入菜单", trigger: "blur" },
        ],
        name: [
          {
            required: true,
            message: "请输入菜单",
            trigger: "blur",
          },
        ],
        sort: [
          {
            required: true,
            message: "请输入菜单排序",
            trigger: "blur",
          },
          { validator: checkSort },
        ],
        displayName: [
          {
            required: true,
            message: "请输入显示名称",
            trigger: "blur",
          },
        ],
      },
      obj: {
        // enName: null,
        icon: "icon-statistic",
        id: "ed59c78d-3b9f-4389-a7f4-a1a468a8967d",
        name: "全院报告",
        parentId: null,
        sort: 90,
        type: 0,
        url: "/reports.html#/internal",
      },
    };
  },

  mounted: function () {
    this.refresh();
    // this.menus = this.ownerMenus;//第一次默认在本地拿
  },
  methods: {
    refresh() {
      const loading = this.$loading({
        lock: true,
        text: "菜单加载中",
        spinner: "el-icon-loading",
      });
      this.$store
        .dispatch("sys/menu/owner")
        .then((resp) => {
          console.log(resp);
          loading.close();
          this.menus = resp;
        })
        .catch((err) => {
          loading.close();
          this.$message.error(err);
        });
    },
    editMenuDia(item, type) {
      this.menuDialog = {
        visible: true,
        type: type,
      };
      if (type == "new") {
        item.sort = parseInt(item.sort);
        this.menuDialog.title = "新增";
        this.disableParent = false;
        this.singalMenu = {
          enName: null,
          icon: "",
          id: "",
          name: "",
          displayName: "",
          parentId: null,
          sort: null,
          type: 0,
          url: "",
        };
      } else if (type == "edit") {
        item.sort = parseInt(item.sort);
        this.menuDialog.title = "编辑";
        this.disableParent = true;
        this.singalMenu = {
          enName: item.enName,
          icon: item.icon,
          id: item.id,
          name: item.name,
          displayName: item.displayName,
          parentId: item.parentId,
          sort: item.sort,
          type: item.type,
          url: item.url,
        };
      } else if (type == "sub") {
        item.sort = parseInt(item.sort);
        this.menuDialog.title = "新增子菜单";
        this.disableParent = true;
        this.singalMenu = {
          enName: null,
          icon: null,
          id: null,
          name: null,
          displayName: null,
          parentId: item.id,
          parentName: item.name,
          sort: null,
          type: item.type,
          url: null,
        };
      }
    },
    submitSingalData(item) {
      if (item.name && item.sort) {
        const loading = this.$loading({
          lock: true,
          text: "加载菜单...",
          spinner: "el-icon-loading",
        });
        if (item) {
          this.singalMenu = item;
        }
        if (this.menuDialog.type == "edit") {
          this.$store
            .dispatch("sys/menu/update", this.singalMenu)
            .then((resp) => {
              this.$message.success("编辑成功");
              this.menuDialog.visible = false;
              this.refresh();
              loading.close();
            })
            .catch((err) => {
              loading.close();
            });
        } else {
          this.singalMenu.sort = parseInt(this.singalMenu.sort);
          this.$store
            .dispatch("sys/menu/create", this.singalMenu)
            .then((resp) => {
              this.$message.success("创建成功");
              this.menuDialog.visible = false;
              this.refresh();
              loading.close();
            })
            .catch((err) => {
              loading.close();
            });
        }
      } else {
        this.$message.warning("请填写必填项目~");
      }
    },
    deleteMenu(id) {
      console.log("删除菜单");
      this.$confirm(
        "此操作将永久删除菜单后将无法恢复，确认要删除此菜单吗？",
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
            text: "删除菜单中",
            spinner: "el-icon-loading",
          });
          this.$store
            .dispatch("sys/menu/delete", id)
            .then((res) => {
              this.refresh();
              loading.close();
            })
            .catch((err) => {
              loading.close();
              this.$message.error(err);
            });
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  &::v-deep {
    .el-table tr {
      height: 48px;
      .el-table__indent {
        padding-left: 0;
      }
    }
    .el-table td,
    .el-table th {
      padding: 0;
    }
    .el-form-item__error {
      padding-top: 0px;
      position: relative;
      top: 0;
      left: 0;
    }
    .el-form-item {
      display: flex;
      margin-bottom: 0;
      label {
        text-align: right;
        width: 90px;
      }
      .el-form-item__content {
        width: calc(100% - 80px);
      }
    }
  }
}
::v-deep .el-table__expand-icon {
  margin-left: -10px;
}
::v-deep .el-table [class*="el-table__row--level"] .el-table__expand-icon {
  width: 6px;
}
::v-deep .el-table [class*="el-table__row--level"] .el-table__placeholder {
  margin-left: -21px;
}
</style>
