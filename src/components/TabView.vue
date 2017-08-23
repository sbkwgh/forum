<template>
	<div class='tab_view'>
		<div
			class='tab_view__tabs'
			:class='{
				"tab_view__tabs--small_tabs": smallTabs,
				"tab_view__tabs--transparent": transparent
			}'
		>
			<div
				class='tab_view__tab'
				v-for='(tab, index) in tabs'
				:class='{
					"tab_view__tab--selected": tabIndex === index,
					"tab_view__tab--selected_small_tabs": tabIndex === index && smallTabs,
					"tab_view__tab--selected_transparent": tabIndex === index && transparent,
					"tab_view__tab--small_tabs": smallTabs,
					"tab_view__tab--transparent": transparent
				}'
				@click='changeTab(index)'
			>
				{{tab}}
			</div>
		</div>
		<div
			class='tab_view__content'
			:class='{
				"tab_view__content--padding": padding,
				"tab_view__content--transparent": transparent
			}'
		>
			<slot
				v-for='(tab, index) in tabs'
				:name='tab'
				v-if='tabIndex === index'
			>
			</slot>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'TabView',
		props: ['tabs', 'value', 'padding', 'small-tabs', 'transparent'],
		methods: {
			changeTab (index) {
				this.$emit('input', index)
			}
		},
		computed: {
			tabIndex () {
				return this.value
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.tab_view {
		border-radius: 0.25rem;

		@at-root #{&}__tabs {
			display: flex;

			@at-root #{&}--small_tabs {
				background-color: $color__gray--primary;
				border-bottom: thin solid $color__gray--darker;
			}

			@at-root #{&}--transparent {
				background-color: transparent;
				border: none;
			}
		}
		@at-root #{&}__tab {
			flex-grow: 1;
			text-align: center;
			position: relative;
			cursor: pointer;
			font-weight: 300;
			padding: 0.5rem 0;
			background-color: $color__gray--primary;
			transition: background-color 0.2s;

			&:hover {
				background-color: $color__gray--darker;
			}
			&:active {
				background-color: rgba(210, 210, 210, 1);
			}

			@at-root #{&}--small_tabs {
				border-radius: 0.25rem 0.25rem 0 0;
				flex-grow: 0;
				border-bottom: 0;
				margin: 0 0.25rem;
				padding: 0.5rem;
				margin-top: 0.25rem;

				&::after {
					content: '';
					position: absolute;
					background-color: #fff;
					width: 100%;
					bottom: -2px;
					left: 0;
					height: 2px;
					opacity: 0;
					transition: all 0.2s;
				}
			}

			@at-root #{&}--transparent {
				background-color: transparent;
				flex-grow: 0;
				margin: 0 0.25rem;
				padding: 0.5rem;
				margin-top: 0.25rem;
				font-size: 1.25rem;

				&:after {
					content: '';
					position: absolute;
					background-color: $color__gray--darkest;
					width: 100%;
					bottom: -3px;
					left: 0;
					height: 3px;
					border-radius: 1rem;
					opacity: 0;
					pointer-events: none;
					transition: opacity 0.2s, bottom 0.2s, background-color 0.2s;
				}

				&:hover {
					background-color: transparent;

					&:after {
						background-color: $color__gray--darker;
						opacity: 1;
						bottom: 0px;
					}
				}
				&:active {
					background-color: transparent;
				}
			}

			@at-root #{&}--selected {
				background-color: #fff;

				&:hover {
					background-color: #fff;
				}
				&:active {
					background-color: #fff;
				}
			}

			@at-root #{&}--selected_small_tabs {
				border: thin solid $color__gray--darker;
				
				&::after {
					opacity: 1;
				}
			}

			@at-root #{&}--selected_transparent {
				border: thin solid $color__gray--darker;
				background-color: transparent;
				border: none;

				&:hover, &:active {
					background-color: transparent;

					&:after {
						background-color: $color__gray--darkest;
					}
				}

				&::after {
					background-color: $color__gray--darkest;
					bottom: 0px;
					opacity: 1;
				}
			}
		}
		@at-root #{&}__content {
			background-color: #fff;

			@at-root #{&}--padding {
				padding: 1rem;
			}
			@at-root #{&}--transparent {
				background-color: transparent;
			}
		}
	}
</style>