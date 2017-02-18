process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('Thread and post', () => {
	//Wait for app to start before commencing
	before((done) => {
		if(server.locals.appStarted) done()

		server.on('appStarted', () => {
			done()
		})
	})

	//Delete all rows in table after
	//tests completed
	after(() => {
		sequelize.sync({ force: true })
	})

	describe('POST /thread', () => {
		it('should create a thread if logged in', async () => {})
		it('should return an error if not logged in', async () => {})
		it('should return an error if missing parameters', async () => {})
		it('should return an error if invalid types', async () => {})
		it('should return an error if category does not exist', async () => {})
	})

	describe('GET /thread/:id', () => {
		it('should return the thread and corresponding posts', async () => {})
		it('should return an error if :id is invalid', async () => {})
	})

	describe('POST /post', () => {
		it('should create a post if logged in', async () => {})
		it('should return an error if not logged in', async () => {})
		it('should return an error if missing parameters', async () => {})
		it('should return an error if invalid types', async () => {})
		it('should return an error if thread id does not exist', async () => {})

		it('should be able to reply to a post', async () => {})
		it('should return an error if reply id does not exist', async () => {})
		it('should return an error if post reply not in same thread', async () => {})
	})

	describe('GET /post/:id', () => {
		it('should return the post', async () => {})
		it('should return an error if invalid post id', async () => {})
	})
})