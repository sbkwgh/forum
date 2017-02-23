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
	})

	return Category
}