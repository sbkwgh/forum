let express = require('express')
let router = express.Router()

let User = require('../models').User

router.post('/', async (req, res) => {
	 let user = await User.create({
		username: req.body.username,
		hash: req.body.password
	})

	res.json(user.toJSON())
})

module.exports = router