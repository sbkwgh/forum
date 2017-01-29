import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import App from './App'
import store from './store/index'

import Index from './components/routes/Index'
import Category from './components/routes/Category'
import Thread from './components/routes/Thread'
import ThreadNew from './components/routes/ThreadNew'

import onResize from './assets/js/flexBoxGridCorrect'

onResize('.index_categories', 'index_category');

Vue.use(VueRouter)
Vue.use(Vuex)

const router = new VueRouter({
	routes: [
		{ path: '/', component: Index },
		{ path: '/category/:category', component: Category },
		{ path: '/thread/:slug/:id', component: Thread },
		{ path: '/thread/new', component: ThreadNew }
	],
	mode: 'history'
})

Vue.filter('formatDate', function (value, format = '', join = ' ') {
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

new Vue({
	el: '#app',
	template: '<App/>',
	store,
	components: { App },
	router
})