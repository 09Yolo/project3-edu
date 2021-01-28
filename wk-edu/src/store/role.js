import http from '../utils/http.js';

export default {
        namespaced: true,
        state: {
                list: [],
                isInit: false           //初始化
        },
        mutations: {
                _init(state, list) {
                        state.list = list;
                        state.isInit = true;
                },
                _removeRole(state, role_id) {
                        let i = state.list.findIndex(item => item.role_id === role_id);
                        state.list.splice(i,1);
                },
                _addRole(state, role){
                        state.list.push(role);
                },
                _updateRole(state, role){
                        let i = state.list.findIndex(item => item.role_id === role.role_id);
                        state.list.splice(i, 1, role);
                },
        },
        actions: {
                async init(context) {
                        if(context.state.isInit) return;
                        let list = await http({ url: "/role/all"});
                        context.commit("_init", list);
                },
                async removeRole(context, role_id) {
                        await http({ url: "/role/remove/"+ role_id, method: "post"});
                        context.commit("_removeRole", role_id);
                },
                async addRole(context,role){
                        role.role_id = await http({method: "post" , url: '/role/add' , data: role,});
                        context.commit("_addRole", role)
                },
                async updateRole(context,role){
                        await http({url: '/role/update' , method: "post" , data: role,});
                        context.commit("_updateRole", role)
                },
        }
};