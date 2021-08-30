/**
 * 表单页相关接口 
 */
var Form = {}

// 表单头部病人信息
Form.getPatientInfo = function(patientNo){
    return API.GET(`/document/area/patient/${patientNo}`);
}

//手麻系统查询表头接口
Form.patientSuspension = function(operId){
    return API.GET(`/AIMS/medicalRecord/patientInformation/${operId}`);
}

//重症系统查询表头接口
Form.documentPatientInfo = function(inpNo){
    return API.GET(`/ICIS/icuDocumentRecord/documentPatientInfo?inpNo=${inpNo}`);
}

// 获取护理记录列表
Form.getNursingRecordList = function(params){
    return API.GET(`/document/nursingRecord`, {params: params})
}

// 获取自定义项
Form.getCustom = function(params){
    return API.GET(`/document/nursingRecord/custom`, { params: params });
}

// 新增自定义项
Form.postCustom = function(params){
    return API.POST('/document/nursingRecord/custom', params);
}

// 删除自定义项
Form.deleteNursingRecordCustom = function(ids){
    return API.DELETE('/document/nursingRecord/custom', {data: ids}).then(res => {
        return res;
    })
}

// 新增护理记录
Form.saveNursingRecord = function(params){
    return API.POST(`/document/nursingRecord`, params).then(res => {
        return res;
    });
}

// 删除护理记录
Form.deleteNursingRecord = function(ids){
    return API.DELETE(`/document/nursingRecord`, {data:ids}).then(res => {
        return res;
    });
}

// 获取出入量统计类别
Form.getAmount = function(params){
    // let request_uri = `${api_endpoint}/nursingRecord`;
    // return axios.post(params);
    return API.GET(`/document/nursingRecord/amount`, {params:params}).then(res => {
        return res;
    });
}

// 患者医嘱信息
Form.getPatientAdvice = function (params) {
    return API.GET(`/document/area/advice`, { params: params }).then(res => {
        return res;
    });
}

// 患者手术信息
Form.getPatientOperationInfo = function (params) {
    return API.GET(`/document/area/operation`, { params: params }).then(res => {
        return res;
    });
}


// 获取患者检查检验信息
Form.getPatientInspectInfo = function (params) {
    return API.GET(`/document/inspect/assay`, { params: params }).then(res => {
        return res;
    });
}

// 获取患者诊断信息
Form.getPatientDiagnosisInfo = function (params) {
    return API.GET(`/document/area/patient/diagnosis`, { params: params }).then(res => {
        return res;
    });
}
//健康教育记录
    //宣教标题--查询健康宣教项目
    Form.getTitleList = function (params) {
        return API.GET(`/document/health/edu/title/list`,{params:params}).then(res => {
            return res;
        });
    }
    // 根据教育时间查询
    Form.getHealthTimes = function (patientNo,startTimeStr,endTimeStr) {
        return API.GET(`/document/patient/health/edu/list/${patientNo}/${startTimeStr}/${endTimeStr}`).then(res => {
            return res;
        });
    }
    //新增功能
    Form.addEdiBtn = function (params) {
        return API.POST(`/document/patient/health/edu`,params).then(res => {
            return res;
        });
    }
    //删除功能
    Form.deleteBtn = function (id) {
        return API.DELETE(`/document/patient/health/edu/${id}`).then(res => {
            return res;
        });
    }
//护理计划
    //获取护理计划列表
    Form.getNursingPlan = function(params){
        return API.POST(`/document/nursingPlan/list`,params).then(res=>{
            return res;
        })
    }
    //删除护理记录单
    Form.deleteNursingPlan = function(params){
        return API.DELETE(`/document/nursingPlan/${params}`,).then(res=>{
            return res;
        })
    }
    //新增或修改护理计划
    Form.putNursingPlan = function(params){
        return API.POST(`/document/nursingPlan`,params).then(res=>{
            return res;
        })
    }