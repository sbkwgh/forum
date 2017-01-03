<template>
	<div class='fancy_input'>
		<div class='fancy_input__placeholder'>{{placeholder}}</div>
		<input type='text' v-bind:value='value' v-on:input='updateValue($event.target.value)'>
	</div>
</template>

<script>
	export default {
		name: 'FancyInput',
		props: ['value', 'placeholder'],
		data () {
			active: false
		},
		methods: {
			updateValue (val) {
				this.$emit('input', val);
			}
		}
	}
</script>

<style lang='scss' scoped>
	
</style>