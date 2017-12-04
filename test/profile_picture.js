process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize, Thread, Post, User } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

let expect = chai.expect

describe('User', () => {
	let admin = chai.request.agent(server)
	let user = chai.request.agent(server)

	let picture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAFCAIAAADzBuo/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAANSURBVBhXYxisgIEBAACbAAEriBitAAAAAElFTkSuQmCC";

	//Wait for app to start before commencing
	before((done) => {
		if(server.locals.appStarted) done()
			
		server.on('appStarted', () => {
			done()
		})
	})

	describe('POST /:user/picture', () => {
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

				return true
			} catch (e) {
				return e
			}
		})

		it('should add a picture', async () => {
			let res = await user
				.post('/api/v1/user/useraccount1/picture')
				.set('content-type', 'application/json')
				.send({ picture })

			res.should.be.json
			res.should.have.status(200)

			let foundUser = await User.findById(1)
			foundUser.should.have.property('picture', picture)
		})
		it('should not add a picture if not logged in', done => {
			chai.request(server)
				.post('/api/v1/user/useraccount1/picture')
				.set('content-type', 'application/json')
				.send({ picture })
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(401)
					res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

					done()
				})
		})
		it('should not add a picture if not same user', done => {
			user
				.post('/api/v1/user/adminaccount/picture')
				.set('content-type', 'application/json')
				.send({ picture })
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(401)
					res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

					done()
				})
		})
		it('should not add a picture if user does not exist', done => {
			user
				.post('/api/v1/user/notanaccount/picture')
				.set('content-type', 'application/json')
				.send({ picture })
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(401)
					res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

					done()
				})
		})
		it('should not add a picture if not validated base64', done => {
			user
				.post('/api/v1/user/useraccount1/picture')
				.set('content-type', 'application/json')
				.send({ picture: 'not base64' })
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.has.property('message', 'image must be valid base64')

					done()
				})
		})
		it('should not add a picture if not an image mime type', done => {
			user
				.post('/api/v1/user/useraccount1/picture')
				.set('content-type', 'application/json')
				.send({ picture: 'data:text/html;base64,iVBORw0KGgoAAAANSUhEUgAAAAoA' })
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.has.property('message', 'image must be valid base64')

					done()
				})
		})

		it('should remove a picture if picture is null', async () => {
			let res = await user
				.post('/api/v1/user/useraccount1/picture')
				.set('content-type', 'application/json')
				.send({ picture: null })

			res.should.be.json
			res.should.have.status(200)

			let foundUser = await User.findById(1)
			foundUser.should.have.property('picture', null)
		})

		//it('should not add a picture if too large file size')

	})

	after(() => {
		sequelize.sync({ force: true })
	})
})