<template>
	<div class='modal_window__overlay' :class='{"modal_window--show": internalShowModal}' @click.self='hideModal'>
		<div class='modal_window' :class='{"modal_window--show": internalShowModal}'>
			<slot></slot>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'ModalWindow',
		props: ['showModal'],
		data () {
			return {
				internalShowModal: this.showModal
			}
		},
		methods: {
			hideModal () {
				this.internalShowModal = false;
			}
		},
		mounted () {
			this.$watch('showModal', function(newVal) {
				this.internalShowModal = newVal;
			});
		}
	}
</script>

<style lang='scss' scoped>
	.modal_window__overlay {
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
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