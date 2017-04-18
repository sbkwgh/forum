let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')
let { Notification, User, Post, PostNotification } = require('../models')

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

router.get('/', async (req, res) => {
	try {
		let Notifications = await Notification.findAll({
			where: {
				'UserId': req.session.UserId
			},
			order: [['id', 'DESC']],
			include: [{
				model: PostNotification,
				include: [Post, { model: User, attributes: ['createdAt', 'username', 'color'] }]
			}]
		})

		let unreadCount = Notifications.reduce((acc, val) => {
			return val.read ? acc : acc+1
		}, 0)

		res.json({ Notifications, unreadCount })

	} catch (e) {
		console.log(e)

		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
	
})

router.put('/', async (req, res) => {
	try {
		await Notification.update({ read: true }, {
			where: {
				'UserId': req.session.UserId,
				'read': false
			}
		})

		res.json({ success: true })

	} catch (e) {
		console.log(e)

		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
	
})

router.put('/:id', async (req, res) => {
	try {
		let updatedRows = await Notification.update({ interacted: true, read: true }, {
			where: {
				'UserId': req.session.UserId,
				id: req.params.id
			}
		})

		if(updatedRows[0] === 0) {
			res.status(400)
			res.json({
				errors: [Errors.invalidParameter('id', 'invalid notification id')]
			})
		} else {
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

router.delete('/:id', async (req, res) => {
	try {
		let deleted = await Notification.destroy({
			where: {
				'UserId': req.session.UserId,
				id: req.params.id
			}
		})

		if(deleted) {
			res.json({ success: true })
		} else {
			res.status(400)
			res.json({
				errors: [Errors.invalidParameter('id', 'invalid notification id')]
			})
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