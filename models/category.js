module.exports = (sequelize, DataTypes) => {
	let Category = sequelize.define('Category', {
		name: DataTypes.STRING
	})

	return Category
}