<template>
	<div class='select_filter'>
		<div
			class='select_filter__overlay'
			:class='{ "select_filter__overlay--show": menuOpen }'
			@click='menuOpen = false'
		></div>

		<button
			class='button select_filter__button'
			:class='{ "select_filter__button--selected": menuOpen }'
			@click='menuOpen = !menuOpen'
		>
			{{name}}
			<span class='fa fa-chevron-down'></span>
		</button>

		<div
			class='select_filter__menu'
			:class='{ "select_filter__menu--show": menuOpen }'
		>
			<div class='select_filter__menu__inner'>
				<div
					class='select_filter__item select_filter__item--select_all'
					@click='toggleSelectAll'
				>
					<div
						class='select_filter__checkbox'
						:class='{ "select_filter__checkbox--selected": selected.length === options.length }'
					></div>
					<span>Select all</span>
				</div>

				<div
					class='select_filter__item'
					v-for='(item, $index) in options'
					@click='toggledSelectItem($index)'
				>
					<div
						class='select_filter__checkbox'
						:class='{ "select_filter__checkbox--selected": selected.includes($index) }'
					></div>
					<span>{{item.name}}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'SelectFilter',
		props: ['name', 'options', 'value'],
		data () {
			return {
				menuOpen: false,
				selected: []
			}
		},
		methods: {
			toggleSelectAll () {
				//If everything is selected
				if(this.selected.length === this.options.length) {
					this.selected = [];
				} else {
					this.selected = this.options.map((_, i) => i);
				}
			},
			toggledSelectItem (itemIndex) {
				let selectedArrIndex = this.selected.indexOf(itemIndex);

				if(selectedArrIndex === -1) {
					this.selected.push(itemIndex);
				} else {
					this.selected.splice(selectedArrIndex, 1);
				}
			}
		},
		watch: {
			selected () {
				let selectedItems = this.options.filter((item, index) => {
					return this.selected.includes(index);
				});

				this.$emit('value', selectedItems);
			}
		},
		mounted () {
			this.toggleSelectAll();
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.select_filter {
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

		@at-root #{&}__button {
			border-radius: 0.25rem;
			cursor: pointer;
			font-weight: normal;
			position: relative;
			transition: color 0.2s, border-color 0.2s;

			&:hover {
				color: $color__blue--darker;
			}

			span.fa {
				font-size: 0.7rem;
				transform: rotate(0deg) translateY(-0.1rem);
				transition: transform 0.2s;
			}
			@at-root #{&}--selected {
				color: $color__blue--darker !important;

				span.fa {
					transform: rotate(180deg) translateY(0rem);
				}
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

		@at-root #{&}__item {
			align-items: center;
			background-color: #fff;
			border-radius: 0.25rem;
			cursor: default;
			display: grid;
			font-size: 0.9rem;
			font-weight: normal;
			grid-column-gap: 0.5rem;
			grid-template-columns: 1rem auto;
			justify-items: start;
			padding: 0.125rem 0.25rem;
			user-select: none;
			transition: background-color 0.2s;

			&:hover {
				background-color: $color__lightgray--darker;
			}

			@at-root #{&}--select_all {
				font-weight: 600;
			}
		}

		@at-root #{&}__checkbox {
			background-color: #fff;
			border: thin solid $color__gray--darkest;
			border-radius: 0.25rem;
			height: 1rem;
			width: 1rem;
			transition: all 0.2s;

			@at-root #{&}--selected {
				background-color: $color__blue--darker;
				border: thin solid $color__blue--primary;
				box-shadow: 0 0 0 1.5px $color__blue--primary inset;
			}
		}
	}
</style>