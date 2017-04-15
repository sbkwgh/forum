let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')
let { Notification } = require('../models')

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
				'$User.username$': req.session.username
			},
			include: [{
				model: 'MentionNotification',
				include: ['User', 'Post']
			}]
		})

		let unreadCount = notifications.reduce((acc, val) => {
			return val.read ? acc : acc+1
		}, 0)

		res.json({ Notifications, unreadCount })

	} catch (e) {
		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
	
})

router.put('/', async (req, res) => {
	try {
		await Notification.updateAll({ read: true }, {
			where: {
				'$User.username$': req.session.username,
				'read': false
			}
		})

		res.json({ success: true })

	} catch (e) {
		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
	
})

module.exports = router