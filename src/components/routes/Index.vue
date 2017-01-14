<template>
	<div class='index'>
		<div class='thread_sorting'>
			<select-button style='margin-right: 1rem' v-model='selectedCategory' :options='categories'></select-button>
			<div class='button button--orange'>New</div>
			<div class='button'>Most active</div>
			<div class='button'>No replies</div>
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
				<tr class='thread' v-for='thread in threads'>
					<td>{{thread.title}}</td>
					<td>
						<div>{{thread.latestPostUser}}</div>
						<div>{{thread.latestPostDate | formatDate('time|date', ' - ') }}</div>
					</td>
					<td>{{thread.category}}</td>
					<td>{{thread.replies}}</td>
				</tr>
			</tbody>
		</div>
	</div>
</template>

<script>
	import SelectButton from '../SelectButton'
	import TabView from '../TabView'

	export default {
		name: 'index',
		components: {
			SelectButton,
			TabView
		},
		data () {
			return {
			
			}
		},
		computed: {
			threads () {
				return this.$store.getters.filteredThreads;
			},
			categories () {
				return this.$store.state.meta.categories
			},
			selectedCategory: {
				get () {
					return this.$store.state.index.selectedCategory;
				},
				set (category) {
					this.$store.commit('selectCategory', category);
				}
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.index {
		width: 80%;
		margin: 0 auto;
		margin-top: 2rem;
	}

	.thread_sorting {
		margin-bottom: 1rem;
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
			padding: 0 0.5rem;
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