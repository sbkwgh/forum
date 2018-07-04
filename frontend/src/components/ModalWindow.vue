<template>
	<div
		class='modal_window__overlay'
		:class='{"modal_window__overlay--show": value}'
		@click.self='closeModal'
	>
		<div
			class='modal_window'
			:class='{"modal_window--show": value}'
			:style='{"width": width || "20rem"}'
		>
			<div
				class='modal_window__loading_overlay'
				:class='{"modal_window__loading_overlay--show": loading}'
			>
				<loading-icon></loading-icon>
			</div>

			<span
				class='modal_window__close fa fa-times'
				@click='closeModal'
				v-if='closeButton'
			></span>
			<div
				class='modal_window__main'
				:class='{"modal_window__main--no_padding": noPadding}'
			>
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
		props: [
			'value', 'width', 'close-button', 'hide-footer', 'no-padding', 'loading'
		],
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
		align-items: center;
		background-color: rgba(0, 0, 0, 0.5);;
		display: grid;
		grid-template-rows: auto 2rem;
		height: 100%;
		justify-content: center;
		left: 0;
		padding-top: 2rem;
		opacity: 0;
		overflow-y: auto;
		pointer-events: none;
		position: fixed;
		top: 0;
		transition: opacity 0.2s;
		width: 100%;
		z-index: 4;

		&::after {
			content: '';
			height: 2rem;
		}

		@at-root #{&}--show {
			opacity: 1;
			pointer-events: all;
		}
	}
	.modal_window {
		background-color: #fff;
		border-radius: 0.25rem;
		transform: scale(1.1);
		transition: transform 0.2s, box-shadow 0.2s;

		@at-root #{&}--show {
			transform: scale(1);
			box-shadow: 0 14px 28px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.10);
		}

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
			font-weight: 300;
			padding: 1rem;

			@at-root #{&}--no_padding {
				padding: 0;
			}
		}
		@at-root #{&}__footer {
			align-items: center;
			background-color: $color__lightgray--darkest;
			border-radius: 0 0 0.25rem 0.25rem;
			display: flex;
			justify-content: flex-end;
			padding: 0.5rem 1rem;
			width: 100%;

			button {
				margin-left: 0.5rem;
			}
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
	}
</style>