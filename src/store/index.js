import Vue from 'vue'
import Vuex from 'vuex'

import index from './modules/index'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		meta: {
			name: 'Forum'
		},
		tabs: {
			account: 0
		},
		modals: {
			account: false
		}
	},
	mutations: {
		setTab (state, payload) {
			state.tabs[payload.tab] = payload.index;
		},
		showModal (state, modal) {
			state.modals[modal] = true;
		},
		hideModal (state, modal) {
			state.modals[modal] = false;
		}
	},
	modules: {
		index
	}
})