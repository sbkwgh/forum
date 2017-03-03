import AjaxErrorHandler from '../../assets/js/errorHandler'

const state = {
	thread: '',
	posts: [],
	reply: {
		username: '',
		id: null
	},
	editor: {
		show: false,
		value: ''
	}
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
	}
}

const mutations = {
	setReply (state, payload) {
		state.reply.username = payload.username;
		state.reply.id = payload.id;
	},
	addPost (state, post) {
		state.posts.push(post);
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
	setPosts (state, value) {
		state.posts = value
	},
	setThreadName (state, value) {
		state.thread = value
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}