let express = require('express')
let router = express.Router()

const Errors = require('../lib/errors')

router.post('/', async (req, res) => {
	try {

	} catch (e) {
		res.status(500)
		res.json({
			errors: Errors.unknown
		})
	}
})

module.exports = router