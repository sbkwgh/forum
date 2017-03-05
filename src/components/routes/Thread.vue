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
			<button class='button thread_header__reply_button' @click='replyThread' v-if='$store.state.username'>Reply to thread</button>
		</header>
		<input-editor
			v-model='editor'
			:float='true'
			:show='editorState'
			:replyUsername='replyUsername'
			v-on:close='hideEditor'
			v-on:submit='addPost'
		>
		</input-editor>
		<div class='posts'>
			<thread-post
				v-for='(post, index) in posts'
				@reply='replyUser'
				@goToPost='goToPost'
				:post='post'
				:show-reply='true'
				:highlight='highlightedPostIndex === index'
				ref='posts'
			></thread-post>
		</div>
	</div>
</template>

<script>
	import InputEditor from '../InputEditor'
	import ThreadPost from '../ThreadPost'

	import throttle from 'lodash.throttle'
	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'Thread',
		components: {
			InputEditor,
			ThreadPost
		},
		data () {
			return {
				headerTitle: false,
				highlightedPostIndex: null
			}
		},
		computed: {
			thread () {
				return this.$store.state.thread.thread;
			},
			posts () {
				return this.$store.getters.sortedPosts;
			},
			replyUsername () {
				return this.$store.state.thread.reply.username
			},
			editor: {
				get () { return this.$store.state.thread.editor.value },
				set (val) {
					this.$store.commit('setThreadEditorValue', val)
				}
			},
			editorState () { return this.$store.state.thread.editor.show }
		},
		methods: {
			showEditor () {
				this.$store.commit('setThreadEditorState', true);
			},
			hideEditor () {
				this.$store.commit('setThreadEditorState', false);
				this.clearReply()
			},
			clearReply () {
				this.$store.commit({
					type: 'setReply',
					username: '',
					id: ''
				});
			},
			replyThread () {
				this.clearReply();
				this.showEditor();
			},
			replyUser (id, username) {
				this.$store.commit({
					type: 'setReply',
					username,
					id
				});
				this.showEditor();
			},
			addPost () {
				this.$store.dispatch('addPostAsync', this);
			},
			goToPost (postId) {
				for(var i = 0; i < this.posts.length; i++) {
					let post = this.posts[i]

					if(post.id === postId) {
						let postTop = this.$refs.posts[i].$el.getBoundingClientRect().top
						let header = this.$refs.title.getBoundingClientRect().height
						window.scrollTo(0, postTop - header - 32)

						this.highlightedPostIndex = i
						setTimeout(() => {
							if(this.highlightedPostIndex === i) {
								this.highlightedPostIndex = null
							}
						}, 3000)

						break;
					}
				}
			}
		},
		created () {
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

			this.axios
				.get('/api/v1/thread/' + this.$route.params.id)
				.then(res => {
					this.$store.commit('setThreadName', res.data.name)
					this.$store.commit('setPosts', res.data.Posts)
				}).catch(AjaxErrorHandler(this.$store))
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
</style>