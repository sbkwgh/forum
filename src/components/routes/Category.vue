<template>
	<div class='route_container'>
		<div class='thread_sorting'>
			<div>
				<select-button style='margin-right: 1rem' v-model='selectedCategory' :options='categories'></select-button>
				<select-options :options='filterOptions' v-model='selectedFilterOption'></select-options>
			</div>
			<button class='button' @click='$router.push("/thread/new")'>Post new thread</button>
		</div>
		<table class='threads'>
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
					<td>{{thread.title}}</td>
					<td>
						<div>{{thread.latestPostUser}}</div>
						<div>{{thread.latestPostDate | formatDate('time|date', ' - ') }}</div>
					</td>
					<td>{{thread.category}}</td>
					<td>{{thread.replies}}</td>
				</tr>
				<tr class='thread' v-if='!filteredThreads.length' colspan='4'>
					<td colspan='4' class='thread--empty'>No threads or posts.</td>
				</tr>
			</tbody>
		</div>
	</div>
</template>

<script>
	import SelectButton from '../SelectButton'
	import TabView from '../TabView'
	import SelectOptions from '../SelectOptions'

	export default {
		name: 'index',
		components: {
			SelectButton,
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
				selectedCategory: this.$route.params.category.toUpperCase(),
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
					return (thread.category === this.selectedCategory) || (this.selectedCategory === 'ALL');
				}).map(thread => {
					var _thread = Object.assign({}, thread);
					_thread.category = categories[thread.category];

					return _thread;
				}).sort((a, b) => {
					if(filter === 'NEW') {
						return a.latestPostDate - b.latestPostDate;
					} else if(filter === 'MOST_ACTIVE') {
						return b.replies - a.replies;
					}
				}).filter(thread => {
					if(filter === 'NO_REPLIES') {
						return !thread.replies;
					} else {
						return true;
					}
				});
			},
			categories () {
				return this.$store.state.meta.categories
			}
		},
		methods: {
			navigateToThread (slug, id) {
				this.$router.push('/thread/' + slug + '/' + id);
			}
		},
		watch: {
			selectedCategory (newValue) {
				this.$router.push('/category/' + newValue.toLowerCase());
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.thread_sorting {
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;
	}

	.threads {
		border-collapse: collapse;
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
			height: 5rem;
			text-align: center;
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