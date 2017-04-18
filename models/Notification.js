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
		type: DataTypes.ENUM('mention', 'thread update', 'reply') 
	}, {
		classMethods: {
			associate (models) {
				Notification.hasOne(models.PostNotification)
				Notification.belongsTo(models.User)
			},
			//Props fields: userFrom, usernameTo, post, type
			async createPostNotification (props) {
				let { PostNotification, User, Post } = sequelize.models

				let userTo = await User.findOne({ where: { username: props.usernameTo } })
				if(!userTo) return null
				
				let notification = await Notification.create({ type: props.type })
				let postNotification = await PostNotification.create()

				await postNotification.setUser(props.userFrom)
				await postNotification.setPost(props.post)

				await notification.setPostNotification(postNotification)
				await notification.setUser(userTo)

				let reloadedNotification = await notification.reload({
					include: [{
						model: PostNotification,
						include: [Post, { model: User, attributes: ['createdAt', 'username', 'color'] }]
					}]
				})

				return reloadedNotification
			}
		}
	})

	return Notification
}