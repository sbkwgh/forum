process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('Like', () => {
	let admin = chai.request.agent(server)
	let user = chai.request.agent(server)

	//Wait for app to start before commencing
	before((done) => {
		function serverStarted () {
			admin
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount',
					password: 'password',
					admin: true
				})
				.then(() => {
					return user
						.post('/api/v1/user')
						.set('content-type', 'application/json')
						.send({
							username: 'useraccount',
							password: 'password',
						})
				})
				.then(() => {
					return admin
						.post('/api/v1/category')
						.set('content-type', 'application/json')
						.send({ name: 'category' })
				})
				.then(() => {
					return admin
						.post('/api/v1/thread')
						.set('content-type', 'application/json')
						.send({ category: 'CATEGORY', name: 'thread' })
				})
				.then(() => {
					return admin
						.post('/api/v1/post')
						.set('content-type', 'application/json')
						.send({ threadId: 1, content: 'POST 1' })
				})
				.then(() => {
					return admin
						.post('/api/v1/post')
						.set('content-type', 'application/json')
						.send({ threadId: 1, content: 'POST 2' })
				})
				.then(() => {
					return user
						.post('/api/v1/post')
						.set('content-type', 'application/json')
						.send({ threadId: 1, content: 'POST 3' })
				})
				.then(done)
				.catch(done)
		}

		if(server.locals.appStarted) serverStarted()
			
		server.on('appStarted', () => {
			serverStarted()
		})
	})

	after(() => sequelize.sync({ force: true }))
})