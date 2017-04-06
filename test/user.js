process.env.NODE_ENV = 'test'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

let chai = require('chai')
let server = require('../server')
let should = chai.should()
let expect = chai.expect

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

	describe('/:username GET user', () => {
		it('should return the user', async () => {
			let res = await chai.request(server)
				.get('/api/v1/user/username')

			res.should.have.status(200)
			res.should.be.json
			res.body.should.have.property('username', 'username')
			res.body.should.have.property('color')
			res.body.should.not.have.property('hash')
		})

		it('should return an error if username invalid', async () => {
			try {
				let res = await chai.request(server)
					.get('/api/v1/user/not_a_user')

				res.should.have.status(400)
				res.body.errors.should.contain.something.that.deep.equals(Errors.accountDoesNotExist)
			} catch(res) {
				let body = JSON.parse(res.response.text)
				res.should.have.status(400)
				body.errors.should.contain.something.that.deep.equals(Errors.accountDoesNotExist)
			}
		})

		it('should get posts as well if posts query is appended', async () => {
			let agent = chai.request.agent(server)

			await agent
				.post('/api/v1/user/adminaccount/login')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({ password: 'password' })

			await agent
				.post('/api/v1/category')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({ name: 'categorynamehere' })

			await agent
				.post('/api/v1/thread')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({ name: 'a thread name', category: 'categorynamehere' })

			await agent
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ threadId: 1, content: 'content for post' })

			await agent
				.post('/api/v1/post')
				.set('content-type', 'application/json')
				.send({ threadId: 1, content: 'content for another post' })

			let res = await agent
				.get('/api/v1/user/adminaccount?posts=true')

			res.should.be.json
			res.should.have.status(200)
			res.body.should.have.property('username', 'adminaccount')
			res.body.should.have.property('Posts')
			res.body.Posts.should.have.property('length', 2)
			res.body.Posts[0].should.have.deep.property('Thread.id', 1)
			res.body.Posts[0].should.have.deep.property('User.username', 'adminaccount')
		})	

		it('should allow pagination', async () => {
			let agent = chai.request.agent(server)

			await agent
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({ username: 'paginationaccount', password: 'password' })

			for(var i = 0; i < 30; i++) {
				let thread = await agent
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({ category: 'categorynamehere', name: `THREAD ${i}` })


				await agent
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({ threadId: thread.body.id, content: `POST ${i}` })
			}

			let pageOne = await agent.get('/api/v1/user/paginationaccount?posts=true')
			let pageTwo = await agent.get(pageOne.body.meta.nextURL)
			let pageThree = await agent.get(pageTwo.body.meta.nextURL)

			pageOne.body.Posts.should.have.length(10)
			pageOne.body.meta.should.have.property('nextPostsCount', 10)
			pageOne.body.Posts[0].should.have.property('content', '<p>POST 29</p>\n')

			pageTwo.body.Posts.should.have.length(10)
			pageTwo.body.meta.should.have.property('nextPostsCount', 10)
			pageTwo.body.Posts[0].should.have.property('content', '<p>POST 19</p>\n')

			pageThree.body.Posts.should.have.length(10)
			pageThree.body.meta.should.have.property('nextPostsCount', 0)
			pageThree.body.Posts[0].should.have.property('content', '<p>POST 9</p>\n')
			pageThree.body.Posts[9].should.have.property('content', '<p>POST 0</p>\n')
			expect(pageThree.body.meta.nextURL).to.be.null
		})

		it('should get threads as well if threads query is appended', async () => {
			let agent = chai.request.agent(server)

			await agent
				.post('/api/v1/user')
				.set('content-type', 'application/x-www-form-urlencoded')
				.send({ username: 'threadaccount', password: 'password' })

			for(var i = 0; i < 20; i++) {
				let thread = await agent
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({ category: 'categorynamehere', name: 'THREAD ' + i })

				await agent
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({ threadId: thread.body.id, content: `POST ${i}` })
			}

			let pageOne = await agent.get('/api/v1/user/threadaccount?threads=true')

			//Add another newer thread
			//This should not affect other tests
			let thread = await agent
					.post('/api/v1/thread')
					.set('content-type', 'application/json')
					.send({ category: 'categorynamehere', name: 'THREAD 20'})

				await agent
					.post('/api/v1/post')
					.set('content-type', 'application/json')
					.send({ threadId: thread.body.id, content: `POST 20` })

			let pageTwo = await agent.get(pageOne.body.meta.nextURL)

			pageOne.body.Threads.should.have.length(10)
			pageOne.body.Threads[0].should.have.property('name', 'THREAD 19')
			pageOne.body.meta.should.have.property('nextThreadsCount', 10)

			pageTwo.body.Threads.should.have.length(10)
			pageTwo.body.Threads[0].should.have.property('name', 'THREAD 9')
			pageTwo.body.meta.should.have.property('nextThreadsCount', 0)
			expect(pageTwo.body.meta.nextURL).to.be.null
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

		describe('/:username PUT user', () => {
		let agent = chai.request.agent(server)

		before(async () => {
			await agent
				.post('/api/v1/user/adminaccount/login')
				.set('content-type', 'application/json')
				.send({
					password: 'password'
				})
		})

		it('should add user description if it doesn\'t already exist', async () => {
			let putRes = await agent
				.put('/api/v1/user/adminaccount')
				.set('content-type', 'application/json')
				.send({
					description: 'description here'
				})

			putRes.should.be.json
			putRes.body.should.have.property('success', true)

			let getRes = await agent.get('/api/v1/user/adminaccount')

			getRes.should.be.json
			getRes.body.should.have.property('description', 'description here')
			getRes.body.should.have.property('username', 'adminaccount')
			getRes.body.should.have.property('color')
		})
		it('should update user description if it already exists', async () => {
			let putRes = await agent
				.put('/api/v1/user/adminaccount')
				.set('content-type', 'application/json')
				.send({
					description: 'new description here'
				})

			putRes.should.be.json
			putRes.body.should.have.property('success', true)

			let getRes = await agent.get('/api/v1/user/adminaccount')

			getRes.should.be.json
			getRes.body.should.have.property('description', 'new description here')
		})
		it('should return an error if username is not logged in', done => {
			agent
				.put('/api/v1/user/notloggedin')
				.set('content-type', 'application/json')
				.send({
					description: 'new description here'
				})
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

					done()
				})
		})
		it('should return an error if description is not a string', done => {
			agent
				.put('/api/v1/user/adminaccount')
				.set('content-type', 'application/json')
				.send({
					description: 123
				})
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.deep.equals(Errors.invalidParameterType('description', 'string'))

					done()
				})
		})
		it('should return an error if description is too long', done => {
			let str = []
			for(var i = 0; i < 1025; i++) { str.push('a') }

			agent
				.put('/api/v1/user/adminaccount')
				.set('content-type', 'application/json')
				.send({
					description: str.join('')
				})
				.end((err, res) => {
					res.should.be.json
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.deep.equals(Errors.parameterLengthTooLarge('description', '1024'))

					done()
				})
		})

		it('should update user password', async () => {
			let passwordAgent = chai.request.agent(server)

			await passwordAgent
				.post('/api/v1/user/adminaccount/login')
				.set('content-type', 'application/json')
				.send({
					password: 'password'
				})

			let putRes = await passwordAgent
				.put('/api/v1/user/adminaccount')
				.set('content-type', 'application/json')
				.send({
					currentPassword: 'password',
					newPassword: 'qwertyuiop'
				})

			putRes.should.be.json
			putRes.body.should.have.property('success', true)

			await passwordAgent.post('/api/v1/user/adminaccount/logout')
			let loginRes = await passwordAgent
				.post('/api/v1/user/adminaccount/login')
				.set('content-type', 'application/json')
				.send({
					password: 'qwertyuiop'
				})

			loginRes.should.have.status(200)
			loginRes.should.be.json
			loginRes.should.have.cookie('username', 'adminaccount')
		})
		it('should return an error if username is not logged in', done => {
			agent
				.put('/api/v1/user/notloggedin')
				.set('content-type', 'application/json')
				.send({
					currentPassword: 'qwertyuiop',
					newPassword: 'azertyuiop'
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

					done()
				})
		})
		it('should return an error if current password is incorrect', done => {
			agent
				.put('/api/v1/user/adminaccount')
				.set('content-type', 'application/json')
				.send({
					currentPassword: 'nottheirpassword',
					newPassword: 'azertyuiop'
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.deep.equals(Errors.invalidLoginCredentials)

					done()
				})
		})
		it('should return an error if password is the same', done => {
			agent
				.put('/api/v1/user/adminaccount')
				.set('content-type', 'application/json')
				.send({
					currentPassword: 'qwertyuiop',
					newPassword: 'qwertyuiop'
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.deep.equals(Errors.passwordSame)

					done()
				})
		})
		it('should return an error if password is too short', done => {
			agent
				.put('/api/v1/user/adminaccount')
				.set('content-type', 'application/json')
				.send({
					currentPassword: 'qwertyuiop',
					newPassword: ''
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.deep.equals(Errors.parameterLengthTooSmall('new password', '7'))

					done()
				})
		})
		it('should return an error if password is too long', done => {
			let str = []
			for(var i = 0; i < 2000; i++) { str.push('a') }

			agent
				.put('/api/v1/user/adminaccount')
				.set('content-type', 'application/json')
				.send({
					currentPassword: 'qwertyuiop',
					newPassword: str.join('')
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.deep.equals(Errors.parameterLengthTooLarge('new password', '1024'))

					done()
				})
		})
		it('should return an error if missing currentPassword', done => {
			agent
				.put('/api/v1/user/adminaccount')
				.set('content-type', 'application/json')
				.send({
					newPassword: 'qwertyujkjnbgfdswazxcvbhytr'
				})
				.end((err, res) => {
					res.should.have.status(400)
					res.body.errors.should.contain.something.that.deep.equals(Errors.missingParameter('current password'))

					done()
				})
		})
	})
})