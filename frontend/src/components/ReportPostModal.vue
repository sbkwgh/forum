<template>
	<div class='report_post_modal'>
		<modal-window v-model='showModal' :loading='loading'>
			<div class='report_post_modal__modal' slot='main'>
				<h3>Report this post</h3>
				<div class='report_post_modal--margin'>Select a reason for reporting this post below:</div>
				<select-button :options='reportOptions' v-model='selectedOption' class='report_post_modal--margin' :touch-disabled='true'></select-button>
			</div>
			<div slot='footer'>
				<button class='button button--modal' @click.stop='submitReport'>Submit</button>
				<button class='button button--modal' @click.stop='setShowModal(false)'>Cancel</button>
			</div>
		</modal-window>
	</div>
</template>

<script>
	import ModalWindow from './ModalWindow'
	import SelectButton from './SelectButton'

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'ReportPostModal',
		props: ['value', 'post-id'],
		components: {
			ModalWindow,
			SelectButton
		},
		data () {
			return {
				showModal: false,
				loading: false,

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
			},
			submitReport () {
				if(this.selectedOption) {
					this.loading  = true

					this.axios
						.post('/api/v1/report', {
							postId: this.postId,
							reason: this.selectedOption
						})
						.then(() => {
							this.setShowModal(false)
							this.selectedOption = 0
							this.loading  = false
						})
						.catch(e => {
							this.loading  = false
							AjaxErrorHandler(this.$store)(e)
						})
				}


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
			padding-top: 1rem;

			h3 {
				margin: 0;
			}
		}
	}
</style>