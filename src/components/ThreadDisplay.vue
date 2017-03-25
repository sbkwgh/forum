<template>
	<div
		class='thread_display'
		:style='{"border-left-color" : thread.Category.color}'
		@click='goToThread'
	>
		<avatar-icon ref='avatar' :user='thread.User' size='small' class='thread_display__icon'></avatar-icon>
		<div style='width: 100%;'>
			<div class='thread_display__header'>
				<span class='thread_display__name'>
					{{thread.name}}
				</span>
				<div class='thread_display__meta'>
					<div>
						<span class='thread_display__username' ref='username' @click='goToUser'>{{thread.User.username}}</span>
						<span class='thread_display__date'>{{thread.createdAt | formatDate}}</span>
					</div>
					<div class='thread_display__replies' title='Replies to thread'>
						<span class='fa fa-comment-o fa-fw'></span>
						{{thread.postsCount - 1}}
					</div>
				</div>
			</div>
			<div class='thread_display__content'>
				{{thread.Posts[0].content | stripTags | truncate(150)}}
			</div>
		</div>
	</div>
</template>

<script>	
	import AvatarIcon from './AvatarIcon'

	export default {
		name: 'ThreadDisplay',
		props: ['thread'],
		components: {
			AvatarIcon
		},
		methods: {
			goToUser () {
				this.$router.push('/user/' + this.thread.User.username)
			},
			goToThread (e) {
				if(
					this.$route.path.split('/')[1] === 'user' ||
					this.$refs.username === e.target
				) return

				this.$router.push('/thread/' + this.thread.slug + '/' + this.thread.id)
			},
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.thread_display {
		display: flex;
		padding: 0.5rem;
		margin-bottom: 1rem;
		border-left: 0.25rem solid;
		transition: background-color 0.2s;
		position: relative;

		&:after {
			content: '';
			position: absolute;
			width: calc(100% + 0.25rem);
			bottom: -0.5rem;
			left: -0.25rem;
			border-bottom: thin solid $color--lightgray__primary;
		}

		&:hover {
			background-color: $color--lightgray__primary;
		}
		&:active {
			background-color: $color--lightgray__darker;
		}

		@at-root #{&}__icon {
			margin-right: 0.5rem;
		}

		@at-root #{&}__name {
			font-weight: 500;
			font-size: 1.25rem;
			cursor: default;
		}
		@at-root #{&}__meta {
			display: flex;
			justify-content: space-between;
		}
		@at-root #{&}__replies {
			cursor: default;
		}
		@at-root #{&}__username {
			margin-right: 0.25rem;
			cursor: pointer;
			transition: opacity 0.2s;

			&:hover {
				opacity: 0.75;
			}
		}	
		@at-root #{&}__date {
			color: $color--gray__darkest;
			cursor: default;
		}
		@at-root #{&}__content {
			margin-top: 0.5rem;
			word-break: break-all;
		}
	}
</style>