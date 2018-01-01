<template>
	<div class='select_button' :class='{"select_button--touch": !touchDisabled}'>
		<div
			class='select_button__overlay'
			:class='{ "select_button__overlay--show": !hideMenu }'
			@click='toggleMenu'
		></div>
		<div class='button button--thin_text' @click='toggleMenu' v-if='options.length'>
			{{options[selectedIndex].name}}
			<span class='button__icon fa fa-fw' :class='[hideMenu ? "fa-caret-down" : "fa-caret-up"]'></span>
		</div>
		<div class='button' v-else>
			No options
		</div>

		<div class='select_button__options' :class='{"select_button__options--hidden": hideMenu}'>
			<div
				v-for='(option, index) in options'
				@click='select(index, option.disabled)'
				class='select_button__option'
				:class='{"select_button__option--disabled": option.disabled}'
			>
				{{option.name}}
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'SelectButton',
		props: ['options', 'value', 'name', 'touch-disabled'],
		methods: {
			toggleMenu () {
				this.hideMenu = !this.hideMenu;
			},
			select (index, disabled) {
				if(disabled) return;

				this.selectedIndex = index;
				this.hideMenu = true;

				this.$emit('input', this.options[index].value);
			},
			getIndexFromValue () {
				var index = 0;
				var self = this;

				if(this.value !== null) {
					this.options.forEach((option, i) => {
						if(option.value === self.value) {
							index = i;
						}
					})
				}

				return index;
			}
		},
		data () {
			return {
				selectedIndex: this.getIndexFromValue(),
				hideMenu: true
			}
		},
		watch: {
			value () {
				this.selectedIndex = this.getIndexFromValue();
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';
	.select_button {
		display: inline-block;

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
			z-index: 3;
			overflow: hidden;
			background-color: #fff;
			width: 15rem;
			border: 1px solid $color__gray--darker;
			margin-top: 0.125rem;
			max-height: 20rem;
			box-shadow: 0 3px 6px rgba(0, 0, 0, 0.03), 0 3px 6px rgba(0, 0, 0, 0.12);
			transition: max-height 0.4s ease-out;
			border-radius: 0.2rem;			
			@include user-select(none);

			@at-root #{&}--hidden {
				max-height: 0;
				box-shadow: none;
				border-color: transparent;
				background-color: transparent;
				transition: max-height 0.2s ease-out, box-shadow 0.2s, border-color 0s ease-in 0.19s, background-color 0s ease-in 0.19s;
			}
		}

		@at-root #{&}__option {
			padding: 0.25rem 0.5rem;
			transition: background-color 0.2s;
			cursor: default;

			&:hover {
				background-color: $color__lightgray--primary;
			}
			&:active {
				background-color: darken($color__lightgray--primary, 2%);
			}

			@at-root #{&}--disabled {
				color: $color__gray--darkest;
				pointer-events: none;
			}
		}

	}

	@media (max-width: 425px) {
		.select_button__option {
			font-size: 1.125rem;
			padding: 0.5rem 0.75rem;
		}

		.select_button--touch {
			.select_button {
				@at-root #{&}__overlay {
					transition: all 0.2s;

					@at-root #{&}--show {
						background-color: hsla(213, 35%, 5%, 0.5);
					}
				}

				@at-root #{&}__options {
					width: 100%;
					left: 0;
					bottom: 0;
					position: fixed;
					font-size: 1.125rem;
					opacity: 1;
					border-radius: 0.25rem 0.25rem 0 0;
					transition: opacity 0.2s, bottom 0.2s;
					background-color: rgba(255, 255, 255, 0.97);

					@at-root #{&}--hidden {
						bottom: -100%;
						opacity: 0;
					} 

				}
				@at-root #{&}__option {
					padding: 0.75rem;
				}
			}
		}
	}
</style>

