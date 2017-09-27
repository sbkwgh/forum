let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')
let { Settings, Sequelize } = require('../models')

router.get('/', async (req, res) => {
	try {
		let settings = await Settings.get()

		if(!settings) throw Errors.noSettings

		res.json(settings.toJSON())
	} catch (e) {
		if(e === Errors.noSettings) {
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

router.put('/', async (req, res) => {
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