export default {
	install (Vue) {
		//Takes a HTML string then parses it and replaces appropriate
		//links with the relevant expansion
		//Returns a callback with the 'expanded' HTML string
		Vue.prototype.$linkExpander = function (HTML, cb) {
			let parsed = document.createElement('div');
			parsed.innerHTML = HTML;

			let expandPatterns = {
				'wikipedia': {
					hostnameRegExp: /[a-z]+\.wikipedia\.org/,
					pathnameRegExp: /\/wiki\/.+/,
					getURL (link) {
						let page = link.pathname.split('/').slice(-1)[0];
						let countryVersion = link.hostname.split('.')[0];
						
						return `https://${countryVersion}.wikipedia.org/api/rest_v1/page/summary/${page}?redirect=true`;
					},
					getContent (link, data) {
						let content = data.extract.slice(0, 500).trim();

						return {
							title: data.titles.display,
							URL: data.content_urls.desktop.page,
							content: content.length > 500 ? content + '...' : content
						}
					}
				},
				'github': {
					hostnameRegExp: /github\.com/,
					pathnameRegExp: /\/.+\/.+/,
					getURL (link) {
						return 'https://api.github.com/repos' + link.pathname;
					},
					getContent (link, data) {
						return {
							title: data.full_name,
							URL: data.html_url,
							content: data.description
						}
					}
				}
			};

			let links = Array
				.from(parsed.querySelectorAll('p a[href]'))
				.filter(a => {
					return (
						a.parentNode.parentNode === parsed &&
						a.parentNode.childNodes.length === 1 &&
						a.innerHTML === a.href
					)
				});

			let expandableLinks = {};

			links.forEach(link => {
				for(let expandName in expandPatterns) {
					let expand = expandPatterns[expandName];

					if(
						expand.hostnameRegExp.test(link.hostname) &&
						expand.pathnameRegExp.test(link.pathname)
					) {
						if(!expandableLinks[expandName]) {
							expandableLinks[expandName] = [];
						}

						expandableLinks[expandName].push(link);

						break;
					}
				}
			});

			for(let expandName in expandableLinks) {
				let expandPattern = expandPatterns[expandName];

				expandableLinks[expandName].forEach(link => {
					let URL = expandPattern.getURL(link);

					Vue.axios
						.get(URL)
						.then(res => {
							let content = expandPattern.getContent(link, res.data);
							let h = document.createElement.bind(document);
							
							let div = h('div');
							let h2 = h('h2');
							let a = h('a');
							let span = h('span');
							let textNode = document.createTextNode(content.content);

							a.textContent = content.title;
							a.href = content.URL;
							a.setAttribute('target', '_blank');
							a.setAttribute('rel', 'noopener noreferrer');
							span.textContent = 'from ' + link.hostname;

							h2.appendChild(a);
							h2.appendChild(span);
							div.appendChild(h2)
							div.appendChild(textNode)

							div.classList.add('input_editor_preview__expandable');
							link.parentNode.replaceChild(div, link);

							completedAPICall();
						})
						.catch(completedAPICall);
				});
			}

			let completed = 0;
			let completedAPICall = () => {
				completed++;

				if(completed === links.length) {
					cb(parsed.innerHTML);
				}
			}
		}
	}
}