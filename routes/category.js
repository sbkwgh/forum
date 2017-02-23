let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')
let { Category } = require('../models')

router.get('/', async (req, res) => {
	try {
		let categories = await Category.findAll({
			attributes: { exclude: ['id'] }
		})

		res.json(categories)
	} catch (e) {
		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
	
})

router.all('*', (req, res, next) => {
	if(!req.session.loggedIn || !req.session.admin) {
		res.status(401)
		res.json({
			errors: [Errors.requestNotAuthorized]
		})
	} else {
		next()
	}
})

router.post('/', async (req, res) => {
	let validationErrors = []

	try {
		if(req.body.name === undefined) {
			validationErrors.push(Errors.missingParameter('name'))
		} else if(typeof req.body.name !== 'string') {
			validationErrors.push(Errors.invalidParameterType('name', 'string'))
		} else if(!req.body.name.length) {
			validationErrors.push(Errors.parameterLengthTooSmall('name', '0'))
		}

		if(validationErrors.length) throw Errors.VALIDAITON_ERROR

		let category = await Category.create({
			name: req.body.name
		})

		res.json(category.toJSON())
	} catch (e) {
		if(e === Errors.VALIDAITON_ERROR) {
			res.status(400)
			res.json({
				errors: validationErrors
			})
		} else if(e.name === 'SequelizeUniqueConstraintError') {
			res.status(400)
			res.json({
				errors: [Errors.categoryAlreadyExists]
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