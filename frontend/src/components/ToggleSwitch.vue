<template>
	<label class='toggle_switch'>
		<input type='checkbox' v-model='proxyValue' />
		<span></span>
	</label>
</template>

<script>
	export default {
		name: 'ToggleSwitch',
		props: ['value'],
		data () {
			return {
				proxyValue: this.value
			}
		},
		watch: {
			value () {
				this.proxyValue = this.value
			},
			proxyValue () {
				this.$emit('input', this.proxyValue)
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.toggle_switch {
		position: relative;
		display: inline-block;
		width: 4rem;
		height: 2rem;
		cursor: pointer;

		&:active {
			span::before {
				width: 1.5rem;
			}

			input:checked + span::before {
				left: calc(100% - 1.85rem);
			}
		}

		&:hover {
			span {
				background-color: $color__lightgray--primary;
			}

			input:checked + span {
				background-color: darken(rgba(109, 210, 91, 0.9), 7.5%);
				border-color: darken(rgba(25, 165, 35, 0.2), 5%);

				&::before {
					opacity: 0.95;
				}
			}
		}

		input {
			display: none;
		}

		span {
			background-color: #fff;
			border-radius: 5rem;
			display: block;
			width: 100%;
			height: 100%;
			border: 0.2rem solid $color__gray--darker;
			transition: all 0.2s ease;

			&::before {
				content: '';
				position: absolute;
				left: 0.4rem;
				top: 0.35rem;
				height: 1.3rem;
				width: 1.3rem;
				background-color: $color__gray--darkest;
				border-radius: 100%;
				box-shadow: 0px 0px 2px 0 #cacacacc;

				transition: all 0.2s ease;
			}
		}

		input:checked + span {
			background-color: rgba(109, 210, 91, 0.9);
			border-color: rgba(25, 165, 35, 0.2);

			&::before {
				left: calc(100% - 1.65rem);
				background-color: #fff;
			}
		}
	}
</style>