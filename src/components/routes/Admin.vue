<template>
	<div class='admin'>
		<div class='admin__menu'>
			<div class='admin__menu__item' v-for='route in routes' :class='{ "admin__menu__item--selected" : false }'>
				<div>
					<span class='fa admin__menu__item__icon' :class='route.icon'></span>
				</div>
				<div>
					<div class='admin__menu__item__title'>
						{{route.title}}
					</div>
					<div class='admin__menu__item__description'>
						{{route.description}}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'Admin',
		data () {
			return {
				routes: [
					{ title: 'Dashboard', description: 'Quick links and stats about your forum', icon: 'fa-home' },
					{ title: 'Moderation', description: 'View and respond to user reports', icon: 'fa-exclamation-circle' },
					{ title: 'Categories', description: 'Add and remove thread categories', icon: 'fa-th' },
					{ title: 'Back-up', description: 'Download and restore forum data', icon: 'fa-cloud-download' }
				]
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.admin {
		height: calc(100% + 1rem);
		margin-top: -1rem;

		@at-root #{&}__menu {
			width: 15rem;
			height: calc(100%);
			background-color: #fff;
			cursor: default;
			overflow-y: auto;
			border-right: thin solid $color__lightgray--darker;

			@at-root #{&}__item {
				transition: background-color 0.2s;
				padding: 1rem;
				border-bottom: thin solid $color__lightgray--darker;
				display: flex;
				flex-direction: row;
				position: relative;

				&:hover {
					background-color: $color__lightgray--primary;
				}

				&::before {
					content: '';
					position: absolute;
					left: -0.25rem;
					top: 0;
					width: 0.25rem;
					height: 100%;
					background-color: $color__gray--darkest;
					transition: right 0.2s;
				}

				@at-root #{&}--selected {
					background-color: $color__lightgray--primary;

					&::before {
						left: 0;
					}
				}

				@at-root #{&}__icon {
					margin-right: 0.5rem;
					margin-top: 0.1875rem;
				}

				@at-root #{&}__title {
					font-weight: 600;
				}
				@at-root #{&}__description {
					font-size: 0.9rem;
					color: $color__text--secondary;
					margin-top: 0.125rem;
				}
			}
		}
	}
</style>