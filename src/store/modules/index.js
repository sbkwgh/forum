const state = {
	selectedCategory: 'ALL',
	threads: [
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'PROGRAMMING', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'PROGRAMMING', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'PROGRAMMING', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'PROGRAMMING', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 30}
	]
}

const getters = {
	filteredThreads (state, getters, rootState) {
		var categories = {};
		rootState.meta.categories.forEach(category => {
			categories[category.value] = category.name;
		})

		return state.threads.filter(thread => {
			return (thread.category === state.selectedCategory) || (state.selectedCategory === 'ALL');
		}).map(thread => {
			var _thread = Object.assign({}, thread);
			_thread.category = categories[thread.category];

			return _thread;
		});
	}
}

const actions = {}

const mutations = {
	selectCategory (state, category) {
		state.selectedCategory = category;
	}
}

export default {
	state,
	getters,
	actions,
	mutations
}