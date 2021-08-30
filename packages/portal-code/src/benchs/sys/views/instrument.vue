<template>
  <div class="level3-box">
    <iframe
      width="100%;"
      style="border: none;"
      src="/document/form-management.html"
    ></iframe>
  </div>
</template>

<script>
import secondMenu from "@/components/SecondMenu/index.vue";
// import saSystem from "@/benchs/sanesthesia/api/saSystem";
// import DocumentClassify from "@/benchs/sanesthesia/views/saSystem/DocumentClassify.vue";

export default {
  components: {
    secondMenu,
    // DocumentClassify,
  },
  data() {
    return {
      menuIndex: "0",
      documentTempList: [],
      tableColumnData: [],
      multipleSelection: [],
      code: 0,
      PageIndex: 1,
      PageSize: 25,
      query: "",
      procStatus: "",
      curUrl: "",
      resultListData: [],
      input: "",
      timeNodeData: [],
      formDataAdd: [],
      dialogDeviceFormVisibleEdit: false,
      fromDeviceDetail: {
        // id: "",
        // templateUrl: "", //模板url
        // templateCode: "", //文书模板编码
        // name: "", //文书名称
        // timeNameCode: "", //时间节点(所属节点)
        // type: "", //文书分类
        // stage: "", //文书所属节点
        // categroy: "", //文书属性
        // isEnable: "", //是否启用
        // isComplete: "", //文书完整性
      },
      fromDeviceDetailEdit: {},
      addDocumentDialog: {
        title: "",
        type: 0, //编辑
        visible: false,
      },
      detailRules: {
        name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
        category: [
          { required: true, message: "请输入排序号", trigger: "blur" },
          // { type: 'number', message: '排序号必须为数字值'}
        ],
      },
    };
  },
  filters: {
    filterArr(arr) {
      if (!arr) return "";
      if (arr.length > 0) {
        let text = "";
        let icon = "";
        arr.forEach((item, index) => {
          icon = index < arr.length - 1 ? "," : "";
          text += item + icon;
        });
        return text;
      } else {
        return "";
      }
    },
    filterTxt(val) {
      let name = "";
      if (val == 0) {
        name = "麻醉";
      } else if (val == 1) {
        name = "护理";
      }
      return name;
    },
  },
  mounted() {
    this.menuIndex = sessionStorage.getItem("menuItemIndex") || "0";
    this.code = this.menuIndex;
    this.GetDicData();
  },
  watch: {
    query: function (newVal, oldVal) {
      if (newVal !== oldVal || newVal !== "" || newVal !== undefined) {
        this.PageIndex = 1;
      }
    },
  },

  methods: {
    EditConfirm(){},
    getDocumentTemplateList() {
      //查询不在列表内的文书
      saSystem.documentTemplateList().then((res) => {
        console.log(res);
        this.documentTempList = res.data || [];
      });
    },
    isSelectedAll(arr) {
      return arr.some((item) => {
        return item === 0;
      });
    },
    docunmentTempListEvent(tempItem) {
      this.documentTempList.forEach((e) => {
        if (e.formCode == tempItem) {
          this.fromDeviceDetail.templateCode = e.formCode;
          this.fromDeviceDetail.name = e.formName;
        }
      });
    },
    // 列表渲染
    GetDicData() {
      this.tableColumnData = [
        { name: "排序", model: "order", width: 60 },
        { name: "文书编码", model: "templateCode" },
        { name: "文书名称", model: "name" },
        // { name: "文书分类", model: "type" },
        // { name: "所属节点", model: "stageName" },
        { name: "文书属性", model: "category" },
        { name: "是否启用", model: "isEnable", temptype: "switch" },
        { name: "是否打印", model: "isPrint", temptype: "switch" },
        { name: "完整性检查", model: "isComplete", temptype: "switch" },
      ];
      //文书列表
      let params = {
        PageIndex: this.PageIndex,
        PageSize: this.PageSize,
        DocumetNameAndCode: this.query,
        // procStatus: this.procStatus,
      };
      saSystem.documentList(params).then((res) => {
        this.resultListData = [];
        if (res.code === 200) {
          this.resultListData = res;
        } else if (res.code === 404) {
          this.$message.warning(res.msg);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    GetItemArray(item) {
      //将对象转成数组模式
      if (item == null) {
        return [];
      }
      let itemArr = Object.keys(item).map((key) => {
        //console.log(key); //为每个键名
        if (item[key] != null && typeof item[key] == "object") {
          item[key] = this.GetItemArray(item[key]);
        }
        //把每个对象返回出去生成一个新的数组中相当于0:{id:1}
        return item[key];
      });
      return itemArr;
    },
    PostEditData() {
      //确认按钮
      let type = this.addDocumentDialog.type;
      if (type === 0) {
        // 新增
        this.$refs["fromDeviceDetail"].validate((valid) => {
          if (valid) {
            saSystem
              .documentConfigAdd(this.fromDeviceDetail)
              .then(({ data, code, msg }) => {
                if (code == 200) {
                  this.GetDicData();
                  this.$message.success(msg);
                  this.addDocumentDialog.visible = false;
                } else {
                  this.$message.error(msg);
                }
              });
          }
        });
      } else if (type === 1) {
        //编辑
        this.$refs["fromDeviceDetail"].validate((valid) => {
          if (valid) {
            saSystem.documentConfig(this.fromDeviceDetail).then((res) => {
              if (res.code == 200) {
                this.GetDicData();
                this.$message.success(res.msg);
                this.addDocumentDialog.visible = false;
              } else {
                this.$message.error(res.msg);
              }
            });
          }
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.level3-box {
  display: flex;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: #fff;
  .main-content {
    box-sizing: border-box;
    width: calc(100% - 160px);
    height: 100%;
    padding: 10px;
    overflow: auto;
    .block-filter {
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      .main-topBar {
        margin-right: 20px;
        .instrumentName {
          width: 200px;
          margin-left: 10px;
        }
      }
    }
  }
}
.level3-box::v-deep{
  .el-pagination {
    float: right;
    margin-top: 10px;
  }
}

</style>


