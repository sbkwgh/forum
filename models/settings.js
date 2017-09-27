module.exports = (sequelize, DataTypes) => {
	let Settings = sequelize.define('Settings', {
		forumName: {
			type: DataTypes.STRING,
			validate: {
				isString (val) {
					if(typeof val !== 'string') {
						throw new sequelize.ValidationError('The name must be a string')
					}
				}
			}
		},
		forumDescription: {
			type: DataTypes.STRING,
			validate: {
				isString (val) {
					if(typeof val !== 'string') {
						throw new sequelize.ValidationError('The description must be a string')
					}
				}
			}
		},
		showDescription: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		}
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