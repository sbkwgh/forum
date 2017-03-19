let marked = require('marked')

marked.setOptions({
	highlight: function (code) {
		return require('highlight.js').highlightAuto(code).value;
	},
	sanitize: true
});


module.exports = (sequelize, DataTypes) => {
	let Post = sequelize.define('Post', {
		content: {
			type: DataTypes.STRING,
			set (val) {
				this.setDataValue('content', marked(val))
			}
		},
		replyingToUsername: DataTypes.STRING
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
			},
			includeOptions () {
				let models = sequelize.models

				return [
					{ model: models.User, attributes: ['username', 'createdAt', 'id', 'color'] }, 
					{ model: models.Thread, include: [models.Category]} ,
					{
						model: models.Post, as: 'Replies', include:
						[{ model: models.User, attributes: ['username', 'id', 'color'] }]	
					}
				]
			}
		}
	})

	return Post
}