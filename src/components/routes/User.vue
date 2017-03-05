<template>
	<div class='route_container'>
		<div class='user_header'>
			<div
				class='user_header__icon'
				:style='{ "background-color": ({} || user).color }'
			>
				{{username[0]}}
			</div>
			<div class='user_header__info'>
				<span class='user_header__username'>{{username}}</span>
				<span class='user_header__date' v-if='user'>Created: {{user.createdAt | formatDate('date') }}</span>
			</div>
			<div></div>
		</div>
		<div class='user_description' v-if='user' v-html='user.description'>
		</div>
		<div class='user_posts' :class='{ "user_posts--no_border_bottom": !posts.length }'>
			<div class='user_posts__title'>Posts by username</div>
			<thread-post v-for='post in posts' :post='post'></thread-post>
			<template v-if='!posts.length'>This user hasn't posted anything yet</template>
		</div>
	</div>
</template>

<script>
	import ThreadPost from '../ThreadPost'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'user',
		components: {
			ThreadPost
		},
		data () {
			return {
				username: this.$route.params.username,
				user: null,
				posts: []
			}
		},
		created () {
			this.axios
				.get(`/api/v1/user/${this.$route.params.username}?posts=true`)
				.then(res => {
					this.user = res.data
					this.posts = res.data.Posts
				})
				.catch(AjaxErrorHandler(this.$store))
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.user_header {
		display: flex;
		align-items: center;
		margin-bottom: 1.5rem;

		@at-root #{&}__icon {
			height: 4rem;
			width: 4rem;
			line-height: 4rem;
			@include text($font--role-emphasis, 3rem)
			text-align: center;
			border-radius: 100%;
			background-color: $color__gray--darkest;
			color: #fff;
		}
		@at-root #{&}__info {
			display: flex;
			flex-direction: column;
			margin-left: 1rem;
			height: 4rem;
		}
		@at-root #{&}__username {
			margin-top: -0.25rem;
			font-size: 2rem;
			font-weight: bold
		}
		@at-root #{&}__date {
			color: $color__gray--darkest;
			font-size: 1.5rem;
		}
	}
	.user_description {
		margin-left: 5rem;
		width: 75%;
	}
	.user_posts {
		width: calc(75% + 5rem);

		&:last-child {
			border-bottom: thin solid $color__gray--primary;
		}

		@at-root #{&}--no_border_bottom {
			&:last-child {
				border-bottom: none;
			}
		}

		@at-root #{&}__title {
			font-size: 1.5rem;
			margin-bottom: 1rem;
		}
	}
</style>