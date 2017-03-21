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
	loadingPosts: false,
	nextURL: '',
	previousURL: ''
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
		var post = {
			content: state.editor.value,
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

		if(postNumber) {
			apiURL += '?postNumber=' + postNumber
		}

		vue.axios
			.get(apiURL)
			.then(res => {
				commit('setThread', res.data)
				commit('setNextURL', res.data.meta.nextURL)
				commit('setPreviousURL', res.data.meta.previousURL)
				commit('setPosts', res.data.Posts)

				if(postNumber) {
					vue.highlightPost(+postNumber)
				}
			}).catch(AjaxErrorHandler(vue.$store))
	},
	loadPostsAsync ({ state, commit, rootState }, { vue, previous }) {
		let URL

		commit('setLoadingPostsState', true)

		if(previous) {
			URL = state.previousURL
		} else {
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

					if(previous) {
						commit('prependPosts', filteredPosts)
						commit('setPreviousURL', res.data.meta.previousURL)
					} else {
						commit('addPost', filteredPosts)
						commit('setNextURL', res.data.meta.nextURL)
					}

					commit('setLoadingPostsState', false)
				})
				.catch(AjaxErrorHandler(vue.$store))
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
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}