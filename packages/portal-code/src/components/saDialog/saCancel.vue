<template>
     <!-- 取消手术 -->
    <el-dialog  class="e-dialog form-cancel" width="20%"
        title="取消手术" 
        :visible.sync="showDialog" 
        @close="handleClose" >
        <el-form ref="cancelForm" :model="cancelForm" label-width="90px">
            <el-form-item label="取消类型:" required>
            <el-select v-model="cancelForm.type" placeholder="请选择取消类型" size="small">
                <el-option
                v-for="(item, index) in cancelType"
                :key="index"
                :label="item.label"
                :value="item.value"
                ></el-option>
            </el-select>
            </el-form-item>
            <el-form-item label="取消原因:" required>
            <el-input v-model="cancelForm.reason" type="textarea" :rows="5"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="cancelOp" size="small">确 定</el-button>
            <el-button @click="showDialog = false" size="small">取 消</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    name: "saCancel",
    props: {
        cancelDialog:{
            type:Boolean,
            default:true,
        },
        cancelParam:{
            type:String,
            defalut:'',
        }
    },
    data() {
        return {
            showDialog:false,
            cancelType: [
                {
                    value: -1,
                    label: "其他原因",
                },
                {
                    value: 0,
                    label: "医生原因",
                },
                {
                    value: 1,
                    label: "患者原因",
                },
                {
                    value: 2,
                    label: "手术室原因",
                },
            ],
            cancelForm: {
                type:null,//取消类型
                reason: "",//取消原因
            },
        };
    },
    watch:{
        // 监听 addOrUpdateVisible 改变
        cancelDialog(oldVal,newVal){
            this.showDialog = this.cancelDialog
        },
        cancelParam(newVal,oldVal){//是否清空记录
            if(newVal!=oldVal){
                this.cancelForm = {
                    type:null,//取消类型
                    reason: "",//取消原因
                }
            }
        },
    },
    mounted() {
        
    },
    methods: {
        cancelOp(){
            if(this.cancelForm.type===null||this.cancelForm.reason===""){
                this.$message.warning('请填写取消类型或取消原因')
            }else{
                this.$emit('cancelSubmit',this.cancelForm)
            }
        },
        handleClose(){
            this.$emit('cancelClose')
        }
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
