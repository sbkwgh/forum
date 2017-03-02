let slug = require('slug')

module.exports = (sequelize, DataTypes) => {
	let Thread = sequelize.define('Thread', {
		name: {
			type: DataTypes.STRING,
			set (val) {
				this.setDataValue('name', val)
				this.setDataValue('slug', slug(val).toLowerCase())
			}
		},
		slug: DataTypes.STRING
	}, {
		classMethods: {
			associate (models) {
				Thread.belongsTo(models.User)
				Thread.belongsTo(models.Category)
				Thread.hasMany(models.Post)
			},
			includeOptions () {
				let models = sequelize.models

				return [
					{ model: models.User, attributes: ['username', 'createdAt', 'updatedAt', 'id'] }, 
					models.Category,
					{ 
						model: models.Post, 
						include: [
							{ model: models.User, attributes: ['username', 'createdAt', 'id'] }, 
							{
								model: models.Post, as: 'Replies', include:
								[{ model: models.User, attributes: ['username', 'id'] }]	
							}
						]
					}
				]
			}
		}
	})

	return Thread
}