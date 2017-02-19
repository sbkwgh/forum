module.exports = (sequelize, DataTypes) => {
	let Settings = sequelize.define('Settings', {
		forumName: DataTypes.STRING,
		forumDescription: DataTypes.STRING
	}, {
		classMethods: {
			set (values) {
				values.id = 1
				return Settings.upsert(values)
			},
			get () {
				return Settings.findById(1)
			}
		}
	})

	return Settings
}