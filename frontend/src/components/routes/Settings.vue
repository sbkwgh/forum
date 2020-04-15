<template>
	<div class='route_container route_container--settings'>
		<div class='settings_menu'>
			<div class='settings_menu__title'>settings</div>
			<div class='settings_menu__items'>
				<div
					class='settings_menu__item'
					:key='"menu-item-" + index'
					v-for='(item, index) in menuItems'
					:class="{'settings_menu__item--selected': index === selected}"
					@click='$router.push("/settings/" + item.route)'
				>
					<font-awesome-icon :icon='["fa", item.icon]' />
					{{item.name}}
				</div>
			</div>
		</div>
		<div class='settings_page'>
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'settings',
		data () {
			return {
				menuItems: [
					{ name: 'General', route: 'general', icon: 'cog' }, 
					{ name: 'Account', route: 'account', icon: 'lock'},
				],
				selected: 0
			}
		},
		watch: {
			$route (to) {
				this.selected = this.getIndexFromRoute(to.path)
			},
			'$store.state.username' (username) {
				if(!username) {
					this.$router.push('/')
				}
			}
		},
		mounted () {
			this.selected = this.getIndexFromRoute(this.$route.path)
		},
		methods: {
			getIndexFromRoute (path) {
				let selectedIndex
				let route = path.split('/')[2]

				this.menuItems.forEach((item, index) => {
					if(item.route === route) {
						selectedIndex = index
					}
				})

				return selectedIndex
			}
		},
		beforeRouteEnter (to, from, next) {
			next(vm => {
				if(!vm.$store.state.username) {
					vm.$store.commit('setAccountModalState', true);
					next('/')
				}
			})
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.route_container--settings {
		display: flex;
		align-items: flex-start
	}

	.settings_menu {
		width: 15rem;
		border: thin solid $color__gray--darker;
		background-color: #fff;
		padding: 1rem;
		border-radius: 0.25rem;

		@at-root #{&}__title {
			cursor: default;
			font-weight: 500;
			font-variant: small-caps;
			font-size: 1.125rem;
			padding-left: 0.25rem;
			margin-bottom: 0.5rem;
		}

		@at-root #{&}__item  {
			padding: 0.5rem 1rem;
			margin-bottom: 0.25rem;
			padding-right: 0;
			transition: background-color 0.2s;
			cursor: pointer;
			position: relative;
			border-radius: 0.25rem;

			&:first-child { margin-top: 0.5rem; }
			&:last-child { margin-bottom: 0.5rem; }

			&:hover { background-color: $color__lightgray--primary; }

			&::before {
				content: '';
				display: inline-block;
				width: 0.25rem;
				z-index: 1;
				height: 100%;
				position: absolute;
				left: 0;
				border-radius: 0.25rem 0 0 0.25em;
				top: 0;
				background-color: $color__gray--darkest;
				opacity: 0;
				transition: opacity 0.2s;
			}

			span {
				color: $color__text--secondary;
				margin-right: 0.5rem;
			}

			@at-root #{&}--selected {
				background-color: $color__lightgray--darker;
				color: $color__text--primary;

				span {
					color: $color__text--primary;
				}

				&:hover { background-color: $color__lightgray--darker; }

				&::before {
					opacity: 1;
				}
			}
		}
	}
	.settings_page {
		width: calc(100% - 15rem);
		background-color: #fff;
		border-radius: 0.25rem;
		margin-left: 2rem;
		border: thin solid $color__gray--darker;
	}

	@media (max-width: $breakpoint--tablet) and (min-width: $breakpoint--phone) {
		div.settings_menu, div.settings_page {
			width: calc(100% - 4rem);
			margin: 0.5rem 2rem;
			padding: 1rem;
		}
	}

	@media (max-width: $breakpoint--tablet) {
		.route_container--settings {
			flex-direction: column;
		}

		.settings_menu {
			width: 100%;

			@at-root #{&}__items {
				display: flex;
				align-items: baseline;
			}

			@at-root #{&}__item {
				width: 7rem;
				margin-right: 0.5rem;
				color: $color__text--primary;

				&:first-child, &:last-child {
					margin-bottom: 0;
					margin-top: 0;
				}

				&::before {
					height: 0.2rem;
					width: 100%;
					left: 0;
					border-radius: 0 0 1rem 1rem;
					top: auto;
					bottom: 0;
				}
			}
		}

		.settings_page {
			width: 100%;
			margin: 0;
			margin-top: 1rem;
		}
	}
</style>