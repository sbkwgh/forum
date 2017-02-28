<template>
	<div class='route_container'>
		<div class='h1'>Post new thread</div>
		<span class='select_button_text'>Post in category:</span>
		<select-button v-model='selectedCategory' :options='categories'></select-button>
		<div>
			<span class='select_button_text'>Name of thread:</span>
			<fancy-input placeholder='Thread name' v-model='name' style='display: inline-block;'></fancy-input>
		</div>
		<input-editor v-model='editor' :show='true' :hide-close='true' style='margin-top: 1rem'></input-editor>
		<button class='button button--green submit' @click='postThread'>Post thread</button>
	</div>
</template>

<script>
	import InputEditor from '../InputEditor'
	import FancyInput from '../FancyInput'
	import SelectButton from '../SelectButton'

	import AjaxErrorHandler from '../../assets/js/errorHandler'
	
	export default {
		name: 'ThreadNew',
		components: {
			InputEditor,
			SelectButton,
			FancyInput
		},
		data () {
			return {
				selectedCategory: this.$store.state.category.selectedCategory,
				editor: '',
				name: '',

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
				this.axios.post('/api/v1/thread', {
					name: this.name,
					category: this.selectedCategory
				}).then(res => {
					return this.axios.post('/api/v1/post', {
						threadId: res.data.id,
						content: this.editor
					})
				}).then(res => {
					this.$router.push(`/thread/${res.data.Thread.slug}/${res.data.Thread.id}`)
				}).catch(e => {
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