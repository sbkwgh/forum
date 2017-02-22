import Vue from 'vue'
import Vuex from 'vuex'

import thread from './modules/thread'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		meta: {
			name: '',
			categories: []
		},
		accountTabs: 0,
		accountModal: false,
		username: ''
	},
	getters: {
		categoriesWithoutAll (state) {
			var categories = JSON.parse(JSON.stringify(state.meta.categories));
			categories.shift();
			categories.unshift({
				name: 'Select a category',
				disabled: true
			});

			return categories;
		}
	},
	mutations: {
		setAccountTabs (state, index) {
			state.accountTabs = index;
		},
		setSelectOptions (state, payload) {
			state.selectOptions[payload.name] = payload.value;
		},
		setAccountModalState (state, value) {
			state.accountModal = value;
		}
	},
	modules: { thread }
})