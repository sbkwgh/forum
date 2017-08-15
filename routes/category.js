let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')
let pagination = require('../lib/pagination')
let { Category, Post, Thread, User, Sequelize } = require('../models')

router.get('/', async (req, res) => {
	try {
		let categories = await Category.findAll()

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
		let threads, threadsLatestPost, resThreads, user
		let { from, limit } = pagination.getPaginationProps(req.query, true)

		if(req.query.username) {
			user = await User.findOne({ where: { username: req.query.username }})
		}

		function threadInclude(order) {
			let options = {
				model: Thread,
				order: [['id', 'DESC']],
				limit,
				where: {},
				include: [
					Category,
					{ model: User, attributes: ['username', 'createdAt', 'id', 'color'] }, 
					{
						model: Post, limit: 1, order: [['id', order]], include:
						[{ model: User, attributes: ['username', 'id'] }]
					}
				]
			}

			if(user) {
				options.where.userId = user.id
			}

			if(from !== null) {
				options.where.id = { $lte: from }
			}

			return [options]
		}

		if(req.params.category === 'ALL') {
			threads = await Thread.findAll( threadInclude('ASC')[0] )
			threadsLatestPost = await Thread.findAll( threadInclude('DESC')[0] )
		} else {
			threads = await Category.findOne({
				where: { value: req.params.category },
				include: threadInclude('ASC')
			})

			threadsLatestPost = await Category.findOne({
				where: { value: req.params.category },
				include: threadInclude('DESC')
			})
		}

		if(!threads) throw Errors.invalidParameter('id', 'category does not exist')
		
		if(Array.isArray(threads)) {
			resThreads = {
				name: 'All',
				value: 'ALL',
				Threads: threads,
				meta: {}
			}

			threadsLatestPost = { Threads: threadsLatestPost }
		} else {
			resThreads = threads.toJSON()
			resThreads.meta = {}
		}

		threadsLatestPost.Threads.forEach((thread, i) => {
			let first = resThreads.Threads[i].Posts[0]
			let latest = thread.Posts[0]

			if(first.id === latest.id) return

			resThreads.Threads[i].Posts.push(latest)
		})


		let nextId = await pagination.getNextIdDesc(Thread, user ? { userId: user.id } : {}, resThreads.Threads)

		if(nextId) {
			resThreads.meta.nextURL =
				`/api/v1/category/${req.params.category}?&limit=${limit}&from=${nextId - 1}`

			if(user) {
				resThreads.meta.nextURL += '&username=' + user.username
			}

			resThreads.meta.nextThreadsCount = await pagination.getNextCount(
				Thread, resThreads.Threads, limit,
				user ? { userId: user.id } : {},
				true
			)
		} else {
			resThreads.meta.nextURL = null
			resThreads.meta.nextThreadsCount = 0
		}

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
	try {
		let category = await Category.create({
			name: req.body.name
		})

		res.json(category.toJSON())
	} catch (e) {
		if(e.name === 'SequelizeUniqueConstraintError') {
			res.status(400)
			res.json({
				errors: [Errors.categoryAlreadyExists]
			})
		} else if(e instanceof Sequelize.ValidationError) {
			res.status(400)
			res.json(e)
		} else {
			console.log(e)

			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

router.put('/:category_id', async (req, res) => {
	try {
		let id = req.params.category_id
		let obj = {}
		if(req.body.color) obj.color = req.body.color
		if(req.body.name) obj.name = req.body.name

		let affectedRows = await Category.update(obj, {
			where: { id }
		})


		if(!affectedRows[0]) {
			throw Errors.sequelizeValidation(Sequelize, {
				error: 'category id is not valid',
				value: id
			})
		} else {
			let ret = await Category.findById(id)
			res.json(ret.toJSON())
		}
	} catch(e) {
		if(e instanceof Sequelize.ValidationError) {
			res.status(400)
			res.json(e)
		} else {
			console.log(e)

			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

router.delete('/:id', async (req, res) => {
	try {
		let category = await Category.findById(req.params.id)
		if(!category) throw Errors.sequelizeValidation(Sequelize, {
			error: 'category id does not exist',
			value: req.params.id
		})

		let otherCategory = await Category.findOrCreate({
			where: { name: 'Other' },
			defaults: { color: '#9a9a9a' }
		})

		let up = await Thread.update({ CategoryId: otherCategory[0].id }, {
			where: { CategoryId: req.params.id }
		})

		await category.destroy()

		res.json({ success: true })
	} catch (e) {
		if(e instanceof Sequelize.ValidationError) {
			res.status(400)
			res.json(e)
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