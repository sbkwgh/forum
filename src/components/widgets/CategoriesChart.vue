<template>
	<div class='widgets__categories_chart' ref='container'>
		<div class='widgets__categories_chart__overlay' :class='{ "widgets__categories_chart__overlay--show" : loading }'>
			<loading-icon :dark='true'></loading-icon>
		</div>
		<div
			class='widgets__categories_chart__tooltip'
			:class='{ "widgets__categories_chart__tooltip--show": tooltipShow }'
			:style='{ "left": tooltipX, "top": tooltipY }'
		>
		</div>
		<div class='widgets__categories_chart__main'>
			<svg>
				<g ref='g'></g>
				<text class='widgets__categories_chart__empty' x='50%' y='53%' v-if='!anyThreadsExist'>No threads yet</text>
			</svg>
			<div class='widgets__categories_chart__main__legend'>
				<div class='widgets__categories_chart__title'>categories</div>
				<div
					v-for='(category, $index) in data'
					class='widgets__categories_chart__label'
					@mouseover='toggleLabelHover($index)'
					@mouseout='toggleLabelHover($index)'
				>
					<div class='widgets__categories_chart__label__square' :style="{ 'background-color': category.color }"></div>
					{{category.label}}
				</div>
			</div>
		</div>

	</div>
</template>

<script>
	import LoadingIcon from '../LoadingIcon'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	import * as d3 from 'd3'
	import throttle from 'lodash.throttle'

	export default {
		name: 'CategoriesChart',
		components: { LoadingIcon },
		data () {
			return {
				loading: true,
				padding: 20,
				
				tooltipX: 0,
				tooltipY: 0,
				tooltipShow: false,
				tooltipItem: 0,

				data: []
			}
		},
		computed: {
			anyThreadsExist () {
				return this.data.reduce((sum, category) => {
					return sum + category.value
				}, 0)
			}
		},
		methods: {
			updateFuncs () {
				if(!this.data.length) return

				let height = this.$refs.container.getBoundingClientRect().height

				let paddedHeight = (height - this.padding) / 2
				let translate = paddedHeight + this.padding / 2

				let pieSegments = d3.pie()(this.data.map(d => d.value))
				let arcGenerator = d3.arc()
					.innerRadius(paddedHeight - 40)
					.outerRadius(paddedHeight)
					.padAngle(Math.PI*2 * 2/360)

				let g = d3.select(this.$refs.g).attr('transform', `translate(${translate}, ${translate})`)

				let arcs = g.selectAll('path')
					.data(pieSegments)
					.enter()
					.append('path')
					.attr('d', arcGenerator)
					.attr('data-index', (d, i) => i)
					.attr('fill', (d, i) => this.data[i].color)

				let labels = g.selectAll('text')
					.data(pieSegments)
					.enter()
					.append('text')
					.text(d => d.value ? d.value : '')
					.attr('data-index', (d, i) => i)
					.attr('fill', '#fff')
					.attr('transform', d => {
						d.innerRadius = paddedHeight - 40
						d.outerRadius = paddedHeight
		
						
						let coords = arcGenerator.centroid(d)
							.map((val, i) => i ? val+5 : val-5)
							.join(',')

						return `translate(${coords})`
					})
			},
			toggleLabelHover (index) {
				let g = this.$refs.g
				let path = g.querySelector('path[data-index="' + index + '"]')
				let text = g.querySelector('text[data-index="' + index + '"]')
				let textTransform = text.getAttribute('transform')

				path.classList.toggle('widgets__categories_chart__main--large')
				
				if(textTransform.includes('scale')) {
					text.setAttribute('transform', textTransform.split(' ')[0])
				} else {
					text.setAttribute('transform', textTransform + ' scale(1.15)')
				}
			}
		},
		mounted () {
			window.addEventListener('resize', this.updateFuncs)

			this.axios
				.get('/api/v1/log/categories')
				.then(res => {
					this.data = res.data
					this.updateFuncs()
					this.loading = false
				})
				.catch(AjaxErrorHandler(this.$store))
		},
		destroyed () {
			window.removeEventListener('resize', this.updateFuncs)
		}
	}
</script>

<style lang='scss'>
	@import '../../assets/scss/variables.scss';

	.widgets__categories_chart {
		background-color: #fff;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 0.25rem 0.25rem 0 0;
		position: relative;

		@at-root #{&}__overlay {
			@include loading-overlay(#fff, 0.25rem 0.25rem 0 0);
		}

		@at-root #{&}__empty {
			font-style: italic;
			text-anchor: middle;
			font-size: 1.25rem;
			alignment-baseline: central;
		}

		@at-root #{&}__main {
			display: flex;
			flex-direction: row;
			height: 100%;
			
			svg {
				height: 100%;
				width: 11rem;
	
				path, text {
					transition: all 0.2s;
				}
			}
			@at-root #{&}--large {
				transform: scale(1.075);
			}
			@at-root #{&}__legend {
				padding: 10px 0;
			}
		}

		@at-root #{&}__title {
			font-variant: small-caps;
			font-size: 1.125rem;
			margin-left: -0.4rem;
		}

		@at-root #{&}__label {
			position: relative;
			cursor: default;
			margin-left: 1rem;

		
		 	&:hover {
				text-decoration: underline;
			}

			@at-root #{&}__square {
				position: absolute;
				top: 0.375rem;
				left: -1.25rem;
				height: 0.75rem;
				width: 0.75rem;
				border-radius: 0.125rem;
			}
		}

	}
</style>