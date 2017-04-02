<template>
	<div class='route_container'>
		<div class='thread_sorting'>
			<select-options
				:options='filterOptions'
				v-model='selectedFilterOption'
				class='thread_sorting__filter'
			></select-options>
			<button class='button' v-if='this.$store.state.username' @click='$router.push("/thread/new")'>Post new thread</button>
		</div>
		<div class='threads_main'>
			<div class='threads_main__side_bar'>
				<div class='threads_main__side_bar__title'>
					categories
				</div>
				<div
					v-for='category in categories'
					class='threads_main__side_bar__menu_item'
					:class='{"threads_main__side_bar__menu_item--selected": category.value === selectedCategory}'
					@click='selectedCategory = category.value'
				>
					<span
						class='threads_main__side_bar__menu_item__border'
						:style='{"background-color": category.color}'
					></span>
					{{category.name}}
				</div>
			</div>
			<scroll-load
				class='threads_main__threads'
				v-if='filteredThreads.length'
				:loading='loading'
				@loadNext='getThreads'
			>
				<thread-display-placeholder v-for='n in newThreads' v-if='loadingNewer'></thread-display-placeholder>
				<div class='threads_main__load_new' v-if='newThreads' @click='getNewerThreads'>
					Load {{newThreads}} new {{newThreads | pluralize('thread')}}</span>
				</div>
				<thread-display v-for='thread in filteredThreads' :thread='thread'></thread-display>
				<thread-display-placeholder v-for='n in nextThreadsCount' v-if='loading'></thread-display-placeholder>
			</scroll-load>
			<div v-else class='threads_main__threads thread--empty'>No threads or posts.</div>
		</div>
	</div>
</template>

<script>
	import TabView from '../TabView'
	import ScrollLoad from '../ScrollLoad'
	import ThreadDisplay from '../ThreadDisplay'
	import ThreadDisplayPlaceholder from '../ThreadDisplayPlaceholder'
	import SelectOptions from '../SelectOptions'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	let socket = require('socket.io-client')()

	export default {
		name: 'index',
		components: {
			TabView,
			ScrollLoad,
			ThreadDisplay,
			ThreadDisplayPlaceholder,
			SelectOptions
		},
		data () {
			return {
				filterOptions: [
					{name: 'New', value: 'NEW'},
					{name: 'Most active', value: 'MOST_ACTIVE'},
					{name: 'No replies', value: 'NO_REPLIES'}
				],
				selectedFilterOption: 'NEW',

				nextURL: '',
				nextThreadsCount: 0,
				loading: false,

				threads: [],
				newThreads: 0,
				loadingNewer: false
			}
		},
		computed: {
			filteredThreads () {
				var categories = {};
				var filter = this.selectedFilterOption

				this.$store.state.meta.categories.forEach(category => {
					categories[category.value] = category.name;
				});

				return this.threads.filter(thread => {
					return (thread.Category.value === this.selectedCategory) || (this.selectedCategory === 'ALL');
				}).map(thread => {
					var _thread = Object.assign({}, thread);
					_thread.category = categories[thread.Category.value];

					return _thread;
				}).sort((a, b) => {
					if(filter === 'NEW') {
						let aDate = new Date(a.Posts[0].createdAt)
						let bDate = new Date(b.Posts[0].createdAt)

						return bDate - aDate;
					} else if(filter === 'MOST_ACTIVE') {
						return b.postsCount - a.postsCount;
					}
				}).filter(thread => {
					if(filter === 'NO_REPLIES' && thread.postsCount-1) {
						return false
					} else {
						return true;
					}
				});
			},
			categories () {
				return this.$store.getters.alphabetizedCategories
			},
			selectedCategory: {
				set (val) {
					this.$store.commit('setSelectedCategory', val)
				},
				get () {
					return this.$store.state.category.selectedCategory
				}
			}
		},
		methods: {
			navigateToThread (slug, id) {
				this.$router.push('/thread/' + slug + '/' + id);
			},
			getThreads (initial) {
				if(this.nextURL === null && !initial) return

				this.loading = true

				this.axios
					.get(this.nextURL || '/api/v1/category/' + this.selectedCategory)
					.then(res => {
						this.loading = false

						if(initial) {
							this.threads = res.data.Threads
						} else {
							this.threads.push(...res.data.Threads)
						}

						this.nextURL = res.data.meta.nextURL
						this.nextThreadsCount = res.data.meta.nextThreadsCount
					})
					.catch((e) => {
						this.loading = false

						AjaxErrorHandler(this.$store)(e)
					})
			},
			getNewerThreads () {
				this.loadingNewer = true

				this.axios
					.get('/api/v1/category/' + this.selectedCategory + '?limit=' + this.newThreads)
					.then(res => {
						this.loadingNewer = false
						this.newThreads = 0

						this.threads.unshift(...res.data.Threads)
					})
					.catch((e) => {
						this.loadingNewer = false
						AjaxErrorHandler(this.$store)(e)
					})
			}
		},
		watch: {
			selectedCategory (newValue) {
				this.$router.push('/category/' + newValue.toLowerCase());
			},
			$route () {
				this.selectedCategory = this.$route.path.split('/')[2].toUpperCase()
				this.newThreads = 0
				this.getThreads(true)
			}
		},
		created () {
			this.selectedCategory = this.$route.path.split('/')[2].toUpperCase()
			this.getThreads(true)

			socket.on('new thread', data => {
				if(data.value === this.selectedCategory || this.selectedCategory == 'ALL') {
					this.newThreads++
				}
			})
		},
		destroyed () {
			socket.off('new thread')
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/elementStyles.scss';
	@import '../../assets/scss/variables.scss';

	.threads_main {
		display: flex;
	}

	.thread_sorting {
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;

		@at-root #{&}__display {
			padding-right: 0.5rem;
			border-right: thin solid $color__gray--primary;
			margin-right: 1.25rem;
			width: 10rem;
		}
	}

	.threads_main__side_bar {
		width: 10rem;
		border-right: thin solid $color__gray--primary;
		margin-top: 0.5rem;

		@at-root #{&}__title {
			cursor: default;
			font-weight: 500;
			font-variant: small-caps;
			font-size: 1.125rem;
		}

		@at-root #{&}__menu_item {
			cursor: pointer;
			margin-top: 0.5rem;
			position: relative;

			#{&}__border {
				display: inline-block;
				width: 0.2rem;
				z-index: 1;
				height: 100%;
				position: absolute;
				left: -0.75rem;
				opacity: 0;
				top: 0.1rem;
				background-color: $color__gray--darkest;

				transition: all 0.2s;
			}

			&:hover #{&}__border {
				left: -0.5rem;
				opacity: 1;
			}

			&:active #{&}__border {
				filter: brightness(0.8);
			}

			#{&}--selected {
				font-weight: 500;

				.threads_main__side_bar__menu_item__border {
					opacity: 1;
					left: -0.5rem;

					&:active {
						filter: brightness(1);
					}
				}
			}
		}
	}
	.threads_main__threads {
		border-collapse: collapse;
		margin-top: 0.25rem;
		margin-left: 1rem;
		width: calc(100% - 11rem);
	}

	.threads_main__load_new {
		@extend .button;

		font-size: 1.25rem;
		margin: 0 0 1rem 0;
		background-color: $color__lightgray--primary;
		border-color: $color__gray--darker;
		width: 100%;
		font-weight: 300;
	}

	.thread {
		background-color: #fff;
		padding: 0.5rem 0;
		cursor: default;
		text-align: left;
		transition: background-color 0.2s;

		&:hover {
			background-color: $color__lightgray--primary;
		}

		td, th {
			padding: 0.3rem 0.5rem;
			border-bottom: solid thin $color__lightgray--primary;
		}

		@at-root #{&}--header {
			&:hover {
				background-color: #fff;
			}

			th {
				font-weight: 400;
				padding-bottom: 0.25rem;
				border-bottom: thin solid $color__lightgray--darkest;
			}
		}

		@at-root #{&}--empty {
			display: flex;
			align-items: center;
			justify-content: center;
			padding-right: 5rem;
			font-size: 2rem;
			user-select: none;
			cursor: default;
			transition: none;

			&:hover {
				transition: none;
				background-color: #fff;
			}
		}

		@at-root #{&}__section {
			padding: 0 0.5rem;
		}

		@at-root #{&}__user {
			display: inline-block;
		}
		@at-root #{&}__date {
			color: $color__text--secondary;
			display: inline-block;
		}
	}
</style>