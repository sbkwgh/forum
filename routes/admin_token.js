let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let AdminToken = require('../models').AdminToken

router.post('/', async (req, res) => {
	try {
		if(!req.session.loggedIn && !req.session.admin) {
			throw Errors.requestNotAuthorized
		} else {
			let token = await AdminToken.create()

			res.json(token.toJSON())
		}
	} catch (err) {
		if(err === Errors.requestNotAuthorized) {
			res.status(403)
			res.json({
				errors: [Errors.requestNotAuthorized]
			})
		} else {
			console.log(err)

			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

module.exports = router