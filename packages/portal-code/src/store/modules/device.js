// import TRTC from "trtc-js-sdk";

let devices = {
  state: {
    hasCameraConnect: false,
    hasVoiceConnect: false,
    hasMicConnect: false,
    hasNetworkConnect: !!navigator.onLine,
    microPhones: [],
    cameras: [],
  },

  mutations: {
    ['device/microphones'](state, value) {
      state.microPhones = value;
    },
    ['device/cameras'](state, value) {
      state.cameras = value;
    },
    ['device/camera/connected'](state) {
      state.hasCameraConnect = true;
    },
    ['device/mic/connected'](state) {
      state.hasMicConnect = true;
    },
    ['device/voice/connected'](state) {
      state.hasVoiceConnect = true;
    },
  },

  actions: {
    ['device/info']({ commit }) {
      // TRTC.getMicrophones().then(resp => {
      //   commit('device/microphones', resp);
      //   resp.forEach(mic => {
      //     if (mic.label.length > 0) {
      //       commit('device/mic/connected');
      //     }
      //   });
      // });
      // TRTC.getCameras().then(resp => {
      //   commit('device/cameras', resp);
      //   resp.forEach(camera => {
      //     if (camera.label.length > 0) {
      //       commit('device/camera/connected');
      //     }
      //   });
      // });
      // TRTC.getSpeakers().then(resp => {
      //   resp.forEach(voice => {
      //     if (voice.label.length > 0) {
      //       commit('device/voice/connected');
      //     }
      //   });
      // });
    },
  },
};

export default devices;
