<template>
	<div class='post_scrubber'>
		<div class='post_scrubber__line' ref='line' @click='lineClick'></div>
		<div
			class='post_scrubber__dragger'
			
			:style='{
				"top": draggerYCoordPx
			}'

			@mousedown.prevent.stop='setDragging(true)'
			@mouseup.prevent.stop='setDragging(false)'
		></div>
		<div
			class='post_scrubber__dragger_info'
			
			:style='{
				"top": draggerYCoordPx
			}'
		>
			012345
		</div>
	</div>
</template>

<script>
	export default {
		name: 'PostScrubber',
		data () {
			return {
				clientY: 0,
				lineTop: 0,
				lineHeight: 0,
				dragging: false,

				posts: 20
			}
		},
		computed: {
			draggerYCoordPx () {
				if(!this.clientY || !this.lineTop) return '0px'

				let top = this.clientY - this.lineTop

				if(top < 0) {
					return '0px'
				} else if(top > this.lineHeight) {
					return this.lineHeight + 'px'
				} else {
					return top + 'px'
				}
			}
		},
		methods: {
			setDragging (val) {
				this.dragging = val
			},
			lineClick (e) {
				this.clientY = e.clientY
			}
		},
		mounted () {
			let lineRect = this.$refs.line.getBoundingClientRect()
			this.lineTop = lineRect.top
			this.lineHeight = lineRect.height

			window.addEventListener('mousemove', e => {
				if(this.dragging) {
					this.clientY = e.clientY
				}
			})
			window.addEventListener('mouseup', e => {
				this.dragging = false
			})
		}
	}
</script>


<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.post_scrubber {
		height: 10rem;
		position: fixed;
		right: calc(10% + 5rem);
		margin-top: 5.25rem;

		@at-root #{&}__line {
			height: 100%;
			background-color: $color__gray--darker;
			border-radius: 1rem;
			width: 0.125rem;
		}

		@at-root #{&}__dragger {
			background-color: $color__blue--primary;
			width: 0.5rem;
			border-radius: 1rem;
			height: 1.5rem;
			position: absolute;
			top: 0;
			left: calc( (0.5rem - 0.125rem) / -2);
			margin-top: calc(-1.5rem / 2 );
			cursor: pointer;
			transition: background-color 0.2s;

			&:hover {
				background-color: $color__blue--darker;
			}
			&:active {
				background-color: $color__blue--darkest;
			}
		}

		@at-root #{&}__dragger_info {
			position: absolute;
			margin-top: calc(-1.5rem / 2 - 0.125rem);
			pointer-events: none;
			background-color: #fff;
			left: 1rem;
			font-size: 0.9rem;
			border-radius: 0.125rem;
			padding: 0.25rem;

			@extend .shadow_border;
		}
	}
</style>