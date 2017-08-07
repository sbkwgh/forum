let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')
let { User, Thread, Post, Notification, Sequelize, sequelize } = require('../models')

router.get('/:post_id', async (req, res) => {
	try {
		let post = await Post.findById(req.params.post_id, { include: Post.includeOptions() })
		if(!post) throw Errors.sequelizeValidation(Sequelize, {
			error: 'post does not exist',
			path: 'id'
		})

		res.json(post.toJSON())
	} catch (e) {
		if(e instanceof Sequelize.ValidationError) {
			res.status(400)
			res.json(e)
		} else {
			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

router.all('*', (req, res, next) => {
	if(req.session.loggedIn) {
		next()
	} else {
		res.status(401)
		res.json({
			errors: [Errors.requestNotAuthorized]
		})
	}
})


router.put('/:post_id/like', async (req, res) => {
	try {
		let post = await Post.findById(req.params.post_id)
		let user = await User.findOne({ where: { username: req.session.username }})
		
		if(!post) throw Errors.invalidParameter('id', 'post does not exist')
		if(post.UserId === user.id) throw Errors.cannotLikeOwnPost

		await post.addLikes(user)

		res.json({ success: true })

	} catch (e) {
		if(e.name in Errors) {
			res.status(400)
			res.json({
				errors: [e]
			})
		} else{
			console.log(e)

			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

router.delete('/:post_id/like', async (req, res) => {
	try {
		let post = await Post.findById(req.params.post_id)
		let user = await User.findOne({ where: { username: req.session.username }})
		
		if(!post) throw Errors.invalidParameter('id', 'post does not exist')

		await post.removeLikes(user)

		res.json({ success: true })

	} catch (e) {
		if(e.name === 'invalidParameter') {
			res.status(400)
			res.json({
				errors: [e]
			})
		} else{
			console.log(e)

			res.status(500)
			res.json({
				errors: [Errors.unknown]
			})
		}
	}
})

router.post('/', async (req, res) => {
	let validationErrors = []
	let thread, replyingToPost, post, uniqueMentions = []

	try {
		if(req.body.mentions) {
			uniqueMentions = Notification.filterMentions(req.body.mentions)
		}

		thread = await Thread.findOne({ where: {
			id: req.body.threadId
		}})
		user = await User.findOne({ where: {
			username: req.session.username
		}})

		if(!thread) throw Errors.sequelizeValidation(Sequelize, {
			error: 'thread does not exist',
			path: 'id'
		})
		if(thread.locked) throw Errors.threadLocked

		if(req.body.replyingToId) {
			replyingToPost = await Post.getReplyingToPost(
				req.body.replyingToId, thread
			)

			post = await Post.create({ content: req.body.content, postNumber: thread.postsCount })

			await post.setReplyingTo(replyingToPost)
			await replyingToPost.addReplies(post)

			let replyNotification = await Notification.createPostNotification({
				usernameTo: replyingToPost.User.username,
				userFrom: user,
				type: 'reply',
				post: post
			})
			await replyNotification.emitNotificationMessage(
				req.app.get('io-users'),
				req.app.get('io')
			)
		} else {
			post = await Post.create({ content: req.body.content, postNumber: thread.postsCount })
		}

		await post.setUser(user)
		await post.setThread(thread)

		await thread.increment('postsCount')

		if(uniqueMentions.length) {
			let ioUsers = req.app.get('io-users')
			let io = req.app.get('io')

			uniqueMentions.forEach(async mention => {
				let mentionNotification = await Notification.createPostNotification({
					usernameTo: mention,
					userFrom: user,
					type: 'mention',
					post
				})

				await mentionNotification.emitNotificationMessage(ioUsers, io)
			})
		}

		res.json(await post.reload({
			include: Post.includeOptions()
		}))

		req.app.get('io').to('thread/' + thread.id).emit('new post', {
			postNumber: thread.postsCount
		})

	} catch (e) {
		if(e instanceof Sequelize.ValidationError) {
			res.status(400)
			res.json(e)
		} else if(e.name in Errors) {
			res.status(400)
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

router.all('*', (req, res, next) => {
	if(!req.session.admin) {
		res.status(401)
		res.json({
			errors: [Errors.requestNotAuthorized]
		})
	} else {
		next()
	}
})

router.delete('/:post_id', async (req, res) => {
	try {
		let post = await Post.findById(req.params.post_id)
		if(!post) throw Errors.sequelizeValidation(Sequelize, {
			error: 'post does not exist',
			path: 'id'
		})

		await post.update({ content: '[This post has been removed by an administrator]', removed: true })

		res.json({ success: true })
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