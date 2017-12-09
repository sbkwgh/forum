module.exports = (sequelize, DataTypes) => {
	let ProfilePicture = sequelize.define('ProfilePicture', {
		file: DataTypes.BLOB('long'),
		mimetype: DataTypes.STRING
	}, {
		classMethods: {
			associate (models) {
				ProfilePicture.belongsTo(models.User)
			}
		}
	})

	return ProfilePicture
}