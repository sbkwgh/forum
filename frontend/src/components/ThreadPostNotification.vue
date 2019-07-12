<template>
	<transition name='slide-fade'>
		<div class='thread_post_notification' @click='$emit("goToPost")'>
			<span class='thread_post_notification__close' @click.stop='$emit("close")'></span>
			<div class='thread_post_notification__header_bar'>
				<span class='thread_post_notification__username'>{{post.username}}</span>
				replied &nbsp;&middot;&nbsp; click to view
			</div>
			<div class='thread_post_notification__content'>{{post.content | stripTags | truncate(150)}}</div>
		</div>
	</transition>
</template>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.slide-fade-enter-active, .slide-fade-leave-active {
		transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) !important;
	}
	.slide-fade-enter, .slide-fade-leave-to {
		transform: translateX(25rem);
		opacity: 0;
	}


	.thread_post_notification {
		position: fixed;
		bottom: 2.5rem;
		cursor: default;
		overflow: hidden;
		right: 2.5rem;
		width: 20rem;
		height: 5rem;
		background-color: #fff;
		z-index: 3;
		transition: background-color 0.2s;
		border-radius: 0.25rem;
		box-shadow: 0 0 0.5rem 1px rgba(175, 175, 175, 0.3), 0 0.2rem 0.3rem 0px rgba(175, 175, 175, 0.15);

		&:hover {
			background-color: lighten($color__lightgray--primary, 2.75%);
		}

		@at-root #{&}__header_bar {
			width: 100%;
			font-size: 0.9rem;
			margin-top: 0.5rem;
			margin-left: 0.75rem;
			color: $color__text--secondary;
		}
		@at-root #{&}__username, #{&}__date {
			color: $color__text--primary;
		}
		@at-root #{&}__content {
			padding: 0.75rem;
			padding-top: 0.5rem;
		}
		@at-root #{&}__close {
			    position: absolute;
				right: 0.5rem;
				top: 0.5rem;
				cursor: pointer;
				border-radius: 100%;
				background-color: $color__lightgray--primary;
				transition: background-color 0.2s;
				width: 1rem;
				height: 1rem;
			
			@include user-select(none);

			&:hover {
				background-color: $color__lightgray--darker;
			}
			&::after {
				content: '\d7';
				position: relative;
				left: 0.2rem;
				top: -0.15rem;
			}
		}
	}

</style>

<script>
	export default {
		name: 'ThreadPostNotification',
		props: ['post']
	}
</script>