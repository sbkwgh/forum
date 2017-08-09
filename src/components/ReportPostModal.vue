<template>
	<div class='report_post_modal'>
		<modal-window v-model='showModal'>
			<div
				class='report_post_modal__loading_overlay'
				:class='{
					"report_post_modal__loading_overlay--show": loading
				}'
			>
				<loading-icon></loading-icon>
			</div>
			<div class='report_post_modal__modal'>
				<h3>Report this post</h3>
				<div class='report_post_modal--margin'>Select a reason for reporting this post below:</div>
				<select-button :options='reportOptions' v-model='selectedOption' class='report_post_modal--margin'></select-button>
				<div >
					<button class='button button--modal' @click='setShowModal(false)'>Cancel</button>
					<button class='button button--modal' @click='submitReport'>Submit</button>
				</div>
			</div>
		</modal-window>
	</div>
</template>

<script>
	import ModalWindow from './ModalWindow'
	import SelectButton from './SelectButton'
	import LoadingIcon from './LoadingIcon'

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'ReportPostModal',
		props: ['value', 'post-id'],
		components: {
			ModalWindow,
			SelectButton,
			LoadingIcon
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
						.then(res => {
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
		@at-root #{&}__loading_overlay {
			position: absolute;
			left: 0;
			top: 0;
			height: 100%;
			width: 100%;
			z-index: 5;
			background-color: rgba(0, 0, 0, 0.15);
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
		@at-root #{&}__modal {
			padding: 1rem;

			h3 {
				margin: 0;
			}
		}
	}
</style>