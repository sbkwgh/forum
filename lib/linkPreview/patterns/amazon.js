let ejs = require('ejs');
let cheerio = require('cheerio');
let axios = require('axios');

module.exports = {
	matches (url) {
		let amazonRegExp = /^(https?:\/\/(www\.)?(smile.)?(amazon|amzn)\.(com|com\.au|com\.br|ca|cn|fr|de|in|it|co\.jp|com\.mx|nl|es|co\.uk)\/(gp\/product|[A-Z0-9-]+\/dp)\/[A-Z0-9]+)/i;
		return url.match(amazonRegExp);
	},
	async getPreviewData (link_url) {
		try {
			let res = await axios.get(link_url);
			let $ = cheerio.load(res.data);

			data = {
				title: $('#productTitle').text().trim(),
				description: $('meta[name="description"]').attr('content').trim(),
				url: this.matches(link_url)[0]
			}
			
			let image = $('#landingImage').data('old-hires');
			if(image) data.image = image;

			let price = $('#priceblock_ourprice').text();
			let stars = $('.a-icon.a-icon-star .a-icon-alt').first().text();
			if(stars ||price) {
				let reviewUrl = data.url + '#customerReviews';
				let partialTemplate = `
					<% if (stars) { %>
						<a href='<%= reviewUrl %>' target='_blank' rel='noopener noreferer'>
							<%= stars%>
						</a>
						&nbsp; | &nbsp;
					<% } %>
					<% if (price) { %>
						<%= price %>
					<% } %>
				`;

				data.partial = ejs.render(partialTemplate, { reviewUrl, stars, price })
			}

			return data;
		} catch (e) {
			console.log(e)
			return null;
		}
	}
};