<template>
	<div class='report_post_modal'>
		<modal-window v-model='showModal'>
			<div class='report_post_modal__modal'>
				<h3>Report this post</h3>
				<div class='report_post_modal--margin'>Select a reason for reporting this post below:</div>
				<select-button :options='reportOptions' v-model='selectedOption' class='report_post_modal--margin'></select-button>
				<div >
					<button class='button button--modal' @click='setShowModal(false)'>Cancel</button>
					<button class='button button--modal'>Submit</button>
				</div>
			</div>
		</modal-window>
	</div>
</template>

<script>
	import ModalWindow from './ModalWindow'
	import SelectButton from './SelectButton'

	export default {
		name: 'ReportPostModal',
		props: ['value'],
		components: {
			ModalWindow,
			SelectButton
		},
		data () {
			return {
				showModal: false,

				selectedOption: 0,
				reportOptions: [
					{ name: 'Reason for reporting', disabled: true },
					{ name: 'Spam', value: 'spam' },
					{ name: 'Inappropriate content', value: 'inappropriate' },
					{ name: 'Harassment', value: 'harassment' }
				]
			}
		},
		methods: {
			setShowModal (val) {
				this.showModal = val
			}
		},
		watch: {
			value (val) {
				this.showModal = val
				this.$emit('input', val)
			},
			showModal (val) {
				this.$emit('input', val)
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.report_post_modal {
		@at-root #{&}--margin {
			margin: 0.5rem 0;
		}
		@at-root #{&}__modal {
			padding: 1rem;

			h3 {
				margin: 0;
			}
		}
	}
</style>