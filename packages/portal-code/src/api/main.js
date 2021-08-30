/**
 * 护理诊断辅助支持配置相关接口
 */
import request from "@/utils/request";

let main = {};

// 根据条件查询观察项目决策
main.selectNursingDecision = function(params) {
    var req = {
        applicant: "ICIS",
        conditions: params
    }
    return request({
        method: "POST",
        url: `/api/decision/make`,
        data: req
    })
}

// 根据条件查询评分决策
main.selectAssessmentDecision = function(params) {
    return request({
        method: "GET",
        url: `/api/decision/assessment/decision`,
        params
    })
}

export default main;