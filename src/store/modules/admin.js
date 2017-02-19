const state = {
	menuItems: [
		{ name: 'Dashboard', route: 'dashboard' }, 
		{ name: 'Settings', route: 'settings' },
		{ name: 'Users', route: 'users' }
	],
	selected: 0
}

const getters = {}

const actions = {}

const mutations = {
	setMenuItem (state, route) {
		state.menuItems.forEach((item, index) => {
			if(item.route === route) {
				state.selected = index
			}
		})
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}