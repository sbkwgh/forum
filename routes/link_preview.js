let linkPreview = require('preview-link');
let express = require('express');
let router = express.Router();

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