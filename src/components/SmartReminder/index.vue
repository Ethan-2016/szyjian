<template>
   <div class="smart-reminder-components">
       <div 
       class="smart-reminder-wrap" 
       ref="smartReminderWrap" 
       v-show="reminderVisibleShow">
            <div class="top-wrap">
                <!-- <img src="@/benchs/icis/assets/img/icons/尚哲智能提醒.png" alt="尚哲智能提醒"> -->
                <div class="top-title">
                    <span>尚哲智能提醒</span>
                    <i class="el-icon-error" @click="clickClose"></i>
                </div>
                <el-input 
                v-model="input" 
                class="search-input"
                disabled></el-input>
                <i class="iconfont fangdajing"></i>
            </div>
            <div class="content-wrap">
                    <div class="item-wrap" v-for="(item,index) in decisionCardData" :key="index">
                        <div class="content-bg">
                            <div class="wrap-show" v-show="item.diagnosis.name">
                                <div class="title-wrap">
                                    <div class="title-name">
                                        <div class="shu-tiao"></div>
                                        <span>护理问题</span>
                                    </div>
                                </div>
                                <div class="problem-wrap content-base">
                                    <span>{{item.diagnosis.name}}</span>
                                </div>
                            </div>

                            <div class="title-wrap" v-show="item.measures.length">
                                <div class="title-name">
                                    <div class="shu-tiao"></div>
                                    <span>推荐措施</span>
                                </div>
                                <el-button @click="handleSaveMeasures(item)">保存措施</el-button>
                            </div>

                            <div class="checkbox-item-wrap" v-show="item.measures.length">
                                <div class="checkbox-item-title">
                                    <span>措施</span>
                                </div>
                                <el-form class="checkbox-item-content content-base">
                                    <el-form-item  v-for="(measures,mindex) in item.measures" :key="mindex">
                                        <el-checkbox :label="measures.content" v-model="measures.enContent"></el-checkbox>
                                    </el-form-item>
                                </el-form>
                            </div>

                            <div class="checkbox-item-wrap" v-show="item.objectives.length">
                                <div class="checkbox-item-title">
                                    <span>目标</span>
                                </div>
                                <el-form class="checkbox-item-content content-base">
                                    <el-form-item v-for="(objectives,oindex) in item.objectives" :key="oindex">
                                        <el-checkbox :label="objectives.content" v-model="objectives.enContent"></el-checkbox>
                                    </el-form-item>
                                </el-form>
                            </div>
                            
                            <div class="wrap-show" v-show="item.recommends.length">
                                <div class="title-wrap">
                                    <div class="title-name">
                                        <span>推荐评估</span>
                                    </div>
                                </div>
                                <div class="assess-wrap content-base" v-for="(recommends,rindex) in item.recommends" :key="rindex">
                                    <div @click="clickAssessDetail(recommends.assessmentSheetName)">{{recommends.assessmentSheetName}}</div>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
       </div>
       <scoreCard :scoreVisible.sync="scoreVisibleShow" :scoreData="scoreData" :scoreCardTitle="scoreCardTitle" @clickAssessSave="handleAssessSave" />
   </div>
</template>

<script>
import scoreCard from '@/benchs/icis/views/icisWardOverview/components/scoreCard'
import IcuPatientScore from '@/benchs/icis/api/icuPatientScore'
import IcuNursingMeasure from '@/benchs/icis/api/icuNursingMeasure'
import moment from 'moment'

export default {
    name: "smartReminder",
    props: {
        topbarVisible: {
            type: Boolean,
            default: false
        },
        displayMenu: {
            type: Boolean,
            default: false
        },
        reminderVisible: {
            type: Boolean,
            default: false
        },
        decisionData: {
            type: Array,
            default: ()=>[]
        },
    },
    data() {
        return {
            input: '',
            checkList: [],
            unFold: false,
            scoreVisibleShow: false,
            scoreCardTitle: '',
            reminderVisibleShow: false,
            decisionCardData:[],
            scoreData: {}
        }
    },
    components: {
        scoreCard
    },
    watch: {
        topbarVisible(v) {
            if(v) {
                this.$refs.smartReminderWrap.style.top = "227px";
                this.$refs.smartReminderWrap.style.height = "calc(100vh - 262px)";
            } else {
                this.$refs.smartReminderWrap.style.top = "90px";
                this.$refs.smartReminderWrap.style.height = "calc(100vh - 125px)";
            }
        },
        displayMenu(v) {
            if(v) {
                this.$refs.smartReminderWrap.style.top = "128px";
                this.$refs.smartReminderWrap.style.height = "calc(100vh - 163px)";
            } else {
                this.$refs.smartReminderWrap.style.top = "90px";
                this.$refs.smartReminderWrap.style.height = "calc(100vh - 125px)";
            }
        },
        reminderVisible(v) {
            this.reminderVisibleShow = v;
        },
        decisionData(v) {
            if(v.length) {
                // 医嘱执行触发时弹窗靠左
                if(this.$route.path == '/icisNursingPlatform/icisOrderFiller') {
                    this.$refs.smartReminderWrap.style.left = 0;
                    this.$refs.smartReminderWrap.style.right = "";
                } else {
                    this.$refs.smartReminderWrap.style.right = 0;
                    this.$refs.smartReminderWrap.style.left = "";
                }
                this.decisionCardData = v;
            }
        }
    },
    methods: {
        clickAssessDetail(recommends) {
            this.scoreVisibleShow = true;
            this.scoreCardTitle = recommends;
            this.selectScoreStandardExcute();
        },
        selectScoreStandardExcute() {
          IcuPatientScore.selectScoreStandardExcuteByName({
            name: this.scoreCardTitle,
            deptCode: JSON.parse(localStorage.getItem("activePatientCard")).deptCode
          }).then(res => {
              if(res.code === 200) {
                this.scoreData= res.data;
              } else {
                this.$message.error(res.msg);
              }
            })
        },
        handleSaveMeasures(item) {
            let newArr = [...item.measures,...item.objectives];
            let flag = newArr.some(e => e.enContent);
            if(!flag) {
                this.$message.error('请勾选推荐措施内容');
                return;
            }
            this.addIcuNursingMeasureList(item,newArr);
        },
        addIcuNursingMeasureList(item,newArr) {
            let nursingContext = '';
            let i = 0;
            let {app} = JSON.parse(localStorage.getItem('vuex'));
            if(newArr.length) {
                newArr.forEach(child => {
                    if(child.enContent) {
                        i++;
                        nursingContext += i+'.'+child.content;
                    }
                })
            }
            IcuNursingMeasure.addIcuNursingMeasureList({
                inhosnum: JSON.parse(localStorage.getItem('activePatientCard')).inHosNum,
                nursingProblem: item.diagnosis.name,
                nursingContext,
                nurseCode: app.userInfo.userName,
                nurseName: app.userInfo.surname+app.userInfo.name,
                nurseTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            }).then(res => {
                if(res.code === 200) {
                    this.$message.success('保存成功');
                } else {
                    this.$message.error(res.msg);
                }
            })
        },
        handleAssessSave() {
            let params = this.filterScoreParams(this.scoreData);
            IcuPatientScore.changeScoreStandardExcute(params,'new').then(res => {
                if(res.code === 200) {
                    this.$message.success('保存成功');
                    this.scoreVisibleShow = false;
                } else {
                    this.$message.error(res.msg);
                }
            })
        },
        filterScoreParams(obj) {
            let data = JSON.parse(JSON.stringify(obj));
            let {app} = JSON.parse(localStorage.getItem('vuex'));
            let icuPatientScoreDetailDtos = [];
            let totalScore = 0;
            data.scoreStandardDetailDtos.map(item => {
                icuPatientScoreDetailDtos.push({
                scoreName: item.name,
                scoreDetailName: item.childName,
                score: item.score,
                pid: item.pid
                })
            })
            data.scoreStandardDetailDtos.forEach(item => {
                return totalScore += Number(item.score);
            })
            let params = {
                scoreName: data.name,
                inhosnum: JSON.parse(localStorage.getItem('activePatientCard')).inHosNum,
                totalScore,
                scoreTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                creator: app.userInfo.surname+app.userInfo.name,
                icuPatientScoreDetailDtos
            }
            return params;
        },
        clickClose() {
            this.$emit('update:reminderVisible',false);
        },
    }
}
</script>
<style lang='scss'>
.smart-reminder-components {
    .smart-reminder-wrap {
        position: absolute;
        top: 90px;
        right: 0;
        width: 399px;
        height: calc(100vh - 125px);
        max-height: calc(100vh - 125px);
        background: #FAFAFA;
        z-index: 999;
        overflow: auto;
        border-radius: 10px 0 0 10px;
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.5); 
        .top-wrap {
            position: relative;
            margin-bottom: 27px;
            padding: 24px 24px 16px 25px;
            background: linear-gradient(#eb8f19 0%, #f2b23b 49%, #f9d85f 100%);
            img {
                position: absolute;
                top: 11px;
                left: 18px;
                width: 58px;
                height: 46px;
            }
            .top-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-left: 65px;
                font-size: 18px;
                font-family: Microsoft YaHei Regular, Microsoft YaHei Regular-Regular;
                font-weight: bold;
                color: #fff;
                i {
                    font-size: 24px;
                    color: #ccc;
                    cursor: pointer;
                }
            }
            .search-input {
                margin-top: 20px;
                input {
                    width: 350px;
                }
            }
            i.fangdajing {
                position: absolute;
                top: 78px;
                right: 28px;
                color: #ccc;
                cursor: pointer;
            }
        }
        .content-wrap {
            font-size: 14px;
            color: #333;
            font-family: Microsoft YaHei Regular, Microsoft YaHei Regular-Regular;
            margin-bottom: 12px;
            padding: 0 24px 0 25px;
            .title-wrap {
                display: flex;
                justify-content: space-between;
                margin-bottom: 14px;
                .title-name {
                    display: flex;
                    align-items: center;
                    font-weight: bold;
                    .shu-tiao {
                        width: 5px;
                        height: 14px;
                        background: #1BAD96;
                        margin-right: 6px;
                    }
                }
                .el-button {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 80px;
                    height: 35px;
                    background: #1BAD96;
                    color: #fff;
                    border-radius: 5px;
                }
            }
            .item-wrap {
                .content-bg {
                    .content-base {
                        padding: 18px 16px;
                        border: 1px solid #e4e7ed;
                        border-radius: 5px;
                        background: #fff;
                        margin-bottom: 10px;
                    }
                    .problem-wrap {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .checkbox-item-wrap {
                        .checkbox-item-title {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            height: 40px;
                            padding: 0 12px;
                            border: 1px solid #e4e7ed;
                            border-radius: 5px 5px 0 0;
                            background: #e4e7ed;
                            font-weight: bold;
                            .jiantou-wrap {
                                cursor: pointer;
                            }
                        }
                        .checkbox-item-content {
                            padding: 18px 15px 0 10px;
                            .el-checkbox {
                                display: flex;
                                flex-wrap: wrap;
                                margin: 0 0 10px 0;
                                font-size: 14px;
                                color: #333;
                                font-family: Microsoft YaHei Regular, Microsoft YaHei Regular-Regular;
                                span.el-checkbox__input {
                                    width: 14px;
                                    line-height: 23px;
                                }
                                span.el-checkbox__label {
                                    flex: 1;
                                    display: block;
                                    white-space: normal;
                                    margin: 0;
                                }
                            }
                        }
                    }
                    .assess-wrap {
                        color: #1bad96;
                        cursor: pointer;
                    }
                }
            }
        }
        &::-webkit-scrollbar {
            position: absolute;
            bottom: 0;
            display: block;
            overflow: auto;
            height: 5px;
            width: 5px;
        }
        /*定义滑块 内阴影+圆角*/
        &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
            background-color: #bfbfbf;
        }
    }
}
</style>