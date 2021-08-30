/*  公共接口 */

import request from "@/utils/request";

const commenApi = {}


// 获取字典
commenApi.getDicyionaries = function (params) {
    return request({
        method: 'GET',
        url: '/api/EmrService/DictionaryCommon/GetDictionariesCommon',
        params
    })
}
// 
commenApi.patientGreenRoad = function (data) {
    return request({
        method: 'PUT',
        url: '/api/TriageService/patientInfo/patientGreenRoad',
        data:{...data,intercept:true}
    })
}
commenApi.getPagedUsers = function(params) {//获取用户列表
    return request({
        method: 'GET',
        url: '/api/identity/users/nurses',
        params
    });
}
export default commenApi