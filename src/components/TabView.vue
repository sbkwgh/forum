<template>
	<div class='tab_view'>
		<div class='tab_view__tabs'>
			<div class='tab_view__tab' :class='{"tab_view__tab--selected": showTab === 0}' @click='changeTab(0)'>{{tabs[0]}}</div>
			<div class='tab_view__tab' :class='{"tab_view__tab--selected": showTab === 1}' @click='changeTab(1)'>{{tabs[1]}}</div>
		</div>
		<div class='tab_view__content'>
			<slot name='first' v-if='showTab === 0'></slot>
			<slot name='second' v-if='showTab === 1'></slot>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'TabView',
		props: ['tabs'],
		data () {
			return {
				showTab: 0
			}
		},
		methods: {
			changeTab (index) {
				this.showTab = index;
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.tab_view {
		@at-root #{&}__tabs {
			display: flex;
		}
		@at-root #{&}__tab {
			flex-grow: 1;
			text-align: center;
			cursor: pointer;
			font-weight: 400;
			padding: 0.5rem 0;
			background-color: $color__gray--primary;
			transition: background-color 0.2s;

			&:hover {
				background-color: $color__gray--darker;
			}
			&:active {
				background-color: rgba(210, 210, 210, 1);
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
		}
		@at-root #{&}__content {
			background-color: #fff;
			padding: 1rem;
		}
	}
</style>