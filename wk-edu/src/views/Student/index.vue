<template>
	<el-container>
		<el-header>
			<el-form inline>
				<el-form-item label="学生名字">
					<el-input clearable placeholder="请输入搜索内容"
					prefix-icon="el-icon-search"
					v-model.trim="search.stu_name"
					@change="getStudent()"></el-input>
				</el-form-item>
				<el-form-item label="所在班级">
					<el-select v-model="search.stu_cls_id" @change="getStudent()">
						<el-option label="-全部-" :value="0"></el-option>
						<el-option
							v-for="item in classAll"
							:key="item.cls_id"
							:label="item.cls_name"
							:value="item.cls_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="学生学历">
					<el-select v-model="search.stu_qualification" @change="getStudent()">
						<el-option label="-全部-" :value="0"></el-option>
						<el-option
							v-for="dictionary in getGroupByKey('qualification')"
							:key="dictionary.dic_id"
							:label="dictionary.dic_name"
							:value="dictionary.dic_id"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div class="butt">
				<el-button type="success" icon="el-icon-plus" size="small" @click="beginAdd">新增</el-button>
				<el-button type="primary" icon="el-icon-share" size="small" @click="batchClass()">批量分班</el-button>
				<el-button type="danger" icon="el-icon-download" size="small">导出学生信息</el-button>
			</div>
		</el-header>
		<el-main>
			<el-table :data="studentList" stripe border style="width: 100%"  @selection-change="handleSelectionChange">
				<el-table-column type="index" label="#" algin="center" fixed="left"></el-table-column>
				<el-table-column type="selection" fixed="left" align="center" ></el-table-column>
				<el-table-column label="学生姓名" fixed="left"width="100" align="center" prop="stu_name"></el-table-column>
				<el-table-column label="班级" width="100" align="center">
					<template slot-scope="{ row }">
						<span v-if="row.stu_cls_id !== null  " v-text="classAll.find(item => item.cls_id === row.stu_cls_id).cls_name"></span>
						<span v-else class="no-cla">无班级</span>
					</template>
				</el-table-column>
				<el-table-column label="存档照片" width="100" align="center" >
					<template slot-scope="{ row }">
						<el-popover  placement="right"  width="200"
						 :title="row.stu_name"  trigger="click"
						 v-if="row.stu_avatar !== null && row.stu_avatar !== ''">
							<el-image
								style="width: 200px; height: 200px"
								:src="row.stu_avatar">
								</el-image>
								<el-button type="text" slot="reference">预览</el-button>
							</el-popover>
						<span v-else class="no-remarks">暂无照片</span>
					</template>
				</el-table-column>
				<el-table-column label="性别" width="100" align="center">
					<template slot-scope="{ row }">
						<span v-if="row.stu_sex === 1">男</span>
						<span v-if="row.stu_sex === 0">女</span>
					</template>
				</el-table-column>
				<el-table-column label="联系电话"width="150" align="center" prop="stu_phone"></el-table-column>
				<el-table-column label="联系电话（备用）"width="150" align="center" prop="stu_phone2"></el-table-column>
				<el-table-column label="出生日期"width="150" align="center" prop="stu_born"></el-table-column>
				<el-table-column label="学历" width="100"  align="center">
					<template slot-scope="{ row }">
						<span v-text="getGroupByKey('qualification').find(item => item.dic_id === row.stu_qualification).dic_name"></span>
					</template>
				</el-table-column>
				<el-table-column label="毕业院校"width="100" prop="stu_school" align="center"></el-table-column>
				<el-table-column label="院校专业"width="150" prop="stu_major"></el-table-column>
				<el-table-column label="家庭住址" width="200" prop="stu_address"></el-table-column>
				<el-table-column label="备注" width="300">
					<template slot-scope="{ row }">
						<span v-if="row.stu_remark !== '' && row.stu_remark !== null" v-text="row.stu_remark"></span>
						<span v-else class="no-remarks">-暂无相关备注-</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" fixed="right" width="300">
					<template slot-scope="{ row }">
						<el-button type="primary" icon="el-icon-share" size="mini" @click="distribute(row)">分班</el-button>
						<el-button size="mini" type="danger" @click="" icon="el-icon-s-release" @click="beginArchive(row)">照片存档</el-button>
						<el-button type="warning" size="mini" @click="" icon="el-icon-edit-outline" @click="beginUpdate(row)">编辑</el-button>
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
				@size-change="getStudent()"
				@current-change="getStudent(false)"
			></el-pagination>
		</el-footer>
		<el-dialog :visible.sync="edit.isEdit" :show-close="false" :modal="false">
			<h3 slot="title" v-text="`学生维护-${ edit.mode ? '新增' : '修改'}`"></h3>
			<el-form :model="edit.model" label-width="120px" :rules="edit.rules" ref="form" status-icon>
				<el-form-item label="学生姓名：" prop="stu_name">
					<el-input v-model.trim="edit.model.stu_name"
					placeholder="请输入学生姓名"></el-input>
				</el-form-item>
				<el-form-item  label="性别：">
					<el-radio v-model="edit.model.stu_sex" :label="1">男</el-radio>
					<el-radio v-model="edit.model.stu_sex" :label="0">女</el-radio>
				</el-form-item>
				<el-form-item label="联系电话："prop="stu_phone">
					<el-input v-model.trim="edit.model.stu_phone"
					placeholder="请输入手机号" maxlength="11" show-word-limit></el-input>
				</el-form-item>
				<el-form-item label="备用电话：" prop="stu_phone2">
					<el-input v-model.trim="edit.model.stu_phone2"
					          placeholder="请输入备用联系电话（手机号/座机号）">
						<template slot="append">例如：028-88888888</template>
					</el-input>
				</el-form-item>
				<el-form-item label="出生日期：" prop="stu_born">
					<el-col :span="12">
						<el-date-picker type="date" placeholder="请选择出生日期"
						                v-model="edit.model.stu_born" style="width: 100%;"
						                value-format="yyyy-MM-dd"></el-date-picker>
					</el-col>
				</el-form-item>
				<el-form-item label="学历：" prop="stu_qualification">
					<el-select v-model="edit.model.stu_qualification" placeholder="请选择学生学历">
						<el-option
							v-for="dictionary in getGroupByKey('qualification')"
							:key="dictionary.dic_id"
							:label="dictionary.dic_name"
							:value="dictionary.dic_id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="在读/毕业院校：">
					<el-input v-model.trim="edit.model.stu_school"
					          placeholder="请输入在读/毕业院校（选填）"></el-input>
				</el-form-item>
				<el-form-item label="在校学习专业：">
					<el-input v-model.trim="edit.model.stu_major"
					          placeholder="请输入在校学习专业（选填）"></el-input>
				</el-form-item>
				<el-form-item label="家庭住址：" prop="stu_address">
					<el-input v-model.trim="edit.model.stu_address"
					          placeholder="请输入家庭住址）"></el-input>
				</el-form-item>
				<el-form-item label="学生备注：">
					<el-input
						type="textarea"
						:autosize="{ minRows: 4, maxRows: 6}"
						placeholder="请输入学生备注.."
						v-model="edit.model.stu_remark">
					</el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="edit.isEdit = false">取 消</el-button>
				<el-button type="primary" @click="save">保存</el-button>
			</div>
		</el-dialog>
		<el-dialog :visible.sync="isDivide" :show-close="false" :modal="false" >
			<h3 slot="title">分班</h3>
			<el-form :model="division" :rules="edit.rules"  ref="forms" status-icon>

				<el-form-item label="班级" prop="stu_cls_id">
					<el-select v-model="division.stu_cls_id" placeholder="请选择班级">
						<el-option
							v-for="item in classAll"
							:key="item.cls_id"
							:label="item.cls_name"
							:value="item.cls_id"
							:disabled="item.cls_begin !== null && item.cls_end !== null">
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="isDivide = false">取 消</el-button>
				<el-button type="primary" @click="classDivision">保存</el-button>
			</div>
		</el-dialog>
		<el-dialog :visible.sync="isStorage" :show-close="false" :modal="false" width="800px">
			<h3 slot="title">照片存档</h3>
				<div class="avatar-wrapper">
					<p>个人照片：</p>
					<div class="avatar-wrapper-old"
					     v-if="upload.model.stu_avatar_old !== null && upload.model.stu_avatar_old !== ''">
						<el-image :src="upload.model.stu_avatar_old"
						 style="width: 148px; height: 148px"></el-image>
						<p>学生当前存档照片</p>
					</div>
					<div class="seperator"  v-if="upload.model.stu_avatar_old !== null && upload.model.stu_avatar_old !== ''"></div>
					<div class="avatar-wrapper-new">
						<el-upload accept=".jpg,.png"
						           ref="upload"
						           list-type="picture-card"
						           action="/student/avatarupload"
						           name="avatar"
						           :headers="uploadHeaders"
						           :before-upload="beforeAvatarUpload"
						           :on-success="avatarUploadSuccess"
						           :on-remove="avatarRemove">
							<i class="el-icon-plus"></i>
							<p slot="tip" class="tip">只能上传jpg或png文件，且大小不超过2MB</p>
						</el-upload>
					</div>
				</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" :disabled="upload.model.stu_avatar_new === ''" @click="aaa">确定</el-button>
				<el-button @click="isStorage = false">取 消</el-button>
			</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
        import { createNamespacedHelpers } from 'vuex';
        let { mapActions, mapGetters } = createNamespacedHelpers("dictionary");
        export default {
                name: "Student",
	        data(){
                        return{
                               studentList: [],                  //学生
	                       classAll: [],                        //班级
	                        isDivide: false,                //分班弹窗
	                        isStorage: false,                 //照片存档弹窗
                               search: {
                                     stu_name: "",
	                             stu_cls_id: 0,
                                     stu_qualification: 0
                               },           // 查找
                                pagination: {
                                        total: 0,
                                        pageSize: 6,
                                        currentPage: 1,
                                },                      //分页
                                division: {stu_id: null, stu_ids: [], stu_cls_id: null},               //分班
	                        edit: {
                                       isEdit: false,
		                        mode: true,
                                        isMan: true,
		                        model: {
						stu_name: "",
				                stu_cls_id: null,
                                                stu_avatar: null,
			                        stu_sex: 1,
			                        stu_phone: "",
			                        stu_phone2: "",
			                        stu_born: "",
                                                stu_qualification: null,
			                        stu_school: "",
			                        stu_major: "",
			                        stu_address: "",
			                        stu_remark: ""
		                        },              //新增修改
		                        rules: {
                                               stu_name: [
                                                       { required: true, message: '请输入学生姓名', trigger: 'blur' },
                                                       { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
                                               ],
                                                stu_phone: [  {
                                                        validator: async (rule, value, callback) =>{
                                                                if( value.length === 0)
                                                                        callback(new Error('* 手机号不能为空'));
                                                                else if(!(/^1[34578]\d{9}$/.test(value)) ) {
                                                                        callback( new Error('* 请输入正确手机号'));
                                                                }
                                                                else if( await this.$http({ method: "post", url: "/student/valid_phone", data: {stu_phone: value} })) {
                                                                        callback(new Error('* 手机号存在'));
                                                                }
                                                                else
                                                                        callback()
                                                        },
                                                        trigger:"blur"
                                                }],
                                                stu_phone2: [{
                                                        validator: (rule, value, callback) =>{
                                                                if( value.length === 0)
                                                                        callback(new Error('* 手机号不能为空'));
                                                                else if(!(/^1[34578]\d{9}$/.test(value)) ) {
                                                                        callback( new Error('* 请输入正确手机号'));
                                                                }
                                                                else
                                                                        callback()
                                                        },
                                                        trigger:"blur"
                                                }],
                                                stu_born: [{ required: true, required: true, message: '请选择出生日期', trigger: 'change' }],
                                                stu_qualification: [{ required: true, required: true, message: '请选择学历', trigger: 'change' }],
                                                stu_address: [ { required: true, message: '请输入家庭地址', trigger: 'blur' },
                                                        { min: 3, max: 100, message: '地址不符合规范', trigger: 'blur' }],
			                        stu_cls_id: [{required: true, message: '请选择班级', trigger: 'change'}]
		                        }
	                        },
                                uploadHeaders: {"Authorization": sessionStorage.getItem("token")},
                                upload: {
                                        isUpload: false,
                                        model: {
                                                stu_id: null,
                                                stu_avatar_old: null,
                                                stu_avatar_new: "",
                                        }
                                },
                        };
	        },
                computed: {
                        ...mapGetters(["getGroupByKey"]),
                },
	        methods: {
                        ...mapActions({"dicInit": "init"}),
	               async getStudent(fromPage1 = true) {
	                       if(fromPage1) this.pagination.currentPage = 1;
	                       let{ list, total} = await this.$http({
					method: "post",
		                       url: "student/list",
		                       data: {
			                       ...this.search,
                                               begin: this.pagination.pageSize*(this.pagination.currentPage -1),
                                               pageSize: this.pagination.pageSize
		                       }
		                });
	                       this.studentList = list;
	                       this.pagination.total = total;
	                },
		        beginAdd() {
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.stu_name = "";
                                this.edit.model.stu_avatar = "";
                                this.edit.model.stu_sex = 1;
                                this.edit.model.stu_cls_id = null;
                                this.edit.model. stu_phone = "";
                                this.edit.model. stu_phone2 = "";
                                this.edit.model.stu_born = "";
                                this.edit.model.stu_qualification = null;
                                this.edit.model.stu_school = "";
                                this.edit.model.stu_major = "";
                                this.edit.model.stu_address = "";
                                this.edit.model.stu_remark = "";
                                this.edit.mode = true;
                                this.edit.isEdit = true;
		        },
		        beginUpdate(node) {
                                this.$refs.form && this.$refs.form.resetFields();
                                this.edit.model.stu_id = node.stu_id;
                                this.edit.model.stu_name = node.stu_name;
                                this.edit.model.stu_avatar = node.stu_avatar;
                                this.edit.model.stu_sex = node.stu_sex;
                                this.edit.model.stu_cls_id = node.stu_cls_id;
                                this.edit.model. stu_phone = node.stu_phone;
                                this.edit.model. stu_phone2 = node.stu_phone2;
                                this.edit.model.stu_born = node.stu_born;
                                this.edit.model.stu_qualification = node.stu_qualification;
                                this.edit.model.stu_school = node.stu_school;
                                this.edit.model.stu_major = node.stu_major;
                                this.edit.model.stu_address = node.stu_address;
                                this.edit.model.stu_remark = node.stu_remark;
                                this.edit.mode = false;
                                this.edit.isEdit = true;
		        },
		       save() {
                               this.$refs.form.validate(async valid =>{
                                       if(!valid) return;
                                       if(this.edit.mode){
                                               await this.$http({
                                                       method: "post",
                                                       url: "student/add",
                                                       data: this.edit.model
                                               });
                                               this.studentList.length !== this.pagination.pageSize && this.studentList.push(Object.assign({}, this.edit.model));
                                               this.pagination.total++;
                                               this.$message({
                                                       message: "新增成功",
                                                       type: 'success'
                                               });
                                       }else{
                                               await this.$http({
                                                       method: "post",
                                                       url: "student/update",
                                                       data: this.edit.model
                                               });
                                               let i = this.studentList.findIndex(item => item.stu_id === this.edit.model.stu_id);
                                               this.studentList.splice(i, 1, Object.assign({}, this.edit.model));
                                               this.$message({
                                                       message: "修改成功",
                                                       type: 'success'
                                               });
                                       }
                                       this.edit.isEdit = false;
                               })
		        },

                        handleSelectionChange(val) {
                               this.division.stu_ids = [];
                               val.forEach(item => {
                                       this.division.stu_ids.push(item.stu_id)
                               });
                        },
		        //分班
                       distribute(data) {
                               this.$refs.forms && this.$refs.forms.resetFields();  //重置表单验证
                               this.division.stu_id = data.stu_id;
                               this.division.stu_cls_id = data.stu_cls_id;
				this.isDivide = true;
                        },
			//批量分班
                        batchClass() {
                                this.$refs.forms && this.$refs.forms.resetFields();  //重置表单验证
                                if(this.division.stu_ids && this.division.stu_ids.length < 1)
                                        this.$confirm("请先勾选要分班的学生", '警告', {type: 'warning'});
                                else
                                        this.isDivide = true;


                        },
                        classDivision() {
                               this.$refs.forms.validate(async valid =>{
                                       if(!valid) return;
                                       await this.$http({
                                               method: "post",
                                               url: "student/assignclass",
                                               data: this.division
                                       });
                                       if(this.division.stu_id)this.studentList.find(item => item.stu_id === this.division.stu_id).stu_cls_id = this.division.stu_cls_id;
                                       else this.division.stu_ids.forEach(item =>{
                                               this.studentList.find(item1 => item1.stu_id === item).stu_cls_id = this.division.stu_cls_id});
                                       this.$message({
                                               message: `分班成功`,
                                               type: 'success'
                                       });
                                       this.isDivide = false;
                               })

                        },
		        //照片存档
                        beginArchive(node) {
                                this.isStorage = true;
                                this.upload.model.stu_id = node.stu_id;
                                this.upload.model.stu_avatar_new = "";
                                if(node.stu_avatar !== null && node.stu_avatar !== "")
                                this.upload.model.stu_avatar_old = node.stu_avatar;
                                else{this.upload.model.stu_avatar_old = null}
                        },
                        beforeAvatarUpload(file) {
                                const isJPG = file.type === 'image/jpeg';
                                const isPNG = file.type === 'image/png';
                                const isLt2M = file.size / 1024 / 1024 < 2;

                                if ((!isJPG) && (!isPNG)) {
                                        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!');
                                }
                                if (!isLt2M) {
                                        this.$message.error('上传头像图片大小不能超过 2MB!');
                                }
                                return (isJPG || isPNG) && isLt2M;
                        },
                        avatarUploadSuccess({status, data, message }, file, fileList) {
                                switch(status) {
                                        case 200:
                                                this.upload.model.stu_avatar_new = data;
                                                if(fileList.length > 1) fileList.shift();
                                                break;
                                        case 401:

                                        case 404:
                                        case 199:
                                        case 500:
                                                this.$message.error(message);
                                }
                        },
                        avatarRemove(file, fileList) {
                                this.upload.model.stu_avatar_new = "";
                        },
                        async aaa() {
                                await this.$http({
                                        method: "post",
                                        url: "/student/avatarupdate",
                                        data: this.upload.model
                                });
                                this.studentList.find(item=>
	                         item.stu_id === this.upload.model.stu_id)
	                         .stu_avatar ="/images/student/"+ this.upload.model.stu_avatar_new;
                                this.$message.success("头像上传更新成功！");     //提示用户上传成功
                                this.upload.isUpload = false;           //关闭上传头像对话框
                                this.$refs.upload.clearFiles();               //重置上传控件，为下一次做准备
                                this.isStorage = false;
                        },
	        },
	         created(){
	             let p1 = this.$http({ url: "class/all"}).then(list => this.classAll = list);
	             let p2 = this. $http({
                             method: "post",
                             url: "student/list",
                             data: {
                                     ...this.search,
                                     begin: this.pagination.pageSize*(this.pagination.currentPage -1),
                                     pageSize: this.pagination.pageSize
                             }
	             });
                         Promise.all([p1,p2])
                                 .then(([classAll, studentList]) => {
                                         this.classAll = classAll;
                                         this.studentList = studentList.list;
                                         this.pagination.total = studentList.total;
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
			.el-form
				flex-shrink: 0
			.butt
				flex-shrink: 0
		.el-main
			border-top: 1px solid #b0b0b0
			border-bottom: 1px solid #b0b0b0
			span.no-cla
				color: #b0b0b0
			span.no-remarks
				color: #b0b0b0
		.avatar-wrapper
			display: flex
			.seperator
				border-right: 2px solid #ccc
				margin: 0 40px
			p.tip
				color: red
</style>