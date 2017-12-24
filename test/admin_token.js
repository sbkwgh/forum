process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('AdminToken', () => {
	//Wait for app to start before commencing
	before((done) => {
		if(server.locals.appStarted) done()
			
		server.on('appStarted', () => {
			done()
		})
	})

	//Delete all rows in table after
	//tests completed
	after(() => sequelize.sync({ force: true }))

	describe('POST /admin_token', async () => {
		let token
		let agent = chai.request.agent(server)

		before((done) => {
			agent
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount',
					password: 'password',
					admin: true
				})
				.then(() => {
					done()
				})
				.catch(done)
		})
			

		it('should generate a token if logged in', async () => {
			let res = await agent.post('/api/v1/admin_token')

			res.should.have.status(200)
			res.body.should.have.property('token')

			token = res.body.token
		})

		it('should generate a different token if logged in', async () => {
			let res = await agent.post('/api/v1/admin_token')

			res.should.have.status(200)
			res.body.should.have.property('token')
			res.body.token.should.not.equal(token)
		})

		it('should give an error if not logged in', async () => {
			try {
				let res = await chai.request(server).post('/api/v1/admin_token')

				res.should.have.status(401)
				res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)
			} catch(res) {
				res.should.have.status(401)
				JSON.parse(res.response.text).errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)
			}

		})
	})
})