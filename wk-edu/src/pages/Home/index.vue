<template>
	<el-container class="page-container">
		<el-header height="80px">
			<h1>教学管理系统</h1>
			<div>
				欢迎您：
				<span>{{username}}</span>
				<el-button type="text" class="quit" @click="logout">退出</el-button>
			</div>

		</el-header>
		<el-container>
			<el-aside>
				<el-menu background-color="#606266" text-color="#fff" active-text-color="#ffd04b"
				 :default-active="activeFuncKey" @select="menuSelectHandler">
					<template v-for="item in menuData">
						<el-menu-item v-if="item.func_key" :index="item.func_key" :key="item.func_id">
							<i class="el-icon-menu"></i>
							<span slot="title" v-text="item.func_name"></span>
						</el-menu-item>
						<el-submenu v-else :index="item.func_id.toString()" :key="item.func_id">
							<template slot="title">
								<i class="el-icon-setting"></i>
								<span slot="title" v-text="item.func_name"></span>
							</template>
							<template v-if="item.children">
								<el-menu-item v-for="item2 in item.children" :index="item2.func_key" :key="item2.func_id">
									<i class="el-icon-menu"></i>
									<span slot="title" v-text="item2.func_name"></span>
								</el-menu-item>
							</template>
						</el-submenu>
					</template>
				</el-menu>
			</el-aside>
				<el-container>
					<el-main>
						<el-tabs type="card" closable @tab-remove="tabRemoveHandler" v-model="activeFuncKey" >
							<el-tab-pane v-for="func_key in activeFuncKeys"
							 :key="func_key"
							 :name="func_key"
							 :label="menu.find(item =>item.func_key === func_key).func_name">
								<component :is="views[func_key]"></component>
							</el-tab-pane>
						</el-tabs>
					</el-main>
					<el-footer>
						版权所有&copy;
					</el-footer>
				</el-container>
		</el-container>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import views from '../../views';
        export default {
                name: "Home",
	        data(){
                        return{
                                username:sessionStorage.getItem("user_name"),
                                views,
                                menu: [],
                                activeFuncKey: "",
                                activeFuncKeys: [],
                        };
	        },
	        computed: {
	                menuData() {
	                        let result = [];
	                        this.menu.filter(item => item.func_fid ===0).forEach(item => {
	                                let node = Object.assign({}, item);
	                                let children = this.menu.filter(item2 => item2.func_fid === item.func_id);
	                                if(children.length > 0) {
	                                        node.children = [];
	                                        children.forEach(item2 => node.children.push(Object.assign({}, item2)));
	                                }
	                                result.push(node);
	                        })
	                        return result;
	                }
	        },
	        methods: {
                        logout(){
                                window.sessionStorage.clear();
                                this.$router.replace("/login");
                        },
	                menuSelectHandler(index, indexPath) {
	                        this.activeFuncKey = index;
	                        if(this.activeFuncKeys.indexOf(index) === -1){
	                                this.activeFuncKeys.push(index);
	                        }
	                },
		        tabRemoveHandler(name) {
	                        this.activeFuncKeys.splice(this.activeFuncKeys.indexOf(name),1);
	                       if(this.activeFuncKeys.indexOf(this.activeFuncKey) === -1) {          //删除的是激活的
	                               this.activeFuncKey = this.activeFuncKeys[0] || "";
	                       }
		        }
	        },

	       async created() {
                       this.$store.dispatch("dictionary/init");
                       this.$store.dispatch("classroom/init");
	                this.menu = await this.$http({
                                url: "/user/getmenu",
                                method: "post",
	                })

	       }
	};
</script>

<style type="text/stylus" lang="stylus" scoped>
	.page-container
		height: 100%
		.el-header
			background-color: #303133
			color: #fff
			display: flex
			align-items: center
			justify-content space-between
			h1
				font-size: 26px
			span
				color #fff
				padding-right  20px
			.quit
				font-size 20px
				color azure
		.el-aside
			background-color: #606266
			.el-menu
				border-right : none
		.el-footer
			background-color: #909399
			display: flex
			align-items: center
			color aliceblue
		.el-main
			position: relative
</style>