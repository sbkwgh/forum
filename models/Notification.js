module.exports = (sequelize, DataTypes) => {
	let Notification = sequelize.define('Notification', {
		title: DataTypes.TEXT,
		read: DataTypes.BOOLEAN,
		type: DataTypes.ENUM('mention', 'thread update') 
	}, {
		classMethods: {
			associate (models) {
				Notification.hasOne(models.MentionNotification, { as: 'Data' })
				Notification.belongsTo(models.User)
			}
		}
	})

	return Notification
}