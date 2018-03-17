let url = require('url');
let ejs = require('ejs');

module.exports = function getPreviewHTML (data) {
	let template = `
		<div class='link_preview'>
			<h1>
				<a href='<%= url %>' target='_blank' rel='noopener noreferrer'>
					<%= title %>
				</a>
			</h1>
			<h2>
				from <%= hostname %>
			</h2>
			<% if(locals.image || locals.description) { %>
				<p>
					<% if(locals.image) { %>
						<img src='<%= image %>'>
					<% } %>
					<% if(locals.description) { %>
						<%= description %>
					<% } %>
				</p>
			<% } %>
		</div>
	`;

	data.hostname = url.parse(data.url).hostname;
	return ejs.render(template, data);
}