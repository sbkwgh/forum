process.env.NODE_ENV = 'test'

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server')
let should = chai.should()

chai.use(chaiHttp)

describe('User', () => {
	describe('/POST user', () => {
		it('should create an account', (done) => {
			chai.request(server)
				.post('/api/v1/user')
				.field('username', 'test')
				.field('password', 'pass')
				.end((err, res) => {
					res.should.have.status(200)
					res.should.be.json
					res.should.have.property('username', 'test')
					res.should.have.property('hash')
					
					done()
				})
		})
	})
})