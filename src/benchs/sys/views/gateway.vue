<template>
    <div class="content">
        <div class="command-bar">
            <el-button type="primary" size="mini" @click="createRouter"><span class="iconfont luyou" />新增路由</el-button>
        </div>
        <el-table :data="gateway.routes" size="mini" stripe>
            <el-table-column type="index" />
            <el-table-column prop="key" label="路由键"/>
            <el-table-column prop="upstreamPathTemplate" label="上游服务路由模板" />
            <el-table-column prop="downstreamPathTemplate" label="下游服务路由模板" />
            <el-table-column prop="downstreamHostAndPorts" label="下游服务地址">
                <template slot-scope="scope">
                    {{ scope.row.downstreamHostAndPorts | formatterDownstreamHostAndPorts }}
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作">
                <template slot-scope="scope">
                    <div class="button-group">
                        <el-button type="text" size="mini" @click="editRouter(scope.$index)"><span class="iconfont edit"/>编辑</el-button>
                        <el-popconfirm
                            confirmButtonText="删除"
                            confirmButtonType="danger"
                            cancelButtonText="取消"
                            cancelButtonType="text"
                            icon="el-icon-warning"
                            iconColor="red"
                            title="删除客户端将会影响使用该客户端授权的用户权限，请确认是否删除此客户端"
                            @onConfirm="handleDeleteRouter(scope.row)">
                            <el-button type="text" style="color: red" size="mini" slot="reference"><span class="iconfont delete"/>删除</el-button>
                        </el-popconfirm>
                    </div>
                </template>
            </el-table-column>
        </el-table>

        <el-drawer
            ref="routerInfoDrawer"
            :visible.sync="routerInfoDrawer"
            :before-close="handleDrawerClose"
            :with-header="false"
            size="30%"
            title="路由信息"
            direction="rtl">
            <div class="drawer-info-wrapper">
                <h4>网关路由信息</h4>
                <el-divider />
                <el-form size="mini" label-position="top" :model="routerInfo" :rules="routerInfoRules">
                    <el-form-item label="路由键" prop="key">
                        <el-input size="mini" placeholder="路由键" v-model="routerInfo.key" />
                    </el-form-item>
                    <el-form-item label="上游服务路由模板" prop="upstreamPathTemplate">
                        <el-input size="mini" placeholder="上游服务路由模板" v-model="routerInfo.upstreamPathTemplate" />
                    </el-form-item>
                    <el-form-item label="下游服务路由模板" prop="downstreamPathTemplate">
                        <el-input size="mini" placeholder="下游服务路由模板" v-model="routerInfo.downstreamPathTemplate" />
                    </el-form-item>
                    <el-form-item label="下游服务HTTP方案" prop="downstreamScheme">
                        <el-input size="mini" placeholder="下游服务HTTP方案" v-model="routerInfo.downstreamScheme" />
                    </el-form-item>
                    <el-form-item label="允许路由的HTTP请求方法" prop="upstreamHttpMethod">
                        <el-checkbox-group v-model="routerInfo.upstreamHttpMethod">
                            <el-checkbox label="GET"></el-checkbox>
                            <el-checkbox label="POST"></el-checkbox>
                            <el-checkbox label="PUT"></el-checkbox>
                            <el-checkbox label="PATCH"></el-checkbox>
                            <el-checkbox label="DELETE"></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="下游服务地址" prop="downstreamHostAndPorts">
                        <el-table size="mini" :data="routerInfo.downstreamHostAndPorts">
                            <el-table-column label="主机" prop="host">
                                <template slot-scope="scope">
                                    <el-input v-if="scope.row.editing" size="mini" placeholder="主机地址或服务名" v-model="scope.row.host"/>
                                    <span v-else>{{ scope.row.host }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="端口" prop="port">
                                <template slot-scope="scope">
                                    <el-input v-if="scope.row.editing" size="mini" placeholder="请输入端口" v-model="scope.row.port" />
                                    <span v-else>{{ scope.row.port }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column width="160">
                                <template slot="header">
                                    <el-button size="mini" type="primary" icon="el-icon-plus" @click="createHostAndPorts" />
                                </template>
                                <template slot-scope="scope">
                                    <div v-if="scope.row.editing==true">
                                        <el-button size="mini" type="text" @click="handleRemoveHostAndPort(scope.$index)">放弃</el-button>
                                        <el-button size="mini" type="text" @click="handleSaveHostAndPort(scope.row)">保存</el-button>
                                    </div>
                                    <el-button v-else size="mini" type="danger" icon="el-icon-delete" @click="handleRemoveHostAndPort(scope.$index)"></el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-form-item>
                </el-form>
                <el-divider />
                <div class="button-group">
                    <el-button type="primary" size="mini" @click="handleSaveRouterInfo(routerInfo)"><span class="iconfont save"/>保存</el-button>
                    <el-button size="mini" @click="handleCancelSaveRouterInfo()"><span class="iconfont close"/>取消</el-button>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: 'clients',
    computed: {
        ...mapState({
            gateway: (state) => state.sys.gateway,
        })
    },
    filters: {
        enabledText: function(value) {
            if (!value) return '禁用';
            return '启用'
        },
        formatterDownstreamHostAndPorts: function(value) {
            if (Array.isArray(value)) {
                return value.map(v => `${v.host}:${v.port}`).join(',');
            }
            return '';
        }
    },
    data() {
        return {
            adding: false,
            editingIndex: 0,
            routerInfoDrawer: false,
            routerInfo: {},
            routerInfoRules: {
                key: [
                    { required: true, message: '请输入路由键', trigger: 'blur' }
                ],
                upstreamPathTemplate: [
                    { required: true, message: '请输入上游服务路由模板', trigger: 'blur' }
                ],
                downstreamPathTemplate: [
                    { required: true, message: '请输入下游服务路由模板', trigger: 'blur' }
                ],
            },
        }
    },
    mounted: function() {
        this.refresh();
    },
    methods: {
        refresh() {
            const loading = this.$loading({
                lock: true,
                text: '数据加载中',
                spinner: 'el-icon-loading'
            });
            this.$store.dispatch('sys/gateway/configuration').then(resp => {
                loading.close();
            }).catch(err => {
                loading.close();
            })
        },
        handleDrawerClose(done) {
            this.$confirm('确认放弃本次修改吗？')
                .then(_ => done() )
                .catch(_ => {});
        },
        createRouter() {
            this.adding = true;
            this.routerInfo = { 
                downstreamScheme: 'http', 
                downstreamHostAndPorts: [], 
                upstreamHttpMethod: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
            };
            this.routerInfoDrawer = true;
        },
        editRouter(routerIndex) {
            this.editingIndex = routerIndex;
            var info = this.gateway.routes[this.editingIndex];
            info.downstreamScheme = info.downstreamScheme || 'http';
            this.adding = false;
            this.routerInfo = JSON.parse(JSON.stringify(info));
            this.routerInfoDrawer = true;
        },
        createHostAndPorts() {
            this.routerInfo.downstreamHostAndPorts.push({
                host: '',
                port: 80,
                editing: true
            });
        },
        handleRemoveHostAndPort(index) {
            this.routerInfo.downstreamHostAndPorts.splice(index, 1);
        },
        handleSaveHostAndPort(row) {
            row.editing = false;
        },
        handleSaveRouterInfo(router) {
            if (this.adding) {
                this.gateway.routes.push(router);
            } else {
                this.gateway.routes[this.editingIndex] = router;
            }
            const loading = this.$loading({
                lock: true,
                text: '数据保存中',
                spinner: 'el-icon-loading'
            });
            this.$store.dispatch('sys/gateway/configuration/update', this.gateway).then(resp => {
                loading.close();
                this.refresh();
                this.routerInfoDrawer = false;
            }).catch(err => {
                console.error(err);
                loading.close();
            });
        },
        handleCancelSaveRouterInfo() {
            this.routerInfoDrawer = false;
        },
    }
}
</script>

<style lang="scss" scoped>
    .command-bar {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        margin-bottom: 6px;
    }
    .paging-warpper {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        margin-bottom: 6px;
    }
</style>