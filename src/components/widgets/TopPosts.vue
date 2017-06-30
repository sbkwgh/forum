<template>
	<div class='widgets__top_posts'>
		<div class='widgets__top_posts__overlay' :class='{ "widgets__top_posts__overlay--show" : loading }'>
			<loading-icon></loading-icon>
		</div>
	</div>
</template>

<script>
	import LoadingIcon from '../LoadingIcon'

	export default {
		name: 'TopPosts',
		components: { LoadingIcon },
		data () {
			return {
				loading: false
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.widgets__top_posts {
		background-color: #fff;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 0.25rem 0.25rem 0 0;
		position: relative;

		@at-root #{&}__overlay {
			@include loading-overlay(#2ecc71, 0.25rem 0.25rem 0 0);
		}
	}
</style>