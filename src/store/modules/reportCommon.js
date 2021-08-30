/*
 * @Autor: Linbaochang
 * @Date: 2021-01-13 16:56:35
 * @LastEditors: Linbaochang
 * @LastEditTime: 2021-03-01 17:31:29
 */
/**
 * @author 文鹏
 * @date 2021-01-12
 * @description 麻醉记录单公共数据
 */

import CommonData from '@/api/reportCommon';

let reportCommon = {
    state: {
        use: [], // 用药途径
        concentration: [], // 浓度单位
        dosage: [], // 剂量单位
        speed: [], // 流速单位
        nursingDate: null, // 护理平台的选中日期
        monitoringInfo: null,
        activeAnesBreathChart: null,
        reportLeftData: null,//麻醉单左侧表格数据
        reportFourthFloorData: null,//麻醉单底部表格数据
        isShowTimeBox: true,//麻醉记录单时间小弹框是否显示
    },


    getters: {
        useWay(state, getter) {
            return state.use;
        },
        concentration(state, getter) {
            return state.concentration;
        },
        dosage(state, getter) {
            return state.dosage;
        },
        speed(state, getter) {
            return state.speed;
        },
        nursingDate(state, getter) {
            return state.nursingDate;
        },
        monitoringInfo(state, getter) {
            return state.monitoringInfo;
        },
        activeAnesBreathChart(state, getter) {
            return state.activeAnesBreathChart;
        },
        reportLeftData(state, getter) {
            return state.reportLeftData;
        },
        reportFourthFloorData(state, getter) {
            return state.reportFourthFloorData;
        },
    },

    mutations: {
        ['reportCommon/use']: (state, data) => {
            state.use = data || [];
        },
        ['reportCommon/concentration']: (state, data) => {
            state.concentration = data || [];
        },
        ['reportCommon/dosage']: (state, data) => {
            state.dosage = data || [];
        },
        ['reportCommon/speed']: (state, data) => {
            state.speed = data || [];
        },
        ['reportCommon/nursingDate']: (state, data) => {
            state.nursingDate = data && !/\Invalid/.test(data) ? data : null;
        },
        ['reportCommon/monitoringInfo']: (state, data) => {
            state.monitoringInfo = data;
        },
        ['reportCommon/activeAnesBreathChart']: (state, data) => {
            state.activeAnesBreathChart = data;
        },
        ['reportCommon/reportLeftData']: (state, data) => {
            state.reportLeftData = data;
        },
        ['reportCommon/reportFourthFloorData']: (state, data) => {
            state.reportFourthFloorData = data;
        },
        setShowTimeBox(state,data) {
            state.isShowTimeBox = data;
        },
    },

    actions: {
        // 根据条件获取药品途径
        ['reportCommon/useWay']({ commit }) {
            return new Promise((resolve, reject) => {
                CommonData.SelectDrugRouteDicInfo().then(resp => {
                    commit('reportCommon/use', resp.data);
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        // 查询药品单位(编码，浓度)
        ['reportCommon/concentrationUnits']({ commit }) {
            return new Promise((resolve, reject) => {
                CommonData.SelectDrugUnitDicList('浓度').then(resp => {
                    commit('reportCommon/concentration', resp.data);
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        // 查询药品单位(编码，剂量)
        ['reportCommon/dosageUnits']({ commit }) {
            return new Promise((resolve, reject) => {
                CommonData.SelectDrugUnitDicList('剂量').then(resp => {
                    commit('reportCommon/dosage', resp.data);
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        // 查询药品单位(编码，速度)
        ['reportCommon/speedUnits']({ commit }) {
            return new Promise((resolve, reject) => {
                CommonData.SelectDrugUnitDicList('速度').then(resp => {
                    commit('reportCommon/speed', resp.data);
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        }
    }
};

export default reportCommon;