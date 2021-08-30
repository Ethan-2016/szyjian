/*
 * @Author: your name
 * @Date: 2020-12-17 09:03:27
 * @LastEditTime: 2021-01-07 16:50:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \work\ICIS\src\store\modules\workbench.js
 */
/**
 * @author 苏适
 * @date 2020-11-25
 * @description 工作台公共数据状态管理
 */

let workbench = {
  state: {
    activePatient: {}, // 工作台当前选择的病人基础信息
    deptInfo: {}, // 工作台当前的科室信息
    sysParaValueInfo: {}, //获取全局参数
    nowUserTime: {} //当前病人时间状态
  },

  getters: {
    // activePatient(state, getter) {
    //   return state.activePatient;
    // },
    deptInfo(state, getter) {
      return state.deptInfo;
    }
  },

  mutations: {
    ["workbench/patient"]: (state, data) => {
      state.activePatient = data;
      localStorage.setItem("activePatientCard", JSON.stringify(data));
    },
    ["workbench/nowTime"]: (state, data) => {
      state.nowUserTime = data;
      localStorage.setItem("nowTime", JSON.stringify(data));
    },
    ["workbench/deptInfo"]: (state, data) => {
      state.deptInfo = data;
      localStorage.setItem("deptInfo", JSON.stringify(data));
    },
    ["workbench/sysParaValueInfo"]: (state, data) => {
      state.sysParaValueInfo = data;
      localStorage.setItem("sysParaValueInfo", JSON.stringify(data));
    }
  },

  actions: {}
};

export default workbench;
