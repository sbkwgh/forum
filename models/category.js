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
				return randomColor({ luminosity: 'bright' })
			}
		}
	}, {
		classMethods: {
			associate (models) {
				Category.hasMany(models.Thread)
			},
			includeOptions (order, threadLimit, where, from) {
				let models = sequelize.models
				let options = {
					model: models.Thread,
					where: {
						id: { $gt: from || -1 },
						userId: where.userId
					},
					include: [
						models.Category,
						{ model: models.User, attributes: ['username', 'createdAt', 'id', 'color'] }, 
						{
							model: models.Post, limit: 1, order: [['id', order]], include:
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