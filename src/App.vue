<template>
	<div id='app'>
		<modal-window v-model='showAjaxErrorsModal' style='z-index: 100' width='25rem'>
			<div style='padding: 0rem 1rem 1rem 1rem; border-radius: 0.25rem;'>
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
						:error='signup.errors.hash'
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
						:error='login.errors.hash'
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
					<notification-button></notification-button>
					<button @click='$router.push("/admin")' class='button' v-if='$store.state.admin'>
						Admin settings
					</button>
						<button @click='$router.push("/settings")' class='button' >
						Settings
					</button>
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
					<button class='button button--borderless search__button'><span class='fa fa-search'></span></button>
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
	import NotificationButton from './components/NotificationButton'

	import mapGetters from 'vuex'

	import AjaxErrorHandler from './assets/js/errorHandler'
	let { addFlexBoxChildren } = require('./assets/js/flexBoxGridCorrect')

	export default {
		name: 'app',
		components: {
			ModalWindow,
			TabView,
			FancyInput,
			LoadingButton,
			NotificationButton
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
						hash: '',
						confirmPassword: ''
					}
				},
				login: {
					username: '',
					password: '',

					loading: false,

					errors: {
						username: '',
						hash: ''
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
					this.$store.commit('setAdmin', res.data.admin)

					this.$router.push('/')
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
				this.signup.errors.hash = ''
				this.signup.errors.confirmPassword = ''
			},
			clearLogin () {
				this.login.username = ''
				this.login.password = ''
			},
			clearLoginErrors () {
				this.login.errors.username = ''
				this.login.errors.hash = ''
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
						this.$store.commit('setAdmin', res.data.admin)
						this.closeAccountModal()

						socket.emit('login')
					}).catch(e => {
						this.signup.loading = false

						this.ajaxErrorHandler(e, (error) => {
							let path = error.path

							if(this.signup.errors[path] !== undefined && this.signup.errors[path] !== undefined) {
								this.signup.errors[path] = error.message
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
					this.$store.commit('setAdmin', res.data.admin)
					this.closeAccountModal()

					socket.emit('login')
				}).catch(e => {
					this.login.loading = false
					this.ajaxErrorHandler(e, (error) => {
						let path = error.path

						if(this.signup.errors[path] !== undefined && this.signup.errors[path] !== undefined) {
							this.signup.errors[path] = error.message
						}
					})
				})
			}
		},
		created () {
			this.axios.get('/api/v1/settings')
				.then(res => {
					this.$store.commit('setForumName', res.data.forumName)
					this.$store.commit('setForumDescription', res.data.forumDescription)

					this.$store.dispatch('setTitle', this.$store.state.meta.title)
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
					
					//Need categories to have loaded to set
					//the title of the index page
					//but if we're on another page (i.e. title is not set)
					//don't overwrite the title
					if(!this.$store.state.meta.title.length && this.$route.params.category) {
						let selectedCategory = this.$route.params.category.toUpperCase()
						let category = this.categories.find(c => c.value === selectedCategory)

						this.$store.dispatch('setTitle', category.name)
					}
				})
				.catch(this.ajaxErrorHandler)
		}
	}
</script>

<style lang='scss'>
	@import url('https://fonts.googleapis.com/css?family=Lato:300,300i,400,400i,700,700i|Montserrat');
	@import './assets/scss/variables.scss';
	@import './assets/scss/elementStyles.scss';

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
		padding: 0.5rem 2rem;
		position: fixed;
		top: 0;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: space-between;

		border-bottom: 0.125rem solid $color__gray--primary;
		background-color: #fff;

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

	.search {
		border: 0.125rem solid $color__gray--primary;
		border-radius: 0.25rem;

		@at-root #{&}__field {
			outline: none;
			height: 100%;
			padding: 0 0.5rem;
			border: 0;

			@include text;
			color: $color__text--primary;

			@include placeholder {
				@include text;
				color: $color__lightgray--darkest;
			}
		}
		@at-root #{&}__button {
			border-radius: 0;
		}
	}
</style>
