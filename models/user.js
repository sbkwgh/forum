let randomColor = require('randomcolor')

module.exports = (sequelize, DataTypes) => {
	let User = sequelize.define('User', {
		username: {
			type: DataTypes.STRING,
			unique: true
		},
		color: {
			type: DataTypes.STRING,
			defaultValue () {
				return randomColor()
			}
		},
		hash: DataTypes.STRING,
		admin: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
	}, {
		classMethods: {
			associate (models) {
				User.hasMany(models.Post)
			},
			includeOptions (lastId, limit) {
				let models = sequelize.models
				let options = models.Post.includeOptions()[0]

				options.where = { id: { $gt: lastId } }
				options.limit = limit
				options.order = [['id', 'ASC']]

				return [options]
			}
		}
	})

	return User
}