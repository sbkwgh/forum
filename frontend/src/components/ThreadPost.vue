<template>
	<div
		class='post'
		:class='{
			"post--highlighted": highlight,
			"post--selected": selected
		}'
		@mouseenter='hover = true'
		@mouseleave='hover = false'

		@click='goToPost'
	>
		<div
			class='post__quote'
			:class='{ "post__quote--show": showQuote && allowQuote && showReply && $store.state.username }'
			:style='{
				"left": quoteX + "px",
				"top": quoteY + "px"
			}'

			@mousedown='emitReply'
		>
			<span class='post__quote__icon fa fa-quote-right'></span>
			Quote post	
		</div>


		<span
			class='post__remove_icon fa fa-check'
			:class='{"post__remove_icon--show": showSelect && !post.removed}'
			@click.stop='toggleSelected'
		></span>

		<modal-window v-model='showShareModal' @click.stop='() => {}'>
			<div slot='main'>
				<p>Copy this URL to share the post</p>
				<fancy-input placeholder='Post URL' :value='postURL' width='100%'></fancy-input>
			</div>
			<button slot='footer' class='button button--modal' @click.stop='setShareModalState(false)'>OK</button>
		</modal-window>

		<report-post-modal v-model='showReportPostModal' :post-id='post.id'></report-post-modal>

		<div class='post__meta_data'>
			<div style='display: inline-flex;'>
				<avatar-icon :user='post.User' class='post__avatar'></avatar-icon>
				<div class='post__thread' v-if='showThread' @click.stop='goToThread'>
					In thread <span class='post__thread__name'>{{post.Thread.name | truncateMid(50)}}</span>
					&nbsp;&middot;&nbsp;
				</div>
				<div class='post__user' v-else>
					{{username}}

					<span class='admin_badge' v-if='post.User && post.User.admin'>admin</span>
				</div>

				<replying-to
					style='margin-right: 0.5rem;'
					v-if='post.replyingToUsername'
					:replyId='post.replyId'
					:username='post.replyingToUsername'
					@click='$emit("goToPost", post.replyId, true)'
				></replying-to>
			</div>
			<div class='post__date'>{{post.createdAt | formatDate('time|date', ', ')}}</div>
		</div>
		<div class='post__date post__date--mobile'>{{post.createdAt | formatDate('time|date', ', ')}}</div>
		<div
			tabindex='-1'
			class='post__content'
			v-html='postContentHTML'
			@mouseup='setShowQuote'
			@blur='showQuote = false'
		></div>
		<div class='post__footer'>
			<div
				class='post__footer_group'
			>
				<div class='post__footer_sub_group'>
					<heart-button :post='post' v-if='showReply'></heart-button>
				</div>
				<div class='post__footer_sub_group' v-if='post.Replies.length'>
					<span class='post__footer_sub_group__text post__footer_sub_group__text--replies'>replies</span>
					<post-reply
						v-for='(reply, index) in post.Replies'
						:key='reply.postNumber'

						:post='reply'
						:hover='hover'
						:first='index === 0'
						@click='$emit("goToPost", reply.postNumber)'
					></post-reply>
				</div>
				
			</div>
			<div
				class='post__footer_group post__actions'
				:class='{ "post__actions--show": showActions }'
				v-if='!post.removed'
			>
				<div class='post__action post__share' @click.stop='setShareModalState(true)'>share</div>
				<div
					class='post__action'
					@click.stop='setShowReportPostModal(true)'
					v-if='$store.state.username'
				>
					report
				</div>
				<div
					class='post__action post__reply'
					v-if='$store.state.username && showReply'
					@click.stop='$emit("reply", post.id, username)'
				>
					reply
				</div>
			</div>
		</div>
		<div class='post__replies'>
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
	import ReportPostModal from './ReportPostModal'

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'ThreadPost',
		props: [
			'post',
			'highlight',
			'showReply',
			'showThread',
			'showSelect',
			'clickForPost',
			'allowQuote'
		],
		components: {
			PostReply,
			ModalWindow,
			FancyInput,
			ReplyingTo,
			AvatarIcon,
			HeartButton,
			ReportPostModal
		},
		data () {
			let post = this.post

			return {
				hover: false,
				showShareModal: false,
				showReportPostModal: false,
				postURL: `${location.origin}/p/${post.id}`,
				selected: false,
 
				showQuote: false,
				quoteX: 0,
				quoteY: 0,
				quoteSelection: '',

				postContentHTML: post.content
			}
		},
		computed: {
			username () {
				if(this.post.User) {
					return this.post.User.username
				} else {
					return '[deleted]'
				}
			},
			showActions () {
				return this.hover || this.showShareModal || this.showReportPostModal
			}
		},
		methods: {
			emitReply (e) {
				this.showQuote = false;
				this.$emit('reply', this.post.id, this.username, this.quoteSelection);
			},
			setShowQuote (e) {
				let rootCoords = this.$el.getBoundingClientRect();

				let selection = window.getSelection();
				let coords = selection.getRangeAt(0).getBoundingClientRect();
				let text = selection.toString();

				if(text.length) {
					this.quoteY = coords.top - rootCoords.top - 30;
					this.quoteX = coords.left - rootCoords.left;
					this.quoteSelection =  '> ' + text.replace(/\n/g, '\n> ') + '\n\n';
					this.showQuote = true;
				} else {
					this.showQuote = false;
				}
			},
			setShareModalState (val) {
				this.showShareModal = val
			},
			setShowReportPostModal (val) {
				this.showReportPostModal = val
			},
			goToThread () {
				this.$router.push(`/thread/${this.post.Thread.slug}/${this.post.Thread.id}`)
			},
			goToPost () {
				if(this.clickForPost) {
					this.$router.push(
						'/thread/' +
						this.post.Thread.slug + '/' +
						this.post.Thread.id + '/' +
						this.post.postNumber
					)
				}
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
		},
		mounted () {
			this.$linkExpander(this.post.content, v => this.postContentHTML = v);
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
		border-bottom: thin solid $color__gray--darker;
		transition: background-color 0.5s;
		margin: 0.5rem -0.5rem;
		padding: 0 0.5rem;
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

		@at-root #{&}__quote {
			background: #464646;
			border-radius: 0.25rem;
			box-shadow: 0px 2px 0.25rem $color__gray--darkest;
			color: #fff;
			cursor: pointer;
			font-size: 1rem;
			font-weight: 400;
			left: 70px;
			opacity: 0;
			padding: 0.25rem 0.4rem;
			pointer-events: none;
			position: absolute;
			top: 19px;
			transition: opacity 0.1s;
			z-index: 3;

			@at-root #{&}--show {
				opacity: 1;
				pointer-events: all;
			}

			@at-root #{&}__icon {
				font-size: 0.8rem;
				padding: 0 0.125rem;
			}
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
			justify-content: space-between;
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
			color: $color__text--secondary;
		
			@at-root #{&}__name {
				cursor: pointer;
				@include text($font--role-default, 1rem, 600);

				&:hover {
					color: $color__darkgray--primary;
				}
			}
		}
		@at-root #{&}__date {

			@at-root #{&}--mobile {
				display: none;
			}
		}
		@at-root #{&}__content {
			padding: 0 0.5rem 0 4rem;
			outline: none;
			word-wrap: anywhere;
		}
		@at-root #{&}__footer {
			padding: 0.5rem 0 0.75rem 0.5rem;
			display: flex;
			align-items: center;
			justify-content: space-between;
			transition: opacity 0.2s;

			@at-root #{&}_sub_group {
				display: flex;
				align-items: baseline;
				margin-right: 1rem;

				@at-root #{&}__text {
					font-variant: small-caps;
					margin: 0 0.25rem;
					margin-left: 0;
					font-size: 0.9rem;
					position: relative;
					bottom: 0.1rem;
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
			font-size: 0.9rem;
			font-variant: small-caps;
			position: relative;
			bottom: 0.1rem;

			transition: all 0.2s;

			&:hover {
				color: $color__darkgray--darkest;
			}
		}
		@at-root #{&}__actions {
			opacity: 0;

			@at-root #{&}--show {
				opacity: 1;
				transition: opacity 0.2s;
			}
		}
	}

	@media (max-width: 420px) {
		.post {
			@at-root #{&}__actions {
				opacity: 1;
			}

			@at-root #{&}__content {
				padding: 0 0.5rem;
			}

			@at-root #{&}__date {
				display: none;

				@at-root #{&}--mobile {
					display: block;
					padding-left: 4rem;
					font-size: 0.9rem;
				}
			}
		}
	}
</style>