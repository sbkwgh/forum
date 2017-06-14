<template>
	<div class='widgets__new_post'>
		<div class='widgets__new_post__main'>
			<template v-if='count'>
				{{count}} new {{count | pluralize('post')}}
			</template>
			<template v-else>
				No new posts
			</template>
		</div>
		<div class='widgets__new_post__message'>
			<template v-if='change === 0'>
				<span class='fa fa-minus'></span>
				No change since yesterday
			</template>
			<template v-else-if='change > 0'>
				<span class='fa fa-caret-up'></span>
				Up {{change}} since yesterday
			</template>
			<template v-else>
				<span class='fa fa-caret-down'></span>
				Down {{Math.abs(change)}} since yesterday
			</template>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'NewPosts',
		data () {
			return {
				count: 1,
				change: -2,
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.widgets__new_post {
		background-color: #3498db;
		color: #fff;
		width: 100%;
		height: 100%;
		border-radius: 0.25rem 0.25rem 0 0;
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		align-items: center;
		justify-content: center;

		@at-root #{&}__main {
			font-size: 2.5rem;
			font-family: $font--role-emphasis;
		}

		@at-root #{&}__message {
			margin-top: 0.5rem;

			span {
				margin-right: 0.25rem;
			}
		}
	}
</style>