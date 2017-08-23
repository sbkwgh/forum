<template>
	<div class='admin_forum_info category_widget__box'>
		<div class='cateogry_widget__text'>
			<div class='category_widget__text__title'>Forum info</div>
		</div>
		<fancy-input placeholder='Forum name' v-model='name'></fancy-input>
		<fancy-input placeholder='Forum description' v-model='description'></fancy-input>
		<loading-button :loading='loading'>Save settings</loading-button>
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
				loading: false
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