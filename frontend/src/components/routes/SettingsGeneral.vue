<template>
	<div class='route_container'>
		<modal-window v-model='picture.showProfilePictureModal' width='25rem' @input='hideProflePictureModal'>
			<div
				class='profile_picture_modal'
				:class='{ "profile_picture_modal--picture.dragging": picture.dragging  }'
				@dragover='handleDragOver'
				@drkagend='picture.dragging = false'
				@drkgleave='picture.dragging = false'
				@drop='handleFileDrop'
			>
				<div class='h3'>Add a profile picture</div>
				<p class='p--condensed'>
					Drag and drop an image or
					<label class='button profile_picture_modal__upload_button'>
						<input type='file' accept='image/*' @change='processImage($event.target.files[0])'>
						upload a file
					</label>
				</p>
				<div class='profile_picture_modal__drag_area'>
					<span
						v-if='!picture.dataURL'
						class='fa fa-cloud-upload profile_picture_modal__drag_area__icon'
						:class='{ "profile_picture_modal__drag_area__icon--picture.dragging": picture.dragging }' 
					></span>
					<div
						class='profile_picture_modal__drag_area__image picture_circle'
						:style='{ "background-image": "url(" + picture.dataURL + ")" }'
						v-else
					></div>
				</div>
				<div class='profile_picture_modal__buttons'>
					<button class='button button--modal button--borderless' @click='hideProflePictureModal'>Cancel</button>
					<button
						class='button button--modal button--green'
						:class='{ "button--disabled": !picture.dataURL }'
						@click='uploadProfilePicture'
					>Upload picture</button>
				</div>
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
			<p
				class='p--condensed profile_picture_preview picture_circle'
				:style='{ "background-image": "url(" + picture.current + ")" }'
				v-if='picture.current'
			></p>
			<button class='button' @click='picture.showProfilePictureModal = true'>
				{{picture.current ? "Change" : "Add" }} profile picture
			</button>
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

				picture: {
					current: null,
					showProfilePictureModal: false,
					dragging: false,
					dataURL: null
				}
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
			},
			uploadProfilePicture () {
				this.profilePictureModalLoading = true

				this.axios
					.post('/api/v1/user/' + this.$store.state.username + '/picture', {
						picture: this.picture.dataURL
					})
					.then(res => {
						this.hideProflePictureModal()
						this.picture.current = this.picture.dataURL
					})
					.catch(e => {
						this.profilePictureModalLoading = false

						AjaxErrorHandler(this.$store)(e)
					})

			},
			hideProflePictureModal () {
				this.picture.showProfilePictureModal = false
				
				//Wait for transition to complete
				setTimeout(() => {
					this.picture.dataURL = null
					this.profilePictureModalLoading = false
				}, 200)
			},	
			handleDragOver (e) {
				e.preventDefault()
				this.picture.dragging = true
			},
			handleFileDrop (e) {
				e.preventDefault()
				this.picture.dragging = false
				
				if(e.dataTransfer && e.dataTransfer.items) {
					let file = e.dataTransfer.items[0]

					if(file.type.match('^image/')) {
						this.processImage(file.getAsFile())
					}
				}
			},
			processImage (file) {
				let reader = new FileReader()

				reader.readAsDataURL(file)

				reader.addEventListener('load', () => {
					this.picture.dataURL = reader.result
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
						this.picture.current = res.data.picture
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

	.profile_picture_preview {
		height: 5rem;
		width: 5rem;
	}

	.profile_picture_modal {
		padding: 1rem;
		transition: all 0.2s;

		@at-root #{&}--picture.dragging {
			//background-color: $color__lightgray--primary;
		}

		@at-root #{&}__upload_button input[type="file"] {
			display: none;
		}

		@at-root #{&}__drag_area {
			padding: 1rem;
			text-align: center;

			@at-root #{&}__image {
				width: 5rem;
				height: 5rem;
				display: inline-block;
				margin-top: -1rem;
			}

			@at-root #{&}__icon {
				font-size: 6rem;
				color: $color__gray--darker;
				transition: all 0.2s;

				@at-root #{&}--picture.dragging {
					transform: translateY(-0.5rem) scale(1.1);
					color: $color__gray--darkest;
				}
			}
		}
	}

	@media (max-width: 420px) {
		.h1 {
			display: none;
		}
	}
</style>