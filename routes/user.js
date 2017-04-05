let bcrypt = require('bcryptjs')
let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let { User, Post, AdminToken, Thread, Category } = require('../models')
let pagination = require('../lib/pagination.js')

function setUserSession(req, res, username, admin) {
	req.session.loggedIn = true
	req.session.username = username
	res.cookie('username', username)
	if(admin) req.session.admin = true
}
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

		setUserSession(req, res, user.username, userParams.admin)

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
			console.log(e)
			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

router.get('/:username', async (req, res) => {
	try {
		let queryObj = {
			attributes: { exclude: ['hash', 'id'] },
			where: { username: req.params.username }
		}

		if(req.query.posts) {
			
			let { from, limit } = pagination.getPaginationProps(req.query, true)

			let postInclude = {
				model: Post,
				include: Post.includeOptions(),
				limit,
				order: [['id', 'DESC']]
			}
			if(from !== null) {
				postInclude.where = { id: { $lte: from } }
			}
			queryObj.include = [postInclude]

			let user = await User.findOne(queryObj)
			if(!user) throw Errors.accountDoesNotExist

			let resUser = user.toJSON()
			resUser.meta = {}

			let nextId = await pagination.getNextIdDesc(Post, { userId: user.id }, resUser.Posts)

			if(nextId === null) {
				resUser.meta.nextURL = null
				resUser.meta.nextPostsCount = 0
			} else {
				resUser.meta.nextURL =
					`/api/v1/user/${user.username}?posts=true&limit=${limit}&from=${nextId - 1}`

				resUser.meta.nextPostsCount = await pagination.getNextCount(
					Post, resUser.Posts, limit,
					{ UserId: user.id },
					true
				)
			}

			res.json(resUser)
		} else if(req.query.threads) {
			let queryString = ''

			Object.keys(req.query).forEach(query => {
				queryString += `&${query}=${req.query[query]}`
			})

			res.redirect('/api/v1/category/ALL?username=' + req.params.username + queryString)
		} else {
			let user = await User.findOne(queryObj)
			if(!user) throw Errors.accountDoesNotExist

			res.json(user.toJSON())
		}

		
	} catch (err) {
		if(err === Errors.accountDoesNotExist) {
			res.status(400)
			res.json({ errors: [err] })
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
				setUserSession(req, res, user.username, user.admin)

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
	res.clearCookie('username')
	
	res.json({
		success: true
	})
})

router.all('*', (req, res, next) => {
	if(req.session.username) {
		next()
	} else {
		res.status(401)
		res.json({
			errors: [Errors.requestNotAuthorized]
		})
	}
})

router.put('/:username', async (req, res) => {
	let validationErrors = []

	try {
		if(req.session.username !== req.params.username) {
			validationErrors.push(Errors.requestNotAuthorized)
			throw validationErrors
		}


		if(req.body.description) {
			if(typeof req.body.description !== 'string') {
				validationErrors.push(Errors.invalidParameterType('description', 'string'))
			} else if(req.body.description.length > 1024) {
				validationErrors.push(Errors.parameterLengthTooLarge('description', 1024))
			}

			if(validationErrors.length) throw validationErrors

			let user = await User.update({ description: req.body.description }, { where: {
				username: req.session.username
			}})

			res.json({ success: true })

		} else if(req.body.newPassword) {
			res.json({})
		}
	} catch (e) {
		if(validationErrors.length) {
			res.status(400)
			res.json({ errors: validationErrors })
		} else {
			console.log(e)

			res.status(500)
			res.json({errors: Errors.unknown })
		}
	}
})

module.exports = router