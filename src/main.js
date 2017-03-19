import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import axios from 'axios'
import VueAxios from 'vue-axios'

import App from './App'
import store from './store/index'

import Index from './components/routes/Index'
import Start from './components/routes/Start'
import Category from './components/routes/Category'
import Thread from './components/routes/Thread'
import ThreadNew from './components/routes/ThreadNew'

import User from './components/routes/User'
import UserPosts from './components/routes/UserPosts'
import UserThreads from './components/routes/UserThreads'

import Admin from './components/routes/Admin'
import AdminDashboard from './components/routes/AdminDashboard'
import AdminUsers from './components/routes/AdminUsers'
import AdminSettings from './components/routes/AdminSettings'

let { onResize } = require('./assets/js/flexBoxGridCorrect.js')

onResize('.index_categories', 'index_category');

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(VueAxios, axios)

const router = new VueRouter({
	routes: [
		{ path: '/', component: Index },
		{ path: '/start', component: Start },
		{ path: '/category/:category', component: Category },
		{ path: '/thread/:slug/:id', component: Thread },
		{ path: '/thread/:slug/:id/:post_id', component: Thread },
		{ path: '/thread/new', component: ThreadNew },
		{ path: '/user/:username', redirect: '/user/:username/posts', component: User, children: [
			{ path: 'posts', component: UserPosts },
			{ path: 'threads', component: UserThreads }
		] },
		{ path: '/admin', redirect: '/admin/dashboard', component: Admin, children: [
			{ path: 'dashboard', component: AdminDashboard },
			{ path: 'settings', component: AdminSettings },
			{ path: 'users', component: AdminUsers }
		] }
	],
	mode: 'history'
})

Vue.filter('formatDate', function (value, format = '', join = ' ') {
	if(typeof value !== 'object') {
		value = new Date(value)
	}

	//Add leading zero if under 10
	function lz(num) {
		if(num < 10) {
			return '0' + num;
		} else {
			return '' + num;
		}
	}

	function formatSegment(segment) {
		if(segment === 'time') {
			return value.toTimeString().slice(0, 5);
		}
		if(segment === 'date') {
			return (
				lz(value.getDate()) + '/' +
				lz(value.getMonth() + 1) + '/' +
				value.getUTCFullYear()
			);
		}
	}

	return format.split('|').map(formatSegment).join(join);
});

Vue.filter('stripTags', function (value) {
	let div = document.createElement('div')
	div.innerHTML = value

	return div.textContent
});

Vue.filter('truncate', function (value, length) {
	if(value.length <= length) {
		return value
	} else {
		return value.slice(0, length) + '...'
	}
});

new Vue({
	el: '#app',
	template: '<App/>',
	store,
	components: { App },
	router
})