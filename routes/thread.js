let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let { User, Thread, Category, Post } = require('../models')

router.get('/:thread_id', async (req, res) => {
	try {
		let lastId = 0
		let limit = 10

		if(+req.query.lastId > 0) lastId = +req.query.lastId
		if(+req.query.limit > 0) limit = +req.query.limit

		let thread = await Thread.findById(req.params.thread_id, {
			include: Thread.includeOptions(lastId, limit)
		})

		if(!thread) throw Errors.invalidParameter('id', 'thread does not exist')

		let maxId = await Post.max('id', { where: { threadId: +req.params.thread_id } })

		let resThread = thread.toJSON()
		let lastPost = thread.Posts.slice(-1)[0]
		resThread.meta = {}

		if(!lastPost || maxId === lastPost.id) {
			resThread.meta.nextURL = null
		} else {
			resThread.meta.nextURL =
				`/api/v1/thread/${thread.id}?limit=${limit}&lastId=${lastPost.id}`
		}

		res.json(resThread)
		
	} catch (e) {
		if(e.name === 'invalidParameter') {
			res.status(400)
			res.json({
				errors: [e]
			})
		} else {
			console.log(e)
			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

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

router.post('/', async (req, res) => {
	let validationErrors = []

	try {

		if(req.body.name === undefined) {
			validationErrors.push(Errors.missingParameter('name'))
		} else if(typeof req.body.name !== 'string') {
			validationErrors.push(Errors.invalidParameterType('name', 'string'))
		}

		if(req.body.category === undefined) {
			validationErrors.push(Errors.missingParameter('category'))
		} else if(typeof req.body.category !== 'string') {
			validationErrors.push(Errors.invalidParameterType('category', 'string'))
		}

		if(validationErrors.length) throw Errors.VALIDATION_ERROR

		let category = await Category.findOne({ where: {
			name: req.body.category
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

	} catch (e) {
		if(e === Errors.VALIDATION_ERROR) {
			res.status(400)
			res.json({
				errors: validationErrors
			})
		} else if(e === Errors.invalidCategory) {
			res.status(400)
			res.json({
				errors: [Errors.invalidCategory]
			})
		} else {
			console.log(e)
			res.status(500)
			res.json({
				errors: [Errors.unknown]
			}) 
		}
	}
})

module.exports = router