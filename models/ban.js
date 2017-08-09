const Errors = require('../lib/errors')

module.exports = (sequelize, DataTypes) => {
	let Ban = sequelize.define('Ban', {
		canCreatePosts: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			validate: {
				isBoolean (val) {
					if(typeof val !== 'boolean') {
						throw new sequelize.ValidationError('canCreateThreads must be a string')
					}
				}
			}
		},
		canCreateThreads: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			validate: {
				isBoolean (val) {
					if(typeof val !== 'boolean') {
						throw new sequelize.ValidationError('canCreateThreads must be a string')
					}
				}
			}
		},
		message: {
			type: DataTypes.TEXT,
			validate: {
				isString (val) {
					if(typeof val !== 'string') {
						throw new sequelize.ValidationError('description must be a string')
					}
				},
				len: {
					args: [0, 1024],
					msg: 'message must be less than 1024 characters'
				}
			}
		}
	}, {
		classMethods: {
			associate (models) {
				Ban.belongsTo(models.User)
			},
			async getBanInstance (username) {
				let user = await sequelize.models.User.findOne({ where: { username } })
				let ban = await Ban.findOne({ where: { UserId: user.id } })

				return ban
			},
			async canCreatePosts (username) {
				let ban = await this.getBanInstance(username)

				if(ban && !ban.canCreatePosts) {
					throw Errors.sequelizeValidation(sequelize.Sequelize, {
						error: ban.message || 'You have been banned from posting'
					})
				} else {
					false
				}
			},
			async canCreateThreads (username) {
				let ban = await this.getBanInstance(username)

				if(ban && !ban.canCreateThreads) {
					throw Errors.sequelizeValidation(sequelize.Sequelize, {
						error: ban.message || 'You have been banned from creating threads'
					})
				} else {
					false
				}
			}
		}
	})

	return Ban
}