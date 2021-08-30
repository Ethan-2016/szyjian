/**
 * 系统状态管理
 */
import SYS from '@/api/sys.js';
// import { reject, resolve } from 'core-js/fn/promise';

let sys = {
    state: {
        // 诊断准入数据
        users_paging: {
            pageIndex: 1,
            pageSize: 10,
            count: 0,
            items: []
        },
        roles_paging: {
            pageIndex: 1,
            pageSize: 10,
            count: 0,
            items: []
        },
        resources_paging: {
            pageIndex: 1,
            pageSize: 10,
            count: 0,
            items: []
        },
        clients_paging: {
            pageIndex: 1,
            pageSize: 10,
            count: 0,
            items: []
        },
        depts: [],
        units: [],
        resources: [],
        gateway: {},
        ownerMenus: []
    },

    mutations: {
        ['sys/users/paging'](state, value) {
            state.users_paging.pageIndex = value.pageIndex;
            state.users_paging.pageSize = value.pageSize;
            state.users_paging.count = value.count;
            state.users_paging.items = [].concat(value.items);
        },
        ['sys/roles/paging'](state, value) {
            state.roles_paging.pageIndex = value.pageIndex;
            state.roles_paging.pageSize = value.pageSize,
            state.roles_paging.count = value.count;
            state.roles_paging.items = [].concat(value.items);
        },
        ['sys/resources/paging'](state, value) {
            state.resources_paging.pageIndex = value.pageIndex;
            state.resources_paging.pageSize = value.pageSize;
            state.resources_paging.count = value.count;
            state.resources_paging.items = [].concat(value.items);
        },
        ['sys/resources/all'](state, value) {
            state.resources = [].concat(value);
        },
        ['sys/clients/paging'](state, value) {
            state.clients_paging.pageIndex = value.pageIndex;
            state.clients_paging.pageSize = value.pageSize;
            state.clients_paging.count = value.count;
            state.clients_paging.items = [].concat(value.items);
        },
        ['sys/gateway/configuration'](state, value) {
            state.gateway = value;
        },
        ['sys/menu/owner'](state, value) {
            state.ownerMenus = value;
        }
    },

    actions: {
        //用户管理接口
        ['sys/users/paging']({ commit }, payload) {
            return new Promise((resolve, reject) => {
                SYS.getPagedUsers(payload).then(resp => {
                    commit('sys/users/paging', { pageIndex: payload.pageIndex, pageSize: payload.pageSize, count: resp.totalCount, items: resp.items });
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/users/create']({ commit }, payload) {
            return new Promise((resolve, reject) => {
                SYS.createUser(payload).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/users/update']({ commit }, payload) {
            return new Promise((resolve, reject) => {
                SYS.updateUser(payload.id, payload).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/users/delete']({ commit }, payload) {
            return new Promise((resolve, reject) => {
                SYS.deleteUser(payload).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/users/get']({ commit }, id) {
            return new Promise((resolve, reject) => {
                SYS.getUser(id).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/users/getroles']({ commit }, id) {////根据用户id获取用户详情
            return new Promise((resolve, reject) => {
                SYS.getUserRoles(id).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        
        // 角色管理接口
        ['sys/roles/paging']({ commit }, payload) {//角色列表--分页
            return new Promise((resolve, reject) => {
                SYS.getPagedRoles(payload).then(resp => {
                    commit('sys/roles/paging', { pageIndex:payload.pageIndex,pageSize:payload.pageSize,count:resp.totalCount, items: resp.items });
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/roles/menus']({commit}, id) {//根据角色id获取详情（所拥有的菜单）
            return new Promise((resolve, reject) => {
                SYS.getMenusRole(id).then(resp => {
                    if (!resp.menus) {
                        resp.menus = resp.extraProperties.menus;
                    }
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/roles/create']({ commit }, role) {
            return new Promise((resolve, reject) => {
                SYS.createRole(role).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/roles/update']({ commit }, role) {
            return new Promise((resolve, reject) => {
                SYS.updateRole(role).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/roles/delete']({ commit }, id) {
            return new Promise((resolve, reject) => {
                SYS.deleteRole(id).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        // 资源管理接口
        ['sys/resources/paging']({ commit }, payload) {
            return new Promise((resolve, reject) => {
                SYS.getPagedResources(payload.pageIndex, payload.pageSize, payload.sorting ?? '').then(resp => {
                    commit('sys/resources/paging', { pageIndex: payload.pageIndex, pageSize: payload.pageSize, count: resp.totalCount, items: resp.items });
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/resources/all']({ commit }) {
            return new Promise((resolve, reject) => {
                SYS.getAllResources().then(resp => {
                    commit('sys/resources/all', resp.items);
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/resources/create']({ commit }, resource) {
            return new Promise((resolve, reject) => {
                SYS.createResource(resource).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/resources/update']({ commit }, resource) {
            return new Promise((resolve, reject) => {
                SYS.updateResource(resource).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/resources/delete']({ commit }, id) {
            return new Promise((resolve, reject) => {
                SYS.deleteResource(id).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/resources/get']({ commit }, id) {
            return new Promise((resolve, reject) => {
                SYS.getResource(id).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        // 客户端管理接口
        ['sys/clients/paging']({ commit }, payload) {//获取列表
            return new Promise((resolve, reject) => {
                SYS.getPagedClients(payload).then(resp => {
                    commit('sys/clients/paging', { pageIndex: payload.pageIndex, pageSize: payload.pageSize, count: resp.totalCount, items: resp.items });
                    resolve();
                }).catch(err => {
                    reject(err);
                });
            })
        },
        ['sys/clients/create']({ commit }, client) {//创建客户端
            return new Promise((resolve, reject) => {
                SYS.createClient(client).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/clients/update']({ commit }, client) {//更新客户端
            return new Promise((resolve, reject) => {
                SYS.updateClient(client).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/clients/delete']({ commit }, id) {//删除客户端
            return new Promise((resolve, reject) => {
                SYS.deleteClient(id).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/clients/get']({ commit }, id) {
            return new Promise((resolve, reject) => {
                SYS.getClient(id).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/clients/scopes']({ commit }, id) {//不存在
            return new Promise((resolve, reject) => {
                SYS.getClientScopes(id).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/clients/grants']({ commit }, id) {//不存在
            return new Promise((resolve, reject) => {
                SYS.getClientGrantTypes(id).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        // API路由管理接口
        ['sys/gateway/configuration']({ commit }) {
            return new Promise((resolve, reject) => {
                SYS.getGatewayConfiguration().then(resp => {
                    commit('sys/gateway/configuration', resp)
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        ['sys/gateway/configuration/update']({ commit }, payload) {
            return new Promise((resolve, reject) => {
                SYS.updateGatewayConfiguration(payload).then(resp => {
                    commit('sys/gateway/configuration', payload);
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                });
            });
        },
        // ---- 菜单管理接口 ----
        ['sys/menu/owner']({ commit }) {
            return new Promise((resolve, reject) => {
                SYS.getOwnerMenuTree().then(resp => {
                    console.log(resp,'菜单列表');
                    commit('sys/menu/owner', resp);
                    resolve(resp);
                }).catch(err => {
                    reject(err);
                })
            })
        },
        ['sys/menu/update']({ commit }, payload) {
            return new Promise((resolve, reject) => {
                SYS.updateMenu(payload).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err)
                })
            })
        },
        ['sys/menu/create']({ commit }, payload) {
            return new Promise((resolve, reject) => {
                SYS.createMenu(payload).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err)
                })
            })
        },
        ['sys/menu/delete']({ commit }, payload) {
            return new Promise((resolve, reject) => {
                SYS.deleteMenu(payload).then(resp => {
                    resolve(resp);
                }).catch(err => {
                    reject(err)
                })
            })
        }
    }
};

export default sys;
