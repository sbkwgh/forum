const state = {
	thread: '',
	posts: [],
	reply: {
		username: '',
		id: ''
	},
	editor: {
		show: false,
		value: ''
	}
}

const getters = {}

const actions = {
	addPostAsync ({ state, commit, rootState }) {
		var post = {
			content: state.editor.value,
			username: rootState.username,
			date: new Date()
		};

		if(state.reply.id.length) {
			post.replyUsername = state.reply.username;
			post.replyId = state.reply.id;
		}

		//Post to server
		setTimeout(function() {
			commit('addPost', post);
			commit('setThreadEditorValue', '');
			commit('setThreadEditorState', false);
			commit({
				type: 'setReply',
				username: '',
				id: ''
			});
		}, 1);
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
	setThreadEditorValue (state, value) {
		state.editor.value = value
	},
	setThreadEditorState (state, value) {
		state.editor.show = value
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}