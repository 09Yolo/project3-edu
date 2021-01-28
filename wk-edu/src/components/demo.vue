<template>
	<div>
		<button @click="$emit('update:a', 100)">修改aa</button>
		<button @click="$emit('abc', 100)">修改bb</button>
		<!--默认插槽-->
		<slot></slot>
		<!--具命插槽-->
		<div>
			<slot name="a1", name1="李四", :age="20"></slot>
		</div>
		<div>
			<slot name="a2", name1="王二", age="18" ></slot>
		</div>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: "Demo",
	        props: ["a", "b"],
	        model: {
                        prop: "b",
		        event: "abc"
	        },
        };
</script>

<style lang="stylus" rel="text/stylus" scoped>

</style>