/**
 * 系统管理相关API接口
 */
import request from '@/utils/request';
const SYS = {};
    //-----用户管理接口-----
    SYS.getPagedUsers = function(params) {//获取用户列表
        var paging = {
            skipCount: (params.pageIndex - 1) * params.pageSize,
            maxResultCount: params.pageSize,
            filter: params.filter
        };
        return request({
            method: 'GET',
            url: '/api/identity/users',
            params: paging,
        });
    }
    SYS.createUser = function(data) {//创建用户
        if (!data.extraProperties) data.extraProperties = {};
        data.email = data.email || `${data.userName}@ids.com`;
        data.extraProperties.roles = data.roles || [];
        return request({
            method: 'POST',
            url: '/api/identity/users',
            params: {password:data.password},
            data: data
        });
    }
    SYS.updateUser = function(id, data) {//编辑用户
        if (!data.extraProperties) data.extraProperties = {};
        data.email = data.email || `${data.userName}@ids.com`;
        data.extraProperties.roles = data.roles || [];
        return request({
            method: 'PUT',
            url: `/api/identity/users/${id}`,
            data: data
        });
    }
    SYS.getUserRoles = function(id) {//根据用户id获取用户详情
        return request({
            method: 'GET',
            url: `/api/identity/users/${id}`,
        });
    }
    SYS.deleteUser = function(id) {//根据用户id删除
        return request({
            method: 'DELETE',
            url: `/api/identity/users/${id}`
        });
    }
    SYS.resetPassword = function(id,password) {//重置密码
        return request({
            method: 'PUT',
            url: `/api/identity/users/${id}/${password}`
        });
    }

    //--------------------角色管理接口------------------
    SYS.getPagedRoles = function(params) {//角色列表--分页
        var paging = {
            skipCount: (params.pageIndex - 1) * params.pageSize,
            maxResultCount: params.pageSize,
            filter: params.filter
        };
        return request({
            method: 'GET',
            url: '/api/identity/roles',
            params: paging,
        });
    }
    SYS.createRole = function(data) {//新增角色
        if (!data.extraProperties) data.extraProperties = {};
        data.extraProperties.Remark = data.remark;
        data.extraProperties.menus = data.menus;
        return request({
            method: 'POST',
            url:`/api/identity/roles/`,
            data: data
        });
    }
    SYS.updateRole = function(data) {//编辑角色
        if (!data.extraProperties) data.extraProperties = {};
        data.extraProperties.Remark = data.remark;
        data.extraProperties.menus = data.menus;
        return request({
            method: 'PUT',
            url: `/api/identity/roles/${data.id}`,
            data: data
        });
    }
    SYS.deleteRole = function(id) {//根据角色id删除角色
        return request({
            method: 'DELETE',
            url: `/api/identity/roles/${id}`
        });
    }
    SYS.getMenusRole = function(id) {////根据角色id获取详情（所拥有的菜单）
        return request({
            method: 'GET',
            url: `/api/identity/roles/${id}`
        });
    }
    // -------------------菜单相关接口 -------------------------
    SYS.getOwnerMenuTree = function() {// 获取当前登录用户的菜单树
        return request({
            method: 'GET',
            url: '/api/identity/profile/menus'
        });
    }

    SYS.updateMenu = function (params) {//更新菜单--编辑
        return request({
            method: "PUT",
            // url: `/api/identity/menu/${params.id}`,
            url: `/api/identity/menus`,
            data: params
        })
    }
    SYS.createMenu = function (params) {//创建新菜单--新增
        return request({
            method: "POST",
            url: '/api/identity/menus',
            data: params
        })
    }
    SYS.deleteMenu = function (params) {//删除菜单--删除
        return request({
            method: "DELETE",
            url: `/api/identity/menus/${params}`
        })
    }
    //-----API管理接口-----
    SYS.getPagedResources = function(params) {//获取
        var req = {
            Sorting: params.sorting,
            SkipCount: (params.pageIndex - 1) * params.pageSize,
            MaxResultCount: params.pageSize
        };
        return request({
            method: 'GET',
            url: '/api/identity/api_resources',
            params: params
        });
    }
    SYS.getAllResources = function() {
        return request({
            method: 'GET',
            url: '/api/identity/api_resources'
        });
    }
    SYS.createResource = function(resource) {
        return request({
            method: 'POST',
            url: '/api/identity/api_resources',
            data: resource
        });
    }
    SYS.updateResource = function(resource) {
        return request({
            method: 'PUT',
            url: `/api/identity/api_resources/${resource.id}`,
            data: resource
        });
    }
    SYS.deleteResource = function(id) {
        return request({
            method: 'DELETE',
            url: `/api/identity/api_resources/${id}`,
        });
    }
    SYS.getResource = function(id) {
        return request({
            method: 'GET',
            url: `/api/identity/api_resources/${id}`
        });
    }
    //-----客户端管理接口-----
    SYS.getPagedClients = function(params) {//获取客户端列表
        return request({
            method: 'GET',
            url: '/api/identity/clients',
            params: params
        });
    }
    SYS.getClient = function(id) {//获取客户端详情
        return request({
            method: 'GET',
            url: `/api/identity/clients/${id}`
        });
    }
    SYS.createClient = function(data) {//创建客户端
        return request({
            method: 'POST',
            url: '/api/identity/clients',
            data: data
        });
    }
    SYS.updateClient = function(data) {//更新客户端
        return request({
            method: 'PUT',
            url: `/api/identity/clients/${data.id}`,
            data: data
        });
    }
    SYS.deleteClient = function(id) {//删除客户端
        return request({
            method: 'DELETE',
            url: `/api/identity/clients/${id}`
        });
    }
    
    SYS.getClientScopes = function(id) {//不存在
        return request({
            method: 'GET',
            url: `/api/identity/clients/${id}/scopes`
        });
    }
    SYS.getClientGrantTypes = function(id) {//不存在
        return request({
            method: 'GET',
            url: `/api/identity/clients/${id}/grant_types`
        });
    }
    //-----API网关管理接口-----
    SYS.getGatewayConfiguration = function() {
        return request({
            method: 'GET',
            url: '/api/gateway/admin/configuration'
        });
    }
    SYS.updateGatewayConfiguration = function(configuration) {
        return request({
            method: 'POST',
            url: '/api/gateway/admin/configuration',
            data: configuration
        });
    }
    //------获取网站图标----
    SYS.getInfo = function() {
        return request({
            method: 'GET',
            url: '/api/application/info',
        });
    }
    // 科室項目的接口
    SYS.getDepts = function() {
        return request({
            method: 'GET',
            url: '/api/identity/depts',
        });
    }
    SYS.putDepts = function(data) {
        return request({
            method: 'PUT',
            url: '/api/identity/depts',
            data
        });
    }
    SYS.postDepts = function(data) {
        return request({
            method: 'POST',
            url: '/api/identity/depts',
            data
        });
    }
    SYS.deleteDepts = function(id) {
        return request({
            method: 'DELETE',
            url: `/api/identity/depts/${id}`,
        });
    }
    // 根據id查询人员
    SYS.getDeptsMembers = function(id) {
        return request({
            method: 'GET',
            url: `/api/identity/depts/${id}/members`,
        });
    } 
export default SYS;