<template>
	<div class='route_container thread_new'>

		<div class='h1'>Post new thread</div>
		<div class='thread_meta_info'>
			<div class='thread_meta_info__text'>Enter the thread title and the category to post it in</div>
			<select-button v-model='selectedCategory' :options='categories'></select-button>
			<fancy-input
				placeholder='Thread title'
				v-model='name'
				:error='errors.name'
				style='margin: 0 0.5rem; display: inline-block;'
				large='true'
				width='15rem'
			></fancy-input>
			
			<button class='button button--thin_text' v-if='!showPoll' @click='togglePoll(true)'>Add poll</button>
			<transition name='slide'>
				<div class='thread_meta_info__poll' v-if='showPoll'>
					<div class='thread_meta_info__poll__top_bar'>
						<fancy-input
							v-model='pollQuestion'
							placeholder='Poll question'
							width='20rem'
							:large='true'
						></fancy-input>
						<button class='button button--thin_text button--borderless' @click='removePoll'>
							Remove poll
						</button>
					</div>
					<div>
						<div class='thread_meta_info__poll__answer' v-for='(pollAnswer, $index) in pollAnswers'>
							<fancy-input
								v-model='pollAnswer.answer'
								width='15rem'
								:large='true'
								:placeholder='"Answer " + ($index+1)'
							></fancy-input>
							<span @click='removePollAnswer($index)' title='Remove answer'>&times;</span>
						</div>
						<div>
							<fancy-input
								v-model='newPollAnswer'
								placeholder='Option/answer for poll'
								style='display: inline-block; margin-right: 0.5rem;'
								width='15rem'
								:large='true'
							></fancy-input>
							<button class='button button--thin_text' @click='addPollAnswer'>Add answer</button>
						</div>
					</div>
				</div>
			</transition>
		</div>
		<div class='editor' :class='{"editor--focus": focusInput}'>
			<div class='editor__input'>
				<div class='editor__format_bar'>
					editor
				</div>
				<input-editor-core
					v-model='editor'
					:error='errors.content'
					@mentions='setMentions'
					@focus='setFocusInput(true)'
					@blur='setFocusInput(false)'
				></input-editor-core>
			</div>
			<div class='editor__preview'>
				<div class='editor__format_bar editor__format_bar--preview'>
					preview
				</div>
				<input-editor-preview :value='editor' :mentions='mentions'></input-editor-preview>
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
	import logger from '../../assets/js/logger'
	
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
				mentions: [],
				name: '',
				loading: false,
				focusInput: false,

				errors: {
					content: '',
					name: ''
				},

				showPoll: false,
				pollQuestion: '',
				newPollAnswer: '',
				pollAnswers: []
			}
		},
		computed: {
			categories () {
				return this.$store.getters.categoriesWithoutAll
			}
		},
		methods: {
			togglePoll (val) {
				if(val !== undefined) {
					this.showPoll = val
				} else {
					this.showPoll = !this.showPoll
				}
			},
			addPollAnswer () {
				if(!this.newPollAnswer.trim().length) return

				this.pollAnswers.push({ answer: this.newPollAnswer })
				this.newPollAnswer = ''
			},
			removePollAnswer ($index) {
				this.pollAnswers.splice($index, 1)
			},
			removePoll () {
				this.pollQuestion = ''
				this.pollAnswers = []
				this.newPollAnswer = ''

				this.togglePoll()
			},

			postThread () {
				let thread

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
					thread = res.data

					let ajax = []
					ajax.push(
						this.axios.post('/api/v1/post', {
							threadId: res.data.id,
							content: this.editor,
							mentions: this.mentions
						})
					)

					if(this.showPoll) {
						ajax.push(
							this.axios.post('/api/v1/poll', {
								question: this.pollQuestion,
								answers: this.pollAnswers.map(a => a.answer),
								threadId: res.data.id
							})
						)
					}

					return Promise.all(ajax)
				}).then(res => {
					this.loading = false
					this.$router.push(`/thread/${thread.slug}/${thread.id}/0`)
				}).catch(e => {
					this.loading = false

					AjaxErrorHandler(this.$store)(e, (error, errors) => {
						let path = error.path

						if(this.errors[path] !== undefined) {
							this.errors[path] = error.message
						} else {
							errors.push(error.message)
						}
					})
				})
			},
			setFocusInput (val) {
				this.focusInput = val
			},
			setMentions (mentions) {
				this.mentions = mentions
			}
		},
		watch: {
			'$store.state.username' (username) {
				if(!username) {
					this.$router.push('/')
				}
			}
		},
		mounted () {
			this.$store.dispatch('setTitle', 'new thread')
			logger('threadNew')
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

	.thread_new {
		margin-top: 1rem;
	}

	.thread_meta_info {
		background-color: #fff;
		@extend .shadow_border;
		border-radius: 0.25rem;
		padding: 1rem;
		margin: 1rem 0;

		@at-root #{&}__text {
			margin-bottom: 0.5rem;
		}

		@at-root #{&}__poll {
			border-top: thin solid $color__gray--primary;
			margin-top: 1rem;
			padding-top: 0.75rem;

			@at-root #{&}__top_bar {
				display: flex;
				justify-content: space-between;
				align-items: baseline;
			}

			@at-root #{&}__answer {
				display: flex;
				align-items: baseline;

				& > span {
					opacity: 0;
					pointer-events: none;
					transition: all 0.1s;

					font-size: 1.5rem;
					margin-left: 0.5rem;
					cursor: pointer;
					@include user-select(none);
				}

				&:hover > span {
					opacity: 1;
					pointer-events: all;
				}
			}
		}
	}

	.submit {
		margin-top: 1rem;
	}

	.editor {
		display: flex;
		background-color: #fff;
		border-radius: 0.25rem;
		box-shadow: 0 0 0.3rem rgba(175, 175, 175, 0.5);

		transition: all 0.2s;

		@at-root #{&}--focus {
			box-shadow: 0 0 0.3rem rgba(175, 175, 175, 1);
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
			.input_editor_core textarea {
				height: 14rem;
			}
		}

		@at-root #{&}__preview {
			border-left: 1px solid $color__gray--darker;
			width: 50%;

			.input_editor_preview__markdownHTML {
				height: 14.2rem;
			}
		}
	}
</style>