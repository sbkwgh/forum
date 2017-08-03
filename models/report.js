module.exports = (sequelize, DataTypes) => {
	let Report = sequelize.define('Report', {
		reason: {
			type: DataTypes.ENUM,
			values: ['spam', 'inappropriate', 'harassment'],
			validate: {
				isIn: {
					args: [['spam', 'inappropriate', 'harassment']],
					msg: "Report reason can only be one of the pre-defined options"
				}
			}
		}
	}, {
		classMethods: {
			associate (models) {
				Report.hasOne(models.User, { as: 'FlaggedByUser' })
				Report.hasOne(models.Post)
			}
		}
	})

	return Report
}