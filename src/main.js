import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './App'
import Index from './components/routes/Index'

Vue.use(VueRouter)

const router = new VueRouter({
	routes: [
		{ path: '/', component: Index }
	],
	mode: 'history'
})

new Vue({
	el: '#app',
	template: '<App/>',
	components: { App },
	router
})