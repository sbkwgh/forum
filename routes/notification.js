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
		
	} catch (e) {
		if(e) {
			res.status(500)
			res.json({
				errors: [e]
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