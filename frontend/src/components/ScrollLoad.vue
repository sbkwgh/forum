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
			onScroll: throttle(function (e) {
				if((window.innerHeight + window.pageYOffset) + 300 >= document.body.scrollHeight) {
					if(!this.loading) {
						this.$emit('loadNext')
					}
				} else if(document.body.scrollTop <= 150) {
					if(!this.loading) {
						this.$emit('loadPrevious')
					}
				}
			})
		},
		created () {
			window.addEventListener('scroll', this.onScroll)
		},
		destroyed () {
			window.removeEventListener('scroll', this.onScroll)
		}
	}
</script>