process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()
let expect = chai.expect

let { sequelize, Report, Post, User } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

let adminAccount = chai.request.agent(server)
let userAccount = chai.request.agent(server)

describe('Report', () => {
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
							username: 'useraccount',
							password: 'password'
						})
				})
				.then(_ => {
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
				.then(_ => {
					return userAccount
						.post('/api/v1/post')
						.set('content-type', 'application/json')
						.send({ content: 'post to report', threadId: 1 })
				})
				.then(_ => {
					return userAccount
						.post('/api/v1/post')
						.set('content-type', 'application/json')
						.send({ content: 'post to report 2', threadId: 1 })
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
	after((done) => {
		sequelize.sync({ force: true })
			.then(() => {
				done(null);
			})
			.catch((err) => {
				done(err)
			})
	})

	describe('POST /report', () => {
		it('should create a new report', async () => {
			let res = await userAccount
				.post('/api/v1/report')
				.set('content-type', 'application/json')
				.send({
					postId: 1,
					reason: 'spam'
				})

			res.should.have.status(200)
			res.should.be.json

			let report = await Report.findById(1)

			report.should.not.be.null
			report.should.have.property('reason', 'spam')
		})

		it('should be fine with multiple reports from one user', async () => {
			let res = await userAccount
				.post('/api/v1/report')
				.set('content-type', 'application/json')
				.send({
					postId: 1,
					reason: 'inappropriate'
				})

			res.should.have.status(200)
			res.should.be.json 

			let report1 = await Report.findById(1, {
				include: [{ model: User, as: 'FlaggedByUser' }]
			})
			report1.should.not.be.null
			report1.should.have.deep.property('FlaggedByUser.username', 'useraccount')
			report1.should.have.property('reason', 'spam')

			let report2 = await Report.findById(2, {
				include: [{ model: User, as: 'FlaggedByUser' }]
			})

			report2.should.not.be.null
			report2.should.have.deep.property('FlaggedByUser.username', 'useraccount')
			report2.should.have.property('reason', 'inappropriate')
		})

		it('should be fine with multiple reports from different users', async () => {
			let res = await adminAccount
				.post('/api/v1/report')
				.set('content-type', 'application/json')
				.send({
					postId: 1,
					reason: 'inappropriate'
				})

			res.should.have.status(200)
			res.should.be.json

			let report1 = await Report.findById(1, {
				include: [{ model: User, as: 'FlaggedByUser' }]
			})
			report1.should.not.be.null
			report1.should.have.deep.property('FlaggedByUser.username', 'useraccount')
			report1.should.have.property('reason', 'spam')

			let report2 = await Report.findById(3, {
				include: [{ model: User, as: 'FlaggedByUser' }]
			})

			report2.should.not.be.null
			report2.should.have.deep.property('FlaggedByUser.username', 'adminaccount')
			report2.should.have.property('reason', 'inappropriate')
		})

		it('should return an error if not a logged in user', done => {
			chai.request(server)
				.post('/api/v1/report')
				.set('content-type', 'application/json')
				.send({
					postId: 1,
					reason: 'spam'
				})
				.end((err, res) => {
					res.should.have.status(401)
					res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

					done()
				})
		})
		it('should return an error if invalid post id provided', done => {
			userAccount
				.post('/api/v1/report')
				.set('content-type', 'application/json')
				.send({
					postId: 'fake',
					reason: 'spam'
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.has.property('message', 'Post id is not valid')

					done()
				})
		})
		it('should return an error if invalid report reason provided', done => {
			userAccount
				.post('/api/v1/report')
				.set('content-type', 'application/json')
				.send({
					postId: 1,
					reason: 'not a reason'
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.has.property('message', 'Report reason can only be one of the pre-defined options')
				
					done()
				})
		})
	})

	describe('GET /report', () => {
		before(async () => {
			await Report.destroy({
				where: {}
			})

			let report1 = await Report.create({ reason: 'spam' })
			let report2 = await Report.create({ reason: 'inappropriate' })

			let post1 = await Post.findById(1)
			let post2 = await Post.findById(2)
			let user = await User.find({
				where: { username: 'useraccount' }
			})

			await report1.setFlaggedByUser(user)
			await report1.setPost(post1)

			await report2.setFlaggedByUser(user)
			await report2.setPost(post2)
		})


		it('should return all reports', async () => {
			let res = await adminAccount
				.get('/api/v1/report')

			res.should.have.status(200)
			res.should.be.json

			res.body.should.have.length(2)
			res.body.should.contain.something.with.deep.property('FlaggedByUser.username', 'useraccount')
			res.body.should.contain.something.with.deep.property('reason', 'spam')
			res.body.should.contain.something.with.deep.property('reason', 'inappropriate')
		})

		it('should return an error if not admin account', done => {
			userAccount
				.get('/api/v1/report')
				.end((err, res) => {
					res.should.have.status(401)
					res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

					done()
				})
		})
	})

	describe('DELETE /report/:id', () => {
		let reportId;

		before(async () => {
			let report = await Report.create({ reason: 'spam' })

			let post = await Post.findById(1)
			let user = await User.find({
				where: { username: 'useraccount' }
			})

			await report.setFlaggedByUser(user)
			await report.setPost(post)

			reportId = report.id
		})

		it('should delete the report', async () => {
			let res = await adminAccount.delete('/api/v1/report/' + reportId)
			res.should.have.status(200)

			let report = await Report.findById(reportId)

			expect(report).to.be.null
		})
		it('should return an error if not an admin', done => {
			userAccount
				.delete('/api/v1/report/2')
				.end((err, res) => {
					res.should.have.status(401)
					res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

					done()
				})
		})
		it('should return an error if invalid id', done => {
			adminAccount
				.delete('/api/v1/report/fake')
				.end((err, res) => {
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.has.property('message', 'Post id is not valid')

					done()
				})
		})
	})
})