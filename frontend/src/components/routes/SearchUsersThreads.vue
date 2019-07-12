<template>
	<div class='route_container'>
		<h1>Results for {{searchType}} containing '{{$route.params.q}}'</h1>
		
		<transition name='fade' mode='out-in'>
			<div class='search__results' key='results' v-if='results && results.length'>
				<scroll-load
					:loading='loading'
					@loadNext='loadNextPage'
				>

					<template v-if='searchType === "users"'>
						<user-display
							v-for='result in results'
							:key='result.id'
							:user='result'
						>
						</user-display>
						
						<user-placeholder
							v-if='loading'
							v-for='n in next'
							:key='n'
						></user-placeholder>
					</template>

					<template v-if='searchType === "threads"'>
						<thread-display
							v-for='result in results'
							:key='result.id'
							:thread='result'
						>
						</thread-display>
						
						<thread-display-placeholder
							v-if='loading'
							v-for='n in next'
							:key='n'
						>
						</thread-display-placeholder>
					</template>

				</scroll-load>
			</div>

			<div
				class='overlay_message search__overlay_message'
				v-if='showNoResults || queryTooShort'
				key='no results'
			>
				<span class='fa fa-exclamation-circle'></span>
					{{queryTooShort ?
						"Search term is too short" :
						"No results found"
					}}
			</div>

			<div key='loading' v-else>
				<user-placeholder v-if='searchType === "users"'>
				</user-placeholder>

				<thread-display-placeholder v-if='searchType === "threads"'>
				</thread-display-placeholder>
			</div>
		</transition>
	</div>
</template>

<script>
	import ScrollLoad from '../ScrollLoad'
	import UserDisplay from '../UserDisplay'
	import UserPlaceholder from '../UserPlaceholder'
	import ThreadDisplay from '../ThreadDisplay'
	import ThreadDisplayPlaceholder from '../ThreadDisplayPlaceholder'

	import AjaxErrorHandler from '../../assets/js/errorHandler'
	import logger from '../../assets/js/logger'

	export default {
		name: 'Search',
		components: {
			ScrollLoad,
			UserDisplay,
			UserPlaceholder,
			ThreadDisplay,
			ThreadDisplayPlaceholder
		},
		data () {
			return {
				results: null,
				next: 0,
				offset: 0,

				loading: false
			}
		},
		computed: {
			searchType () {
				let name = this.$route.name;

				if(name === 'search/users') {
					return 'users';
				} else if (name === 'search/threads') {
					return 'threads';
				}
			},
			showNoResults () {
				return (
					!this.loading && this.results && !this.results.length
				);
			},
			queryTooShort () {
				return this.$route.params.q.length < this.$store.state.MinQueryLength
			}
		},
		methods: {
			getResults () {
				if (this.queryTooShort) return;

				this.$store.dispatch('setTitle', 'Search | ' + this.$route.params.q)
			
				this.axios
					.get(`/api/v1/search/${this.searchType.slice(0, -1)}?q=${this.$route.params.q}`)
					.then(res => {
						this.results = res.data[this.searchType]
						this.next = res.data.next
						this.offset = res.data.offset
					})
					.catch(AjaxErrorHandler(this.$store))
			},
			loadNextPage () {
				if(!this.next) return

				this.loading = true

				this.axios
					.get(
						`/api/v1/search/${this.searchType.slice(0, -1)}?q=${this.$route.params.q}&offset=${this.offset}`
					)
					.then(res => {
						this.results.push(...res.data[this.searchType])
						this.next = res.data.next
						this.offset = res.data.offset

						this.loading = false
					})
					.catch(e => {
						this.loading = false
						AjaxErrorHandler(this.$store)(e)
					})
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
	.search {
		@at-root #{&}__overlay_message {
			margin-top: 5rem;

			@at-root #{&}--loading span {
				margin-bottom: 1rem;
			}
		}
	}
</style>