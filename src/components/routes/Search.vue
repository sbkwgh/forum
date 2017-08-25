<template>
	<div class='route_container'>
		
	</div>
</template>

<script>
	import ThreadPost from '../ThreadPost'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'Search',
		components: {
			ThreadPost
		},
		mounted () {
			this.$store.dispatch('setTitle', 'Search | ' + this.$route.params.q)
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.search {

	}
</style>