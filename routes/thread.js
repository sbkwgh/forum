let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let { User, Thread, Category, Post, Ban, Report, Sequelize } = require('../models')
let pagination = require('../lib/pagination.js')

router.get('/:thread_id', async (req, res, next) => {
	try {
		let { from, limit } = pagination.getPaginationProps(req.query)
		let thread = await Thread.findById(req.params.thread_id, {
			include: Thread.includeOptions(from, limit)
		}) 
		if(!thread) throw Errors.invalidParameter('id', 'thread does not exist')
		
		let meta = thread.getMeta(limit)

		res.json(Object.assign( thread.toJSON(), { meta } ))
		
	} catch (e) { next(e) }
})

//Only logged in routes
router.all('*', (req, res, next) => {
	if(req.session.loggedIn) {
		next()
	} else {
		res.status(401)
		res.json({
			errors: [Errors.requestNotAuthorized]
		})
	}
})

router.post('/', async (req, res, next) => {
	let validationErrors = []

	try {
		await Ban.canCreateThreads(req.session.username)

		let category = await Category.findOne({ where: {
			value: req.body.category
		}})
		if(!category) throw Errors.invalidCategory

		let user = await User.findOne({ where: {
			username: req.session.username	
		}})


		let thread = await Thread.create({
			name: req.body.name
		})

		await thread.setCategory(category)
		await thread.setUser(user)

		res.json(await thread.reload({
			include: [
				{ model: User, attributes: ['username', 'createdAt', 'updatedAt', 'id'] }, 
				Category
			]
		}))

		req.app.get('io').to('index').emit('new thread', {
			name: category.name,
			value: category.value
		})

	} catch (e) { next(e) }
})

//Only admin routes
router.all('*', (req, res, next) => {
	if(req.session.admin) {
		next()
	} else {
		res.status(401)
		res.json({
			errors: [Errors.requestNotAuthorized]
		})
	}
})

router.delete('/:thread_id', async (req, res, next) => {
	try {
		let thread = await Thread.findById(req.params.thread_id)

		if(!thread) {
			throw Errors.sequelizeValidation(Sequelize, {
				error: 'invalid thread id',
				value: req.params.thread_id
			})
		} else {
			//Find all posts with reports and get reports
			//Then delete those reports
			//Temporary fix because cascade is not working
			let posts = await Post.findAll({
				where: {
					ThreadId: thread.id
				},
				include: [Report]
			})
			let reports = posts
				.map(post => post.Reports)
				.reduce((a, b) => a.concat(b), [])
			
			let destroyPromises = reports.map(report => report.destroy())

			await Promise.all(destroyPromises)
			await Post.destroy({ where: { ThreadId: thread.id } })
			await thread.destroy()

			res.json({ success: true })
		}
	} catch (e) { next(e) }
})

router.put('/:thread_id', async (req, res, next) => {
	try {
		let thread = await Thread.findById(req.params.thread_id)

		if(!thread) {
			res.status(400)
			res.json({ errors: 
				[Errors.invalidParameter('threadId', 'thread does not exist')]
			})
		} else {
			if(req.body.locked) {
				await thread.update({ locked: true })
			} else {
				await thread.update({ locked: false })
			}

			res.json({ success: true })
		}
	} catch (e) { next(e) }
})

module.exports = router