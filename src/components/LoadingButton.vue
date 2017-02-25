<template>
	<div
		class='button loading_button'
		:class='{"loading_button--loading": loading}'
		@click='event("click")'
		@keydown='event("keydown")'
	>
		<div class='loading_button__icon'>
			<span class='fa fa-refresh fa-spin'></span>
		</div>
		<div class='loading_button__slot'>
			<slot></slot>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'LoadingButton',
		props: ['loading'],
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
	.loading_button {
		position: relative;

		@at-root #{&}__icon {
			transition: all 0.2s;
			position: absolute;
			width: calc(100% - 1rem);
			opacity: 0;
			pointer-events: none;
		}
		@at-root #{&}__slot {
			transition: all 0.2s;
			opacity: 1;
		}
	}

	.loading_button--loading {
		filter: grayscale(0.5);
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
