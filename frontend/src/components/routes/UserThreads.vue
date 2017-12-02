<template>
	<div class='user_threads'>
		<div class='user_threads__title'>Threads by {{username}}</div>

		<template v-if='!threads'>
			<thread-display-placeholder v-for='n in 10' :key='n'>
			</thread-display-placeholder>
		</template>
		

		<scroll-load
			:loading='loadingThreads'
			:showNext='nextURL !== null'
			@loadNext='loadNewThreads'
			message='threads'
			v-else-if='threads.length'
		>
			<thread-display v-for='thread in threads' :key='thread.id' :thread='thread'></thread-display>
			<thread-display-placeholder
				v-if='loadingThreads'
				
				v-for='n in nextThreadsCount'
				:key='n'
			></thread-display-placeholder>
		</scroll-load>

		<template v-else>This user hasn't started any threads yet</template>
	</div>
</template>

<script>
	import ScrollLoad from '../ScrollLoad'
	import ThreadDisplay from '../ThreadDisplay'
	import ThreadDisplayPlaceholder from '../ThreadDisplayPlaceholder'

	import AjaxErrorHandler from '../../assets/js/errorHandler'
	import logger from '../../assets/js/logger'

	export default {
		name: 'userThreads',
		props: ['username'],
		components: {
			ThreadDisplay,
			ThreadDisplayPlaceholder,
			ScrollLoad
		},
		data () {
			return {
				threads: null,
				loadingThreads: false,
				nextURL: '',
				nextThreadsCount: 0
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

						if(!this.threads) this.threads = []

						this.threads.push(...res.data.Threads)
						this.nextURL = res.data.meta.nextURL
						this.nextThreadsCount = res.data.meta.nextThreadsCount
					})
					.catch((e) => {
						this.loadingThreads = false

						AjaxErrorHandler(this.$store)(e)
					})
			}
		},
		created () {
			this.$store.dispatch('setTitle', this.$route.params.username + ' | threads')

			this.axios
				.get(`/api/v1/user/${this.$route.params.username}?threads=true`)
				.then(res => {
					this.threads = res.data.Threads
					this.nextURL = res.data.meta.nextURL
					this.nextThreadsCount = res.data.meta.nextThreadsCount
				})
				.catch(e => {
					let invalidId = e.response.data.errors.find(error => {
						return error.name === 'accountDoesNotExist'
					})

					if(invalidId) {
						this.$store.commit('set404Page', true)
					} else {
						AjaxErrorHandler(this.$store)(e)
					}
				})

			logger('userThreads', this.$route.params.username)
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