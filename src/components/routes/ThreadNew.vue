<template>
	<div class='route_container'>
		<div class='h1'>Post new thread</div>
		<span class='select_button_text'>Post in category:</span>
		<select-button v-model='selectedCategory' :options='categories'></select-button>
		<div>
			<span class='select_button_text'>Name of thread:</span>
			<fancy-input placeholder='Thread name' v-model='name' style='display: inline-block;'></fancy-input>
		</div>
		<div class='editor' :class='{"editor--focus": focusInput}'>
			<div class='editor__input'>
				<div class='editor__format_bar'>
					editor
				</div>
				<input-editor-core
					v-model='editor'
					:error='errors.content'
					@focus='setFocusInput(true)'
					@blur='setFocusInput(false)'
				></input-editor-core>
			</div>
			<div class='editor__preview'>
				<div class='editor__format_bar editor__format_bar--preview'>
					preview
				</div>
				<input-editor-preview :value='editor'></input-editor-preview>
			</div>
		</div>
		<loading-button class='button--green submit' :loading='loading' @click='postThread'>Post thread</loading-button>
	</div>
</template>

<script>
	import InputEditorCore from '../InputEditorCore'
	import InputEditorPreview from '../InputEditorPreview'
	import FancyInput from '../FancyInput'
	import SelectButton from '../SelectButton'
	import LoadingButton from '../LoadingButton'

	import AjaxErrorHandler from '../../assets/js/errorHandler'
	
	export default {
		name: 'ThreadNew',
		components: {
			InputEditorCore,
			InputEditorPreview,
			SelectButton,
			FancyInput,
			LoadingButton
		},
		data () {
			return {
				selectedCategory: this.$store.state.category.selectedCategory,
				editor: '',
				name: '',
				loading: false,
				focusInput: false,

				errors: {
					content: '',
					name: ''
				}
			}
		},
		computed: {
			categories () {
				return this.$store.getters.categoriesWithoutAll
			}
		},
		methods: {
			postThread () {
				if(!this.editor.trim().length) {
					this.errors.content = 'Cannot be blank'
					return;
				} 

				this.errors.content = ''
				this.errors.name = ''

				this.loading = true

				this.axios.post('/api/v1/thread', {
					name: this.name,
					category: this.selectedCategory
				}).then(res => {
					return this.axios.post('/api/v1/post', {
						threadId: res.data.id,
						content: this.editor
					})
				}).then(res => {
					this.loading = false
					this.$router.push(`/thread/${res.data.Thread.slug}/${res.data.Thread.id}`)
				}).catch(e => {
					this.loading = false

					AjaxErrorHandler(this.$store)(e, (error, errors) => {
						let param = error.parameter

						if(this.errors[param] !== undefined) {
							this.error[param] = error.message
						} else {
							errors.push(error.message)
						}
					})
				})
			},
			setFocusInput (val) {
				this.focusInput = val
			}
		},
		watch: {
			'$store.state.username' (username) {
				if(!username) {
					this.$router.push('/')
				}
			}
		},
		beforeRouteEnter (to, from, next) {
			next(vm => {
				if(!vm.$store.state.username) {
					vm.$store.commit('setAccountModalState', true);
					next('/')
				}
			})
		}
	}
</script>

<style lang='scss'>
	@import '../../assets/scss/variables.scss';

	.select_button_text {
		font-weight: bold;
		margin-top: 1rem;
		display: inline-block;
		margin-right: 0.5rem;
	}
	.submit {
		margin-top: 1rem;
	}

	.editor {
		display: flex;
		background-color: #fff;
		border-radius: 0.25rem;
		border: 0.125rem solid $color__gray--darker;
		transition: color 0.2s;

		@at-root #{&}--focus {
			border-color: $color__gray--darkest;
		}

		@at-root #{&}__format_bar {
			height: 2.5rem;
			background-color: $color__gray--primary;
			display: flex;
			padding-right: 1rem;
			padding-bottom: 0.25rem;
			justify-content: flex-end;
			align-items: center;
			font-variant: small-caps;
		}

		@at-root #{&}__input {
			width: 50%;
			position: relative;

			.input_editor_core__format_bar {
				left: 0rem;
			}
		}

		@at-root #{&}__preview {
			border-left: 0.125rem solid $color__gray--darker;
			width: 50%;
		}
	}
</style>