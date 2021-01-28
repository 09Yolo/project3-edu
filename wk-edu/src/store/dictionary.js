export default {
        namespaced: true,
        state: {
                list: [],
                isInit: false           //初始化
        },
        getters: {
                getGroupByKey(state) {
                        //让计算属性返回一个函数
                        return function(groupKey) {
                                return state.list.filter(item => item.dic_group_key === groupKey);
                        };
                },
        },
        mutations: {
                _init(state, list) {
                        state.list = list;
                        state.isInit = true;
                },

        },
        actions: {
                async init({ state, commit, rootState}){
                        if(state.isInit) return;
                        let list = await rootState.http({url: "dictionary/all"});
                        commit("_init", list);
                },

        }
};