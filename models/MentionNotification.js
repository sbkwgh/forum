module.exports = (sequelize, DataTypes) => {
	let MentionNotification = sequelize.define('MentionNotification', {}, {
		classMethods: {
			associate (models) {
				MentionNotification.belongsTo(models.User)
				MentionNotification.belongsTo(models.Post)
				MentionNotification.belongsTo(models.Notification)
			}
		}
	})

	return MentionNotification
}