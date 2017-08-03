let express = require('express')
let router = express.Router()

let { User, Post, Report } = require('../models')
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
router.post('/', async (req, res) => {})

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
router.get('/', async (req, res) => {})

module.exports = router