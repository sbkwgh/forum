process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('Search', () => {
	let admin = chai.request.agent(server)

	//Wait for app to start before commencing
	before((done) => {
		if(server.locals.appStarted) done()
			
		server.on('appStarted', () => {
			done()
		})
	})

	describe('GET /', () => {
		before(async () => {
			try {
				await admin
					.post('/api/v1/user')
					.set('content-type', 'application/json')
					.send({
						username: 'adminaccount',
						password: 'password',
						admin: true
					})

				await admin
					.post('/api/v1/category')
					.set('content-type', 'application/json')
					.send({ name: 'category' })

				await admin
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({ category: 'CATEGORY', name: 'thread' })

				for(let i = 0; i < 25; i++) {
					let text = ''

					if(i == 4 || i == 15 || i == 21) {
						text = 'query ' + i
					} else {
						text = 'term ' + i
					}

					await admin
						.post('/api/v1/post')
						.set('content-type', 'application/json')
						.send({ threadId: 1, content: text })
				}

				return true
			} catch (e) {
				return e
			}
		})

		it('should return matching posts', async () => {
			let res = await admin.get('/api/v1/search?q=term')

			res.should.be.json
			res.should.have.status(200)

			res.body.posts.should.have.property('length', 10)
			res.body.posts[0].should.have.property('content', '<p><b>term</b> 24</p>\n')
			res.body.posts[0].should.have.deep.property('User.username', 'adminaccount')

			res.body.should.have.property('offset', 10)
			res.body.should.have.property('next', 10)
		})

		it('should allow pagination', async () => {
			let page2 = await admin.get('/api/v1/search?q=term&offset=10')

			page2.should.be.json
			page2.should.have.status(200)

			page2.body.posts.should.have.property('length', 10)
			page2.body.posts[0].should.have.property('content', '<p><b>term</b> 12</p>\n')

			page2.body.should.have.property('offset', 20)
			page2.body.should.have.property('next', 2)

			let page3 = await admin.get('/api/v1/search?q=term&offset=20')

			page3.body.posts.should.have.property('length', 2)
			page3.body.posts[1].should.have.property('content', '<p><b>term</b> 0</p>\n')

			page3.body.should.have.property('next', 0)
		})
	})

	after(() => sequelize.sync({ force: true }))
})