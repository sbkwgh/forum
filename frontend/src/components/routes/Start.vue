<template>
	<div class='route_container route_container--fullscreen'>
		<div class='panel' v-show='panel === 1'>
			<div class='h1'>Hi.</div>
			<p class='explanation'>
				First create your admin account for the forum.
			</p>
			<form @submit.prevent='createAccount'>
				<fancy-input
					v-model='username'
					:error='errors.username'
					width='100%'
					placeholder='Username'
				></fancy-input>
				<fancy-input
					v-model='password'
					:error='errors.hash'
					width='100%'
					placeholder='Password'
					type='password'
				></fancy-input>
				<fancy-input
					v-model='confirmPassword'
					:error='errors.confirmPassword'
					width='100%'
					placeholder='Confirm password'
					type='password'
				></fancy-input>
				<loading-button
					style='width: 100%;'
					class='button button--green'
					:loading='loading'
				>
					Create account
				</loading-button>
			</form>
		</div>
		<div class='panel' v-show='panel === 2'>
			<div class='h1'>A few settings</div>
			<p class='explanation'>
				You can change these later on the admin page
			</p>
			<form @submit.prevent='addSettings'>
				<fancy-input
					v-model='forumName'
					:error='errors.forumName'
					width='100%'
					placeholder='Forum name'
				></fancy-input>
				<p class='p--small'>What is your forum about?</p>
				<fancy-textarea
					v-model='forumDescription'
					:error='errors.forumDescription'
					width='100%'
					placeholder='Forum description'
				></fancy-textarea>
				<loading-button
					style='width: 100%;'
					class='button button--green'
					:loading='loading'
				>
					Add settings
				</loading-button>
			</form>
		</div>
		<div class='panel' v-show='panel === 3'>
			<div class='h1'>Categories</div>
			<p class='explanation'>
				People post threads in categories so that they're easier to sort through<br/>
				You can add or remove them later on the admin page
			</p>
			<form @submit.prevent='addCategory'>
				<p v-if='categories.length'>
					<b>Categories:</b>
					{{categories.join(', ')}}
				</p>
				<p v-else>No categories added</p>
				<div class='categories_form'>
					<fancy-input
						v-model='category'
						:error='errors.name'
						:large='true'
						:error-bottom='true'
						width='calc(100% - 9rem)'
						placeholder='Category name'
					></fancy-input>
					<loading-button
						class='button'
						:loading='loading'
					>
						Add category
					</loading-button>
				</div>
			</form>
			<button style='width: 100%;' class='button button--green' @click='finish'>Finish</button>
		</div>
	</div>
</template>

<script>
	import FancyInput from '../FancyInput'
	import FancyTextarea from '../FancyTextarea'
	import LoadingButton from '../LoadingButton'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'start',

		data () {
			return {
				username: '',
				password: '',
				confirmPassword: '',
				forumName: '',
				forumDescription: '',

				loading: false,

				category: '',
				categories: [],

				panel: 1,

				errors: {
					username: '',
					hash: '',
					confirmPassword: '',
					forumName: '',
					forumDescription: '',
					name: ''
				},

				modal: {
					show: false,
					errors: []
				}
			}
		},
		components: {
			FancyInput,
			FancyTextarea,
			LoadingButton
		},
		computed: {},
		methods: {
			clearErrors () {
				this.errors.username = ''
				this.errors.hash = ''
				this.errors.confirmPassword = ''
				this.errors.forumName = ''
				this.errors.forumDescription = ''
				this.errors.name = ''
			},
			errorCallback (err) {
				this.loading = false

				AjaxErrorHandler(this.$store)(err, (error, modalErrors) => {
					if(this.errors[error.path] !== undefined) {
						this.errors[error.path] = error.message
					} else {
						modalErrors.push(error.message)
					}
				})
			},
			createAccount () {
				this.clearErrors()

				if(this.password !== this.confirmPassword) {
					this.errors.confirmPassword =  'passwords do not match'

					return;
				}

				let req = this.axios.post('/api/v1/user', {
					username: this.username,
					password: this.password,
					admin: true
				})

				this.loading = true

				req.then(res => {
					this.$store.commit('setUsername', res.data.username)
					this.panel = 2
					this.loading = false
				}).catch(this.errorCallback)
			},
			addSettings () {
				this.clearErrors()

				if(!this.forumName.trim().length) {
					this.errors.forumName = 'Forum name can\'t be blank'
					return
				}

				this.loading = true

				let settingsReq = this.axios.put('/api/v1/settings', {
					forumName: this.forumName,
					forumDescription: this.forumDescription
				})

				settingsReq.then(res => {
					this.loading = false
					this.$store.commit('setSettings', res.data)
					this.panel = 3
				}).catch(this.errorCallback)
			},
			addCategory () {
				this.clearErrors()

				if(!this.category.length) {
					this.errors.name = 'Category name can\'t be blank'
					return
				}

				this.loading = true

				this.axios.post('/api/v1/category', {
					name: this.category.trim()
				}).then(res => {
					this.loading = false
					this.$store.commit('addCategories', res.data)
					this.categories.push(res.data.name)
				}).catch(this.errorCallback)

				this.category = ''
			},
			finish () {
				if(this.categories.length) this.$router.push('/')
			}
		},
		mounted () {
			this.$store.dispatch('setTitle', 'start')
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
	}

	.p--small {
		margin: 0.5rem 0;
		width: 25rem;
	}

	.panel {
		width: 30rem;
	}

	.categories_form {
		margin-bottom: 1rem;
		align-items: flex-start;
		display: flex;

		.fancy_input {
			flex-grow: 6;
			margin: 0;
			margin-right: 0.5rem;
		}
		div.button {
			height: 2rem;
			padding: 0.25rem 0.5rem;
		}
	}


	@media (max-width: 550px) {
		.panel {
			width: 100%;
			padding: 0.5rem;
		}
	}
</style>