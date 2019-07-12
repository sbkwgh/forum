<template>
	<info-tooltip class='post_reply' :class='{"post_reply--hover": hover, "post_reply--first": first}'>
		<template slot='content'>
			<div style='margin-top: -0.25rem;'>
				<div class='post_reply__username'>{{user.username}}</div>
				<div class='post_reply__date'>{{post.createdAt | formatDate('date|time', ' - ')}}</div>
			</div>
			<div class='post_reply__content'>{{post.content | stripTags | truncate(100)}}</div>
		</template>
		<div
			slot='display'
			class='post_reply__display'
			@click.stop='$emit("click")'
		>
			<div
				class='post_reply__letter'
				:style='{"background-color": user.color}'
			>
				{{user.letter}}
			</div>
		</div>
	</info-tooltip>
</template>

<script>
	import InfoTooltip from './InfoTooltip'

	export default {
		name: 'PostReply',
		props: ['post', 'hover', 'first'],
		components: { InfoTooltip },
		computed: {
			user () {
				if(this.post.User) {
					return Object.assign({
						letter: this.post.User.username[0]
					}, this.post.User)
				} else {
					return {
						letter: ' ',
						color: null,
						username: '[deleted]'
					}
				}
			}
		}
	}
</script>

<style lang='scss'>
	@import '../assets/scss/variables.scss';

	.post_reply {
		transition: all 0.2s;
		margin-left: -0.4rem;

		&:first-child {
			margin-left: 0rem;
		}

		@at-root #{&}--hover {
			margin: 0 0.125rem;
		}

		@at-root #{&}--first {
			margin-left: 0;
		}


		@at-root #{&}__date  {
			display: inline-block;
			color: $color__gray--darkest;
			font-size: 0.8rem;
		}
		@at-root #{&}__username {
			display: inline-block;
			font-size: 0.9rem;
			color: #000;
		}

		@at-root #{&}__content {
			*:first-child, *:last-child {
				margin: 0;
			}
			p {
				margin: 0.25rem 0;
			}
		}

		@at-root #{&}__display {
			display: inline-flex;
			align-items: baseline;
			justify-content: center;
			position: relative;
			border-radius: 1rem;
			cursor: pointer;

			@at-root #{&}--no_hover {
				pointer-events: none;
			}
		}
		@at-root #{&}__letter {
			height: 1.25rem;
			width: 1.25rem;
			display: flex;
			align-items: center;
			justify-content: center;
			@include text($font--role-emphasis, 1rem)
			border-radius: 100%;
			background-color: $color__gray--darkest;
			color: #fff;
		}
	}
</style>