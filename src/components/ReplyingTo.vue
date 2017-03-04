<template>
	<info-tooltip class='replying_to' @hover='loadPost'>
		<template slot='content'>
			<div style='margin-top: -0.25rem;'>
				<div class='replying_to__username' v-if='post'>{{post.User.username}}</div>
				<div class='replying_to__date' v-if='post'>{{post.createdAt | formatDate('date|time', ' - ')}}</div>
			</div>
			<div class='replying_to__content' v-if='post' v-html='post.content'></div>
			<template v-else>Loading...</template>
		</template>
		<div
			slot='display'
			class='replying_to__display'
			@click='$emit("click")'
		>
			<span class='fa fa-reply replying_to__icon'></span>
			{{username}}
		</div>
	</info-tooltip>
</template>

<script>
	import InfoTooltip from './InfoTooltip'

	export default {
		name: 'ReplyingTo',
		props: ['replyId', 'username'],
		components: { InfoTooltip },
		data () {
			return {
				post: null
			}
		},
		methods: {
			loadPost () {
				if(this.post) return

				this.axios
					.get('/api/v1/post/' + this.replyId)
					.then((res) => {
						this.post = res.data
					})
			}
		}
	}
</script>

<style lang='scss'>
	@import '../assets/scss/variables.scss';

	.replying_to {
		@at-root #{&}__icon {
			font-size: 0.7rem;
			margin-right: 0.25rem;
			color: rgba(0, 0, 0, 0.87);
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
			cursor: pointer;
			align-items: baseline;
		}
	}
</style>