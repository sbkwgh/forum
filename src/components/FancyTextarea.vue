<template>
	<div class='fancy_textarea'>
		<div
			class='fancy_textarea__placeholder'
			:class='{"fancy_textarea__placeholder--active": active || value.length}'
		>
			{{placeholder}}
		</div>
		<textarea
			class='input fancy_textarea__textarea'
			v-bind:value='value'
			v-bind:style='{width: width || "10rem"}'
			v-on:input='updateValue($event.target.value)'
			@focus='addActive'
			@blur='removeActive'
		>
		</textarea>
	</div>
</template>

<script>
	export default {
		name: 'FancyTextarea',
		props: ['value', 'placeholder', 'width'],
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

	.fancy_textarea {
		position: relative;
		margin-top: 0.25rem;
		margin-bottom: 0.5rem;

		@at-root #{&}__textarea {
			height: 5rem;
		}

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
	}
</style>