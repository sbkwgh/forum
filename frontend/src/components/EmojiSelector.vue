<template>
	<div class='emoji_selector'>
		<span class='fa fa-smile-o' @click='show = true'></span>

		<div class='emoji_selector__tooltip' title='' :class='{ "emoji_selector__tooltip--show" : show }'>
			<div class='emoji_selector__title'>smileys</div>
			<div class='emoji_selector__row'>
				<span class='emoji_selector__emoji'>😀</span>
				<span class='emoji_selector__emoji'>😂</span>
				<span class='emoji_selector__emoji'>😍</span>
				<span class='emoji_selector__emoji'>🤔</span>
				<span class='emoji_selector__emoji'>😘</span>
				<span class='emoji_selector__emoji'>😤</span>
			</div>
			<div class='emoji_selector__title'>people</div>
			<div class='emoji_selector__row'>
				<span class='emoji_selector__emoji'>🤷</span>
				<span class='emoji_selector__emoji'>💁‍</span>
				<span class='emoji_selector__emoji'>🙌</span>
				<span class='emoji_selector__emoji'>🙏</span>
				<span class='emoji_selector__emoji'>👍</span>
				<span class='emoji_selector__emoji'>👎</span>
			</div>
			<div class='emoji_selector__title'>animals</div>
			<div class='emoji_selector__row'>
				<span class='emoji_selector__emoji'>🙈</span>
				<span class='emoji_selector__emoji'>🐶</span>
				<span class='emoji_selector__emoji'>🐱</span>
				<span class='emoji_selector__emoji'>🐖</span>
				<span class='emoji_selector__emoji'>🦄</span>
				<span class='emoji_selector__emoji'>🐍</span>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'EmojiSelector',
		data () {
			return {
				show: false
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.emoji_selector {
		display: inline-block;
		position: relative;

		@at-root #{&}__tooltip {
			pointer-events: none;
			opacity: 0;
			bottom: calc(100% + 2rem);
			transition: all 0.2s;

			position: absolute;
			width: 15rem;
			height: 7rem;
			border-radius: 0.25rem;
			border: 0.125rem solid $color__gray--primary;
			background-color: #fff;
			
			left: -0.25rem;
			box-shadow: 0 10px 10px rgba(0, 0, 0, 0.22);
			cursor: default;
			overflow-y: auto;
			padding: 0 0.375rem;

			@at-root #{&}--show {
				pointer-events: all;
				opacity: 1;
				bottom: 100%;
			}
		}
		@at-root #{&}__row {
			display: block;
			text-align: left;
		}
		@at-root #{&}__title {
			font-weight: bold;
			font-variant: small-caps;
			font-size: 0.9rem;
			text-align: left;
			color: $color__text--primary;
			padding-left: 0.375rem;
		}
		@at-root #{&}__emoji {
			padding: 0.25rem;
			border-radius: 0.25rem;
			transition: all 0.2s;

			&:hover {
				background-color: $color__gray--primary;
			}
			&:active {
				background-color: $color__gray--darker;
			}
		}
	}
</style>