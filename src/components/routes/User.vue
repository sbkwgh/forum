<template>
	<div class='route_container'>
		<div class='user_header'>
			<div
				class='user_header__icon'
				:style='{ "background-color": (user || {}).color }'
			>
				{{username[0]}}
			</div>
			<div class='user_header__info'>
				<span class='user_header__username'>{{username}}</span>
				<span class='user_header__date' v-if='user'>Account created {{user.createdAt | formatDate('date') }}</span>
			</div>
			<div></div>
		</div>
		<div class='user_description' v-if='user' v-html='user.description'>
		</div>
		<div class='user__view_holder'>
			<div class='user__links'>
				<div
					class='user__links__menu_item'
					v-for='(item, index) in menuItems'
					:class="{'user__links__menu_item--selected': index === selected}"
					@click='$router.push(`/user/${username}/${item.route}`)'
				>
					{{item.name}}
				</div>
			</div>
			<router-view class='user__view' :username='username'></router-view>
		</div>
	</div>
</template>

<script>
	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'user',
		data () {
			return {
				menuItems: [
					{ name: 'Posts', route: 'posts' }, 
					{ name: 'Threads', route: 'threads' }
				],
				selected: 0,

				username: this.$route.params.username,
				user: null
			}
		},
		watch: {
			$route (to, from) {
				this.selected = this.getIndexFromRoute(to.path)
			}
		},
		methods: {
			getIndexFromRoute (path) {
				let selectedIndex
				let route = path.split('/')[3]

				this.menuItems.forEach((item, index) => {
					if(item.route === route) {
						selectedIndex = index
					}
				})

				return selectedIndex
			}
		},
		created () {
			this.selected = this.getIndexFromRoute(this.$route.path)

			this.axios
				.get(`/api/v1/user/${this.$route.params.username}`)
				.then(res => this.user = res.data)
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
	.user__view_holder {
		display: flex;
		width: calc(75% + 5rem);
	}
	.user__links {
		width: 10rem;
		display: table;

		@at-root #{&}__menu_item {
			cursor: pointer;
			margin-bottom: 0.5rem;
			position: relative;

			&:hover { color: $color__darkgray--primary; }

			@at-root #{&}--selected {
				font-weight: 500;

				&::before {
					content: '';
					display: inline-block;
					width: 0.2rem;
					z-index: 1;
					height: 100%;
					position: absolute;
					left: -0.5rem;
					top: 0.0625rem;
					background-color: $color__gray--darkest;
				}
			}
		}
	}
	.user__view {
		flex-grow: 1;
	}
</style>