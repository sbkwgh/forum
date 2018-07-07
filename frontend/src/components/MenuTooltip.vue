<template>
	<div
		class='menu_tooltip'
		:class='{"menu_tooltip--touch": !touchDisabled}'
	>
		<div
			class='menu_tooltip__overlay'
			:class='{ "menu_tooltip__overlay--show": value }'
			@click='$emit("input", false)'
		></div>

		<slot name='button'></slot>

		<div
			class='menu_tooltip__menu'
			:class='{ "menu_tooltip__menu--show": value }'
			:style='{ "top": top, "width": width }'
		>
			<div class='menu_tooltip__menu__inner'>
				<slot name='menu'></slot>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'MenuTooltip',
		props: ['value', 'top', 'width', 'touch-disabled']
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.menu_tooltip {
		display: inline-block;
		position: relative;

		@at-root #{&}__overlay {
			height: 100%;
			left: 0;
			pointer-events: none;
			position: fixed;
			top: 0;
			width: 100%;
			z-index: 2;

			@at-root #{&}--show {
				pointer-events: all;
			}
		}

		@at-root #{&}__menu {
			background-color: #fff;
			border: 1.5px solid $color__gray--darker;
			border-radius: 0.25rem;
			box-shadow: 0 0.25rem 1rem rgba(#000, 0.125);
			opacity: 0;
			overflow-y: hidden;
			position: absolute;
			pointer-events: none;
			top: calc(100% + 0.125rem);
			transform: translateY(-0.25rem);
			transition: transform 0.2s, opacity 0.2s;
			width: 15rem;
			z-index: 3;

			@at-root #{&}--show {
				opacity: 1;
				pointer-events: all;
				transform: translateY(0);
			}

			@at-root #{&}__inner {
				max-height: 10rem;
				overflow-y: auto;
				padding: 0.25rem;

			}
		}
	}

		@media (max-width: $breakpoint--tablet) and (min-width: $breakpoint--phone) {
		.menu_tooltip__menu {
				width: 60%;
				left: 20%;
		}
	}

	@media (max-width: $breakpoint--phone) {
		.menu_tooltip__menu {
			width: 100%;
			left: 0;
		}
	}

	@media (max-width: $breakpoint--tablet) {
		.menu_tooltip--touch {
			.menu_tooltip {
				@at-root #{&}__overlay {
					transition: all 0.2s;

					@at-root #{&}--show {
						background-color: hsla(213, 35%, 5%, 0.5);
					}
				}

				@at-root #{&}__menu {
					background-color: rgba(255, 255, 255, 0.97);
					border-radius: 0.25rem 0.25rem 0 0;
					font-size: 1.125rem;
					max-height: 20rem;
					opacity: 0;
					overflow-y: auto;
					position: fixed;
					top: unset;
					bottom: -100%;
					transition: opacity 0.2s, bottom 0.2s;

					@at-root #{&}__inner {
						max-height: 100%;
					}

					@at-root #{&}--show {
						bottom: 0;
						opacity: 1;
					} 

				}
			}
		}
	}
</style>