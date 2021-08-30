<template>
    <el-dialog
        :title="userInfoDialog.title"
        :visible.sync="userInfoDialog.visible"
        width="60%"
        v-dialogDrag
        @close="handleClose"
    >
    <div class="userInfo">
        <!-- <div class="info-left">
        </div>
        <div class="info-right">
        </div> -->
         <el-container>
            <el-aside style="width:400px;">
                <div class="filter-info">
                    <div class="filter-infoT">
                        <label>手术日期：</label>
                        <el-date-picker
                            v-model="filterForm.ScheduledDateTime"
                            @change="GetOperationRecord"
                            type="date"
                            size="mini"
                            format="yyyy-MM-dd"
                            placeholder="选择日期">
                        </el-date-picker>
                        <el-button style="margin-left:4px;" size="mini" @click="timeNow" type="primary">今天</el-button>
                        <el-dropdown trigger="click" ref="messageDrop">
                            <span class="iconfont jiancha"></span>
                            <el-dropdown-menu class="dropdownMenu" slot="dropdown">
                                <el-radio-group class="dropdownBox" v-model="filterForm.EmergencyIndicator">
                                    <el-radio :label="true">急诊</el-radio>
                                    <el-radio :label="false">择期</el-radio>
                                </el-radio-group>
                                <el-radio-group class="dropdownBox" v-model="filterForm.Status">
                                    <el-radio :label="-1">全部</el-radio>
                                    <el-radio :label="0">术前</el-radio>
                                    <el-radio :label="1">术中</el-radio>
                                    <el-radio :label="2">术后</el-radio>
                                </el-radio-group>
                                <div class="btns">
                                    <el-button @click="submitdrop('close')" size="mini">取消</el-button>
                                    <el-button size="mini" @click="submitdrop('submit')" type="primary">确定</el-button>
                                </div>
                            </el-dropdown-menu>
                        </el-dropdown>
                        
                    </div>
                    <div class="filter-infoB">
                        <el-col class="filter-room" :span="12">
                            <label>术间：</label>
                            <el-select @change="GetOperationRecord" v-model="filterForm.RoomCode" size="mini" placeholder="请选择">
                                <el-option label="全部术间" value=""></el-option>
                                <el-option
                                    v-for="(item,index) in operRoomList"
                                    :key="index"
                                    :label="item.name"
                                    :value="item.code">
                                </el-option>
                            </el-select>
                        </el-col>
                        <el-col class="filter-name" :span="12">
                            <label>患者：</label>
                            <el-input @input="GetOperationRecord" size="mini" placeholder="住院号/姓名" v-model="filterForm.NameOrInpNo" style="width:60%;"></el-input>
                        </el-col>
                        
                    </div>
                </div>
                <div v-if="opDatas.length>0" class="patientList">
                    <div :class="{selected:selected==index}" @click="choosePatient(item,index)" @dblclick="switchPatient(item,index)" v-for="(item, index) in opDatas" :key="index" class="patientCard">
                        <div class="card-left">{{ item.room }}-{{ item.sequence }}</div>
                        <div class="card-right">
                            <p><span>{{item.name}}</span><span>{{item.sex}}/{{item.age}}</span><span :style="`background:${item.procStatusColor}`" class="logotype">{{item.procStatus}}</span></p>
                            <p><span>ID：{{item.patientId}}</span><span>住院号：{{item.inpNo}}</span></p>
                            <p>手术名称：{{item.operationName}}</p>
                            <p>手术时间：{{item.scheduledDateTime | filterTime}}</p>
                            <p><span>手术：{{item.surgeon|filterArr}}</span><span>麻醉：{{item.anesthesiaDoctor|filterArr}}</span></p>
                        </div>
                    </div>
                </div>
                <div style="text-align:center;margin-top:40px;" v-else>暂无数据</div>
            </el-aside>
            <el-main>
                <h3>患者详情</h3>
                <div>
                    <div class="content-head">基本信息</div>
                    <div class="content-main">
                        <div>
                            <span class="content-left">病区：{{patientEssential.wardName}}</span>
                            <p><span class="content-center">床号：{{patientEssential.bedNo}}</span><span>入院时间：{{patientEssential.admissionTime}}</span></p>
                        </div>
                        <div>
                            <span class="content-left">证件类型：{{patientEssential.noType}}</span>
                            <p><span class="content-center">证件号码：{{patientEssential.idNo}}</span><span>出生日期：{{patientEssential.dateOfBirth}}</span></p>
                        </div>
                        <div>
                            <span class="content-left">联系人：{{patientEssential.nextOfKin}}</span>
                            <p><span>联系电话：{{patientEssential.phone}}</span></p>
                        </div>
                        <div>
                            <span class="content-left1">住址：{{patientEssential.homeAddress}}</span>
                            <p><span>费用类型：{{patientEssential.patientType}}</span></p>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="content-head">计划信息</div>
                    <div class="content-main">
                        <div>
                            <span class="content-left">申请课室：{{patientPlannedSur.appDept}}</span>
                            <p><span class="content-center">申请人：{{patientPlannedSur.applicant}}</span><span>申请时间：{{patientPlannedSur.reqDateTime2}}</span></p>
                        </div>
                        <div>
                            <span class="content-left">急诊/择期：{{patientPlannedSur.emergencyIndicator|filterType}}</span>
                            <p><span class="content-center">计划手术时间：{{patientPlannedSur.scheduledDateTime2}}</span><span>术间：{{patientPlannedSur.room}}</span><span style="margin-left:40px;">台次：{{patientPlannedSur.sequence}}</span></p>
                        </div>
                        <div class="content-between">
                            <span>拟施手术：{{patientPlannedSur.proposedOpre}}</span>
                            <span>手术等级：{{patientPlannedSur.operationScale}}</span>
                        </div>
                        <div class="content-between">
                            <span>拟施麻醉：{{patientPlannedSur.premedication}}</span><span>术前诊断：{{patientPlannedSur.diagBeforeOperation}}</span>
                        </div>
                        <div>
                            <span class="content-left">感染：{{patientPlannedSur.infect}}</span>
                            <p><span>备注：{{patientPlannedSur.remark}}</span></p>
                        </div>
                        <div>
                            <span class="content-left2">手术：{{patientPlannedSur.surgeon2|filterArr}}</span>
                            <p><span>麻醉：{{patientPlannedSur.anesthesiaDoctor2|filterArr}}</span></p>
                        </div>
                        <div>
                            <span class="content-left2">器械：{{patientPlannedSur.supplyNurse2|filterArr}}</span>
                            <p><span>巡回：{{patientPlannedSur.operationNurs2|filterArr}}</span></p>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="content-head">实时信息</div>
                    <div class="content-main">
                        <div>
                            <span class="content-left">手术时间：{{patientPerformSur.startDateTime}}</span>
                            <p><span class="content-center">术间：{{patientPerformSur.room}}</span><span>台次：{{patientPerformSur.sequence}}</span></p>
                        </div>
                        <div class="content-between">
                            <span>实施手术：{{patientPerformSur.operationName}}</span>
                            <span>手术等级：{{patientPerformSur.operationScale}}</span>
                        </div>
                        <div class="content-between">
                            <span>麻醉方式：{{patientPerformSur.anesthesiaMethod}}</span>
                            <span>术后诊断：{{patientPerformSur.diagAfterOperation}}</span>
                        </div>
                        <div>
                            <span class="content-left2">手术：{{patientPerformSur.surgeon2|filterArr}}</span>
                            <p><span>麻醉：{{patientPerformSur.anesthesiaDoctor2|filterArr}}</span></p>
                        </div>
                        <div>
                            <span class="content-left2">器械：{{patientPerformSur.supplyNurse2|filterArr}}</span>
                            <p><span>巡回：{{patientPerformSur.operationNurs2|filterArr}}</span></p>
                        </div>
                    </div>
                </div>
            </el-main>
        </el-container>
    </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="mini" @click="handleClear">取 消</el-button>
            <el-button size="mini" type="primary" @click="submitBtn">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
import Management from "@/benchs/sanesthesia/api/saManagement";
import SaCockpit from '@/benchs/sanesthesia/api/SaCockpit.js';
import moment from "moment"
export default {
    name:"saUserInfo",
    props:{
        userInfoDialog:{
            type:Object,
            default:{
                visible:false,
                title:"患者切换"
            }
        },
        selectDateTime:{
            type:String,
            default:""
        },
        defaultRoomCode:{
            type:String,
            default:""
        },
    },
    filters:{
        filterType(val){
            if (val == 0) {
                return '择期';
            } else if(val == 1) {
                return '急诊';
            }
        },
        filterArr(arr){
			if(!arr) return "";
			let text = "";
			if(arr.length>0){
				arr.forEach((item,index)=>{
					if(item){
						text = text + "、" + item;
					}
				})
			}
			text = text.replace("、", "");
      		return text;
		},
        filterTime(val){
            return moment(val).format("YYYY-MM-DD HH:mm")
        }
    },
    data(){
        return{
            operRoomList:[],//术间列表
            opDatas:[],  //手术列表
            filterForm:{
                Ip: "",
                EmergencyIndicator: false, //急诊
                IsolationIndicator: false, //放射
                Infect: false, //感染
                IsPacu: false, //复苏
                Type: false, //无申请单
                Status: -1, //手术状态: -1-其他，0-术前，1-术中，2-术后
                RoomCode: "", //手术术间
                IsOpePacu: true,
                ScheduledDateTime: moment().format(), //计划手术日期
                NameOrInpNo: "", //患者
                UserId: false, //我的
            },
            selected:null,
            patientEssential:{},
            patientPlannedSur:{},
            patientPerformSur:{},
            userInfo:{},
        }
    },
    watch:{
        selectDateTime(newVal,oldVal){
            this.filterForm.ScheduledDateTime = moment(newVal).format("YYYY-MM-DD");
        },
        defaultRoomCode(newVal,oldVal){
            this.filterForm.RoomCode = newVal;
        }
    },
    mounted(){
    },
    methods:{
        /* 获取全部术间数据 */
        GetAllOpRoom() {
        let type = "OperationRoom"; //this.filterForm.IsPacu ? "PacuBed" : "OperationRoom"; //位置类型：OperationRoom:手术房间,PacuBed:复苏床位
        let query = "";
        let localarea = "";
        Management.SelectOperationRoomAreaList(query, type, localarea)
            .then(({ code, data, msg }) => {
            this.operRoomList = [];
            if (code === 200) {
                this.operRoomList = data || [];
            } else {
                console.error("未能获取到当前术间信息。");
            }
            })
            .catch((res) => {
            console.error(res, "获取术间字典");
            });
        },
        /* 获取患者卡片列表 */
        GetOperationRecord() {
            Management.SelectOperationRecord(this.filterForm).then(({ code, data, msg }) => {
                this.opDatas = [];
                this.selected = null;
                if (code === 200) {
                //&&
                    this.opDatas = data || [];
                    this.opDatas.map(item=>{
                        if(item.procStatusId==0){
                            item.procStatusColor = "#FF0000"
                        }else if(item.procStatusId==-10){
                            item.procStatusColor = "#DCDDDD"
                        }else{
                            item.procStatusColor = "#0187CE"
                        }
                    })
                } else {
                    if (code === 500) {
                        this.$message.error(msg);
                    }
                }
            }).catch((res) => {
                this.$message.error(res.msg);
            });
        },
        // 
        submitBtn(){
            if(this.selected!=null){
                this.userInfoDialog.visible = false
                console.log(this.userInfo);
                if (this.userInfo.procStatus == "已取消") {
                    this.$message.info("手术已取消");
                }else{
                    localStorage.setItem("patientInfo", JSON.stringify(this.userInfo));
                    let JumpInfo = {
                        Pacu: this.filterForm.IsPacu,
                        templateCode: null,
                        ProcStatus: this.userInfo.procStatusId,
                    };
                    localStorage.setItem("documentJumpInfo", JSON.stringify(JumpInfo));
                    let Pacu = this.$route.name == "Pacu";
                    // window.location.href = `/sanesthesia.html#/saManagement/saReport?Pacu=` + Pacu;
                    this.$router.go();
                }
            }else{
                return this.$message.warning("请先选中一名患者")
            }
        },
        // 双击切换病人
        switchPatient(item,index){
            let userInfo = item
            if (userInfo.procStatus == "已取消") {
                this.$message.info("手术已取消");
            }else{
                localStorage.setItem("patientInfo", JSON.stringify(userInfo));
                let JumpInfo = {
                    Pacu: this.filterForm.IsPacu,
                    templateCode: null,
                    ProcStatus: userInfo.procStatusId,
                };
                localStorage.setItem("documentJumpInfo", JSON.stringify(JumpInfo));
                let Pacu = this.$route.name == "Pacu";
                // window.location.href = `/sanesthesia.html#/saManagement/saReport?Pacu=` + Pacu;
                this.$router.go();
            }
        },
        handleClose(){
            this.userInfoDialog.visible = false
        },
        timeNow(){
            this.filterForm.ScheduledDateTime = new Date();
            this.GetOperationRecord();
        },
        submitdrop(type){
            this.$refs.messageDrop.hide();
            if(type==='submit'){
                this.GetOperationRecord();
            }
        },
        handleClear(){
            this.filterForm.EmergencyIndicator=false;
            this.filterForm.Status=-1;
            this.userInfoDialog.visible = false;
        },
        getPatientDetails(operId){
            SaCockpit.patientIdInforma({Operid:operId}).then(res=>{
                this.patientEssential = {}
                this.patientPlannedSur = {}
                this.patientPerformSur = {}
                if (res.code === 200) {
                let resDia = res.data;
                this.patientEssential = resDia.essential || {}
                this.patientPlannedSur = resDia.plannedSur || {}
                this.patientPerformSur = resDia.performSur || {}
                }
            })
        },
        // 选中病人
        choosePatient(item,index){
            this.selected = index;
            this.userInfo = item;
            this.getPatientDetails(item.operId)
        },
    }
}
</script>

<style lang="scss" scoped>
    .userInfo{
        ::-webkit-scrollbar{
            width:2px;
        }
        box-sizing: border-box;
        width:100%;
        .el-container{
            height:450px;
            .el-aside{
                height:500px;
                overflow-X: hidden;
                // position:relative;
                .filter-info{
                    position: sticky;
                    background-color: #fff;
                    top:0;
                    .filter-infoT{
                        height:40px;
                        display: flex;
                        align-items: center;
                        span{
                            cursor: pointer;
                            color:#00C8AD;
                            margin-left:5px;
                            font-size:22px;
                        }
                        .btns{
                            .el-button.el-button--primary.el-button--mini{
                                width:20px;
                            }
                        }
                    }
                    .filter-infoB{
                        height:40px;
                        .filter-room{
                            display: flex;
                            align-items: center;
                            .el-select{
                                width:60%;
                            }
                        }
                        .filter-name{
                            display: flex;
                            align-items: center;
                        }
                    }
                }
                .patientList{
                    .patientCard{
                        height:100px;
                        margin-bottom:3px;
                        width:390px;
                        border:1px solid #F2F2F2;
                        border-radius:5px ;
                        cursor: pointer;
                        .card-left{
                            float:left;
                            text-align: center;
                            font-size: 16px;
                            font-weight: bold;
                            line-height: 100px;
                            color:#000;
                            height:100px;
                            width:70px;
                            background: #F2F2F2;
                        }
                        .card-right{
                            box-sizing: border-box;
                            float:left;
                            height:100px;
                            width:320px;
                            padding-left:2px;
                            p{  
                                line-height:20px;
                                font-size:12px;
                                span{
                                    display: inline-block;
                                    font-size:12px;
                                }
                            }
                            p:nth-of-type(1){
                                width:318px;
                                span:nth-of-type(1){
                                    font-size:14px;
                                    color:#000;
                                    font-weight:bold;
                                    margin-right:80px;
                                }
                                span:nth-of-type(3){
                                    width:70px;
                                    height:22px;
                                    line-height:22px;
                                    border-radius: 0 5px 0 5px;
                                    text-align: center;
                                    background:grey;
                                    color:#fff;
                                    float: right;
                                }
                            }
                            P:nth-of-type(2){
                                width:300px;
                                display: flex;
                                justify-content: space-between;
                            }
                            P:nth-of-type(3){
                                overflow:hidden;
                                white-space:nowrap;
                                text-overflow:ellipsis;
                            }
                            P:nth-of-type(5){
                                display: flex;
                                span{
                                    overflow:hidden;
                                    white-space:nowrap;
                                    text-overflow:ellipsis;
                                }
                                span:nth-of-type(2){
                                    margin-left:20px;
                                }
                            }
                        }
                        &.selected{
                            background-color: #1bad96;
                            color:#fff;
                            border-radius: 5px;
                            .card-left{
                                background-color: #1bad96;
                                color:#fff;
                                box-sizing: border-box;
                                border-radius: 5px;
                                box-shadow:1px 0 1px #AFB0B0;
                            }
                            .card-right{
                                p:nth-of-type(1){
                                    span:nth-of-type(1){
                                        color:#fff;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .el-main{
                padding:0 10px;
                width:580px;
                box-sizing: border-box;
                height:500px;
                h3{
                    line-height:0;
                }
                .content-head{
                    padding-left:5px;
                    height:20px;
                    margin:10px 0;
                    background-color: #F2F2F2;
                }
                .content-main{
                    div{
                        width:100%;
                        font-size:12px;
                        display: flex;
                        line-height:18px;
                        span{
                            display: inline-block;
                            overflow:hidden;
                            white-space:nowrap;
                            text-overflow:ellipsis;
                        }
                        // p{
                        //     width:70%;
                        //     display:flex;
                        //     justify-content: space-around;
                        // }
                    }
                    .content-between{
                        box-sizing: border-box;
                        width:100%;
                        display:flex ;
                        justify-content: space-between;
                        padding-right:50px;
                    }
                    .content-left{
                        width: 140px;
                    }
                    .content-left1{
                        width: 340px;
                    }
                    .content-left2{
                        width: 180px;
                    }
                    .content-center{
                        width: 200px;
                    }
                }
            }
        }
    }
</style>
<style lang="scss" scoped>
    ::v-deep .dropdownBox.el-radio-group{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding:6px;
        // margin-bottom:5px;
    }
    ::v-deep .dropdownBox.el-radio-group:nth-of-type(1),.dropdownBox.el-radio-group:nth-of-type(2){
        margin:0;
        padding:0 6px;
        // padding:2px;
    }
    ::v-deep .dropdownBox.el-radio-group:nth-of-type(1){
        margin-bottom: 3px;
    }
    .btns::v-deep .el-button.el-button--mini{
        float: right;
        margin:8px;
        padding: 2px;
        font-size:14px;
    }
    
</style>