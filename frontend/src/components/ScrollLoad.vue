<template>
	<div class='scroll_load'>
		<slot></slot>
	</div>
</template>

<script>
	import LoadingButton from './LoadingButton'
	import throttle from 'lodash.throttle'

	export default {
		name: 'ScrollLoad',
		props: ['loading'],
		components: {
			LoadingButton
		},
		methods: {
			onScroll (e) {
				if((window.innerHeight + window.pageYOffset) + 300 >= document.body.scrollHeight) {
					if(!this.loading) {
						this.$emit('loadNext')
					}
				} else if(document.body.scrollTop <= 150) {
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