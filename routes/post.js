let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')
let { User, Thread, Post, Notification } = require('../models')

router.get('/:post_id', async (req, res) => {
	try {
		let post = await Post.findById(req.params.post_id, { include: Post.includeOptions() })
		if(!post) throw Errors.invalidParameter('id', 'post does not exist')

		res.json(post.toJSON())
	} catch (e) {
		if(e.name === 'invalidParameter') {
			res.status(400)
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
		if(['invalidParameter', 'cannotLikeOwnPost'].includes(e.name)) {
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
	let thread, replyingToPost, post

	try {
		if(req.body.content === undefined) {
			validationErrors.push(Errors.missingParameter('content'))
		} else if(typeof req.body.content !== 'string') {
			validationErrors.push(Errors.invalidParameterType('content', 'string'))
		} if (req.body.threadId === undefined) {
			validationErrors.push(Errors.missingParameter('threadId'))
		} else if(!Number.isInteger(req.body.threadId)) {
			validationErrors.push(Errors.invalidParameterType('threadId', 'integer'))
		} if(req.body.replyingToId !== undefined && !Number.isInteger(req.body.replyingToId)) {
			validationErrors.push(Errors.invalidParameterType('replyingToId', 'integer'))
		} if(req.body.mentions !== undefined) {
			if(Array.isArray(req.body.mentions)) {
				if(req.body.mentions.some(m => typeof m !== 'string')) {
					validationErrors.push(Errors.invalidParameterType('mention', 'string'))
				}
			} else {
				validationErrors.push(Errors.invalidParameterType('mentions', 'array'))
			}
		}

		if(validationErrors.length) throw Errors.VALIDATION_ERROR

		thread = await Thread.findOne({ where: {
			id: req.body.threadId
		}})
		user = await User.findOne({ where: {
			username: req.session.username
		}})

		if(!thread) throw Errors.invalidParameter('threadId', 'thread does not exist')
		if(thread.locked) throw Errors.threadLocked

		if(req.body.replyingToId) {
			replyingToPost = await Post.findById(
				req.body.replyingToId,
				{ include: [Thread, { model: User, attributes: ['username'] }] }
			)

			if(!replyingToPost) {
				throw Errors.invalidParameter('replyingToId', 'post does not exist')
			} else if(replyingToPost.Thread.id !== thread.id) {
				throw Errors.invalidParameter('replyingToId', 'replies must be in same thread')
			} else {
				post = await Post.create({ content: req.body.content, postNumber: thread.postsCount })

				await post.setReplyingTo(replyingToPost)
				await replyingToPost.addReplies(post)

				let replyNotification = await Notification.createPostNotification({
					usernameTo: replyingToPost.User.username,
					userFrom: user,
					type: 'reply',
					post: post
				})

				let ioUsers = req.app.get('io-users')
				if(ioUsers[replyingToPost.User.username]) {
					req.app
						.get('io')
						.to(ioUsers[replyingToPost.User.username])
						.emit('notification', replyNotification.toJSON())
				}
			}
		} else {
			post = await Post.create({ content: req.body.content, postNumber: thread.postsCount })
		}

		await post.setUser(user)
		await post.setThread(thread)

		await thread.increment('postsCount')

		if(req.body.mentions) {
			let uniqueMentions = req.body.mentions.filter((mention, pos, self) => {
				return self.indexOf(mention) === pos
			})

			for(var i = 0; i < uniqueMentions.length; i++) {
				let mention = uniqueMentions[i]
				let ioUsers = req.app.get('io-users')

				let mentionNotification = await Notification.createPostNotification({
					usernameTo: mention,
					userFrom: user,
					type: 'mention',
					post
				})
				
				if(ioUsers[mention]) {
					req.app.get('io').to(ioUsers[mention]).emit('notification', mentionNotification.toJSON())
				}
			}
		}

		res.json(await post.reload({
			include: Post.includeOptions()
		}))

		req.app.get('io').to('thread/' + thread.id).emit('new post', {
			postNumber: thread.postsCount
		})

	} catch (e) {
		if(e === Errors.VALIDATION_ERROR) {
			res.status(400)
			res.json({
				errors: validationErrors
			})
		} else if(e.name === 'invalidParameter' || e.name === 'threadLocked') {
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

module.exports = router