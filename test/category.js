process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { User, Category } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('Thread and post', () => {
	//Wait for app to start before commencing
	before((done) => {
		server.on('appStarted', () => {
			done()
		})
	})

	//Delete all rows in table after
	//tests completed
	after((done) => {
		Promise.all([
			User.sync({ force: true }),
			Category.sync({ force: true })
		])
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
		})
		it('should return an error if category already exists', async () => {
			let res = await agent
				.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: 'category' })

			res.should.be.json
			res.should.have.status(400)
			res.body.errors.should.contain.something.that.deep.equals(Errors.categoryAlreadyCreated)
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

			let res = await agent
				.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: 'category1' })

			res.should.be.json
			res.should.have.status(401)
			res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)
		})
		it('should return an error if not logged', async () => {
			await chai.request(server)
				.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: 'category1' })

			res.should.be.json
			res.should.have.status(401)
			res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)
		})
	})

	describe('GET /category', async () => {
		let agent = chai.request.agent(server)

		await agent
			.post('/api/v1/user/adminaccount')
			.set('content-type', 'application/json')
			.send({ password: 'password' })

		await agent
			.post('/api/v1/category')
			.set('content-type', 'application/json')
			.send({ name: 'another_category' })

		it('should return all categories', async () => {
			let res = await chai.request(server)
				.get('/api/v1/category')

			res.should.be.json
			res.should.have.status(200)
			res.body.should.contain.an.item.with.property('name', 'category')
			res.body.should.contain.an.item.with.property('name', 'another_category')
		})
	})
})