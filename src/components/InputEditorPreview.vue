<template>
	<div class='input_editor_preview__markdownHTML'>
		<div v-html='HTML' style='margin-top: -0.5rem;'></div>
		<div v-if='!value.trim().length' class='input_editor_preview__markdownHTML--empty'>
			Nothing to preview
		</div>
	</div>
</template>

<script>
	import Marked from 'marked'

	Marked.setOptions({
		highlight: function (code) {
			return require('highlight.js').highlightAuto(code).value;
		},
		sanitize: true
	});

	export default {
		name: 'InputEditorPreview',
		props: ['value'],
		computed: {
			HTML () {
				let replacedMd = this.value.replace(/@[^\s]+/g, match => {
					return `[${match}](/user/${match.slice(1)})`
				})

				return Marked(replacedMd);
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