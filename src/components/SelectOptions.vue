<template>
	<div class='select_options'>
		<button
			v-for='option in options'
			class='button button--thick_border_thin_text'
			:class='{"button--lightblue": option.value === value}'
			@click='select(option.value)'
		>
			{{option.name}}
		</button>
	</div>
</template>

<script>
	export default {
		name: 'SelectOptions',
		props: ['value', 'options'],
		methods: {
			select (index) {
				this.$emit('input', index)
			}
		}
	}
</script>

<style lang='scss' scoped>
	.select_options {
		display: inline-block;

		button {
			margin-right: 0.25rem;

			&:last-child {
				margin-right: 0;
			}
		}
	}
</style>