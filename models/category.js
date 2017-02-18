module.exports = (sequelize, DataTypes) => {
	let Category = sequelize.define('Category', {
		name: {
			type: DataTypes.STRING,
			unique: true
		}
	})

	return Category
}