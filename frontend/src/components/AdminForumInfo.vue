<template>
	<div class='admin_forum_info category_widget__box'>
		<div class='cateogry_widget__text'>
			<div class='category_widget__text__title'>Forum info</div>
		</div>
		<fancy-input
			placeholder='Forum name'
			v-model='name'
			:error='errors.forumName'
		></fancy-input>
		<fancy-input
			placeholder='Forum description'
			v-model='description'
			:error='errors.forumDescription'
		></fancy-input>
		<loading-button :loading='loading' @click='save'>Save settings</loading-button>
	</div>
</template>

<script>
	import FancyInput from './FancyInput'
	import LoadingButton from './LoadingButton'

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'AdminForumInfo',
		components: {
			FancyInput,
			LoadingButton
		},
		data () {
			return {
				name: '',
				description: '',
				loading: false,
				errors: {
					forumName: '',
					forumDescription: ''
				}
			}
		},
		methods: {
			save () {
				this.errors.forumName = ''
				this.errors.forumDescription = ''

				if(!this.name.trim().length) {
					this.errors.forumName = 'Forum name can\'t be blank'
					return
				}

				this.loading = true

				let settingsReq = this.axios.put('/api/v1/settings', {
					forumName: this.name,
					forumDescription: this.description
				})

				settingsReq.then(res => {
					this.loading = false
					this.$store.commit('setForumName', res.data.forumName)
				}).catch(e => {
					this.loading = false

					AjaxErrorHandler(this.$store)(err, (error, modalErrors) => {
						if(this.errors[error.path] !== undefined) {
							this.errors[error.path] = error.message
						} else {
							modalErrors.push(error.message)
						}
					})
				})
			}
		},
		mounted () {
			this.axios
				.get('/api/v1/settings')
				.then(res => {
					this.name = res.data.forumName || ''
					this.description = res.data.forumDescription || ''
				})
				.catch(AjaxErrorHandler(this.$store))
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.admin_forum_info {
	
	}
</style>