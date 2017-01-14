<template>
	<div class='tab_view'>
		<div class='tab_view__tabs'>
			<div class='tab_view__tab' :class='{"tab_view__tab--selected": tabIndex === 0}' @click='changeTab(0)'>{{tabs[0]}}</div>
			<div class='tab_view__tab' :class='{"tab_view__tab--selected": tabIndex === 1}' @click='changeTab(1)'>{{tabs[1]}}</div>
		</div>
		<div class='tab_view__content'>
			<slot name='first' v-if='tabIndex === 0'></slot>
			<slot name='second' v-if='tabIndex === 1'></slot>
		</div>
	</div>
</template>

<script>
	import mapGetters from 'vuex';

	export default {
		name: 'TabView',
		props: ['tabs', 'name'],
		methods: {
			changeTab (index) {
				this.$store.commit({
					type: 'setTab',
					tab: 'account',
					index: index
				});
			}
		},
		computed: {
			tabIndex () {
				return this.$store.state.tabs[this.name];
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