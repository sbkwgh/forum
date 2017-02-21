<template>
	<div class='modal_window__overlay' :class='{"modal_window--show": show}'>
		<div class='modal_window' :class='{"modal_window--show": show}'>
			<slot></slot>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'ModalWindow',
		props: ['show']
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.modal_window__overlay {
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		position: fixed;
		z-index: 3;
		top: 0;
		left: 0;

		opacity: 0;
		pointer-events: none;
		transition:  opacity 0.3s;

		@at-root #{&}--show {
			opacity: 1;
			pointer-events: all;
			transition: opacity 0.3s;
		}
	}
	.modal_window {
		width: 20rem;
		background-color: #fff;
		margin-top: -3rem;
		opacity: 0;
		border: 0.125rem solid $color__gray--darkest;
		pointer-events: none;

		transition: margin-top 0.3s, opacity 0.3s;

		@at-root #{&}--show {
			margin-top: 0;
			opacity: 1;
			pointer-events: all;

			transition: all 0.3s;
		}
	}
</style>