<template>
	<div class='widgets__page_views' ref='container'>
		<div class='widgets__page_views__overlay' :class='{ "widgets__page_views__overlay--show" : loading }'>
			<loading-icon></loading-icon>
		</div>
		<div
			class='widgets__page_views__tooltip'
			:class='{ "widgets__page_views__tooltip--show": tooltipShow }'
			:style='{ "left": tooltipX, "top": tooltipY }'
		>
			{{data[tooltipItem].pageViews}} {{data[tooltipItem] | pluralize('page view') }}
		</div>
		<svg>
			<g
				ref='y_axis'
				class='widgets__page_views__axis'
				:transform='"translate(" + 3*padding + ",0)"'
			></g>
			<g
				ref='x_axis'
				class='widgets__page_views__axis widgets__page_views__axis--x'
				:transform='"translate(0,150)"'
			></g>
			<path :d='linePath' fill='none' stroke-width='2' stroke='#fff'></path>
			<circle
				v-for='circle in circles'
				:cx='circle.x'
				:cy='circle.y'
				r='4'
				fill='rgb(255, 237, 127)'
			>
			</circle>
			<circle
				v-for='(circle, $index) in circles'
				:cx='circle.x'
				:cy='circle.y'
				r='10'
				fill='rgba(0, 0, 0, 0)'

				@mousemove='showTooltip($event, $index)'
				@mouseout='hideTooltip'
			>
			</circle>
		</svg>
	</div>
</template>

<script>
	import LoadingIcon from '../LoadingIcon'

	import * as d3 from 'd3'
	import throttle from 'lodash.throttle'

	export default {
		name: 'PageViews',
		components: { LoadingIcon },
		data () {
			let data = [
				{ pageViews: Math.floor(Math.random() * 100) },
				{ pageViews: Math.floor(Math.random() * 100) },
				{ pageViews: Math.floor(Math.random() * 100) },
				{ pageViews: Math.floor(Math.random() * 100) },
				{ pageViews: Math.floor(Math.random() * 100) },
				{ pageViews: Math.floor(Math.random() * 100) },
				{ pageViews: Math.floor(Math.random() * 100) }
			]

			let x = d3
				.scaleLinear()
				.domain([0, 0])
				.range([0, 0])

			let y = d3
				.scaleLinear()
				.domain([0, 0])
				.range([0, 0])

			return {
				loading: false,
				padding: 10,
				
				tooltipX: 0,
				tooltipY: 0,
				tooltipShow: false,
				tooltipItem: 0,

				data, x, y,
			}
		},
		methods: {
			setXFunc () {
				let width = this.$refs.container.getBoundingClientRect().width - this.padding*2

				this.x = d3
					.scaleLinear()
					.domain([0, this.data.length-1])
					.range([this.padding * 4, width])
			},
			setYFunc () {
				let height = this.$refs.container.getBoundingClientRect().height - this.padding*2

				this.y = d3
					.scaleLinear()
					.domain([d3.max(this.data.map(d => d.pageViews)), 0])
					.range([this.padding*1.5, height - this.padding/2])
			},
			updateFuncs () {
				this.setXFunc()
				this.setYFunc()

				d3.select(this.$refs.x_axis).call(d3.axisBottom(this.x).tickSize(0))
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
		computed: {
			linePath () {
				let line = 	d3
					.line()
					.curve(d3.curveCatmullRom)
					.x((d, i) => this.x(i))
					.y(d => this.y(d.pageViews))

				return line(this.data)
			},
			circles () {
				return this.data.map((d, i) => {
					return { x: this.x(i), y: this.y(d.pageViews) }
				})
			}
		},
		mounted () {
			this.updateFuncs()

			let resizeCb = throttle(() => {
				this.updateFuncs()
			}, 200)
			window.addEventListener('resize', resizeCb)

			d3.select(this.$refs.y_axis).call(d3.axisLeft(this.y.nice()))
			d3.select(this.$refs.x_axis).call(d3.axisBottom(this.x).tickSize(0))
		}
	}
</script>

<style lang='scss'>
	@import '../../assets/scss/variables.scss';

	.widgets__page_views {
		background-color: #f39c12;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 0.25rem 0.25rem 0 0;
		position: relative;

		@at-root #{&}__overlay {
			@include loading-overlay(#f39c12, 0.25rem 0.25rem 0 0);
		}

		@at-root #{&}__tooltip {
			position: fixed;
			background-color: rgba(256, 256, 256, 0.9);
			pointer-events: none;
			display: inline-block;
			opacity: 0;
			padding: 0.25rem;
			z-index: 1;
			border-radius: 0.25rem;
			transition: all 0.2s;

			@at-root #{&}--show {
				opacity: 1;
			}
		}

		@at-root #{&}__axis {
			line {
				stroke: #fff;
			}
			path {
				stroke: #fff;
			}
			text {
				fill: #fff;
			}

			@at-root #{&}--x {
				text {
					transform: translate(0, 2px);
				}
			}

		}

		svg {
			height: 100%;
			width: 100%;
		}
	}
</style>