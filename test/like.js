process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()

let { sequelize } = require('../models')

const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('Like', () => {
	let admin = chai.request.agent(server)
	let user = chai.request.agent(server)
	let user2 = chai.request.agent(server)

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
					return user2
						.post('/api/v1/user')
						.set('content-type', 'application/json')
						.send({
							username: 'useraccount2',
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
				.then(() => {
					return admin
						.post('/api/v1/post')
						.set('content-type', 'application/json')
						.send({ threadId: 1, content: 'POST 1' })
				})
				.then(() => {
					return admin
						.post('/api/v1/post')
						.set('content-type', 'application/json')
						.send({ threadId: 1, content: 'POST 2' })
				})
				.then(() => {
					return user
						.post('/api/v1/post')
						.set('content-type', 'application/json')
						.send({ threadId: 1, content: 'POST 3' })
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

	it('should allow a user to like a post', async () => {
		let likeRes = await user.put('/api/v1/post/1/like')

		//Should be idempotent, hence put twice
		await user.put('/api/v1/post/1/like')

		likeRes.should.have.status(200)
		likeRes.should.be.json
		likeRes.body.should.have.property('success', true)

		let postRes = await user.get('/api/v1/post/1')

		postRes.should.have.status(200)
		postRes.should.be.json
		postRes.body.should.have.property('Likes')
		postRes.body.Likes.should.have.property('length', 1)
		postRes.body.Likes[0].should.have.deep.property('username', 'useraccount')
	})

	it('should return an error if not logged in', done => {
		chai.request(server)
			.put('/api/v1/post/3/like')
			.end((err, res) => {
				res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

				done()
			})
	})

	it('should return an error if liking own post', done => {
		admin
			.put('/api/v1/post/1/like')
			.end((err, res) => {
				res.body.errors.should.contain.something.that.deep.equals(Errors.cannotLikeOwnPost)

				done()
			})
	})

	it('should return all likes on a post', async () => {
		await admin.put('/api/v1/post/3/like')
		await user2.put('/api/v1/post/3/like')

		let postRes = await admin.get('/api/v1/post/3')

		postRes.should.have.status(200)
		postRes.should.be.json
		postRes.body.should.have.property('Likes')
		postRes.body.Likes.should.have.property('length', 2)
	})

	it('should return all likes on a thread', async () => {
		let thread = await admin.get('/api/v1/thread/1')

		thread.should.have.status(200)
		thread.should.be.json
		thread.body.Posts[0].Likes.should.have.property('length', 1)
		thread.body.Posts[2].Likes.should.have.property('length', 2)
	})
})