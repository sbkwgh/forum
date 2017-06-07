let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let { User, Thread, Category, Post } = require('../models')
let pagination = require('../lib/pagination.js')

router.get('/:thread_id', async (req, res) => {
	try {
		let { from, limit } = pagination.getPaginationProps(req.query)
		let thread = await Thread.findById(req.params.thread_id, {
			include: Thread.includeOptions(from, limit)
		}) 
		if(!thread) throw Errors.invalidParameter('id', 'thread does not exist')
		
		let meta = await thread.getMeta(limit, thread.Posts)

		res.json(Object.assign( thread.toJSON(), { meta } ))
		
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

router.post('/', async (req, res) => {
	let validationErrors = []

	try {

		if(req.body.name === undefined) {
			validationErrors.push(Errors.missingParameter('name'))
		} else if(typeof req.body.name !== 'string') {
			validationErrors.push(Errors.invalidParameterType('name', 'string'))
		} else if(req.body.name.length === 0) {
			validationErrors.push(Errors.missingParameter('name'))
		}

		if(req.body.category === undefined) {
			validationErrors.push(Errors.missingParameter('category'))
		} else if(typeof req.body.category !== 'string') {
			validationErrors.push(Errors.invalidParameterType('category', 'string'))
		}

		if(validationErrors.length) throw Errors.VALIDATION_ERROR

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

router.put('/:thread_id', async (req, res) => {
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
	} catch (e) {
		console.log(e)
		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
})

module.exports = router