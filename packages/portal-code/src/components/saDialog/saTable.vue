<template>
    <!-- 手术名称/麻醉方式/术前诊断/手术体位 -->
    <el-dialog class="e-dialog" width="45%"
        :title="DicDialog.title"
        :visible.sync="DicDialog.visible"
        :before-close="DicDialogClose">
        <div class="selected-box">
            <div>已选择:</div>
            <div v-if="DicResult.length>0">
                <div  v-for="(item,index) of DicResult" :key="index" class="input-box">
                    <input class="operation-input" type="text" :value="item" disabled/>
                    <i class="iconfont close_icon" @click="delOperation(index)"></i>
                </div>
            </div>
            <div v-else style="margin-left:10px">暂无</div>
        </div>
        <div style="display:flex; margin:20px 0 10px">
            <div style="width:50%">
                <span style="margin-right:10px">搜索:</span>
                <el-input @keyup.enter.native="operationCheck" v-model="searchName"
                    style="width:50%" size="small" type="text" placeholder="名称/拼音码" >
                    <i @click="operationCheck" slot="suffix" class="el-input__icon el-icon-search"></i>
                </el-input>
            </div>
            <!-- <div v-if="anesShow"> -->
            <div v-if="DicDialog.title==='麻醉方式'">
                <span style="margin-right:10px">麻醉类型:</span>
                <el-select v-model="anesType" size="small" @change="selectChange">
                    <el-option v-for="item in DicOptions.data" :key="item.code" :label="item.name" :value="item.code"></el-option>
                </el-select>
            </div>
        </div>
        <el-table   
            border highlight-current-row
            :data="DicList"
            @row-click="rowClick">
            <el-table-column type="index" label="序号" width="80"></el-table-column>
            <el-table-column label="名称" prop="name"></el-table-column>
            <el-table-column label="拼音码" prop="pinyin" width="200"></el-table-column>
        </el-table>
        <el-pagination class="e-pagination"
            background
            @current-change="handleCurrentChange"
            :current-page.sync="DicDialog.pageIndex"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="DicDialog.totalNumber">
        </el-pagination>
        <span slot="footer">
            <el-button @click="DicDialogSubmit" size="small" type="primary">确定</el-button>
            <el-button @click="DicDialogClose" size="small" >取消</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    name: "saTable",
    props: {
        DicList:Array,//表格数据
        DicDialog:{//弹框标题与显示
            type:Object,
            defalut:{
                title:'',
                visible:false,
                pageIndex:1,
                totalNumber:0, 
            }
        },
        DicResult:Array,//点击表格选择项
        DicResultCode:Array,//点击表格选择项里面的code
        DicOptions:{
            type:Object,
            defalut:{
                show:false,
                data:[],
                anesType:null,//默认选中
            }
        },
    },
    data() {
        return {
            searchName:'',
            searchNameChange:false,//输入框发生变化
            pageSize:10,
            anesType:null,
            anesShow:false
        };
    },
    mounted() {
        
    },
    watch:{
        'DicOptions.show':{
            handler(val){
                console.log(val,'table')
                this.anesShow = val;
                this.anesType = this.DicOptions.anesType;
            }
        },
    },
    methods: {
        rowClick(row, column, event){//点击一行
            this.$emit('rowClick',row)
        },
        operationCheck(){//输入框
            console.log(this.searchName)
            this.searchNameChange = true;
            this.$emit('dialogCheck',this.searchName)
        },
        selectChange(val){//下拉选择
            this.$emit('selectChange',val)
        },
        delOperation(i){//删除
            this.DicResult.splice(i,1)
            this.DicResultCode.splice(i,1)
        },
        handleCurrentChange(val) {//页码
            this.$emit('pageChange',val)
        },
        DicDialogSubmit(){//保存按钮
            if(this.searchNameChange){
                this.searchNameChange = false;
                this.$emit('dialogCheck','')
            }
            this.$emit('dialogSubmit',this.DicResult,this.DicResultCode)
        },
        DicDialogClose(){//关闭按钮 
            if(this.searchNameChange){
                this.searchNameChange = false;
                this.$emit('dialogCheck','')
            }
            this.DicDialog.visible = false;
        },
    },
};
</script>

<style lang="scss" scoped>
    .e-dialog::v-deep{
        .el-table{
            td,th{
                padding: 5px 0;
            }
            th{
                background-color:#EEF1F6;
                color:#595959;
                // border: 1px solid #dcdcdc;
            }
        }
    }
    .selected-box{
        display: flex;
        align-items: center;
        min-height: 30px;
        div:first-child{
            white-space: nowrap;
            font-weight: 500;
            color: #595757;
        }
    }
    .input-box{
        display: inline-block;
        position: relative;
        margin-left: 10px;
        margin-bottom: 5px;
    }
    .operation-input{
        border: 1px solid #1BAD96;
        color: #1BAD96;
        height: 26px;
        line-height: 26px;
        border-radius: 4px;
        text-align: center;
        &:focus{
            outline: none;
        }
    }
    .close_icon{
        color:#1BAD96;
        position: absolute;
        z-index: 1;
        top: -13%;
        right: -3%;
        background-color: #fff;
    }
    .e-pagination{
        text-align: right;
        margin-top: 10px;
    }
</style>
