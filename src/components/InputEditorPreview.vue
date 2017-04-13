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
		props: ['value'],
		data () {
			return {
				value_: this.value
			}
		},
		methods: {
			replaceUsername (match) {
				let username = match.slice(1)
				let link = usernames[username]
				let regexp = new RegExp('(^|\\s)' + match + '($|\\s)')

				if(link) {
					this.$nextTick(() => {
						this.value_ = this.value_.replace(regexp, '$1' + link + '$2')
					})
				} else if(link === undefined) {				
					this.axios
						.get('/api/v1/user/' + username)
						.then(_ => {
							let newLink = `[${match}](/user/${username})`

							this.$nextTick(() => {
								this.value_ = this.value_.replace(regexp, '$1' + newLink + '$2')
							})
							usernames[username] = newLink
						})
						.catch(_ => {
							usernames[username] = null
						})
				}
			}
		},
		computed: {
			HTML () {
				return Marked(this.value_);
			}
		},
		watch: {
			value (val) {
				let matches = val.match(/@[^\s]+/g) || []
				matches.forEach(match => {
					this.replaceUsername(match)
				})

				this.value_ = val
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.input_editor_preview {
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