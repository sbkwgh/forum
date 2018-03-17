let cheerio = require('cheerio');
let axios = require('axios');

module.exports = async function getOGPreviewData (url) {
	try {
		let res = await axios.get(url);
		let $ = cheerio.load(res.data);

		let OG = {
			title: $('meta[property="og:title"]'),
			url: $('meta[property="og:url"]'),
			image: $('meta[property="og:image"]'),
			description: $('meta[property="og:description"]')
		};

		let alternative = {
			title: $('title'),
			description: $('meta[name="description"]')
		};

		let data = {};

		if(OG.title.length && OG.url.length) {
			data.title = OG.title.attr('content'); 
			data.url = OG.url.attr('content');

			if(OG.image) data.image = OG.image.attr('content');
			if(OG.description) data.description = OG.description.attr('content');

			return data;
		} else if(alternative.title.length && alternative.description.length) {
			data.title = alternative.title.text();
			data.description = alternative.description.attr('content');
		} else {
			return null;
		}

		return data;
	} catch (e) {
		return null;
	}
}