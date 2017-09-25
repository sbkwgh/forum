<template>
	<div class='post_scrubber'>
		<div class='post_scrubber__label post_scrubber__label--first' @click='$emit("input", 0)'>First post</div>
		<div class='post_scrubber__line' ref='line' @click='lineClick'></div>
		<div
			class='post_scrubber__dragger'
			
			:class='{ "post_scrubber--no_top_transition": dragging }'
			:style='{
				"top": draggerYCoord + "px"
			}'

			@mousedown.prevent.stop='setDragging(true)'
			@mouseup.prevent.stop='setDragging(false)'
		></div>
		<div
			class='post_scrubber__dragger_info'
			:class='{ "post_scrubber--no_top_transition": dragging }'
			
			:style='{
				"top": draggerYCoord + "px"
			}'
		>
			Post <strong>{{currentPost}}</strong> out of {{posts}}
		</div>
		<div
			class='post_scrubber__label post_scrubber__label--last'
			@click='$emit("input", posts-1)'
		>
			Latest post
		</div>
	</div>
</template>

<script>
	export default {
		name: 'PostScrubber',
		props: ['posts', 'value'],
		data () {
			return {
				clientY: 0,
				lineTop: 0,
				lineHeight: 0,
				dragging: false
			}
		},
		computed: {
			draggerYCoord () {
				if(!this.clientY || !this.lineTop) return 0

				let top = this.clientY - this.lineTop

				if(top < 0) {
					return 0
				} else if(top > this.lineHeight) {
					return this.lineHeight
				} else {
					return top
				}
			},
			currentPost () {
					let postDivision = this.lineHeight / this.posts
					let postNumber = Math.floor(this.draggerYCoord/ postDivision)
					let retPostNumber

					if(postNumber === this.posts) {
						retPostNumber = postNumber
					} else {
						retPostNumber = postNumber + 1
					}

					return retPostNumber
			}
		},
		methods: {
			setDragging (val) {
				this.dragging = val

				if(!val) {
					this.$emit('input', this.currentPost-1)
				}
			},
			lineClick (e) {
				this.clientY = e.clientY
			},
			setCurrentPost () {
				let postNumber = +this.value
				let postDivision = this.lineHeight / this.posts

				if(postNumber+1 === this.posts) {
					this.clientY = this.lineTop + this.lineHeight
				} else {
					this.clientY = this.lineTop + postDivision * postNumber
				}
			}
		},
		watch: {
			value: 'setCurrentPost'
		},
		mounted () {
			let lineRect = this.$refs.line.getBoundingClientRect()
			this.lineTop = lineRect.top
			this.lineHeight = lineRect.height

			this.setCurrentPost()

			window.addEventListener('mousemove', e => {
				if(this.dragging) {
					this.clientY = e.clientY
				}
			})
			window.addEventListener('mouseup', e => {		
				if(this.dragging) {
					this.dragging = false
					this.$emit('input', this.currentPost-1)
				}
			})
		}
	}
</script>


<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.post_scrubber {
		height: 10rem;
		position: relative;
		margin-top: 2rem;

		@at-root #{&}--no_top_transition {
			transition: background-color 0.2s !important;
		}

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
			transition: background-color 0.2s, top 0.3s;

			&:hover {
				background-color: $color__blue--darker;
			}
			&:active {
				background-color: $color__blue--darkest;
			}
		}

		@at-root #{&}__label {
			position: absolute;
			color: $color__blue--primary;
			cursor: pointer;
			left: -0.25rem;
			width: 10rem;

			@at-root #{&}--first {
				top: -2.25rem;
			}
			@at-root #{&}--last {
				bottom: -2.25rem;
			}
		}

		@at-root #{&}__dragger_info {
			position: absolute;
			width: 10rem;
			margin-top: calc(-1.5rem / 2 - 0.125rem);
			pointer-events: none;
			background-color: #fff;
			left: 1rem;
			font-size: 0.9rem;
			border-radius: 0.125rem;
			padding: 0.25rem;
			transition: top 0.3s;

			@extend .shadow_border;
		}
	}
</style>