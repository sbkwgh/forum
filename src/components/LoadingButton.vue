<template>
	<div
		class='button loading_button'
		:class='{"loading_button--loading": loading}'
		@click='event("click")'
		@keydown='event("keydown")'
	>
		<div class='loading_button__icon' :class='{"loading_button__icon--dark": dark}'>
			<span></span>
			<span></span>
			<span></span>
		</div>
		<div class='loading_button__slot'>
			<slot></slot>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'LoadingButton',
		props: ['loading', 'dark'],
		methods: {
			event (name) {
				if(this.loading) {
					return;
				} else {
					this.$emit(name)
				}
			}
		}
	}
</script>

<style lang='scss'>
	@import '../assets/scss/variables.scss';

	@keyframes loading {
		0% {
			transform: scale(0.75);
		}
		50% {
			transform: scale(1.25);
		}
		100% {
			transform: scale(0.75);
		}
	}

	.loading_button {
		position: relative;

		@at-root #{&}__icon {
			transition: all 0.2s;
			position: absolute;
			width: calc(100% - 1rem);
			opacity: 0;
			display: flex;
			justify-content: center;
			height: calc(100% - 0.85rem);
			align-items: center;

			pointer-events: none;

			@at-root #{&}--dark {
				span {
					background-color: $color__darkgray--primary !important;
				}
			}

			span {
				height: 0.5rem;
				width: 0.5rem;
				display: inline-block;
				border-radius: 100%;
				background-color: rgba(256,256,256,0.9);
				animation-name: loading;
				animation-duration: 1s;
				animation-timing-function: linear;
				animation-iteration-count: infinite;
				margin: 0 0.25rem;

				&:nth-child(2n) { animation-delay: 0.333s; }
				&:nth-child(3n) { animation-delay: 0.666s; }
			}
		}
		@at-root #{&}__slot {
			transition: all 0.2s;
			opacity: 1;
		}
	}

	.loading_button--loading {
		cursor: not-allowed;

		.loading_button__icon {
			opacity: 1;
			transition: all 0.2s;
		}
		.loading_button__slot {
			opacity: 0;
			transition: all 0.2s;
		}
	}
</style>
