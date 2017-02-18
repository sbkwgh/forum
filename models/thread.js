module.exports = (sequelize, DataTypes) => {
	let Thread = sequelize.define('Thread', {
		name: DataTypes.STRING
	}, {
		classMethods: {
			associate (models) {
				Thread.belongsTo(models.User)
				Thread.belongsTo(models.Category)
				Thread.hasMany(models.Post)
			}
		}
	})

	return Thread
}