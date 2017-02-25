module.exports = (sequelize, DataTypes) => {
	let Category = sequelize.define('Category', {
		name: {
			type: DataTypes.STRING,
			unique: true,
			set (val) {
				let underscored = val.trim().replace(/\s/g, '_').toUpperCase()
				this.setDataValue('name', val)
				this.setDataValue('value', underscored)
			}
		},
		value: {
			type: DataTypes.STRING,
			unique: true
		}
	}, {
		classMethods: {
			associate (models) {
				Category.hasMany(models.Thread)
			},
			includeOptions () {
				let models = sequelize.models

				return [{
					model: models.Thread, 
					include: [
						{ model: models.User, attributes: ['username', 'createdAt', 'id'] }, 
						{
							model: models.Post, limit: 1, include:
							[{ model: models.User, attributes: ['username', 'id'] }]
						}
					]
				}]
			}
		}
	})

	return Category
}