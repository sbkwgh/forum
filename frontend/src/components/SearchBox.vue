<template>
	<div
		class='search_box'
		ref='root'
	>
		<div
			class='search_box__input'
			tabindex='0'
			@keydown.enter='goToSearch'
			@click='showResults = true'
		>
			<input
				class='search_box__input__field'
				:class='{ "search_box__input__field--header": headerBar }'
				:placeholder='placeholder || "Search this forum"'
				v-model='searchField'
			>
			<button
				class='search_box__input__button'
				@click='goToSearch'
			>
				<span class='fa fa-search'></span>
			</button>
		</div>
		<div class='search_box__results' :class='{ "search_box__results--show": showResults }'>
			<div class='search_box__results__header'>Threads</div>
			<div class='search_box__results__search_all'>
				<span class='fa fa-fw fa-search'></span>
				Search all threads containing '{{searchField}}'
			</div>
			<div class='search_box__results__thread' v-for='i in 5'>
				<div class='search_box__results__title'>Thread title</div>
				<div class='search_box__results__content'>Title content here</div>
			</div>
			<div class='search_box__results__header search_box__results__header--divider'>Users</div>
			<div class='search_box__results__search_all'>
				<span class='fa fa-fw fa-search'></span>
				Search all users beginning '{{searchField}}'
			</div>
			<div class='search_box__results__user' for='i in 2'>
				<avatar-icon size='tiny' :user='{ username: "username" }'></avatar-icon>
				<div class='search_box__results__title'>Username here</div>
			</div>
		</div>
	</div>
</template>

<script>
	import AvatarIcon from './AvatarIcon'

	export default {
		name: 'SearchBox',
		props: ['placeholder', 'header-bar'],
		components: { AvatarIcon },
		data () {
			return {
				searchField: '',
				showResults: false
			}
		},
		methods: {
			goToSearch () {
				if(this.searchField.trim().length) {
					this.$router.push("/search/" + encodeURIComponent(this.searchField))
				}
			}
		},
		mounted () {
			document.body.addEventListener('click', e => {
				//If results box is showing, the root element is loaded and the click target
				//is not part of the search box, then hide the results box
				if(this.showResults && this.$refs.root && !this.$refs.root.contains(e.target)) {
					this.showResults = false;
				}
			})
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';
	@import '../assets/scss/elementStyles.scss';

	.search_box {
		position: relative;

		@at-root #{&}__input {
			border: 1.5px solid $color__gray--darkest;
			border-right: 0;
			border-radius: 0.25rem;
			outline: none;
			display: inline-block;
			overflow: hidden;

			@at-root #{&}__field {
				outline: none;
				height: 100%;
				padding: 0 0.5rem;
				border: 0;
				transition: width 0.2s;

				@include text;
				color: $color__text--primary;

				@include placeholder {
					@include text;
					color: $color__darkgray--primary;
				}
			}
			@at-root #{&}__button {
				@extend .button;

				border: 0;
				border-right: 1.5px solid $color__gray--darkest;
				border-radius: 0 0.2rem 0.2rem 0;

				&:hover, &:active {
					border-color: $color__gray--darkest;
				}
			}
		}
		
		@at-root #{&}__results {
			background-color: #fff;
			border: 1.5px solid $color__gray--darkest;
			border-radius: 0.25rem;
			box-shadow: 0 0.25rem 1rem rgba(#000, 0.125);
			max-height: 20rem;
			opacity: 0;
			overflow-y: auto;
			overflow-x: hidden;
			pointer-events: none;
			position: absolute;
			right: 0;
			transform: translateY(-0.25rem);
			transition: opacity 0.2s, transform 0.2s;
			width: 150%;

			@at-root #{&}--show {
				opacity: 1;
				pointer-events: all;
				transform: translateY(0rem);
			}

			@at-root #{&}__header {
				cursor: default;
				font-weight: 600;
				font-size: 0.9rem;
				padding: 0.5rem 1rem;
				position: sticky;

				@at-root #{&}--divider {
					border-top: thin solid $color__gray--primary;
				}
			}
		
			@at-root #{&}__search_all {
				display: flex;
				flex-direction: row;

				span {
					padding-top: 0.15rem;
					margin-right: 0.5rem;
				}
			}

			@at-root #{&}__thread, #{&}__user, #{&}__search_all {
				cursor: pointer;
				padding: 0.5rem 1rem;
				transition: background-color 0.2s;

				&:hover {
					background-color: $color__lightgray--darker;
				}
				&:focus {
					outline: none;
					background-color: $color__lightgray--darker;
				}
				&:last-of-type {
					margin-bottom: 0.5rem;
				}
			}
			@at-root #{&}__user {
				align-items: center;
				display: flex;
				flex-direction: row;
				padding: 0.25rem 1rem;

				.avatar_icon {
					pointer-events: none;
				}

				&:last-of-type {
					margin-bottom: 0.5rem;
				}
			}

			@at-root #{&}__title, #{&}__search_all {
				font-weight: 400;
				font-size: 0.9rem;
			}
			@at-root #{&}__content {
				color: $color__text--secondary;
				font-size: 0.85rem;
			}
		}
	}


	@media (max-width: 950px) and (min-width: $breakpoint--tablet) {
		.search_box__field--header {
			width: 4rem;
		}
	}
</style>