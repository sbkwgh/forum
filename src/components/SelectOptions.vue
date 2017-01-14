<template>
	<div class='select_options'>
		<button
			v-for='option in options'
			class='button'
			:class='{"button--orange": option.value === selected}'
			@click='select(option.value)'
		>
			{{option.name}}
		</button>
	</div>
</template>

<script>
	export default {
		name: 'SelectOptions',
		props: ['name', 'options'],
		computed: {
			selected: {
				get () {
					return this.$store.state.selectOptions[this.name];
				},
				set (val) {
					this.$store.commit({
						type: 'setSelectOptions',
						name: this.name,
						value: val
					});
				}
			}
		},
		methods: {
			select (index) {
				this.selected = index;
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