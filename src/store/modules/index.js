const state = {
	selectedCategory: 0,
	threads: [
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30},
		{title: 'example title', latestPostUser: 'user', latestPostDate: new Date(), category: 'Category', replies: 30}
	]
}

const getters = {}

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