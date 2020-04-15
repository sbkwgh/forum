<template>
	<div class='route_container user_route'>
		<div class='user_header'>
			<div
				class='user_header__icon picture_circle'
				:style='{
					"background-color": userColor,
					"background-image": userPicture,
				}'
			>
				{{userPicture ? '' : username[0].toUpperCase()}}
			</div>
			<div class='user_header__info'>
				<span class='user_header__username'>
					{{username}}
					<span
						class='admin_badge admin_badge--large'
						v-if='user && user.admin'
					>
						admin
					</span>
				</span>
				<span class='user_header__date' v-if='user'>User since {{user.createdAt | formatDate('date') }}</span>
				<div class='user_description' v-if='user && user.description && user.description.length' v-html='user.description'></div>
			</div>
		</div>
		<div class='user__view_holder'>
			<div class='user__links'>
				<div
					class='user__links__menu_item'
					:key='"user-menu-item-" + index'
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
			$route (to) {
				this.selected = this.getIndexFromRoute(to.path)
			}
		},
		computed: {
			userColor () {
				if(this.user) {
					return this.user.color
				} else {
					return null
				}
			},
			userPicture () {
				if(this.user && this.user.picture) {
					return 'url(' + this.user.picture + ')'
				} else {
					return null
				}
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
				.catch(e => {
					let invalidId = e.response.data.errors.find(error => {
						return error.name === 'accountDoesNotExist'
					})

					if(invalidId) {
						this.$store.commit('set404Page', true)
					} else {
						AjaxErrorHandler(this.$store)(e)
					}
				})
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.user_route {
		width: 70%;
	}

	.user_header {
		display: flex;
		align-items: flex-start;
		margin-bottom: 1.5rem;
		background-color: #fff;
		padding: 1rem;
		border-radius: 0.25rem;
		border: thin solid $color__gray--darker;

		@at-root #{&}__icon {
			height: 6rem;
			width: 6rem;
			line-height: 5.5rem;
			@include text($font--role-emphasis, 5rem)
			text-align: center;
			background-color: $color__gray--darkest;
			color: #fff;
		}
		@at-root #{&}__info {
			display: flex;
			flex-direction: column;
			margin-left: 1rem;
			width: calc(100% - 6rem);
		}
		@at-root #{&}__username {
			margin-top: -0.25rem;
			font-size: 2rem;
			font-weight: bold
		}
		@at-root #{&}__date {
			color: $color__darkgray--primary;
			font-size: 1.5rem;
		}
	}
	.user_description {
		white-space: pre-line;
		margin-top: 0.5rem;
	}
	.user__view_holder {
		display: flex;
		flex-direction: row;
	}
	.user__links {
		width: 8rem;
		display: table;

		@at-root #{&}__menu_item {
			cursor: pointer;
			margin-bottom: 0.5rem;
			position: relative;

			&:hover { color: $color__darkgray--primary; }

			@at-root #{&}--selected {
				font-weight: bold;

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
		width: 0;
	}

	@media (max-width: $breakpoint--tablet) {
		.user_route {
			width: inherit;
			overflow-x: hidden;
		}
		.user__view_holder {
			flex-direction: column;
		}
		.user_header {
			@at-root #{&}__icon {
				height: 3rem;
				width: 3rem;
				line-height: 3rem;
				font-size: 2rem;
			}
			@at-root #{&}__username {
				font-size: 1.75rem;
			}
			@at-root #{&}__date {
				font-size: 1.25rem;
			}
		}
		.user__links {
			display: flex;
			flex-direction: row;

			@at-root #{&}__menu_item {
				margin-right: 0.5rem;

				&:hover {
					color: $color__text--primary;
				}

				@at-root #{&}--selected::before {
					width: 100%;
					height: 0.2rem;
					left: 0rem;
					top: auto;
					border-radius: 1rem;
					bottom: -0.375rem;
				}
			}
		}
		.user__view {
			width: auto;
		}
	}
</style>