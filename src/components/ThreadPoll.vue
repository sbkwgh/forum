<template>
	<div class='poll'>
	
	</div>
</template>

<script>
	import LoadingIcon from './LoadingIcon'

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'ThreadPoll',
		props: ['id'],
		components: { LoadingIcon }
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.poll {

	}
</style>