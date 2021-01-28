<template>
	<div>
		<el-tree class="custom-tree" :data="treeData" default-expand-all :expand-on-click-node="false">
			<span class="custom-tree-node" slot-scope="{ node,data }">
				<span v-text="data.func_name"
				      :class="{ root: data.func_id ===0, unleaf: data.func_key === '', leaf: data.func_key !== ''}"></span>
				<span>
					<el-button type="text" v-if="data.func_key === ''" @click="beginAdd(data)"><i
						class="el-icon-plus"></i></el-button>
					<el-button type="text" v-if="data.func_id !==0" @click="beginUpdate(data)"><i
						class="el-icon-edit"></i></el-button>
					<el-button type="text" v-if="[0,44,45].indexOf (data.func_id)==-1"
					           :disabled="typeof (data.children) !=='undefined'"
					           @click="remove(data)">
						<i class="el-icon-delete"></i></el-button>
				</span>
			</span>
		</el-tree>
		<el-dialog :modal="false"  :visible="edit.isEdit" :show-close="false" :close-on-click-modal="false"
		           :close-on-press-escape="false" width="600px">
			<h3 slot="title" v-text="`系统功能维护 -${ edit.mode ? '新增': '修改'}`"></h3>
			<el-form :model="edit.model" :rules="edit.rules" label-width="140px" ref="form">
				<el-form-item label="系统功能类型：">
					<el-radio v-model="edit.isLeaf" :label="false"
					          :disabled="!(edit.mode && edit.model.func_fid ===0)">非叶子功能节点
					</el-radio>
					<el-radio v-model="edit.isLeaf"
					          :label="true" :disabled="!(edit.mode && edit.model.func_fid ===0)">
						叶子功能节点
					</el-radio>
				</el-form-item>
				<el-form-item label="父级节点名称：">
					<el-select v-model="edit.model.func_fid" :disabled="edit.mode || !edit.isLeaf">
						<el-option v-for="item in selectData"
						           :key="item.value"
						           :label="item.label"
						           :value="item.value"
						></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="系统功能名称：" prop="func_name">
					<el-input v-model.trim="edit.model.func_name"
					          placeholder="请输入系统功能名称"></el-input>
				</el-form-item>
				<el-form-item label="系统功能关联组件：" v-show="edit.isLeaf" prop="func_key">
					<el-select v-model="edit.model.func_key">
						<el-option
							v-for="item in Object.keys(views)"
							:key="item"
							:label="item"
							:value="item"
							:disabled="list.findIndex( func => func.func_key === item) !== -1">
						</el-option>
					</el-select>
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
        import views from '../../views';
        //仓库数据映射
        import { createNamespacedHelpers} from 'vuex';
        let { mapState, mapGetters,mapActions } = createNamespacedHelpers("func");

        export default {
                name: "Func",
                data(){
                        return {
                                views,
                                edit: {
                                        mode: true,                     //true表示新增，false表示修改
                                        isEdit: false,                  //标识是否进入了编辑状态
                                        isLeaf: true,                   //标识当前编辑的是否是叶子
                                        model: {func_id: 0, func_name: "", func_key: "", func_fid: -1},
                                        rules: {
                                                func_name: [
                                                        {
                                                                validator: (rule, value, callback) =>{
                                                                        //ES6中的解构赋值
                                                                        let { func_id, func_name, func_fid} = this.edit.model;
                                                                        if(value.length === 0)
                                                                                callback(new Error('* 功能名称不能为空'));
                                                                        else if(value.length < 2 || value.length > 50)
                                                                                callback(new Error('功能名称长度2-50'));
                                                                        else if(this.list.some(item => item.func_id !== func_id && item.func_name === func_name && item.func_fid === func_fid))
                                                                                callback(new Error('* 功能名称在当前父级中已经存在'));
                                                                        else
                                                                                callback();                  //直接调用callback,标识通过验证
                                                                },
                                                                trigger: 'blur'
                                                        },
                                                ],
                                                func_key: [
                                                        {
                                                                validator: (rule, value, callback) =>{
                                                                        //如果是新增节点，且是叶子节点，且没有选定绑带的组件
                                                                        if(this.edit.mode && this.edit.isLeaf && value === "")
                                                                                callback(new Error('* 叶子节点，必须绑定组件！'));
                                                                        else
                                                                                callback();
                                                                },
                                                                trigger: 'blur'
                                                        },
                                                ]
                                        },
                                },
                        };
                },
                computed: {
                        ...mapState(["list"]),                  //"..."展开运算符 ES6新特性 ，去壳
                        ...mapGetters(["listToTree"]),
                        treeData(){
                                return  [{
                                        func_id: 0,
                                        func_name: "Root",
                                        func_key: "",
                                        func_fid: -1,
                                        children: this.listToTree               //映射方法
//                                        children: this.$store.getters["func/listToTree"]   //原始getters
                                }];
                        },
                        selectData(){
                                let result = [{label: "Root", value: 0}];
                                this.list.filter(item => item.func_key === "").forEach(item =>{
                                        result.push({label: item.func_name, value: item.func_id});
                                });
                                return result;
                        },
                },
                async created(){
                        //通知func子仓库去初始化list所有功能列表
//                       this.$store.dispatch("func/init");
                        this.init();
                },
                methods: {
                        ...mapActions(["init", "addFunc", "updateFunc", "removeFunc"]),
                        //删除
                        remove(node){
                                this.$confirm(`你确定要删除 ${node.func_name} 节点吗？`, "警告", {type: "warning"})
                                        .then(async() =>{
//                                                await this.$store.dispatch("func/removeFunc",node.func_id);
                                                await this.removeFunc(node.func_id);
                                                this.$message({
                                                        message: `"${ node.func_name}" 节点, 删除成功！请刷新页面，启动新菜单`,
                                                        type: "success"
                                                })
                                        })
                                        .catch(() =>{
                                        });
                        },
                        //新增按钮
                        beginAdd(parentNode){
                                this.$refs.form && this.$refs.form.resetFields();
                                //打开对话框前的准备工作
                                this.edit.mode = true;
                                this.edit.isLeaf = parentNode.func_id !== 0;
                                this.edit.model.func_id = 0;
                                this.edit.model.func_name = "";
                                this.edit.model.func_key = "";
                                this.edit.model.func_fid = parentNode.func_id;
                                // 打开对话框开始新增
                                this.edit.isEdit = true;
                        },
                        // 编辑按钮
                        beginUpdate(node){
                                this.$refs.form && this.$refs.form.resetFields();
                                //打开对话框前的准备工作
                                this.edit.mode = false;
                                this.edit.isLeaf = node.func_key !== "";
                                this.edit.model.func_id = node.func_id;
                                this.edit.model.func_name = node.func_name;
                                this.edit.model.func_key = node.func_key;
                                this.edit.model.func_fid = node.func_fid;
                                // 打开对话框开始新增
                                this.edit.isEdit = true;
                        },
                        // 新增、修改
                        save(){
                                this.$refs.form.validate(async valid => {
                                        if(!valid) return;
                                        if(this.edit.mode){
//                                               await this.$store.dispatch("func/addFunc", Object.assign({}, this.edit.model));
                                                await this.addFunc(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `"${ this.edit.model.func_name}" 节点, 新增成功！请刷新页面，启动新菜单`,
                                                        type: "success"
                                                });
                                        }else{
//                                                await this.$store.dispatch("func/updateFunc", Object.assign({},  this.edit.model));
                                                await this.updateFunc(Object.assign({},  this.edit.model));
                                                this.$message({
                                                        message: `"${ this.edit.model.func_name}" 节点, 修改成功！请刷新页面，启动新菜单`,
                                                        type: "success"
                                                });
                                        }
                                        this.edit.isEdit = false;            //关闭编辑对话框
                                });
                        }
                },
        };
</script>


<style lang="stylus" type="text/stylus" scoped>
	.custom-tree
		width: 500px
		span.custom-tree-node
			flex 1
			display flex
			justify-content space-between
			align-items center
			span.root
				color: #d45837 !important
			span.unleaf
				color: #55a630
			span.leaf
				color: skyblue
</style>