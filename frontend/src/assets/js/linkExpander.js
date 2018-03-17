import debounce from 'lodash.debounce'

export default {
	install (Vue) {
		//Takes a HTML string then parses it and replaces appropriate
		//links with the relevant expansion
		//Returns a callback with the 'expanded' HTML string
		Vue.prototype.$linkExpander = debounce(function (HTML, cb) {
			console.log(cb)
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
				Vue.axios
					.get('/api/v1/link_preview?url=' + link.href)
					.then(res => {
						if(res.data.length) {
							let div = document.createElement('div');
							div.innerHTML = res.data;

							link.parentNode.replaceChild(
								div.children[0],
								link
							);
						}

						completedAPICall();
					})
					.catch(completedAPICall);
			})

			let completed = 0;
			let completedAPICall = () => {
				completed++;

				if(completed === links.length) {
					cb(parsed.innerHTML);
				}
			}
		}, 1000);
	}
}