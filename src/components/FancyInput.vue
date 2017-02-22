<template>
	<div class='fancy_input'>
		<div
			class='fancy_input__error'
			:class='{"fancy_input__error--show": error }'
		>
			{{error}}
		</div>
		<div
			class='fancy_input__placeholder'
			:class='{"fancy_input__placeholder--active": active || value.length}'
		>
			{{placeholder}}
		</div>
		<input
			v-bind:type='type || "text"'
			class='input'
			v-bind:value='value'
			v-bind:style='{width: width || "10rem"}'
			v-on:input='updateValue($event.target.value)'
			@focus='addActive'
			@blur='removeActive'
		>
	</div>
</template>

<script>
	export default {
		name: 'FancyInput',
		props: ['value', 'placeholder', 'width', 'type', 'error'],
		data () {
			return {
				active: false
			}
		},
		methods: {
			updateValue (val) {
				this.$emit('input', val);
			},
			addActive () {
				this.active = true;
			},
			removeActive () {
				this.active = false;
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.fancy_input {
		position: relative;
		margin-top: 0.25rem;
		margin-bottom: 0.5rem;

		@at-root #{&}__placeholder {
			position: absolute;
			top: 0.35rem;
			background-color: #fff;
			left: 0.35rem;
			color: $color__gray--darkest;
			pointer-events: none;
			transition: top 0.2s, font-size 0.2s;

			@at-root #{&}--active {
				top: -0.5rem;
				font-size: 0.75rem;
				transition: top 0.2s, font-size 0.2s;
			}
		}

		@at-root #{&}__error {
			position: absolute;
			background-color: #ffeff1;
			border: 0.125rem solid #D32F2F;
			max-width: 100%;
			font-size: 0.9rem;
			padding: 0.1rem 0.25rem;
			top: -1.75rem;
			right: 0;

			opacity: 0;
			pointer-events: 0;
			margin-top: -1rem;
			transition: opacity 0.2s, margin-top 0.2s;

			@at-root #{&}--show {
				opacity: 1;
				pointer-events: all;
				margin-top: 0;
				transition: opacity 0.2s, margin-top 0.2s;
			}

			&::after {
				content: '';
				position: relative;
				width: 0;
				height: 0;
				display: inline-block;
				bottom: -0.65rem;
				border-left: 0.3rem solid transparent;
				border-right: 0.3rem solid transparent;
				border-top: 0.3rem solid #D32F2F;
			}
		}
	}
</style>