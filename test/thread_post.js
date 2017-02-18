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
		server.on('appStarted', () => {
			done()
		})
	})

	//Delete all rows in table after
	//tests completed
	after(() => {
		sequelize.sync({ force: true })
	})
})