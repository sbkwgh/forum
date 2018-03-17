let url = require('url');
let axios = require('axios');

module.exports = {
	matches (url) {
		return url.match(/^https?:\/\/[a-z]+\.wikipedia\.org\/wiki\/.+/);
	},
	async getPreviewData (link_url) {
		try {
			let parsedUrl = url.parse(link_url);
			let page = parsedUrl.pathname.split('/').slice(-1)[0];
			let countryVersion = parsedUrl.hostname.split('.')[0];
						
			let res = await axios.get(`https://${countryVersion}.wikipedia.org/api/rest_v1/page/summary/${page}?redirect=true`);
			let content = res.data.extract.slice(0, 500).trim();

			return {
				title: res.data.titles.display,
				url: res.data.content_urls.desktop.page,
				description: content.length < 500 ? content : content + '...'
			}
		} catch (e) {
			return null;
		}
	}
};