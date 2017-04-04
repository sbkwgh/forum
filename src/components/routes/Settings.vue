<template>
	<div class='route_container route_container--settings'>
		<div class='settings_menu'>
			<div
				class='settings_menu__item'
				v-for='(item, index) in menuItems'
				:class="{'settings_menu__item--selected': index === selected}"
				@click='$router.push("/settings/" + item.route)'
			>
				{{item.name}}
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
					{ name: 'General', route: 'general' }, 
					{ name: 'Account', route: 'account' },
				],
				selected: 0
			}
		},
		watch: {
			$route (to, from) {
				this.selected = this.getIndexFromRoute(to.path)
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
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.route_container--settings {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: calc(100% + 1rem);
		padding: 0;
		margin: 0;
		margin-top: -1rem;
	}

	.settings_menu {
		width: 15rem;
		height: 100%;
		border-right: 0.125rem solid $color__gray--primary;
		padding-top: 1rem;

		@at-root #{&}__item {
			padding: 0.5rem 1.5rem;
			padding-right: 0;
			transition: background-color 0.2s;
			cursor: pointer;
			position: relative;

			&:first-child { margin-top: 0.5rem; }
			&:last-child { margin-bottom: 0.5rem; }

			&:hover { background-color: $color__lightgray--primary; }

			@at-root #{&}--selected {
				background-color: $color__lightgray--darker;

				&:hover { background-color: $color__lightgray--darker; }

				&::before {
					content: '';
					display: inline-block;
					width: 0.25rem;
					z-index: 1;
					height: 100%;
					position: absolute;
					left: 0;
					top: 0;
					background-color: $color__gray--darkest;
				}
			}
		}
	}
	.settings_page {
		width: calc(100% - 15rem);
	}
</style>