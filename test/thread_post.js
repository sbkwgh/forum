process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('Thread and post', () => {
	let userAgent, replyAgent

	//Wait for app to start before commencing
	before((done) => {
		if(server.locals.appStarted) mockData()

		server.on('appStarted', () => {
			mockData()
		})

		function mockData() {
			userAgent = chai.request.agent(server)
			replyAgent = chai.request.agent(server)

			userAgent
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'username',
					password: 'password',
					admin: true
				})
				.then(() => {
					userAgent
						.post('/api/v1/category')
						.set('content-type', 'application/json')
						.send({ name: 'category_name' })
						.then(() => { done() })
						.catch(done)
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
					name: 'thread',
					category: 'category_name'
				})

			res.should.have.status(200)
			res.should.be.json
			res.body.should.have.property('name', 'thread')
			res.body.should.have.deep.property('User.username', 'username')
			res.body.should.have.deep.property('Category.name', 'category_name')
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
				let res = await userAgent
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
				let res = await userAgent
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({
						name: 123,
						category: 123
					})

				res.should.be.json
				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('name', 'string'))
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('category', 'string'))
			} catch (res) {
				let body = JSON.parse(res.response.text)
				res.should.have.status(400)
				body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('name', 'string'))
				body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('category', 'string'))
			}
		})
		it('should return an error if category does not exist', async () => {
			try {
				let res = await userAgent
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

	describe('POST /post', () => {
		it('should create a post if logged in', async () => {
			let res = await userAgent
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({
					content: 'content',
					threadId: 1
				})

			res.should.be.json
			res.should.have.status(200)
			res.body.should.have.property('content', '<p>content</p>\n')
			res.body.should.have.deep.property('User.username', 'username')
			res.body.should.have.deep.property('Thread.name', 'thread')

		})
		it('should return an error if not logged in', async () => {
			try {
				let res = await chai.request(server)
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({
						content: 'content',
						threadId: 1
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
				let res = await userAgent
					.post('/api/v1/post')

				res.should.be.json
				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.missingParameter('content'))
				res.body.errors.should.contain.something.that.deep.equals(Errors.missingParameter('threadId'))
			} catch (res) {
				let body = JSON.parse(res.response.text)
				res.should.have.status(400)
				body.errors.should.contain.something.that.deep.equals(Errors.missingParameter('content'))
				body.errors.should.contain.something.that.deep.equals(Errors.missingParameter('threadId'))
			}
		})
		it('should return an error if invalid types', async () => {
			try {
				let res = await userAgent
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({
						content: 123,
						threadId: 'string',
						replyingToId: 'string'
					})

				res.should.be.json
				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('content', 'string'))
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('threadId', 'integer'))
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('replyingToId', 'integer'))
			} catch (res) {
				let body = JSON.parse(res.response.text)
				res.should.have.status(400)
				body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('content', 'string'))
				body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('threadId', 'integer'))
				body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('replyingToId', 'integer'))
			}
		})
		it('should return an error if thread id does not exist', async () => {
			try {
				let res = await userAgent
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({
						content: 'content',
						threadId: 10
					})

				res.should.be.json
				res.should.have.status(400)
				res.body.errors.should.include.something.that.deep.equals(Errors.invalidParameter('threadId', 'thread does not exist'))
			} catch (res) {
				let body = JSON.parse(res.response.text)
				res.should.have.status(400)
				body.errors.should.include.something.that.deep.equals(Errors.invalidParameter('threadId', 'thread does not exist'))
			}
		})
		it('should be able to reply to a post', async () => {
			await replyAgent
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'username1',
					password: 'password'
				})

			let res = await replyAgent
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({
					content: 'another post',
					threadId: 1,
					replyingToId: 1
				})

			res.should.be.json
			res.should.have.status(200)
			res.body.should.have.property('content', '<p>another post</p>\n')
			res.body.should.have.deep.property('User.username', 'username1')
			res.body.should.have.deep.property('Thread.name', 'thread')
			res.body.should.have.deep.property('ReplyingTo.User.username', 'username')
		})
		it('should return an error if reply id does not exist', async () => {
			try {
				let res = await replyAgent
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({
						content: 'yet another post',
						threadId: 1,
						replyingToId: 10
					})

				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('replyingToId', 'post does not exist'))
			} catch (res) {
				let body = JSON.parse(res.response.text)

				res.should.have.status(400)
				body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('replyingToId', 'post does not exist'))
			}
		})
		it('should return an error if post reply not in same thread', async () => {
			try {
				let threadId = (await replyAgent
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({
						name: 'another thread',
						category: 'category_name'
					})).body.id

				let res = await replyAgent
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({
						content: 'yet another post',
						threadId: threadId,
						replyingToId: 1
					})

				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('replyingToId', 'replies must be in same thread'))
			} catch (res) {
				let body = JSON.parse(res.response.text)

				res.should.have.status(400)
				body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('replyingToId', 'replies must be in same thread'))
			}
		})
	})

	describe('GET /thread/:id', () => {
		it('should return the thread and corresponding posts', async () => {
			let res = await chai.request(server).get('/api/v1/thread/1')

			res.should.have.status(200)
			res.should.be.json
			res.body.should.have.property('name', 'thread')
			res.body.should.have.deep.property('Category.name', 'category_name')
			res.body.should.have.deep.property('User.username', 'username')
			res.body.should.have.property('Posts')
			
			res.body.Posts.should.have.property('length', 2)

			res.body.Posts.should.contain.something.that.has.property('content', '<p>content</p>\n')
			res.body.Posts.should.contain.something.that.has.deep.property('User.username', 'username')
			
			res.body.Posts.should.contain.something.that.has.property('content', '<p>another post</p>\n')
			res.body.Posts.should.contain.something.that.has.deep.property('User.username', 'username1')
		})
		it('should return an error if :id is invalid', async () => {
			try {
				let res = await chai.request(server).get('/api/v1/thread/invalid')

				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('id', 'thread does not exist'))
			} catch (res) {
				let body = JSON.parse(res.response.text)

				res.should.have.status(400)
				body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('id', 'thread does not exist'))
			}
		})
	})

	describe('GET /post/:id', () => {
		it('should return the post', async () => {
			let res = await chai.request(server).get('/api/v1/post/1')

			res.should.have.status(200)
			res.should.be.json
			res.body.should.have.property('content', '<p>content</p>\n')
			res.body.should.have.deep.property('User.username', 'username')
			res.body.should.have.deep.property('Thread.name', 'thread')
			res.body.should.have.deep.property('Thread.Category.name', 'category_name')
			res.body.should.have.deep.property('Replies.0.User.username', 'username1')
		})
		it('should return an error if invalid post id', async () => {
			try {
				let res = await chai.request(server).get('/api/v1/post/invalid')

				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('id', 'post does not exist'))
			} catch (res) {
				let body = JSON.parse(res.response.text)

				res.should.have.status(400)
				body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('id', 'post does not exist'))
			}
		})
	})
})