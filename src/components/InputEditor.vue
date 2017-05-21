<template>
	<div
		class='input_editor input_editor--float'
		:class='{
			"input_editor--hidden": !show,
			"input_editor--focus-input": focusInput
		}'
	>
		<div class='input_editor__reply_username' v-if='replyUsername'>Replying to <strong>{{replyUsername}}</strong></div>
		<div class='input_editor__close input_editor__format_button' @click='closeEditor'>&times;</div>
		
		<tab-view :tabs='["Editor", "Preview"]' v-model='showTab' :small-tabs='true'>
			<template slot='Editor'>
				<input-editor-core
					:value='value'
					:error='error'

					@input='emitInput'
					@mentions='emitMentions'
					@focus='setFocusInput(true)'
					@blur='setFocusInput(false)'
				></input-editor-core>
			</template>
			<template slot='Preview'>
				<input-editor-preview :value='value' :mentions='mentions'></input-editor-preview>
			</template>
		</tab-view>
		
		
		<div class='input_editor__submit_bar'>
			<button class='button' @click='submit'>Submit</button>
		</div>
	</div>
</template>

<script>
	import InputEditorCore from './InputEditorCore'
	import InputEditorPreview from './InputEditorPreview'
	import TabView from './TabView'


	export default {
		name: 'InputEditor',
		props: ['value', 'error', 'replyUsername', 'show'],
		components: {
			InputEditorCore,
			InputEditorPreview,
			TabView
		},
		data () {
			return {
				showTab: 0,
				mentions: [],
				focusInput: false
			}
		},
		methods: {
			submit () {
				if(this.value.trim().length) {
					this.$emit('submit');
				}
			},
			closeEditor () {
				this.emitInput('')
				this.$emit('close')
			},
			emitMentions (mentions) {
				this.mentions = mentions
				this.$emit('mentions', mentions)
			},
			emitInput (val) {
				this.$emit('input', val)
			},
			setFocusInput (val) {
				this.focusInput = val
			}
		},
		watch: {
			show (val) {
				let textarea

				if(val) this.showTab = 0

				textarea = this.$el.querySelector('textarea')
				if(textarea) textarea.focus()

			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.input_editor {
		width: 35rem;
		border: 0.125rem solid $color__gray--darker;
		border-bottom: none;
		border-radius: 0.25rem 0.25rem 0 0;
		margin-bottom: 0;
		pointer-events: all;
		transition:  margin-bottom 0.2s, filter 0.2s, border-color 0.2s;
		outline: none;
		position: fixed;
		
		z-index: 2;
		bottom: 0;

		@at-root #{&}--focus-input {
			border-color: $color__gray--darkest;
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

		@at-root #{&}__reply_username {
			position: absolute;
			width: 100%;
			text-align: center;
			top: 0.5rem;
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
	}
</style>