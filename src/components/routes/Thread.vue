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
			<scroll-load
				:loading='loadingPosts'
				:showNext='$store.state.thread.nextURL !== null'
				:showPrevious='$store.state.thread.previousURL !== null'
				@loadNext='loadNextPosts'
				@loadPrevious='loadPreviousPosts'
			>
				<thread-post
					v-for='(post, index) in posts'
					@reply='replyUser'
					@goToPost='$router.push({ params: { post_id: post.id } })'
					:post='post'
					:show-reply='true'
					:highlight='highlightedPostIndex === index'
					:class='{"post--last": index === posts.length-1}'
					ref='posts'
				></thread-post>
			</scroll-load>
		</div>
	</div>
</template>

<script>
	import InputEditor from '../InputEditor'
	import ScrollLoad from '../ScrollLoad'
	import ThreadPost from '../ThreadPost'

	import throttle from 'lodash.throttle'
	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'Thread',
		components: {
			InputEditor,
			ScrollLoad,
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
			editorState () { return this.$store.state.thread.editor.show },
			loadingPosts () { return this.$store.state.thread.loadingPosts },
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
			loadNextPosts () {
				let vue = this
				this.$store.dispatch('loadPostsAsync', { vue, previous: false });
			},
			loadPreviousPosts () {
				let vue = this
				this.$store.dispatch('loadPostsAsync', { vue, previous: true });
			},
			loadInitialPosts () {
				let postId = this.$route.params.post_id
				let apiURL = '/api/v1/thread/' + this.$route.params.id
				if(postId) {
					apiURL += '?postId=' + postId
				}

				console.log('here')

				this.axios
					.get(apiURL)
					.then(res => {
						this.$store.commit('setThread', res.data)
						this.$store.commit('setNextURL', res.data.meta.nextURL)
						this.$store.commit('setPreviousURL', res.data.meta.previousURL)
						this.$store.commit('setPosts', res.data.Posts)

						if(postId) {
							this.highlightPost(+postId)
						}
					}).catch(AjaxErrorHandler(this.$store))

			},	
			goToPost (id) {
				this.$router.push({ params: { post_id: id } })
				this.loadInitialPosts()
			},
			highlightPost (postId) {
				for(var i = 0; i < this.posts.length; i++) {
					let post = this.posts[i]

					if(post.id === postId) {
						this.$nextTick(() => {
							let postTop = this.$refs.posts[i].$el.getBoundingClientRect().top
							let header = this.$refs.title.getBoundingClientRect().height
							window.scrollTo(0, postTop - header - 32)

							this.highlightedPostIndex = i

							setTimeout(() => {
								if(this.highlightedPostIndex === i) {
									this.highlightedPostIndex = null
								}
							}, 3000)
						})

						break;
					}
				}
			}
		},
		watch: {
			'$route': 'loadInitialPosts'
		},
		created () {
			let self = this;
			let setHeader = function() {
				if(!self.$refs.title) return;

				if(self.$refs.title.getBoundingClientRect().top <= 32) {
					self.headerTitle = true;
				} else {
					self.headerTitle = false;
				}
			};

			setHeader();
			document.addEventListener('scroll', throttle(setHeader, 200));

			this.loadInitialPosts()
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
	}
</style>