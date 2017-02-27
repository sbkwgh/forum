<template>
	<div id='app'>
		<modal-window v-model='showAjaxErrorsModal' style='z-index: 100' width='25rem'>
			<div style='padding: 0rem 1rem 1rem 1rem;'>
				<p v-for='error in this.$store.state.ajaxErrors'>{{error}}</p>
				<button class='button button--modal' @click='showAjaxErrorsModal = false'>OK</button>
			</div>
		</modal-window>
		<modal-window v-model='showAccountModal'>
			<tab-view :tabs='["Sign up", "Login"]' v-model="showAccountTab" padding='true'>
				<template slot='Sign up'>
					<p style='margin-top: 0;'>
						Sign up to create and post in threads.
						<br/>It only takes a few seconds
					</p>
					<fancy-input
						v-model='signup.username'
						:error='signup.errors.username'
						placeholder='Username'
						width='100%'
					>
					</fancy-input>
					<fancy-input
						v-model='signup.password'
						:error='signup.errors.password'
						placeholder='Password'
						type='password'
						width='100%'
					>
					</fancy-input>
					<fancy-input
						v-model='signup.confirmPassword'
						:error='signup.errors.confirmPassword'
						placeholder='Confirm password'
						type='password'
						width='100%'
					>
					</fancy-input>
					<loading-button class='button--green' :loading='signup.loading' @click='createAccount'>
						Sign up
					</loading-button>
					<button class='button' @click='closeAccountModal'>
						Cancel
					</button>
				</template>
				<template slot='Login'>
					<p style='margin-top: 0;'>
						Login to create and post in threads.
					</p>
					<fancy-input
						v-model='login.username'
						:error='login.errors.username'
						placeholder='Username'
						width='100%'
					>
					</fancy-input>
					<fancy-input
						v-model='login.password'
						:error='login.errors.password'
						placeholder='Password'
						type='password'
						width='100%'
					>
					</fancy-input>
					<loading-button class='button button--green' :loading='login.loading' @click='doLogin'>
						Log in
					</loading-button>
					<button class='button' @click='closeAccountModal'>
						Cancel
					</button>
				</template>
			</tab-view>
		</modal-window>
		<header class='header'>
			<div class='header__group'>
				<div class='logo' @click='$router.push("/")'>{{name}}</div>
			</div>
			<div class='header__group'>
				<template v-if='$store.state.username'>
					<loading-button @click='logout' :loading='loadingLogout'>
						Log out
					</loading-button>
				</template>
				<template v-else>
					<div class='button button--green' @click='showAccountModalTab(0)'>
						Sign up
					</div>
					<div class='button' @click='showAccountModalTab(1)'>
						Login
					</div>
				</template>
				<div class='search' tabindex='0'>
					<input class='search__field' placeholder='Search this forum'>
					<button class='button button--borderless'><span class='fa fa-search'></span></button>
				</div>
			</div>
		</header>
		<router-view></router-view>
	</div>
</template>

<script>
	import ModalWindow from './components/ModalWindow'
	import TabView from './components/TabView'
	import FancyInput from './components/FancyInput'
	import LoadingButton from './components/LoadingButton'

	import mapGetters from 'vuex'

	import AjaxErrorHandler from './assets/js/errorHandler'
	let { addFlexBoxChildren } = require('./assets/js/flexBoxGridCorrect')

	export default {
		name: 'app',
		components: {
			ModalWindow,
			TabView,
			FancyInput,
			LoadingButton
		},
		data () {
			return {
				signup: {
					username: '',
					password: '',
					confirmPassword: '',

					loading: false,

					errors: {
						username: '',
						password: '',
						confirmPassword: ''
					}
				},
				login: {
					username: '',
					password: '',

					loading: false,

					errors: {
						username: '',
						password: ''
					}
				},
				loadingLogout: false,
				ajaxErrorHandler: AjaxErrorHandler(this.$store)
			}
		},
		computed: {
			name () {
				return this.$store.state.meta.name
			},
			showAccountModal: {
				get () { return this.$store.state.accountModal },
				set (val) {
					this.$store.commit('setAccountModalState', val);
				}
			},
			showAjaxErrorsModal: {
				get () { return this.$store.state.ajaxErrorsModal },
				set (val) { this.$store.commit('setAjaxErrorsModalState', val) }
			},
			showAccountTab : {
				get (val) { return this.$store.state.accountTabs },
				set (index) { this.$store.commit('setAccountTabs', index) }
			},
			categories() {
				return this.$store.state.meta.categories
			}
		},
		watch: {
			$route (to) {
				if(to.path === '/') {
					setTimeout(() => {
						addFlexBoxChildren('.index_categories', 'index_category');
					}, 50);
				}
			},
			categories () {
				setTimeout(() => {
					addFlexBoxChildren('.index_categories', 'index_category');
				}, 50);
			}
		},
		methods: {
			showAccountModalTab (index) {
				this.showAccountModal = true
				this.showAccountTab = index
			},
			logout () {
				this.loadingLogout = true

				this.axios.post(
					'/api/v1/user/' +
					this.$store.state.username +
					'/logout'
				).then(res => {
					this.loadingLogout = false
					this.$store.commit('setUsername', '')
				}).catch(err => {
					this.loadingLogout = false
					this.ajaxErrorHandler(err)
				})
			},
			clearSignup () {
				this.signup.username = ''
				this.signup.password = ''
				this.signup.confirmPassword = ''
			},
			clearSignupErrors () {
				this.signup.errors.username = ''
				this.signup.errors.password = ''
				this.signup.errors.confirmPassword = ''
			},
			clearLogin () {
				this.login.username = ''
				this.login.password = ''
			},
			clearLoginErrors () {
				this.login.errors.username = ''
				this.login.errors.password = ''
			},
			closeAccountModal () {
				this.showAccountModal = false
				this.clearLogin()
				this.clearSignup()
				this.clearLoginErrors()
				this.clearSignupErrors()
			},
			createAccount () {
				this.clearSignupErrors()

				if(this.signup.password !== this.signup.confirmPassword) {
					this.signup.errors.confirmPassword = 'Passwords must match'
				} else {
					this.signup.loading = true

					this.axios.post('/api/v1/user', {
						username: this.signup.username,
						password: this.signup.password
					}).then(res => {
						this.signup.loading = false
						this.$store.commit('setUsername', res.data.username)
						this.closeAccountModal()
					}).catch(e => {
						this.signup.loading = false

						this.ajaxErrorHandler(e, (error) => {
							let param = error.parameter

							if(this.signup.errors[param] !== undefined) {
								this.signup.errors[param] = error.message
							}
						})
					})
				}
			},
			doLogin () {
				this.clearSignupErrors()

				if(!this.login.username.trim().length) {
					this.login.errors.username = 'Username must not be blank'
					return
				}

				this.login.loading = true

				this.axios.post(`/api/v1/user/${this.login.username}/login`, {
					password: this.login.password
				}).then(res => {
					this.login.loading = false
					this.$store.commit('setUsername', res.data.username)
					this.closeAccountModal()
				}).catch(e => {
					this.login.loading = false
					this.ajaxErrorHandler(e, (error) => {
						let param = error.parameter

						if(this.login.errors[param] !== undefined) {
							this.login.errors[param] = error.message
						}
					})
				})
			}
		},
		created () {
			this.axios.get('/api/v1/settings')
				.then(res => {
					let usernameCookie = document.cookie
						.split(';')
						.map(c => c.split('='))
						.filter(pair => pair[0].trim() === 'username')
						.map(pair => pair[1])[0]

					if(usernameCookie) this.$store.commit('setUsername', usernameCookie)

					this.$store.commit('setForumName', res.data.forumName)
				}).catch(err => {
					if(err.response.data.errors[0].name === 'noSettings') {
						this.$router.push('/start')
					} else {
						this.ajaxErrorHandler(err)
					}
				})

			this.axios.get('/api/v1/category')
				.then(res => {
					this.$store.commit('addCategories', res.data)
				}).catch(this.ajaxErrorHandler)
		}
	}
</script>

<style lang='scss'>
	@import url('https://fonts.googleapis.com/css?family=Lato:300,300i,400|Montserrat');
	@import './assets/scss/variables.scss';

	html, body {
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;

		color: $color__text--primary;
		@include text;	
	}

	* {
		box-sizing: border-box;
	}

	.route_container {
		width: 80%;
		margin: 0 auto;
		margin-top: 2rem;
		padding-bottom: 2rem;
	}

	#app {
		padding-top: 4.5rem;
		height: 100%;
	}

	.header {
		width: 100%;
		padding: 1rem 2rem;
		position: fixed;
		top: 0;
		z-index: 2;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;

		border-bottom: 0.125rem solid $color__gray--primary;

		@at-root #{&}__group {
			display: flex;
			> * { margin: 0 0.5rem; }
			> *:first-child { margin-left: 0; }
			> *:last-child { margin-right: 0; }
		}
	}

	.logo {
		@include text($font--role-emphasis, 2rem, normal);
		@include user-select(none);
		cursor: pointer;
	}

	.button {
		border: 0.125rem solid $color__gray--primary;
		display: inline-block;
		text-align: center;
		@include text($font--role-default, 1rem, 400);
		padding: 0.5rem;
		cursor: pointer;
		background-color: #fff;
		transition: background-color 0.2s, border-color 0.2s;
		outline: none;

		&:hover {
			background-color: $color__lightgray--primary;
			border-color: $color__gray--darker;
		}
		&:active {
			background-color: $color__lightgray--darker;
			border-color: $color__gray--darkest;
		}

		@at-root #{&}__icon {
		}

		@at-root #{&}--borderless {
			border: 0;
		}

		@at-root #{&}--modal {
			padding: 0.25rem 0.5rem;
			font-size: 0.8rem;
			float: right;
			margin-bottom: 1rem;

			&:last-child {
				margin-right: 0.5rem;
			}
		}

		@at-root #{&}--orange {
			border-color: $color__orange--primary;
			&:hover { border-color: $color__orange--darker; }
			&:active { border-color: $color__orange--darkest; }
		}
		@at-root #{&}--green {
			background-color: $color__green--primary;
			color: #fff;
			border-color: $color__green--darker;

			&:hover { 
				border-color: $color__green--darker;
				background-color: rgba(75, 171, 79, 0.86);
			}
			&:active {
				border-color: $color__green--darker;
				background-color: $color__green--darkester;
			}
		}
	}

	.input {
		border: 0.125rem solid $color__gray--primary;
		@include text;
		padding: 0.25rem;
		outline: none;

		&:hover {
			border-color: $color__gray--darker;
		}
		&:focus {
			border-color: $color__gray--darkest;
		}
	}

	.search {
		border: 0.125rem solid $color__gray--primary;

		&:hover {
			border-color: $color__gray--darker;
		}
		&:focus {
			border-color: $color__gray--darkest;
		}

		@at-root #{&}__field {
			outline: none;
			height: 100%;
			padding: 0 0.5rem;
			border: 0;
			@include text;

			@include placeholder {
				@include text;
			}
		}
	}
</style>
