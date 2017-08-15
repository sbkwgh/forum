const Errors = require('../lib/errors')

module.exports = (sequelize, DataTypes) => {
	let Ban = sequelize.define('Ban', {
		canCreatePosts: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			validate: {
				isBoolean (val) {
					if(typeof val !== 'boolean') {
						throw new sequelize.ValidationError('canCreateThreads must be a boolean')
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
						throw new sequelize.ValidationError('canCreateThreads must be a boolean')
					}
				}
			}
		},
		ipBanned: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			validate: {
				isBoolean (val) {
					if(typeof val !== 'boolean') {
						throw new sequelize.ValidationError('ipBanned must be a boolean')
					}
				}
			}
		},
		message: {
			type: DataTypes.TEXT,
			validate: {
				isString (val) {
					if(typeof val !== 'string') {
						throw new sequelize.ValidationError('message must be a string')
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
					return false
				}
			},
			async canCreateThreads (username) {
				let ban = await this.getBanInstance(username)

				if(ban && !ban.canCreateThreads) {
					throw Errors.sequelizeValidation(sequelize.Sequelize, {
						error: ban.message || 'You have been banned from creating threads'
					})
				} else {
					return false
				}
			},
			async isIpBanned (ip, username) {
				let { User, Ip } = sequelize.models

				if(username) {
					let user = await User.findOne({ where: {
						username
					}})
					if(user && user.admin) return false
				}
		

				let users = await User.findAll({
					include: [{
						model: Ip,
						where: { ip }
					}]
				})
				if(!users.length) return false

				let ban = await Ban.findOne({ where: {
					UserId: {
						$in: users.map(u => u.id)
					},
					ipBanned: true 
				} })

				if(ban) {
					throw Errors.sequelizeValidation(sequelize.Sequelize, {
						error: ban.message ||
						'This IP has been banned from creating accounts or logging in'
					})
				} else {
					return false
				}
			}
		}
	})

	return Ban
}