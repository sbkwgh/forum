<template>
	<div  class='user_placeholder'>
		<div class='user_placeholder__avatar'></div>
		<div class='user_placeholder__username'></div>
	</div>
</template>

<script>
	export default {
		name: 'UserPlaceholder'
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.user_placeholder {
		align-items: center;
		background: #fff;
		border: thin solid $color__gray--darker;
		border-radius: 0.25rem;
		display: flex;
		flex-direction: row;
		padding: 0.25rem 0.5rem;

		@at-root #{&}__avatar {
			border-radius: 1.5rem;
			height: 2.5rem;
			width: 2.5rem;
			@include flash;
		}
		
		@at-root #{&}__username {
			border-radius: 0.25rem;
			height: 1.5rem;
			margin-left: 1rem;
			width: calc(100% - 3.5rem);

			@include flash;
		}
	}
</style>