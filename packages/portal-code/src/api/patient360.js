/*
* CreateTime:2020/3/25 PM
*患者---检验/检查/医嘱/电子病历
*/


import request from "@/utils/request";

let Patient360 = {};
    //枚举列表
    Patient360.useAllEnum = function(params) {
        //枚举名： 医嘱状态=>DisplayStatusEnum 检查分类=>ProjectTypeEnum
        return request({
            method: "GET",
            url: `/api/bcss/patient360/useAllEnum`,
            params
        });
    };
    //获取(检验)数据
    Patient360.test = function(PatientId,params) {
        //枚举名： 医嘱状态=>DisplayStatusEnum 检查分类=>ProjectTypeEnum
        return request({
            method: "GET",
            url: `/api/bcss/patient360/test/${PatientId}`,
            params
        });
    };
    //获取(检验)数据
    Patient360.testResult = function(params) {
        //枚举名： 医嘱状态=>DisplayStatusEnum 检查分类=>ProjectTypeEnum
        return request({
            method: "GET",
            url: `/api/bcss/patient360/testResult`,
            params
        });
    };
    //获取(检查)数据
    Patient360.inspect = function(patientId, params) {
        return request({
            method: "GET",
            url: `/api/bcss/patient360/inspect/${patientId}`,
            params,
        });
    };
    //(检查)详细数据
    Patient360.inspectDetail = function(params) {
        return request({
            method: "GET",
            url: `/api/bcss/patient360/inspectDetail`,
            params,
        });
    };
    //根据参数查询（电子病历）数据
    Patient360.electronicMedical = function(PatientId,params) {
        return request({
            method: "GET",
            url: `/api/bcss/patient360/electronicMedical/${PatientId}`,
            params,
        });
    };
    //(电子病历)详细数据
    Patient360.electronicMedicalDetail = function(params) {
        return request({
            method: "GET",
            url: `/api/bcss/patient360/electronicMedicalDetail`,
            params
        });
    };
    //医嘱
    Patient360.medicalAdvice = function(PatientId,params) {
        return request({
            method: "GET",
            url: `/api/bcss/patient360/medicalAdvice/${PatientId}`,
            params
        });
    };
    //根据参数查询（血气）数据
    Patient360.bloodGas = function(PatientId,params) {
        return request({
            method: "GET",
            url: `/api/bcss/patient360/bloodGas/${PatientId}`,
            params
        });
    };
    //根据参数查询（血气）详细数据
    Patient360.bloodGasResult = function(PatientId,params) {
        return request({
            method: "GET",
            url: `/api/bcss/patient360/bloodGasResult/${PatientId}`,
            params
        });
    };
export default Patient360;