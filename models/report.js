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
				Report.belongsTo(models.User, { as: 'FlaggedByUser' })
				Report.belongsTo(models.Post)
			},
			InvalidPostId (value) {
				return new sequelize.ValidationError('Post id is not valid', [
					new sequelize.ValidationErrorItem(
						'Post id is not valid',
						'Validation error',
						'postId',
						value
					)
				])
			}
		}
	})

	return Report
}