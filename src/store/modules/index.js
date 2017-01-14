const state = {
	selectedCategory: 'ALL',
	threads: [
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 10},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 5},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 23},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'PROGRAMMING', replies: 40},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 0},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 10},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 10},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 5},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 23},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'PROGRAMMING', replies: 40},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 0},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 10},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 10},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 5},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 23},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'PROGRAMMING', replies: 40},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 0},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 10},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 10},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 5},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 23},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'PROGRAMMING', replies: 40},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 0},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 10},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'TECHNOLOGY', replies: 10},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 5},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 23},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'PROGRAMMING', replies: 40},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'BOOKS', replies: 0},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'FOOD', replies: 10}
	]
}

const getters = {
	filteredThreads (state, getters, rootState) {
		var categories = {};
		var filter = rootState.selectOptions.filterOptions;

		rootState.meta.categories.forEach(category => {
			categories[category.value] = category.name;
		});

		return state.threads.filter(thread => {
			return (thread.category === state.selectedCategory) || (state.selectedCategory === 'ALL');
		}).map(thread => {
			var _thread = Object.assign({}, thread);
			_thread.category = categories[thread.category];

			return _thread;
		}).sort((a, b) => {
			if(filter === 'NEW') {
				return a.latestPostDate - b.latestPostDate;
			} else if(filter === 'MOST_ACTIVE') {
				return b.replies - a.replies;
			}
		}).filter(thread => {
			if(filter === 'NO_REPLIES') {
				return !thread.replies;
			} else {
				return true;
			}
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