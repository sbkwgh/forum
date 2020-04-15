<template>
	<menu-tooltip v-model='menuOpen' width='10rem'>
		<div
			slot='button'
			class='sort_menu__button'
			:class='{ "sort_menu__button--selected": menuOpen }'
			@click='menuOpen = true'
		>
			{{display}}
			<font-awesome-icon :icon='["fa", iconName]' fixed-width />
		</div>

		<template slot='menu'>
			<div
				:key='sort'
				v-for='sort in ["asc", "desc"]'
				
				class='sort_menu__item'
				:class='{
					"sort_menu__item--selected": sort == value.sort && value.column == column
				}'
				@click='setSelected(sort)'
			>
				{{sort === 'asc' ? 'Ascending' : 'Descending'}}
			</div>
		</template>
	</menu-tooltip>
</template>

<script>
	import MenuTooltip from './MenuTooltip';

	export default {
		name: 'SortMenu',
		props: ['value', 'column', 'display'],
		components: { MenuTooltip },
		data () {
			return {
				menuOpen: false
			}
		},
		computed: {
			iconName () {
				if(this.value.column !== this.column) {
					return 'chevron-down';
				} else if(this.value.sort === 'asc') {
					return 'sort-amount-up';
				} else { // if this.value.sort === 'desc'
					return 'sort-amount-down';
				}
			}
		},
		methods: {
			setSelected (val) {
				this.$emit('input', {
					column: this.column,
					sort: val
				})

				this.menuOpen = false;
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.sort_menu {
		@at-root #{&}__button {
			cursor: pointer;
			text-transform: capitalize;

			.fa {
				font-size: 0.8rem;
			}

			@at-root #{&}--selected {
				color: $color__blue--darker;
			}
		}

		@at-root #{&}__item {
			background-color: #fff;
			border-radius: 0.25rem;
			cursor: default;
			font-size: 0.9rem;
			font-weight: normal;
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
		}
	}
</style>