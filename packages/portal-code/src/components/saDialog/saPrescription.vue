<template>
  <!-- 麻精处方 -->
  <el-dialog
    class="e-dialog"
    width="50%"
    @open="open"
    @close="cancel"
    :title="prescripDialog.title"
    :visible.sync="prescripDialog.visible"
  >
    <div class="tab-box">
      <span
        :class="{ active: prescriptionType == 0 }"
        @click="prescriptionswitch(0)"
        >精一</span
      >
      <span
        :class="{ active: prescriptionType == 1 }"
        @click="prescriptionswitch(1)"
        >精二</span
      >
    </div>
    <el-form
      class="formFlex"
      ref="prescripForm"
      :model="prescripForm"
      :rules="prescripRules"
      label-width="80px"
      size="small"
    >
      <el-form-item label="药品"  class="item" prop="drugCode">
        <el-select
          style="width: 100%"
          filterable
          v-model="prescripForm.drugCode"
          @change="drugChange"
        >
        <!-- :disabled="eitdNot" -->
          <el-option
            v-for="(item, index) in drugs"
            :key="item.drugCode + index"
            :label="item.drugName + ' ' + item.drugSpec"
            :value="item.drugCode"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="药品批号"  class="item" prop="drugBatchNumber">
        <el-input
          v-model="prescripForm.drugBatchNumber"
        ></el-input>
      </el-form-item>
      <el-form-item label="途径"  class="item2" prop="routeCode">
        <el-select
          filterable
          v-model="prescripForm.routeCode"
          @change="routeChange"
        >
          <el-option
            v-for="(item, index) in routes"
            :key="item.drugCode + index"
            :label="item.drugRoute"
            :value="item.drugCode"
          ></el-option>
        </el-select>
      </el-form-item>
      <!--<el-form-item label="频次" class="item2" >
        <el-input v-model="frequencyName" disabled></el-input>
      </el-form-item>-->
      <el-form-item label="剂量"  class="item2" prop="unitCount">
        <el-input
          v-model="prescripForm.unitCount"
          @input="prescripForm.unitCount=prescripForm.unitCount?prescripForm.unitCount.replace(/[^\d*.?\d{0,2}]/g,''):null"
          @blur="calculationAmount"
        ></el-input>
      </el-form-item>
      <el-form-item label="剂量单位"  class="item2" prop="unitCode">
        <el-select
          filterable
          v-model="prescripForm.unitCode"
          @focus="getSelectDrugUnitDicList"
          @change="unitChange"
        >
          <el-option
            v-for="(item, index) in doseUnits"
            :key="item.unitCode + index"
            :label="item.unitName"
            :value="item.unitCode"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数量"  class="item2" prop="drugCount">
        <el-input
          v-model="prescripForm.drugCount"
          @input="$forceUpdate()"
          oninput="value=value.replace(/^\.+|[^\d.]/g,'')"
          @blur="calculation"
        ></el-input>
      </el-form-item>
      <el-form-item label="数量单位" class="item2">
        <el-input v-model="doseUnit" disabled></el-input>
      </el-form-item>
      <el-form-item label="规格" class="item2">
        <el-input v-model="prescripForm.drugSpec" disabled></el-input>
      </el-form-item>
      <el-form-item label="费别" class="item2">
        <el-select :disabled="feibie!=null" v-model="feibie" @change="$forceUpdate()">
          <el-option label="公费" value="公费"></el-option>
          <el-option label="自费" value="自费"></el-option>
          <el-option label="医保" value="医保"></el-option>
          <el-option label="其他" value="其他"></el-option>
        </el-select>
      </el-form-item>
       <el-form-item label="开立人" class="item2" prop="createUserCode">
        <!-- <el-input
          v-model="prescripForm.createUserName"
        ></el-input> -->
        <el-select
          @change="createUserCodeS"
          v-model="prescripForm.createUserCode"
          filterable
        >
          <el-option
            v-for="item in anesthesiologistList"
            :key="item.rolePersonCode"
            :value="item.rolePersonCode"
            :label="item.rolePerson"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label=""  style="text-align: left;" class="item4">
        <el-checkbox
          @change="$forceUpdate()"
          v-model="prescripForm.isResidueDiscarding"
          >余量丢弃</el-checkbox
        >
      </el-form-item>
      <el-form-item v-show="prescripForm.isResidueDiscarding==true" label-width="0px" class="item2">
          <el-input @input="$forceUpdate()" style="width:100px" size="mini" type="number" v-model="prescripForm.allowance"></el-input>
          <span style="display:inline-block;">{{prescripForm.unitName}}</span>
        </el-form-item>
      <el-form-item label="" label-width="0px" style="text-align: right;" class="item4">
        <el-checkbox v-model="prescripForm.isEmptyBottles"
          >空安瓶回收</el-checkbox
        >
      </el-form-item>
      <el-form-item
        label="开立时间"
        class="item7"
        prop="createTime"
        label-width="100px"
      >
        <!-- <el-date-picker
          format="yyyy-MM-dd HH:mm"
          v-model="prescripForm.createTime"
          :clearable="false"
          type="datetime"
          placeholder="选择日期时间"
        >
        </el-date-picker> -->
        <sz-datetime
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm"
          v-model="prescripForm.createTime"
          :isClear="false"
          type="datetime"
          width="148px"
          height="32px"
          placeholder="选择日期时间">
        </sz-datetime>
      </el-form-item>
      <el-form-item label="医嘱号" class="item">
        <el-input
          v-model="prescripForm.medicalAdviceNumber"
          disabled
        ></el-input>
      </el-form-item>
      <el-form-item label="处方编号" class="item">
        <el-input
          v-model="prescripForm.prescriptionNumber"
          disabled
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          @click="save"
          size="small"
          type="primary"
          >保存</el-button
        >
        <el-button v-if="prescriptionData.length>0 && eitdNot" @click="cancel" size="small" type="primary">取消</el-button>
      </el-form-item>
    </el-form>
    <div class="border"></div>
    <div style="text-align: right; margin-bottom: 10px">
      <el-button size="small" :loading="btnLoading" @click="printBtn" type="primary">打印</el-button>
      <saPrescriptionPrintNew ref="printContent" v-show='showPrint'></saPrescriptionPrintNew>
    </div>
    <el-table
      style="width: 100%"
      height="300"
      ref="singleTable"
      :data="prescriptionData"
      highlight-current-row
      stripe
      :fit="false"
      tooltip-effect="light"
      :cell-class-name="tableCellClassName"
      @row-click="rowClick"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        label="序号"
        type="index"
        align="center"
        width="55"
      ></el-table-column>
      <!-- <el-table-column
        label="医嘱号"
        prop="medicalAdviceNumber"
        width="210"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="处方编号"
        prop="prescriptionNumber"
        width="210"
        show-overflow-tooltip
      ></el-table-column> -->
      <el-table-column
        label="药品"
        prop="drugName"
        width="200"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        label="剂量"
        prop="unitCount"
        align="center"
        min-width="50"
      ></el-table-column>
      <el-table-column
        label="单位"
        prop="unitName"
        align="center"
        min-width="150"
      ></el-table-column>
      <el-table-column
        label="数量"
        prop="drugCount"
        align="center"
        min-width="50"
      ></el-table-column>
      <el-table-column
        label="单位"
        prop="doseUnit"
        align="center"
        min-width="50"
      ></el-table-column>
      <el-table-column
        label="规格"
        prop="drugSpec"
        align="center"
        min-width="180"
      ></el-table-column>
      <el-table-column
        label="途径"
        prop="routeName"
        align="center"
        min-width="100"
      ></el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="small" type="text" @click="delROW(scope)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <span slot="footer">
      <el-button @click="prescripDialog.visible = false" size="small"
        >关闭</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import moment from "moment";
import Prescription from "@/benchs/sanesthesia/api/saPrescription.js";
import SaCockpit from "@/benchs/sanesthesia/api/SaCockpit.js"
import Management from "@/benchs/sanesthesia/api/saManagement";
import saPrescriptionPrintNew from "@/benchs/sanesthesia/views/saDocuments/saPrescriptionPrintNew"
import szDatetime from "@/components/szDatetime/szDatetime.vue";
export default {
  name: "saPrescription",
  components:{
    saPrescriptionPrintNew,
    szDatetime
  },
  props: {
    prescripDialog: {
      type: Object,
      defalut: {
        title: "",
        visible: false,
      },
    },
    prescripParam: {//operId
      type: String,
      defalut: "",
    },
  },
  data() {
    return {
      showPrint:false,
      frequencyName: "ONCE",
      frequencyCode: "cvbcv",
      doseUnit: "",
      prescripForm: {},
      prescripRules:{
        drugCode:[{ required: true, message: '请选择药品', trigger: 'change' }],
        drugBatchNumber:[{ required: true, message: '请填写批号', trigger: 'blur' }],
        routeCode:[{ required: true, message: '请选择途径', trigger: 'change' }],
        unitCount:[{ required: true, message: '请填写剂量', trigger: 'blur' }],
        unitCode:[{ required: true, message: '请选择剂量单位', trigger: 'change' }],
        drugCount:[{ required: true, message: '请填写数量', trigger: 'blur' }],
        createTime:[{ required: true, message: '请选择时间', trigger: 'blur' }],
        createUserCode:[{ required: true, message: '请填写开立人', trigger: 'change' }],
      },
      drugs: [], //药品字典
      doseUnits: [], //剂量字典
      dosePerUnit:"",
      routes: [], //途径字典
      prescriptionData: [],
      selectList:[],
      selectForm:{},
      anesthesiologistList:[],//麻醉医生合集
      prescriptionType: 0, //处方区分(0.精一,1.精二)
      eitdNot: false,
      PageIndex: 1,
      PageSize: 100,
      TotalPage: 1,
      query: "",
      // Property: [0,1,2,3,4],
      Property:0,
      scroll: true,
      userInfo:{},
      curRowIndex: 0,
      btnLoading:false,
      feibie:"",
    };
  },
  watch: {
    // prescripParam(newVal, oldVal) {
    //   if (newVal != oldVal) {
    //     this.prescriptionType = 0;//默认精一
    //     this.prescripForm = {
    //       isEmptyBottles : true,
    //       createTime : moment().format(),
    //       createUserName:this.userName,
    //     };
    //     this.getPrescriptionList();
    //   }
    // },
  },
  computed: {
      userName() {
          var info = this.$store.state.app.userInfo;
          // return (info.name || '无名氏');
          return info.surname || info.name;
      },
      userCode(){
        var code = this.$store.state.app.userInfo;
        return code.userName || ""
      }
  },
  mounted() {
    this.prescripForm = {
      isEmptyBottles : true,
      createTime : moment().format(),
      createUserName:this.userName,
      createUserCode:this.userCode
    };
  },
  methods: {
    // 根据剂量计算数量及余液丢弃量
    calculationAmount(){
      // console.log(this.dosePerUnit)
      if(this.prescripForm.drugCode&&this.prescripForm.unitCount&&this.prescripForm.unitCount!=''){
        if(Number(this.prescripForm.unitCount)>Number(this.dosePerUnit)){
          this.prescripForm.drugCount = Math.ceil(this.prescripForm.unitCount/this.dosePerUnit);
          this.prescripForm.isResidueDiscarding = true;
        }else if(Number(this.prescripForm.unitCount)===Number(this.dosePerUnit)){
          this.prescripForm.drugCount = Math.ceil(this.prescripForm.unitCount/this.dosePerUnit);
          this.prescripForm.isResidueDiscarding = false;
        }else{
          this.prescripForm.drugCount = 1;
          this.prescripForm.isResidueDiscarding = true;
        }
        let allow = Number(this.dosePerUnit*this.prescripForm.drugCount-this.prescripForm.unitCount);
        this.prescripForm.allowance = Number.isInteger(allow)?allow:allow.toFixed(2)
        // this.prescripForm.allowance = (this.dosePerUnit*this.prescripForm.drugCount-this.prescripForm.unitCount).toFixed(2);
        if(this.prescripForm.allowance==0){
          this.prescripForm.isResidueDiscarding = false;
        }
      }
      this.$forceUpdate();
    },
    calculation(){
      if(
        this.prescripForm.drugCode&&
        this.prescripForm.unitCount&&
        this.prescripForm.unitCount!=''&& 
        this.prescripForm.drugCount&&
        this.prescripForm.drugCount!=''){
        let allow = Number(this.dosePerUnit*this.prescripForm.drugCount-this.prescripForm.unitCount);
        this.prescripForm.allowance = Number.isInteger(allow)?allow:allow.toFixed(2)
        // this.prescripForm.allowance = (this.dosePerUnit*this.prescripForm.drugCount-this.prescripForm.unitCount).toFixed(2);
        this.prescripForm.isResidueDiscarding = true;
        if(this.prescripForm.allowance==0){
          this.prescripForm.isResidueDiscarding = false;
        }
        this.$forceUpdate();
      }
    },
    prescriptionswitch(i) {//切换精一/精二
      this.curRowIndex = 0;
      this.prescriptionType = i;
      this.userInfo.prescriptionType = i;
      this.prescripForm = {
        isEmptyBottles : true,
        createTime : moment().format(),
        createUserName:this.userName,
      };
      if(i===0){
        this.Property = 0
      }else{
        this.Property = 2
      }
      this.$nextTick(()=>{
        this.$refs['prescripForm'].clearValidate()
      })
      this.getDictDrugList();
      this.getPrescriptionList();
    },
    tableCellClassName({row, column, rowIndex, columnIndex}){
      row.index=rowIndex;
      column.index=columnIndex;
    },
    //  获取麻醉医生下拉数据
    getRole() {
      Management.EditMedicalStaffDisplay({ role: 1 })
        .then(({ data, msg, code }) => {
          if (code === 200) {
            this.anesthesiologistList = data.roleCustomBacks;
            let isTrue = this.anesthesiologistList.find(item=>item.rolePersonCode==this.userCode); 
            if(!isTrue){
              this.anesthesiologistList.unshift({
                rolePersonCode:this.userCode,
                rolePerson:this.userName
              })
            }
            // console.log(this.anesthesiologistList)
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    createUserCodeS(val){
      this.prescripForm.createUserName = this.anesthesiologistList.find(ele=>ele.rolePersonCode==val).rolePerson
    },
    drugChange(e) {
      //药品
      this.prescripForm.createTime = moment().format();
      this.prescripForm.doseUnitCode = "";
      this.drugs.forEach((item) => {
        if (item.drugCode == e) {
          console.log(item)
          this.prescripForm.drugName = item.drugName;
          this.prescripForm.drugId = item.id;
          this.doseUnit = item.minUnit;
          this.dosePerUnit = item.dosePerUnit;
          this.prescripForm.unitCode = item.drugUnit
          this.prescripForm.unitName = item.drugUnit
          this.prescripForm.drugSpec = item.drugSpec
        }
      });
    },
    routeChange(e) {
      //途径
      this.routes.forEach((item) => {
        if (item.drugCode == e) {
          this.prescripForm.routeName = item.drugRoute;
        }
      });
    },
    unitChange(e) {
      //剂量
      this.doseUnits.forEach((item) => {
        if (item.unitCode == e) {
          this.prescripForm.unitName = item.unitName;
        }
      });
      this.$forceUpdate();
    },
    //获取患者信息
    getInfo(val){
      this.userInfo = val;
      delete this.userInfo.feibie;
      this.userInfo.prescriptionType = this.prescriptionType;
      SaCockpit.patientIdInfo(val.patientId).then(res=>{
        if(res.code==200){
          console.log(res.data.patientType)
          this.feibie = res.data.patientType;
          this.prescripForm.feibie = res.data.patientType;
        }
      })
    },
    printBtn(){
      if(this.prescriptionData<1){
        return this.$message.warning("无打印内容，请先保存数据")
      }
      if(this.selectList<1 && !this.selectForm){
        return this.$message.warning("请勾选需要打印的数据")
      }
      let selectArr = [],arr = [];
      if(this.selectList<1){
        arr.push(this.selectForm)
        selectArr = arr;
      }else{
        selectArr = this.selectList;
      }
      selectArr.forEach((item)=>{
        item = Object.assign(item,this.userInfo)
        item.printTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        item.allowanceList = []
        if(item.birthPlace && !isNaN(item.birthPlace.substring(0,9))){
          item.birthPlace = item.birthPlace.substring(9)
        }
        item.allowanceList.push({
          allowance:item.allowance,
          executor:"",
          prover:""
        })
        // if(item.drugSpec.split('x')){
        //   item.drugSpec = item.drugSpec.split('x')[0];
        // }
      })
      if(window.nativePrinter){
        var printUrl = window.location.protocol +"//"+ window.location.host + `/sanesthesia.html#/saDocuments/saPrescriptionPrint?list=${JSON.stringify(selectArr)}&printType=auto`;
        window.nativePrinter.printA5(printUrl,null,false);
      }else if(window.isAimsClient){
        this.btnLoading = true;
        let pageId = `${new Date().getTime()}${Math.floor(Math.random()*(9999-1000))+1000}`,objArr=[];
        objArr.push({
          id:pageId,
          url:`${window.location.protocol}//${ window.location.host}/sanesthesia.html#/saDocuments/saPrescriptionPrint?id=${pageId}&printType=auto`,
          num:1,            //打印数量
          landscape:false,  //false 纵向，true 横向
          type:"recipe",
          margins:{
            marginType:"default"
          },
          documentName:"麻精处方",
          printData:selectArr
        })
        this.$socket.emit("print-view",objArr);
        setTimeout(()=>{
          this.btnLoading = false;
        },2000)
      }else{
        this.$refs.printContent.createPrint(selectArr);
        // window.open( `/sanesthesia.html#/saDocuments/saPrescriptionPrint?list=${JSON.stringify(selectArr)}&printType=auto`)
      }
    },
    rowClick(row, column, event) {
      this.curRowIndex = row.index;
      this.eitdNot = true;
      this.doseUnit = row.doseUnit;
      this.prescripForm = Object.assign({}, this.prescriptionData[this.curRowIndex]);
      this.dosePerUnit = this.drugs.find(ele=>ele.drugCode==this.prescripForm.drugCode).dosePerUnit;
      if(this.prescripForm.allowance==0){
        this.prescripForm.isResidueDiscarding = false;
      }
      this.selectForm = Object.assign({},row);
    },
    // 勾选表格项
    handleSelectionChange(val){
      this.selectList = val
    },
    open(){
      this.getPrescriptionList();
    },
    cancel() {
      //新增
      this.$refs['prescripForm'].resetFields();
      this.eitdNot = false;
      this.prescripForm = {
        isEmptyBottles : true,
        createTime : moment().format(),
        createUserName:this.userName,
        createUserCode:this.userCode,
      };
      this.doseUnit = '';
      this.$refs.singleTable.setCurrentRow(null);
    },
    delROW(scope) {
      let id = scope.row.id;
      if (id) {
        Prescription.delPrescription(id).then((res) => {
          if (res.code === 200) {
            this.$message.success("删除成功");
            this.getPrescriptionList();
          } else {
            this.$message.error("删除失败");
          }
        });
      }
    },
    save() {
      //保存
      this.$refs['prescripForm'].validate((valid)=>{
        if(valid){
            this.prescripForm.operId = this.prescripParam;
            this.prescripForm.prescriptionDifferentiation = this.prescriptionType;
            this.prescripForm.frequencyName = this.frequencyName;
            this.prescripForm.frequencyCode = this.frequencyCode;
            this.prescripForm.doseUnit = this.doseUnit;
            this.prescripForm.feibie = this.feibie;
            if (this.prescripForm.createTime) {
              this.prescripForm.createTime = moment(
                this.prescripForm.createTime
              ).format("YYYY-MM-DD HH:mm:ss");
            }
            if (Object.keys(this.prescripForm).length > 0) {
              if(this.prescripForm.id){
                Prescription.editPrescription(this.prescripForm).then((res) => {
                  if (res.code === 200) {
                    this.$message.success("修改成功");
                    this.getPrescriptionList();
                    setTimeout(()=>{
                      this.cancel();
                    },500)
                  } else {
                    this.$message.error("修改失败");
                  }
                });
              }else{
                Prescription.addPrescription(this.prescripForm).then((res) => {
                  if (res.code === 200) {
                    this.$message.success("保存成功");
                    this.getPrescriptionList();
                    setTimeout(()=>{
                      this.cancel();
                    },500)
                  } else {
                    this.$message.error("保存失败");
                  }
                });
              }
            }
        }
      })
      
    },
    getPrescriptionList() {
      //红处方列表
      Prescription.getPrescription({
        Operid: this.prescripParam,
        prescription: this.prescriptionType,
      }).then((res) => {
        // console.log('列表')
        let curRowIndex = this.curRowIndex
        this.prescriptionData = [];
        if (res.code === 200 && res.data !== null && res.data.length > 0) {
          this.prescriptionData = res.data;
          this.eitdNot = true;
          if (this.$refs.singleTable) {
            this.$refs.singleTable.setCurrentRow(this.prescriptionData[curRowIndex]);
          }
          this.prescripForm = Object.assign({}, this.prescriptionData[curRowIndex]);
          this.dosePerUnit = this.drugs.find(ele=>ele.drugCode==this.prescripForm.drugCode).dosePerUnit;
          if(this.prescripForm.allowance==0){
            this.prescripForm.isResidueDiscarding = false;
          }
          this.selectForm = Object.assign({}, this.prescriptionData[curRowIndex]);
          this.doseUnit = this.prescriptionData[curRowIndex].doseUnit || "";
        } else {
          this.cancel()
        }
      });
    },
    getDictDrugList() {
      Prescription.dictDrugList(this.PageIndex, this.PageSize, this.query, {
        Property: this.Property,
      }).then((res) => {
        //Property 属性(0.精一,1.毒,2.麻醉,3.精二，4.普通/其他)
        if (res.code === 200) {
            this.drugs = res.data;
        }
      });
    },
    getSelectDrugRouteDicList() {
      Prescription.selectDrugRouteDicList(1).then((res) => {
        this.routes = [];
        if (res.code === 200) {
          // console.log(res)
          this.routes = res.data;
        }
      });
    },
    getSelectDrugUnitDicList() {
      Prescription.selectDrugUnitDicList({query:'剂量'}).then((res) => {
        this.doseUnits = [];
        if (res.code === 200) {
          this.doseUnits = res.data;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-table__body{
  width:100%!important;
}
::v-deep .el-table__header{
  width:100%!important;
}
.e-dialog::v-deep {
  .el-dialog__body {
    padding-bottom: 10px;
  }
  .el-table {
    width: 100%;
    thead {
      th {
        height: 40px;
        padding: 0;
      }
      th,
      tr {
        background-color: #eeeeee;
      }
    }
    td {
      height: 40px;
      padding: 0;
      .cell {
        padding: 0 5px;
      }
    }
    tr.el-table__row.current-row td {
      background-color: #1bad96;
      color: #ffffff;
      .el-button--text {
        color: #ffffff;
      }
    }
    .el-button--small {
      padding: 0 15px;
    }
  }
}
.tab-box {
  margin-bottom: 10px;
  span {
    display: inline-block;
    width: 80px;
    height: 32px;
    line-height: 32px;
    text-align: center;
    border: 1px solid #1bad96;
    color: #1bad96;
    background: #ffffff;
    cursor: pointer;
    &:first-child {
      border-radius: 5px 0px 0px 5px;
      border-right: none;
    }
    &:last-child {
      border-radius: 0px 5px 5px 0px;
    }
    &.active {
      background: #1bad96;
      color: #ffffff;
    }
  }
}
.border {
  width: 100%;
  margin: 10px 0;
  height: 1px;
  background: #e4e4e4;
}
.formFlex {
  display: inline-flex;
  flex-wrap: wrap;
  .el-form-item {
    display: inline-block;
    margin-bottom: 15px;
  }
  ::v-deep  {
    .el-form-item__label{
      white-space: nowrap;
    }
    .el-date-editor.el-input, .el-date-editor.el-input__inner{
      width: 100%;
    }
    .el-input--suffix .el-input__inner{
      padding-right: 0;
    }
  }
  .item {
    width: 50%;
  }
  .item2 {
    width: 25%;
  }
  .item3 {
    width: 33.3%;
  }
  .item4{
    width:20%;
  }
  .item5{
    width:30%;
  }
  .item6{
    width:50%;
  }
  .item7{
    width:35%;
  }
}
</style>
