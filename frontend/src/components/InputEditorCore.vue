<template>
	<div
		class='input_editor_core'
	>
		<error-tooltip :error='error'></error-tooltip>
		<div>
			<div class='input_editor_core__format_bar'>
				<div
					class='input_editor_core__format_button'
					title='Emoji'
				>
					<emoji-selector></emoji-selector>
				</div>
				<div
					class='input_editor_core__format_button'
					title='Bold (ctrl + b)'
					@click='replaceSelectedText("__", "__")'
				>
					B
				</div>
				<div
					class='input_editor_core__format_button'
					title='Italic (ctrl + i)'
					@click='replaceSelectedText("*", "*")'
				>
					I
				</div>
				<div
					class='input_editor_core__format_button'
					title='Link (ctrl + l)'
					@click='setModalState("link", true)'
				>
					<span class='fa fa-link'></span>
				</div>
				<div
					class='input_editor_core__format_button'
					title='Code (ctrl + k)'
					@click='formatCode'
				>
					<span class='fa fa-code'></span>
				</div>
			</div>
			<textarea
				class='input_editor_core__input'
				placeholder='Type here - you can format using Markdown'

				ref='textarea'
				:value='value'

				@input='setEditor($event.target.value)'
				@focus='$emit("focus")'
				@blur='$emit("blur")'
				
				@keydown.ctrl.66='replaceSelectedText("__", "__")'
				@keydown.ctrl.73='replaceSelectedText("*", "*")'
				@keydown.ctrl.76='setModalState("link", true)'
				@keydown.ctrl.75='formatCode'
			>
			</textarea>
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
	import EmojiSelector from './EmojiSelector'

	let usernames = {}

	export default {
		name: 'InputEditorCore',
		props: ['value', 'error'],
		components: {
			ModalWindow,
			FancyInput,
			ErrorTooltip,
			EmojiSelector
		},
		data () {
			return {
				linkText: '',
				linkURL: '',
				linkModalVisible: false,
				imageModalVisible: false,
			}
		},
		methods: {
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
			checkUsernames (matches) {
				let doneCount = 0
				let mentions = []

				let done = res => {
					doneCount++

					if(res) mentions.push(res)

					if(doneCount === matches.length) {
						this.$emit('mentions', mentions)
					}
				}

				matches.forEach(match => {
					this.checkUsername(match, done)
				})

			},
			checkUsername (match, cb) {
				let username = match.trim().slice(1)
				let checkedUsername = usernames[username]

				if(checkedUsername !== undefined) {
					cb(checkedUsername)
				} else if(checkedUsername === undefined) {				
					this.axios
						.get('/api/v1/user/' + username)
						.then(_ => {
							usernames[username] = username
							cb(username)
						})
						.catch(_ => {
							usernames[username] = null
							cb(null)
						})
				}
			},
			setEditor (value) {
				let matches = value.match(/(^|\s)@[^\s]+/g) || []
				this.checkUsernames(matches)

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

				if(
					this.value.substr(selectionData.start - before.length, before.length) === before &&
					this.value.substr(selectionData.end, after.length) === after
				) {
					this.setEditor(
						this.value.slice(0, selectionData.start - before.length) +
						selectionData.val +
						this.value.slice(selectionData.end + after.length)
					);
					setTimeout(function() {
						el.selectionStart = selectionData.start - before.length;
						el.selectionEnd = selectionData.end - after.length;
					}, 0);
				} else {
					this.setEditor(
						this.value.slice(0, selectionData.start) +
						before + selectionData.val + after +
						this.value.slice(selectionData.end)
					);
					setTimeout(function() {
						el.selectionStart = selectionData.start + before.length;
						el.selectionEnd = selectionData.end + after.length;
					}, 0);
				}

				el.focus();
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
				}, 0);

				this.setModalState('link', false);
			},
			formatCode (e) {
				e.preventDefault()

				var selectionData = this.getSelectionData();

				if(this.value[selectionData.start-1] === '\n' || selectionData.start === 0) {
					var el = this.$refs.textarea;
					var matches = ( selectionData.val.match(/\n/g) || [] ).length
					var replacedText = '    ' + selectionData.val.replace(/\n/g, '\n    ')

					this.setEditor(
						this.value.slice(0, selectionData.start) +
						replacedText +
						this.value.slice(selectionData.end)
					);
					el.focus();

					setTimeout(function() {
						el.selectionStart = selectionData.start + 4;
						el.selectionEnd = selectionData.end + (matches + 1)*4;
					}, 0);
				} else {
					this.replaceSelectedText('`', '`');
				}
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.input_editor_core {
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
			border-radius: 0.25rem;
			text-align: center;
			line-height: 1.4rem;
			cursor: pointer;
			@include user-select(none);
			@include text($font--role-default, 1rem, 600);
			color: $color__darkgray--primary;
			border: thin solid $color__gray--primary;
			transition: background-color 0.2s;
			margin: 0 0.25rem;

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