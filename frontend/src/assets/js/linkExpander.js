let cache = {};

export default {
	install (Vue) {
		//Takes a HTML string then parses it and replaces appropriate
		//links with the relevant expansion
		//Returns a callback with the 'expanded' HTML string
		Vue.prototype.$linkExpander = function (HTML, cb) {
			let completed = 0;
			let completedAPICall = () => {
				completed++;

				if(completed === links.length) {
					cb(parsed.innerHTML);
				}
			};

			let replaceLink = (html, link) => {
				if(html.length) {
					let div = document.createElement('div');
					div.innerHTML = html;

					link.parentNode.replaceChild(
						div.children[0],
						link
					);
				}

				completedAPICall();
			};


			let parsed = document.createElement('div');
			parsed.innerHTML = HTML;

			let links = Array
				.from(parsed.querySelectorAll('p a[href]'))
				.filter(a => {
					return (
						a.parentNode.parentNode === parsed &&
						a.parentNode.childNodes.length === 1 &&
						a.innerHTML === a.href
					)
				});

			links.forEach(link => {
				let cached = cache[link.href];

				if(cached) {
					replaceLink(cached, link);
				} else {
					Vue.axios
						.get('/api/v1/link_preview?url=' + link.href)
						.then(res => {
							cache[link.href] = res.data;
							replaceLink(res.data, link);
						})
						.catch(completedAPICall);
				}
			})
		}
	}
}