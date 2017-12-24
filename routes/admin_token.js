let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let AdminToken = require('../models').AdminToken

router.post('/', async (req, res, next) => {
	try {
		if(!req.session.loggedIn && !req.session.admin) {
			throw Errors.requestNotAuthorized
		} else {
			let token = await AdminToken.create()

			res.json(token.toJSON())
		}
	} catch (err) { next(err) }
})

module.exports = router