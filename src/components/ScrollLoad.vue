<template>
	<div class='scroll_load'>
		<slot></slot>
		<div class='scroll_load__button' :class='{"scroll_load__button--hidden": !show}'>
			<loading-button
				class='button'
				:loading='loading'
				:dark='true'
				@click='$emit("load")'
			>
				Load more posts...
			</loading-button>
		</div>
	</div>
</template>

<script>
	import LoadingButton from './LoadingButton'
	import throttle from 'lodash.throttle'

	export default {
		name: 'ScrollLoad',
		props: ['loading', 'show'],
		components: {
			LoadingButton
		},
		methods: {
			onScroll (e) {
				if(document.body.scrollHeight - document.body.scrollTop - 150 <= document.body.clientHeight) {
					if(!this.loading) {
						this.$emit('load')
					}
				}
			}
		},
		computed: {
			throttledOnScroll () {
				return throttle(this.onScroll, 200)
			}
		},
		created () {
			window.addEventListener('scroll', this.throttledOnScroll)
		},
		destroyed () {
			window.removeEventListener('scroll', this.throttledOnScroll)
		}
	}
</script>

<style lang='scss' scoped>
	.scroll_load {
		@at-root #{&}__button {
			max-height: 4rem;
			overflow: hidden;
			margin-bottom: 2rem;
			text-align: center;
			transition: all 0.2s;

			@at-root #{&}--hidden {
				max-height: 0;
				margin-bottom: 0;
				transition: all 0.2s;
			}
		}
	}
</style>