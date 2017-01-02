<template>
	<div class='select_button'>
		<div class='button' @click='toggleMenu'>
			{{options[selectedIndex].name}}
			<span class='button__icon fa fa-fw' :class='[hideMenu ? "fa-caret-down" : "fa-caret-up"]'></span>
		</div>
		<div class='select_button__options' :class='{"select_button__options--hidden": hideMenu}'>
			<div
				v-for='(option, index) in options'
				@click='select(index)'
				class='select_button__option'
			>
				{{option.name}}
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'SelectButton',
		props: ['options', 'value'],
		data () {
			//If value prop is an item of options prop,
			//use that as the default option
			var index = this.options.indexOf(this.value);

			//Otherwise just use the first item
			if(index === -1) index = 0;

			return {
				selectedIndex: index,
				hideMenu: true
			}
		},
		methods: {
			toggleMenu () {
				this.hideMenu = !this.hideMenu;
			},
			select (index) {
				this.selectedIndex = index;
				this.hideMenu = true;

				this.$emit('input', this.options[index]);
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
			overflow: hidden;
			background-color: #fff;
			width: 15rem;
			border: 0.125rem solid $color__gray--primary;
			margin-top: -0.125rem;
			max-height: 20rem;

			transition: max-height 0.4s ease-out;

			

			@at-root #{&}--hidden {
				max-height: 0;
				border-color: transparent;
				background-color: transparent;
				transition: max-height 0.2s ease-out, border-color 0s ease-in 0.19s, background-color 0s ease-in 0.19s;
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
		}

	}
</style>