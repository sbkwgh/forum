<template>
	<div id='app'>
		<modal-window v-model='showAjaxErrorsModal' style='z-index: 100' width='25rem' :no-padding='true'>
			<div slot='main'>
				<p v-for='error in this.$store.state.ajaxErrors' style='margin: 1rem;'>{{error}}</p>
			</div>
			<button
				slot='footer'
				class='button button--modal'
				@click='showAjaxErrorsModal = false'
				ref='ajaxErrorsModalButton'
			>
				OK
			</button>
		</modal-window>
		<modal-window
			v-model='showAccountModal'
			@input='closeAccountModal'
			:no-padding='true'
			:hide-footer='true'
		>
			<tab-view :tabs='["Sign up", "Login"]' v-model="showAccountTab" padding='true' slot='main'>
				<template slot='Sign up'>
					<p style='margin-top: 0;' v-if='$store.state.token'>
						<strong>Providing the token is still valid, this will create an admin account</strong>
					</p>
					<p style='margin-top: 0;' v-else>
						Sign up to create and post in threads.
						<br/>It only takes a few seconds
					</p>

					<form @submit.prevent='createAccount'>

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

						<div style='margin-top: 0.5rem;'>
							<loading-button
								class='button--green button--margin'
								:loading='signup.loading'
								@click='createAccount'
							>
								Sign up
							</loading-button>
							<div class='button button--borderless' @click='closeAccountModal'>
								Cancel
							</div>
						</div>
					</form>
				</template>
				<template slot='Login'>
					<p style='margin-top: 0;'>
						Login to create and post in threads.
					</p>
					<form @submit.prevent='doLogin'>
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

						<div style='margin-top: 0.5rem;'>
							<loading-button
								class='button button--green button--margin'
								:loading='login.loading'
								@click='doLogin'
							>
								<span class='fa fa-unlock-alt' style='margin-right:0.25rem'></span> Log in
							</loading-button>
							<div class='button button--borderless' @click='closeAccountModal'>
								Cancel
							</div>
						</div>
					</form>
				</template>
			</tab-view>
		</modal-window>

		<header class='header'>
			<div class='header__group'>
				<router-link class='logo' to='/'>{{name}}</router-link>
			</div>
			<div class='header__group' :class='{ "header__group--show": showMenu }'>
				<template v-if='$store.state.username'>
					<notification-button></notification-button>
					<router-link
						to='/admin'
						class='button button--thin_text'
						v-if='$store.state.admin'
					>
						Admin settings
					</router-link>
					<router-link
						to='/settings'
						class='button button--thin_text'
					>
						Settings
					</router-link>
					<loading-button
						@click='logout'
						:loading='loadingLogout'
						class='button--thin_text'
					>
						Log out
					</loading-button>
				</template>
				<template v-else>
					<div class='button button--green button--thin_text' @click='showAccountModalTab(0)'>
						Sign up
					</div>
					<div class='button button--thin_text' @click='showAccountModalTab(1)'>
						Login
					</div>
				</template>
				<search-box header-bar='true'></search-box>
			</div>
			<div class='header__overlay' :class='{ "header__overlay--show": showMenu }' @click='toggleMenu'></div>
			<span class='fa fa-bars header__menu_button' @click='toggleMenu'></span>
		</header>
		<not-found v-show='$store.state.show404Page'></not-found>
		<router-view v-show='!$store.state.show404Page'></router-view>
	</div>
</template>

<script>
	import ModalWindow from './components/ModalWindow'
	import TabView from './components/TabView'
	import FancyInput from './components/FancyInput'
	import LoadingButton from './components/LoadingButton'
	import NotificationButton from './components/NotificationButton'
	import SearchBox from './components/SearchBox'

	import NotFound from './components/routes/NotFound'
	
	import AjaxErrorHandler from './assets/js/errorHandler'

	export default {
		name: 'app',
		components: {
			ModalWindow,
			TabView,
			FancyInput,
			LoadingButton,
			NotificationButton,
			SearchBox,
			NotFound
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
				showMenu: false,
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
		methods: {
			showAccountModalTab (index) {
				this.toggleMenu()
				this.showAccountModal = true
				this.showAccountTab = index
			},
			toggleMenu () {
				this.showMenu = !this.showMenu
			},
			logout () {
				this.toggleMenu()
				this.loadingLogout = true

				this.axios.post(
					'/api/v1/user/' +
					this.$store.state.username +
					'/logout'
				).then(res => {
					this.loadingLogout = false
					this.$store.commit('setUsername', '')
					this.$store.commit('setAdmin', res.data.admin)

					socket.emit('accountEvent')

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

				this.$store.commit('setToken', null)
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

				let postParams = {
					username: this.signup.username,
					password: this.signup.password
				}
				if(this.$store.state.token) {
					postParams.admin = true
					postParams.token = this.$store.state.token
				}

				if(this.signup.password !== this.signup.confirmPassword) {
					this.signup.errors.confirmPassword = 'Passwords must match'
				} else {
					this.signup.loading = true

					this.axios.post('/api/v1/user', postParams).then(res => {
						this.signup.loading = false
						this.$store.commit('setUsername', res.data.username)
						this.$store.commit('setAdmin', res.data.admin)
						this.closeAccountModal()

						socket.emit('accountEvent')
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

					socket.emit('accountEvent')
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
					this.$store.commit('setSettings', res.data)
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
		},
		watch: {
			$route () {
				this.showMenu = false
			},
			'$store.state.ajaxErrorsModal': function(val) {
				if(val) {
					this.$refs.ajaxErrorsModalButton.focus()
				}
			}
		}
	}
</script>

<style lang='scss'>
	@import url('https://fonts.googleapis.com/css?family=Lato:300,300i,400,400i,700');
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
		max-width: 1250px;
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
			align-items: center;
			> * { margin: 0 0.5rem; }
			> *:first-child { margin-left: 0; }
			> *:last-child { margin-right: 0; }
		}

		@at-root #{&}__menu_button {
			position: fixed;
			left: 1rem;
			z-index: 1;
			font-size: 1.5rem;
			top: 1rem;
			display: none;
		}

		@at-root #{&}__overlay {
			width: 100%;
			height: 100%;
			position: fixed;
			top: 0;
			left: 0;
			z-index: 1;
			pointer-events: none;
			opacity: 0;
			background-color: hsla(215, 13%, 25%, 0.5);
			transition: all 0.4s;
		}
	}

	.logo {
		@include text($font--role-emphasis, 2rem, 600);
		@include user-select(none);
		cursor: pointer;
		background: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 20rem;


		&:hover, &:visited, &:active {
			outline: none;
			color: $color__text--primary;
		}
	}

	@media (max-width: 870px) {
		.route_container {
			width: calc(100% - 2rem);
			margin: 0 1rem;
			margin-top: 0rem;
		}

		.logo {
			position: relative;
			z-index: 2;
			max-width: calc(100vw - 7rem);
		}

		.header__menu_button {
			display: inline-block;
			cursor: pointer;
		}

		.header__overlay--show {
			pointer-events: all;
			opacity: 1;
		}

		.header__group:first-child {
			margin-left: 1rem;
		}

		.header__group:nth-child(2) {
			position: fixed;
			padding-top: 1.5rem;
			width: 17rem;
			display: flex;
			flex-direction: column;
			z-index: 2;
			background: #fff;
			top: 0;
			left: calc(-100% - 2rem);
			height: 100%;
			box-shadow: none;
			transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease-in;

			> .button {
				width: 100%;
				border-radius: 0;
				margin: 0;
				margin-bottom: 1rem;
			}

			&::before {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 0.3rem;
				content: '';
				background: linear-gradient(to right, hsl(200, 98%, 43%), hsla(193, 98%, 48%, 1));
			}
		}
		.header__group:nth-child(2).header__group--show {
			left: 0;
			box-shadow: 0 0 1rem rgba(0, 0, 0, 0.4);
		}
		.search_box {
			margin: 0;
			display: inline-block;
		}
	}
</style>
