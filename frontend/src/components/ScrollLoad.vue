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
		props: ['loading', 'query-selector', 'padding-bottom', 'padding-top'],
		components: {
			LoadingButton
		},
		computed: {
			element () {
				if(this.querySelector){
					return document.querySelector(this.querySelector);
				} else {
					return null;
				}
			}
		},
		methods: {
			onScroll: throttle(function (e) {
				let paddingBottom = this.paddingBottom || 300;
				let paddingTop = this.paddingTop || 150;
				
				let scrollBottom, scrollTop;

				//If already loading then do not fire
				if(this.loading) return;

				if(this.element) {
					scrollBottom = Math.floor(
						this.element.scrollTop +
						this.element.getBoundingClientRect().height +
						paddingBottom -
						this.element.scrollHeight
					);

					scrollTop = paddingTop - this.element.scrollTop;
				} else {
					scrollBottom =
						window.innerHeight + window.pageYOffset +
						paddingBottom -
						document.body.scrollHeight;

					scrollTop = paddingTop - document.body.scrollTop;
				}

				if(scrollBottom > 0) {
					this.$emit('loadNext');
				} else if(scrollTop > 0) {
					this.$emit('loadPrevious');
				}
			})
		},
		mounted () {
			(this.element || window).addEventListener('scroll', this.onScroll);
		},
		destroyed () {
			(this.element || window).removeEventListener('scroll', this.onScroll);
		}
	}
</script>