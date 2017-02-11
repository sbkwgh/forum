process.env.NODE_ENV = 'test'

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server')
let should = chai.should()

let User = require('../models').User
const Errors = require('../lib/errors.js')

chai.use(chaiHttp)

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

	describe('/POST user', () => {
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

		it('should throw an error if account already created', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'username',
					password: 'password'
				})
				.end((err, res) => {
					res.should.have.status(500)
					res.should.be.json
					res.body.should.have.property('error')
					res.body.error.should.deep.equal(Errors.accountAlreadyCreated)
					
					done()
				})
		})


		it('should throw an error if no username', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					password: 'password'
				})
				.end((err, res) => {
					res.should.have.status(500)
					res.should.be.json
					res.body.should.have.property('error')
					res.body.error.should.deep.equal(Errors.missingParameter('username'))
					
					done()
				})
		})
		it('should throw an error if username is not a string', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 123,
					password: 'password'
				})
				.end((err, res) => {
					res.should.have.status(500)
					res.should.be.json
					res.body.should.have.property('error')
					res.body.error.should.deep.equal(Errors.invalidParameterType('username', 'string'))
					
					done()
				})
		})
		it('should throw an error if username less than 6 characters', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'test',
					password: 'password'
				})
				.end((err, res) => {
					res.should.have.status(500)
					res.should.be.json
					res.body.should.have.property('error')
					res.body.error.should.deep.equal(Errors.parameterLengthTooSmall('username', '6'))
					
					done()
				})
		})
		it('should throw an error if username greater than 50 characters', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: '123456789012345678901234567890123456789012345678901',
					password: 'password'
				})
				.end((err, res) => {
					res.should.have.status(500)
					res.should.be.json
					res.body.should.have.property('error')
					res.body.error.should.deep.equal(Errors.parameterLengthTooGreat('username', '50'))
					
					done()
				})
		})


		it('should throw an error if no password', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'username1'
				})
				.end((err, res) => {
					res.should.have.status(500)
					res.should.be.json
					res.body.should.have.property('error')
					res.body.error.should.deep.equal(Errors.missingParameter('password'))
					
					done()
				})
		})
		it('should throw an error if password is not a string', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'username1',
					password: 123
				})
				.end((err, res) => {
					res.should.have.status(500)
					res.should.be.json
					res.body.should.have.property('error')
					res.body.error.should.deep.equal(Errors.invalidParameterType('password', 'string'))
					
					done()
				})
		})
		it('should throw an error if password less than 6 characters', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'username1',
					password: 'pass'
				})
				.end((err, res) => {
					res.should.have.status(500)
					res.should.be.json
					res.body.should.have.property('error')
					res.body.error.should.deep.equal(Errors.parameterLengthTooSmall('password', '6'))
					
					done()
				})
		})
		it('should throw an error if password greater than 100 characters', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'username1',
					password: '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901'
				})
				.end((err, res) => {
					res.should.have.status(500)
					res.should.be.json
					res.body.should.have.property('error')
					res.body.error.should.deep.equal(Errors.parameterLengthTooGreat('password', '100'))
					
					done()
				})
		})
	})
})