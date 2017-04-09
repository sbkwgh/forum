<template>
	<div class='fancy_input'>
		<div 
			 style='position: relative; display: inline-block;'
			 v-bind:style='{width: width || "10rem"}'
		>
			<error-tooltip :error='error'></error-tooltip>
			<div
				class='fancy_input__placeholder'
				:class='{
					"fancy_input__placeholder--active": active || value.length,
					"fancy_input__placeholder--large": large
				}'
			>
				{{placeholder}}
			</div>
			<input
				v-bind:type='type || "text"'
				class='input'
				:class='{"fancy_input__input--large": large}'
				v-bind:value='value'
				v-bind:style='{width: width || "10rem"}'
				v-on:input='updateValue($event.target.value)'
				@focus='addActive'
				@blur='removeActive'
			>
		</div>
	</div>
</template>

<script>
	import ErrorTooltip from './ErrorTooltip'

	export default {
		name: 'FancyInput',
		props: ['value', 'placeholder', 'width', 'type', 'error', 'large'],
		components: {
			ErrorTooltip
		},
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

		@at-root #{&}__input {
			@at-root #{&}--large {
				padding: 0.5rem;
			}
		}

		@at-root #{&}__placeholder {
			position: absolute;
			top: 0.35rem;
			background-color: #fff;
			left: 0.35rem;
			color: $color__gray--darkest;
			pointer-events: none;
			transition: top 0.2s, font-size 0.2s;

			@at-root #{&}--large {
				top: 0.55rem;
				left: 0.6rem;
			}

			@at-root #{&}--active {
				top: -0.5rem;
				font-size: 0.75rem;
				transition: top 0.2s, font-size 0.2s;
			}
		}
	}
</style>