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
router.post('/', async (req, res, next) => {
	try {
		let post = await Post.findById(req.body.postId)

		if(!post) throw Report.InvalidPostId(req.body.postId)

		let user = await User.findOne({
			where: { username: req.session.username }
		})

		let report = await Report.create({ reason: req.body.reason })
		report.setFlaggedByUser(user)
		report.setPost(post)

		res.json({
			success: true
		})
	} catch (e) { next(e) }
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
router.get('/', async (req, res, next) => {
	try {
		let reports = await Report.findAll({
			include: [
				{model: User, as: 'FlaggedByUser' },
				{ model: Post, include: Post.includeOptions() }
			]
		})

		res.json(reports)
	} catch (e) { next(e) }
})
router.delete('/:id', async (req, res, next) => {
	try {
		let report = await Report.findById(req.params.id)
		if(!report) throw Report.InvalidPostId(req.params.id)

		await report.destroy()
		res.json({ success: true })
	} catch (e) { next(e) }
})

module.exports = router