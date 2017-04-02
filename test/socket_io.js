process.env.NODE_ENV = 'test'

let chai = require('chai')
let should = chai.should()

chai.use(require('chai-http'))
chai.use(require('chai-things'))

let server = require('../server')
let io = require('socket.io-client');

let { sequelize } = require('../models')

const Errors = require('../lib/errors.js')

describe('Socket-io', () => {
	//Wait for app to start before commencing
	before((done) => {
		if(server.locals.appStarted) done()
		server.on('appStarted', () => { done() })
	})

	//Delete all rows in table after
	//tests completed
	after(() => {
		sequelize.sync({ force: true })
	})

	describe('new thread notifications', async () => {
		let agent = chai.request.agent(server)

		//Create mock threads and posts
		before(async () => {
			await agent
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount',
					password: 'password',
					admin: true
				})

			await agent
				.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: 'category_name' })

			for(var i = 0; i < 3; i++) {
				let thread = await agent
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({ name: `THREAD ${i}` , category: 'category_name' })

				await agent
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({ threadId: thread.body.id , content: `POST ${i}` })
			}
		})

		it('should emit a notification when a thread is created	', (done) => {
			let client = io.connect('http://localhost:3000')
			client.on('new thread', data => {
				data.should.have.property('category', 'category_name')

				done()
			})

			//Post new thread
			agent
				.post('/api/v1/thread')
				.set('content-type', 'application/json')
				.send({ name: `THREAD 3` , category: 'category_name' })
				.then(res => {
					return agent
						.post('/api/v1/post')
						.set('content-type', 'application/json')
						.send({ threadId: res.body.id , content: `POST 3` })
				})
				.catch(done)

			
		})
	})
})