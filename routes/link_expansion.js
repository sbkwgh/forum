let https = require('https');
let express = require('express');
let router = express.Router();

const Errors = require('../lib/errors.js');

function getJsonHTTPS (url, cb) {
	https.get(url, res => {
		if(res.statusCode === 200) {
			let chunks = [];

			res.on('data', chunk => chunks.push(chunk));
			res.on('end', () => {
				let data = Buffer.concat(chunks).toString();
				let json = JSON.parse(data);

				cb(null, json);
			})
		} else {
			cb(
				new Error(`Request Failed.\nStatus Code: ${res.statusCode}`)
			);
		}
	})
}

router.get('/twitter', async (req, res, next) => {
	let url = 'https://publish.twitter.com/oembed?url=' + req.query.url
	getJsonHTTPS(url, (err, data) => {
		if(err) {
			next(Errors.unknown);
		} else {
			res.json(data);
		}
	});
});

module.exports = router;