<template>
	<div>
		<el-form :model="edit" label-width="100px"  :rules="edit.rules" status-icon ref="form" style="width: 400px">
			<el-form-item label="原始密码" prop="oldPwd">
				<el-input type="password" v-model.trim="edit.oldPwd"  show-password></el-input>
			</el-form-item>
			<el-form-item label="新密码" prop="newPwd">
				<el-input type="password" v-model.trim="edit.newPwd"  show-password></el-input>
			</el-form-item>
			<el-form-item label="新密码确认" prop="confirm">
				<el-input type="password" v-model.trim="edit.confirm"  show-password></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="pwdChange">确定</el-button>
			</el-form-item>
		</el-form>

	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: "ChangePwd",
	        data() {
                        return {
                                edit: {
                                        oldPwd: "",
                                        newPwd: "",
	                                confirm: "",
	                                rules: {
                                                oldPwd:[
                                                        {required: true, message: '请输入原密码', trigger: 'blur'},
                                                        {min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur'}
                                                ],
                                                newPwd: [
	                                                {
                                                                validator:(rule, value, callback) =>{
                                                                        if( value.length === 0)
                                                                                callback(new Error('* 新密码不能为空'));
                                                                        else if( value === this.edit.oldPwd) {
                                                                                callback( new Error('* 新旧密码不能一致'));
                                                                        }
                                                                        else if(value.toString().length < 3 || value.toString().length > 20) {
                                                                                callback(new Error('密码长度为3 - 20个字符'))
                                                                        }
                                                                        else
                                                                                callback()              //直接调用callback不给参数，表示通过验证
                                                                },
                                                                trigger:"blur"
	                                                }
                                                ],
                                                confirm: [
	                                                {
                                                                validator:(rule, value, callback) =>{
                                                                        if( value.length === 0)
                                                                                callback(new Error('* 请再次输入密码'));
                                                                        else if( value !== this.edit.newPwd) {
                                                                                callback( new Error('* 两次密码一致'));
                                                                        }
                                                                        else
                                                                                callback()              //直接调用callback不给参数，表示通过验证
                                                                },
                                                                trigger:"blur"
	                                                }
                                                ]
	                                }
                                },
                        }
	        },
	        methods: {
                       pwdChange() {
                               this.$refs.form.validate(async valid =>{
                                       if(!valid) return;
                                       await this.$http({
                                               method: "post",
                                               url: "user/pwdchange",
                                               data: this.edit
                                       });
                                       sessionStorage.removeItem("token");
                                       sessionStorage.removeItem("user_name");
                                       await this.$confirm("密码已修改，请重新登录！",  '提示', {type: 'warning'});
                                       this.$router.replace("/login");
                               })


                        }
	        },
        };
</script>

<style lang="stylus" type="text/stylus" scoped>

</style>