<template>
	<div class='input_editor'>
		<tab-view :tabs='["Editor", "Preview"]' :name='name' small-tabs='true'>
			<template slot='Editor'>
				<div class='input_editor__format_bar'>
					<div class='input_editor__format_button' @click='replaceSelectedText("**", "**")'>B</div>
					<div class='input_editor__format_button' @click='replaceSelectedText("*", "*")'>I</div>
					<div class='input_editor__spacer'></div>
					<div class='input_editor__format_button' @click='showLinkModal("thread_editor--link")'><span class='fa fa-link'></span></div>
					<div class='input_editor__format_button' @click='formatCode'><span class='fa fa-code'></span></div>
					<div class='input_editor__format_button' @click='showModal("thread_editor--picture")'><span class='fa fa-picture-o'></span></div>
				</div>
				<textarea
					class='input_editor__input'
					ref='textarea'
					:value='editor'
					@input='setEditor($event.target.value)'
					placeholder='Type here - you can format using Markdown'
				>
				</textarea>
			</template>

			<div slot='Preview' class='input_editor__markdownHTML'>
				<div v-html='markdownHTML'></div>
				<div v-if='!editor.trim().length' class='input_editor__markdownHTML--empty'>
					Nothing to preview
				</div>
			</div>
		</tab-view>

		<modal-window name='thread_editor--link'>
			<div style='padding: 1rem;'>
				<p style='margin-top: 0;'>
					Enter the web address in the input box below
				</p>
				<fancy-input placeholder='Text for link' width='100%' v-model='linkText'></fancy-input>
				<fancy-input placeholder='Web address for link' width='100%' v-model='linkURL'></fancy-input>
				<button class='button' @click='addLink'>
					OK
				</button>
				<button class='button' @click='hideLinkModal'>
					Cancel
				</button>
			</div>
		</modal-window>

		<modal-window name='thread_editor--picture'></modal-window>

	</div>
</template>

<script>
	import ModalWindow from './ModalWindow'
	import FancyInput from './FancyInput'
	import TabView from './TabView'

	import Marked from 'marked'

	export default {
		name: 'InputEditor',
		props: ['name'],
		components: {
			ModalWindow,
			FancyInput,
			TabView
		},
		data () {
			return {
				linkText: '',
				linkURL: ''
			}
		},
		computed: {
			editor () {
				return this.$store.state.editors[this.name];
			},
			markdownHTML () {
				return Marked(this.editor);
			}
		},
		methods: {
			showImageModal () {
				this.$store.commit('showModal', 'thread_editor--image');
			},
			hideImageModal () {
				this.$store.commit('hideModal', 'thread_editor--image');
			},
			showLinkModal () {
				this.$store.commit('showModal', 'thread_editor--link');
				this.linkText = this.getSelectionData().val;
			},
			hideLinkModal () {
				this.$store.commit('hideModal', 'thread_editor--link');
				this.linkText = '';
				this.linkURL = '';
			},

			setEditor (value) {
				this.$store.commit({
					type: 'setEditor',
					name: this.name,
					value: value
				});
			},
			getSelectionData () {
				var el = this.$refs.textarea,
					start = el.selectionStart,
					end = el.selectionEnd;

				return {
					val: el.value.slice(start, end),
					start,
					end
				};

			},
			replaceSelectedText (before, after) {
				var selectionData = this.getSelectionData();
				var el = this.$refs.textarea;

				this.setEditor(
					this.editor.slice(0, selectionData.start) +
					before + selectionData.val + after +
					this.editor.slice(selectionData.end)
				);
				el.focus();

				setTimeout(function() {
					el.selectionStart = selectionData.start + before.length;
					el.selectionEnd = selectionData.end + before.length;
				}, 1);
			},
			addLink () {
				var linkTextLength = this.linkText.length;
				var selectionData = this.getSelectionData();
				var el = this.$refs.textarea;

				this.setEditor(
					this.editor.slice(0, selectionData.start) +
					'[' + this.linkText + '](' + this.linkURL + ')' +
					this.editor.slice(selectionData.end)
				);
				el.focus();

				setTimeout(function() {
					el.selectionStart = selectionData.start + 1;
					el.selectionEnd = selectionData.start + 1 + linkTextLength;
				}, 1);

				this.hideLinkModal();
			},
			formatCode () {
				var selectionData = this.getSelectionData();

				if(this.editor[selectionData.start-1] === '\n' || selectionData.start === 0) {
					this.replaceSelectedText('    ', '');
				} else {
					this.replaceSelectedText('`', '`');
				}
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.input_editor {
		width: 35rem;
		border: 0.125rem solid $color__gray--primary;
		position: relative;

		&:hover {
			border-color: $color__gray--darker;
		}
		&:focus {
			border-color: $color__gray--darkest;
		}

		@at-root #{&}__format_bar {
			width: auto;
			position: absolute;
			height: 2rem;
			top: 0.25rem;
			right: 0;
			background-color: transparent;
			display: flex;
			align-items: center;
			padding: 0 0.125rem;
		}
		@at-root #{&}__format_button {
			height: 1.5rem;
			width: 1.5rem;
			text-align: center;
			line-height: 1.4rem;
			cursor: pointer;
			@include user-select(none);
			@include text($font--role-default, 1rem, 600);
			color: $color__darkgray--primary;
			border: thin solid $color__gray--primary;
			transition: background-color 0.2s;
			margin: 0;

			&:hover {
				background-color: $color__gray--darker;
			}
			&:active {
				background-color: $color__gray--darkest;
			}
		}

		@at-root #{&}__spacer {
			width: 0.6rem;
		}

		@at-root #{&}__input {
			width: 100%;
			height: 8rem;
			border: 0;
			padding: 0.5rem;
			@include text;
			outline: none;
			resize: none;

			@include placeholder {
				@include text($font--role-emphasis, 1rem);
				display: flex;
				align-content: center;
				@include user-select(none);
				cursor: default;
				color: $color__gray--darker;
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
				align-content: center;
				@include user-select(none);
				cursor: default;
				color: $color__gray--darker;
			}
		}
	}
</style>