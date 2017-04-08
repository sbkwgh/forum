<template>
	<label class='heart_button' :class='{"heart_button--unlikeable": !likeable}'>
		<input
			type='checkbox'
			v-bind:checked='value'
			v-bind:disabled='!likeable'
			v-on:change="$emit('input', $event.target.checked)"
		>
		<span class='fa'></span>
		<span class='heart_button__count'>{{_likes}}</span>
	</label>
</template>

<script>
	export default {
		name: 'HeartButton',
		props: ['value', 'likes', 'likeable'],
		computed: {
			_likes () {
				let likes = this.likes || 0

				if(this.value) {
					return likes + 1
				} else {
					return likes
				}
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.heart_button {
		cursor: pointer;
		@include user-select(none);

		@at-root #{&}--unlikeable {
			cursor: not-allowed;
		}

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