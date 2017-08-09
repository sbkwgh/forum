let express = require('express')
let router = express.Router()

let { User, Ban, Sequelize } = require('../models')
const Errors = require('../lib/errors')

router.all('*', (req, res, next) => {
	if(req.session.admin) {
		next()
	} else {
		res.status(400)
		res.json({
			errors: [Errors.requestNotAuthorized]
		})
	}
})

router.post('/', async (req, res) => {
	try {
		let user = await User.findOne({ where: { username: req.body.username } })
		if(!user) throw Errors.sequelizeValidation(Sequelize, {
			error: 'user does not exist',
			value: req.body.userId
		})

		let ban = await Ban.create({
			message: req.body.message,
			canCreateThreads: req.body.canCreateThreads,
			canCreatePosts: req.body.canCreatePosts
		})
		await ban.setUser(user)

		let ret = await ban.reload({
			include: [{
				model: User,
				attributes: ['username', 'description', 'color', 'createdAt']
			}]
		})
		
		res.json(ret.toJSON())
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

router.get('/', async (req, res) => {
	try {
		let bans = await Ban.findAll({
			include: [User]
		})

		res.json(bans.map(b => b.toJSON()))
	} catch (e) {
		console.log(e)

		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
})

router.delete('/:ban_id', async (req, res) => {
	try {
		let ban = await Ban.findById(req.params.ban_id)
		if(!ban) throw Errors.sequelizeValidation(Sequelize, {
			error: 'ban does not exist',
			value: req.body.userId
		})

		await ban.destroy()
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