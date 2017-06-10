let bcrypt = require('bcryptjs')
let randomColor = require('randomcolor')

let pagination = require('../lib/pagination.js')
const Errors = require('../lib/errors.js')

module.exports = (sequelize, DataTypes) => {
	let User = sequelize.define('User', {
		username: {
			type: DataTypes.STRING,
			unique: true,
			validate: {
				len: {
					args: [6, 50],
					msg: 'username must be between 6 and 50 characters'
				},
				isString (val) {
					if(typeof val !== 'string') {
						throw new sequelize.ValidationError('username must be a string')
					}
				}
			}
		},
		description: {
			type: DataTypes.TEXT,
			validate: {
				isString (val) {
					if(typeof val !== 'string') {
						throw new sequelize.ValidationError('description must be a string')
					}
				},
				len: {
					args: [0, 1024],
					msg: 'description must be less than 1024 characters'
				}
			}
		},
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
				len: {
					args: [6, 100],
					msg: 'password must be between 6 and 100 characters'
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
		instanceMethods: {
			async updatePassword (currentPassword, newPassword) {
				if(currentPassword === newPassword) {
					throw Errors.passwordSame
				} else if(typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
					throw new sequelize.ValidationError('password must be a string')
				}

				let correctPassword = await bcrypt.compare(currentPassword, this.hash)

				if(correctPassword) {
					await this.update({ hash: newPassword })
				} else {
					throw Errors.invalidLoginCredentials
				}
			},
			async comparePassword (password) {
				return await bcrypt.compare(password, this.hash)
			},
			async getMeta (limit) {
				let Post = sequelize.models.Post
				let meta = {}

				let nextId = await pagination.getNextIdDesc(Post, { userId: this.id }, this.Posts)

				if(nextId === null) {
					meta.nextURL = null
					meta.nextPostsCount = 0
				} else {
					meta.nextURL =
						`/api/v1/user/${user.username}?posts=true&limit=${limit}&from=${nextId - 1}`

					meta.nextPostsCount = await pagination.getNextCount(
						Post, this.Posts, limit,
						{ UserId: this.id },
						true
					)
				}

				return meta
			}
		},
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
			async afterValidate(user, options) {
				if(user.changed('hash') && user.hash.length <= 50) {
					user.hash = await bcrypt.hash(user.hash, 12)
				}

				options.hooks = false
				return options
			}
		}
	})

	return User
}