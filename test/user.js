process.env.NODE_ENV = 'test'

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server')
let should = chai.should()

let User = require('../models').User
const Errors = require('../lib/errors.js');

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
					username: 'test',
					password: 'pass'
				})
				.end((err, res) => {
					res.should.have.status(200)
					res.should.be.json
					res.body.should.have.property('username', 'test')
					res.body.should.have.property('hash')
					
					done()
				})
		})
		it('should throw an error if no username', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					password: 'pass'
				})
				.end((err, res) => {
					res.should.have.status(500)
					res.should.be.json
					res.body.should.have.property('error')
					res.body.error.should.deep.equal()
					
					done()
				})
		})
		it('should throw an error if no pass', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({
					username: 'test1'
				})
				.end((err, res) => {
					res.should.have.status(200)
					res.should.be.json
					res.body.should.have.property('username', 'test')
					res.body.should.have.property('hash')
					
					done()
				})
		})
	})
})