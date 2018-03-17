let url = require('url');
let axios = require('axios');

module.exports = {
	matches (url) {
		return url.match(/^https?:\/\/(www\.)?github\.com\/.+\/.+/i);
	},
	async getPreviewData (link_url) {
		try {
			let pathname = url.parse(link_url).pathname;
			let res = await axios.get('https://api.github.com/repos' + pathname);

			return {
				title: res.data.full_name,
				url: res.data.html_url,
				description: res.data.description
			};
		} catch (e) {
			console.log(e)
			return null;
		}
	}
};