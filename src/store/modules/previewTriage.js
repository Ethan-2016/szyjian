/**
 * @author 吴应
 * @date 2021-1-26 20:43:15
 * @description 院前急救
 */
import {
    Message
} from "element-ui";
// import triageApi from "@/benchs/previewTriage/api/triageApi";
let previewTriage = {
    state: {
        temporaryTotal: 0, //分诊暂存总人数
        showDrawerModel: '', //控制显示内容
    },
    getters: {
        temporaryTotal(state) {
            return state.temporaryTotal;
        },
        showDrawerModel(state) {
            return state.showDrawerModel;
        }
    },

    mutations: {
        //提交当前患者信息
        ['previewTriage/temporaryTotal']: (state, data) => {
            state.temporaryTotal = data;
        },
        ['previewTriage/showDrawerModel']: (state, data) => {
            // console.log(data);
            state.showDrawerModel = data;
        },
    },
    actions: {
        ['previewTriage/temporaryTotal']: ({commit}) => {
            triageApi
                .patientInfoList({
                    SkipCount: 1,
                    MaxResultCount: 1,
                    TriageStatus: 0
                })
                .then((res) => {
                    if (res.code == 200) {
                        commit('previewTriage/temporaryTotal', res.data.totalCount);
                    } else {
                        Message.error("查询暂存列表数据失败原因：" + res.msg);
                    }
                })
                .catch((err) => {
                    console.error("查询暂存列表数据失败原因：" + err);
                });
        },
    }
};

export default previewTriage;