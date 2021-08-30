/**
 * @author 吴应
 * @date 2021-1-26 20:43:15
 * @description 院前急救
 */
import {
    Message
} from "element-ui";
import connectCar from "@/benchs/preHospital/api/connectCar";
let aid = {
    state: {
        // 车辆当前选择的病人基础信息
        aidActivePatient: {},
        patients: [], //人员列表
        theme: 'light', // 主题
        showModel: '',
    },

    getters: {
        //主题
        theme(state) {
            return state.theme;
        },
        //患者列表
        patients(state) {
            return state.patients;
        },
        //患者列表
        aidActivePatient(state) {
            return state.aidActivePatient;
        },
        showModel(state) {
            return state.showModel;
        }
    },

    mutations: {
        //提交当前患者信息
        ['aid/aidActivePatient']: (state, data) => {
            state.aidActivePatient = data;
            localStorage.setItem('aidActivePatient', JSON.stringify(data));
        },
        //提交当前主题
        ['aid/theme']: (state, data) => {
            state.theme = data;
            localStorage.setItem('theme', data);
        },
        //提交当前患者列表
        ['aid/patients']: (state, data) => {
            state.patients = data;
        }, //提交当前患者列表

        ['aid/showModel']: (state, data) => {
            state.showModel = data;
        },

    },
    actions: {
        //获取患者列表
        ['aid/patients']({
            commit,
            state
        }) {
            return new Promise((resolve, reject) => {
                connectCar.GetEmrPatientInfoByWhere({
                    CarNum: localStorage.getItem("plateNo")
                }).then(res => {
                    if (res.code == 200) {
                        //TODO 需添加失败处理
                        commit('aid/patients', res.data);
                        if (state.aidActivePatient.emrPatientInfoId) {
                            let notHave = true;
                            let drivingData = JSON.parse(sessionStorage.getItem('drivingData'))
                            drivingData = {
                                ...drivingData,
                                ...{
                                    carNum: localStorage.getItem("plateNo")
                                }
                            };
                            //非首次获取病人信息
                            res.data.forEach((item) => { //匹配
                                item.carNum = localStorage.getItem("plateNo");
                                if (item.patientId == sessionStorage.getItem('selectPatient')) {
                                    notHave = false;
                                    sessionStorage.setItem('selectPatient',"0")
                                    item.drivingData = drivingData
                                    commit('aid/aidActivePatient', item); //选中当前患者
                                } else {
                                    // 如果有与当前选中患者一致的信息
                                    if (item.id == state.aidActivePatient.emrPatientInfoId) {
                                        notHave = false;
                                        item.drivingData = drivingData
                                        commit('aid/aidActivePatient', item); //选中当前患者
                                    }
                                }

                            });
                            // 如果没有与当前选中患者一致的信息，默认第一个患者
                            if (notHave) {
                                res.data[0].carNum = localStorage.getItem("plateNo");
                                res.data[0].drivingData = drivingData
                                commit('aid/aidActivePatient', res.data[0]); //选中第一个患者
                            }
                        } else {
                            console.log(res.data[0]);
                            res.data[0].carNum = localStorage.getItem("plateNo");
                            commit('aid/aidActivePatient', res.data[0]); //选中第一个患者
                        }
                        resolve(res);
                    } else {
                        commit('aid/patients', []);
                        commit('aid/aidActivePatient', {
                            age: "",
                            carNum: "",
                            city: "",
                            contacts: "",
                            diagnostic: "",
                            doctor: "",
                            documentNum: "",
                            documentType: "",
                            driver: "",
                            emrPatientInfoId: "",
                            faber: "",
                            isGreenRode: 0,
                            isGroupInjury: 0,
                            isHasRecord: 0,
                            isRegister: 0,
                            isStretcher: "",
                            mileage: "",
                            nation: "",
                            nationality: "",
                            noPersonnel: "",
                            nurse: "",
                            occupation: "",
                            patientId: "",
                            patientName: "",
                            remake: "",
                            sex: "",
                            siteAddress: "",
                            siteType: "",
                            status: "0",
                            stretcher: "",
                            taskInfoId: "",
                            taskType: "",
                            telephone: "",
                            toAddress: "",
                            toAddressSupplement: "",
                            toDepartment: "",
                            triageLevel: "",
                            triagePatientInfoId: ""
                        });
                        Message.info("车辆尚未启动");
                    }
                }).catch(err => {
                    reject(err);
                })
            })
        },
    }
};

export default aid;