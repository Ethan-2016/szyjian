<template>
     <!-- 签名 -->
    <el-dialog  class="e-dialog" width="20%"
        :title="signatureDialog.title" 
        :visible.sync="signatureDialog.visible" 
        @close="handleClose" >
        <div v-if="signatureDialog.type=='1'">
            <span>是否确认删除签名？</span>
        </div>
        <div v-else-if="signatureDialog.type=='2'">
            <el-form :model="numberValidateForm" ref="numberValidateForm" label-width="100px" class="demo-ruleForm">
                <el-form-item :label-width="formLabelWidth" label="账号" prop="username">
                    <el-input v-model="numberValidateForm.username"></el-input>
                </el-form-item>
                 <el-form-item :label-width="formLabelWidth" label="密码" prop="password">
                    <el-input v-model="numberValidateForm.password" show-password></el-input>
                </el-form-item>
            </el-form>
        </div>
        <div v-else>
          <span>是否确认签名？</span>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="cancelOp" size="small">确 定</el-button>
            <el-button @click="signatureDialog.visible = false" size="small">取 消</el-button>
        </span>
    </el-dialog>
</template>

<script>
import Report from "@/benchs/sanesthesia/api/saReport";
export default {
  name: "saSignature",
  props: {
    signatureDialog: {
      type: Object,
    },
  },
  data() {
    return {
      showDialog: false,
      numberValidateForm:{
          username:'',
          password:''
      },
      formLabelWidth: '70px',
      cancelForm: {
        type: null, //取消类型
        reason: "", //取消原因
      },
      codeType:Number,
      codeName:""
    };
  },
  watch: {
    // 监听 addOrUpdateVisible 改变
    // signatureDialog(newVal,oldVal){
    //     this.showDialog = newVal.visible
    // },
  },
  mounted() {},
  methods: {
    cancelOp() {
      if(this.signatureDialog.type=="2"){
          let data = this.numberValidateForm
          this.codeType = 2
          if(!this.numberValidateForm.username || !this.numberValidateForm.username){
            return this.$message.warning("请先输入用户名和密码！")
          }
          Report.getSignature(data).then((res)=>{
            let msg = {}
            msg.res = res
            msg.index = this.signatureDialog.index
            msg.type = this.signatureDialog.type
            msg.code = this.numberValidateForm.username
            msg.id = this.signatureDialog.id
            this.codeName = msg.code
            this.$refs['numberValidateForm'].resetFields();
            this.$emit('signatureSubmit',msg)
          })
      }else if(this.signatureDialog.type=="3"){
        this.codeType = 3
        let msg = {
          res:this.$store.state.app.userInfo.extraProperties.Signature,
          code:this.$store.state.app.userInfo.userName,
          id:this.signatureDialog.id,
          index:this.signatureDialog.index,
          type:this.signatureDialog.type
        }
        this.$emit('signatureSubmit',msg)
      }else{
        let msg = {
          type:this.signatureDialog.type,
          index:this.signatureDialog.index,
          id:this.signatureDialog.id,
        }
        if(this.codeType===2){
          msg.code = this.codeName
        }else{
          msg.code = this.$store.state.app.userInfo.userName
        }
        this.$emit('signatureSubmit',msg)
      }
      this.signatureDialog.visible = false;
    },
    handleClose() {
      this.signatureDialog.visible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.form-cancel {
  .el-form {
    display: flex;
    flex-direction: column;
    .el-form-item__content {
      .el-select {
        width: 100%;
      }
    }
  }
}
</style>
