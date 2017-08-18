import Vue from 'vue'
import Vuex from 'vuex'

import thread from './modules/thread'
import category from './modules/category'
import moderation from './modules/moderation'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		meta: {
			name: '',
			title: '',
			categories: [
				{ name: 'All', value: 'ALL', color: '#1565C0' }
			]
		},
		accountTabs: 0,
		accountModal: false,
		username: '',
		admin: false,

		ajaxErrors: [],
		ajaxErrorsModal: false
	},
	getters: {
		categoriesWithoutAll (state) {
			let categories =
				state.meta.categories
				.filter(category => ['ALL', 'OTHER'].indexOf(category.value) === -1 )

			categories.unshift({
				name: 'Select a category',
				disabled: true
			})

			return categories.filter(category => category.value !== 'ALL' )
		},
		title (state) {
			if(state.meta.title.trim().length) {
				return state.meta.name + ' | ' + state.meta.title
			} else {
				return state.meta.name
			}
		},
		alphabetizedCategories (state) {
			return state.meta.categories.sort((a, b) => {
				if(a.name === 'All') return -1
				if(a.name === 'Other' || b.name === 'Other') return -1

				if(a.name < b.name) {
					return -1
				} else if (a.name > b.name) {
					return 1
				}

				return 0
			})
		}
	},
	actions: {
		setTitle ({ state, getters }, value) {
			state.meta.title = value
			document.title = getters.title
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
		},
		setAjaxErrorsModalState (state, value) {
			state.ajaxErrorsModal = value;
		},
		setAjaxErrors (state, value) {
			state.ajaxErrors = value
		},
		setUsername (state, value) {
			state.username = value
		},
		setAdmin (state, value) {
			state.admin = value
		},
		setForumName (state, value) {
			state.meta.name = value
		},
		setForumDescription (state, value) {
			state.meta.description = value
		},
		addCategories (state, value) {
			if(Array.isArray(value)) {
				state.meta.categories.push(...value)
			} else {
				state.meta.categories.push(value)
			}
		},
		removeCategory (state, id) {
			let category = state.meta.categories.filter(c => c.id === id)
			let index = state.meta.categories.indexOf(category)

			state.meta.categories.splice(index, 1)
		},
		updateCategory (state, updated) {
			let category = state.meta.categories.filter(c => c.id === updated.id)
			let index = state.meta.categories.indexOf(category)

			state.meta.categories.splice(index, 1, updated)
		}
	},
	modules: { thread, category, moderation }
})