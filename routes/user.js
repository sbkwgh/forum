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

			let meta = await user.getMeta(limit)

			res.json(Object.assign( user.toJSON(limit), { meta } ))
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
	try {
		let user = await User.findOne({ where: {
			username: req.params.username
		}})

		if(user) {
			if(await user.comparePassword(req.body.password)) {
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
		console.log(err)

		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
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
	try {
		if(req.session.username !== req.params.username) {
			throw Errors.requestNotAuthorized
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
		if(e.name in Errors) {
			res.status(400)
			res.json({ errors: [e] })
		} else {
			console.log(e)

			res.status(500)
			res.json({errors: Errors.unknown })
		}
	}
})

router.all('*', (req, res, next) => {
	if(req.session.admin) {
		next()
	} else {
		res.status(400)
		res.json({
			errors: [Errors.requestNotAuthorized]
		})
	}
})

router.put('/:username/permissions', async (req, res) => {
	try {
		let update = {}
		if(typeof req.body.canCreatePosts === 'boolean') {
			update.canCreatePosts = req.body.canCreatePosts
		}
		if(typeof req.body.canCreateThreads === 'boolean') {
			update.canCreateThreads = req.body.canCreateThreads
		}

		let affectedRows = await User.update(
			update,
			{ where: { username: req.params.username } }
		)

		//If the number of affected rows is 0
		//i.e. the username does not match any records
		if(!affectedRows[0]) { 
			throw Errors.sequelizeValidation(Sequelize, {
				error: 'user does not exist',
				value: req.params.username
			})
		} else {
			res.json({ success: true })
		}
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