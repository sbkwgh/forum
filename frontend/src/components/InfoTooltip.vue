<template>
	<div
		class='info_tooltip'
		@mouseenter='setState(true)'
		@mouseleave='setState(false)'
	>
		<div
			class='info_tooltip__content'
			:class="{
				'info_tooltip__content--show': show,
				'info_tooltip__content--pointer_events': pointerEvents,
			}"
		>
			<slot name='content'></slot>
		</div>
		<div
			class='info_tooltip__display'
			:class="{
				'info_tooltip__display--hover': show
			}"
		>
			<slot name='display'></slot>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'InfoTooltip',
		props: ['noEvents'],
		data () {
			return {
				show: false,
				pointerEvents: false
			}
		},
		methods: {
			setState (val) {
				if(this.noEvents) return

				if(val) {
					this.pointerEvents = true
					this.show = true
					this.$emit('hover')
				} else {
					this.show = false;
					setTimeout(() => {
						if(this.show) return;

						this.pointerEvents = false
					}, 300)
				}
			}
		}
	}
</script>

<style lang='scss'>
	@import '../assets/scss/variables.scss';

	.info_tooltip {
		position: relative;

		@at-root #{&}__content {
			opacity: 0;
			max-height: 7.5rem;
			border-radius: 0.25rem;
			pointer-events: none;
			width: 17.5rem;
			z-index: 2;
			overflow-y: auto;
			position: absolute;
			bottom: calc(100% + -0.5rem);
			background-color: #fff;
			padding: 0.5rem;
			border: 0.125rem solid $color__gray--darker;
			box-shadow: none;
			transition: all 0.2s;
			transition-delay: 0.3s;

			@at-root #{&}--show {
				bottom: calc(100% + 0.5rem);
				box-shadow: 0 3px 6px rgba(0, 0, 0, 0.03), 0 3px 6px rgba(0,0,0,0.06);
				opacity: 1;
				display: initial;
				transition: all 0.2s;
				transition-delay: 0.5s;
			}
			@at-root #{&}--pointer_events {
				pointer-events: all;
			}
		}

		@at-root #{&}__display {
			display: inline-flex;
			align-items: baseline;
			cursor: pointer;
		}
	}
</style>