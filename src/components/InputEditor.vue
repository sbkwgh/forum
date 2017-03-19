<template>
	<div
		class='input_editor'
		:class='{
			"input_editor--focus": focused,
			"input_editor--float": float,
			"input_editor--hidden": !show
		}'
	>
		<error-tooltip :error='error'></error-tooltip>
		<div class='input_editor__reply_username' v-if='replyUsername'>Replying to <strong>{{replyUsername}}</strong></div>
		<div class='input_editor__close input_editor__format_button' @click='closeEditor' v-if='!hideClose'>&times;</div>
		<tab-view :tabs='["Editor", "Preview"]' v-model='showTab' small-tabs='true'>
			<template slot='Editor'>
				<div class='input_editor__format_bar'>
					<div class='input_editor__format_button' @click='replaceSelectedText("**", "**")'>B</div>
					<div class='input_editor__format_button' @click='replaceSelectedText("*", "*")'>I</div>
					<div class='input_editor__format_button' @click='setModalState("link", true)'><span class='fa fa-link'></span></div>
					<div class='input_editor__format_button' @click='formatCode'><span class='fa fa-code'></span></div>
					<div class='input_editor__format_button' @click='setModalState("image", true)'><span class='fa fa-picture-o'></span></div>
				</div>
				<textarea
					class='input_editor__input'
					ref='textarea'
					:value='value'
					@input='setEditor($event.target.value)'
					@focus='focusEditor(true)'
					@blur='focusEditor(false)'
					placeholder='Type here - you can format using Markdown'
				>
				</textarea>
			</template>

			<div slot='Preview' class='input_editor__markdownHTML'>
				<div v-html='markdownHTML' style='margin-top: -0.5rem;'></div>
				<div v-if='!value.trim().length' class='input_editor__markdownHTML--empty'>
					Nothing to preview
				</div>
			</div>
		</tab-view>

		<div class='input_editor__submit_bar' v-if='float'>
			<button class='button' @click='submit'>Submit</button>
		</div>

		<modal-window v-model='linkModalVisible'>
			<div style='padding: 1rem;'>
				<p style='margin-top: 0;'>
					Enter the web address in the input box below
				</p>
				<fancy-input placeholder='Text for link' width='100%' v-model='linkText'></fancy-input>
				<fancy-input placeholder='Web address for link' width='100%' v-model='linkURL'></fancy-input>
				<button class='button' @click='addLink'>
					OK
				</button>
				<button class='button' @click='setModalState("link", false)'>
					Cancel
				</button>
			</div>
		</modal-window>

		<modal-window v-model='imageModalVisible'></modal-window>

	</div>
</template>

<script>
	import ModalWindow from './ModalWindow'
	import FancyInput from './FancyInput'
	import TabView from './TabView'
	import ErrorTooltip from './ErrorTooltip'

	import Marked from 'marked'

	Marked.setOptions({
		highlight: function (code) {
			return require('highlight.js').highlightAuto(code).value;
		},
		sanitize: true
	});

	export default {
		name: 'InputEditor',
		props: ['value', 'float', 'replyUsername', 'hideClose', 'show', 'error'],
		components: {
			ModalWindow,
			FancyInput,
			TabView,
			ErrorTooltip
		},
		data () {
			return {
				linkText: '',
				linkURL: '',
				focused: false,
				linkModalVisible: false,
				imageModalVisible: false,
				showTab: 0
			}
		},
		computed: {
			markdownHTML () {
				return Marked(this.value);
			}
		},
		methods: {
			submit () {
				if(this.value.trim().length) {
					this.$emit('submit');
				}
			},
			focusEditor (val) {
				this.focused = val;
			},
			setModalState (modal, state) {
				if(modal === 'link') {
					this.linkModalVisible = state

					if(state) {
						this.linkText = this.getSelectionData().val;
					} else {
						this.linkText = '';
						this.linkURL = '';
					}
				} else if(modal === 'image') {
					this.imageModalVisible = state
				}
			},
			closeEditor () {
				this.setEditor('')
				this.$emit('close')
			},
			setEditor (value) {
				this.$emit('input', value)
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
					this.value.slice(0, selectionData.start) +
					before + selectionData.val + after +
					this.value.slice(selectionData.end)
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
					this.value.slice(0, selectionData.start) +
					'[' + this.linkText + '](' + this.linkURL + ')' +
					this.value.slice(selectionData.end)
				);
				el.focus();

				setTimeout(function() {
					el.selectionStart = selectionData.start + 1;
					el.selectionEnd = selectionData.start + 1 + linkTextLength;
				}, 1);

				this.setModalState('link', false);
			},
			formatCode () {
				var selectionData = this.getSelectionData();

				if(this.value[selectionData.start-1] === '\n' || selectionData.start === 0) {
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
		border: 0.125rem solid $color__gray--darker;
		position: relative;

		margin-bottom: 0;
		pointer-events: all;
		opacity: 1;
		transition:  margin-bottom 0.2s, opacity 0.2s;

		@at-root #{&}--focus {
			border-color: $color__gray--darkest;
		}

		@at-root #{&}--float {
			position: fixed;
			border-bottom: none;
			z-index: 2;
			bottom: 0;
		}

		@at-root #{&}--hidden {
			pointer-events: none;
			opacity: 0;
			margin-bottom: -3rem;
			transition:  margin-bottom 0.2s, opacity 0.2s;
		}


		@at-root #{&}__close {
			position: absolute;
			right: 0.3rem;
			top: 0.5rem;
		}

		@at-root #{&}__reply_username {
			position: absolute;
			width: 100%;
			text-align: center;
			top: 0.5rem;
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
			margin-right: 2.4rem;
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
				margin-top: 1rem;
				align-content: center;
				@include user-select(none);
				cursor: default;
				color: $color__gray--darker;
			}
		}

		@at-root #{&}__submit_bar {
			display: flex;
			justify-content: flex-end;
			height: 2rem;
			align-items: center;
			padding-right: 0.3rem;
			background-color: $color__gray--primary;

			button {
				font-size: 0.8rem;
				height: 1.5rem;
				padding: 0 0.25rem;
				border-color: $color__gray--darkest;
			}
		}

		@at-root #{&}__error {
			position: absolute;
			background-color: #ffeff1;
			border: 0.125rem solid #D32F2F;
			font-size: 0.9rem;
			padding: 0.1rem 0.25rem;
			top: 0.2125rem;
			left: calc(100% + 0.25rem);
			white-space: nowrap;
			

			&:first-letter{ text-transform: capitalize; }

			opacity: 0;
			pointer-events: none;
			margin-top: -1rem;
			transition: opacity 0.2s, margin-top 0.2s;

			@at-root #{&}--show {
				opacity: 1;
				pointer-events: all;
				margin-top: 0;
				transition: opacity 0.2s, margin-top 0.2s;
			}

			&::after {
				content: '';
				position: relative;
				width: 0;
				height: 0;
				display: inline-block;
				right: calc(100% + 0.3rem);
				border-top: 0.3rem solid transparent;
				border-bottom: 0.3rem solid transparent;
				border-right: 0.3rem solid #D32F2F;
			}
		}
	}
</style>