<template>
	<div class='tab_view'>
		<div class='tab_view__tabs' :class='{"tab_view__tabs--small_tabs": smallTabs}'>
			<div
				class='tab_view__tab'
				v-for='(tab, index) in tabs'
				:class='{
					"tab_view__tab--selected": tabIndex === index,
					"tab_view__tab--selected_small_tabs": tabIndex === index && smallTabs,
					"tab_view__tab--small_tabs": smallTabs
				}'
				@click='changeTab(index)'
			>
				{{tab}}
			</div>
		</div>
		<div class='tab_view__content' :class='{"tab_view__content--padding": padding}'>
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
		props: ['tabs', 'value', 'padding', 'small-tabs'],
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
				border: thin solid $color__gray--primary;
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
					content: '';
					position: absolute;
					background-color: #fff;
					width: 100%;
					bottom: -1px;
					left: 0;
					height: 1px;
				}
			}

			@at-root #{&}--small_tabs {
				border-radius: 0.25rem 0.25rem 0 0;
				flex-grow: 0;
				border-bottom: 0;
				margin: 0 0.25rem;
				padding: 0.5rem;
				margin-top: 0.25rem;
			}
		}
		@at-root #{&}__content {
			background-color: #fff;

			@at-root #{&}--padding {
				padding: 1rem;
			}
		}
	}
</style>