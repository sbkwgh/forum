import Vue from 'vue'
import Vuex from 'vuex'

import index from './modules/index'
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
		tabs: {
			account: 0,
			thread: 0
		},
		selectOptions: {
			filterOptions: 'NEW'
		},
		modals: {
			account: false,
			'thread_editor--picture': false,
			'thread_editor--link': false
		},
		editors: {
			thread: ''
		}
	},
	mutations: {
		setTab (state, payload) {
			state.tabs[payload.tab] = payload.index;
		},
		setEditor (state, payload) {
			state.editors[payload.name] = payload.value;
		},
		setSelectOptions (state, payload) {
			state.selectOptions[payload.name] = payload.value;
		},
		showModal (state, modal) {
			state.modals[modal] = true;
		},
		hideModal (state, modal) {
			state.modals[modal] = false;
		}
	},
	modules: {
		index,
		thread
	}
})