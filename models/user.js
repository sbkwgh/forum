module.exports = (sequelize, DataTypes) => {
	let User = sequelize.define('User', {
		username: {
			type: DataTypes.STRING,
			unique: true
		},
		hash: DataTypes.STRING
	}, {
		classMethods: {
			associate: (models) => {
				// associations can be defined here
			}
		}
	})

	return User
}