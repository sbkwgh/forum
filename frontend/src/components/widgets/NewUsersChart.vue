<template>
	<line-chart
		background='#84dec0'
		point='#1da8ce'
		tooltip='new user'
		:points='points'
	></line-chart>
</template>

<script>
	import LineChart from './LineChart'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'NewUsersChart',
		components: { LineChart },
		data () {
			return {
				points: []
			}
		},
		mounted () {
			this.axios
				.get('/api/v1/log/new-users')
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