let bcrypt = require('bcryptjs')
let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let User = require('../models').User

router.post('/', async (req, res) => {
	let user, hash, validationErrors = [];

	try {
		//Validations
		if(req.body.username === undefined) {
			validationErrors.push(Errors.missingParameter('username'))
		} else {
			if(typeof req.body.username !== 'string') {
				validationErrors.push(Errors.invalidParameterType('username', 'string'))
			} if(req.body.username.length < 6) {
				validationErrors.push(Errors.parameterLengthTooSmall('username', 6))
			} if(req.body.username.length > 50) {
				validationErrors.push(Errors.parameterLengthTooLarge('username', 50))
			}
		}

		if(req.body.password === undefined) {
			validationErrors.push(Errors.missingParameter('password'))
		} else {
			if(typeof req.body.password !== 'string') {
				validationErrors.push(Errors.invalidParameterType('password', 'string'))
			} if(req.body.password.length < 6) {
				validationErrors.push(Errors.parameterLengthTooSmall('password', 6))
			} if(req.body.password.length > 100) {
				validationErrors.push(Errors.parameterLengthTooLarge('password', 100))
			}
		}

		if(validationErrors.length) throw Errors.VALIDATION_ERROR

		hash = await bcrypt.hash(req.body.password, 12)

		user = await User.create({
			username: req.body.username,
			hash: hash
		})

		res.json(user.toJSON())
	} catch (err) {
		if(err === Errors.VALIDATION_ERROR) {
			res.status(400)
			res.json({
				errors: validationErrors
			})
		} else if(err.name === 'SequelizeUniqueConstraintError') {
			res.status(400)
			res.json({
				errors: [Errors.accountAlreadyCreated]
			})
		} else {
			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

router.post('/login', async (req, res) => {
	let user, bcryptRes, validationErrors = []

	try {
		//Validations
		if(req.body.username === undefined) {
			validationErrors.push(Errors.missingParameter('username'))
		} else if(typeof req.body.username !== 'string') {
			validationErrors.push(Errors.invalidParameterType('username', 'string'))
		}

		if(req.body.password === undefined) {
			validationErrors.push(Errors.missingParameter('password'))
		} else if(typeof req.body.password !== 'string') {
			validationErrors.push(Errors.invalidParameterType('password', 'string'))
		}

		if(validationErrors.length) throw Errors.VALIDATION_ERROR

		user = await User.findOne({
			where: {
				username: req.body.username,
			}
		})

		if(user) {
			bcryptRes = await bcrypt.compare(req.body.password, user.hash)

			if(bcryptRes) {
				req.session.loggedIn = true;
				res.json({
					username: user.username,
					success: true
				})
			} else {
				res.status(401)
				res.json({
					errors: [Errors.invalidLoginCredentials]
				})
			}
		} else {
			res.status(401)
			res.json({
				errors: [Errors.invalidLoginCredentials]
			})
		}

	} catch (err) {
		if(err === Errors.VALIDATION_ERROR) {
			res.status(400)
			res.json({
				errors: validationErrors
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

router.post('/logout', async (req, res) => {
	req.session.loggedIn = false;
	res.json({
		success: true
	})
})

module.exports = router