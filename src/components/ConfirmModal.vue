<template>
	<modal-window :value='showModal' @input='setShowModal'>
		<div class='confirm_modal'>
			<slot></slot>
			<div class='confirm_modal__buttons'>
				<button class='button button--modal' @click='setShowModal(false)'>Cancel</button>
				<button class='button button--modal' :class='buttonColor' @click='confirm'>OK</button>
			</div>
		</div>
	</modal-window>
</template>

<script>
	import ModalWindow from './ModalWindow'

	export default {
		name: 'ConfirmModal',
		props: ['value', 'color'],
		components: {
			ModalWindow
		},
		data () {
			return {
				showModal: false
			}
		},
		computed: {
			buttonColor () {
				if(this.color) {
					return 'button--' + this.color
				} else {
					return ''
				}
			}
		},
		watch: {
			value (val) {
				this.showModal = val
			}
		},
		methods: {
			setShowModal (val) {
				this.showModal = val
				this.$emit('input', val)
			},
			confirm () {
				this.$emit('confirm')
				this.setShowModal(false)
			}
		},
		mounted () {
			this.setShowModal(this.value)
		}
	}
</script>

<style lang='scss' scoped>
	.confirm_modal {
		padding: 1rem;

		@at-root #{&}__buttons {
			margin-top: 1rem;
		}
	}
</style>