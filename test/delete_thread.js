process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize, Thread, Post, User } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

let expect = chai.expect

describe('Thread', () => {
	let admin = chai.request.agent(server)
	let user = chai.request.agent(server)

	//Wait for app to start before commencing
	before((done) => {
		if(server.locals.appStarted) done()
			
		server.on('appStarted', () => {
			done()
		})
	})

	describe('Delete', () => {
		before(async () => {
			try {
				let accounts = []

				accounts.push(
					admin
					.post('/api/v1/user')
					.set('content-type', 'application/json')
					.send({
						username: 'adminaccount',
						password: 'password',
						admin: true
					})
				)
				accounts.push(
					user
					.post('/api/v1/user')
					.set('content-type', 'application/json')
					.send({
						username: 'useraccount1',
						password: 'password'
					})
				)
		
				await Promise.all(accounts)

				await admin
					.post('/api/v1/category')
					.set('content-type', 'application/json')
					.send({ name: 'category' })

				await user
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({ category: 'CATEGORY', name: 'thread' })
			
				await user
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({
						content: 'post 1',
						threadId: 1
					})
				await user
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({
						content: 'post 2',
						threadId: 1
					})
				await user
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({
						content: 'post 3',
						threadId: 1
					})

				await user
					.post('/api/v1/report')
					.set('content-type', 'application/json')
					.send({
						postId: 1,
						reason: 'inappropriate'
					})

				await user
					.post('/api/v1/report')
					.set('content-type', 'application/json')
					.send({
						postId: 2,
						reason: 'inappropriate'
					})

				return true
			} catch (e) {
				return e
			}
		})

		it('should delete a thread and corresponding posts', async () => {
			let res = await admin.delete('/api/v1/thread/1')
			res.should.be.json
			res.should.have.status(200)

			let thread = await Thread.findById(1)
			let posts = await Post.findAll({
				where: {
					ThreadId: 1
				}
			})
			let reports = await admin.get('/api/v1/report')

			expect(thread).to.be.null
			expect(posts).to.have.property('length', 0)
			expect(reports.body).to.have.property('length', 0)
		})
		it('should return an error if thread does not exist', done => {
			admin
				.delete('/api/v1/thread/404')
				.end((err, res) => {
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.has.property(
						'message',
						'invalid thread id'
					)

					done()
				})
		})
		it('should retun an error if not an admin', done => {
			chai.request(server)
				.delete('/api/v1/thread/1')
				.end((err, res) => {
					res.should.have.status(401)
					res.body.errors.should.contain.something.which.deep.equals(Errors.requestNotAuthorized)

					done()
				})
		})
	})

	after(() => {
		sequelize.sync({ force: true })
	})
})