/*
 * @Autor: Linbaochang
 * @Date: 2020-12-24 18:46:57
 * @LastEditors: Linbaochang
 * @LastEditTime: 2020-12-24 18:53:30
 */
let patientCanula = {
  state: {
    canulaList: [],
  },
  mutations: {
    ["patientCanula/canulaList"](state, value) {
      state.canulaList = value;
    },
  },
};

export default patientCanula;
