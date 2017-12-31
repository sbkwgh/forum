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
				Remove selected posts ({{$store.state.thread.selectedPosts.length}})
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
					<span class='fa fa-cogs' style='margin-right: 0.25rem;'></span>
					Manage thread
				</button>
			</menu-button>
			<button
				class='button button--thin_text'
				@click='replyThread'
				v-if='$store.state.username && !$store.state.thread.locked'
			>
					Reply to thread
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
				<thread-post-placeholder
					v-if='!posts.length'
					v-for='n in 3'
					:key='n'
					:class='{"post--last": n === 2}'
				></thread-post-placeholder>

				<thread-post-placeholder
					v-if='$store.state.thread.loadingPosts === "previous"'
					v-for='n in $store.state.thread.previousPostsCount'
					:key='n'
				>
				</thread-post-placeholder>
				<thread-post
					v-for='(post, index) in posts'
					:key='post.index'

					@reply='replyUser'
					@goToPost='goToPost'
					@selected='setSelectedPosts'

					:post='post'
					:show-reply='!$store.state.thread.locked'
					:showSelect='$store.state.thread.showRemovePostsButton'
					:highlight='highlightedPostIndex === index'

					:class='{"post--last": index === posts.length-1}'
					ref='posts'
				></thread-post>
				<thread-post-placeholder
					v-if='$store.state.thread.loadingPosts === "next"'
					v-for='n in $store.state.thread.nextPostsCount'
					:key='n'
				>
				</thread-post-placeholder>
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

	import AjaxErrorHandler from '../../assets/js/errorHandler'
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
			editorState () { return this.$store.state.thread.editor.show }
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
								this.$nextTick(_ => scroll(i))
							}

							break;
						}
					}
				})
			},
			highlightPost (postNumber) {
				this.scrollTo(postNumber, (i) => {
					this.highlightedPostIndex = i
					this.$router.push({ name: 'thread-post', params: { post_number: postNumber } })
					
					if(this.highlightedPostIndex === i) {
						setTimeout(() => this.highlightedPostIndex = null, 3000)
					}
				})
			},
			showPostNotification (post) {
				if(post.username === this.$store.state.username) return;

				this.$store.commit('thread/setPostNotification', null)
				this.$store.commit('thread/setPostNotification', post)

				setTimeout(_ => {
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
				let posts = self.$refs.posts
				if(!posts) return;

				let topPostInView = posts.find(post => {
					let rect = post.$el.getBoundingClientRect()

					return (rect.top >= 74) && (rect.bottom <= window.innerHeight)
				})

				let postIndex = posts.indexOf(topPostInView)

				if(postIndex > -1) {
					let postNumber = self.posts[postIndex].postNumber
					self.$router.push({ name: 'thread-post', params: { post_number: postNumber } })
				}
			};
			document.addEventListener('scroll', throttle(postInView, 200));

			this.loadInitialPosts()
			
			socket.emit('join', 'thread/' + this.$route.params.id)
			socket.on('new post', post => {
				this.showPostNotification(post)
				this.$store.dispatch('loadNewPostsSinceLoad', post)
			})

			logger('thread', this.$route.params.id)
		},
		destroyed () {
			socket.emit('leave', 'thread/' + this.$route.params.id)
			socket.off('new post')
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.thread_side_bar {
		position: fixed;
		right: 10%;
		top: 7.25rem;
		min-width: 10rem;

		.button {
			margin-bottom: 0.75rem;
			height: 3rem;
		}
		& > .button, .menu_button {
			margin-left: -0.25rem;
		}
	}

	.thread_header {
		display: flex;
		justify-content: space-between;

		@at-root #{&}__thread_title {
			@include text($font--role-default, 3rem, 400);
			width: calc(100% - 8rem);
			margin-bottom: 1rem;
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
	}

	.posts {
		width: 80%;
		background-color: #fff;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		border: thin solid $color__gray--darker;
	}



	@media (max-width: 420px) {
		.route_container {
			width: 100%;
			margin: 0;
		}

		.thread_side_bar {
			display: flex;
			position: initial;
			flex-direction: row;
			align-items: flex-end;

			padding-left: 1rem;

			> * {
				margin: 0 0.5rem;
			}

			.post_scrubber {
				display: none;
			}
		}

		.posts {
			width: 100%;
			padding: 0.25rem 0.5rem;
			border-radius: 0;
			border-left: 0;
			border-right: 0;
			overflow: hidden;
		}
		.locked_thread {
			width: 100%;
		}

		.thread_header__thread_title {
			font-size: 2rem;
			padding-left: 1rem;
			width: 100%;
		}
	}
</style>