<template>
	<div class='route_container' :style='posts.length ? "padding-bottom: 8.5rem;" : null'>
		<confirm-modal v-model='showConfirmModal' @confirm='deleteThread' text='Delete' color='red'>
			Are you sure you want to delete this thread?
			<br>This <b>cannot</b> be undone
		</confirm-modal>

		<thread-post-notification
			v-if='$store.state.thread.postNotification'
			:post='$store.state.thread.postNotification'
			@close='$store.commit("thread/setPostNotification", null)'
			@goToPost='goToPostNotification'
		></thread-post-notification>

		<header class='thread_header'>
			<div class='thread_header__thread_title' ref='title'>
				{{thread}}
			</div>
		</header>

		<div class='thread_side_bar'>
			<loading-button
				class='button--thin_text'
				:class='{ "button--disabled" : !$store.state.thread.selectedPosts.length }'
				:loading='false || $store.state.thread.removePostsButtonLoading'
				:dark='true'
				@click='removePosts'
				v-if='$store.state.thread.showRemovePostsButton'
			>
				Remove posts ({{$store.state.thread.selectedPosts.length}})
			</loading-button>
			<menu-button
				v-if='$store.state.admin'
				:options='[
					{ event: "lock_thread", value: $store.state.thread.locked ? "Unlock thread" : "Lock thread" },
					{ event: "delete_thread", value: "Delete thread" },
					{ event: "remove_posts", value: "Remove posts" }
				]'
				@lock_thread='setThreadLockedState'
				@remove_posts='setThreadSelectState'
				@delete_thread='showConfirmModal = true'
			>
				<button class='button button--thin_text'>
					<font-awesome-icon :icon='["fa", "cog"]' style='margin-right: 0.25rem;' />
					Manage thread
				</button>
			</menu-button>
			<button
				class='button button--thin_text'
				@click='replyThread'
				v-if='!$store.state.thread.locked'
			>
				{{replyThreadButton}}
			</button>
			<post-scrubber
				:posts='$store.state.thread.totalPostsCount'
				:value='$route.params.post_number || 0'
				@input='goToPost'
			></post-scrubber>
		</div>

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

		<div class='locked_thread' v-if='$store.state.thread.locked'>
			<h2>Thread locked</h2>
			You can't post in this thread because it has been locked by an administrator
		</div>

		<thread-poll
			v-if='$store.state.thread.PollQuestionId'
			:id='$store.state.thread.PollQuestionId'
		></thread-poll>

		<div class='posts'>
			<scroll-load
				@loadNext='loadNextPosts'
				@loadPrevious='loadPreviousPosts'
			>
				<template v-if='!posts.length'>
					<thread-post-placeholder
						v-for='n in 3'
						:key='"thread-post-placeholder-loading-" + n'
						:class='{"post--last": n === 2}'
					></thread-post-placeholder>
				</template>

				<template v-if='$store.state.thread.loadingPosts === "previous"'>
					<thread-post-placeholder
						v-for='n in $store.state.thread.previousPostsCount'
						:key='"thread-post-placeholder-upper-" + n'
					>
					</thread-post-placeholder>
				</template>
				<thread-post
					v-for='(post, index) in posts'
					:key='"thread-post-" + post.id'

					@reply='replyUser'
					@goToPost='goToPost'
					@selected='setSelectedPosts'

					:post='post'
					:show-reply='!$store.state.thread.locked'
					:showSelect='$store.state.thread.showRemovePostsButton'
					:highlight='highlightedPostIndex === index'
					:allowQuote='true'

					:class='{"post--last": index === posts.length-1}'
					ref='posts'
				></thread-post>
				<template v-if='$store.state.thread.loadingPosts === "next"'>
					<thread-post-placeholder
						v-for='n in $store.state.thread.nextPostsCount'
						:key='"thread-post-placeholder-lower-" + n'
					>
					</thread-post-placeholder>
				</template>
			</scroll-load>
		</div>

		<more-threads
			:category='$store.state.thread.category'
			:threadId='$store.state.thread.threadId'
			v-if='$store.state.thread.category'
		></more-threads>
	</div>
</template>

<script>
	import InputEditor from '../InputEditor'
	import ScrollLoad from '../ScrollLoad'
	import ThreadPost from '../ThreadPost'
	import ThreadPostNotification from '../ThreadPostNotification'
	import ThreadPostPlaceholder from '../ThreadPostPlaceholder'
	import PostScrubber from '../PostScrubber'
	import MenuButton from '../MenuButton'
	import LoadingButton from '../LoadingButton'
	import ThreadPoll from '../ThreadPoll'
	import ConfirmModal from '../ConfirmModal'
	import MoreThreads from '../MoreThreads'

	import logger from '../../assets/js/logger'

	import throttle from 'lodash.throttle'

	export default {
		name: 'Thread',
		components: {
			InputEditor,
			ScrollLoad,
			ThreadPost,
			ThreadPostNotification,
			ThreadPostPlaceholder,
			PostScrubber,
			MenuButton,
			LoadingButton,
			ThreadPoll,
			ConfirmModal,
			MoreThreads
		},
		data () {
			return {
				highlightedPostIndex: null,
				postNotification: null,
				showConfirmModal: false
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
			replyThreadButton () {
				if(this.$store.state.username) {
					return 'Reply to thread';
				} else {
					return 'Login to reply'
				}
			}
		},
		methods: {
			deleteThread () {
				this.$store.dispatch("deleteThread", this)
			},
			removePosts () {
				this.$store.dispatch("removePostsAsync", this)
			},
			setThreadLockedState () {
				this.$store.dispatch('setThreadLockedState', this)
			},
			setThreadSelectState () {
				this.$store.commit('setShowRemovePostsButton', !this.$store.state.thread.showRemovePostsButton)
			},
			setSelectedPosts (postId) {
				this.$store.commit('setSelectedPosts', postId)
			},
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
				if(this.$store.state.username) {
					this.clearReply();
					this.showEditor();
				} else {
					this.$store.commit('setAccountTabs', 1);
					this.$store.commit('setAccountModalState', true);
				}
			},
			replyUser (id, username, quote) {
				this.$store.commit({
					type: 'setReply',
					username,
					id,
					quote
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
						this.$router.replace({ name: 'thread-post', params: { post_number: postNumber } })
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
				this.$nextTick(() => {
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
								this.$nextTick(() => scroll(i))
							}

							break;
						}
					}
				})
			},
			highlightPost (postNumber) {
				this.scrollTo(postNumber, (i) => {
					this.highlightedPostIndex = i
					this.$router.replace({ name: 'thread-post', params: { post_number: postNumber } })
					
					if(this.highlightedPostIndex === i) {
						setTimeout(() => this.highlightedPostIndex = null, 3000)
					}
				})
			},
			showPostNotification (post) {
				if(post.username === this.$store.state.username) return;

				this.$store.commit('thread/setPostNotification', null)
				this.$store.commit('thread/setPostNotification', post)

				setTimeout(() => {
					this.$store.commit('thread/setPostNotification', null)
				}, 5000)
			},
			goToPostNotification () {
				let post = this.$store.state.thread.postNotification

				this.goToPost(post.postNumber)
				this.$store.commit('thread/setPostNotification', null)
			}
		},
		watch: {
			'$route.params.id': 'loadInitialPosts'
		},
		mounted () {
			let self = this;

			let postInView = function() {
				if(!self.$refs.posts) return;
				let posts = self.$refs.posts.sort((a, b) => {
					return a.post.postNumber - b.post.postNumber;
				});

				let topPostInView = posts.find(post => {
					let rect = post.$el.getBoundingClientRect()

					return (rect.top >= 74) && (rect.bottom <= window.innerHeight)
				})

				let postIndex = posts.indexOf(topPostInView)

				if(postIndex > -1) {
					let postNumber = self.posts[postIndex].postNumber
					self.$router.replace({ name: 'thread-post', params: { post_number: postNumber } })
				}
			};
			document.addEventListener('scroll', throttle(postInView, 20));

			this.loadInitialPosts()
			
			this.$socket.emit('join', 'thread/' + this.$route.params.id)
			this.$socket.on('new post', post => {
				this.showPostNotification(post)
				this.$store.dispatch('loadNewPostsSinceLoad', post)
			})

			logger('thread', this.$route.params.id)
		},
		destroyed () {
			this.$socket.emit('leave', 'thread/' + this.$route.params.id)
			this.$socket.off('new post')
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.thread_side_bar {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
		min-width: 10rem;
		position: fixed;
		right: 10%;

		.button {
			margin-bottom: 0.75rem;
			height: 3rem;
		}
	}

	.thread_header {
		display: flex;
		justify-content: space-between;

		@at-root #{&}__thread_title {
			@include text($font--role-default, 2rem, 400);
			width: 80%;
			margin-bottom: 1rem;
			word-break: break-all;
		}
	}

	.locked_thread {
		h2 {
			margin-top: 0;
			margin-bottom: 0.5rem;
		}

		background-color: #fff;
		padding: 1.5rem;
		margin-bottom: 1rem;
		width: 80%;
		border-radius: 0.25rem;
		border: thin solid $color__gray--darker;
	}

	.posts {
		width: 80%;
		background-color: #fff;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		border: thin solid $color__gray--darker;
	}


	@media (min-width: 1500px) {
		.thread_side_bar {
			right: calc((100% - 1200px) / 2);
		}
	}


	@media (max-width: $breakpoint--phone-thread) {
		.route_container {
			width: 100%;
			margin: 0;
		}

		.thread_side_bar {
			margin-left: 1rem;
		}

		.posts {
			padding: 0.25rem 0.5rem;
			border-radius: 0;
			border-left: 0;
			border-right: 0;
		}

		div.thread_header__thread_title {
			padding-left: 1rem;
		}

	}

	@media (max-width: $breakpoint--large_screen-thread) {
		.posts {
			width: calc(80% - 5rem);
		}
	}
	@media (min-width: $breakpoint--phone-thread) and (max-width: $breakpoint--tablet-thread) {
		div.posts {
			margin-left: 2rem;
			margin-right: 2rem;
			width: calc(100% - 4rem);
		}

		div.thread_header__thread_title {
			font-size: 2rem;
			padding-left: 2.25rem;
			width: 100%;
		}
		div.thread_side_bar {
			padding-left: 2rem;

			&> :first-child {
				margin-left: 0;
			}
		}
	}

	@media (max-width: $breakpoint--tablet-thread) {
		.route_container {
			padding-bottom: 2rem !important; 
		}

		.thread_side_bar {
			display: flex;
			position: initial;
			flex-direction: row;
			align-items: flex-end;

			margin-left: 1rem;

			& > :first-child {
				margin-left: 0;
			}
			> * {
				margin: 0 0.5rem;
			}

			.post_scrubber {
				display: none;
			}
		}

		.posts {
			width: 100%;
			overflow: hidden;
		}
		.locked_thread {
			width: 100%;
		}

		.thread_header__thread_title {
			font-size: 2rem;
			padding-left: 0.25rem;
			width: 100%;
		}
	}
</style>