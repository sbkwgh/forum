let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')
let { Category, Post } = require('../models')

router.get('/', async (req, res) => {
	try {
		let categories = await Category.findAll({
			attributes: { exclude: ['id'] },
			include: Category.includeOptions('ASC', 1)
		})

		res.json(categories)
	} catch (e) {
		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
	
})


router.get('/:category', async (req, res) => {
	try {
		let threads, threadsLatestPost, resThreads

		function concatenateThreads(threads) {
			let processedThreads = []
			
			threads.forEach(category => {
				let jsonCategory = category.toJSON()
				processedThreads.push(...jsonCategory.Threads)
			})

			return processedThreads
		}

		if(req.params.category === 'ALL') {
			threads = await Category.findAll({ include: Category.includeOptions('ASC') })
			threadsLatestPost = await Category.findAll({ include: Category.includeOptions('DESC') })

		} else {
			threads = await Category.findOne({
				where: { name: req.params.category },
				include: Category.includeOptions('ASC')
			})

			threadsLatestPost = await Category.findOne({
				where: { name: req.params.category },
				include: Category.includeOptions('DESC')
			})
		}

		if(!threads) throw Errors.invalidParameter('id', 'thread does not exist')
		
		if(Array.isArray(threads)) {
			resThreads = {
				name: 'All',
				value: 'ALL',
				Threads: concatenateThreads(threads)
			}

			threadsLatestPost = { Threads: concatenateThreads(threadsLatestPost) }
		} else {
			resThreads = threads.toJSON()
		}

		threadsLatestPost.Threads.forEach((thread, i) => {
			let first = resThreads.Threads[i].Posts[0]
			let latest = thread.Posts[0]

			if(first.id === latest.id) return

			resThreads.Threads[i].Posts.push(latest)
		})

		res.json(resThreads)

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
	if(!req.session.loggedIn || !req.session.admin) {
		res.status(401)
		res.json({
			errors: [Errors.requestNotAuthorized]
		})
	} else {
		next()
	}
})

router.post('/', async (req, res) => {
	let validationErrors = []

	try {
		if(req.body.name === undefined) {
			validationErrors.push(Errors.missingParameter('name'))
		} else if(typeof req.body.name !== 'string') {
			validationErrors.push(Errors.invalidParameterType('name', 'string'))
		} else if(!req.body.name.length) {
			validationErrors.push(Errors.parameterLengthTooSmall('name', '0'))
		}

		if(validationErrors.length) throw Errors.VALIDAITON_ERROR

		let category = await Category.create({
			name: req.body.name
		})

		res.json(category.toJSON())
	} catch (e) {
		if(e === Errors.VALIDAITON_ERROR) {
			res.status(400)
			res.json({
				errors: validationErrors
			})
		} else if(e.name === 'SequelizeUniqueConstraintError') {
			res.status(400)
			res.json({
				errors: [Errors.categoryAlreadyExists]
			})
		} else {
			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

module.exports = router