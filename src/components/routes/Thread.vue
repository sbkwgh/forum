<template>
	<div class='route_container'>
		<header class='thread_header'>
			<div class='thread_header__thread_title'>Thread title</div>
			<button class='button thread_header__reply_button'>Reply to thread</button>
		</header>
		<input-editor name='thread' float='true'></input-editor>
		<div class='posts'>
			<div class='post'>
				<div class='post__meta_data'>
					<div class='post__avatar'>U</div>
					<div class='post__user'>Username</div>
					<div class='post__date'>17:34 21/01/17</div>
				</div>
				<div class='post__content'>
					Consectetur rhoncus a massa interdum quisque habitasse turpis est parturient arcu cum fusce id a eu odio ligula a praesent. Aliquam dis enim netus malesuada ridiculus convallis imperdiet nisi eu vestibulum imperdiet nibh a quam orci dignissim maecenas pretium lorem hac suspendisse hendrerit donec lacinia. Eu suspendisse sem diam nullam taciti dapibus lorem non euismod iaculis ante eros turpis parturient per. A diam auctor cras condimentum a aliquet odio egestas parturient condimentum ut tempus a massa a condimentum a a ullamcorper turpis a facilisi cubilia justo hendrerit adipiscing. Nascetur eu parturient purus dis rutrum placerat egestas adipiscing scelerisque odio penatibus a leo tristique risus eu mi a accumsan. 
					<br/><br/>
					Consectetur sagittis vulputate sit eget senectus mi nam curabitur cubilia sapien a habitant vestibulum suspendisse himenaeos ut a cubilia. Fames at a metus porttitor mi proin mollis lobortis proin id vulputate id vel libero malesuada nam id mattis justo sit tristique luctus taciti suspendisse.
				</div>
				<div class='post__actions'>
					<div class='post__action post__share'>Share</div>
					<div class='post__action post__reply'>Reply</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import InputEditor from '../InputEditor'

	export default {
		name: 'Thread',
		components: {
			InputEditor
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.thread_header {
		display: flex;
		justify-content: space-between;

		@at-root #{&}__thread_title {
			@include text($font--role-default, 3rem, 300);
			margin-bottom: 1rem;
		}
		@at-root #{&}__reply_button {
			height: 3rem;
			position: fixed;
			right: 10%;
			margin-top: 0.75rem;
		}
	}

	.posts {
		width: 80%;
	}

	.post {
		border-top: thin solid $color__gray--primary;
		margin: 0.5rem 0;

		&::last-child {
			border-bottom: thin solid $color__gray--primary;
		}

		@at-root #{&}__meta_data {
			display: flex;
			padding-top: 0.75rem;
			position: relative;
			margin-left: 4rem;
		}
		@at-root #{&}__avatar {
			position: absolute;
			height: 3rem;
			width: 3rem;
			line-height: 3.3rem;
			@include text($font--role-emphasis, 2rem)
			text-align: center;
			border-radius: 100%;
			background-color: $color__gray--darkest;
			color: #fff;
			left: -4rem;
		}
		@at-root #{&}__user {
			@include text($font--role-default, 1rem, 600);
			margin-right: 0.5rem;
		}
		@at-root #{&}__date {
			color: $color__gray--darkest;
			margin-right: 0.5rem;
		}
		@at-root #{&}__content {
			padding: 0.5rem 0 0.5rem 4rem;
		}
		@at-root #{&}__actions {
			padding: 0.5rem 0 0.75rem 4rem;
			display: flex;
			justify-content: flex-end;
		}
		@at-root #{&}__action {
			color: $color__gray--darkest;
			cursor: pointer;
			margin-right: 0.75rem;

			transition: all 0.2s;

			&:hover {
				color: $color__darkgray--primary;
			}
			&:active {
				color: $color__darkgray--darkest;
			}
		}
	}
</style>