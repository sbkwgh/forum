let marked = require('marked')

module.exports = (sequelize, DataTypes) => {
	let Post = sequelize.define('Post', {
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
				Post.hasMany(models.Post, { as: 'Replies' })
				Post.hasOne(models.Post, { as: 'ReplyingTo' })
			}
		}
	})

	return Post
}