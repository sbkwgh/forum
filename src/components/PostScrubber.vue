<template>
	<div class='post_scrubber'>
		<div class='post_scrubber__line'></div>
		<div class='post_scrubber__dragger'></div>
	</div>
</template>

<script>
	export default {
		name: 'PostScrubber'
	}
</script>


<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.post_scrubber {
		height: 10rem;
		position: fixed;
		right: calc(10% + 5rem);
		margin-top: 4.5rem;

		@at-root #{&}__line {
			height: 100%;
			background-color: $color__gray--darker;
			border-radius: 1rem;
			width: 0.125rem;
		}
	}
</style>