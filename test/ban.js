process.env.NODE_ENV = 'test'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

let chai = require('chai')
let server = require('../server')
let should = chai.should()
let expect = chai.expect

let { sequelize, User, Ban } = require('../models')
const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

let adminAccount = chai.request.agent(server)
let userAccount = chai.request.agent(server)
let userAccountId, anotherUserAccountId

describe('Ban', () => {
	//Wait for app to start before commencing
	before((done) => {
		function createAccounts () {
			adminAccount
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount',
					password: 'password',
					admin: true
				})
				.then(_ => {
					return userAccount
						.post('/api/v1/user')
						.set('content-type', 'application/json')
						.send({
							username: 'anotheruseraccount',
							password: 'password'
						})
				})
				.then(res => {
					anotherUserAccountId = res.body.id

					return userAccount
						.post('/api/v1/user')
						.set('content-type', 'application/json')
						.send({
							username: 'useraccount',
							password: 'password'
						})
				})
				.then(res => {
					userAccountId = res.body.id

					return adminAccount
						.post('/api/v1/category')
						.set('content-type', 'application/json')
						.send({ name: 'category_name' })
				})
				.then(_ => {
					return userAccount
						.post('/api/v1/thread')
						.set('content-type', 'application/json')
						.send({ name: 'thread', category: 'category_name' })

				})
				.then(_ => done())
				.catch(done)
		}


		if(server.locals.appStarted) createAccounts()

		server.on('appStarted', () => {
			createAccounts()
		})
	})


	//Delete all rows in table after
	//tests completed
	after(() => sequelize.sync({ force: true }) )

	describe('/ban POST', () => {

		it('should create a ban for the user', async () => {
			let res = await adminAccount
				.post('/api/v1/ban')
				.set('content-type', 'application/json')
				.send({
					canCreatePosts: false,
					canCreateThreads: false,
					userId: userAccountId,
					message: 'ban message'
				})

			res.should.be.json
			res.should.have.status(200)

			let ban = await Ban.findById(1)
			ban.should.have.property('canCreatePosts', false)
			ban.should.have.property('canCreateThreads', false)
			ban.should.have.property('message', 'ban message')
			ban.should.have.property('UserId', userAccountId)
		})
		it('should return an error if not an administrator', done => {
			userAccount
				.post('/api/v1/ban')
				.set('content-type', 'application/json')
				.send({
					canCreatePosts: false,
					canCreateThreads: false,
					userId: userAccountId,
					message: 'ban message'
				})
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

					done()
				})
		})
		it('should return an error if user id is not valid', done => {
			adminAccount
				.post('/api/v1/ban')
				.set('content-type', 'application/json')
				.send({
					canCreatePosts: false,
					canCreateThreads: false,
					userId: 'not an id',
					message: 'ban message'
				})
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.has.property('message', 'user does not exist')

					done()
				})
		})
		it('should return an error if trying to post replies if permissions so set', done => {
			userAccount
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({
					threadId: 1,
					content: 'post'
				})
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.with.property('message', 'ban message')

					done()
				})
		})
		it('should return an error if trying to create thread if permissions so set', done => {
			userAccount
				.post('/api/v1/thread')
				.set('content-type', 'application/json')
				.send({
					category: 'category',
					name: 'thread name'
				})
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.with.property('message', 'ban message')

					done()
				})
		})
	})

	describe('/ban GET', () => {
		before(done => {
			adminAccount
				.post('/api/v1/ban')
				.set('content-type', 'application/json')
				.send({
					canCreatePosts: false,
					canCreateThreads: false,
					userId: anotherUserAccountId,
					message: 'ban message2'
				})
				.end((err, res) => {
					done()
				})
		})

		it('should get all bans', async () => {
			let res = await adminAccount.get('/api/v1/ban')

			res.should.be.json
			res.should.have.status(200)
			res.body.should.contain.something.with.deep.property('User.username', 'useraccount')
			res.body.should.have.length(2)
		})
	})

	describe('/ban/:ban_id DELETE', () => {
		it('should remove a ban', async () => {
			let res = await adminAccount.delete('/api/v1/ban/1')

			res.should.be.json
			res.should.have.status(200)

			let ban = await Ban.findAll()
			ban.should.have.length(1)
			ban[0].should.have.property('id', 2)
		})
		it('should return an error if ban id is not valid', done => {
			adminAccount.delete('/api/v1/ban/notarealid')
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.has.property('message', 'ban does not exist')

					done()
				})
		})
	})
})