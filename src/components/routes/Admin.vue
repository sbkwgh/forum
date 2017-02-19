<template>
	<div class='route_container route_container--admin'>
		<div class='admin_menu'>
			<div class='admin_menu__item'>Dashboard</div>
			<div class='admin_menu__item admin_menu__item--selected'>Settings</div>
			<div class='admin_menu__item'>Users</div>
		</div>
		<div class='admin_page'>
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'index',
		components: {},
		computed: {},
		methods: {}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.route_container--admin {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 100%;
		padding: 0;
		margin: 0;
	}

	.admin_menu {
		width: 15%;
		height: 100%;
		border-right: 0.125rem solid $color__gray--primary;

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
	.admin_page {
		width: 85%;
	}
</style>