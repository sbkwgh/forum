<template>
	<div class='more_threads'>
		<div class='more_threads__header'>More threads in category '{{category.name}}'</div>
		<div class='more_threads__thread' v-for='thread in threads' @click='goToThread(thread)'>
			<div class='more_threads__name' >{{thread.name}}</div>
			<div class='more_threads__date_created'>{{ thread.createdAt | formatDate }}</div>
		</div>
		<div class='more_threads__empty overlay_message' v-if='empty'>
			No more threads to show
		</div>
	</div>
</template>

<script>
	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'MoreThreads',
		props: ['category', 'threadId'],
		data () {
			return { threads: [], empty: false }
		},
		methods: {
			goToThread (thread) {
				this.$router.push(`/thread/${thread.slug}/${thread.id}`)
			}
		},
		mounted () {
			this.axios
				.get('/api/v1/category/' + this.category.value)
				.then(res => {
					let filtered = res.data.Threads.filter(thread => {
						return thread.id !== this.threadId
					})

					this.threads = filtered.slice(0, 4)
					this.empty = !filtered.length
				})
				.catch(AjaxErrorHandler(this.$store))
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.more_threads {
		background-color: #fff;
		border-radius: 0.25rem;
		width: 80%;
		padding: 1rem;
		margin-top: 1.5rem;

		@at-root #{&}__header {
			font-size: 1.5rem;
			font-weight: 500;
			padding-left: 0.5rem;
		}

		@at-root #{&}__thread {
			display: flex;
			justify-content: space-between;
			font-size: 1.25rem;
			cursor: pointer;
			margin: 0.5rem;
			padding: 0.25rem 0.5rem;
			align-items: center;
			border-radius: 0.25rem;
			position: relative;
			transition: all 0.2s;

			&:hover {
				background-color: $color__lightgray--primary;
			}

			&::after {
				content: '';
				width: 100%;
				position: absolute;
				border-bottom: thin solid $color__gray--primary;
				bottom: -0.25rem;
				left: 0;
			}

		}
		@at-root #{&}__date_created {
			color: $color__text--secondary;
			font-size: 1rem;
		}
		@at-root #{&}__empty {
			padding: 1rem;
		}
	}
</style>