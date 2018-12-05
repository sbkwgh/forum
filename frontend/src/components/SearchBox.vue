<template>
	<div
		class='search_box'
		ref='root'
	>
		<div
			class='search_box__input'
			tabindex='0'
			@keydown.enter='goToSearch'
		>
			<input
				class='search_box__input__field'
				:class='{ "search_box__input__field--header": headerBar }'
				:placeholder='placeholder || "Search this forum"'
				v-model='searchField'
				
				ref='input'

				@focus='setShowResults'
				@input='setShowResults'
				@keydown='setKeyHighlight'
			>
			<button
				class='search_box__input__button'
				@click='goToSearch'
			>
				<span class='fa fa-search'></span>
			</button>
		</div>
		<div
			class='search_box__results'
			:class='{ "search_box__results--show": showResults }'
			ref='results'
			v-if='headerBar'
		>

			<template v-if='threads.length'>
				<div class='search_box__results__header'>Threads</div>
				<div
					class='search_box__results__search_all'
					:class='{
						"search_box__results--highlight": highlightIndex === getHighlightIndex("threads header")
					}'
					ref='threads header'
					@mouseover='highlightIndex = getHighlightIndex("threads header")'
					@click='goToSearch'
				>
					<span class='fa fa-fw fa-search'></span>
					Search all threads for '<strong>{{searchField}}</strong>'
				</div>
				<div
					class='search_box__results__thread'
					:class='{
						"search_box__results--highlight": highlightIndex === getHighlightIndex("threads", index)
					}'
					v-for='(thread, index) in threads'
					ref='threads'
					@mouseover='highlightIndex = getHighlightIndex("threads", index)'
					@click='goToSearch'
				>
					<div class='search_box__results__title'>{{thread.name}}</div>
					<div class='search_box__results__content'>{{thread.Posts[0].content | stripTags | truncate(140) }}</div>
				</div>
			</template>

			<template v-if='users.length'>
				<div class='search_box__results__header search_box__results__header--divider'>Users</div>
				<div
					class='search_box__results__search_all'
					:class='{
						"search_box__results--highlight": highlightIndex === getHighlightIndex("users header")
					}'
					ref='users header'
					@mouseover='highlightIndex = getHighlightIndex("users header")'
					@click='goToSearch'
				>
					<span class='fa fa-fw fa-search'></span>
					Search all users containing '<strong>{{searchField}}</strong>'
				</div>
				<div
					class='search_box__results__user'
					:class='{
						"search_box__results--highlight": highlightIndex === getHighlightIndex("users", index)
					}'
					v-for='(user, index) in users'
					ref='users'
					@mouseover='highlightIndex = getHighlightIndex("users", index)'
					@click='goToSearch'
				>
					<avatar-icon size='tiny' :user='user'></avatar-icon>
					<div class='search_box__results__title'>{{user.username}}</div>
				</div>
			</template>

			<div class='search_box__results__message' v-if='!threads.length && !users.length && !loading'>
				No users or threads found for '<strong>{{searchField}}</strong>'
			</div>
			<div class='search_box__results__message' v-if='loading'>
				Loading...
			</div>
		</div>
	</div>
</template>

<script>
	import AvatarIcon from './AvatarIcon';

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'SearchBox',
		props: ['placeholder', 'header-bar'],
		components: { AvatarIcon },
		data () {
			return {
				searchField: '',
				showResults: false,
				loading: false,

				highlightIndex: null,

				threads: [],
				users: []
			}
		},
		computed: {
			totalHighlightOptions () {
				let totalHighlightOptions = 0;

				//Add one to include the 'search all option'
				if(this.threads.length) totalHighlightOptions += this.threads.length + 1;
				if(this.users.length) totalHighlightOptions += this.users.length + 1;

				return totalHighlightOptions;
			}
		},
		methods: {
			setShowResults () {
				//Return if results should not show
				if(!this.headerBar) return;

				this.showResults = !!this.searchField.trim().length;
				if(this.showResults) {
					this.getResults();
				} else {
					this.resetResultsBox();
				}
			},
			resetResultsBox () {
				//Return if results should not show
				if(!this.headerBar) return;

				this.showResults = false;
				
				//These changes alter ui within the box
				//therefore wait until transition completed
				setTimeout(() => {
					this.highlightIndex = null;
					this.$refs.results.scrollTop = 0;
					this.threads = [];
					this.users = [];
				}, 200);
			},
			//Produces a 'global' highlight index from the
			//relative index of each array group, dependent on
			//whether or not other array groups are empty or not
			getHighlightIndex (group, index) {
				if (group === 'threads header') {
					return 0;
				} else if(group === 'threads') {
					return 1 + index;
				} else if (group === 'users' || group === 'users header') {
					let ret = 0;

					if(this.threads.length) {
						ret += 1 + this.threads.length;
					}

					if(group === 'users') {
						ret += 1 + index;
					}

					return ret;
				}
			},
			//Produces relative group and index
			//from overall highlight index
			getGroupFromIndex (index) {
				if(this.threads.length && index <= this.threads.length) {
					if(index === 0) {
						return { group: 'threads header', index: null };
					} else {
						return { group: 'threads', index: index-1 };
					}
				} else if (this.threads.length && index > this.threads.length) {
					if(index === this.threads.length + 1) {
						return { group: 'users header', index: null };
					} else {
						return { group: 'users', index: index-1-this.threads.length-1 };
					}
				} else if(this.users.length) {
					if(index === 0) {
						return { group: 'users header', index: null };
					} else {
						return { group: 'users', index: index-1 };
					}
				}
			},
			setKeyHighlight (e) {
				//Return if results should not show
				if(!this.headerBar) return;

				//Return if not up or down arrow
				if(![38, 40].includes(e.keyCode)) return;

				//Increment or decrement
				let sign = e.keyCode === 40 ? 1 : -1;

				if(this.highlightIndex === null) {
					//First highlight item
					if(sign === 1) {
						this.highlightIndex = 0;
					//Last highlight item
					} else {
						this.highlightIndex = this.totalHighlightOptions - 1;
					}
				} else {
					let updatedIndex = this.highlightIndex + sign;
					//Do not highlight anything, return 'focus' to input box
					if(
						updatedIndex === this.totalHighlightOptions ||
						updatedIndex < 0
					) {
						this.highlightIndex = null;
						return;
					}
					
					this.highlightIndex = updatedIndex;
				}

				//Get the element for highlighted item
				//and scroll into view if not visible
				let { group, index } = this.getGroupFromIndex(this.highlightIndex);
				let el = index === null ? this.$refs[group] : this.$refs[group][index];
				if(
					el.offsetHeight + el.offsetTop > this.$refs.results.offsetHeight ||
					 el.offsetHeight + el.offsetTop < this.$refs.results.scrollTop
				) {
					el.scrollIntoView();
				}
				
			},
			goToSearch () {
				let searchEncoded = encodeURIComponent(this.searchField.trim());

				if(this.highlightIndex === null && this.searchField.trim().length) {
					this.showResults = false;
					this.$router.push("/search/" + searchEncoded);
				} else {
					let { group, index } = this.getGroupFromIndex(this.highlightIndex);
					if(group === 'users') {
						this.$router.push('/user/' + this.users[index].username);
					} else if (group === 'threads') {
						let thread = this.threads[index];
						this.$router.push('/thread/' + thread.slug + '/' + thread.id);
					} else if (group === 'users header') {
						this.$router.push('/search/users/' + searchEncoded);
					} else {
						this.$router.push('/search/threads/' + searchEncoded);
					}

					this.resetResultsBox();
				}

				this.$refs.input.blur();
			},
			getResults () {
				let q = this.searchField.trim();
				if(!q.length) return;

				this.loading = true;
				this.threads = [];
				this.users = [];

				this.axios
					.get('/api/v1/search/thread?q=' + q)
					.then(res => {
						this.threads = res.data.threads.slice(0, 3);
						this.loading = false;
					})
					.catch(AjaxErrorHandler(this.$store));

				this.axios
					.get('/api/v1/search/user?q=' + q)
					.then(res => {
						this.users = res.data.users.slice(0, 5);
						this.loading = false;
					})
					.catch(AjaxErrorHandler(this.$store));
			}
		},
		mounted () {
			document.body.addEventListener('click', e => {
				//If results box is showing, the root element is loaded and the click target
				//is not part of the search box, then hide the results box
				if(this.showResults && this.$refs.root && !this.$refs.root.contains(e.target)) {
					this.resetResultsBox();
				}
			});
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';
	@import '../assets/scss/elementStyles.scss';

	.search_box {
		position: relative;

		@at-root #{&}__input {
			border: 1.5px solid $color__gray--darkest;
			border-right: 0;
			border-radius: 0.25rem;
			outline: none;
			display: inline-block;
			overflow: hidden;

			@at-root #{&}__field {
				outline: none;
				height: 100%;
				padding: 0 0.5rem;
				border: 0;
				transition: width 0.2s;

				@include text;
				color: $color__text--primary;

				@include placeholder {
					@include text;
					color: $color__darkgray--primary;
				}
			}
			@at-root #{&}__button {
				@extend .button;

				border: 0;
				border-right: 1.5px solid $color__gray--darkest;
				border-radius: 0 0.2rem 0.2rem 0;

				&:hover, &:active {
					border-color: $color__gray--darkest;
				}
			}
		}
		
		@at-root #{&}__results {
			background-color: #fff;
			border: 1.5px solid $color__gray--darkest;
			border-radius: 0.25rem;
			box-shadow: 0 0.25rem 1rem rgba(#000, 0.125);
			max-height: 20rem;
			opacity: 0;
			overflow-y: auto;
			overflow-x: hidden;
			pointer-events: none;
			position: absolute;
			right: 0;
			transform: translateY(-0.25rem);
			transition: opacity 0.2s, transform 0.2s;
			width: 100%;

			@at-root #{&}--show {
				opacity: 1;
				pointer-events: all;
				transform: translateY(0rem);
			}
			@at-root #{&}--highlight {
				background-color: $color__lightgray--darker;
			}

			@at-root #{&}__header {
				cursor: default;
				font-weight: 600;
				font-size: 0.9rem;
				padding: 0.5rem 1rem;
				position: sticky;

				@at-root #{&}--divider {
					border-top: thin solid $color__gray--darker;
				}
			}
		
			@at-root #{&}__search_all {
				display: flex;
				flex-direction: row;

				span {
					padding-top: 0.15rem;
					margin-right: 0.5rem;
				}
			}

			@at-root #{&}__thread, #{&}__user, #{&}__search_all {
				cursor: pointer;
				padding: 0.5rem 1rem;
				transition: background-color 0.2s;

				&:hover {
					background-color: $color__lightgray--darker;
				}
				&:focus {
					outline: none;
					background-color: $color__lightgray--darker;
				}
				&:last-of-type {
					margin-bottom: 0.5rem;
				}
			}
			@at-root #{&}__user {
				align-items: center;
				display: flex;
				flex-direction: row;
				padding: 0.25rem 1rem;

				.avatar_icon {
					pointer-events: none;
				}

				&:last-of-type {
					margin-bottom: 0.5rem;
				}
			}

			@at-root #{&}__title, #{&}__search_all {
				font-weight: 400;
				font-size: 0.9rem;
			}
			@at-root #{&}__content {
				color: $color__text--secondary;
				font-size: 0.85rem;
			}

			@at-root #{&}__message {
				cursor: default;
				padding: 1rem;
			}
		}
	}


	@media (max-width: 950px) and (min-width: $breakpoint--tablet) {
		.search_box__field--header {
			width: 4rem;
		}
	}
</style>