<template>
	<div class='input_editor_preview__markdownHTML'>
		<!--
			A hack to call the getHTML() function, not sure why
			the value watcher function is not working, as it does
			in the ThreadNew page
		!-->
		<div style='display: none;'>{{valueWatch}}</div>

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

	export default {
		name: 'InputEditorPreview',
		props: ['value', 'mentions'],
		data () {
			return {
				HTML: ''
			}
		},
		computed: {
			valueWatch () {
				this.getHTML();
				return '';
			}
		},
		methods: {
			getHTML () {
				let replacedMd = this.value;

				(this.mentions || []).forEach(mention => {
					let regexp = new RegExp('(^|\\s)@' + mention + '($|\\s)')
					replacedMd = replacedMd.replace(regexp, `$1[@${mention}](/user/${mention})$2`)
				})

				let HTML = Marked(replacedMd);

				this.HTML = HTML;
				this.$linkExpander(HTML, v => this.HTML = v);
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.input_editor_preview {
		@at-root #{&}__markdownHTML {
			height: 8.125rem;
			overflow: auto;
			padding: 0.5rem;

			@at-root #{&}--empty {
				@include text($font--role-emphasis, 1rem);
				display: flex;
				margin-top: 0.5rem;
				align-content: center;
				@include user-select(none);
				cursor: default;
				color: $color__darkgray--primary;
			}
		}
	}
</style>