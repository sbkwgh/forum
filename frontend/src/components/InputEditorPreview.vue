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
						getURL (link) {
							let page = link.pathname.split('/').slice(-1)[0];
							let countryVersion = link.hostname.split('.')[0];
							
							return `https://${countryVersion}.wikipedia.org/api/rest_v1/page/summary/${page}?redirect=true`;
						},
						getContent (link, data) {
							let content = `
								<h2>
									<a
										href='${data.content_urls.desktop.page}'
										target='_blank'
										rel='noopener noreferrer'
									>
										${data.titles.display}
									</a>
									<span>from ${link.hostname}</span>
								</h2>
								${data.extract.slice(0, 500).trim()}
							`;

							if(data.extract.length > 500) {
								content += '...';
							}

							return content;
						}
					},
					'github': {
						hostnameRegExp: /github\.com/,
						getURL (link) {
							return 'https://api.github.com/repos' + link.pathname;
						},
						getContent (link, data) {
							let content = `
								<h2>
									<a
										href='${data.html_url}'
										target='_blank'
										rel='noopener noreferrer'
									>
										${data.full_name}
									</a>
									<span>from ${link.hostname}</span>
								</h2>
								${data.description}
							`;

							return content;
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

						if(expand.hostnameRegExp.test(link.hostname)) {
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
								let div = document.createElement('div');

								div.innerHTML = expandPattern.getContent(link, res.data);
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