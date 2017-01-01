<template>
	<div id='app'>
		<header class='header'>
			<div class='header__group'>
				<div class='logo'>{{meta.name}}</div>
			</div>
			<div class='header__group'>
				<div class='button button--green'>
					Sign up
				</div>
				<div class='button'>
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
	export default {
		name: 'app',
		components: {
		},
		data () {
			return {
				meta: {
					name: 'Forum'
				}
			}
		}
	}
</script>

<style lang='scss'>
	@import url('https://fonts.googleapis.com/css?family=Lato:300,300i,400|Montserrat');

	$font--role-default: 'Lato', sans-serif;
	$font--role-emphasis: 'Montserrat', sans-serif;

	$color__text--primary: rgba(0, 0, 0, 0.87);
	$color__text--secondary: rgba(0, 0, 0, 0.54);

	$color__lightgray--primary: #F5F5F5;
	$color__lightgray--darker: #EEEEEE;
	$color__lightgray--darkest: #E0E0E0;

	$color__gray--primary: #EEEEEE;
	$color__gray--darker: #E0E0E0;
	$color__gray--darkest: #BDBDBD;

	@mixin text($family: $font--role-default, $size: 1rem, $weight: 300) {
		font-family: $family;
		font-size: $size;
		font-weight: $weight;
	}

	@mixin optional-at-root($sel) {
		@at-root #{if(not &, $sel, selector-append(&, $sel))} {
			@content;
		}
	}

	@mixin placeholder {
		@include optional-at-root('::-webkit-input-placeholder') {
			@content;
		}

		@include optional-at-root(':-moz-placeholder') {
			@content;
		}

		@include optional-at-root('::-moz-placeholder') {
			@content;
		}

		@include optional-at-root(':-ms-input-placeholder') {
			@content;
		}
	}
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

		@at-root #{&}--borderless {
			border: 0;
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
