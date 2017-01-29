<template>
	<div class='route_container'>
		<div class='h1'>Post new thread</div>
		<span class='select_button_text'>Post in category:</span>
		<select-button v-model='selectedCategory' :options='categories'></select-button>
		<input-editor name='new-thread' :hide-close='true' style='margin-top: 1rem'></input-editor>
		<button class='button button--green submit'>Post thread</button>
	</div>
</template>

<script>
	import InputEditor from '../InputEditor'
	import SelectButton from '../SelectButton'

	
	export default {
		name: 'ThreadNew',
		components: {
			InputEditor,
			SelectButton
		},
		data () {
			return {
				selectedCategory: this.$store.state.category.selectedCategory
			}
		},
		computed: {
			categories () {
				return this.$store.getters.categoriesWithoutAll
			}
		},
		methods: {}
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