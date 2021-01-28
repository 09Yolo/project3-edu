<template>
	<div class="page-wrapper">
		<div class="logo-wrapper"><h1>教学管理系统</h1></div>
		<el-form :rules="rules" status-icon  :model="model" ref="model">
			<h2>管理系统--登录</h2>
			<el-form-item prop="user_name">
				<el-input suffix-icon="el-icon-s-custom" v-model="model.user_name">
					<template slot="prepend"><span class="prepend-text">用户名:</span></template>
				</el-input>
			</el-form-item>
			<el-form-item prop="user_pwd">
				<el-input suffix-icon="el-icon-lock" v-model="model.user_pwd" type="password">
					<template slot="prepend"><span class="prepend-text">密码:</span></template>
				</el-input>
			</el-form-item>
			<el-form-item class="button-wrapper">
				<el-button plain @click="login">登录</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script type="text/ecmascript-6">
	export default {
                name: "Login",
                data(){
                        return {
                                model: {
                                        user_name: "",
                                        user_pwd: ""
                                },
                                rules: {
                                        user_name: [
                                                {required: true, message: '请输入用户名', trigger: 'blur'},
                                                {min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur'}
                                        ],
                                        user_pwd: [
                                                {required: true, message: '请输入密码', trigger: 'blur'},
                                                {min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur'}
                                        ]
                                },
                        };
                },
                methods: {
                        login(){
                                this.$refs.model.validate(async valid =>{
                                        if(!valid) return;
                                        let token = await this.$http({
                                                url: "/user/login",
                                                method: "post",
                                                data: this.model
                                        })
                                        sessionStorage.setItem("token", token);
                                        sessionStorage.setItem("user_name", this.model.user_name);
                                        this.$router.replace("/home");
                                });
                        }
                },
        };
</script>

<style scoped type="text/stylus" lang="stylus">
	.page-wrapper
		width: 100%
		height: 100%
		background-image: url("./login.jpg")
		background-size: cover
	@keyframes  aaa
		0% { transform: rotateY(0deg)}
		100% { transform: rotateY(30deg)}
	@keyframes bbb
		0% { transform: translateY(-50%) translateX(0%)}
		100% { transform: translateY(-50%) translateX(20%)}
	.logo-wrapper
		perspective: 500px
		position fixed
		top: 50%
		right: 52%
		transform: translateY(-50%) translateX(0%)
		animation-name: bbb
		animation-duration: 1s
		animation-fill-mode: forwards
		animation-delay: 1s
		h1
			animation-name: aaa
			animation-duration: 1s
			animation-fill-mode: forwards
			font-size 80px
			color #fff
			border-bottom: 1px solid black
			padding: 10px 50px
			transform: rotateY(30deg)
			transform-origin: left center
			text-shadow -15px 15px 10px black
			white-space nowrap
			position: relative
	.el-form
		position fixed
		top: 50%
		left:50%
		transform :translateY(-50%)
		box-shadow: 0 0 15px 1px
		width: 400px
		padding: 50px 80px
		h2
			text-align: center
			font-size: 20px
			color #E6EEF1
		span.prepend-text
			display inline-block
			width:60px
		.button-wrapper
			text-align: center
</style>