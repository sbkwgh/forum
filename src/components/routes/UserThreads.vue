<template>
	<div class='user_threads'>
		<div class='user_threads__title'>Threads by {{username}}</div>
		<scroll-load
			:loading='loadingThreads'
			:show='nextURL !== null'
			@load='loadNewThreads'
			v-if='threads.length'
		>
			<div
				class='user_threads__thread'
				v-for='(thread, index) in threads'
				:class='{"user_threads__thread--last": index === threads.length-1}'
				@click='goToThread(thread)'
			>
				<div class='user_threads__thread_bar'>
					<div class='user_threads__category'>{{thread.Category.name}}</div>
					<div class='user_threads__date'>{{thread.createdAt | formatDate('date')}}</div>
				</div>
				<div class='user_threads__name'>{{thread.name}}</div>
			</div>
		</scroll-load>
		<template v-else>This user hasn't started any threads yet</template>
	</div>
</template>

<script>
	import ScrollLoad from '../ScrollLoad'
	import ThreadPost from '../ThreadPost'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'userThreads',
		props: ['username'],
		components: {
			ThreadPost,
			ScrollLoad
		},
		data () {
			return {
				threads: [],
				loadingThreads: false,
				nextURL: ''
			}
		},
		methods: {
			loadNewThreads () {
				if(this.nextURL === null) return

				this.loadingThreads = true

				this.axios
					.get(this.nextURL)
					.then(res => {
						this.loadingThreads = false

						this.threads.push(...res.data.Threads)
						this.nextURL = res.data.meta.nextURL
					})
					.catch((e) => {
						this.loadingThreads = false

						AjaxErrorHandler(this.$store)(e)
					})
			},
			goToThread (thread) {
				this.$router.push('/thread/' + thread.slug + '/' + thread.id)
			}
		},
		created () {
			this.axios
				.get(`/api/v1/user/${this.$route.params.username}?threads=true`)
				.then(res => {
					this.threads = res.data.Threads
					this.nextURL = res.data.meta.nextURL
				})
				.catch(AjaxErrorHandler(this.$store))
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.user_threads {
		@at-root #{&}__title {
			font-size: 1.5rem;
			margin-bottom: 1rem;
		}

		@at-root #{&}__thread {
			border-top: thin solid $color__gray--primary;
			padding: 0.75rem;
			cursor: pointer;
			background-color: #fff;

			transition: all 0.2s;

			&:hover {
				background-color: $color__lightgray--primary;
			}

			@at-root #{&}--last {
				border-bottom: thin solid $color__gray--primary;
			}
		}
		@at-root #{&}__thread_bar {
			display: flex;
			margin-bottom: 0.25rem;
		}
		@at-root #{&}__date {
			margin-left: 0.5rem;
			color: $color__gray--darkest;
		}
		@at-root #{&}__name {
			font-size: 1.25rem;
		}
	}
</style>