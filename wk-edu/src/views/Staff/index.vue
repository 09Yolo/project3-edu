<template>
	<el-container>
		<el-header>
			<el-form :inline="true">
				<el-form-item label="员工名字：">
					<el-input clearable v-model.trim="search.stf_name"
					          placeholder="请输入搜索内容"
					           prefix-icon="el-icon-search"
					          @change="getStaff()"></el-input>
				</el-form-item>
				<el-form-item label="员工类型：">
					<el-select  v-model="search.stf_category" @change="getStaff()">
						<el-option label="-所有类型-" :value="0"></el-option>
						<el-option
							v-for="dictionary in getGroupByKey('staff_category')"
							:key="dictionary.dic_id"
							:label="dictionary.dic_name"
							:value="dictionary.dic_id">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div>
				<el-button type="success" icon="el-icon-plus" @click="beginAdd">新增</el-button>
			</div>
		</el-header>
		<el-main>
			<el-table :data="staffList" stripe border style="width: 100%">
				<el-table-column type="index"  label="#"  align="center"></el-table-column>
				<el-table-column  label="姓名" prop="stf_name" width="100"></el-table-column>
				<el-table-column  label="职务类型"  width="120" align="center">
					<template slot-scope="{ row }">
						<span v-text="getGroupByKey('staff_category').find(item => item.dic_id === row.stf_category).dic_name"></span>
					</template>
				</el-table-column>
				<el-table-column  label="备注"  width="500">
					<template slot-scope="{ row }">
						<span v-if=" row.stf_remark !== '' && row.stf_remark !== null " v-text="row.stf_remark"></span>
						<span v-else class="no-remarks">-暂无相关备注-</span>
					</template>
				</el-table-column>
				<el-table-column  label="员工状态"  width="150" align="center">
					<template slot-scope="{ row }">
						<span v-if="row.stf_invalid === 1">在职</span>
						<span v-else class="leave">离职</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="200" align="center">
					<template slot-scope="{ row }">
						<el-button type="primary" size="mini" @click="beginUpdate(row)" icon="el-icon-edit-outline">编辑</el-button>
						<el-button size="mini" type="danger" @click="leaveOffice(row)" icon="el-icon-s-release" v-if="row.stf_invalid">离职</el-button>
						<el-button size="mini" type="warning" icon="el-icon-s-order"  @click="induction(row)"  v-else>入职</el-button>
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
				@size-change="getStaff()"
				@current-change="getStaff(false)"
				>
			</el-pagination>
		</el-footer>
		<el-dialog :visible.sync="edit.isEdit" :show-close="false" :modal="false" width="600px">
			<h3 slot="title" v-text="`员工维护 -${ edit.mode ? '新增': '修改'}`"></h3>
			<el-form :model="edit.model" label-width="100px" :rules="edit.rules" ref="form">
				<el-form-item label="员工名字：" prop="stf_name">
					<el-input v-model.trim="edit.model.stf_name"
					          placeholder="-请输入员工名字-" ></el-input>
				</el-form-item>
				<el-form-item label="员工类型：" prop="stf_category">
					<el-select v-model="edit.model.stf_category" placeholder="-请选择员工类型-">
						<el-option
							v-for="dictionary in getGroupByKey('staff_category')"
							:key="dictionary.dic_id"
							:label="dictionary.dic_name"
							:value="dictionary.dic_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="员工备注：">
					<el-input
						type="textarea"
						:autosize="{ minRows: 2, maxRows: 4}"
						placeholder="请输入员工备注.."
						v-model="edit.model.stf_remark">
					</el-input>
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
        let { mapActions, mapGetters } = createNamespacedHelpers("dictionary");
        export default {
                name: "Staff",
	        data() {
                        return {
                                staffList: [],
	                        search: {
                                        stf_name: "",
		                        stf_category: 0,
	                        },
                                pagination: {
                                        total: 0,
                                        pageSize: 6,
                                        currentPage: 1,
                                },
	                        edit: {
                                        isEdit: false,
                                        mode: true,
                                        model: { stf_name: "", stf_category:null, stf_id: null, stf_remark: "", stf_invalid: 1},
		                        rules: {
                                                stf_name: [
	                                                {
                                                                validator:(rule, value, callback) =>{
                                                                        let { stf_name} = this.edit.model;
                                                                        if( value.length === 0)
                                                                                callback(new Error('* 名字不能为空'));
                                                                        else if(!/^[\u4e00-\u9fa5]{2,6}$/.test(value) ) {
                                                                                callback( new Error('* 请输入2-6位中文'));
                                                                        }
                                                                        else
                                                                                callback()              //直接调用callback不给参数，表示通过验证
                                                                },
                                                                trigger:"blur"
	                                                }
                                                ],
                                                stf_category: [
                                                        {
                                                                validator: (rule, value, callback) =>{
                                                                        if(this.edit.mode &&  value === "")
                                                                                callback(new Error('* 员工类型不能为空！'));
                                                                        else
                                                                                callback();
                                                                },
                                                                trigger: 'blur'
                                                        },
                                                ]
		                        }
	                        },
		        }
	        },
                computed: {
                        ...mapGetters(["getGroupByKey"]),
                },
	        methods: {
                        ...mapActions({"dicInit": "init"}),
                        async getStaff(fromPage1 = true) {
                                if(fromPage1) this.pagination.currentPage = 1;
                                let { list, total } = await this.$http({
	                                url: "staff/list",
	                                method: "post",
	                                data: {
		                                ...this.search,
                                                begin: this.pagination.pageSize*(this.pagination.currentPage -1),
                                                pageSize: this.pagination.pageSize
	                                }
                                });
                                this.staffList = list;
                                this.pagination.total = total;
                        },
		        //离职
                        leaveOffice(staff) {
				this.$confirm(`确定要 “${staff.stf_name}”离职吗？`, '提示', {type: 'warning'})
					.then(async() => {
					        await this.$http({ url: "/staff/dimission/" + staff.stf_id});
					        this.staffList.find(item => {
					                if(item.stf_id === staff.stf_id) item.stf_invalid = 0;
					        });
					        this.$message({message: `用户：“${staff.stf_name}”，离职成功！`,  type: 'success'})
					})
					.catch(() => {})
                        },
		        //入职
                        induction(staff) {
                                this.$confirm(`确定要 “${staff.stf_name}”入职吗？`, '提示', {type: 'warning'})
                                        .then(async() => {
                                                await this.$http({ url: "/staff/reinstate/" + staff.stf_id});
                                                this.staffList.find(item => {
                                                        if(item.stf_id === staff.stf_id) item.stf_invalid = 1;
                                                });
                                                this.$message({message: `用户：“${staff.stf_name}”，入职成功！`,  type: 'success'})
                                        })
	                                .catch(() => {})
                        },
		        //新增
                        beginAdd(){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.stf_name = '';
                                this.edit.model.stf_remark = '';
                                this.edit.model.stf_category = null;
                                this.edit.mode = true;
                                this.edit.isEdit = true;
                        },
		        //修改
                        beginUpdate(node){
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.stf_name =  node. stf_name;
                                this.edit.model.stf_category =  node. stf_category;
                                this.edit.model.stf_remark =  node. stf_remark;
                                this.edit.model.stf_id = node. stf_id;
                                this.edit.mode = false;
                                this.edit.isEdit = true;
                        },
                         save(){
                                this.$refs.form.validate(async valid => {
                                        if(!valid) return;
                                        if(this.edit.mode){
                                                this.edit.model.stf_id = await this.$http({
                                                        method: "post",
                                                        url: "staff/add",
                                                        data:this.edit.model
                                                });
                                               this.staffList.length !== this.pagination.pageSize && this.staffList.push(Object.assign({}, this.edit.model));
                                               this.pagination.total ++;
                                                this.$message({
                                                        message: "新增成功",
                                                        type: 'success'
                                                });
                                        }else{
                                                await this.$http({
                                                        method: 'post',
                                                        url: '/staff/update',
                                                        data: this.edit.model
                                                });
                                                let i = this.staffList.findIndex(item => item.stf_id === this.edit.model.stf_id);
                                                this.staffList.splice(i, 1, Object.assign({}, this.edit.model));
                                                this.$message({
                                                        message: "修改成功",
                                                        type: 'success'
                                                });
                                        }
                                        this.edit.isEdit = false;
                                })

                        },
	        },
                async created(){
                        this.getStaff();
                },
        };
</script>

<style lang="stylus" type="text/stylus" scoped>
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
			span.no-remarks
				color: #b0b0b0
			span.leave
				color red
		.el-footer
			display: flex
			align-items: center
			.el-pagination
				flex-grow: 1
</style>