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
				User.hasMany(models.Thread)
			},
			includeOptions (lastId, limit) {
				let models = sequelize.models
				let options = models.Post.includeOptions()

				return [{
					model: models.Post,
					include: options,
					limit,
					where: { id: { $gt: lastId } },
					order: [['id', 'ASC']]
				}]
			}
		}
	})

	return User
}