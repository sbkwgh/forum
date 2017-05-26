<template>
	<div class='route_container'>
		<menu-button :options='["Lock thread", "Remove posts"]' class=''>
			<button class='button'>
				<span class='fa fa-cogs' style='margin-right: 0.25rem;'></span>
				Manage thread
			</button>
		</menu-button>
		<post-scrubber
			:posts='$store.state.thread.totalPostsCount'
			:value='$route.params.post_number || 0'
			@input='goToPost'
		></post-scrubber>
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

			:show='editorState'
			:replyUsername='replyUsername'
			:loading='$store.state.thread.editor.loading'
			
			v-on:mentions='setMentions'
			v-on:close='hideEditor'
			v-on:submit='addPost'
		>
		</input-editor>
		<div class='posts'>
			<scroll-load
				@loadNext='loadNextPosts'
				@loadPrevious='loadPreviousPosts'
			>
				<thread-post-placeholder
					v-if='$store.state.thread.loadingPosts === "previous"'
					v-for='n in $store.state.thread.previousPostsCount'
				>
				</thread-post-placeholder>
				<thread-post
					v-for='(post, index) in posts'
					@reply='replyUser'
					@goToPost='goToPost'
					:post='post'
					:show-reply='true'
					:highlight='highlightedPostIndex === index'
					:class='{"post--last": index === posts.length-1}'
					ref='posts'
				></thread-post>
				<thread-post-placeholder
					v-if='$store.state.thread.loadingPosts === "next"'
					v-for='n in $store.state.thread.nextPostsCount'
				>
				</thread-post-placeholder>
			</scroll-load>
		</div>
	</div>
</template>

<script>
	import InputEditor from '../InputEditor'
	import ScrollLoad from '../ScrollLoad'
	import ThreadPost from '../ThreadPost'
	import ThreadPostPlaceholder from '../ThreadPostPlaceholder'
	import PostScrubber from '../PostScrubber'
	import MenuButton from '../MenuButton'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	import throttle from 'lodash.throttle'

	export default {
		name: 'Thread',
		components: {
			InputEditor,
			ScrollLoad,
			ThreadPost,
			ThreadPostPlaceholder,
			PostScrubber,
			MenuButton
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
			setMentions (mentions) {
				this.$store.commit('setMentions', mentions)
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
				this.$store.dispatch('loadInitialPostsAsync', this)
			},	
			goToPost (number, getPostNumber) {
				let pushRoute = postNumber => {
					//If postNumber is a post in `this.posts`
					if(this.posts.find(post => post.postNumber === postNumber)) {
						this.highlightPost(postNumber)
					} else {
						this.$router.push({ name: 'thread-post', params: { post_number: postNumber } })
						this.loadInitialPosts()
					}
				}

				//If `number` is actualy the postId
				//Get the postNumber via api request
				if(getPostNumber) {
					this.axios
						.get('/api/v1/post/' + number)
						.then( res => pushRoute(res.data.postNumber) )
				} else {
					pushRoute(number)
				}
			},
			scrollTo (postNumber, cb) {
				let getScrollTopPosition = i => {
					let postTop = this.$refs.posts[i].$el.getBoundingClientRect().top
					let header = this.$refs.title.getBoundingClientRect().height
					
					return window.pageYOffset + postTop - header - 32
				}

				let scroll = (i) => {
					let post = this.posts[i]
					window.scrollTo(0, getScrollTopPosition(i))
					if(cb) cb(i, post)
				}

				for(var i = 0; i < this.posts.length; i++) {
					if(this.posts[i].postNumber === postNumber) {
						if(this.$refs.posts) {
							scroll(i)
						} else {
							this.$nextTick(_ => scroll(i))
						}

						break;
					}
				}
			},
			highlightPost (postNumber) {
				this.scrollTo(postNumber, (i) => {
					this.highlightedPostIndex = i
					this.$router.push({ name: 'thread-post', params: { post_number: postNumber } })
					
					if(this.highlightedPostIndex === i) {
						setTimeout(() => this.highlightedPostIndex = null, 3000)
					}
				})
			}
		},
		mounted () {
			let self = this;
			let setHeader = function() {
				if(!self.$refs.title) return;

				if(self.$refs.title.getBoundingClientRect().top <= 32) {
					self.headerTitle = true;
				} else {
					self.headerTitle = false;
				}
			};

			let postInView = function() {
				let posts = self.$refs.posts
				if(!posts) return;

				let topPostInView = posts.find(post => {
					let rect = post.$el.getBoundingClientRect()

					return (rect.top >= 0) && (rect.bottom <= window.innerHeight)
				})

				let postIndex = posts.indexOf(topPostInView)

				if(postIndex > -1) {
					let postNumber = self.posts[postIndex].postNumber
					self.$router.push({ name: 'thread-post', params: { post_number: postNumber } })
				}
			};

			setHeader();
			document.addEventListener('scroll', throttle(setHeader, 200));

			document.addEventListener('scroll', throttle(postInView, 200));

			this.loadInitialPosts()
			
			socket.emit('join', 'thread/' + this.$route.params.id)
			socket.on('new post', post => {
				this.$store.dispatch('loadNewPostsSinceLoad', post)
			})
		},
		destroyed () {
			socket.emit('leave', 'thread/' + this.$route.params.id)
			socket.off('new post')
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
			width: calc(100% - 8rem);
			margin-bottom: 1rem;

			@at-root #{&}--app_header {
				position: fixed;
				width: 80%;
				z-index: 2;
				text-align: center;
				left: 0;
				font-size: 2rem;
				top: 0.5rem;
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
		background-color: #fff;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
	}
</style>