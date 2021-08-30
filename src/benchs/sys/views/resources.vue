<template>
    <div class="content">
        <div class="command-bar">
            <el-button type="primary" size="mini" @click="createResource"><span class="iconfont appstoreadd"/>新增资源</el-button>
        </div>
        <el-table :data="resources.items" size="mini" stripe>
            <el-table-column type="index" />
            <el-table-column prop="name" label="标识"/>
            <el-table-column prop="displayName" label="名称" />
            <el-table-column prop="description" label="描述" />
            <el-table-column fixed="right" label="操作">
                <template slot-scope="scope">
                    <div class="button-group">
                        <el-button type="text" size="mini" @click="editResource(scope.row.id)"><span class="iconfont edit"/>编辑</el-button>
                        <el-popconfirm
                            confirmButtonText="删除"
                            confirmButtonType="danger"
                            cancelButtonText="取消"
                            cancelButtonType="text"
                            title="删除资源将会影响分配的API权限，确认要删除此资源吗？"
                            icon="el-icon-warning"
                            iconColor="red"
                            @onConfirm="handleDeleteResource(scope.row.id)">
                            <el-button type="text" style="color: red" size="mini" slot="reference"><span class="iconfont delete"/>删除</el-button>
                        </el-popconfirm>
                        
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <div class="paging-warpper">
            <el-pagination 
                :hide-on-single-page="true"
                :total="resources.count"
                :current-page="resources.pageIndex"
                :page-size="resources.pageSize"
                layout="prev, pager, next, sizes" />
        </div>

        <el-drawer
            ref="createResourceDrawer"
            :visible.sync="createResourceDrawer"
            :before-close="handleDrawerClose"
            :with-header="false"
            size="30%"
            title="创建资源"
            direction="rtl">
            <div class="drawer-info-wrapper">
                <h4>资源基本信息</h4>
                <el-divider />
                <el-form size="mini" label-position="top" :rules="createResourceRules" :model="resourceInfo">
                    <el-form-item label="标识" prop="name">
                        <el-input size="mini" placeholder="请输入资源标识" v-model="resourceInfo.name"></el-input>
                    </el-form-item>
                    <el-form-item label="名称" prop="displayName">
                        <el-input size="mini" placeholder="请输入资源标识" v-model="resourceInfo.displayName"></el-input>
                    </el-form-item>
                    <el-form-item label="描述" prop="description">
                        <el-input type="textarea" :rows="4" placeholder="资源描述" v-model="resourceInfo.description"></el-input>
                    </el-form-item>
                </el-form>
                <el-divider />
                <div class="button-group">
                    <el-button type="primary" size="mini" @click="handleCreateResource(resourceInfo)"><span class="iconfont save"/>保存</el-button>
                    <el-button size="mini" @click="createResourceDrawer = false"><span class="iconfont close"/>取消</el-button>
                </div>
            </div>
        </el-drawer>

        <el-drawer
            ref="updateResourceDrawer"
            :visible.sync="updateResourceDrawer"
            :before-close="handleDrawerClose"
            :with-header="false"
            size="30%"
            title="更新资源"
            direction="rtl">
            <div class="drawer-info-wrapper">
                <h4>资源基本信息</h4>
                <el-divider />
                <el-form size="mini" label-position="top" :model="resourceInfo">
                    <el-form-item label="标识" prop="name">
                        <el-input size="mini" placeholder="请输入资源标识" v-model="resourceInfo.name" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="名称" prop="displayName">
                        <el-input size="mini" placeholder="请输入资源标识" v-model="resourceInfo.displayName"></el-input>
                    </el-form-item>
                    <el-form-item label="描述" prop="description">
                        <el-input type="textarea" :rows="4" placeholder="资源描述" v-model="resourceInfo.description"></el-input>
                    </el-form-item>
                </el-form>
                <el-divider />
                <div class="button-group">
                    <el-button type="primary" size="mini" @click="handleUpdateResource(resourceInfo)"><span class="iconfont save"/>保存</el-button>
                    <el-button size="mini" @click="updateResourceDrawer = false"><span class="iconfont close"/>取消</el-button>
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: 'resources',
    computed: {
        ...mapState({
            resources: (state) => state.sys.resources_paging,
        }),
        watchList: function() {
            const obj = {};
            Object.keys(this.resourceInfo).forEach(key => {
                obj[key] = this.resourceInfo[key];
            });
            return obj;
        }
    },
    watch: {
        watchList: {
            deep: true,
            handler: function(n, o) {
                if (n != o) {
                    this.editChanged = true;
                } else {
                    this.editChanged = false;
                }
            }
        }
    },
    data() {
        return {
            editChanged: false,
            createResourceDrawer: false,
            updateResourceDrawer: false,
            resourceInfo: { extraProperties: {} },
            createResourceRules: {
                name: [
                    { required: true, message: '请输入资源名称', trigger: 'blur' }
                ]
            }
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
            this.$store.dispatch('sys/resources/paging', {
                pageIndex: this.resources.pageIndex,
                pageSize: this.resources.pageSize
            }).then(resp => {
                console.info(resp);
                loading.close();
            }).catch(err => {
                console.error(err);
                loading.close();
            })
        },
        handleDrawerClose(done) {
            if (this.editChanged) {
                this.$confirm('确定要放弃本次修改吗？')
                    .then(_ => done() )
                    .catch(_ => {} );
            } else {
                done();
            }
        },
        createResource() {
            this.resourceInfo = { extraProperties: {} };
            this.createResourceDrawer = true;
            this.editChanged = false;
        },
        editResource(id) {
            const loading = this.$loading({
                lock: true,
                text: '数据加载中',
                spinner: 'el-icon-loading'
            });
            this.$store.dispatch('sys/resources/get', id).then(resp => {
                this.resourceInfo = resp;
                this.updateResourceDrawer = true;
                loading.close();
            }).catch(err => {
                console.error(err);
                loading.close();
            })
        },
        handleCreateResource(resource) {
            const loading = this.$loading({
                lock: true,
                text: '数据保存中',
                spinner: 'el-icon-loading'
            });
            this.$store.dispatch('sys/resources/create', resource).then(resp => {
                this.$message.success('资源创建成功');
                this.createResourceDrawer = false;
                loading.close();
                this.refresh();
            }).catch(err => {
                loading.close();
            })
        },
        handleUpdateResource(resource) {
            const loading = this.$loading({
                lock: true,
                text: '数据保存中',
                spinner: 'el-icon-loading'
            });
            this.$store.dispatch('sys/resources/update', resource).then(resp => {
                this.$message.success('更新资源成功');
                this.updateResourceDrawer = false;
                loading.close();
                this.refresh();
            }).catch(err => {
                loading.close();
            })
        },
        handleDeleteResource(id) {
            const loading = this.$loading({
                lock: true,
                text: '数据删除中',
                spinner: 'el-icon-loading'
            });
            this.$store.dispatch('sys/resources/delete', id).then(resp => {
                this.$message.success('删除资源成功');
                loading.close();
                this.refresh();
            }).catch(err => {
                loading.close();
                this.$message.error('删除资源失败');
            });
        },
        editRole(role) {
            console.info(role)
        }
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