<template>
	<div class='input_editor'>
		<div class='input_editor__format_bar'>
			<div class='input_editor__format_button'>B</div>
			<div class='input_editor__format_button'>I</div>
			<div class='input_editor__spacer'></div>
			<div class='input_editor__format_button'><span class='fa fa-link'></span></div>
			<div class='input_editor__format_button'><span class='fa fa-code'></span></div>
			<div class='input_editor__format_button'><span class='fa fa-picture-o'></span></div>
		</div>
		<textarea class='input_editor__input'></textarea>
	</div>
</template>

<script>
	export default {
		name: 'InputEditor'
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