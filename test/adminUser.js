process.env.NODE_ENV = 'test'

let chai = require('chai')
let server = require('../server')
let should = chai.should()
let expect = chai.expect

let { sequelize, User, Category, Thread, Post} = require('../models')
const Errors = require('../lib/errors.js')

chai.use(require('chai-http'))
chai.use(require('chai-things'))

describe('GET /user', () => {
	let adminAgent = chai.request.agent(server)

	//Wait for app to start before commencing
	before((done) => {
		const NumUsers = 65;
		const NumThreads = 5;
		const NumPosts = 30;

		async function createUsers () {
			let userPromises = [];

			userPromises.push(
				adminAgent
					.post('/api/v1/user')
					.set('content-type', 'application/json')
					.send({
						username: 'adminuser',
						password: 'password',
						admin: true
					})
			)

			for(let i = 0; i < NumUsers; i++) {
				let promise = chai.request(server)
					.post('/api/v1/user')
					.set('content-type', 'application/json')
					.send({
						username: 'username' + i,
						password: 'password',
						admin: false
					})

				userPromises.push(promise)
			}

			let users = await Promise.all(userPromises);

			return users;
		}

		function createCategory  () {
			return adminAgent
				.post('/api/v1/category')
				.set('content-type', 'application/json')
				.send({ name: 'category-name' })
		}

		async function getUserAgents () {
			let agents = [];
			for(let i = 0; i < 5; i++) {
				agents.push(chai.request.agent(server))
			}

			let agentPromises = agents.map((agent, i) => {
				let username = 'username' + i;

				return agent
					.post('/api/v1/user/' + username + '/login')
					.set('content-type', 'application/json')
					.send({
						username: username,
						password: 'password',
					});
			});
			await Promise.all(agentPromises);

			return agents;
		}

		async function createThreads (agents) {
			let threadPromises = [];

			for(let i = 0; i < NumThreads; i++) {
				let agent = agents[i % agents.length];

				threadPromises.push(
					agent
						.post('/api/v1/thread')
						.set('content-type', 'application/json')
						.send({ name: 'thread' + i, category: 'category-name' })
				);
			}
			await Promise.all(threadPromises);

			return agents;
		}

		async function createPosts (agents) {
			let postPromises = [];
			for(let i = 0; i < NumPosts; i++) {
				postPromises.push(
					agents[i%agents.length]
						.post('/api/v1/post')
						.set('content-type', 'application/json')
						.send({ content: 'post', threadId: i%NumThreads+1 })
				);
			}
			await Promise.all(postPromises);

			return agents;
		}

		function createMockData () {
			createUsers()
				.then(createCategory)
				.then(getUserAgents)
				.then(createThreads)
				.then(createPosts)
				.then(_ => {
					console.log('Completed');
					done();
				})
				.catch(err => {
				console.log(err);
					done(err);
				})
		}

		if(server.locals.appStarted) createMockData()
		server.on('appStarted', () => {
			createMockData()
		})
	})

	//Delete all rows in table after
	//tests completed
	after(() => sequelize.sync({ force: true }) )

	it('should get first 30 users, by default ordered by username descending', (done) => {
		adminAgent.get('/api/v1/user?role=admin').end((err, res) => {
			if(err) done(err);

			console.log(res.body)

			res.body.should.have.length(30);
			res.body[0].id.should.equal(65);
			//res.body[0].postsCount.should.equal(2);
			//res.body[0].threadsCount.should.equal(1);

			res.body[29].id.should.equal(36);

			done();
		});
	})
	/*it('should paginate correctly', (done) => {
		adminAgent.get('/api/v1/user?offset=60').end((err, res) => {
			if(err) done(err);

			res.body.should.have.length(30);
			res.body[0].username.should.equal('username60');
			res.body[0].postsCount.should.equal(0);
			res.body[0].threadsCount.should.equal(0);

			res.body[29].username.should.equal('username64');

			done();
		});
	})
	it('should enable sorting by username ascending', (done) => {
		adminAgent.get('/api/v1/user?sort=username&order=asc').end((err, res) => {
			if(err) done(err);

			res.body.should.have.length(30);
			res.body[0].username.should.equal('username64');
			res.body[29].username.should.equal('username44');

			done();
		});
	})
	it('should enable filtering by username', (done) => {
		adminAgent.get('/api/v1/user', (err, res) => {
			res.body.should.contain
		});
	})
	it('should enable filtering by role (admin or user)', (done) => {
		adminAgent.get('/api/v1/user?role=admin').end((err, res) => {
			if(err) done(err);

			res.body.should.have.length(1);
			res.body[0].username.should.equal('admin123');

			done();
		});
	})
	it('should enable sorting by date joined', (done) => {
		adminAgent.get('/api/v1/user', (err, res) => {
			res.body.should.contain
		});
	})
	it('should enable sorting by number of posts', (done) => {
		adminAgent.get('/api/v1/user?sort=posts&order=asc').end((err, res) => {
			if(err) done(err);

			res.body.should.have.length(30);
			res.body[0].username.should.equal('username0');
			res.body[29].username.should.equal('username28');

			done();
		});
	})
	it('should enable sorting by number of threads', (done) => {
		adminAgent.get('/api/v1/user?sort=threads&order=asc').end((err, res) => {
			if(err) done(err);

			res.body.should.have.length(30);
			res.body[0].username.should.equal('username0');
			res.body[29].username.should.equal('username28');

			done();
		});
	})
	it('should throw an error if not logged in', (done) => {
		adminAgent.get('/api/v1/user').end((err, res) => {
			expect(err).to.exist;
			res.body.errors.should.contain.something.that.deep.equals(Errors.requestNotAuthorized)

			done();
		});
	})*/
})