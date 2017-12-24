let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')
let { Settings, Sequelize } = require('../models')

router.get('/', async (req, res, next) => {
	try {
		let settings = await Settings.get()

		if(!settings) throw Errors.noSettings

		res.json(settings.toJSON())
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

router.put('/', async (req, res, next) => {
	try {
		let params = {}

		if(req.body.forumName) {
			params.forumName = req.body.forumName
		}
		if(req.body.forumDescription !== undefined) {
			params.forumDescription = req.body.forumDescription
		}
		if(req.body.showDescription !== undefined) {
			params.showDescription = req.body.showDescription
		}

		let updatedSettings = await Settings.set(params)

		res.json(params)
		
	} catch (e) { next(e) }
})

module.exports = router