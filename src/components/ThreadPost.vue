<template>
	<div
		class='post'
		:class='{"post--highlighted": highlight}'
		@mouseenter='setPostFooterState(true)'
		@mouseleave='setPostFooterState(false)'
	>
		<modal-window v-model='showShareModal'>
			<div style='padding: 0rem 1rem 1rem 1rem;'>
				<p>Copy this URL to share the post</p>
				<fancy-input placeholder='Post URL' :value='postURL' width='100%'></fancy-input>
				<button class='button button--modal' @click='setShareModalState(false)'>OK</button>
			</div>
		</modal-window>
		<div class='post__meta_data'>
			<avatar-icon :user='post.User' class='post__avatar'></avatar-icon>
			<div class='post__thread' v-if='showThread' @click='goToThread'>{{post.Thread.name}}</div>
			<div class='post__user' v-else>{{post.User.username}}</div>
			<replying-to
				style='margin-right: 0.5rem;'
				v-if='post.replyingToUsername'
				:replyId='post.replyId'
				:username='post.replyingToUsername'
				@click='$emit("goToPost", post.replyId)'
			></replying-to>
			<div class='post__date'>{{post.createdAt | formatDate('time|date', ', ')}}</div>
		</div>
		<div class='post__content' v-html='post.content'></div>
		<div class='post__footer' :class='{ "post__footer--show": hover }'>
			<div
				class='post__footer_group'
				:class='{ "post__footer_group--replies": post.Replies.length }'
			>
				<post-reply
					v-for='reply in post.Replies'
					:post='reply'
					:hover='hover'
					@click='$emit("goToPost", reply.id)'
				></post-reply>
			</div>
			<div
				class='post__footer_group'>
				<div class='post__action post__share' @click='setShareModalState(true)'>Share</div>
				<div
					class='post__action post__reply'
					v-if='$store.state.username && showReply'
					@click='$emit("reply", post.id, post.User.username)'
				>
					Reply
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import PostReply from './PostReply'
	import ModalWindow from './ModalWindow'
	import FancyInput from './FancyInput'
	import ReplyingTo from './ReplyingTo'
	import AvatarIcon from './AvatarIcon'

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'ThreadPost',
		props: ['post', 'highlight', 'showReply', 'showThread'],
		components: {
			PostReply,
			ModalWindow,
			FancyInput,
			ReplyingTo,
			AvatarIcon
		},
		data () {
			let post = this.post

			return {
				hover: false,
				showShareModal: false,
				postURL: `${location.origin}/thread/${post.Thread.name}/${post.ThreadId}/${post.id}`
			}
		},
		methods: {
			setPostFooterState (state) {
				this.hover = state
			},
			setShareModalState (val) {
				this.showShareModal = val
			},
			goToThread () {
				this.$router.push(`/thread/${this.post.Thread.slug}/${this.post.Thread.id}`)
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	@keyframes shake {
		0% {
			left: 0rem;
		}
		25% {
			left: -0.5rem;
		}
		75% {
			left: 0.5rem;
		}
		100% {
			left: 0rem;
		}
	}

	.post {
		position: relative;
		border-top: thin solid $color__gray--primary;
		transition: background-color 0.5s;
		margin: 0.5rem 0;

		@at-root #{&}--highlighted {
			background-color: $color__lightgray--darkest;
			animation-name: shake;
			animation-iteration-count: 5;
			animation-timing-function: linear;
			animation-duration: 0.25s;
		}

		@at-root #{&}--last {
			padding-bottom: 0.5rem;
			border-bottom: thin solid $color__gray--primary;
		}

		@at-root #{&}__meta_data {
			display: flex;
			padding-top: 0.75rem;
			position: relative;
			margin-left: 4rem;
		}
		@at-root #{&}__avatar {
			position: absolute;
			left: -4rem;
		}
		@at-root #{&}__user {
			@include text($font--role-default, 1rem, 600);
			margin-right: 0.5rem;
		}
		@at-root #{&}__thread {
			@include text($font--role-default, 1rem, 400);
			margin-right: 0.5rem;
			cursor: pointer;

			&:hover {
				color: $color__darkgray--primary;
			}
		}
		@at-root #{&}__date {
			color: $color__gray--darkest;
			margin-right: 0.5rem;
		}
		@at-root #{&}__content {
			padding: 0.5rem 0 0.5rem 4rem;
		}
		@at-root #{&}__footer {
			padding: 0.5rem 0 0.75rem 4rem;
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			opacity: 0.75;
			transition: opacity 0.2s;

			@at-root #{&}--show {
				opacity: 1;
				transition: opacity 0.2s;
			}

			@at-root #{&}_group {
				align-items: baseline;
				display: inline-flex;
				position: relative;


				@at-root #{&}--replies {
					&::before {
						content: 'Replies:';
						bottom: 0.25rem;
						left: -3.75rem;
						font-size: 0.9rem;
						position: absolute;	
						color: $color__darkgray--primary;
						transition: opacity 0.2s, bottom 0.2s;
					}
				}
			}
		}
		@at-root #{&}__action {
			color: $color__darkgray--primary;
			cursor: pointer;
			margin-right: 0.75rem;

			transition: all 0.2s;

			&:hover {
				color: $color__darkgray--darkest;
			}
		}
	}
</style>