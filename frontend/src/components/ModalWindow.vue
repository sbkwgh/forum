<template>
	<div class='modal_window__overlay' :class='{"modal_window--show": value}' @click.self='closeModal'>
		<div class='modal_window' :class='{"modal_window--show": value}' :style='{"width": width || "20rem"}'>
			<div
				class='modal_window__loading_overlay'
				:class='{
					"modal_window__loading_overlay--show": loading
				}'
			>
				<loading-icon></loading-icon>
			</div>

			<span
				class='modal_window__close'
				@click='closeModal'
				v-if='closeButton'
			>
				<font-awesome-icon :icon='["fa", "times"]' />
			</span>
			<div class='modal_window__main' :class='{ "modal_window__main--no_padding": noPadding }'>
				<slot name='main'></slot>
			</div>
			<div class='modal_window__footer' v-if='!hideFooter'>
				<slot name='footer'></slot>
			</div>
		</div>
	</div>
</template>

<script>
	import LoadingIcon from './LoadingIcon'

	export default {
		name: 'ModalWindow',
		props: ['value', 'width', 'close-button', 'hide-footer', 'no-padding', 'loading'],
		components: { LoadingIcon },
		methods: {
			closeModal () {
				this.$emit('input', false)
			}
		}
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
		box-shadow: 0 14px 28px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.10);
		background-color: #fff;
		opacity: 0;
		position: relative;
		border-radius: 0.25rem;
		pointer-events: none;
		transform: scale(1.1);

		transition: margin-top 0.3s, opacity 0.3s, transform 0.3s;

		@at-root #{&}__loading_overlay {
			position: absolute;
			left: 0;
			top: 0;
			height: 100%;
			width: 100%;
			z-index: 5;
			background-color: rgba(0, 0, 0, 0.3);
			display: flex;
			align-items: center;
			justify-content: center;
			pointer-events: none;
			opacity: 0;

			transition: all 0.2s;

			@at-root #{&}--show {
				pointer-events: all;
				opacity: 1;
			}
		}

		@at-root #{&}__main {
			padding: 0 1rem 1rem 1rem;
			border-radius: 0.25rem;

			@at-root #{&}--no_padding {
				padding: 0;
			}
		}
		@at-root #{&}__footer {
			background-color: $color__lightgray--darkest;
			border-radius: 0 0 0.25rem 0.25rem;
			display: flex;
			justify-content: flex-end;
			padding: 0.35rem 1rem;
		}

		@at-root #{&}__close {
			position: absolute;
			right: 0.7rem;
			top: 0.5rem;
			transition: color 0.2s;
			cursor: pointer;
			color: $color__gray--darkest;

			&:hover {
				color: $color__darkgray--primary;
			}
		}

		@at-root #{&}--show {
			margin-top: 0;
			transform: scale(1);
			opacity: 1;
			pointer-events: all;

			transition: all 0.3s;
		}
	}
</style>