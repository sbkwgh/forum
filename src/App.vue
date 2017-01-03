<template>
	<div id='app'>
		<modal-window v-model='loginSignupModalVisible'>
			<tab-view :tabs='["Sign up", "Login"]'>
				<template slot='first'>
					<p style='margin-top: 0;'>
						Sign up to create and post in threads.
						<br/>It only takes a few seconds
					</p>
					{{signup.username}}
					<fancy-input
						v-model='signup.username'
						placeholder='Username'
						width='100%'
					>
					</fancy-input>
					<fancy-input
						v-model='signup.password'
						placeholder='Password'
						type='password'
						width='100%'
					>
					</fancy-input>
					<fancy-input
						v-model='signup.confirmPassword'
						placeholder='Confirm password'
						type='password'
						width='100%'
					>
					</fancy-input>
					<button class='button'>
						Sign up
					</button>
					<button class='button' @click='cancel'>
						Cancel
					</button>
				</template>
				<template slot='second'>
					text 2<br/>
					text 2<br/>
					text 2<br/>
					text 2<br/>
					text 2<br/>
					text 2<br/>
				</template>
			</tab-view>
		</modal-window>
		<header class='header'>
			<div class='header__group'>
				<div class='logo'>{{meta.name}}</div>
			</div>
			<div class='header__group'>
				<div class='button button--green' @click='showLoginSignupModal("signup")'>
					Sign up
				</div>
				<div class='button' @click='showLoginSignupModal("login")'>
					Login
				</div>
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
window.MODAL_TAB = 0;

	import ModalWindow from './components/ModalWindow'
	import TabView from './components/TabView'
	import FancyInput from './components/FancyInput'

	export default {
		name: 'app',
		components: {
			ModalWindow,
			TabView,
			FancyInput
		},
		data () {
			return {
				meta: {
					name: 'Forum'
				},
				signup: {
					username: '',
					password: '',
					confirmPassword: ''
				},
				loginSignupModalVisible: false
			}
		},
		methods: {
			showLoginSignupModal (tab) {
				//TODO: show different tab depending on button

				this.loginSignupModalVisible = true;
			},
			cancel () {
			}
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

	.header {
		width: 100%;
		padding: 1rem 2rem;
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

		@at-root #{&}--orange {
			border-color: $color__orange--primary;
			&:hover { border-color: $color__orange--darker; }
			&:active { border-color: $color__orange--darkest; }
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
