<template>
	<el-container>
		<el-header>
			<el-form inline>
				<el-form-item label="班级名称：">
					<el-input clearable placeholder="请输入搜索内容"
					prefix-icon="el-icon-search"
					v-model.trim="search.cls_name"
					@change="getClass()"></el-input>
				</el-form-item>
				<el-form-item label="班级专业：">
				<el-select  v-model="search.cls_dic_id_major" @change="getClass()">
					<el-option label="-所有专业-" :value="0"></el-option>
						<el-option
							v-for="dictionary in getGroupByKey('class_major')"
							:key="dictionary.dic_id"
							:label="dictionary.dic_name"
							:value="dictionary.dic_id"></el-option>
				</el-select>
			</el-form-item>
				<el-form-item label="班级状态：">
					<el-select v-model="search.cls_status" @change="getClass()">
						<el-option label="-所有-" :value="0"></el-option>
						<el-option label="开课中" :value="1"></el-option>
						<el-option label="未开课" :value="2"></el-option>
						<el-option label="已结课" :value="3"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div>
				<el-button type="success" icon="el-icon-plus" @click="beginAdd">新增</el-button>
			</div>
		</el-header>
		<el-main>
			<el-table :data="classinfo" stripe border style="width: 100%">
				<el-table-column type="index" label="#" align="center"></el-table-column>
				<el-table-column label="班级名称" width="150" prop="cls_name"></el-table-column>
				<el-table-column label="班级专业" width="150">
					<template slot-scope="{ row }">
						<span v-text="getGroupByKey('class_major').find(item => item.dic_id === row.cls_dic_id_major).dic_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教学老师" align="center" width="120">
					<template slot-scope="{ row }">
						<span v-text="staffTeacher.find(item => item.stf_id === row.cls_stf_id_teacher).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教务老师" align="center" width="120">
					<template slot-scope="{ row }">
						<span v-text="staffAdmin.find(item => item.stf_id === row.cls_stf_id_admin).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="就业老师" align="center" width="120">
					<template slot-scope="{ row }">
						<span v-text="staffJob.find(item => item.stf_id === row.cls_stf_id_job).stf_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="教室" width="100">
					<template slot-scope="{ row }">
						<span v-text=" row.cls_clsr_id ? classrooms.find(item => item.clsr_id === row.cls_clsr_id).clsr_name : '' "></span>
					</template>
				</el-table-column>
				<el-table-column label="开课时间" align="center" width="120" prop="cls_begin"></el-table-column>
				<el-table-column label="结课时间" align="center" width="120" prop="cls_end"></el-table-column>
				<el-table-column label="班级状态" align="center" width="100">
					<template slot-scope="{ row }">
						<span class="noClass" v-if="row.cls_begin === null && row.cls_end === null">未开课</span>
						<span class="startClass" v-else-if="row.cls_begin !== null && row.cls_end === null " >开课中</span>
						<span class="classEnding" v-else="row.cls_end !== null && row.cls_begin !== null">已结课</span>
					</template>
				</el-table-column>
				<el-table-column label="备注" width="300">
					<template slot-scope="{ row }">
						<span v-if="row.cls_remark !== '' && row.cls_remark !== null" v-text="row.cls_remark"></span>
						<span v-else class="no-remarks">-暂无相关备注-</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="200" >
					<template slot-scope="{ row }">
						<el-button type="primary" size="mini" icon="el-icon-edit-outline" @click="beginUpdate(row)">修改</el-button>
						<el-button size="mini" type="success"
						           v-if="row.cls_begin === null && row.cls_end === null " @click="beginClass(row)">开课</el-button>
						<el-button size="mini" type="danger"
						           v-if="row.cls_end === null && row.cls_begin !== null" @click="classEnding(row)">结课</el-button>
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
				@size-change="getClass()"
				@current-change="getClass(false)"
			></el-pagination>
		</el-footer>
		<el-dialog :visible.sync="edit.isEdit" :show-close="false" :modal="false">
			<h3 slot="title" v-text="`班级维护 -${ edit.mode ? '新增': '修改'}`"></h3>
			<el-form :model="edit.model" label-width="100px" :rules="edit.rules" ref="form" >
				<el-form-item label="班级名称" prop="cls_name">
					<el-input v-model.trim="edit.model.cls_name"
					placeholder="-请输入班级名称-"></el-input>
				</el-form-item>
				<el-form-item label="班级专业" prop="cls_dic_id_major">
					<el-select v-model="edit.model.cls_dic_id_major" placeholder="-请选择专业-">
						<el-option
							v-for="dictionary in getGroupByKey('class_major')"
							:key="dictionary.dic_id"
							:label="dictionary.dic_name"
							:value="dictionary.dic_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教学老师" prop="cls_stf_id_teacher">
					<el-select v-model="edit.model.cls_stf_id_teacher" placeholder="-请选择-">
						<el-option
							v-for="item in staffTeacher"
							:key="item.stf_id"
							:label="item.stf_name"
							:value="item.stf_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教务老师" prop="cls_stf_id_admin">
					<el-select v-model="edit.model.cls_stf_id_admin" placeholder="-请选择-">
						<el-option
							v-for="item in staffAdmin"
							:key="item.stf_id"
							:label="item.stf_name"
							:value="item.stf_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="就业老师" prop="cls_stf_id_job">
					<el-select v-model="edit.model.cls_stf_id_job" placeholder="-请选择-">
						<el-option
							v-for="item in staffJob"
							:key="item.stf_id"
							:label="item.stf_name"
							:value="item.stf_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级备注：">
					<el-input
						type="textarea"
						:autosize="{ minRows: 4, maxRows: 6}"
						placeholder="请输入班级备注.."
						v-model="edit.model.cls_remark">
					</el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="edit.isEdit = false">取 消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</el-dialog>
		<el-dialog :visible.sync="start" :show-close="false" :modal="false" >
			<h3 slot="title">开班</h3>
			<el-form :rules="edit.rules"  ref="forms" :model="edit.model">
				<el-form-item label="教室" prop="cls_clsr_id">
					<el-select v-model="edit.model.cls_clsr_id" placeholder="请选择">
						<el-option
							v-for="item in classrooms"
							:key="item.clsr_id"
							:label="item.clsr_name"
							:value="item.clsr_id"
							:disabled="item.clsr_occupy === 1">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="start = false">取 消</el-button>
				<el-button type="primary" @click="classStart">保存</el-button>
			</div>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import { createNamespacedHelpers } from 'vuex';
	let {  mapGetters} = createNamespacedHelpers("dictionary");
	let { mapState: mapStateClassroom} = createNamespacedHelpers("classroom");
        export default {
                name: "Class",
	        data(){
                        return{
			classinfo: [],
	                start: false,                   //开课弹窗
	                staffTeacher: [],              //教学老师
	                staffAdmin: [],                 //教务老师
	                staffJob: [],                           //就业老师
	                search: {
			        cls_name: "",
                                cls_dic_id_major: 0,
                                cls_status: 0
	                        },
	                pagination: {
			        total: 0,
		                pageSize: 6,
                                currentPage: 1,
	                        },
	                edit: {
			        isEdit: false,
		                mode: true,
		                model: {
			                cls_name: "",
			                cls_dic_id_major: null,
			                cls_clsr_id: null,
			                cls_stf_id_teacher: null,
                                        cls_stf_id_admin: null,
                                        cls_stf_id_job: null,
                                        cls_begin: null,
                                        cls_end: null,
                                        cls_remark: ""
		                },
		                rules: {
			              cls_name: [{
                                                validator: async (rule, value, callback) =>{
                                                        if(!this.edit.mode) {
                                                                callback();
                                                        }
                                                        if( value.length === 0)
                                                                callback(new Error('* 名字不能为空'));
                                                        else if( value.length < 2 || value.length > 20)
                                                                callback( new Error('* 班级名称长度2 - 20'));
                                                        else if( await this.$http({ method: "post", url: "/class/valid_name", data: {cls_name: value} })) {
                                                                callback(new Error('* 班级名存在'));
                                                        }
                                                        else
                                                                callback()

                                                },
                                                trigger:"blur"
			                }],
			              cls_dic_id_major: [
				              {required: true, message: '请选择班级专业', trigger: 'change'}
			              ],
                                      cls_stf_id_teacher: [
                                              {required: true, message: '请选择教学老师', trigger: 'change'}
                                      ],
                                      cls_stf_id_admin: [
                                                {required: true, message: '请选择教务老师', trigger: 'change'}
                                        ],
                                      cls_stf_id_job: [
                                                {required: true, message: '请选择就业老师', trigger: 'change'}
                                        ],
                                      cls_clsr_id: [
                                                {required: true, message: '请选择教室', trigger: 'change'}
                                        ]
		                },
	                        },
                        }
	        },
	computed: {
		...mapGetters(["getGroupByKey"]),
                ...mapStateClassroom({'classrooms': 'list'}),
	},
	        methods: {
		        //查找
		        async getClass(fromPage1 = true) {
                                if(fromPage1) this.pagination.currentPage = 1;
                                let { list, total } = await this.$http({
	                                url: "class/list",
	                                method: "post",
	                                data: {
		                                ...this.search,
                                                begin: this.pagination.pageSize*(this.pagination.currentPage -1),
                                                pageSize: this.pagination.pageSize
	                                }
                                });
                                this.classinfo = list;
                                this.pagination.total = total;
		        },
		        //新增
		        beginAdd(){
                                this.$refs.form && this.$refs.form.resetFields();  //重置表单验证
		             this.edit.model.cls_name = "";
		             this.edit.model.cls_remark = "";
                             this.edit.model.cls_dic_id_major = null;
                             this.edit.model.cls_stf_id_teacher = null;
                             this.edit.model.cls_stf_id_admin = null;
                             this.edit.model.cls_stf_id_job = null;
                             this.edit.model.cls_clsr_id = null;
                                this.edit.model.cls_begin = null;
                                this.edit.model.cls_end = null;
                             this.edit.mode = true;
                             this.edit.isEdit = true;
		        },
		        //修改
		        beginUpdate(node) {
                                this.$refs.form && this.$refs.form.resetFields();  //重置表单验证
                                this.edit.mode = false;
		                this.edit.model.cls_name = node.cls_name;
		                this.edit.model.cls_dic_id_major = node.cls_dic_id_major;
                                this.edit.model.cls_stf_id_teacher = node.cls_stf_id_teacher;
                                this.edit.model.cls_stf_id_admin = node.cls_stf_id_admin;
                                this.edit.model.cls_stf_id_job = node.cls_stf_id_job;
                                this.edit.model.cls_clsr_id = node.cls_clsr_id;
                                this.edit.model.cls_remark = node.cls_remark;
                                this.edit.model.cls_id = node.cls_id;
                                this.edit.model.cls_begin = node.cls_begin;
                                this.edit.model.cls_end = node.cls_end;
                                this.edit.isEdit = true;
		        },
		        save() {
                               this.$refs.form.validate(async valid =>{
                                       if(!valid) return;
                                       if(this.edit.mode){
                                               await this.$http({
                                                       method: "post",
                                                       url: "class/add",
                                                       data: this.edit.model
                                               });
                                               this.classinfo.length !== this.pagination.pageSize && this.classinfo.push(Object.assign({}, this.edit.model));
                                               this.pagination.total ++;
                                               this.$message({
                                                       message: "新增成功",
                                                       type: 'success'
                                               });
                                       }else{
                                               await this.$http({
                                                       method: "post",
                                                       url: "class/update",
                                                       data: this.edit.model
                                               });
                                               let i = this.classinfo.findIndex(item => item.cls_id === this.edit.model.cls_id);
                                               this.classinfo.splice(i, 1, Object.assign({}, this.edit.model));
                                               this.$message({
                                                       message: "修改成功",
                                                       type: 'success'
                                               });
                                       }
                                       this.edit.isEdit = false;
                               })
		        },
		        //开课操作
		        beginClass(data) {
                                this.$refs.forms && this.$refs.forms.resetFields();  //重置表单验证
                                this.$confirm(`确定要对班级 "${data.cls_name}"进行 开课 操作吗?`, '警告', {type: 'warning'})
                                        .then(async() =>{
                                                this.start = true;
                                                this.edit.model.cls_id = data.cls_id;
                                                this.edit.model.cls_clsr_id = null;
                                        })
                                        .catch(() =>{
                                        });
		        },
			 classStart(){
                                this.$refs.forms.validate(async valid =>{
                                        if(!valid) return;
                                        let time = await this.$http({
                                                method: "post",
                                                url: "class/begin",
                                                data: this.edit.model
                                        });
                                        let i = this.classinfo.findIndex(item => item.cls_id === this.edit.model.cls_id);
                                        this.classinfo[i].cls_begin = time;
                                        this.classinfo[i].cls_clsr_id = this.edit.model.cls_clsr_id;
                                        this.classrooms.find(item => item.clsr_id === this.edit.model.cls_clsr_id).clsr_occupy = 1;
                                        this.$message({
                                                message: `开课成功`,
                                                type: 'success'
                                        });
                                        this.start = false;
                                })

			},
		        //结课
                        classEnding(data) {
                                this.$confirm(`确定要对班级 "${data.cls_name}"进行 结课 操作吗?`, '警告', {type: 'warning'})
                        .then(async() =>{
                                        this.edit.model.cls_id = data.cls_id;
                                        let time = await this.$http({
                                                method: "post",
                                                url: "class/end",
                                                data:this.edit.model
                                        });
                                        let i = this.classinfo.findIndex(item => item.cls_id === this.edit.model.cls_id);
                                        this.classinfo[i].cls_end = time;
                                        this.classrooms.find(item => item.clsr_id === this.edit.model.cls_clsr_id).clsr_occupy = 0;
                                        this.$message({
                                                message: `结课成功`,
                                                type: 'success'
                                        });
                                })
                                        .catch(() =>{ });
                        },
	        },
                 created(){
                       let p1 = this.$http({ url: "/staff/listbycategory/4"});
                       let p2 = this.$http({ url: "/staff/listbycategory/5"});
                       let p3 = this.$http({ url: "/staff/listbycategory/6"});
                       let p4 = this.$http({
                               url: "class/list",
                               method: "post",
                               data: {
                                       ...this.search,
                                       begin: this.pagination.pageSize*(this.pagination.currentPage -1),
                                       pageSize: this.pagination.pageSize
                               }
                       });
                       Promise.all([p1,p2,p3,p4])
	                       .then(([staffTeacher, staffAdmin, staffJob, classinfo,]) => {
                               this.staffTeacher = staffTeacher;
                               this.staffAdmin = staffAdmin;
                               this.staffJob = staffJob;
                               this.classinfo = classinfo.list;
                               this.pagination.total = classinfo.total;
	                       })
                       .catch((error) => {console.log(error)});

                },
        };
</script>

<style lang="stylus" type="text/stylus" scoped>
	.el-container
		position: absolute
		left: 0
		top: 0
		width: 100%
		height: 100%
		.el-header
			display:flex
			justify-content: space-between
		.el-main
			border-top: 1px solid #b0b0b0
			border-bottom: 1px solid #b0b0b0
			span.noClass
				color #CCB015
			span.startClass
				color greenyellow
			span.classEnding
				color #ccc
			span.no-remarks
				color: #b0b0b0
		.el-footer
			display: flex
			align-items: center
			.el-pagination
				flex-grow: 1
</style>