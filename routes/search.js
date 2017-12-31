let express = require('express')
let router = express.Router()

let { Post, Thread, Sequelize } = require('../models')
const Errors = require('../lib/errors')

router.get('/', async (req, res, next) => {
	try {
		let q = req.query.q
		let qRegexp = new RegExp(q, 'g')
		let offset = +req.query.offset || 0

		let count = await Post.count({
			where: {
				content: { $like: '%' + q + '%' }
			}
		})

		let posts = await Post.findAll({
			where: {
				content: { $like: '%' + q + '%' }
			},
			order: [ ['id', 'DESC'] ],
			include: Post.includeOptions(),
			limit: 10,
			offset
		})

		let retPosts = posts.map(p => {
			let ret = p.toJSON()
			ret.content = ret.content.replace(qRegexp, '<b>' + q + '</b>')

			return ret
		})

		let remainingResults = count - (offset + 10)
		let next;
		if(remainingResults < 0) {
			next = 0
		} else if(remainingResults < 10) {
			next = remainingResults
		} else {
			next = 10
		}

		res.json({
			posts: retPosts,
			offset: offset + 10,
			next
		})

	} catch (e) { next(e) }
})

module.exports = router