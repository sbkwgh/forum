import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

import App from './App'
import store from './store/index'
import Index from './components/routes/Index'

Vue.use(VueRouter)
Vue.use(Vuex)

const router = new VueRouter({
	routes: [
		{ path: '/', component: Index }
	],
	mode: 'history'
})

new Vue({
	el: '#app',
	template: '<App/>',
	store,
	components: { App },
	router
})