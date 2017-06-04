<template>
	<div
		class='post'
		:class='{
			"post--highlighted": highlight,
			"post--selected": selected
		}'
		@mouseenter='setPostFooterState(true)'
		@mouseleave='setPostFooterState(false)'
	>
		<span
			class='post__remove_icon fa fa-check'
			:class='{"post__remove_icon--show": showSelect && !post.removed}'
			@click='toggleSelected'
		></span>
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
			<div class='post__user' v-else>{{username}}</div>
			<replying-to
				style='margin-right: 0.5rem;'
				v-if='post.replyingToUsername'
				:replyId='post.replyId'
				:username='post.replyingToUsername'
				@click='$emit("goToPost", post.replyId, true)'
			></replying-to>
			<div class='post__date'>{{post.createdAt | formatDate('time|date', ', ')}}</div>
		</div>
		<div class='post__content' v-html='post.content'></div>
		<div class='post__footer' :class='{ "post__footer--show": hover }'>
			<div
				class='post__footer_group'
			>
				<div class='post__footer_sub_group'>
					<heart-button :post='post'></heart-button>
				</div>
				<div class='post__footer_sub_group' v-if='post.Replies.length'>
					<span class='post__footer_sub_group__text post__footer_sub_group__text--replies'>replies</span>
					<post-reply
						v-for='(reply, index) in post.Replies'
						:post='reply'
						:hover='hover'
						:first='index === 0'
						@click='$emit("goToPost", reply.postNumber)'
					></post-reply>
				</div>
				
			</div>
			<div
				class='post__footer_group'>
				<div class='post__action post__share' @click='setShareModalState(true)'>Share</div>
				<div
					class='post__action post__reply'
					v-if='$store.state.username && showReply'
					@click='$emit("reply", post.id, username)'
				>
					Reply
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import PostReply from './PostReply'
	import HeartButton from './HeartButton'
	import ModalWindow from './ModalWindow'
	import FancyInput from './FancyInput'
	import ReplyingTo from './ReplyingTo'
	import AvatarIcon from './AvatarIcon'

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'ThreadPost',
		props: ['post', 'highlight', 'showReply', 'showThread', 'showSelect'],
		components: {
			PostReply,
			ModalWindow,
			FancyInput,
			ReplyingTo,
			AvatarIcon,
			HeartButton
		},
		data () {
			let post = this.post

			return {
				hover: false,
				showShareModal: false,
				postURL: `${location.origin}/p/${post.id}`,
				selected: false
			}
		},
		computed: {
			username () {
				if(this.post.User) {
					return this.post.User.username
				} else {
					return '[deleted]'
				}
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
			},
			toggleSelected () {
				this.selected = !this.selected

				this.$emit('selected', this.post.id)
			}
		},
		watch: {
			showSelect () {
				if(this.selected) {
					this.$emit('selected', this.post.id)
				}

				this.selected = false
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
		border-bottom: thin solid $color__gray--primary;
		transition: background-color 0.5s;
		margin: 0.5rem 0;
		border-radius: 0.25rem;

		@at-root #{&}--highlighted {
			background-color: $color__lightgray--darkest;
			animation-name: shake;
			animation-iteration-count: 5;
			animation-timing-function: linear;
			animation-duration: 0.25s;
		}

		@at-root #{&}--last {
			border-bottom: none;
			margin-bottom: 0;
		}

		@at-root #{&}__remove_icon {
			position: absolute;
			right: 1rem;
			display: inline-block;
			top: 1rem;
			color: #fff;
			cursor: pointer;
			background-color: gray;
			z-index: 1;
			border-radius: 100%;
			opacity: 0;
			pointer-events: none;
			padding: 0.25rem;

			transition: all 0.2s;

			@at-root #{&}--show {
				opacity: 1;
				pointer-events: all;
			}
		}
		@at-root #{&}--selected {
			transform: scale(0.95);
			padding: 1rem;
			background-color: $color__lightgray--primary;
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
			padding: 0.5rem 0 0.75rem 0.5rem;
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			opacity: 0.6;
			transition: opacity 0.2s;

			@at-root #{&}--show {
				opacity: 1;
				transition: opacity 0.2s;
			}

			@at-root #{&}_sub_group {
				display: flex;
				align-items: baseline;
				margin-right: 1rem;

				@at-root #{&}__text {
					font-variant: small-caps;
					margin: 0 0.25rem;
					margin-left: 0;
				}
			}

			@at-root #{&}_group {
				align-items: center;
				display: inline-flex;
				position: relative;
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