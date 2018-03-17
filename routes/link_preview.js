let linkPreview = require('../lib/linkPreview');
let express = require('express');
let router = express.Router();

const Errors = require('../lib/errors.js');

router.get('/', async (req, res, next) => {
	try {
		let HTML = await linkPreview(req.query.url);
		res.send(HTML);
	} catch (e) {
		next(e);
	}
});

module.exports = router;