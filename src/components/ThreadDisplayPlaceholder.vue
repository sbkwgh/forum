<template>
	<div class='thread_display_placeholder'>
		<div class='thread_display_placeholder__icon'></div>
		<div style='width: 100%;'>
			<div class='thread_display_placeholder__header'>
				<div class='thread_display_placeholder__bar thread_display_placeholder__bar--15'></div>	
				<div class='thread_display_placeholder__bar thread_display_placeholder__bar--33'></div>
			</div>
			<div class='thread_display_placeholder__replies_bar'>
				<div class='thread_display_placeholder__bar thread_display_placeholder__bar--20'></div>
				<div class='thread_display_placeholder__bar thread_display_placeholder__bar--5'></div>
			</div>
			<div class='thread_display_placeholder__content'>
				<div class='thread_display_placeholder__bar'></div>
				<div class='thread_display_placeholder__bar thread_display_placeholder__bar--58'></div>
			</div>
		</div>
	</div>
</template>

<script>	
	export default { name: 'ThreadDisplayPlaceholder' }
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.thread_display_placeholder {
		display: flex;
		padding: 0.5rem;
		padding-bottom: 0;
		margin-bottom: 1rem;
		transition: background-color 0.2s;
		position: relative;

		&:before {
			@include flash;

			content: '';
			position: absolute;
			left: 0rem;
			top: 0;
			width: 0.25rem;
			height: 100%;

		}

		&:after {
			content: '';
			position: absolute;
			width: calc(100% + 0.25rem);
			bottom: -0.5rem;
			left: -0.25rem;
			border-bottom: thin solid $color--lightgray__primary;
		}

		@at-root #{&}__bar {
			@include flash;

			background-color: $color__gray--primary;
			height: 0.85rem;
			width: 75%;
			margin-bottom: 0.35rem;

			@at-root #{&}--5 { width: 5%; }
			@at-root #{&}--15 { width: 15%; }
			@at-root #{&}--20 { width: 20%; }
			@at-root #{&}--33 { width: 33%; }
			@at-root #{&}--58 { width: 58%; }
		}

		@at-root #{&}__icon {
			@include flash;

			margin-right: 0.75rem;
			margin-left: 0.25rem;
			border-radius: 100%;
			background-color: $color__gray--darkest;
			height: 2.5rem;
			width: 2.5rem;
			font-size: 2rem;
			line-height: 2.25rem;
		}

	
		@at-root #{&}__header {
			display: flex;
			justify-content: space-between;
		}

		@at-root #{&}__replies_bar {
			display: flex;
			justify-content: space-between;
		}
	
		@at-root #{&}__content {
			margin-top: 0.5rem;
			word-break: break-all;
		}
	}
</style>