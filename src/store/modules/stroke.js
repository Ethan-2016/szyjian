let stroke = {
  state: {
    diseaseList: {},
  },
  getters: {
    diseaseList(state, getter) {
      return state.diseaseList;
    },
  },
  mutations: {
    ['stroke/diseaseList'](state, value) {
      state.diseaseList = value
    }
  },
  actions: {
  }
}

export default stroke;