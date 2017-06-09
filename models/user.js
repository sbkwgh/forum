let bcrypt = require('bcryptjs')
let randomColor = require('randomcolor')

const Errors = require('../lib/errors.js')

module.exports = (sequelize, DataTypes) => {
	let User = sequelize.define('User', {
		username: {
			type: DataTypes.STRING,
			unique: true,
			validate: {
				min: {
					args: [1],
					msg: 'username can\'t be less than 6 characters'
				},
				max: {
					arg: 50,
					msg: 'username can\'t be more than 50 characters'
				},
				isString (val) {
					if(typeof val !== 'string') {
						throw new sequelize.ValidationError('username must be a string')
					}
				}
			}
		},
		description: DataTypes.TEXT,
		color: {
			type: DataTypes.STRING,
			defaultValue () {
				return randomColor()
			}
		},
		hash: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				min: {
					arg: 6,
					msg: 'password can\'t be less than 6 characters'
				},
				max: {
					arg: 100,
					msg: 'password can\'t be more than 100 characters'
				},
				isString (val) {
					if(typeof val !== 'string') {
						throw new sequelize.ValidationError('password must be a string')
					}
				}
			}
		},
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
			includeOptions (from, limit) {
				let models = sequelize.models
				let options = models.Post.includeOptions()

				return [{
					model: models.Post,
					include: options,
					limit,
					where: { postNumber: { $gte: from } },
					order: [['id', 'ASC']]
				}]
			},
			async canBeAdmin (token) {
				let { User, AdminToken } = sequelize.models
				
				let adminUser = await User.findOne({ where: {
					admin: true
				}})

				if(adminUser) {
					if(token) {
						let adminToken = await AdminToken.findOne({ where: { token } })

						if(adminToken && adminToken.isValid()) {
							await adminToken.destroy()

							return true
						} else {
							throw Errors.invalidToken
						}
					} else {
						throw Errors.missingParameter('token')
					}
	
				} else {
					return true
				}
			}
		},
		hooks: {
			async afterValidate(user) {
				user.hash = await bcrypt.hash(user.hash, 12)
			}
		}
	})

	return User
}