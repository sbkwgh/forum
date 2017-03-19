<template>
	<div class='user_posts' :class='{ "user_posts--no_border_bottom": !posts.length }'>
		<div class='user_posts__title'>Posts by {{username}}</div>
		<scroll-load
			:loading='loadingPosts'
			:showNext='nextURL !== null'
			@loadNext='loadNewPosts'
			message='posts'
			v-if='sortedPosts.length'
		>
			<thread-post
				v-for='(post, index) in sortedPosts'
				:post='post'
				:show-thread='true'
				:class='{"post--last": index === posts.length-1}'
			></thread-post>
		</scroll-load>
		<template v-else>This user hasn't posted anything yet</template>
	</div>
</template>

<script>
	import ScrollLoad from '../ScrollLoad'
	import ThreadPost from '../ThreadPost'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'user',
		props: ['username'],
		components: {
			ThreadPost,
			ScrollLoad
		},
		data () {
			return {
				posts: [],
				loadingPosts: false,
				nextURL: ''
			}
		},
		computed: {
			sortedPosts () {
				return this.posts.sort((a, b) => {
					return new Date(a.createdAt) - new Date(b.createdAt)
				})
			}
		},
		methods: {
			loadNewPosts () {
				if(this.nextURL === null) return

				this.loadingPosts = true

				this.axios
					.get(this.nextURL)
					.then(res => {
						this.loadingPosts = false

						let currentPostsIds = this.posts.map(p => p.id)
						let filteredPosts =
							res.data.Posts.filter(p => !currentPostsIds.includes(p.id))

						this.posts.push(...filteredPosts)
						this.nextURL = res.data.meta.nextURL
					})
					.catch((e) => {
						this.loadingPosts = false

						AjaxErrorHandler(this.$store)(e)
					})
			}
		},
		created () {
			this.axios
				.get(`/api/v1/user/${this.$route.params.username}?posts=true`)
				.then(res => {
					this.posts = res.data.Posts
					this.nextURL = res.data.meta.nextURL
				})
				.catch(AjaxErrorHandler(this.$store))
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.user_posts {
		@at-root #{&}__title {
			font-size: 1.5rem;
			margin-bottom: 1rem;
		}
	}
</style>