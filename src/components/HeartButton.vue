<template>
	<label class='heart_button'>
		<input type='checkbox'>
		<span class='fa'></span>
		<span class='heart_button__count'>0</span>
	</label>
</template>

<script>
	export default {
		name: 'HeartButton',
		props: ['value']
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.heart_button {
		cursor: pointer;

		input {
			display: none;
		}

		#{&}__count {
			position: relative;
			bottom: 0.0625rem;
		}

		span.fa {
			color: $color__gray--darkest;
			transition: text-shadow 0.2s, color 0.2s, filter 0.2s;
			font-size: 1.125rem;

			&:hover {
				filter: brightness(0.9);
			}

			&::before {
				content: "\f004";
			}
		}
		input:checked + span.fa {
			color: #E91E63;
		}
	}
</style>