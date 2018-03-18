let linkPreview = require('../lib/linkPreview');
let express = require('express');
let router = express.Router();

const Errors = require('../lib/errors.js');

router.get('/', async (req, res, next) => {
	try {
		let url = req.query.url;

		let HTML = url ? await linkPreview(url) : '';
		res.send(HTML);
	} catch (e) {
		next(e);
	}
});

module.exports = router;