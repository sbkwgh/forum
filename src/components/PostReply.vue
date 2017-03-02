<template>
	<div class='post_reply' @mouseenter='setState(true)' @mouseleave='setState(false)'>
		<div
			class='post_reply__post'
			:class="{
				'post_reply__post--show': show,
				'post_reply__post--pointer_events': pointerEvents,
			}"
		>
			<div class='post_reply__date'>{{post.createdAt | formatDate('date|time', ' - ')}}</div>
			<div class='post_reply__content' v-html='post.content'></div>
		</div>
		<div class='post_reply__display'>
			<div class='post_reply__letter'>{{post.User.username[0]}}</div>
			<div class='post_reply__username'>{{post.User.username}}</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'PostReply',
		props: ['post'],
		data () {
			return {
				show: false,
				pointerEvents: false
			}
		},
		methods: {
			setState (val) {
				if(val) {
					this.pointerEvents = true
					this.show = true
				} else {
					this.show = false;
					setTimeout(() => {
						if(this.show) return;

						this.pointerEvents = false
					}, 300)
				}
			}
		}
	}
</script>

<style lang='scss'>
	@import '../assets/scss/variables.scss';

	.post_reply {
		position: relative;

		@at-root #{&}__date {
			color: $color__gray--darkest;
			font-size: 0.8rem;
		}

		@at-root #{&}__post {
			opacity: 0;
			max-height: 7.5rem;
			pointer-events: none;
			width: 17.5rem;
			z-index: 2;
			overflow-y: auto;
			position: absolute;
			bottom: calc(100% + -0.5rem);
			background-color: #fff;
			padding: 0.5rem;
			border: 0.125rem solid $color__gray--darker;
			box-shadow: none;
			transition: all 0.2s;
			transition-delay: 0.3s;

			@at-root #{&}--show {
				bottom: calc(100% + 0.5rem);
				box-shadow: 0 3px 6px rgba(0, 0, 0, 0.03), 0 3px 6px rgba(0,0,0,0.06);
				opacity: 1;
				display: initial;
				transition: all 0.2s;
				transition-delay: 0.5s;
			}
			@at-root #{&}--pointer_events {
				pointer-events: all;
			}
		}
		@at-root #{&}__content {
			*:first-child, *:last-child {
				margin: 0;
			}
			p {
				margin: 0.25rem 0;
			}
		}

		@at-root #{&}__display {
			display: inline-flex;
			align-items: baseline;
			border: thin solid $color__darkgray--primary;
			padding: 0.25rem 0.375rem;
			justify-content: center;
			margin: 0 0.25rem;
			position: relative;
			border-radius: 1rem;

			cursor: pointer;
			transition: background-color 0.2s;

			&:hover {
				background-color: $color__lightgray--primary;
			}
			&:active {
				background-color: $color__lightgray--darker;
			}
		}
		@at-root #{&}__letter {
			height: 1.25rem;
			width: 1.25rem;
			line-height: 1.25rem;
			@include text($font--role-emphasis, 0.85rem)
			text-align: center;
			border-radius: 100%;
			background-color: $color__gray--darkest;
			color: #fff;
			margin-right: 0.25rem;
		}
		@at-root #{&}__username {
			font-size: 0.85rem;
		}
	}
</style>