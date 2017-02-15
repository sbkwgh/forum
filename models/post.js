module.exports = (sequelize, DataTypes) => {
	let Post = sequelize.define('Thread', {
		title: DataTypes.STRING
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