<template>
	<div class='route_container'>
		<div class='h1'>General settings</div>
		<p>
			<div class='h3'>About me</div>
			<p class='p--condensed'>
				Write something about yourself to be displayed on your user page
			</p>
			<fancy-textarea
				placeholder='About me description'
				v-model='description.value'
				:error='description.error'
				type='password'
			></fancy-textarea>
			<loading-button
				class='button button--green'
				:loading='description.loading'
				@click='saveDescription'
			>
				Save description
			</loading-button>
		</p>
	</div>
</template>

<script>
	import FancyTextarea from '../FancyTextarea'
	import LoadingButton from '../LoadingButton'

	import AjaxErrorHandler from '../../assets/js/errorHandler'
	import logger from '../../assets/js/logger'

	export default {
		name: 'settingsGeneral',
		components: {
			FancyTextarea,
			LoadingButton
		},
		data () {
			return {
				description: {
					value: '',
					loading: false,
					error: ''
				}
			}
		},
		computed: {},
		methods: {
			saveDescription () {
				this.description.error = ''
				this.description.loading = true

				this.axios
					.put('/api/v1/user/' + this.$store.state.username, {
						description: this.description.value
					})
					.then(res => {
						this.description.loading = false
					})
					.catch(e => {
						this.description.loading = false

						AjaxErrorHandler(this.$store)(e, error => {
							this.description.error = error.message
						})
					})
			}
		},
		created () {
			this.$store.dispatch('setTitle', 'general settings')

			this.$nextTick(() => {
				this.axios
					.get('/api/v1/user/' + this.$store.state.username)
					.then(res => {
						this.description.value = res.data.description || ''
					})
					.catch(e => {
						AjaxErrorHandler(this.$store)(e)
					})
			})

			logger('settingsGeneral')
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';
</style>