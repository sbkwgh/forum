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
	nextURL: ''
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
	loadNewPostsAsync ({ state, commit, rootState }, vue) {
		commit('setLoadingPostsState', true)

		let nextURL = state.nextURL

		if(nextURL === null) {
			commit('setLoadingPostsState', false)
		} else {
			vue.axios
				.get(nextURL)
				.then(res => {
					let currentPostsIds = state.posts.map(p => p.id)
					let filteredPosts =
						res.data.Posts.filter(p => !currentPostsIds.includes(p.id))

					commit('addPost', filteredPosts)
					commit('setNextURL', res.data.meta.nextURL)
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
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}