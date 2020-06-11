import NProgress from 'nprogress'
import io from 'socket.io-client'

window.onload = () => {
	let div = document.createElement('div');
	div.innerHTML = 
		`<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.10.0/styles/default.min.css">`;

    document.head.append(...div.children);
}

import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import axios from 'axios'
import VueAxios from 'vue-axios'

import linkExpander from './assets/js/linkExpander'

import App from './App'
import store from './store/index'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBell, faComment } from '@fortawesome/free-regular-svg-icons'
import {
	faBars, faPlus, faGrin, faLink, faCode,
	faTimes, faUnlockAlt, faReply, faHome, faTh,
	faExclamationCircle, faUserCircle, faThumbsUp,
	faComments, faUser, faCog, faLock, faCloudUploadAlt,
	faSearch, faChevronDown, faSortAmountUp, faSortAmountDown,
	faCheck, faQuoteRight, faMinus, faCaretUp, faCaretDown,
	faHeart
} from '@fortawesome/free-solid-svg-icons'

library.add(
	faBars, faPlus, faGrin, faLink, faCode,
	faTimes, faBell, faUnlockAlt, faReply, faHome,
	faTh, faExclamationCircle, faUserCircle, faThumbsUp,
	faComments, faUser, faCog, faLock, faCloudUploadAlt,
	faSearch, faChevronDown, faSortAmountUp, faSortAmountDown,
	faComment, faCheck, faQuoteRight, faMinus, faCaretUp, faCaretDown,
	faHeart
);
Vue.component('font-awesome-icon', FontAwesomeIcon);


const Index = () => import('./components/routes/Index')
const P = () => import('./components/routes/P')
const Start = () => import('./components/routes/Start')
const Thread = () => import('./components/routes/Thread')
const ThreadNew = () => import('./components/routes/ThreadNew')

const Search = () => import('./components/routes/Search')
const SearchUsersThreads = () => import('./components/routes/SearchUsersThreads')

const User = () => import('./components/routes/User')
const UserPosts = () => import('./components/routes/UserPosts')
const UserThreads = () => import('./components/routes/UserThreads')

const Settings = () => import('./components/routes/Settings')
const SettingsGeneral = () => import('./components/routes/SettingsGeneral')
const SettingsAccount = () => import('./components/routes/SettingsAccount')

const Admin = () => import('./components/routes/Admin')
const AdminDashboard = () => import('./components/routes/AdminDashboard')
const AdminModerationReports = () => import('./components/routes/AdminModerationReports')
const AdminModerationBannedUsers = () => import('./components/routes/AdminModerationBannedUsers')
const AdminGeneral = () => import('./components/routes/AdminGeneral')
const AdminUsers = () => import('./components/routes/AdminUsers')

import NotFound from './components/routes/NotFound'

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(VueAxios, axios)
Vue.use(linkExpander)

Vue.use({
	install (Vue) {
		Vue.prototype.$socket = io();
	}
})


const router = new VueRouter({
	routes: [
		{ path: '/', redirect: '/category/all' },
		{ path: '/category/:category', component: Index },
		{ path: '/p/:id', component: P },
		{ path: '/start', component: Start },
		{ path: '/thread/:slug/:id', component: Thread },
		{ path: '/thread/:slug/:id/:post_number', name: 'thread-post', component: Thread },
		{ path: '/thread/new', component: ThreadNew },
		{ path: '/search/:q', component: Search },
		{ path: '/search/users/:q', component: SearchUsersThreads, name: 'search/users' },
		{ path: '/search/threads/:q', component: SearchUsersThreads, name: 'search/threads' },
		{ path: '/user/:username', redirect: '/user/:username/posts', component: User, children: [
			{ path: 'posts', component: UserPosts },
			{ path: 'threads', component: UserThreads }
		] },
		{ path: '/settings', redirect: '/settings/general', component: Settings, children: [
			{ path: 'general', component: SettingsGeneral },
			{ path: 'account', component: SettingsAccount }
		] },
		{ path: '/admin', redirect: '/admin/dashboard', component: Admin, children: [
			{ path: 'dashboard', component: AdminDashboard },
			{ path: 'general', component: AdminGeneral },
			{ path: 'users', component: AdminUsers },
			{ path: 'moderation', redirect: '/admin/moderation/reports' },
			{ path: 'moderation/reports', component: AdminModerationReports },
			{ path: 'moderation/bans', component: AdminModerationBannedUsers }
		] },
		{ path: '*', component: NotFound }
	],
	mode: 'history'
})

router.beforeEach((to, from, next) => {
	router.app.$store.commit('set404Page', false)

	//Do not change progress bar when scrolling through posts on a thread
	if(
		(to.name !== 'thread-post' && from.name !== 'thread-post') &&
		(!to.params.id || to.params.id !== from.params.id)
	) {
		NProgress.start()
	}
	
	next()
})
router.afterEach(() => {
	NProgress.done()
})

Vue.filter('formatDate', function (value) {
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
		let days = Math.floor(sinceNow / (1000*60*60*24))
		return days + ' ' + p('day', days) + ' ago at ' + value.toTimeString().slice(0, 5)
	} else {
		return (
			lz(value.getDate()) + '/' +
			lz(value.getMonth() + 1) + '/' +
			value.getUTCFullYear()
		); 
	}
});

Vue.filter('stripTags', function (value) {
	let doc = new DOMParser().parseFromString(value, 'text/html')
	return doc.body.textContent || ''
});

Vue.filter('truncate', function (value, length) {
	if(value.length <= length) {
		return value
	} else {
		return value.slice(0, length) + '…'
	}
});
Vue.filter('truncateMid', function (value, length) {
	if(value.length <= length) {
		return value
	} else {
		let firstLen = Math.round(length/2);
		let secondLen = length - firstLen;

		return value.slice(0, firstLen) + '…' + value.slice(value.length-secondLen, value.length)
	}
});

Vue.filter('pluralize', function(number, value) {
	if(number === 1) {
		return value
	} else {
		return value + 's'
	}
})

let Root = new Vue({
	store,
	router,
	render: h => h(App)
}).$mount('#app');


let cookieDict = document.cookie
	.split(';')
	.map(a => a.split('=').map(a => a.trim()) )
	.map(a => {
		let k = a[0], v = a[1]
		return { [k] : v }
	})
	.reduce((combinedObj, o) => {
		let key = Object.keys(o)[0]
		combinedObj[key] = o[key]

		return combinedObj
	}, {})

if(cookieDict.username) Root.$store.commit('setUsername', cookieDict.username)
if(cookieDict.admin === 'false') {
	Root.$store.commit('setAdmin', false)
} else if(cookieDict.admin === 'true') {
	Root.$store.commit('setAdmin', true)
}