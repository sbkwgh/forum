process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('Notifications', () => {
	let admin = chai.request.agent(server)
	let user = chai.request.agent(server)

	//Wait for app to start before commencing
	before((done) => {
		function serverStarted () {
			admin
				.post('/api/v1/user')
				.set('content-type', 'application/json')
				.send({
					username: 'adminaccount',
					password: 'password',
					admin: true
				})
				.then(() => {
					return user
						.post('/api/v1/user')
						.set('content-type', 'application/json')
						.send({
							username: 'useraccount',
							password: 'password',
						})
				})
				.then(() => {
					return admin
						.post('/api/v1/category')
						.set('content-type', 'application/json')
						.send({ name: 'category' })
				})
				.then(() => {
					return admin
						.post('/api/v1/thread')
						.set('content-type', 'application/json')
						.send({ category: 'CATEGORY', name: 'thread' })
				})
				.then(_ => {
					done()
				})
				.catch(done)
		}

		if(server.locals.appStarted) serverStarted()
			
		server.on('appStarted', () => {
			serverStarted()
		})
	})

	after(() => sequelize.sync({ force: true }))

	describe('/notification', () => {
		it('should return no notifications', done => {
			user
				.get('/api/v1/notification')
				.end((err, res) => {
					res.should.have.status(200)
					res.should.be.json
					res.body.should.have.property('Notifications')
					res.body.Notifications.should.have.property('length', 0)
					res.body.should.have.property('unreadCount', 0)

					done()
				})
		})

		it('should return an error if not logged in', done => {
			chai.request(server)
				.get('/api/v1/notification')
				.end((err, res) => {
					res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)
					done()
				})
		})

		it('should return a mention notification if user mentioned', async () => {
			await user
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ threadId: 1, content: 'POST 1', mentions: ['adminaccount'] })

			await user
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ threadId: 1, content: 'POST 2', mentions: ['adminaccount'] })

			let res = await admin.get('/api/v1/notification')

			res.should.have.status(200)
			res.should.be.json
			res.body.should.have.property('Notifications')
			res.body.Notifications.should.have.property('length', 2)
			res.body.Notifications.should.contain.something.that.has.deep.property('interacted', false)
			res.body.Notifications.should.contain.something.that.has.deep.property('User.username', 'useraccount')
			res.body.Notifications.should.contain.something.that.has.deep.property('Post.content', '<p>POST 1</p>\n')
			res.body.should.have.property('unreadCount', 2)
		})

		it('should return an error if any mention is not a string', done => {
			user
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ threadId: 1, content: 'POST 1', mentions: ['adminaccount', 123] })
				.end((err, res) => {
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('mentions', 'string'))

					done()
				})
		})

		it('should not crash if user doesnt exist', async () => {
			let deleteRes = await admin
				.delete('/api/v1/notification')

			deleteRes.should.be.json
			deleteRes.should.have.status(200)
			deleteRes.should.have.property('success', true)

			let res = await admin.get('/api/v1/notification')

			res.should.have.status(200)
			res.should.be.json
			res.body.should.have.property('Notifications')
			res.body.Notifications.should.have.property('length', 2)
			res.body.should.have.property('unreadCount', 0)

		})

		it('should set unreadCount to 0', async () => {
			await user
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ threadId: 1, content: 'POST 1', mentions: ['adminaccount'] })

			await user
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ threadId: 1, content: 'POST 2', mentions: ['adminaccount'] })

			let res = await admin.get('/api/v1/notification')

			res.should.have.status(200)
			res.should.be.json
			res.body.should.have.property('Notifications')
			res.body.Notifications.should.have.property('length', 2)
			res.body.Notifications.should.contain.something.that.has.deep.property('interacted', false)
			res.body.Notifications.should.contain.something.that.has.deep.property('User.username', 'useraccount')
			res.body.Notifications.should.contain.something.that.has.deep.property('Post.content', '<p>POST 1</p>\n')
			res.body.should.have.property('unreadCount', 2)
		})
	})

	describe('/notification/:id', () => {
		
	})
})