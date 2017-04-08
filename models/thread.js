let slug = require('slug')

module.exports = (sequelize, DataTypes) => {
	let Thread = sequelize.define('Thread', {
		name: {
			type: DataTypes.TEXT,
			set (val) {
				this.setDataValue('name', val)
				this.setDataValue('slug', slug(val).toLowerCase())
			}
		},
		slug: DataTypes.TEXT,
		postsCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		}
	}, {
		classMethods: {
			associate (models) {
				Thread.belongsTo(models.User)
				Thread.belongsTo(models.Category)
				Thread.hasMany(models.Post)
			},
			includeOptions (from, limit) {
				let models = sequelize.models

				return [
					{ model: models.User, attributes: ['username', 'createdAt', 'color', 'updatedAt', 'id'] }, 
					models.Category,
					{ 
						model: models.Post, 
						where: { postNumber: { $gte: from } },
						order: [['id', 'ASC']],
						limit,
						include: [
							{ model: models.Thread, attributes: ['slug'] }, 
							{ model: models.User, as: 'Likes', attributes: ['username', 'createdAt', 'id', 'color'] },
							{ model: models.User, attributes: ['username', 'createdAt', 'id', 'color'] }, 
							{
								model: models.Post, as: 'Replies', include:
								[{ model: models.User, attributes: ['username', 'id', 'color'] }]	
							}
						]
					}
				]
			}
		}
	})

	return Thread
}