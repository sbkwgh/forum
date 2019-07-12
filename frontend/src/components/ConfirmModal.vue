<template>
	<modal-window :value='showModal' @input='setShowModal'>
		<div slot='main' style='padding-top: 1rem;'>
			<slot></slot>
		</div>
		<div slot='footer'>
			<button class='button button--modal' :class='buttonColor' @click='confirm'>{{text || 'OK'}}</button>
			<button class='button button--modal' @click='setShowModal(false)'>Cancel</button>
		</div>
	</modal-window>
</template>

<script>
	import ModalWindow from './ModalWindow'

	export default {
		name: 'ConfirmModal',
		props: ['value', 'color', 'text'],
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