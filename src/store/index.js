import Vue from 'vue'
import Vuex from 'vuex'

import thread from './modules/thread'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		meta: {
			name: 'Forum',
			categories: [
				{name: 'All categories', value: 'ALL'},
				{name: 'Technology', value: 'TECHNOLOGY'},
				{name: 'Food', value: 'FOOD'},
				{name: 'Programming', value: 'PROGRAMMING'},
				{name: 'Books', value: 'BOOKS'}
			]
		},
		accountTabs: 0,
		accountModal: false,
		username: 'John Doe'
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