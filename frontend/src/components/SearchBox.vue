<template>
	<div
		class='search_box'
		tabindex='0'
		@keydown.enter='goToSearch'
	>
		<input
			class='search_box__field'
			:class='{ "search_box__field--header": headerBar }'
			:placeholder='placeholder || "Search this forum"'
			v-model='searchField'
		>
		<button
			class='search_box__button'
			@click='goToSearch'
		>
			<span class='fa fa-search'></span>
		</button>
	</div>
</template>

<script>
	export default {
		name: 'SearchBox',
		props: ['placeholder', 'header-bar'],
		data () {
			return {
				searchField: ''
			}
		},
		methods: {
			goToSearch () {
				if(this.searchField.trim().length) {
					this.$router.push("/search/" + this.searchField)
				}
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';
	@import '../assets/scss/elementStyles.scss';

	.search_box {
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

	@media (max-width: 950px) and (min-width: $breakpoint--tablet) {
		.search_box__field--header {
			width: 4rem;
		}
	}
</style>