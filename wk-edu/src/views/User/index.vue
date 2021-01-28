<template>
	<el-container>
		<el-header>
			<el-form :inline="true">
				<el-form-item label="用户名字：">
					<el-input clearable placeholder="请输入搜索内容"
					prefix-icon="el-icon-search" v-model.trim="search.user_name"
					@change = "getUser()"></el-input>
				</el-form-item>
				<el-form-item label="用户角色：">
					<el-select v-model="search.role_id" @change="getUser()">
						<el-option label="-全部-" :value="-1"></el-option>
						<el-option label="-无角色-" :value="0"></el-option>
						<el-option
						v-for="role in roleList"
						:key="role.role_id"
						:label="role.role_name"
						:value="role.role_id">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div>
				<el-button type="success" icon="el-icon-plus" @click="beginAdd">新增</el-button>
			</div>
		</el-header>
		<el-main>
			<el-table  :data="users" stripe border style="width: 100%" >
				<el-table-column type="index"  label="#" width="50" align="center"></el-table-column>
				<el-table-column  label="用户名" prop="user_name" width="150"></el-table-column>
				<el-table-column  label="角色"  width="180" align="center">:
					<template slot-scope="{ row }">
						<span v-if="row.role_id !== null && roleList.length > 0" v-text="roleList.find(item => item.role_id ===row.role_id).role_name"></span>
						<span v-else class="no-role">无角色</span>
					</template>
				</el-table-column>
				<el-table-column  label="操作">
					<template slot-scope="{ row }">
						<el-button type="primary" size="mini" @click="beginUpdate(row)" icon="el-icon-edit-outline">编辑</el-button>
						<el-button size="mini" type="danger" @click="remove(row.user_name)" icon="el-icon-delete">删除</el-button>
						<el-popover placement="right">
							<el-button @click="beginRoleFuncConfig(row)" slot="reference" size="mini" type="success" icon="el-icon-setting">角色分配</el-button>
							<el-form  inline>
								<el-form-item label="角色">
									<el-select v-model="edit.model.role_id">
										<el-option label="- 无角色 -" :value="0"></el-option>
										<el-option
											v-for="role in roleList"
											:key="role.role_id"
											:label="role.role_name"
											:value="role.role_id">
										</el-option>
									</el-select>
								</el-form-item>
								<el-form-item>
									<el-button @click="roleFuncConfig">分配</el-button>
								</el-form-item>
							</el-form>
						</el-popover>
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination
				background
				layout="prev, pager, next, jumper, ->,sizes,total"
				:page-sizes="[6,8,10,12,15]"
				:page-size.sync="pagination.pageSize"
				:total="pagination.total"
				:current-page.sync="pagination.currentPage"
				@size-change="getUser()"
				@current-change="getUser(false)">
			</el-pagination>
		</el-footer>
		<el-dialog  :visible.sync="edit.isEdit" :show-close="false" :modal="false" width="500px">
			<h3 slot="title" v-text="`用户编辑 -${ edit.mode ? '新增': '修改'}`"></h3>
			<el-form :model="edit.model"  label-width="100px" :rules="edit.rules" ref="form" @validate="formValidateHandler">
				<el-form-item label="用户名字：" prop="user_name">
					<el-input v-model.trim="edit.model.user_name"
					          placeholder="-请输入用户名-" :disabled="!edit.mode "></el-input>
				</el-form-item>
				<el-form-item label="用户密码：" prop="user_pwd">
					<el-input v-model.trim="edit.model.user_pwd"
					          placeholder="-请输入用户密码-"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="edit.isEdit = false">取 消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
        import { createNamespacedHelpers } from 'vuex';
        let { mapState, mapActions } = createNamespacedHelpers("role");

        export default {
	        name: "User",
                data() {
                        return {
                                users: [],
	                        search: {
                                        user_name: "",
		                        role_id: -1
	                        },
	                        pagination: {
                                        total: 0,
		                        pageSize: 6,
		                        currentPage: 1,
	                        },
	                        edit: {
                                        isEdit: false,
                                        mode: true,
		                        model: { user_name: "", user_pwd: "", role_id: null},
                                        rules:{
                                                user_name:[
                                                        {
                                                                validator: async (rule, value, callback) =>{
									if(!this.edit.mode) {
                                                                                callback();
									}
                                                                        else if(!/^[a-zA-Z][a-zA-Z0-9]{2,19}$/.test(value) ) {
                                                                                callback( new Error('* 用户姓名长度3 - 20,且只能包含字母或数字，不能以数字开头'));
									}
                                                                        else if( await this.$http({ method: "post", url: "/user/valid_name", data: {user_name: value} })) {
                                                                                callback(new Error('* 用户名存在'));
                                                                        }
                                                                        else
                                                                                callback()

                                                                },
                                                                trigger:"blur"
                                                        }
                                                ],
                                                user_pwd:[
                                                        { required: true, message: "*密码不能为空", trigger: "blur" },
	                                                { min: 3, max: 20, message: "*密码长度3-20", trigger: "blur"}
                                                ]
                                        }
	                        },
                        }
                },
                computed: {
                        ...mapState({"roleList": "list"}),
                },
                methods: {
                        ...mapActions({"roleInit": "init"}),
	                async getUser(fromPage1 = true) {
				//判断是否需要从第一页开始看
		                if(fromPage1) this.pagination.currentPage = 1;
                               let { list, total } = await this.$http({
	                                method: "post",
	                                url: "/user/list",
	                                data: {
		                                ...this.search,
		                                begin: this.pagination.pageSize*(this.pagination.currentPage -1),
						pageSize: this.pagination.pageSize
	                                }
                                });
		                this.users = list;
                                this.pagination.total = total;
	                },
	                remove(user_name) {
                                this.$confirm(`确定要删除吗？`,"警告","warning")
                        .then(async () =>{
                                        await this.$http({
                                                url: "/user/remove/" + user_name,
                                                method: "post"
                                        });
                                        let i = this.users.findIndex(item => item.user_name === user_name );
                                        this.users.splice(i,1);
                                        this.$message({
                                                showClose: true,
                                                message: `删除用户成功`,
                                                type: 'success'
                                        });
                                })
                                        .catch(() =>{});
	                },
                        beginAdd(){     //新增
	                       if (this.$refs.form)  this.$refs.form.resetFields();               //清空表单验证
                                this.edit.mode = true;
                                this.edit.model.user_name = "";
                                this.edit.model.user_pwd = "";
                                this.edit.model.role_id = null;
                                this.edit.isEdit = true;
                        },
                        beginUpdate(user){  //修改
                               if(this.$refs.form)  this.$refs.form.resetFields();               //清空表单验证
                                this.edit.mode = false;
                               this.edit.model.user_pwd =user.user_pwd;
                                this.edit.model.user_name =user.user_name;
                                this.edit.model.role_id = null;
                                this.edit.isEdit = true;
                        },
	                formValidateHandler(prop, valid, message) {
                                if( prop === "user_name") this.userNameValidateResult = valid;
	                },
	              async save(){
		              if(this.edit.mode) {
                                      if(this.userNameValidateResult === false) return;
                                      if(typeof this.userNameValidateResult === "undefined") {
                                              await new Promise(resolve => this.$refs.form.validateField("user_name", message => {
                                                      if(message === "") resolve();
                                              }));
                                      }
                              }
                              await new Promise(resolve => this.$refs.form.validateField("user_pwd", message => {
                                      if(message === "") resolve();
		              }));
					//代码能执行到这里，说明用户名和密码都通过了验证，可以执行后续真正的新增与修改操作了
                                        if(this.edit.mode){
                                                await this.$http({
                                                        url: "/user/add",
                                                        method: "post",
                                                        data: this.edit.model
                                                });
                                                this.users.length !== this.pagination.pageSize && this.users.push(Object.assign({}, this.edit.model));
                                                this.pagination.total ++;
                                                this.$message({message: `添加成功! `, type: 'success'});
                                        }else{
                                                await this.$http({
                                                        url: "/user/change_pwd",
                                                        method: "post",
                                                        data: this.edit.model
                                                });
                                                let i = this.users.findIndex(item => item.user_name === this.edit.model.user_name);
                                                this.users.splice(i, 1, Object.assign({}, this.edit.model));
                                                this.$message({message: `修改成功!`, type: 'success'});
                                        }
                                        this.edit.isEdit = false;
                        },
	                beginRoleFuncConfig(user) {
	                      this.edit.model.user_name = user.user_name;
	                      this.edit.model.role_id = user.role_id || 0;
	                },
	                //角色分配
	               async roleFuncConfig() {
	                      await this.$http({ method: "post", url: "/user/config_role", data: this.edit.model });
				let target = this.users.find(item => item.user_name === this.edit.model.user_name);
				target.role_id = this.edit.model.role_id || null;
	                      this.$message({ message: `用户：${this.edit.model.user_name}, 角色分配成功`})
	                }
                },
	        watch: {
                        'edit.isEdit'(newValue) {
                                if(newValue === false) delete this.userNameValidateResult;
                        }
	        },
		async created(){
	                this.roleInit();
	                this.getUser();
		},
	};
</script>

<style scoped lang="stylus" type="text/stylus">
	.el-container
		position: absolute
		left: 0
		top: 0
		width:100%
		height: 100%
		.el-header
			display: flex
			justify-content: space-between
		.el-main
			border-top: 1px solid #b0b0b0
			border-bottom: 1px solid #b0b0b0
			span.no-role
				color: #d0d0d0
		.el-footer
			display: flex
			align-items: center
			.el-pagination
				flex-grow: 1
</style>