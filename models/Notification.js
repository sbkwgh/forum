module.exports = (sequelize, DataTypes) => {
	let Notification = sequelize.define('Notification', {
		interacted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		read: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		type: DataTypes.ENUM('mention', 'thread update') 
	}, {
		classMethods: {
			associate (models) {
				Notification.hasOne(models.MentionNotification)
				Notification.belongsTo(models.User)
			},
			//Props fields: user, post, mention
			async createMention (props) {
				let { MentionNotification, User } = sequelize.models

				let user = await User.findOne({ where: { username: props.mention } })
				if(!user) return null
				
				let notification = await Notification.create({ type: 'mention' })
				let mentionNotification = await MentionNotification.create()

				await mentionNotification.setUser(props.user)
				await mentionNotification.setPost(props.post)

				await notification.setMentionNotification(mentionNotification)
				await notification.setUser(user)

				return notification
			}
		}
	})

	return Notification
}