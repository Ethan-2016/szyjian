<template>
  <!-- 手术医生/麻醉医生/器械护士/巡回护士--穿梭框 -->
  <el-dialog
    class="e-dialog"
    width="550px"
    :title="transferDialog.title"
    :visible.sync="transferDialog.visible"
  >
    <el-transfer
      v-model="transferItems"
      :titles="['未选择', '已选择']"
      filterable
      target-order="push"
      filter-placeholder="请输入姓名"
      :props="{
        key: 'rolePersonCode',
        label: 'rolePerson',
      }"
      :data="transferData"
      @left-check-change="leftCheckChange"
      @change="transferChange"
    >
    </el-transfer>
    <span slot="footer">
      <el-button @click="submit" size="small" type="primary">确定</el-button>
      <el-button @click="transferDialog.visible = false" size="small"
        >取消</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: "saTransfer",
  props: {
    transferDialog: {
      type: Object,
      default() {
        return {
          title: "",
          visible: false,
        };
      },
    },
    transferItem: {
      type: Array,
      default() {
        return [];
      },
    },
    transferData: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      transferItems: this.transferItem,
    };
  },
  watch: {
    transferItem(val, oldVal) {
      console.log("transferItem", val);
      this.transferItems = val;
      let counts = this.transferItems;
      let count = counts.length;
      if (count === 3) {
        this.transferData.forEach((item) => {
          if (
            item.rolePersonCode == counts[0] ||
            item.rolePersonCode == counts[1] ||
            item.rolePersonCode == counts[2]
          ) {
            item.disabled = false;
            console.log(item);
          } else {
            item.disabled = true;
          }
        });
      }
    },
  },
  mounted() {},
  methods: {
    leftCheckChange(val, movedKeys) {
      console.log(val, "leftCheckChange");
      let counts, count;
      counts = val.concat(this.transferItems);
      count = counts.length;
      if (count === 3) {
        this.transferData.forEach((item) => {
          if (
            item.rolePersonCode == counts[0] ||
            item.rolePersonCode == counts[1] ||
            item.rolePersonCode == counts[2]
          ) {
            item.disabled = false;
            console.log(item);
          } else {
            item.disabled = true;
          }
        });
      } else {
        this.transferData.forEach((item) => {
          item.disabled = false;
        });
      }
    },
    transferChange(value, direction, movedKeys) {
      if (direction == "left") {
        if (this.transferItems.length < 3) {
          this.transferData.forEach((item) => {
            item.disabled = false;
          });
        }
      }
    },
    submit() {
      this.$emit("transferSubmit", this.transferItems);
    },
  },
};
</script>

<style lang="scss" scoped>
.e-dialog::v-deep {
  .el-transfer {
    width: 100%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    .el-transfer__buttons {
      .el-button {
        display: block;
        &:last-child {
          margin: 0;
        }
      }
    }
    .el-transfer-panel {
      .el-transfer-panel__header {
        .el-checkbox__input {
          display: none;
        }
      }
    }
  }
}
</style>
