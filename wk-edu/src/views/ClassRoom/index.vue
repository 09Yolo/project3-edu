<template>
	<div>
		<div class="tipsColor">
				<span class="free"></span>
				<p>闲置</p>
				<span class="using"></span>
				<p>使用中</p>
		</div>
		<el-row :gutter="20">
			<el-col :span="6" v-for="item in list" :key="item.clsr_id" >
				<el-card shadow="hover" :class="{occupy: item.clsr_occupy === 1}">
					<span v-text="`${item.clsr_name}教室`"></span>
					<div class="button-wrapper">
						<el-button type="text" ><i class="el-icon-edit-outline" @click="beginUpdate(item.clsr_id)"></i></el-button>
						<el-button type="text" @click="remove(item.clsr_id)" v-if="item.clsr_occupy !==1"><i class="el-icon-delete"></i></el-button>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6" >
				<el-card class="btn-add" ><i class="el-icon-plus" @click="beginAdd"></i></el-card>
			</el-col>
		</el-row>
		<el-dialog :title="editText" :visible="edit.isEdit" :show-close="false"  width="500px">
			<el-form :model="edit.model" :rules="edit.rules" label-width="140px" ref="form">
				<el-form-item label="教室名字："  prop="clsr_name">
					<el-input v-model.trim="edit.model.clsr_name"
					          placeholder="-请输入教室名字-"></el-input>
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

        import { createNamespacedHelpers} from 'vuex';
        let {mapState, mapActions} = createNamespacedHelpers("classroom");

        export default {
                name: "ClassRoom",
                data(){
                        return {
                                editText: "",
                                edit: {
                                        isEdit: false,
                                        mode: true,
                                        model: {clsr_name: "", clsr_occupy: -1, clsr_id: 0},
                                        rules: {
                                                clsr_name: [
                                                        {
                                                                validator: (rule, value, callback) =>{
                                                                        //ES6中的解构赋值 前提 声明的变量必须是要解构的值
                                                                        let {clsr_name} = this.edit.model;
                                                                        if(value.length === 0)
                                                                                callback(new Error('* 教室名不能为空'));
                                                                        else if(value.length < 2 || value.length > 10)
                                                                                callback(new Error('* 教室名长度2 - 10'));
                                                                        else if(this.list.some(item => item.clsr_name === clsr_name))
                                                                                callback(new Error('* 教室名存在'));
                                                                        else
                                                                                callback()              //直接调用callback不给参数，表示通过验证
                                                                },
                                                                trigger: "blur"
                                                        }
                                                ]
                                        }
                                }
                        }
                },
	        computed: {
		        ...mapState(["list"]),
	        },
	        methods: {
                        ...mapActions(["init", "addRoom", "removeRoom", "updateRoom"]),
		        //删除
                        remove(node){
                                this.$confirm(`你确定要删除角色吗？`, "警告", {type: "warning"})
                                        .then(async() =>{
                                                await this.removeRoom(node)
                                                this.$message({
                                                        message: `教室删除成功！`,
                                                        type: "success"
                                                })
                                        });
                        },
		        //新增按钮
                        beginAdd(){
                                this.$refs.form && this.$refs.form.resetFields();
                                //打开对话框前的准备工作
                                this.edit.mode = true;
                                this.editText = "教室管理-新增"
                                this.edit.model.clsr_name = "";
                                // 打开对话框开始新增
                                this.edit.isEdit = true;
                        },
                        beginUpdate(id){
                                this.$refs.form && this.$refs.form.resetFields();
                                //打开对话框前的准备工作
                                this.edit.mode = false;
                                this.editText = "教室管理-编辑"
                                this.edit.model.clsr_id = id;
                                this.edit.model.clsr_name = this.list[this.list.findIndex(item => item.clsr_id === id)].clsr_name;
                                // 打开对话框开始新增
                                this.edit.isEdit = true;
                        },
                        save(){
                                this.$refs.form.validate(async valid => {
                                        if(!valid) return;
                                        if(this.edit.mode){
                                                await this.addRoom(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `"${ this.edit.model.clsr_name}" 教室, 新增成功！`,
                                                        type: "success"
                                                });
                                        }else{
                                                await this.updateRoom(Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: `"${ this.edit.model.clsr_name}" 教室, 修改成功！`,
                                                        type: "success"
                                                });
                                        }
                                        this.edit.isEdit = false;            //关闭编辑对话框
                                });
                        },
	        },
                async created(){ this.init(); },
        };
</script>

<style lang="stylus" rel="text/stylus" scoped>
	.tipsColor
		display: flex
		.free
			width: 20px
			height: 20px
			margin-left: 20px
			background-color: #67C23A
		.using
			width: 20px
			height: 20px
			margin-left: 20px
			background-color: #E6A23C
	.el-col
		margin-top: 30px
		.el-card.occupy
			background-color: #E6A23C
		.el-card
			text-align: center
			padding: 10% 0
			background-color: #67C23A
			color: #fff
			font-size: 20px
			cursor: pointer
			position: relative
			&.btn-add
				background-color: #fff
				color: #000
			.button-wrapper
				position: absolute
				right: 10px
				buttom: 0
				.el-button
					font-size: 22px
					color #fff
	.btn-add
		font-size: 22px
</style>