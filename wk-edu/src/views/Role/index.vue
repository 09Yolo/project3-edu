<template>
	<div>
		<el-row :gutter="20">
			<el-col :span="6" v-for="item in list" :key="item.role_id">
				<el-card shadow="hover">
					<span v-text="item.role_name"></span>
					<div class="button-wrapper">
						<el-button type="text" @click="beginUpdate(item.role_id)"><i class="el-icon-edit-outline"></i></el-button>
						<el-button type="text" @click="remove(item.role_id)"><i class="el-icon-delete"></i></el-button>
						<el-button type="text" @click="beginRoleFuncConfig(item.role_id)">功能分配</el-button>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6" >
				<el-card class="btn-add" ><i class="el-icon-plus" @click="beginAdd"></i></el-card>
			</el-col>
		</el-row>
		<el-drawer class="custom-drawer" :modal="false"
		           :visible.sync="edit2.isEdit"
		           size="600px"
		           :show-close="false" >
			<h3 slot="title">角色功能分配</h3>
			<el-tree class="custom-tree" :data="edit2.treeData" default-expand-all :expand-on-click-node="false" >
				<span class="custom-tree-node"slot-scope="{ node,data }" :class="{ parent: data.func_key ===''}">
					<span>
						<i v-if="data.func_key !==''" class="el-icon-paperclip"></i>
						<span v-text="data.func_name"></span>
					</span>
					<span class="switch-wrapper">
						<el-switch v-model="data.open" @change="switchChangeHandler(data)"></el-switch>
					</span>
				</span>
			</el-tree>
			<div class="drawer-footer">
				<el-button type="primary" @click="roleFuncConfig">确定</el-button>
				<el-button @click="edit2.isEdit = false">取消</el-button>
			</div>
		</el-drawer>
		<el-dialog :title="editText" :visible="edit.isEdit" :show-close="false"  width="500px">
			<h3 slot="title" v-text="`角色管理 -${ edit.mode ? '新增': '修改'}`"></h3>
			<el-form :model="edit.model" :rules="edit.rules" label-width="140px" ref="form">
				<el-form-item label="角色名称："  prop="role_name">
					<el-input v-model.trim="edit.model.role_name"
					          placeholder="-请输入角色名称-"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="edit.isEdit = false">取 消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
        //仓库数据映射
        import { createNamespacedHelpers } from 'vuex';
        let { mapState, mapActions } = createNamespacedHelpers("role");
	let{ mapGetters: mapGettersFromFunc,
		mapActions: mapActionsFromFunc }
		= createNamespacedHelpers("func");
        export default {
                name: "Role",
	        data() {
                        return{
	                        edit: {
                                        isEdit: false,
					mode: true,
		                        model: { role_name: "", role_id: 0},
                                        rules:{
                                                role_name:[
                                                        {
                                                                validator:(rule, value, callback) =>{
                                                                        //ES6中的解构赋值 前提 声明的变量必须是要解构的值
                                                                        let { role_name} = this.edit.model;
                                                                        if( value.length === 0)
                                                                                callback(new Error('* 角色名称不能为空'));
                                                                        else if( value.length < 2 || value.length > 10)
                                                                                callback( new Error('* 角色名称长度2 - 10'));
                                                                        else if( this.list.some(item => item.role_name ===role_name ))
                                                                                callback(new Error('* 角色名存在'));
                                                                        else
                                                                                callback()              //直接调用callback不给参数，表示通过验证
                                                                },
                                                                trigger:"blur"
                                                        }
                                                ]
                                        }
	                        },
	                        edit2: {
                                        isEdit: false,            //表示有没有进入角色分配
					model: { role_id: 0, role_func_ids: ""},
		                        treeData: []
	                        }
                        }
	        },
	        computed: {
                        ...mapState(["list"]),
		        ...mapGettersFromFunc(["listToTree"]),
	        },
                methods: {
                        ...mapActions(["init", "addRole", "updateRole", "removeRole"]),
                        ...mapActionsFromFunc({initFunc: "init"}),
	                updateTreeData(roleFuncIds){
                              let result = JSON.parse(JSON.stringify(this.listToTree));
                              result.forEach(item => {
                                      item.open = roleFuncIds.indexOf(item.func_id) !==-1;
                                      item.children && item.children.forEach(item2 => item2.open = roleFuncIds.indexOf(item2.func_id) !== -1);
                              });
                              this.edit2.treeData = result;
	                },
	                async roleFuncConfig() {
	                        //发ajax前统计树中所有open的节点的func_id
		                let func_ids = [];
		                this.edit2.treeData.forEach(item => {
		                        if(item.open) func_ids.push(item.func_id);
		                        item.children && item.children.forEach(item2 => {
		                                if(item2.open) func_ids.push(item2.func_id);
		                        })
		                });
		                this.edit2.model.role_func_ids = func_ids.join(",");
		                //发ajax
		                await this.$http({
			                method: "post",
			                url: "role_function/config",
					data: this.edit2.model
		                });
		                //ajax成功返回后的相应界面变化
		                this.edit2.isEdit =false;
		                this.$message({ message: "角色功能分配成功！",  type: 'success'})
	                },
	                async beginRoleFuncConfig(role_id){
                                let roleFuncs = await this.$http({ url: "/role_function/list/" + role_id});
                               let roleFuncIds = roleFuncs.reduce((result, item) => {
                                        result.push(item.func_id);
                                        return result
                                }, []);
                                this.updateTreeData(roleFuncIds);

                                this.edit2.model.role_func_ids = "";
                                this.edit2.model.role_id = role_id;
                                this.edit2.isEdit = true
	                },
	                switchChangeHandler(node) {
				if(node.func_key === "") {                     //非叶子节点
			node.children && node.children.forEach(item => item.open = node.open);
				}else{                          //叶子节点
				      let parent = this.edit2.treeData.find(item => item.func_id === node.func_fid);
				}
	                },

                        //删除
                        remove(node){
                                this.$confirm(`你确定要删除角色吗？`, "警告", {type: "warning"})
                                        .then(async() =>{
                                                  await this.removeRole(node)
                                                this.$message({
                                                        message: `角色删除成功！`,
                                                        type: "success"
                                                })
                        });
                        },
                        beginAdd(){
                                this.$refs.form && this.$refs.form.resetFields();
                                //打开对话框前的准备工作
                                this.edit.mode = true;
                                this.edit.model.role_name = "";
                                // 打开对话框开始新增
                                this.edit.isEdit = true;
                        },
                        // 编辑按钮
                        beginUpdate(id){
                                this.$refs.form && this.$refs.form.resetFields();
                                //打开对话框前的准备工作
                                this.edit.mode = false;
	                        this.edit.model.role_id = id;
                                this.edit.model.role_name = this.list[this.list.findIndex(item => item.role_id === id)].role_name;
                                // 打开对话框开始新增
                                this.edit.isEdit = true;
                        },
	                //新增编辑
                        save(){
                                this.$refs.form.validate(async valid => {
                                        if(!valid) return;
                                        if(this.edit.mode){
                                                await this.addRole(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `"${ this.edit.model.role_name}" 角色, 新增成功！`,
                                                        type: "success"
                                                });
                                        }else{
                                                await this.updateRole(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `"${ this.edit.model.role_name}" 角色, 修改成功！`,
                                                        type: "success"
                                                });
                                        }
                                        this.edit.isEdit = false;            //关闭编辑对话框
                                });
                        },
                },
                watch: {
                        listToTree() {
                                this.edit2.isEdit = false;
                                this.updateTreeData([]);
                        }
                },
                async created(){
                       await this.init();
                       await this.initFunc();
                },
        };
</script>

<style lang="stylus"type="text/stylus" scoped>
	.custom-tree
		width: 500px
		margin: 20px 0 50px 50px
		span.custom-tree-node
			flex: 1
			display: flex
			justify-content: space-between
			align-items: center
			&.parent
				padding-right: 50px
				color: #0094ff
	.drawer-footer
		text-align: center
		margin-bottom: 10px
	.el-col
		margin-top: 30px
		.el-card
			text-align: center
			padding: 10% 0
			background-color: #2b90d9
			color: #d9e1e8
			font-size: 20px
			cursor: pointer
			position: relative
			&.btn-add
				background-color: transparent
				color: #2b90d9
				border 2px dashed #2b90d9
			.button-wrapper
				position: absolute
				right: 10px
				buttom: 0
				.el-button
					font-size: 22px
					color #9baec8
	.btn-add
		font-size: 22px

</style>