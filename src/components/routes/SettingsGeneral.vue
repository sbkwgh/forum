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
			<loading-button class='button button--green'>Save description</loading-button>
		</p>
	</div>
</template>

<script>
	import FancyTextarea from '../FancyTextarea'
	import LoadingButton from '../LoadingButton'

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
					error: ''
				}
			}
		},
		computed: {},
		methods: {}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';
</style>