/**
 * 日间手术状态管理
 */
import ASC from '@/api/asc.js';

let asc = {
  state: {
    // 诊断准入数据
    diagnosis_paging: {
      pageIndex: 1,
      pageSize: 10,
      count: 0,
      items: []
    },
    // 术式准入数据
    surgery_paging: {
      pageIndex: 1,
      pageSize: 10,
      count: 0,
      items: []
    },
    // 医生准入数据
    doctor_paging: {
      pageIndex: 1,
      pageSize: 10,
      count: 0,
      items: []
    }
  },

  mutations: {
    ['asc/diagnosis/paging'](state, value) {
      state.diagnosis_paging.pageIndex = value.pageIndex;
      state.diagnosis_paging.pageSize = value.pageSize;
      state.diagnosis_paging.count = value.totalCount;
      state.diagnosis_paging.items = value.items;
    },
    ['asc/surgery/paging'](state, value) {
      state.surgery_paging.pageIndex = value.pageIndex;
      state.surgery_paging.pageSize = value.pageSize,
      state.surgery_paging.count = value.totalCount;
      state.surgery_paging.items = value.items;
    },
    ['asc/doctor/paging'](state, value) {
      state.doctor_paging.pageIndex = value.pageIndex;
      state.doctor_paging.pageSize = value.pageSize;
      state.doctor_paging.count = value.totalCount;
      state.doctor_paging.items = value.items;
    }
  },

  actions: {
    ['asc/diagnosis/paging']({ commit }, payload) {
      return new Promise((resolve, reject) => {
        ASC.getPagedDiagnosis(payload.pageIndex, payload.pageSize, payload.sorting ?? '').then(resp => {
          commit('asc/diagnosis/paging', {pageIndex: payload.pageIndex, pageSize: payload.pageSize, items: resp.items, totalCount: resp.totalCount});
          resolve();
        }).catch(err => {
          reject(err);
        })
      });
    },
    ['asc/diagnosis/update'] (_, payload) {
      return new Promise((resolve, reject) => {
        ASC.updateDiagnosis(payload).then(resp => {
          console.info(resp);
          resolve();
        }).catch(err => {
          reject(err);
        })
      })
    },

    ['asc/surgery/paging']({ commit }, payload) {
      return new Promise((resolve, reject) => {
        ASC.getPagedSurgery(payload.pageIndex, payload.pageSize, payload.sorting ?? '').then(resp => {
          commit('asc/surgery/paging', {pageIndex: payload.pageIndex, pageSize: payload.pageSize, count: resp.totalCount, items: resp.items});
          resolve();
        }).catch(err => {
          reject(err);
        })
      })
    },
    ['asc/surgery/update'](_, payload) {
      return new Promise((resolve, reject) => {
        ASC.updateSurgery(payload).then(resp => {
          console.debug(resp);
          resolve();
        }).catch(err => {
          reject(err);
        })
      });
    },

    ['asc/doctor/paging']({ commit }, payload) {
      return new Promise((resolve, reject) => {
        ASC.getPagedDoctor(payload.pageIndex, payload.pageSize, payload.sorting).then(resp => {
          commit('asc/doctor/paging', {pageIndex: payload.pageIndex, pageSize: payload.pageSize, count: resp.totalCount, items: resp.items});
          resolve();
        }).catch(err => {
          reject(err);
        })
      })
    },
    ['asc/doctor/update'](_, payload) {
      return new Promise((resolve, reject) => {
        ASC.updateDoctor(payload).then(resp => {
          console.debug(resp);
          resolve();
        }).catch(err => {
          reject(err);
        })
      })
    }
  }
};

export default asc;