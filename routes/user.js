let bcrypt = require('bcryptjs')
let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let Models = require('../models')
let User = Models.User
let AdminToken = Models.AdminToken

router.post('/', async (req, res) => {
	let user, adminUser, hash, token
	let validationErrors = []
	let userParams = {}

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

		if(req.body.token !== undefined && typeof req.body.token !== 'string') {
			validationErrors.push(Errors.invalidParameterType('token', 'string'))
		}
		if(req.body.admin !== undefined && typeof req.body.admin !== 'boolean') {
			validationErrors.push(Errors.invalidParameterType('admin', 'boolean'))
		}

		if(validationErrors.length) throw Errors.VALIDATION_ERROR

		if(req.body.admin && !req.body.token) {
			adminUser = await User.findOne({ where: {
				admin: true
			}})

			if(adminUser) {
				validationErrors.push(Errors.missingParameter('token'))
				throw Errors.VALIDATION_ERROR
			} else {
				
				userParams.admin = true
			}
		} else if(req.body.admin && req.body.token) {
			token = await AdminToken.findOne({ where: {
				token: req.body.token
			}})

			if(token && token.isValid()) {
				userParams.admin = true
			} else {
				throw Errors.invalidToken
			}
		}

		hash = await bcrypt.hash(req.body.password, 12)

		userParams.username = req.body.username
		userParams.hash = hash
		user = await User.create(userParams)

		if(req.body.token) {
			await token.destroy()
		}

		req.session.loggedIn = true
		req.session.username = user.username
		if(userParams.admin) req.session.admin = true

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
		} else if (err = Errors.invalidToken) {
			res.status(401)
			res.json({
				errors: [Errors.invalidToken]
			})
		} else {
			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

router.get('/:username', async (req, res) => {
	try {
		if(
			!req.session.loggedIn ||
			req.session.username !== req.params.username
		) {
			throw Errors.requestNotAuthorized
		}

		let user = await User.findOne({
			attributes: { exclude: ['hash', 'id'] },
			where: { username: req.params.username }
		})

		res.json(user.toJSON())
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

router.post('/:username/login', async (req, res) => {
	let user, bcryptRes, validationErrors = []

	try {
		//Validations
		if(req.body.password === undefined) {
			validationErrors.push(Errors.missingParameter('password'))
		} else if(typeof req.body.password !== 'string') {
			validationErrors.push(Errors.invalidParameterType('password', 'string'))
		}

		if(validationErrors.length) throw Errors.VALIDATION_ERROR

		user = await User.findOne({
			where: {
				username: req.params.username,
			}
		})

		if(user) {
			bcryptRes = await bcrypt.compare(req.body.password, user.hash)

			if(bcryptRes) {
				req.session.loggedIn = true
				req.session.username = user.username

				if(user.admin) req.session.admin = true

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

router.post('/:username/logout', async (req, res) => {
	req.session = null
	
	res.json({
		success: true
	})
})

module.exports = router