<template>
	<div class='menu_tooltip'>
		<div
			class='menu_tooltip__overlay'
			:class='{ "menu_tooltip__overlay--show": value }'
			@click='$emit("input", false)'
		></div>

		<slot name='button'></slot>

		<div
			class='menu_tooltip__menu'
			:class='{ "menu_tooltip__menu--show": value }'
			:style='{ "margin-top": top }'
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
		props: ['value', 'top']
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.menu_tooltip {
		display: inline-block;

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
			max-height: 10rem;
			opacity: 0;
			overflow-y: hidden;
			position: absolute;
			pointer-events: none;
			transform: translateY(-0.25rem);
			transition: transform 0.2s, opacity 0.2s;
			width: 15rem;
			z-index: 3;

			@at-root #{&}--show {
				opacity: 1;
				pointer-events: all;
				transform: translateY(0.125rem);
			}

			@at-root #{&}__inner {
				max-height: 10rem;
				overflow-y: auto;
				padding: 0.25rem;

			}
		}
	}
</style>