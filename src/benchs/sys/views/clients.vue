<template>
    <div class="content">
        <div class="command-bar">
            <el-button type="primary" size="mini" @click="createBtn"><span class="iconfont laptop" />新增客户端</el-button>
        </div>
        <el-table :data="clients.items" size="mini" stripe>
            <el-table-column type="index" />
            <el-table-column prop="clientId" label="标识"/>
            <el-table-column prop="clientName" label="名称" />
            <el-table-column prop="protocolType" label="协议" />
            <el-table-column prop="enabled" label="启用状态">
                <!-- <template slot-scope="scope">{{ scope.row.enabled | enabledText }}</template> -->
                <template slot-scope="scope">
                    <el-switch
                        v-model="scope.row.enabled"
                        active-color="#13ce66"
                        inactive-color="#ff4949"
                        @change="switchChange($event,scope.row)">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作">
                <template slot-scope="scope">
                    <div class="button-group">
                        <el-button type="text" size="mini" @click="editBtn(scope.row.id)"><span class="iconfont edit"/>编辑</el-button>
                        <el-popconfirm
                            confirmButtonText="删除"
                            confirmButtonType="danger"
                            cancelButtonText="取消"
                            cancelButtonType="text"
                            icon="el-icon-warning"
                            iconColor="red"
                            title="删除客户端将会影响使用该客户端授权的用户权限，请确认是否删除此客户端"
                            @onConfirm="handleDeleteClient(scope.row.id)">
                            <el-button type="text" style="color: red" size="mini" slot="reference"><span class="iconfont delete"/>删除</el-button>
                        </el-popconfirm>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <div class="paging-warpper">
            <el-pagination 
                :hide-on-single-page="true"
                :total="clients.count"
                :current-page="clients.pageIndex"
                :page-size="clients.pageSize"
                layout="total, sizes, prev, pager, next, jumper" />
        </div>

        <el-drawer
            ref="createClientDrawer"
            :visible.sync="createClientDrawer"
            :before-close="handleDrawerClose"
            :with-header="false"
            size="30%"
            title="创建客户端"
            direction="rtl">
            <div class="drawer-info-wrapper">
                <h4>客户端基本信息</h4>
                <el-divider />
                <el-form size="mini" label-position="top" :model="clientInfo" :rules="createClientRules">
                    <el-form-item label="标识" prop="clientId">
                        <el-input size="mini" placeholder="客户端标识" v-model="clientInfo.clientId" />
                    </el-form-item>
                    <el-form-item label="名称" prop="clientName">
                        <el-input size="mini" placeholder="客户端名称" v-model="clientInfo.clientName" />
                    </el-form-item>
                    <el-form-item label="协议" prop="protocolType">
                        <el-input size="mini" placeholder="客户端使用的授权协议" v-model="clientInfo.protocolType" disabled />
                    </el-form-item>
                    <el-form-item label="令牌有效时长（秒）" prop="accessTokenLifetime">
                        <el-input size="mini" v-model="clientInfo.accessTokenLifetime" />
                    </el-form-item>
                    <el-form-item label="验证码有效时长（秒）" prop="authorizationCodeLifetime">
                        <el-input size="mini" v-model="clientInfo.authorizationCodeLifetime" />
                    </el-form-item>
                    <el-form-item label="描述" prop="description">
                        <el-input type="textarea" placeholder="客户端描述" :rows="4" v-model="clientInfo.description" />
                    </el-form-item>
                </el-form>
                <el-divider />
                <div class="button-group">
                    <el-button type="primary" size="mini" @click="handleCreateClient(clientInfo)"><span class="iconfont save"/>保存</el-button>
                    <el-button size="mini" @click="createClientDrawer = false"><span class="iconfont close"/>取消</el-button>
                </div>
            </div>
        </el-drawer>

        <el-drawer
            ref="updateClientDrawer"
            :visible.sync="updateClientDrawer"
            :before-close="handleDrawerClose"
            :with-header="false"
            size="30%"
            title="更新客户端"
            direction="rtl">
            <div class="drawer-info-wrapper">
                <h4>客户端基本信息</h4>
                <el-divider />
                <el-form size="mini" label-position="top" :model="clientInfo">
                    <el-form-item label="标识" prop="clientId">
                        <el-input size="mini" placeholder="客户端标识" v-model="clientInfo.clientId" disabled />
                    </el-form-item>
                    <el-form-item label="名称" prop="clientName">
                        <el-input size="mini" placeholder="客户端名称" v-model="clientInfo.clientName" />
                    </el-form-item>
                    <el-form-item label="协议" prop="protocolType">
                        <el-input size="mini" placeholder="客户端使用的授权协议" v-model="clientInfo.protocolType" disabled />
                    </el-form-item>
                    <el-form-item label="令牌有效时长（秒）" prop="accessTokenLifetime">
                        <el-input size="mini" v-model="clientInfo.accessTokenLifetime" />
                    </el-form-item>
                    <el-form-item label="验证码有效时长（秒）" prop="authorizationCodeLifetime">
                        <el-input size="mini" v-model="clientInfo.authorizationCodeLifetime" />
                    </el-form-item>
                    <el-form-item label="描述" prop="description">
                        <el-input type="textarea" placeholder="客户端描述" :rows="4" v-model="clientInfo.description" />
                    </el-form-item>
                    <el-form-item label="支持的授权模式" prop="grantTypes">
                        <el-checkbox-group v-model="grantTypes">
                            <el-checkbox label="password">密码认证模式</el-checkbox>
                            <el-checkbox label="client_credentials">客户端认证模式</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="可访问资源" prop="scopes">
                        <el-checkbox-group v-model="scopes">
                            <el-checkbox v-for="resource in this.resources" :key="resource.name" :label="resource.name">{{ resource.displayName }}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-form>
                <el-divider />
                <div class="button-group">
                    <el-button type="primary" size="mini" @click="handleUpdateClient(clientInfo)"><span class="iconfont save"/>保存</el-button>
                    <el-button size="mini" @click="updateClientDrawer = false"><span class="iconfont close"/>取消</el-button>
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
            clients: (state) => state.sys.clients_paging,
            resources: (state) => state.sys.resources,
        })
    },
    filters: {
        enabledText: function(value) {
            if (!value) return '禁用';
            return '启用'
        }
    },
    data() {
        return {
            createClientDrawer: false,
            updateClientDrawer: false,
            clientInfo: { extraProperties: {} },
            createClientRules: {
                clientId: [
                    { required: true, message: '请输入客户端标识', trigger: 'blur' }
                ]
            },
            scopes: [],
            grantTypes: [],
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
            this.$store.dispatch('sys/clients/paging', {
                pageIndex: this.clients.pageIndex,
                pageSize: this.clients.pageSize
            }).then(resp => {
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
        switchChange(e,row){//禁用启用
            console.log(e,row,'禁用启用')
            this.updateClient(row)
        },
        updateClient(data){//更新客户端
            const loading = this.$loading({
                lock: true,
                text: '数据保存中...',
                spinner: 'el-icon-loading'
            });
            this.$store.dispatch('sys/clients/update',data).then(resp => {
                loading.close();
                if(resp){
                    this.$message.error('更新客户端失败~');
                }else{
                    this.$message.success('更新客户端成功！');
                    this.updateClientDrawer  = false;
                    this.refresh();
                }
            }).catch(err => {
                loading.close();
            });
        },
        createClient(data){//创建客户端
            const loading = this.$loading({
                lock: true,
                text: '数据保存中',
                spinner: 'el-icon-loading'
            });
            this.$store.dispatch('sys/clients/create', data).then(resp => {
                loading.close();
                if(resp){
                    this.$message.error('创建客户端失败~');
                }else{
                    this.$message.success('创建客户端成功');
                    this.createClientDrawer = false;
                    this.refresh();
                }
            }).catch(err => {
                loading.close();
            })
        },
        createBtn() {
            this.clientInfo = {
                protocolType: 'oidc', // 默认只支持这个协议
                accessTokenLifetime: 31536000,
                absoluteRefreshTokenLifetime: 31536000,
                authorizationCodeLifetime: 300,
                identityTokenLifetime: 300,
                enabled: true
            };
            this.createClientDrawer = true;
        },
        editBtn(id) {
            const loading = this.$loading({
                lock: true,
                text: '数据加载中',
                spinner: 'el-icon-loading'
            });
            this.$store.dispatch('sys/resources/all').then(resp => {
                console.info(this.resources);
            });
            this.$store.dispatch('sys/clients/scopes', id).then(resp => {//不存在
                this.scopes = resp.items;
            });
            this.$store.dispatch('sys/clients/grants', id).then(resp => {//不存在
                this.grantTypes = resp.items;
            });
            this.$store.dispatch('sys/clients/get', id).then(resp => {
                this.clientInfo = resp;
                this.updateClientDrawer = true;
                loading.close();
            }).catch(err => {
                loading.close();
            })
        },
        handleCreateClient(client) {
            this.createClient(client)
        },
        handleUpdateClient(client) {
            client.scopes = this.scopes;
            client.grantTypes = this.grantTypes;
            this.updateClient(client);
        },
        handleDeleteClient(id) {
            const loading = this.$loading({
                lock: true,
                text: '数据保存中',
                spinner: 'el-icon-loading'
            });
            this.$store.dispatch('sys/clients/delete', id).then(resp => {
                loading.close();
                if(resp){
                    this.$message.error('删除客户端失败~');
                }else{
                    this.$message.success('删除客户端成功');
                    this.createClientDrawer = false;
                    this.refresh();
                }
            }).catch(err => {
                loading.close();
            })
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