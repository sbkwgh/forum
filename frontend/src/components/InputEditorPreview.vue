<template>
	<div class='input_editor_preview__markdownHTML'>
		<div v-html='HTML' style='margin-top: -0.5rem;'></div>
		<div v-if='!value.trim().length' class='input_editor_preview__markdownHTML--empty'>
			Nothing to preview
		</div>
	</div>
</template>

<script>
	import throttle from 'lodash.throttle'
	import Marked from 'marked'

	Marked.setOptions({
		highlight: function (code) {
			return require('highlight.js').highlightAuto(code).value;
		},
		sanitize: true
	});

	let usernames = {}

	export default {
		name: 'InputEditorPreview',
		props: ['value', 'mentions'],
		data () {
			return {
				HTML: ''
			}
		},
		watch: {
			value: 'getHTML'
		},
		methods: {
			getHTML () {
				let replacedMd = this.value;

				(this.mentions || []).forEach(mention => {
					let regexp = new RegExp('(^|\\s)@' + mention + '($|\\s)')
					replacedMd = replacedMd.replace(regexp, `$1[@${mention}](/user/${mention})$2`)
				})

				let HTML = Marked(replacedMd);

				this.expandURLs(HTML)
				this.HTML = HTML;
			},
			expandURLs (HTML) {
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

						this.axios
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
								span.textContent = 'from ' + link.hostname;

								h2.appendChild(a);
								h2.appendChild(span);
								div.appendChild(h2)
								div.appendChild(textNode)

								div.classList.add('input_editor_preview__expandable');
								link.parentNode.replaceChild(div, link);

								completedAPICall();
							})
							.catch(e => {
								completedAPICall();
							})
					});
				}

				let completed = 0;
				let completedAPICall = () => {
					completed++;

					if(completed === links.length) {
						this.HTML = parsed.innerHTML;
					}
				}
			}
		}
	}
</script>

<style lang='scss'>
	@import '../assets/scss/variables.scss';

	.input_editor_preview {
		@at-root #{&}__expandable {
			border: thick solid $color__gray--primary;
			padding: 0.5rem;

			h2 {
				margin: 0;
				margin-bottom: 0.5rem;
				font-size: 1.25rem;
			}

			span {
				margin-left: 0.25rem;
				font-size: 1rem;
				font-weight: 400;
				color: $color__darkgray--primary;
			}
		}

		@at-root #{&}__markdownHTML {
			height: 8.2rem;
			overflow: auto;
			word-break: break-word;
			padding: 0.5rem;

			@at-root #{&}--empty {
				@include text($font--role-emphasis, 1rem);
				display: flex;
				margin-top: 0.5rem;
				align-content: center;
				@include user-select(none);
				cursor: default;
				color: $color__gray--darker;
			}
		}
	}
</style>