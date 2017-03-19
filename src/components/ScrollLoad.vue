<template>
	<div class='scroll_load'>
		<div class='scroll_load__button' :class='{"scroll_load__button--hidden": !showPrevious}'>
			<loading-button
				class='button'
				:loading='loading'
				:dark='true'
				@click='$emit("loadPrevious")'
			>
				Load previous posts...
			</loading-button>
		</div>
		<slot></slot>
		<div class='scroll_load__button' :class='{"scroll_load__button--hidden": !showNext}'>
			<loading-button
				class='button'
				:loading='loading'
				:dark='true'
				@click='$emit("loadNext")'
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
		props: ['loading', 'showNext', 'showPrevious'],
		components: {
			LoadingButton
		},
		methods: {
			onScroll (e) {
				if(document.body.scrollHeight - document.body.scrollTop - 150 <= document.body.clientHeight) {
					if(!this.loading) {
						this.$emit('loadNext')
					}
				} else if(document.body.scrollTop <= 200) {
					if(!this.loading) {
						this.$emit('loadPrevious')
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
			margin-top: 2rem;
			text-align: center;
			transition: all 0.2s;

			@at-root #{&}--hidden {
				max-height: 0;
				margin-top: 0;
				transition: all 0.2s;
			}
		}
	}
</style>