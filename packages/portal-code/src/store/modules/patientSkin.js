/*
 * @Autor: Linbaochang
 * @Date: 2021-01-12 17:02:00
 * @LastEditors: Linbaochang
 * @LastEditTime: 2021-01-12 17:06:41
 */
let patientSkin = {
  state: {
    skinList: [],
  },
  mutations: {
    ["patientSkin/skinList"](state, value) {
      state.skinList = value;
    },
  },
};

export default patientSkin;
