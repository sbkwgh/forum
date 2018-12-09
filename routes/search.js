let express = require('express')
let router = express.Router()

let { Post, Thread, User, Category, Sequelize } = require('../models')
const Errors = require('../lib/errors')

router.get('/thread', async (req, res, next) => {
	try {
		let searchString = req.query.q.trim()

		if(searchString.length < 4) {
			throw Errors.sequelizeValidation(Sequelize, {
				error: 'search string must be at least 4 characters',
				value: searchString
			})
		}

		//Offset is really the previously lowest id
		//(as a proxy for oldest thread of the previous search)
		//if there is no offset, just use a clause that will always be true
		//i.e. greater than 0 id
		let offset = +req.query.offset ? { $lt: +req.query.offset } : { $gt: 0 }
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
				name: { $like: '%' + searchString + '%' },
				id: offset
			},
			order: [ ['id', 'DESC'] ],
			include: [
				{
					model: Post,
					include: [{ model: User, attributes: { exclude: ['hash'] } }],
					where: {
						postNumber: 0
					}
				},
				{ model: Category },
				{ model: User, attributes: { exclude: ['hash'] } }
			],
			limit
		})

		let threadPosts = await Thread.findAll({
			where: {
				id: offset
			},
			order: [ ['id', 'DESC'] ],
			include: [
				{
					model: Post,
					include: [{ model: User, attributes: { exclude: ['hash'] } }],
					where: {
						postNumber: 0,
						plainText: { $like: '%' + searchString + '%' }
					}
				},
				{ model: Category },
				{ model: User, attributes: { exclude: ['hash'] } }
			],
			limit
		})

		let merged = [...threadTitles, ...threadPosts];
		let unique = [];
		merged.forEach(thread => {
			let includes = unique.filter(u => thread.id === u.id);

			if(!includes.length) unique.push(thread);
		});
		
		let sorted = unique
			.sort((a, b) => {
				return b.id - a.id;
			})
			.slice(0, limit);

		//To get latest post, find threads where
		//the post number is equal to the overal posts count
		//and the post number > 0 (i.e. there are replies)
		let whereClause = sorted.reduce((arr, thread) => {
			if(thread.postsCount > 1) {
				let clause = {
					$and: {
						ThreadId: thread.id,
						postNumber: thread.postsCount-1
					}
				}

				return [...arr, clause];
			} else {
				return arr;
			}
		}, []);

		let latestPosts = await Post.findAll({
			where: {
				$or: whereClause
			},
			order: [ ['ThreadId', 'DESC'] ],
			include: [{ model: User, attributes: { exclude: ['hash'] } }]
		})

		//Merge latest posts with threads array
		let ret = sorted.map(thread => {
			if(thread.postsCount > 1) {
				let post = latestPosts.filter(p => p.ThreadId === thread.id)[0];
				thread.Posts.push(post);
			} 

			return thread;
		})

		res.json({
			threads: ret,
			offset: ret.length ? ret.slice(-1)[0].id : null,
			next: ret.length < limit ? null : limit
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
			offset: users.length < limit ? null : offset + limit,
			next: users.length < limit ? null : limit
		})

	} catch (e) { next(e) }
})

module.exports = router