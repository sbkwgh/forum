const state = {
	showAddNewBanModal: false,
	username: '',
	message: '',
	options: [
		{ name: "Select a ban type", disabled: true },
		{ name: "Block user's known ip addresses", value: "ip" },
		{ name: "Ban from creating new threads", value: "thread"},
		{ name: "Ban from replying to threads", value: "post"},
		{ name: "Ban from creating threads and posting", value: "both"}
	],
	selectedOption: 0
}

const getters = {
}

const actions = {
	'moderation/clearModal': ({ commit }) => {
		commit('moderation/setUsername', '')
		commit('moderation/setMessage', '')
		commit('moderation/setSelectedOption', 0)
	}
}

const mutations = {
	'moderation/setUsername': (state, val) => {
		state.username = val
	},
	'moderation/setMessage': (state, val) => {
		state.message = val
	},
	'moderation/setModal': (state, val) => {
		state.showAddNewBanModal = val
	},
	'moderation/setSelectedOption': (state, val) => {
		state.selectedOption = val
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}