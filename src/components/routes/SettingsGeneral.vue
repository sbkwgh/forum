<template>
	<div class='route_container'>
		<div class='h1'>General settings</div>
		<p>
			<div class='h3'>About me</div>
			<p class='p--condensed'>
				Write something about yourself to be displayed on your user page
			</p>
			<fancy-textarea
				placeholder='About me'
				v-model='description.value'
				:error='description.error'
				type='password'
			></fancy-input>
			<button class='button button--green'>Save</button>
		</p>
	</div>
</template>

<script>
	import FancyTextarea from '../FancyTextarea'

	export default {
		name: 'settingsGeneral',
		components: {
			FancyTextarea
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