<template>
	<div
		class='user_display'
		@click='$router.push("/user/" + user.username)'
	>
		<avatar-icon :user='user' size='small'></avatar-icon>
		<div class='user_display__username'>
			{{user.username}}
		</div>
	</div>
</template>

<script>
	import AvatarIcon from './AvatarIcon';

	export default {
		name: 'UserDisplay',
		props: ['user'],
		components: { AvatarIcon }
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.user_display {
		align-items: center;
		background: #fff;
		border: thin solid $color__gray--darker;
		border-radius: 0.25rem;
		cursor: pointer;
		display: flex;
		flex-direction: row;
		padding: 0.25rem 0.5rem;
		transition: box-shadow 0.2s;
		
		&:hover {
			@extend .shadow_border--hover;
		}

		@at-root #{&}__username {
			font-size: 1.25rem;
			font-weight: 400;
			margin-left: 1rem;
		}
	}
</style>