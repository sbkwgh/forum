<template>
	<line-chart
		background='#f39c12'
		point='rgb(255, 237, 127)'
		tooltip='page view'
		:points='points'
	></line-chart>
</template>

<script>
	import LineChart from './LineChart'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'PageViewsChart',
		components: { LineChart },
		data () {
			return {
				points: []
			}
		},
		mounted () {
			this.axios
				.get('/api/v1/log/page-views')
				.then(res => {
					this.points = res.data.map(d => {
						d.date = new Date(d.date)

						return d
					})
				})
				.catch(AjaxErrorHandler(this.$store))
		}
	}
</script>