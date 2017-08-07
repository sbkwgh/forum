let marked = require('marked')
const Errors = require('../lib/errors')

marked.setOptions({
	highlight: function (code) {
		return require('highlight.js').highlightAuto(code).value;
	},
	sanitize: true
});


module.exports = (sequelize, DataTypes) => {
	let Post = sequelize.define('Post', {
		content: {
			type: DataTypes.TEXT,
			set (val) {
				if(!val) throw Errors.sequelizeValidation(sequelize, {
					error: 'content must be a string',
					path: 'content'
				})

				this.setDataValue('content', marked(val))
			},
			allowNull: false
		},
		postNumber: DataTypes.INTEGER,
		replyingToUsername: DataTypes.STRING,
		removed: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {
		instanceMethods: {
			getReplyingTo () {
				return Post.findByPrimary(this.replyId)
			},
			setReplyingTo (post) {
				return post.getUser().then(user => {
					return this.update({ replyingToUsername: user.username, replyId: post.id })
				})
			}
		},
		classMethods: {
			associate (models) {
				Post.belongsTo(models.User)
				Post.belongsTo(models.Thread)
				Post.hasMany(models.Post, { as: 'Replies', foreignKey: 'replyId' })
				Post.belongsToMany(models.User, { as: 'Likes', through: 'user_post' })
			},
			includeOptions () {
				let models = sequelize.models

				return [
					{ model: models.User, attributes: ['username', 'createdAt', 'id', 'color'] },
					{ model: models.User, as: 'Likes', attributes: ['username', 'createdAt', 'id', 'color'] },
					{ model: models.Thread, include: [models.Category]} ,
					{
						model: models.Post, as: 'Replies', include:
						[{ model: models.User, attributes: ['username', 'id', 'color'] }]	
					}
				]
			},
			async getReplyingToPost (id, thread) {
				let { Thread, User } = sequelize.models
				let replyingToPost = await Post.findById(
					id,
					{ include: [Thread, { model: User, attributes: ['username'] }] }
				)

				if(!replyingToPost) {
					throw Errors.invalidParameter('replyingToId', 'post does not exist')
				} else if(replyingToPost.Thread.id !== thread.id) {
					throw Errors.invalidParameter('replyingToId', 'replies must be in same thread')
				} else if (replyingToPost.removed) {
					throw Errors.postRemoved
				} else {
					return replyingToPost
				}

			}
		}
	})

	return Post
}