let { Sequelize } = require('../models')
let Errors = require('./errors')

module.exports = function (err, req, res, next) {
	if(err instanceof Sequelize.ValidationError) {
		res.status(400)
		res.json(err)
	} else if(err.name in Errors) {
		res.status(err.status)
		res.json({
			errors: [err]
		})
	} else {
		console.log(err)

		res.status(500)
		res.json({
			errors: [Errors.unknown]
		})
	}
}