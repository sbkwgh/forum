let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let { User, Thread, Category, Post } = require('../models')
let pagination = require('../lib/pagination.js')

router.get('/:thread_id', async (req, res) => {
	try {
		let { from, limit } = pagination.getPaginationProps(req.query)
		let thread, resThread
	
		thread = await Thread.findById(req.params.thread_id, {
			include: Thread.includeOptions(from, limit)
		})

		if(!thread) throw Errors.invalidParameter('id', 'thread does not exist')
		resThread = thread.toJSON()

		resThread.meta = {}
	
		let lastPost = thread.Posts.slice(-1)[0]
		let firstPost = thread.Posts[0]

		if(!lastPost || lastPost.postNumber+1 === thread.postsCount) {
			resThread.meta.nextURL = null
		} else {
			resThread.meta.nextURL =
				`/api/v1/thread/${thread.id}?limit=${limit}&from=${lastPost.postNumber + 1}`
		}

		if(!firstPost || firstPost.postNumber === 0) {
			resThread.meta.previousURL = null
		} else if(firstPost.postNumber - limit < 0) {
			resThread.meta.previousURL =
				`/api/v1/thread/${thread.id}?limit=${firstPost.postNumber}&from=0`
		} else {
			resThread.meta.previousURL =
				`/api/v1/thread/${thread.id}?limit=${limit}&from=${firstPost.postNumber - limit}`
		}

		if(lastPost === undefined) {
			resThread.meta.postsRemaining = 0
			resThread.meta.nextPostsCount = 0
			resThread.meta.previousPostsCount = 0
		} else {
			resThread.meta.postsRemaining =
				resThread.postsCount - lastPost.postNumber - 1

			if(resThread.meta.postsRemaining < limit) {
				resThread.meta.nextPostsCount = resThread.meta.postsRemaining
			} else {
				resThread.meta.nextPostsCount = limit
			}

			if(firstPost.postNumber === 0) {
				resThread.meta.previousPostsCount = 0
			} else if(firstPost.postNumber - limit < 0) {
				resThread.meta.previousPostsCount = firstPost.postNumber
			} else {
				resThread.meta.previousPostsCount = limit
			}
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

		req.app.get('io').emit('new thread', {
			category: category.name
		})

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