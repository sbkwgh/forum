let url = require('url');
let ejs = require('ejs');
let axios = require('axios');

module.exports = {
	matches (url) {
		return url.match(/^https?:\/\/(www\.)?github\.com\/.+\/.+/i);
	},
	async getPreviewData (link_url) {
		try {
			let pathname = url.parse(link_url).pathname;
			let res = await axios.get('https://api.github.com/repos' + pathname);

			let partialTemplate = `
				<a href='<%= html_url + '/stargazers' %>' target='_blank' rel='noopener noreferer'>
					<%= stargazers_count %> stargazer<%= stargazers_count === 1 ? '' : 's' %>
				</a>
				and
				<a href='<%= html_url + '/network' %>' target='_blank' rel='noopener noreferer'>
					<%= forks_count %> fork<%= forks_count === 1 ? '' : 's' %>
				</a>
			`;

			return {
				title: res.data.full_name,
				url: res.data.html_url,
				description: res.data.description,
				partial: ejs.render(partialTemplate, res.data),
				image: res.data.owner.avatar_url
			};
		} catch (e) {
			return null;
		}
	}
};