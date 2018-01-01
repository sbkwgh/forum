<template>
	<div class='route_container'>
		<h1>Search results for '{{$route.params.q}}'</h1>
		<transition name='fade' mode='out-in'>
			<div class='search__results' key='results' v-if='posts && posts.length'>
				<scroll-load
					:loading='loading'
					@loadNext='loadNextPage'
				>
					<thread-post
						class='search__post'

						v-for='post in posts'
						:key='post.id'

						:post='post'
						:show-thread='true'
						:click-for-post='true'
					></thread-post>
					<thread-post-placeholder
						class='search__post'
						v-if='loading'
						v-for='n in next'
						:key='n'
					></thread-post-placeholder>
				</scroll-load>
			</div>
			<div
				class='overlay_message search__overlay_message'
				v-else-if='posts && !posts.length'
				key='no results'
			>
				<span class='fa fa-exclamation-circle'></span>
				No results found
			</div>
			<div
				class='search__results'
				key='loading'
				v-else
			>
				<thread-post-placeholder class='search__post'
				></thread-post-placeholder>
			</div>
		</transition>
	</div>
</template>

<script>
	import LoadingIcon from '../LoadingIcon'
	import ScrollLoad from '../ScrollLoad'
	import ThreadPost from '../ThreadPost'
	import ThreadPostPlaceholder from '../ThreadPostPlaceholder'

	import AjaxErrorHandler from '../../assets/js/errorHandler'
	import logger from '../../assets/js/logger'

	export default {
		name: 'Search',
		components: {
			LoadingIcon,
			ThreadPost,
			ScrollLoad,
			ThreadPostPlaceholder
		},
		data () {
			return {
				posts: null,
				next: 0,
				offset: 0,

				loading: false,
				postsLoaded: false
			}
		},
		methods: {
			//Delay of 300ms so that you won't see
			//a flash of placeholders when it's not necessary
			setDelayedPostsNull () {
				this.postsLoaded = false

				setTimeout(() => {
					if(!this.postsLoaded) {
						this.posts = null
					}
				}, 300)
			},
			getResults () {
				this.$store.dispatch('setTitle', 'Search | ' + this.$route.params.q)
				this.setDelayedPostsNull()

				this.axios
					.get('/api/v1/search?q=' + this.$route.params.q)
					.then(res => {
						this.posts = res.data.posts
						this.next = res.data.next
						this.offset = res.data.offset
						this.postsLoaded = true
					})
					.catch(AjaxErrorHandler(this.$store))
			},
			loadNextPage () {
				if(this.next === 0) return

				this.loading = true

				this.axios
					.get(
						`/api/v1/search?q=${this.$route.params.q}&offset=${this.offset}`
					)
					.then(res => {
						this.posts.push(...res.data.posts)
						this.next = res.data.next
						this.offset = res.data.offset

						this.loading = false
						this.postsLoaded = true
					})
					.catch(e => {
						this.loading = false
						this.postsLoaded = true
						AjaxErrorHandler(this.$store)(e)
					})
			}
		},
		watch: {
			'$route.params': 'getResults'
		},
		mounted () {
			this.$store.dispatch('setTitle', 'Search | ' + this.$route.params.q)
			this.getResults()

			logger('search')
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.search {
		@at-root #{&}__post {
			background-color: #fff;
			padding-left: 0.75rem;
			margin-bottom: 1rem;
			border: thin solid $color__gray--darker;
			transition: box-shadow 0.2s;
			overflow: hidden;

			&:hover {
				@extend .shadow_border--hover;
			}

		}

		@at-root #{&}__overlay_message {
			margin-top: 5rem;

			@at-root #{&}--loading span {
				margin-bottom: 1rem;
			}
		}
	}
</style>