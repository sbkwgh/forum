<template>
	<div class='poll'>
		<transition name='fade' mode='out-in'>
			<div class='poll__loading' key='loading' v-if='!poll'>
				<loading-icon :dark='true'></loading-icon>
			</div>
			<div key='poll' v-else>
				
			</div>
		</transition>
	</div>
</template>

<script>
	import LoadingIcon from './LoadingIcon'

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'ThreadPoll',
		props: ['id'],
		components: { LoadingIcon },
		data () {
			return {
				poll: null
			}
		},
		mounted () {
			this.axios
				.get('/api/v1/poll/' + this.id)
				.then(res => this.poll = res.data)
				.catch(AjaxErrorHandler(this.$store))
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.poll {
		padding: 1rem;
		width: 80%;
		background-color: #fff;
		position: relative;
		margin-bottom: 2rem;
		border-radius: 0.25rem;

		@at-root #{&}__loading {
			@include loading-overlay();
			opacity: 1;
		}
	}
</style>