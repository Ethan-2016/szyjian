var DynamicForm4MicroReport = {};

// 修改万能表单模板
DynamicForm4MicroReport.updateDynamicForm = function(params) {
    return API.PUT('/micro/report/dynamicForm/template', params).then(res => {
        return res;
    })
}

// 根据表单id获取表单模板
DynamicForm4MicroReport.getDynamicForm = function(dynamicFormCode) {
    return API.GET('/micro/report/dynamicForm/' + dynamicFormCode).then(res => {
        return res;
    })
}

// 根据诊疗活动id获取病人基本信息
DynamicForm4MicroReport.getPatientBaseInfo = function(clinicalActivId) {
    return API.GET('/micro/report/outPatient/info/' + clinicalActivId).then(res => {
        return res;
    })
}

// 根据诊疗活动id获取病人基本信息
DynamicForm4MicroReport.saveFormData = function(saveFormDat) {
    return API.GET('/micro/report/outPatient/info/' + clinicalActivId).then(res => {
        return res;
    })
}

// 保存表单数据
DynamicForm4MicroReport.saveDynamicFormData = function(params) {
    return API.POST('/micro/report/dynamicForm/formData', params).then(res => {
        return res;
    })
}

// 暂存表单数据
DynamicForm4MicroReport.tempSaveDynamicFormData = function(params) {
    return API.POST('/micro/report/dynamicForm/temporary/formData', params).then(res => {
        return res;
    })
}

// 查询表单数据
DynamicForm4MicroReport.getOneFormData = function(formCode, patientNumber, adviceId) {
    return API.GET('/micro/report/dynamicForm/formData/' + formCode + '/'+ patientNumber +'/' + adviceId)
}