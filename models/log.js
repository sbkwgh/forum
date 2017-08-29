let routes = [
	'index',
	'search',
	'settingsAccount',
	'settingsGeneral',
	'thread',
	'threadNew',
	'userPosts',
	'userThreads'
]

module.exports = (sequelize, DataTypes) => {
	let Log = sequelize.define('Log', {
		route: {
			type: DataTypes.ENUM(routes),
			validate: {
				isIn: {
					args: [routes],
					msg: "route does not exist"
				}
			}
		}
	}, {
		classMethods: {
			associate (models) {
				//Resources corresponding to the route
				//I.e. route userPosts and UserId 3
				//Corresponds to /user/[username for id 3]/posts
				Log.belongsTo(models.Thread)
				Log.belongsTo(models.User)

				//Rather than id corresponding to the route resource
				//Id corresponding to the user behind the session
				//(If session is from logged in user)
				Log.belongsTo(models.User, { as: 'SessionUser' })
			}
		}
	})

	return Log
}