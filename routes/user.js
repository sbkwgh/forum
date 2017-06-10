let bcrypt = require('bcryptjs')
let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let { User, Post, AdminToken, Thread, Category, Sequelize } = require('../models')
let pagination = require('../lib/pagination.js')

function setUserSession(req, res, username, UserId, admin) {
	req.session.loggedIn = true
	req.session.username = username
	req.session.UserId = UserId

	res.cookie('username', username)
	//Not for security purposes, just so client side can determine
	//to show certain parts of ui or not (i.e. could trivially be spoofed
	//but the server would not accept any api requests)
	res.cookie('admin', !!admin)

	if(admin) { req.session.admin = true }
}
router.post('/', async (req, res) => {
	try {
		let userParams = {
			username: req.body.username,
			hash: req.body.password,
			admin: false
		}

		if(req.body.admin && await User.canBeAdmin(req.body.token)) {
			userParams.admin = true
		}

		let user = await User.create(userParams)

		setUserSession(req, res, user.username, user.id, userParams.admin)
		res.json(user.toJSON())
	} catch (e) {
		if(e instanceof Sequelize.ValidationError) {
			res.status(400)
			res.json(e)
		} else if (e.name in Errors) {
			res.status(401)
			res.json({
				errors: [e]
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
				setUserSession(req, res, user.username, user.id, user.admin)

				res.json({
					username: user.username,
					admin: user.admin,
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
	req.session.destroy(() => {
		res.clearCookie('username')
		res.clearCookie('admin')
		res.json({
			success: true
		})
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
	try {
		if(req.session.username !== req.params.username) {
			throw Errors.requestNotAuthorized
		}

		if(req.body.description !== undefined) {
			let user = await User.update({ description: req.body.description }, { where: {
				username: req.session.username
			}})

			res.json({ success: true })

		} else if(
			req.body.currentPassword !== undefined &&
			req.body.newPassword !== undefined
		) {
			let user = await User.findOne({where: {
				username: req.session.username
			}})

			await user.updatePassword(req.body.currentPassword, req.body.newPassword)
			res.json({ success: true })

		} else {
			res.json({ success: false })
		}
	} catch (e) {
		if(e.name in Errors) {
			res.status(400)
			res.json({ errors: [e] })
		} else if(e instanceof Sequelize.ValidationError) {
			res.status(400)
			res.json(e)
		} else {
			console.log(e)

			res.status(500)
			res.json({errors: Errors.unknown })
		}
	}
})

router.delete('/:username', async (req, res) => {
	let validationErrors = []

	try {
		if(req.session.username !== req.params.username) {
			validationErrors.push(Errors.requestNotAuthorized)
			throw validationErrors
		}

		let user = await User.findOne({ where: {
			username: req.session.username
		}})

		await user.destroy()

		req.session.destroy(() => {
			res.clearCookie('username')
			res.clearCookie('admin')
			res.json({ success: true })
		})

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