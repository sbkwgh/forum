module.exports = (sequelize, DataTypes) => {
	let Notification = sequelize.define('Notification', {
		interacted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		type: DataTypes.ENUM('mention', 'thread update') 
	}, {
		classMethods: {
			associate (models) {
				Notification.hasOne(models.MentionNotification)
				Notification.belongsTo(models.User)
			}
		}
	})

	return Notification
}