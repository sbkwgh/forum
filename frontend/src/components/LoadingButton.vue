<template>
	<button
		class='button loading_button'
		:class='{"loading_button--loading": loading}'
		@click='event("click")'
		@keydown='event("keydown")'
	>
		<loading-icon :dark='dark' class='loading_button__icon'></loading-icon>
		<div class='loading_button__slot'>
			<slot></slot>
		</div>
	</button>
</template>

<script>
	import LoadingIcon from './LoadingIcon'

	export default {
		name: 'LoadingButton',
		props: ['loading', 'dark'],
		components: { LoadingIcon },
		methods: {
			event (name) {
				if(this.loading) {
					return;
				} else {
					this.$emit(name)
				}
			}
		}
	}
</script>

<style lang='scss'>
	@import '../assets/scss/variables.scss';

	.loading_button {
		position: relative;
	
		@at-root #{&}__slot {
			transition: all 0.2s;
			opacity: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
		}


		@at-root #{&}__icon {
			position: absolute;
			width: calc(100% - 1rem);
			opacity: 0;
			justify-content: center;
			height: calc(100% - 0.85rem);
			align-items: center;
		}
	}

	.loading_button--loading {
		cursor: not-allowed;

		.loading_button__icon {
			opacity: 1;
			transition: all 0.2s;
		}
		.loading_button__slot {
			opacity: 0;
			transition: all 0.2s;
		}
	}
</style>
