/**
 * 模板相关接口
 */
var Template = {};

// 查询
Template.getPathography = function (params) { // 带分页
    return API.POST('/document/template/page', params).then(res => {
        return res;
    })
}

// 创建模板
Template.createTemplate = function (params) { // 带分页
    return API.POST('/document/template', params).then(res => {
        return res;
    })
}

// 更新模板
Template.updataTemplate = function (params) { // 带分页
    return API.PUT('/document/template', params).then(res => {
        return res;
    })
}

// 删除模板
Template.deleteTemplate = function (id) { // 带分页
    return API.DELETE('/document/template/'+id).then(res => {
        return res;
    })
}