<template>
	<div class='route_container'>
		<modal-window v-model='showProfilePictureModal' width='25rem'>
			<div class='profile_picture_modal'>
				<div class='h3'>Add a profile picture</div>
				<p class='p--condensed'>
					Drag and drop an image or
					<label class='button profile_picture_modal__upload_button'>
						<input type='file'>
						upload a file
					</label>
				</p>
				<div class='profile_picture_modal__drag_area'>
					<span class='fa fa-cloud-upload profile_picture_modal__drag_area__icon'></span>
				</div>
				<button class='button button--green button--disabled'>Upload picture</button>
			</div>
		</modal-window>

		<div class='h1'>General settings</div>
		<p>
			<div class='h3'>About me</div>
			<p class='p--condensed'>
				Write something about yourself to be displayed on your user page
			</p>
			<fancy-textarea
				placeholder='About me description'
				v-model='description.value'
				:error='description.error'
				type='password'
			></fancy-textarea>
			<loading-button
				class='button button--green'
				:loading='description.loading'
				@click='saveDescription'
			>
				Save description
			</loading-button>
		</p>
		<p>
			<div class='h3'>Profile picture</div>
			<p class='p--condensed'>
				This will be displayed by your posts on the site
			</p>
			<button class='button' @click='showProfilePictureModal = true'>Add profile picture</button>
		</p>
	</div>
</template>

<script>
	import FancyTextarea from '../FancyTextarea'
	import LoadingButton from '../LoadingButton'
	import ModalWindow from '../ModalWindow'

	import AjaxErrorHandler from '../../assets/js/errorHandler'
	import logger from '../../assets/js/logger'

	export default {
		name: 'settingsGeneral',
		components: {
			FancyTextarea,
			LoadingButton,
			ModalWindow
		},
		data () {
			return {
				description: {
					value: '',
					loading: false,
					error: ''
				},

				showProfilePictureModal: false
			}
		},
		computed: {},
		methods: {
			saveDescription () {
				this.description.error = ''
				this.description.loading = true

				this.axios
					.put('/api/v1/user/' + this.$store.state.username, {
						description: this.description.value
					})
					.then(res => {
						this.description.loading = false
					})
					.catch(e => {
						this.description.loading = false

						AjaxErrorHandler(this.$store)(e, error => {
							this.description.error = error.message
						})
					})
			}
		},
		created () {
			this.$store.dispatch('setTitle', 'general settings')

			this.$nextTick(() => {
				this.axios
					.get('/api/v1/user/' + this.$store.state.username)
					.then(res => {
						this.description.value = res.data.description || ''
					})
					.catch(e => {
						AjaxErrorHandler(this.$store)(e)
					})
			})

			logger('settingsGeneral')
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.profile_picture_modal {
		padding: 1rem;

		@at-root #{&}__upload_button input[type="file"] {
			display: none;
		}

		@at-root #{&}__drag_area {
			padding: 1rem;
			text-align: center;

			@at-root #{&}__icon {
				font-size: 6rem;
				color: $color__gray--darker;
			}
		}
	}

	@media (max-width: 420px) {
		.h1 {
			display: none;
		}
	}
</style>