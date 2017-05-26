<template>
	<div class='menu_button'>
		<div class='menu_button__overlay' :class='{ "menu_button__overlay--show": show }' @click='setShow(false)'></div>
		<div class='menu_button__icon' @click='setShow(true)'>
			<slot ></slot>
		</div>
		<div class='menu_button__options' :class='{ "menu_button__options--show": show }'>
			<div
				class='menu_button__option'
				v-for='(option, $index) in options'
				@click='emit(option)'
				:style="{ 'border-bottom' : $index === options.length-1 ? 'none' :  'solid thin rgb(245, 245, 245)' }"
			>
				{{option}}
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'MenuButton',
		props: ['options'],
		data () {
			return {
				show: false
			}
		},
		methods: {
			setShow (val) {
				this.show = val
			},
			emit (option) {
				this.$emit(option)
				this.setShow(false)
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.menu_button {
		position: relative;

		@at-root #{&}__overlay {
			position: fixed;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			z-index: 2;
			pointer-events: none;

			@at-root #{&}--show {
				pointer-events: all;
			}
		}

		@at-root #{&}__options {
			position: absolute;
			background-color: #fff;
			width: 10rem;
			top: calc(100% + 0.25rem);
			border-radius: 0.125rem;
			box-shadow: 0 3px 6px rgba(0, 0, 0, 0.03), 0 3px 6px rgba(0, 0, 0, 0.06);
			z-index: 3;
			border: 0.125rem solid $color__gray--darker;
			pointer-events: none;
			transform: perspective( 600 ) rotateX( 15deg );
			-webkit-transform: perspective( 600 ) rotateX( 15deg );
			opacity: 0;
			margin-top: -1rem;
			transition: all 0.25s;

			@at-root #{&}--show {
				opacity: 1;
				transform: perspective( 0 ) rotateX( 0 );
				-webkit-transform: perspective( 0 ) rotateX( 0 );
				margin-top: 0;
				pointer-events: all;
			}
		}
		@at-root #{&}__option {
			padding: 0.5rem;
			font-size: 0.9rem;
			cursor: default;
			transition: all 0.2s;

			&:hover { background-color: $color__lightgray--primary;  }
			&:active { background-color: $color__lightgray--darker; }
		}
	}
</style>