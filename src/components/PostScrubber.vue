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
		margin-top: 5.25rem;

		@at-root #{&}__line {
			height: 100%;
			background-color: $color__gray--darker;
			border-radius: 1rem;
			width: 0.125rem;
		}

		@at-root #{&}__dragger {
			background-color: $color__blue--primary;
			width: 0.5rem;
			border-radius: 1rem;
			height: 1.5rem;
			position: absolute;
			top: 0;
			left: calc( (0.5rem - 0.125rem) / -2);
			margin-top: calc(-1.5rem /2 );
			cursor: pointer;
			transition: background-color 0.2s;

			&:hover {
				background-color: $color__blue--darker;
			}
			&:active {
				background-color: $color__blue--darkest;
			}
		}
	}
</style>