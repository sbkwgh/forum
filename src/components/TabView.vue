<template>
	<div class='tab_view'>
		<slot name='first'></slot>
		<slot name='second'></slot>
	</div>
</template>

<script>
	export default {
		name: 'TabView',
		props: ['tabs'],
		data () {
			return {

			}
		},

	}
</script>

<style lang='scss' scoped>
	.tab_view {

	}
</style>