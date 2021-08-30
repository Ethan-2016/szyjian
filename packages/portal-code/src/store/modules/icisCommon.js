/*
 * @Autor: Linbaochang
 * @Date: 2021-05-21 17:41:37
 * @LastEditors: Linbaochang
 * @LastEditTime: 2021-05-21 18:09:13
 */
// 重症全局参数

let icisCommon = {
  state: {
    deptScheduleInfo: {},
  },
  mutations: {
    ['icisCommon/deptScheduleInfo'](state, value) {
      state.deptScheduleInfo = value;
    },
  },
};

export default icisCommon;
