let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let { User, Thread, Category, Post } = require('../models')
let pagination = require('../lib/pagination.js')

router.get('/:thread_id', async (req, res) => {
	try {
		let { lastId, limit, previousId } = pagination.getPaginationProps(req.query)
		let thread, resThread

		if(+req.query.postId) {
			let findObj = {
				limit: Math.floor(limit / 2),
				order: [['id', 'ASC']],
				include: Post.includeOptions()
			}

			thread = await Thread.findById(req.params.thread_id, {
				include: [
					{ model: User, attributes: ['username', 'createdAt', 'color', 'updatedAt', 'id'] }, 
					Category,
				]
			})
			if(!thread) throw Errors.invalidParameter('id', 'thread does not exist')
			resThread = thread.toJSON()

			let postsAfter = await Post.findAll(Object.assign({}, findObj, {
				where: {
					id: { $gt: +req.query.postId },
					threadId: req.params.thread_id,
				},
			}))

			let postsBefore = await Post.findAll(Object.assign({}, findObj, {
				where: {
					id: { $lte: +req.query.postId },
					threadId: req.params.thread_id,
				},
				order: [['id', 'DESC']],
			}))

			resThread.Posts = postsBefore
				.concat(postsAfter)
				.map(p => p.toJSON())
				.sort((a, b) => a.id - b.id)

		} else {
			thread = await Thread.findById(req.params.thread_id, {
				include: Thread.includeOptions(lastId, limit, previousId)
			})

			if(!thread) throw Errors.invalidParameter('id', 'thread does not exist')
			resThread = thread.toJSON()

			if(previousId) {
				resThread.Posts = resThread.Posts.sort((a, b) => a.id - b.id)
			}
		}

		resThread.meta = {}
	
		let nextId = await pagination.getNextId(
			Post,
			{ threadId: +req.params.thread_id },
			resThread.Posts
		)

		let beforeId = await pagination.getPreviousId(
			Post,
			{ threadId: +req.params.thread_id },
			resThread.Posts,
			limit
		)

		if(nextId) {
			resThread.meta.nextURL =
				`/api/v1/thread/${thread.id}?limit=${limit}&lastId=${nextId}`
		} else {
			resThread.meta.nextURL = null
		}

		if(beforeId) {
			resThread.meta.previousURL =
				`/api/v1/thread/${thread.id}?limit=${limit}&previousId=${beforeId}`
		} else {
			resThread.meta.previousURL = null
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