<template>
	<div
		class='error_tooltip'
		:class='{"error_tooltip--show": error }'
	>
		{{delayed_error}}
	</div>
</template>

<script>
	export default {
		name: 'ErrorTooltip',
		props: ['error'],
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
		font-size: .85rem;
		opacity: 0;
		max-height: 0px;
		overflow: hidden;
		color: $color__red--primary;
		padding: 0;
		transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);

		&:first-letter{ text-transform: capitalize; }

		@at-root #{&}--show {
			max-height: 2rem;
			padding-top: 0.125rem;
			opacity: 1;
		}
	}
</style>