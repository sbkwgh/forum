<template>
	<div class='emoji_selector'>
		<div
			class='emoji_selector__overlay'
			:class='{ "emoji_selector__overlay--show" : value }'
			@click='$emit("input", false)'
		></div>

		<div
			class='emoji_selector__tooltip'
			:class='{
				"emoji_selector__tooltip--show" : value,
				"emoji_selector__tooltip--right" : rightAlign
			}'
		>
			<template v-for='row in emojis'>
				<div class='emoji_selector__title'>{{row.title}}</div>
				<div class='emoji_selector__row'>
					<span
						class='emoji_selector__emoji'
						v-for='emoji in row.emojis'
						@click='emitEmoji(emoji)'
					>{{emoji}}</span>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'EmojiSelector',
		props: ['value', 'right-align'],
		data () {
			return {
				emojis: [
					{ title: 'smileys', emojis: [
						'😀' , '😃' , '😄' , '😁' , '😆' , '😅' , '😂' , '🤣' , '😊' , '😇' , '🙂' , '🙃' , '😉' , '😌' , '😍' , '😘' , '😗' , '😙' , '😚' , '😋' , '😜' , '😝' , '😛' , '🤑' , '🤗' , '🤓' , '😎' , '🤡' , '🤠' , '😏' , '😒' , '😞' , '😔' , '😟' , '😕' , '🙁' , '😣' , '😖' , '😫' , '😩' , '😤' , '😠' , '😡' , '😶' , '😐' , '😑' , '😯' , '😦' , '😧' , '😮' , '😲' , '😵' , '😳' , '😱' , '😨' , '😰' , '😢' , '😥' , '🤤' , '😭' , '😓' , '😪' , '😴' , '🙄' , '🤔' , '🤥' , '😬' , '🤐'
					]},
					{ title: 'people', emojis: [
						'👶' , '👦' , '👧' , '👨' , '👩' , '👱‍♀️' , '👱' , '👴' , '👵' , '👲' , '👳‍♀️' , '👳' , '👮‍♀️' , '👮', '💁', '💁‍♂️', '🙅', '🙅‍♂️', '🙆', '🙆‍♂️', '🙋', '🙋‍♂️', '💃', '🕺', '👯', '👯‍♂️', '🚶‍♀️', '🚶', '🏃‍♀️'
					]},
					{ title: 'animals', emojis: [
						'🐶' , '🐱' , '🐭' , '🐹' , '🐰' , '🦊' , '🐻' , '🐼' , '🐨' , '🐯' , '🦁' , '🐮' , '🐷' , '🐽' , '🐸' , '🐵' , '🙊' , '🙉' , '🙊' , '🐒' , '🐔' , '🐧' , '🐦' , '🐤' , '🐣' , '🐥' , '🦆' , '🦅' , '🦉' , '🦇' , '🐺' , '🐗' , '🐴' , '🦄' , '🐝' , '🐛' , '🦋' , '🐌' , '🐞' , '🐜' , '🕷' , '🐢' , '🐍'
					]},
				]
			}
		},
		methods: {
			emitEmoji (emoji) {
				this.$emit('input', false)
				this.$emit('emoji', emoji)
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.emoji_selector {
		display: inline-block;
		position: absolute;

		@at-root #{&}__overlay {
			pointer-events: none;
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 3;

			@at-root #{&}--show {
				pointer-events: all;
			}
		}

		@at-root #{&}__tooltip {
			pointer-events: none;
			opacity: 0;
			bottom: calc(100% + 3rem);
			transition: all 0.2s;

			position: absolute;
			width: 14rem;
			height: 7rem;
			border-radius: 0.25rem;
			border: 0.125rem solid $color__gray--primary;
			background-color: #fff;
			
			left: 0.25rem;
			box-shadow: 0 10px 10px rgba(0, 0, 0, 0.22);
			cursor: default;
			overflow-y: auto;
			padding: 0 0.375rem;
			z-index: 4;

			@at-root #{&}--show {
				pointer-events: all;
				opacity: 1;
				bottom: calc(100% + 2rem);
			}
			@at-root #{&}--right {
				left: 22.5rem;
			}
		}
		@at-root #{&}__row {
			display: block;
			text-align: left;
			line-height: 1.6rem;
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