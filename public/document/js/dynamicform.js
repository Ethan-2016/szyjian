var DynamicForm = {};

// 保存万能表单模板
DynamicForm.saveDynamicForm = function(params) {
    return API.POST('/document/dynamicForm', params).then(res => {
        return res;
    })
}

// 修改万能表单模板
DynamicForm.updateDynamicForm = function(params) {
    return API.PUT('/document/dynamicForm', params).then(res => {
        return res;
    })
}

// 根据表单code获取表单模板
DynamicForm.getDynamicForm = function(formCode) {
    return API.GET('/document/dynamicForm/' + formCode).then(res => {
        return res;
    })
}

// 获取文书管理（表单管理）列表
DynamicForm.getFormList = function(params) {
    return API.GET('/document/dynamicForm/', { params: params }).then(res => {
        return res;
    })
}

// 删除文书
DynamicForm.deleteDynamicForm = function(params) {
    return API.DELETE('/document/dynamicForm', { data: params }).then(res => {
        return res;
    })
}

// 查询文书数据
DynamicForm.getProjectFormData = function(formCode, patientNo, formType,appCode) {
    return API.GET('/document/dynamicForm/formdataProject/' + formCode + '/' + patientNo + '/' + formType+ '/' + appCode )
}

// 查询文书数据
DynamicForm.getFormData = function(formCode, patientNo, formType) {
    return API.GET('/document/dynamicForm/formdata/' + formCode + '/' + patientNo + '/' + formType)
}

// 获取同一个病人同一个表单多份数据记录
DynamicForm.getFormDataRecordList = function(formCode, patientId) {
    return API.GET('/document/multiFormCollection/list/' + formCode + '/' + patientId).then(res => {
        return res;
    })
}

// 获取病人某天的表单数据
DynamicForm.getFormDataOne = function(params) {
    return API.POST('/document/dynamicForm/formdata/getOne', params).then(res => {
        return res;
    })
}

// 根据时间范围查询表单数据
DynamicForm.getFormDataDateRange = function(params) {
    return API.POST('/document/dynamicForm/search', params).then(res => {
        return res;
    })
}

// 保存表单数据
DynamicForm.saveDynamicFormData = function(params) {
    return API.POST('/document/dynamicForm/formData', params).then(res => {
        return res;
    })
}

// 删除表单数据
DynamicForm.deleteDynamicFormData = function(formCode, id) {
    return API.DELETE('/document/dynamicForm/formData/' + formCode + '/' + id).then(res => {
        return res;
    })
}

// 删除表格数据
DynamicForm.deleteDynamicTableData = function(formCode, patientNo, id){
    return API.DELETE('/document/dynamicForm/formData/'+ formCode + '/' + patientNo + '/' + id).then(res => {
        return res;
    })
}
// 表单模板分页查询，不返回html字段

//保存表头字段
DynamicForm.savePatientInformation = function(params){
    return API.PUT('/aims/medicalRecord/patientInformation', params).then(res => {
        return res;
    })
}
