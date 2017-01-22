<template>
	<div class='route_container'>
		<header class='thread_header'>
			<div
				class='thread_header__thread_title thread_header__thread_title--app_header'
				:class='{
					"thread_header__thread_title--app_header-show": headerTitle
				}'
			>
				{{thread}}
			</div>
			<div class='thread_header__thread_title' ref='title'>
				{{thread}}
			</div>
			<button class='button thread_header__reply_button' @click='showEditor(true)'>Reply to thread</button>
		</header>
		<input-editor name='thread' float='true' :replying='replyingUsername' v-on:submit='addPost'></input-editor>
		<div class='posts'>
			<div class='post' v-for='post in posts'>
				<div class='post__meta_data'>
					<div class='post__avatar'>{{post.username[0]}}</div>
					<div class='post__user'>{{post.username}}</div>
					<span class='fa fa-long-arrow-right fa-fw' v-if='post.replyingUsername'></span>
					<div class='post__reply' v-if='post.replyingUsername'>{{post.replyingUsername}}</div>
					<div class='post__date'>{{post.date | formatDate('time|date', ', ')}}</div>
				</div>
				<div class='post__content' v-html='post.content'></div>
				<div class='post__actions'>
					<div class='post__action post__share'>Share</div>
					<div class='post__action post__reply' @click='reply("id", post.username)'>Reply</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import InputEditor from '../InputEditor'
	import throttle from 'lodash.throttle'

	export default {
		name: 'Thread',
		components: {
			InputEditor
		},
		data () {
			return { headerTitle: false }
		},
		computed: {
			thread () {
				return this.$store.state.thread.thread;
			},
			posts () {
				return this.$store.state.thread.posts;
			},
			replyingUsername () {
				return this.$store.state.thread.replying.username
			}
		},
		methods: {
			showEditor (clearReply) {
				this.$store.commit({
					type: 'showEditor',
					name: 'thread',
					value: true
				});
				if(clearReply) {
					this.$store.commit({
						type: 'setReply',
						username: '',
						id: ''
					});
				}
			},
			reply (id, username) {
				this.$store.commit({
					type: 'setReply',
					username,
					id
				});
				this.showEditor();
			},
			addPost () {
				this.$store.dispatch('addPostAsync');
			}
		},
		mounted () {
			var self = this;
			var setHeader = function() {
				if(!self.$refs.title) return;

				if(self.$refs.title.getBoundingClientRect().top <= 32) {
					self.headerTitle = true;
				} else {
					self.headerTitle = false;
				}
			};

			setHeader();
			document.addEventListener('scroll', throttle(setHeader, 200));
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.thread_header {
		display: flex;
		justify-content: space-between;

		@at-root #{&}__thread_title {
			@include text($font--role-default, 3rem, 400);
			margin-bottom: 1rem;

			@at-root #{&}--app_header {
				position: fixed;
				width: 80%;
				z-index: 2;
				text-align: center;
				left: 0;
				font-size: 2rem;
				top: 1rem;
				opacity: 0;
				pointer-events: none;
				transition: opacity 0.2s;

				@at-root #{&}-show {
					opacity: 1;
					transition: opacity 0.2s;
				}
			}
		}
		@at-root #{&}__reply_button {
			height: 3rem;
			position: fixed;
			right: 10%;
			margin-top: 0.75rem;
		}
	}

	.posts {
		width: 80%;

		&:last-child {
			border-bottom: thin solid $color__gray--primary;
		}
	}

	.post {
		border-top: thin solid $color__gray--primary;
		margin: 0.5rem 0;

		@at-root #{&}__meta_data {
			display: flex;
			padding-top: 0.75rem;
			position: relative;
			margin-left: 4rem;
		}
		@at-root #{&}__avatar {
			position: absolute;
			height: 3rem;
			width: 3rem;
			line-height: 3rem;
			@include text($font--role-emphasis, 2rem)
			text-align: center;
			border-radius: 100%;
			background-color: $color__gray--darkest;
			color: #fff;
			left: -4rem;
		}
		@at-root #{&}__user {
			@include text($font--role-default, 1rem, 600);
			margin-right: 0.5rem;
		}
		@at-root #{&}__reply {
			margin: 0 0.5rem;
		}
		@at-root #{&}__date {
			color: $color__gray--darkest;
			margin-right: 0.5rem;
		}
		@at-root #{&}__content {
			padding: 0.5rem 0 0.5rem 4rem;
		}
		@at-root #{&}__actions {
			padding: 0.5rem 0 0.75rem 4rem;
			display: flex;
			justify-content: flex-end;
		}
		@at-root #{&}__action {
			color: $color__gray--darkest;
			cursor: pointer;
			margin-right: 0.75rem;

			transition: all 0.2s;

			&:hover {
				color: $color__darkgray--primary;
			}
			&:active {
				color: $color__darkgray--darkest;
			}
		}
	}
</style>