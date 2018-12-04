let express = require('express')
let router = express.Router()

let { Post, Thread, User, Sequelize } = require('../models')
const Errors = require('../lib/errors')

router.get('/thread', async (req, res, next) => {
	try {
		let searchString = req.query.q

		let offset = +req.query.offset || 0
		let limit = 10

		/*  
		Task is to find threads that either have the 
		string in the title or in the content of the first post

		Method
		  1) Select first n items from each group (posts and threads), where n is the LIMIT,
		     greater than id x, where x is previous OFFSET
		  2) Merge results from both, remove duplicates and sort
		  3) Select first n items from merged group
		  4) Set x as the last item from merged group
		*/

		let threadTitles = await Thread.findAll({
			where: {
				name: { $like: '%' + searchString + '%' }
			},
			order: [ ['id', 'DESC'] ],
			include: [{
				model: Post,
				where: {
					postNumber: 0
				}
			}],
			limit,
			offset
		})

		let threadPosts = await Thread.findAll({
			order: [ ['id', 'DESC'] ],
			include: [{
				model: Post,
				where: {
					postNumber: 0,
					content: { $like: '%' + searchString + '%' }
				}
			}],
			limit,
			offset
		})

		let merged = [...threadTitles, ...threadPosts];
		let unique = [];
		merged.forEach(thread => {
			let includes = unique.filter(u => thread.id === u.id);

			if(!includes.length) unique.push(thread);
		});
		
		let sorted = unique
			.sort((a, b) => {
				return a.id - b.id;
			})
			.slice(0, limit);

		res.json({
			threads: sorted,
			offset: sorted.length ? sorted.slice(-1)[0].id : null,
			next: sorted.length < limit ? null : limit
		})

	} catch (e) { next(e) }
})

router.get('/user', async (req, res, next) => {
	try {
		let searchString = req.query.q

		let offset = +req.query.offset || 0
		let limit = 10

		let users = await User.findAll({
			where: {
				username: { $like: '%' + searchString + '%' }
			},
			order: [ ['username', 'DESC'] ],
			attributes: { exclude: ['hash'] },
			limit,
			offset
		})

		res.json({
			users,
			offset: users.length? users.slice(-1)[0].id : null,
			next: users.length < limit ? null : limit
		})

	} catch (e) { next(e) }
})

module.exports = router