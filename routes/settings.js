let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')
let { Settings } = require('../models')

router.get('/', async (req, res) => {
	try {
		let settings = await Settings.get()

		res.json(settings.toJSON())
	} catch (e) {
		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
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
	let validationErrors = []
	let params = {}

	try {
		if(req.body.forumName !== undefined) {
			if(typeof req.body.forumName !== 'string') {
				validationErrors.push(Errors.invalidParameterType('forumName', 'string'))
			} else {
				params.forumName = req.body.forumName
			}
		}
		if(req.body.forumDescription !== undefined) {
			if(typeof req.body.forumDescription !== 'string') {
				validationErrors.push(Errors.invalidParameterType('forumDescription', 'string'))
			} else {
				params.forumDescription = req.body.forumDescription
			}
		}
		
		if(validationErrors.length) throw Errors.VALIDAITON_ERROR

		let updatedSettings = await Settings.set(params)

		res.json({
			forumName: req.body.forumName,
			forumDescription: req.body.forumDescription
		})
		
	} catch (e) {
		if(e === Errors.VALIDAITON_ERROR) {
			res.status(400)
			res.json({
				errors: [validationErrors]
			})
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