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
		{ path: '/', redirect: '/all' },
		{ path: '/:category', component: Index },
		{ path: '/start', component: Start },
		//{ path: '/category/:category', component: Category },
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

	let sinceNow = new Date(new Date() - value)

	//Add leading zero if under 10
	function lz(num) {
		if(num < 10) {
			return '0' + num;
		} else {
			return '' + num;
		}
	}

	function p(word, num) {
		if(num === 1) {
			return word
		} else {
			return word + 's'
		}
	}

	//2 minutes
	if(sinceNow <= 1000*60*2) {
		return 'Just now'
	} else if(sinceNow <= 1000*60*60) {
		return sinceNow.getMinutes()  + ' minutes ago'
	} else if(sinceNow <= 1000*60*60*24) {
		let hours = sinceNow.getHours()
		return hours + ' ' + p('hour', hours) + ' ago'
	} else if(sinceNow <= 1000*60*60*24*2) {
		let days = Math.floor(sinceNow / 1000*60*60*24)
		return days + ' ' + p('day', days) + ' ago'
	} else {
		return (
			lz(value.getDate()) + '/' +
			lz(value.getMonth() + 1) + '/' +
			value.getUTCFullYear()
		); 
	}
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