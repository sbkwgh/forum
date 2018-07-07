<template>
	<menu-tooltip
		v-model='menuOpen'
		top='0'
		width='10rem'
		touch-disabled='true'
	>
		<div class='menu_button__icon' @click='menuOpen = true' slot='button'>
			<slot></slot>
		</div>

		<template slot='menu'>
			<div
				class='menu_button__option'
				v-for='(option, $index) in options'
				@click='emit(option.event)'
				:style="{ 'border-bottom' : $index === options.length-1 ? 'none' :  'solid thin rgb(245, 245, 245)' }"
			>
				{{option.value}}
			</div>
		</template>
	</menu-tooltip>
</template>

<script>
	import MenuTooltip from './MenuTooltip';

	export default {
		name: 'MenuButton',
		props: ['options'],
		components: {
			MenuTooltip
		},
		data () {
			return {
				menuOpen: false
			}
		},
		methods: {
			emit (option) {
				this.$emit(option)
				this.menuOpen = false;
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.menu_button {
		@at-root #{&}__option {
			border-radius: 0.25rem;
			cursor: default;
			font-size: 0.9rem;
			padding: 0.5rem;
			transition: all 0.2s;

			&:hover { background-color: $color__lightgray--primary;  }
			&:active { background-color: $color__lightgray--darker; }
		}
	}

	@media (max-width: 420px) {
		.menu_button {
			@at-root #{&}__option {
				padding: 0.75rem;
				font-size: 1.125rem;
			}
		}
	}
</style>