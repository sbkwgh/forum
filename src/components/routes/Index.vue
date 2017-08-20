<template>
	<div class='route_container'>
		<div class='thread_sorting'>
			<select-options
				:options='filterOptions'
				v-model='selectedFilterOption'
				class='thread_sorting__filter'
			></select-options>
			<button class='button button--blue' v-if='this.$store.state.username' @click='$router.push("/thread/new")'>Post new thread</button>
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
					<span
						class='threads_main__side_bar__menu_item__text'
						:style='{
							"color": category.value === selectedCategory ? category.color : undefined
						}'
					>{{category.name}}</span>
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
			<div v-else class='threads_main__threads thread--empty'>
				<span class='fa fa-exclamation-circle'></span>
				No threads or posts.
			</div>
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
					let name = this.categories.find(c => c.value === val)

					this.$store.dispatch('setTitle', name ? name.name : '')
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

				let URL = '/api/v1/category/' + this.selectedCategory
				if(!initial) {
					URL = this.nextURL || URL
				}

				this.loading = true

				this.axios
					.get(URL)
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

			socket.emit('join', 'index')
			socket.on('new thread', data => {
				if(data.value === this.selectedCategory || this.selectedCategory == 'ALL') {
					this.newThreads++
				}
			})

			if(this.$route.query.token) {
				this.$store.commit('setToken', this.$route.query.token)
				this.$store.commit('setAccountTabs', 0)
				this.$store.commit('setAccountModalState', true)
			}
		},
		destroyed () {
			socket.emit('leave', 'index')
			socket.off('new thread')
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/elementStyles.scss';
	@import '../../assets/scss/variables.scss';

	.forum_description {
		padding: 1rem;
		margin-bottom: 2rem;
		background-color: #fff;
		border-radius: 0.25rem;
		
		@extend .shadow_border;
	}

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
		width: 12rem;
		height: 0%;
		@extend .shadow_border;
		background: #fff;
		margin-top: 0.15rem;
		margin-right: 1rem;
		border-radius: 0.25rem;
		padding: 0.5rem 0 1rem 1rem;

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
				height: 0.75rem;
				width: 0.75rem;
				border-radius: 0.25rem;
				opacity: 0.5;
				background-color: $color__gray--darkest;
				position: relative;
				top: 0.05rem;
				transition: all 0.2s;
			}

			&:hover #{&}__border {
				opacity: 1;
			}
			&:active #{&}__border {
				filter: brightness(0.8);
			}

			#{&}__text {
				filter: saturate(0.75), brightness(0.75);
			}
			

			#{&}--selected {
				font-weight: 500;

				.threads_main__side_bar__menu_item__border {
					opacity: 1;
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
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding-right: 5rem;
			font-size: 2rem;
			user-select: none;
			cursor: default;
			transition: none;
			color: $color__gray--darkest;

			span {
				font-size: 4rem;
				color: $color__gray--darker;
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