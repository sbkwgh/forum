module.exports = (sequelize, DataTypes) => {
	let MentionNotification = sequelize.define('MentionNotification', {}, {
		classMethods: {
			associate (models) {
				Notification.belongsTo(models.User)
				Notification.belongsTo(models.Post)
				Notification.belongsTo(models.Notification)
			}
		}
	})

	return MentionNotification
}