<template>
	<div class='widgets__categories_chart' ref='container'>
		<div class='widgets__categories_chart__overlay' :class='{ "widgets__categories_chart__overlay--show" : loading }'>
			<loading-icon></loading-icon>
		</div>
		<div
			class='widgets__categories_chart__tooltip'
			:class='{ "widgets__categories_chart__tooltip--show": tooltipShow }'
			:style='{ "left": tooltipX, "top": tooltipY }'
		>
		</div>
		<svg></svg>
	</div>
</template>

<script>
	import LoadingIcon from '../LoadingIcon'

	import * as d3 from 'd3'
	import throttle from 'lodash.throttle'

	export default {
		name: 'CategoriesChart',
		components: { LoadingIcon },
		data () {
			let data = []

			return {
				loading: false,
				padding: 10,
				
				tooltipX: 0,
				tooltipY: 0,
				tooltipShow: false,
				tooltipItem: 0,

				data
			}
		},
		methods: {
			updateFuncs () {
				let width = this.$refs.container.getBoundingClientRect().width - this.padding*2
				let height = this.$refs.container.getBoundingClientRect().height - this.padding*2
			},
			showTooltip (e, i) {
				this.tooltipShow = true
				this.tooltipX = e.clientX + 'px'
				this.tooltipY = e.clientY - 30 + 'px'
				this.tooltipItem = i
			},
			hideTooltip () {
				this.tooltipShow = false
			}
		},
		mounted () {
			this.updateFuncs()

			let resizeCb = throttle(() => {
				this.updateFuncs()
			}, 200)
			window.addEventListener('resize', resizeCb)
		}
	}
</script>

<style lang='scss'>
	@import '../../assets/scss/variables.scss';

	.widgets__categories_chart {
		background-color: #2ecc71;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 0.25rem 0.25rem 0 0;
		position: relative;

		@at-root #{&}__overlay {
			@include loading-overlay(#2ecc71, 0.25rem 0.25rem 0 0);
		}

		svg {
			height: 100%;
			width: 100%;
		}
	}
</style>