<template>
	<div class='select_button'>
		<div class='button button--thick_border_thin_text' @click='toggleMenu' v-if='options.length'>
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
		props: ['options', 'value', 'name'],
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

		@at-root #{&}__options {
			position: absolute;
			z-index: 1;
			overflow: hidden;
			background-color: #fff;
			width: 15rem;
			border: 0.125rem solid #EEEEEE;
			margin-top: 0.125rem;
			max-height: 20rem;
			box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.35);
			transition: max-height 0.4s ease-out;
			border-radius: 0.2rem;			

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
				background-color: $color__lightgray--darker;
			}

			@at-root #{&}--disabled {
				color: $color__gray--darkest;
				pointer-events: none;
			}
		}

	}
</style>