<template>
	<div class='route_container'>
		<div class='h1'>Post new thread</div>
		<span class='select_button_text'>Post in category:</span>
		<select-button v-model='selectedCategory' :options='categories'></select-button>
		<div>
			<span class='select_button_text'>Name of thread:</span>
			<fancy-input placeholder='Thread name' v-model='name' style='display: inline-block;'></fancy-input>
		</div>
		<input-editor v-model='editor' :show='true' :hide-close='true' :error='errors.content' style='margin-top: 1rem'></input-editor>
		<loading-button class='button--green submit' :loading='loading' @click='postThread'>Post thread</loading-button>
	</div>
</template>

<script>
	import InputEditor from '../InputEditor'
	import FancyInput from '../FancyInput'
	import SelectButton from '../SelectButton'
	import LoadingButton from '../LoadingButton'

	import AjaxErrorHandler from '../../assets/js/errorHandler'
	
	export default {
		name: 'ThreadNew',
		components: {
			InputEditor,
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

<style lang='scss' scoped>
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
</style>