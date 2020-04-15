<template>
	<info-tooltip class='replying_to' @hover='loadPost'>
		<template slot='content'>
			<div style='margin-top: -0.25rem;'>
				<div class='replying_to__username' v-if='post'>{{postUsername}}</div>
				<div class='replying_to__date' v-if='post'>{{post.createdAt | formatDate('date|time', ' - ')}}</div>
			</div>
			<div class='replying_to__content' v-if='post'>{{post.content | stripTags | truncate(100)}}</div>
			<template v-else>Loading...</template>
		</template>
		<div
			slot='display'
			class='replying_to__display'
			@click.stop='$emit("click")'
		>
			<font-awesome-icon :icon='["fa", "reply"]' class='replying_to__icon' />
			{{username || '[deleted]'}}
		</div>
	</info-tooltip>
</template>

<script>
	import InfoTooltip from './InfoTooltip'
	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'ReplyingTo',
		props: ['replyId', 'username'],
		components: { InfoTooltip },
		data () {
			return {
				post: null
			}
		},
		computed: {
			postUsername () {
				if(this.post.User) {
					return this.post.User.username
				} else {
					return '[deleted]'
				}
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
					.catch(AjaxErrorHandler(this.$store))
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