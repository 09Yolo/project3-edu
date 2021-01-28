// 把所有views下面的所有页面级组件统一导入导出
// 让router/index.js在使用的时候更加舒服和优雅
let files = require.context('./',true, /index.vue$/);
let views = {};
files.keys().forEach(filePath => {
        let key = filePath.match(/.*\/(.*)\/index.vue$/)[1];
        views[key] = files(filePath).default;
});
export default views;