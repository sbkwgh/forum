<template>
	<div
		class='error_tooltip'
		:class='{"error_tooltip--show": error, "error_tooltip--bottom": bottom }'
	>
		{{delayed_error}}
	</div>
</template>

<script>
	export default {
		name: 'ErrorTooltip',
		props: ['error', 'bottom'],
		data () {
			return {
				delayed_error: this.error
			}
		},
		watch: {
			error (val) {
				if(!val) {
					setTimeout(() => {
						this.delayed_error = ''
					}, 205)
				} else {
					this.delayed_error = val
				}
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.error_tooltip {
		position: absolute;
		background-color: #ffeff1;
		border: 0.125rem solid #D32F2F;
		font-size: 0.9rem;
		padding: 0.1rem 0.25rem;
		top: 0.2125rem;
		border-radius: 0.2rem;
		left: calc(100% + 0.25rem);
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		margin-top: -1rem;
		transition: opacity 0.2s, margin-top 0.2s;

		&:first-letter{ text-transform: capitalize; }

		&::after {
			content: '';
			position: relative;
			width: 0;
			height: 0;
			display: inline-block;
			right: calc(100% + 0.3rem);
			border-top: 0.3rem solid transparent;
			border-bottom: 0.3rem solid transparent;
			border-right: 0.3rem solid #D32F2F;
		}

		@at-root #{&}--show {
			opacity: 1;
			pointer-events: all;
			margin-top: 0;
			transition: opacity 0.2s, margin-top 0.2s;
		}

		@at-root #{&}--bottom {
			left: 0;
			top: calc(100% + 0.25rem);

			&::after {
				top: -1.1rem;
				right: calc(100% - 0.5rem);
				border-left: 0.3rem solid transparent;
				border-right: 0.3rem solid transparent;
				border-bottom: 0.3rem solid #D32F2F;
			}
		}
	}
</style>