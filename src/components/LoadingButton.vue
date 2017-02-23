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
		height: 2.25rem;
		position: relative;
		top: 0.76rem;
		height: 2.4rem;
		overflow: hidden;
	}

	.loading_button__icon {
		margin-top: -2.25rem;
		padding-bottom: 1rem;
		transition: all 0.2s;
	}

	.loading_button--loading {
		filter: grayscale(0.5);
		cursor: not-allowed;

		.loading_button__icon {
			margin-top: 0rem;
			transition: all 0.2s;
		}
	}
</style>
