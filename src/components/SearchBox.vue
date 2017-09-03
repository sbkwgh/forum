<template>
	<div
		class='search_box'
		tabindex='0'
		@keydown.enter='goToSearch'
	>
		<input
			class='search_box__field'
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
		props: ['placeholder'],
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
		border: thin solid $color__gray--darker;
		border-radius: 0.25rem;
		outline: none;
		display: inline-block;

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
			@extend .button;
			border: 0;
			border-radius: 0 0.125rem 0.125rem 0;
		}
	}
</style>