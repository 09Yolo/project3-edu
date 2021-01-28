import http from '../utils/http.js';

export default {
        namespaced: true,
        state: {
                list: [],
                isInit: false
        },
        mutations: {
                _init(state, list) {
                        state.list = list;
                        state.isInit = true;
                },
                _addRoom(state, room) {
                        state.list.push(room);
                },
                _removeRoom(state, clsr_id) {
                        let i = state.list.findIndex(item => item.clsr_id === clsr_id);
                        state.list.splice(i,1);
                },
                _updateRoom(state, room){
                        let i = state.list.findIndex(item => item.clsr_id === room.clsr_id);
                        state.list.splice(i, 1, room);
                },
        },
        actions: {
                async init(context) {
                        if(context.state.isInit) return;
                        let list = await http({ url: "/classroom/all"});
                        context.commit("_init", list);
                },
                async addRoom(context, room) {
                        room.clsr_id = await http({url: "/classroom/add", method: "post", data: room});
                        context.commit("_addRoom", room)
                },
                async removeRoom(context, clsr_id) {
                        await http({ url: "/classroom/remove/" + clsr_id});
                        context.commit("_removeRoom", clsr_id);
                },
                async updateRoom(context,room){
                        await http({url: '/classroom/update' , method: "post" , data: room,});
                        context.commit("_updateRoom", room)
                },
        }

}