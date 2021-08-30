import Meeting from '@/api/meeting';

let meeting = {
    state: {
        ultrasound_set_pos: {
            left: 0,
            top: 0,
        },
        ultrasound_set: [
            {
                name: 'Frq',
                value: '3.50'
            },
            {
                name: 'HI',
                value: '1'
            },
            {
                name: 'Gain',
                value: '100'
            },
            {
                name: 'Depth',
                value: '15.6'
            },
            {
                name: 'AO',
                value: '2'
            },
            {
                name: 'FRS',
                value: '18'
            }
        ],
        room_information: {},
        consultation: {}
    },

    mutations: {
        ['meeting/clear'](state, value) {
            state.room_information = {};
            state.consultation = {};
        },
        ['meeting/ultrasoundset/pos'](state, value) {
            state.ultrasound_set_pos = value;
        },
        ['meeting/room/information'](state, value) {
            state.room_information = value;
        },
        ['meeting/information/consultation'](state, value) {
            state.consultation = value;
        }
    },

    actions: {
        ['meeting/join/room']({ commit }, payload) {
            return new Promise((resolve, reject) => {
                Meeting.joinRoom(payload.userName, payload.number, payload.secret).then(resp => {
                    resp.userName = payload.userName;
                    commit('meeting/room/information', resp);
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                })
            })
        },
        ['meeting/clear']({ commit }) {
            commit('meeting/clear');
        },
        ['meeting/information/consultation']({ commit }, payload) {
            return new Promise((resolve, reject) => {
                Meeting.getConsultationInformation(payload).then(resp => {
                    commit('meeting/information/consultation', resp);
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                })
            });
        },
        ['meeting/report/save']({ coomit }, report) {
            return new Promise((resolve, reject) => {
                Meeting.saveReport(report).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                })
            })
        }
    }
}

export default meeting;