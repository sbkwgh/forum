<template>
	<div class='tab_view'>
		<div class='tab_view__tabs'>
			<div
				class='tab_view__tab'
				v-for='(tab, index) in tabs'
				:class='{"tab_view__tab--selected": tabIndex === index}'
				@click='changeTab(index)'
			>
				{{tab}}
			</div>
		</div>
		<div class='tab_view__content'>
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
	import mapGetters from 'vuex';

	export default {
		name: 'TabView',
		props: ['tabs', 'name'],
		methods: {
			changeTab (index) {
				this.$store.commit({
					type: 'setTab',
					tab: this.name,
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