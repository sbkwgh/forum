<template>
	<div class='route_container route_container--fullscreen'>
		<div v-show='panel === 1'>
			<div class='h1'>Hi.</div>
			<p class='explanation'>
				First create your admin account for the forum.
			</p>
			<div>
				<fancy-input v-model='username' :error='errors.username' width='100%' placeholder='Username'></fancy-input>
				<fancy-input v-model='password' :error='errors.password' width='100%' placeholder='Password' type='password'></fancy-input>
				<fancy-input
					v-model='confirmPassword'
					:error='errors.confirmPassword'
					width='100%'
					placeholder='Confirm password'
					type='password'
				></fancy-input>
				<button style='width: 100%;' class='button button--green' @click='createAccount'>Create account</button>
			</div>
		</div>
		<div v-show='panel === 2'>
			<div class='h1'>A few settings</div>
			<p class='explanation'>
				You can change these later on the admin page
			</p>
			<div>
				<fancy-input v-model='forumName' width='100%' placeholder='Forum name'></fancy-input>
				<p class='p--small'>These are like 'sub-forums'. Separate them with commas (e.g. books, technology, cars)</p>
				<fancy-input v-model='categories' width='100%' placeholder='Categories'></fancy-input>
				<p class='p--small'>What is your forum about?</p>
				<fancy-textarea v-model='forumDescription' width='100%' placeholder='Forum description'></fancy-textarea>
				<button style='width: 100%;' class='button button--green'>Finish</button>
			</div>
		</div>
	</div>
</template>

<script>
	import FancyInput from '../FancyInput'
	import FancyTextarea from '../FancyTextarea'

	export default {
		name: 'start',
		data () {
			return {
				username: '',
				password: '',
				confirmPassword: '',
				forumName: '',
				forumDescription: '',
				categories: '',
				panel: 1,

				errors: {
					username: '',
					password: '',
					confirmPassword: ''
				}
			}
		},
		components: {
			FancyInput,
			FancyTextarea
		},
		computed: {},
		methods: {
			clearErrors () {
				this.errors.username = ''
				this.errors.password = ''
				this.errors.confirmPassword = ''
			},
			createAccount () {
				this.clearErrors()

				if(this.password !== this.confirmPassword) {
					this.errors.confirmPassword =  'Passwords must match!'
				} else {
					this.panel = 2
				}
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.route_container--fullscreen {
		position: fixed;
		top: 0;
		margin: 0;
		z-index: 10;
		left: 0;
		height: 100%;
		padding: 0;
		width: 100%;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.explanation {
		font-size: 1.25rem;
		width: 25rem;
	}

	.p--small {
		margin: 0.5rem 0;
		width: 25rem;
	}

</style>