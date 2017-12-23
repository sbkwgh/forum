let bcrypt = require('bcryptjs')
let multer = require('multer')
let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors.js')
let {
	User, Post, ProfilePicture, AdminToken, Thread, Category, Sequelize, Ip, Ban
} = require('../models')
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
router.post('/', async (req, res, next) => {
	try {
		await Ban.isIpBanned(req.ip)

		let userParams = {
			username: req.body.username,
			hash: req.body.password,
			admin: false
		}

		if(req.body.admin && await User.canBeAdmin(req.body.token)) {
			userParams.admin = true
		}

		let user = await User.create(userParams)
		await Ip.createIfNotExists(req.ip, user)

		setUserSession(req, res, user.username, user.id, userParams.admin)
		res.json(user.toJSON())
	} catch (e) { next(e) }
})

router.get('/:username', async (req, res, next) => {
	try {
		let queryObj = {
			attributes: { exclude: ['hash'] },
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

		
	} catch (err) { next(err) }
})

router.post('/:username/login', async (req, res, next) => {
	try {
		await Ban.isIpBanned(req.ip, req.params.username)

		let user = await User.findOne({ where: {
			username: req.params.username
		}})

		if(user) {
			if(await user.comparePassword(req.body.password)) {
				await Ip.createIfNotExists(req.ip, user)

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

	} catch (err) { next(err) }
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

router.get('/:username/picture', async (req, res, next) => {
	try {
		let user = await User.findOne({
			where: {
				username: req.params.username
			}
		})
		if(!user) throw Errors.accountDoesNotExist

		let picture = await ProfilePicture.findOne({
			where: {
				UserId: user.id
			}
		})

		if(!picture) {
			res.status(404)
			res.end('')
		} else {
			res.writeHead(200, {
				'Content-Type': picture.mimetype,
				'Content-disposition': 'attachment;filename=profile',
				'Content-Length': picture.file.length
			})
			res.end(new Buffer(picture.file, 'binary'))
		}
	} catch (e) { next(e) }
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

let upload = multer({ storage: multer.memoryStorage() })
router.post('/:username/picture', upload.single('picture'), async (req, res, next) => {
	try {
		if(req.session.username !== req.params.username) {
			throw Errors.requestNotAuthorized
		} else {
			let user = await User.findById(req.session.UserId)
			let picture = await ProfilePicture.findOne({
				where: { UserId: user.id}
			})

			let pictureObj = {
				file: req.file.buffer,
				mimetype: req.file.mimetype
			}
			
			//No picture set yet
			if(!picture) {
				picture = await ProfilePicture.create(pictureObj)
				await picture.setUser(user)
			} else {
				await picture.update(pictureObj)
			}

			//Add random query to end to force browser to reload background images
			await user.update({
				picture: '/api/v1/user/' + req.session.username + '/picture?rand=' + Date.now()
			})

			res.json(user.toJSON())
		}
	} catch (e) { next(e) }
})

router.delete('/:username/picture', async (req, res, next) => {
	try {
		if(req.session.username !== req.params.username) {
			throw Errors.requestNotAuthorized
		} else {
			let user = await User.findById(req.session.UserId)
			let picture = await ProfilePicture.findOne({
				where: { UserId: user.id}
			})

			await user.update({
				picture: null
			})
			await picture.destroy()

			res.json(user.toJSON())
		}
	} catch (e) { next(e) }
})


router.put('/:username', async (req, res, next) => {
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
	} catch (e) { next(e) }
})

router.delete('/:username', async (req, res, next) => {
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

router.get('/', async (req, res, next) => {
	try {
		if(req.query.admin) {
			let admins = await User.findAll({
				where: { admin: true },
				attributes: {
					exclude: ['hash']
				}
			})

			res.json(admins)
		} else {
			res.json({})
		}
	} catch (e) { next(e) }
})

module.exports = router