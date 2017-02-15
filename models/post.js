let marked = require('marked')

module.exports = (sequelize, DataTypes) => {
	let Post = sequelize.define('Thread', {
		content: {
			type: DataTypes.STRING,
			set (val) {
				return marked(val)
			}
		}
	}, {
		classMethods: {
			associate (models) {
				Post.belongsTo(models.User)
				Post.belongsTo(models.Thread)
				Post.hasMany(models.Post, { as: 'replies' })
				Post.hasOne(models.Post, { as: 'replyingTo' })
			}
		}
	})

	return Post
}