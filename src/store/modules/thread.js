import AjaxErrorHandler from '../../assets/js/errorHandler'

const state = {
	thread: '',
	threadId: undefined,
	posts: [],
	reply: {
		username: '',
		id: null
	},
	editor: {
		show: false,
		value: ''
	},
	mentions: [],
	loadingPosts: false,
	nextURL: '',
	previousURL: '',
	nextPostsCount: 10,
	previousPostsCount: 0
}

const getters = {
	sortedPosts (state) {
		return state.posts.sort((a, b) => {
			return new Date(a.createdAt) - new Date(b.createdAt)
		})
	}
}

const actions = {
	addPostAsync ({ state, commit, rootState }, vue) {
		let content = state.editor.value
		state.mentions.forEach(mention => {
			let regexp = new RegExp('(^|\\s)@' + mention + '($|\\s)')
			content = content.replace(regexp, `$1[@${mention}](/user/${mention})$2`)
		})

		var post = {
			content,
			mentions: state.mentions,
			threadId: +vue.$route.params.id
		};

		if(state.reply.id) {
			post.replyingToId = state.reply.id;
		}

		vue.axios
			.post('/api/v1/post', post)
			.then(res => {
				commit('addPost', res.data);
				commit('addReplyBubble', res.data)
				commit('setThreadEditorValue', '');
				commit('setThreadEditorState', false);
				commit({
					type: 'setReply',
					username: '',
					id: ''
				});
			})
			.catch(AjaxErrorHandler(vue.$store))
	},
	loadInitialPostsAsync ({ state, commit, rootState }, vue) {
		let postNumber = vue.$route.params.post_number
		let apiURL = '/api/v1/thread/' + vue.$route.params.id

		if(postNumber !== undefined) {
			apiURL += '?postNumber=' + postNumber
		}

		vue.axios
			.get(apiURL)
			.then(res => {
				commit('setThread', res.data)
				commit('setNextURL', res.data.meta.nextURL)
				commit('setPreviousURL', res.data.meta.previousURL)
				commit('setNextURL', res.data.meta.nextURL)
				commit('setPreviousURL', res.data.meta.previousURL)
				commit('setPostCounts', res.data.meta)
				commit('setPosts', res.data.Posts)

				if(postNumber !== undefined) {
					vue.highlightPost(+postNumber)
				}
			}).catch(AjaxErrorHandler(vue.$store))
	},
	loadPostsAsync ({ state, commit, rootState }, { vue, previous }) {
		let URL

		if(previous) {
			commit('setLoadingPostsState', 'previous')
			URL = state.previousURL
		} else {
			commit('setLoadingPostsState', 'next')
			URL = state.nextURL
		}

		if(URL === null) {
			commit('setLoadingPostsState', false)
		} else {
			vue.axios
				.get(URL)
				.then(res => {
					let currentPostsIds = state.posts.map(p => p.id)
					let filteredPosts =
						res.data.Posts.filter(p => !currentPostsIds.includes(p.id))

					commit('setLoadingPostsState', false)

					if(previous) {
						let last = filteredPosts.slice(-1)[0]

						commit('prependPosts', filteredPosts)
						commit('setPreviousURL', res.data.meta.previousURL)
						
						if(last) {
							vue.scrollTo(last.postNumber)
						}
					} else {
						commit('addPost', filteredPosts)
						commit('setNextURL', res.data.meta.nextURL)
					}

					commit('setPostCounts', res.data.meta)
				})
				.catch((e) => {
					console.log(e)
					AjaxErrorHandler(vue.$store)
				})
		}
	},
	loadNewPostsSinceLoad ({ state,  commit }, post) {
		if(state.nextPostsCount < 10) {
			let nextURL = state.nextURL
			let baseURL = '/api/v1/thread/' + state.threadId + '?limit=10&from='

			commit('incrementNextPostsCount')
			
			if(nextURL === null) {
				commit('setNextURL', baseURL + (post.postNumber-1))
			}
		}
	}
}

const mutations = {
	setReply (state, payload) {
		state.reply.username = payload.username;
		state.reply.id = payload.id;
	},
	addPost (state, post) {
		if(Array.isArray(post)) {
			state.posts.push(...post)
		} else {
			state.posts.push(post)
		}
	},
	prependPosts (state, posts) {
		state.posts.unshift(...posts)
	},
	addReplyBubble (state, post) {
		let repliedToPost = {}, index

		if(post.replyId) {
			state.posts.forEach((p, i) => {
				if(p.id === post.replyId) {
					index = i
					repliedToPost = p
				}
			})

			repliedToPost.Replies.push(post)

			state.posts.splice(index, 1, repliedToPost)
		}
	},
	setThreadEditorValue (state, value) {
		state.editor.value = value
	},
	setThreadEditorState (state, value) {
		state.editor.show = value
	},
	setLoadingPostsState (state, value) {
		state.loadingPosts = value
	},
	setPosts (state, value) {
		state.posts = value
	},
	setThread (state, obj) {
		state.thread = obj.name
		state.threadId = obj.id
	},
	setNextURL (state, URL) {
		state.nextURL = URL
	},
	setPreviousURL (state, URL) {
		state.previousURL = URL
	},
	setPostCounts (state, meta) {
		state.previousPostsCount = meta.previousPostsCount
		state.nextPostsCount = meta.nextPostsCount
	},
	incrementNextPostsCount (state) {
		state.nextPostsCount++
	},
	setMentions (state, mentions) {
		state.mentions = mentions
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}