<template>
	<div class='route_container'>
		<h1>Search results for '{{$route.params.q}}'</h1>
		<transition name='fade' mode='out-in'>
			<div class='search__results' key='results' v-if='threads && threads.length && !loadingThreads'>
				<h2>Threads</h2>
				<thread-display v-for='thread in threads.slice(0, 3)' :key='"search-thread-" + thread.id' :thread='thread'></thread-display>

				<div
					class='search__more search__item' v-if='threads.length > ($store.state.MinQueryLength-1)'
					@click='$router.push("/search/threads/" + $route.params.q)'
				>
					<font-awesome-icon :icon='["fa", "comments"]' fixed-width />
					View all matching threads
				</div>
			</div>

			<div
				key='loading'
				v-if='loadingThreads'
			>
				<h2>Threads</h2>
				<thread-display-placeholder></thread-display-placeholder>
			</div>
		</transition>
		<transition name='fade' mode='out-in'>
			<div class='search__results' key='results' v-if='users && users.length && !loadingUsers'>
				<h2>Users</h2>
				<user-display v-for='user in users.slice(0, 5)' :key='"search-user-" + user.id' :user='user'></user-display>
				
				<div
					class='search__item search__more' v-if='users.length > 5'
					@click='$router.push("/search/users/" + $route.params.q)'
				>
					<font-awesome-icon :icon='["fa", "user"]' fixed-width />
					View all matching users
				</div>
			</div>

			<div
				key='loading'
				v-if='loadingUsers'
			>
				<h2>Users</h2>
				<user-placeholder></user-placeholder>
			</div>

			<div
				class='overlay_message search__overlay_message'
				v-if='showNoResults || queryTooShort'
				key='no results'
			>
				<font-awesome-icon :icon='["fa", "exclamation-circle"]' />
					{{queryTooShort ?
						"Search term is too short" :
						"No results found"
					}}
			</div>
		</transition>

	</div>
</template>

<script>
	import UserDisplay from '../UserDisplay'
	import UserPlaceholder from '../UserPlaceholder'
	import ThreadDisplay from '../ThreadDisplay'
	import ThreadDisplayPlaceholder from '../ThreadDisplayPlaceholder'

	import AjaxErrorHandler from '../../assets/js/errorHandler'
	import logger from '../../assets/js/logger'

	export default {
		name: 'Search',
		components: {
			UserDisplay,
			UserPlaceholder,
			ThreadDisplay,
			ThreadDisplayPlaceholder
		},
		data () {
			return {
				threads: [],
				loadingThreads: false,
				
				users: [],
				loadingUsers: false
			}
		},
		computed: {
			showNoResults () {
				return (
					!this.loadingUsers && !this.loadingThreads &&
					!this.threads.length && !this.users.length
				);
			},
			queryTooShort () {
				return this.$route.params.q.length < this.$store.state.MinQueryLength
			}
		},
		methods: {
			getUsers () {
				this.loadingUsers = true;

				this.axios
					.get('/api/v1/search/user?q=' + this.$route.params.q)
					.then(res => {
						this.loadingUsers = false;
						this.users = res.data.users;
					})
					.catch(AjaxErrorHandler(this.$store))
			},
			getThreads () {
				this.loadingThreads = true;

				this.axios
					.get('/api/v1/search/thread?q=' + this.$route.params.q)
					.then(res => {
						this.loadingThreads = false;
						this.threads = res.data.threads;
					})
					.catch(AjaxErrorHandler(this.$store))
			},
			getResults () {
				if(this.queryTooShort) return;

				this.$store.dispatch('setTitle', 'Search | ' + this.$route.params.q)

				this.getThreads();
				this.getUsers();
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
		@at-root #{&}__item {
			background-color: #fff;
			margin-bottom: 1rem;
			border: thin solid $color__gray--darker;
			transition: box-shadow 0.2s;
			overflow: hidden;

			&:hover {
				@extend .shadow_border--hover;
			}

		}

		@at-root #{&}__more {
			border-radius: 0.25rem;
			cursor: pointer;
			font-weight: 500;
			margin-top: 1rem;
			padding: 0.75rem;

			span {
				color: $color__darkgray--darker;
				font-weight: 300;
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