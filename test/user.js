process.env.NODE_ENV = 'test'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize } = require('../models')
const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('User', () => {
	//Wait for app to start before commencing
	before((done) => {
		if(server.locals.appStarted) done()
			
		server.on('appStarted', () => {
			done()
		})
	})

	//Delete all rows in table after
	//tests completed
	after(() => sequelize.sync({ force: true }) )

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
					res.body.should.have.property('color')
					res.body.color.should.not.be.null
					
					done()
				})
		})

		it('should create an admin account if no is already created', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount',
					password: 'password',
					admin: true
				})
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.have.property('username', 'adminaccount')
					res.body.should.have.property('hash')
					res.body.should.have.property('admin', true)

					done()
				})
		})

		it('should give an error if an admin account is already created and no token is provided', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount1',
					password: 'password',
					admin: true
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.should.be.json
					res.body.should.have.property('errors')
					res.body.errors.should.include.something.that.deep.equals(Errors.missingParameter('token'))

					done()
				})
		})

		it('should give an error if admin and token fields are not of the correct type ', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount1',
					password: 'password',
					admin: 'not a boolean',
					token: 123
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.should.be.json
					res.body.should.have.property('errors')
					res.body.errors.should.include.something.that.deep.equals(Errors.invalidParameterType('admin', 'boolean'))
					res.body.errors.should.include.something.that.deep.equals(Errors.invalidParameterType('token', 'string'))

					done()
				})
		})

		it('should give an error if an admin account is already created and token is invalid', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount1',
					password: 'password',
					admin: true,
					token: 'invalid_token'
				})
				.end((err, res) => {
					res.should.have.status(401)
					res.should.be.json
					res.body.should.have.property('errors')
					res.body.errors.should.include.something.that.deep.equals(Errors.invalidToken)

					done()
				})
		})

		it('should create an admin account provided with a token', async () => {
			let agent = chai.request.agent(server)

			await agent
				.post('/api/v1/user/adminaccount/login')
				.set('content-type', 'application/json')
				.send({
					password: 'password'
				})

			let tokenRes = await agent.post('/api/v1/admin_token')
			let token = tokenRes.body.token
						
			let accountRes = await chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount1',
					password: 'password',
					admin: true,
					token: token
				})

			accountRes.should.have.status(200)
			accountRes.should.be.json
			accountRes.body.should.have.property('admin', true)
			accountRes.body.should.have.property('username', 'adminaccount1')
			accountRes.body.should.have.property('hash')	

			try {
				let invalidAccountRes = await chai.request(server)
					.post('/api/v1/user')
					.set('content-type', 'application/json')
					.send({
						username: 'adminaccount2',
						password: 'password',
						admin: true,
						token: token
					})
				
				invalidAccountRes.should.have.status(401)
				invalidAccountRes.should.be.json
				invalidAccountRes.body.should.have.property('errors')
				invalidAccountRes.body.errors.should.include.something.that.deep.equals(Errors.invalidToken)
			} catch (res) {
				res.should.have.status(401)
				JSON.parse(res.response.text).errors.should.include.something.that.deep.equals(Errors.invalidToken)
			}
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
					res.should.not.have.cookie('username')

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
					res.should.have.cookie('username', 'username')

					if(err) {
						done(err)
					} else {
						done()
					}
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
							res.should.not.have.cookie('username')

							if(err) {
								done(err)
							} else {
								done()
							}
						})
				})
		})
	})
})