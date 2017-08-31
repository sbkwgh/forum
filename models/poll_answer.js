module.exports = (sequelize, DataTypes) => {
	let Sequelize = sequelize.Sequelize

	let PollAnswer = sequelize.define('PollAnswer', {
		answer: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: {
					args: [1, 256],
					msg: 'The answer must be between 1 and 256 characters'
				},
				isString (val) {
					if(typeof val !== 'string') {
						throw new Sequelize.ValidationError('The answer must be a string')
					}
				}
			}
		}
	})

	return PollAnswer
}