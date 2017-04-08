<template>
	<label class='heart_button' :class='{"heart_button--unlikeable": !likeable}'>
		<input
			type='checkbox'
			:checked='value'
			:disabled='!likeable'
			v-on:change="change"
		>
		<span class='fa'></span>
		<span class='heart_button__count'>{{likesCount}}</span>
	</label>
</template>

<script>
	export default {
		name: 'HeartButton',
		props: ['liked', 'likes', 'likeable'],
		data () {
			return {
				value: this.liked,
				likesCount: this.likes.length
			}
		},
		methods: {
			change (e) {
				this.value = e.target.checked
				
				if(this.value) {
					this.likesCount++
				} else {
					this.likesCount--
				}

				this.$emit('change', this.value)
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