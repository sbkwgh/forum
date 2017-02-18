process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('Thread and post', () => {
	let userAgent

	//Wait for app to start before commencing
	before((done) => {
		if(server.locals.appStarted) createUser()

		server.on('appStarted', () => {
			createUser()
		})

		function createUser() {
			userAgent = chai.request.agent(server)

			userAgent
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'username',
					password: 'password',
				})
				.then(() => {
					done()
				})
				.catch(done)
		}

	})

	//Delete all rows in table after
	//tests completed
	after(() => {
		sequelize.sync({ force: true })
	})

	describe('POST /thread', () => {
		it('should create a thread if logged in', async () => {
			let res = await userAgent
				.post('/api/v1/thread')
				.set('content-type', 'application/json')
				.send({
					name: 'thread'
				})

			res.should.be.status(200)
			res.body.should.be.json
			res.body.should.have.property('name', 'thread')

		})
		it('should return an error if not logged in', async () => {
			try {
				let res = await chai.request(server)
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({
						name: 'thread',
						category: 'category_name'
					})

				res.should.be.json
				res.should.have.status(401)
				res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)
			} catch (res) {
				res.should.have.status(401)
				JSON.parse(res.response.text).errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)
			}
		})
		it('should return an error if missing parameters', async () => {
			try {
				let res = await agent
					.post('/api/v1/thread')

				res.should.be.json
				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.missingParameter('name'))
				res.body.errors.should.contain.something.that.deep.equals(Errors.missingParameter('category'))
			} catch (res) {
				let body = JSON.parse(res.response.text)
				res.should.have.status(400)
				body.errors.should.contain.something.that.deep.equals(Errors.missingParameter('name'))
				body.errors.should.contain.something.that.deep.equals(Errors.missingParameter('category'))
			}
		})
		it('should return an error if invalid types', async () => {
			try {
				let res = await agent
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({
						name: 123
					})

				res.should.be.json
				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('name', 'string'))
			} catch (res) {
				res.should.have.status(400)
				JSON.parse(res.response.text).errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('name', 'string'))
			}
		})
		it('should return an error if category does not exist', async () => {
			try {
				let res = await agent
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({
						name: 'thread1',
						category: 'non-existent'
					})

				res.should.be.json
				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidCategory)
			} catch (res) {
				res.should.have.status(400)
				JSON.parse(res.response.text).errors.should.contain.something.that.deep.equals(Errors.invalidCategory)
			}
		})
	})

	describe('GET /thread/:id', () => {
		it('should return the thread and corresponding posts', async () => {})
		it('should return an error if :id is invalid', async () => {})
	})

	describe('POST /post', () => {
		it('should create a post if logged in', async () => {})
		it('should return an error if not logged in', async () => {})
		it('should return an error if missing parameters', async () => {})
		it('should return an error if invalid types', async () => {})
		it('should return an error if thread id does not exist', async () => {})

		it('should be able to reply to a post', async () => {})
		it('should return an error if reply id does not exist', async () => {})
		it('should return an error if post reply not in same thread', async () => {})
	})

	describe('GET /post/:id', () => {
		it('should return the post', async () => {})
		it('should return an error if invalid post id', async () => {})
	})
})