process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let User = require('../models').User
const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('User', () => {
	//Delete all rows in table after
	//tests completed
	after((done) => {
		User.sync({ force: true })
			.then(() => {
				done(null);
			})
			.catch((err) => {
				done(err)
			})
	})

	describe('/ POST user', () => {
		it('should create an account', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'username',
					password: 'password'
				})
				.end((err, res) => {
					res.should.have.status(200)
					res.should.be.json
					res.body.should.have.property('username', 'username')
					res.body.should.have.property('hash')
					
					done()
				})
		})

		it('should log in the user after creating an account', (done) => {
			let agent = chai.request.agent(server)

			agent
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'username1',
					password: 'password'
				})
				.end((err, res) => {
					
					agent
						.get('/api/v1/user/username1')
						.then((res) => {
							res.should.have.status(200)

							done()
						})
						.catch(done)
				})
		})

		it('should throw an error if account already created', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'username',
					password: 'password'
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.should.be.json
					res.body.should.have.property('errors')
					res.body.errors.should.include.something.that.deep.equals(Errors.accountAlreadyCreated)
					
					done()
				})
		})


		it('should throw an error if no username or password', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({})
				.end((err, res) => {
					res.should.have.status(400)
					res.should.be.json
					res.body.should.have.property('errors')
					res.body.errors.should.include.something.that.deep.equals(Errors.missingParameter('username'))
					res.body.errors.should.include.something.that.deep.equals(Errors.missingParameter('password'))
					
					done()
				})
		})
		it('should throw an error if username or password are not a string', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 123,
					password: 123
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.should.be.json
					res.body.should.have.property('errors')
					res.body.should.have.property('errors')
					res.body.errors.should.include.something.that.deep.equals(Errors.invalidParameterType('username', 'string'))
					res.body.errors.should.include.something.that.deep.equals(Errors.invalidParameterType('password', 'string'))
					
					done()
				})
		})
		it('should throw an error if username or password less than 6 characters', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'test',
					password: 'pass'
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.should.be.json
					res.body.should.have.property('errors')
					res.body.errors.should.contain.something.that.deep.equals(Errors.parameterLengthTooSmall('username', '6'))
					res.body.errors.should.contain.something.that.deep.equals(Errors.parameterLengthTooSmall('password', '6'))
					
					done()
				})
		})
		it('should throw an error if username greater than 50 characters or password is greater than 100 characters', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: '123456789012345678901234567890123456789012345678901',
					password: '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901'
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.should.be.json
					res.body.should.have.property('errors')
					res.body.errors.should.contain.something.that.deep.equals(Errors.parameterLengthTooLarge('username', '50'))
					res.body.errors.should.contain.something.that.deep.equals(Errors.parameterLengthTooLarge('password', '100'))
					
					done()
				})
		})

	})

	describe('/:username/login POST user', () => {
		let agent = chai.request.agent(server)

		it('should throw an error if invalid username is provided', (done) => {
			chai.request(server)
				.post('/api/v1/user/invalid_username/login')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					password: 'password'
				})
				.end((err, res) => {
					res.should.have.status(401)
					res.body.should.have.property('errors')
					res.body.errors.should.contain.something.that.deep.equals(Errors.invalidLoginCredentials)

					done()
				})
		})

		it('should throw an error if invalid password is provided', (done) => {
			chai.request(server)
				.post('/api/v1/user/username/login')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					password: 'invalid_password'
				})
				.end((err, res) => {
					res.should.have.status(401)
					res.body.should.have.property('errors')
					res.body.errors.should.contain.something.that.deep.equals(Errors.invalidLoginCredentials)

					done()
				})
		})

		it('should log in the user', (done) => {
			agent
				.post('/api/v1/user/username/login')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					password: 'password'
				})
				.end((err, res) => {
					res.should.have.status(200)
					res.should.be.json
					res.should.have.cookie('connect.sid')

					agent
						.get('/api/v1/user/username')
						.then((res) => {
							res.should.have.status(200)

							done()
						})
						.catch(done)
				})
		})
	})

	describe('/:username/logout POST user', () => {
		let agent = chai.request.agent(server)

		it('should log out the user', (done) => {
			agent
				.post('/api/v1/user/login')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'username',
					password: 'password'
				})
				.end((err, res) => {

					agent
						.post('/api/v1/user/username/logout')
						.end((err, res) => {
							res.should.have.status(200)

							agent
								.get('/api/v1/user/username')
								.then((res) => {
									res.should.have.status(403)
									res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

									done()
								})
								.catch(done)
						})
				})
		})
	})
})