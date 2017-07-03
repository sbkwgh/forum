process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()
let expect = chai.expect

let { sequelize, Thread } = require('../models')

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
				res.response.body.errors.should.contain.something.that.deep.equals(Errors.categoryAlreadyExists)
			}
		})
		it('should return an error if missing category parameter', done => {
			agent
				.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({})
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.has.property('message', 'name cannot be null')

					done()
				})
		})
		it('should return an error if category parameter has no length', done => {
			agent
				.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: '' })
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.has.property('message', 'The category name can\'t be empty')

					done()
				})
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

			await agent
				.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: 'category with spaces' })
		})

		it('should return all categories', async () => {
			let res = await chai.request(server)
				.get('/api/v1/category')

			res.should.be.json
			res.should.have.status(200)
			res.body.should.contain.an.item.with.property('name', 'category')
			res.body.should.contain.an.item.with.property('name', 'another_category')
			res.body.should.contain.an.item.with.property('name', 'category with spaces')
		})
	})

	describe('GET /category/:category', () => {

		it('should return allow pagination for category ALL', async () => {
			let agent = chai.request.agent(server)
			
			await agent
				.post('/api/v1/user/adminaccount/login')
				.set('content-type', 'application/json')
				.send({ password: 'password' })

		 	await agent
		 		.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: 'pagination1' })

			await agent
		 		.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: 'pagination2' })

			for(var i = 0; i < 30; i++) {
				let category = 'pagination1'

				if(i % 2) category = 'pagination2'

				let thread = await agent
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({ name: `THREAD ${i}`, category })

				await agent
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({ content: `POST ${i}`, threadId: thread.body.id })
			}

			let pageOne = await agent.get('/api/v1/category/ALL')
			let pageTwo = await agent.get(pageOne.body.meta.nextURL)
			let pageThree = await agent.get(pageTwo.body.meta.nextURL)

			pageOne.body.Threads.should.have.length(10)
			pageOne.body.meta.should.have.property('nextThreadsCount', 10)
			pageOne.body.Threads[0].Posts[0].should.have.property('content', '<p>POST 29</p>\n')

			pageTwo.body.Threads.should.have.length(10)
			pageTwo.body.meta.should.have.property('nextThreadsCount', 10)
			pageTwo.body.Threads[0].Posts[0].should.have.property('content', '<p>POST 19</p>\n')

			pageThree.body.Threads.should.have.length(10)
			pageThree.body.meta.should.have.property('nextThreadsCount', 0)
			pageThree.body.Threads[0].Posts[0].should.have.property('content', '<p>POST 9</p>\n')
			pageThree.body.Threads[9].Posts[0].should.have.property('content', '<p>POST 0</p>\n')
			expect(pageThree.body.meta.nextURL).to.be.null


		})

		it('should return all threads in a category', async () => {
			let agent = chai.request.agent(server)

			await agent
				.post('/api/v1/user/adminaccount/login')
				.set('content-type', 'application/json')
				.send({ password: 'password' })


			for(var i = 0; i < 3; i++) {
				let thread = await agent
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({ name: 'thread ' + i, category: 'category' })

				await agent
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({ content: 'content here ' + i, threadId: thread.body.id })
			}


			let res = await chai.request(server)
				.get('/api/v1/category/CATEGORY')

			res.should.be.json
			res.should.have.status(200)
			res.body.should.have.property('name', 'category')
			res.body.Threads.should.have.property('length', 3)
			res.body.Threads.should.contain.an.item.with.deep.property('User.username', 'adminaccount')
			res.body.Threads[0].Posts[0].should.have.property('content', '<p>content here 2</p>\n')
			res.body.Threads[1].Posts[0].should.have.property('content', '<p>content here 1</p>\n')
			res.body.Threads[2].Posts[0].should.have.property('content', '<p>content here 0</p>\n')
			res.body.Threads.should.contain.an.item.with.deep.property('Posts.0.User.username', 'adminaccount')

		})

		it('should return all threads in a category with spaces', async () => {
			let agent = chai.request.agent(server)

			await agent
				.post('/api/v1/user/adminaccount/login')
				.set('content-type', 'application/json')
				.send({ password: 'password' })

			let thread = await agent
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({ name: 'thread', category: 'CATEGORY_WITH_SPACES' })

				await agent
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({ content: 'content here', threadId: thread.body.id })

			let res = await chai.request(server)
				.get('/api/v1/category/CATEGORY_WITH_SPACES')

			res.should.be.json
			res.should.have.status(200)
			res.body.should.have.property('name', 'category with spaces')
			res.body.Threads.should.have.property('length', 1)
			res.body.Threads.should.contain.an.item.with.deep.property('User.username', 'adminaccount')
			res.body.Threads[0].Posts[0].should.have.property('content', '<p>content here</p>\n')
			res.body.Threads.should.contain.an.item.with.deep.property('Posts.0.User.username', 'adminaccount')
		})


		it('should return an error if category does not exist', async () => {
			try {
				let res = await chai.request(server)
					.get('/api/v1/category/not_real')

				res.should.be.json
				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('id', 'category does not exist'))
			} catch (res) {
				let body = JSON.parse(res.response.text)
				res.should.have.status(400)
				body.errors.should.contain.something.that.deep.equals(Errors.invalidParameter('id', 'category does not exist'))
			}
		})
	})
})