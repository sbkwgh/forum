<template>
	<div class='route_container'>
		<div class='h1'>Account settings</div>
		<p>
			<div class='h3'>Change your password</div>
			<p class='p--condensed'>
				For security, enter your current password
			</p>
			<fancy-input
				placeholder='Current password'
				v-model='password.old.value'
				:error='password.old.error'
				type='password'
			></fancy-input>
			<fancy-input
				placeholder='New password'
				v-model='password.new.value'
				:error='password.new.error'
				type='password'
			></fancy-input>
			<button class='button button--green'>Change password</button>
		</p>
		<p>
			<div class='h3 h3--margin_top'>Delete your account</div>
			<p class='p--condensed'>
				Once this is done, your account <strong>cannot</strong> be restored <br/>
				Your current posts however will be retained
			</p>
			<button class='button button--red'>Delete my account</button>
		</p>
	</div>
</template>

<script>
	import FancyInput from '../FancyInput'

	export default {
		name: 'settingsAccount',
		components: {
			FancyInput
		},
		data () {
			return {
				password: {
					old: {
						value: '',
						error: ''
					},
					new: {
						value: '',
						error: ''
					}
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