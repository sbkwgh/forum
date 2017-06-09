let crypto = require('crypto')

module.exports = (sequelize, DataTypes) => {
	let AdminToken = sequelize.define('AdminToken', {
		token: {
			type: DataTypes.STRING,
			defaultValue () {
				return crypto.randomBytes(64).toString('hex')
			},
			validate: {
				isString (val) {
					if(typeof val !== 'string') {
						throw new sequelize.ValidationError('token must be a string')
					}
				}
			}
		}
	}, {
		instanceMethods: {
			isValid () {
				let ms = Date.now() - this.createdAt
				let dayMs = 1000*60*60*24
				
				//Has less than 1 day passed
				//since generating token?
				return ms / dayMs < 1
			}
		}
	})

	return AdminToken
}