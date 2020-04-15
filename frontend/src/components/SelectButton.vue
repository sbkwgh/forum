<template>
	<menu-tooltip
		v-model='menuOpen'
		class='select_button'
		:class='{"select_button--touch": !touchDisabled}'
	>
		<template slot='button'>
			<div
				class='button button--thin_text'
				:class='{ "select_button__button--selected": menuOpen }'
				@click='menuOpen = true'
				v-if='options.length'
			>
				{{options[selectedIndex].name}}
				<font-awesome-icon
					:icon='["fa", "chevron-down"]'
					fixed-width
					class='button__icon select_button__icon'
				/>
			</div>

			<div class='button' v-else>
				No options
			</div>
		</template>

		<template slot='menu'>
			<div
				v-for='(option, index) in options'
				:key='"select-button-option-" + option.name + index'
				@click='select(index, option.disabled)'
				class='select_button__option'
				:class='{
					"select_button__option--disabled": option.disabled,
					"select_button__option--selected": index === selectedIndex && !option.disabled
				}'
			>
				{{option.name}}
			</div>
		</template>
	</menu-tooltip>
</template>

<script>
	import MenuTooltip from './MenuTooltip';

	export default {
		name: 'SelectButton',
		props: ['options', 'value', 'name', 'touch-disabled'],
		components: {
			MenuTooltip
		},
		methods: {
			select (index, disabled) {
				if(disabled) return;

				this.selectedIndex = index;
				this.menuOpen = false;

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
				menuOpen: false
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
		@at-root #{&}__icon {
			font-size: 0.8rem;
			position: relative;
			top: -0.1rem;
		}

		@at-root #{&}__button--selected {
			color: $color__blue--darker !important;
		}

		@at-root #{&}__option {
			background-color: #fff;
			border-radius: 0.25rem;
			cursor: default;
			font-size: 0.9rem;
			margin: 0.25rem 0;
			padding: 0.25rem 0.25rem;
			user-select: none;
			transition: background-color 0.2s;

			@at-root #{&}--selected {
				background-color: $color__lightgray--darker;
			}

			&:hover {
				background-color: $color__lightgray--darker;
			}

			@at-root #{&}--disabled {
				color: $color__gray--darkest;
				pointer-events: none;
			}
		}

	}

	@media (max-width: $breakpoint--tablet) {
		.select_button__option {
			font-size: 1.125rem;
			padding: 0.5rem 0.75rem;
		}

		.select_button--touch {
			.select_button {
				@at-root #{&}__option {
					padding: 0.75rem;
				}
			}
		}
	}
</style>

