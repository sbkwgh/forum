<template>
	<div class='route_container'>
		<div class='thread_sorting'>
			<div>
				<select-options
					:options='displayOptions'
					class='thread_sorting__display'
					v-model='selectedDisplayOption'
				></select-options>
				<select-options
					:options='filterOptions'
					v-model='selectedFilterOption'
					class='thread_sorting__filter'
				></select-options>
			</div>
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
					<span class='threads_main__side_bar__menu_item__border'></span>
					{{category.name}}
				</div>
			</div>
			<table class='threads_main__threads' v-if='filteredThreads.length'>
				<colgroup>
					<col span="1" style="width: 50%;">
					<col span="1" style="width: 22.5%;">
					<col span="1" style="width: 22.5%;">
					<col span="1" style="width: 5%;">
				</colgroup>
				<thead>
					<tr class='thread thread--header'>
						<th>Title</th>
						<th>Latest post</th>
						<th>Category</th>
						<th>Replies</th>
					</tr>
				</thead>
				<tbody>
					<tr class='thread' v-for='thread in filteredThreads' @click='navigateToThread(thread.slug, thread.id)'>
						<td>{{thread.name}}</td>
						<td>
							<div>{{thread.Posts[0].content | stripTags | truncate(100)}}</div>
							<div>{{thread.Posts[0].createdAt | formatDate('time|date', ' - ') }}</div>
						</td>
						<td>{{thread.Category.name}}</td>
						<td>{{thread.replies}}</td>
					</tr>
				</tbody>
			</table>
			<div v-else class='threads_main__threads thread--empty'>No threads or posts.</div>
		</div>
	</div>
</template>

<script>
	import TabView from '../TabView'
	import SelectOptions from '../SelectOptions'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'index',
		components: {
			TabView,
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

				displayOptions: [
					{ name: 'Threads', value: 'THREADS' },
					{ name: 'Posts', value: 'POSTS' }
				],
				selectedDisplayOption: 'THREADS',

				threads: []
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

						return aDate - bDate;
					} else if(filter === 'MOST_ACTIVE') {
						return 0 //b.replies - a.replies;
					}
				}).filter(thread => {
					if(filter === 'NO_REPLIES') {
						return 0//!thread.replies;
					} else {
						return true;
					}
				});
			},
			categories () {
				return this.$store.state.meta.categories
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
			getThreads () {
				this.axios
					.get('/api/v1/category/' + this.selectedCategory)
					.then(res => {
						this.threads = res.data.Threads
					})
					.catch(AjaxErrorHandler(this.$store))
			}
		},
		watch: {
			selectedCategory (newValue) {
				this.$router.push('/' + newValue.toLowerCase());
			},
			$route () {
				this.selectedCategory = this.$route.path.split('/')[1].toUpperCase()
				this.getThreads()
			}
		},
		created () {
			this.selectedCategory = this.$route.path.split('/')[1].toUpperCase()
			this.getThreads()
		}
	}
</script>

<style lang='scss' scoped>
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
			margin-right: 0.5rem;
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
		width: calc(100% - 10rem);
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