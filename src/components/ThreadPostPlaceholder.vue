<template>
	<div
		class='post_placeholder'
	>
		<div class='post_placeholder__meta_data'>
			<div class='post_placeholder__avatar_icon'></div>
			<div class='post_placeholder__bar post_placeholder__bar--thin post_placeholder__bar--33'></div>
		</div>
		<div class='post_placeholder__content'>
			<div class='post_placeholder__bar post_placeholder__bar--58'></div>
			<div class='post_placeholder__bar post_placeholder__bar--66'></div>
			<div class='post_placeholder__bar post_placeholder__bar--50'></div>
		</div>
	</div>
</template>

<script>
	export default { name: 'ThreadPostPlaceholder' }
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.post_placeholder {
		position: relative;
		border-bottom: thin solid $color__gray--primary;
		border-radius: 0.25rem;
		transition: background-color 0.5s;
		margin: 0.5rem 0;

		@at-root #{&}--last {
			padding-bottom: 0.5rem;
			border-bottom: thin solid $color__gray--primary;
		}

		@at-root #{&}__meta_data {
			display: flex;
			padding-top: 0.75rem;
			position: relative;
			margin-left: 4rem;
		}
		@at-root #{&}__avatar_icon {
			position: absolute;
			left: -4rem;
			height: 3rem;
			width: 3rem;
			border-radius: 100%;
			background-color: $color__gray--primary;

			@include flash;
		}
		@at-root #{&}__bar {
			background-color: $color__gray--primary;
			height: 1.5rem;
			width: 75%;
			margin-bottom: 0.5rem;

			@include flash;

			@at-root #{&}--thin {
				height: 1rem;
			}
			@at-root #{&}--33 { width: 33%; }
			@at-root #{&}--58 { width: 58%; }
			@at-root #{&}--66 { width: 66%; }
			@at-root #{&}--50 { width: 50%; }
		}
		@at-root #{&}__content {
			padding: 0.5rem 0 0.5rem 4rem;
		}
	}
</style>