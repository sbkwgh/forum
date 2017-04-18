module.exports = (sequelize, DataTypes) => {
	let PostNotification = sequelize.define('PostNotification', {}, {
		classMethods: {
			associate (models) {
				PostNotification.belongsTo(models.User)
				PostNotification.belongsTo(models.Post)
				PostNotification.belongsTo(models.Notification)
			}
		}
	})

	return PostNotification
}