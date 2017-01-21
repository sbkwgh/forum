<template>
	<div class='input_editor'>
		<modal-window name='thread_editor--link'>
			<div style='padding: 1rem;'>
				<p style='margin-top: 0;'>
					Enter the web address in the input box below
				</p>
				<fancy-input placeholder='Web address for link' width='100%' v-model='linkURL'></fancy-input>
				<fancy-input placeholder='Text for link' width='100%' v-model='linkText'></fancy-input>
				<button class='button' @click='addLink'>
					OK
				</button>
				<button class='button' @click='hideModal("thread_editor--link")'>
					Cancel
				</button>
			</div>
		</modal-window>
		<modal-window name='thread_editor--picture'></modal-window>
		<div class='input_editor__format_bar'>
			<div class='input_editor__format_button' @click='replaceSelectedText("**", "**")'>B</div>
			<div class='input_editor__format_button'>I</div>
			<div class='input_editor__spacer'></div>
			<div class='input_editor__format_button' @click='showModal("thread_editor--link")'><span class='fa fa-link'></span></div>
			<div class='input_editor__format_button'><span class='fa fa-code'></span></div>
			<div class='input_editor__format_button' @click='showModal("thread_editor--picture")'><span class='fa fa-picture-o'></span></div>
		</div>
		<textarea class='input_editor__input' ref='textarea' :value='editor' @input='setEditor($event.target.value)'></textarea>
	</div>
</template>

<script>
	import ModalWindow from './ModalWindow'
	import FancyInput from './FancyInput'

	export default {
		name: 'InputEditor',
		props: ['name'],
		components: {
			ModalWindow,
			FancyInput
		},
		data () {
			return {
				linkText: '',
				linkURL: '',
				textarea: ''
			}
		},
		computed: {
			editor () {
				return this.$store.state.editors[this.name];
			}
		},
		methods: {
			showModal (name) {
				this.$store.commit('showModal', name);
			},
			hideModal (name) {
				this.$store.commit('hideModal', name);
			},
			addLink () {
				this.$store.commit('hideModal', 'thread_editor--link');
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

				var updatedTextarea =
					this.editor.slice(0, selectionData.start) +
					before +
					selectionData.val +
					after +
					this.editor.slice(selectionData.end);

				this.setEditor(updatedTextarea);
				el.focus();

				setTimeout(function() {
					el.selectionStart = selectionData.start + before.length;
					el.selectionEnd = selectionData.end + after.length;
				}, 1)
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.input_editor {
		width: 35rem;
		border: 0.125rem solid $color__gray--primary;

		&:hover {
			border-color: $color__gray--darker;
		}
		&:focus {
			border-color: $color__gray--darkest;
		}

		@at-root #{&}__format_bar {
			width: 100%;
			height: 2rem;
			background-color: $color__darkgray--primary;
			display: flex;
			align-items: center;
			padding: 0 0.25rem;
		}
		@at-root #{&}__format_button {
			height: 1.5rem;
			width: 1.5rem;
			text-align: center;
			font-weight: bold;
			line-height: 1.4rem;
			cursor: pointer;
			@include user-select(none);
			color: $color__lightgray--primary;
			border: thin solid $color__lightgray--primary;
			transition: background-color 0.2s;
			margin: 0 0.2rem;

			&:hover {
				background-color: $color__darkgray--darker;
			}
			&:active {
				background-color: $color__darkgray--darkest;
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
		}
	}
</style>