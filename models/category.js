let randomColor = require('randomcolor')

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
		},
		color: {
			type: DataTypes.STRING,
			defaultValue () {
				return randomColor()
			}
		}
	}, {
		classMethods: {
			associate (models) {
				Category.hasMany(models.Thread)
			},
			includeOptions (threadLimit) {
				let models = sequelize.models
				let options = {
					model: models.Thread, 
					include: [
						models.Category,
						{ model: models.User, attributes: ['username', 'createdAt', 'id'] }, 
						{
							model: models.Post, limit: 1, include:
							[{ model: models.User, attributes: ['username', 'id'] }]
						}
					]
				}

				if(threadLimit) options.limit = threadLimit

				return [options]
			}
		}
	})

	return Category
}