<template>
	<div class='more_threads'>
		<div class='more_threads__header'>More threads in category '{{category.name}}'</div>
		
		<div class='more_threads__empty overlay_message' v-if='empty'>
			No more threads to show
		</div>

		<template v-else>
			<div class='more_threads__thread more_threads__thread--header'>
				<div class='more_threads__name'>Thread</div>
				<div class='more_threads__date_created'>Date created</div>
			</div>

			<div class='more_threads__thread' :key='"thread-id-" + thread.id' v-for='thread in threads' @click='goToThread(thread)'>
				<div class='more_threads__name' >{{thread.name}}</div>
				<div class='more_threads__date_created'>{{ thread.createdAt | formatDate }}</div>
			</div>
		</template>
		
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
		border: thin solid $color__gray--darker;

		@at-root #{&}__header {
			font-size: 1.5rem;
			font-weight: 500;
			padding-left: 0.25rem;
		}

		@at-root #{&}__thread {
			display: flex;
			justify-content: space-between;
			font-size: 1rem;
			cursor: pointer;
			padding: 0.6rem;
			align-items: center;
			border-bottom: thin solid $color__gray--darker;
			transition: all 0.2s;

			&:hover {
				background-color: $color__lightgray--primary;
			}
			&:active {
				background-color: $color__lightgray--darker;
			}

			@at-root #{&}--header {
				cursor: default;
				font-size: 1rem;
				font-weight: 500;
				border-bottom: 0.125rem solid $color__gray--darker;

				&:hover { background-color: #fff; }
			}
		}
		@at-root #{&}__name {
			word-break: break-all;
			padding-right: 0.5rem;
		}
		@at-root #{&}__date_created {
			color: $color__text--secondary;
			font-size: 1rem;
			flex-shrink: 0;
		}
		@at-root #{&}__empty {
			padding: 1rem;
			font-size: 1.5rem;
			color: $color__text--primary;
		}
	}

	@include thread_mobile_breakpoint ('.more_threads');
	@media (max-width: $breakpoint--tablet) {
		.more_threads__empty {
			margin-top: 0;
		}
	} 
</style>