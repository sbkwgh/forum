let marked = require('marked')

module.exports = (sequelize, DataTypes) => {
	let Post = sequelize.define('Post', {
		content: {
			type: DataTypes.STRING,
			set (val) {
				this.setDataValue('content', marked(val))
			}
		}
	}, {
		classMethods: {
			associate (models) {
				Post.belongsTo(models.User)
				Post.belongsTo(models.Thread)
				Post.hasMany(models.Post, { as: 'Replies' })
				Post.hasOne(models.Post, { as: 'ReplyingTo' })
			},
			includeOptions () {
				let models = sequelize.models

				return [
					{ model: models.User, attributes: ['username', 'createdAt', 'id'] }, 
					{ model: models.Thread, include: [models.Category]} ,
					{
						model: models.Post, as: 'ReplyingTo', include:
						[{ model: models.User, attributes: ['username', 'id'] }]
					}, {
						model: models.Post, as: 'Replies', include:
						[{ model: models.User, attributes: ['username', 'id'] }]	
					}
				]
			}
		}
	})

	return Post
}