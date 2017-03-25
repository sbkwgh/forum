process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('Category', () => {
	//Wait for app to start before commencing
	before((done) => {
		if(server.locals.appStarted) done()

		server.on('appStarted', () => {
			done()
		})
	})

	//Delete all rows in table after
	//tests completed
	after((done) => {
		sequelize.sync({ force: true })
			.then(() => {
				done(null);
			})
			.catch((err) => {
				done(err)
			})
	})

	describe('POST /category', () => {
		let agent = chai.request.agent(server)

		it('should add a new category if logged in', async () => {
			await agent
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount',
					password: 'password',
					admin: true
				})

			let res = await agent
				.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: 'category' })

			res.should.be.json
			res.should.have.status(200)
			res.body.should.have.property('name', 'category')
			res.body.should.have.property('color')
		})
		it('should have an "underscored" value field', async () => {
			let res = await agent
				.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: ' 	another category here 	' })

			res.should.be.json
			res.should.have.status(200)
			res.body.should.have.property('name', ' 	another category here 	')
			res.body.should.have.property('value', 'ANOTHER_CATEGORY_HERE')
		})
		it('should return an error if category already exists', async () => {
			try {
				let res = await agent
					.post('/api/v1/category')
					.set('content-type', 'application/json')
					.send({ name: 'category' })

				res.should.be.json
				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.categoryAlreadyExists)
			} catch (res) {
				res.should.have.status(400)
				JSON.parse(res.response.text).errors.should.contain.something.that.deep.equals(Errors.categoryAlreadyExists)
			}
		})
		it('should return an error if not an admin account', async () => {
			let agent = chai.request.agent(server)

			await agent
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'username',
					password: 'password',
				})

			try {
				let res = await agent
					.post('/api/v1/category')
					.set('content-type', 'application/json')
					.send({ name: 'category1' })

				res.should.be.json
				res.should.have.status(401)
				res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)
			} catch (res) {
				res.should.have.status(401)
				JSON.parse(res.response.text).errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)
			}
		})
		it('should return an error if not logged', async () => {
			try {
				await chai.request(server)
					.post('/api/v1/category')
					.set('content-type', 'application/json')
					.send({ name: 'category1' })

				res.should.be.json
				res.should.have.status(401)
				res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)
			} catch (res) {
				res.should.have.status(401)
				JSON.parse(res.response.text).errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)
			}
		})
	})

	describe('GET /category', () => {
		before(async () => {
			let agent = chai.request.agent(server)

			await agent
				.post('/api/v1/user/adminaccount/login')
				.set('content-type', 'application/json')
				.send({ password: 'password' })

			await agent
				.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: 'another_category' })
		})

		it('should return all categories', async () => {
			let res = await chai.request(server)
				.get('/api/v1/category')

			res.should.be.json
			res.should.have.status(200)
			res.body.should.contain.an.item.with.property('name', 'category')
			res.body.should.contain.an.item.with.property('name', 'another_category')
		})
	})

	describe('GET /category/:category', () => {
		before(async () => {
			let agent = chai.request.agent(server)

			await agent
				.post('/api/v1/user/adminaccount/login')
				.set('content-type', 'application/json')
				.send({ password: 'password' })

			await agent
				.post('/api/v1/thread')
				.set('content-type', 'application/json')
				.send({ name: 'thread', category: 'category' })

			await agent
				.post('/api/v1/thread')
				.set('content-type', 'application/json')
				.send({ name: 'another_thread', category: 'category' })

			await agent
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ content: 'content here', threadId: 1 })

			await agent
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ content: 'content here 2', threadId: 1 })

			await agent
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ content: 'content here 3', threadId: 1 })

			await agent
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ content: 'content here', threadId: 2 })

			await agent
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ content: 'content here 2', threadId: 2 })

			await agent
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ content: 'content here 3', threadId: 2 })
		})

		it('should return all threads in a category', async () => {
			let res = await chai.request(server)
				.get('/api/v1/category/category')

			res.should.be.json
			res.should.have.status(200)
			res.body.should.have.property('name', 'category')
			res.body.Threads.should.have.property('length', 2)
			res.body.Threads.should.contain.an.item.with.deep.property('User.username', 'adminaccount')
			res.body.Threads.should.contain.an.item.with.deep.property('Posts.0.content', '<p>content here</p>\n')
			res.body.Threads.should.contain.an.item.with.deep.property('Posts.1.content', '<p>content here 3</p>\n')
			res.body.Threads.should.contain.an.item.with.deep.property('Posts.0.User.username', 'adminaccount')

		})
		it('should return all threads in all categories', async () => {
			let res = await chai.request(server)
				.get('/api/v1/category/ALL')

			res.should.be.json
			res.should.have.status(200)
			res.body.should.have.property('name', 'All')
			res.body.Threads.should.have.property('length', 2)
			res.body.Threads.should.contain.an.item.with.deep.property('User.username', 'adminaccount')
			res.body.Threads.should.contain.an.item.with.deep.property('Posts.0.content', '<p>content here</p>\n')
			res.body.Threads.should.contain.an.item.with.deep.property('Posts.1.content', '<p>content here 3</p>\n')
			res.body.Threads.should.contain.an.item.with.deep.property('Posts.0.User.username', 'adminaccount')

		})
		it('should return an error if category does not exist', async () => {
			try {
				let res = await chai.request(server)
					.get('/api/v1/category/not_real')

				res.should.be.json
				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('id', 'thread does not exist'))
			} catch (res) {
				let body = JSON.parse(res.response.text)
				res.should.have.status(400)
				body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('id', 'thread does not exist'))
			}
		})
	})
})