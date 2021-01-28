import Vue from 'vue';
import './assets/css/reset.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router'
import app from './App.vue';
import http from './utils/http.js';
import store from './store';     //仓库

Vue.use(ElementUI);
Vue.prototype.$http = http;

//创建根实例，并渲染根组件
new Vue({
        el: "#app",
        components: {app},
        template: "<app />",
        router,
        store
});