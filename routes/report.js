let express = require('express')
let router = express.Router()

let { User, Post, Report, Sequelize } = require('../models')
const Errors = require('../lib/errors')

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
	try {
		let post = await Post.findById(req.body.postId)

		if(!post) {
			throw new Sequelize.ValidationError('Post id is not valid', [
				new Sequelize.ValidationErrorItem(
					'Post id is not valid',
					'Validation error',
					'postId',
					req.body.postId
				)
			])
		}

		let user = await User.findOne({
			where: { username: req.session.username }
		})

		let report = await Report.create({ reason: req.body.reason })
		report.setFlaggedByUser(user)
		report.setPost(post)

		res.json({
			success: true
		})
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
router.get('/', async (req, res) => {
	try {
		let reports = await Report.findAll({
			include: [
				{model: User, as: 'FlaggedByUser' },
				{ model: Post, include: Post.includeOptions() }
			]
		})

		res.json(reports)
	} catch (e) {
		console.log(e)

		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
})

module.exports = router