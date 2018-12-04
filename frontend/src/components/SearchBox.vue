<template>
	<div
		class='search_box'
		ref='root'
		tabindex='0'
		@keydown='setKeyHighlight'
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
				@focus='setShowResults'
				@input='setShowResults'
				v-model='searchField'
			>
			<button
				class='search_box__input__button'
				@click='goToSearch'
			>
				<span class='fa fa-search'></span>
			</button>
		</div>
		<div class='search_box__results' :class='{ "search_box__results--show": showResults }'>

			<template v-if='threads.length'>
				<div class='search_box__results__header'>Threads</div>
				<div class='search_box__results__search_all'>
					<span class='fa fa-fw fa-search'></span>
					Search all threads containing '<strong>{{searchField}}</strong>'
				</div>
				<div
					class='search_box__results__thread'
					:class='{
						"search_box__results--highlight": highlightItem && highlightItem.index === index && highlightItem.groupIndex === 0
					}'
					v-for='(thread, index) in threads'
				>
					<div class='search_box__results__title'>{{thread.title}}</div>
					<div class='search_box__results__content'>{{thread.content}}</div>
				</div>
			</template>

			<template v-if='users.length'>
				<div class='search_box__results__header search_box__results__header--divider'>Users</div>
				<div class='search_box__results__search_all'>
					<span class='fa fa-fw fa-search'></span>
					Search all users beginning '<strong>{{searchField}}</strong>'
				</div>
				<div
					class='search_box__results__user'
					:class='{
						"search_box__results--highlight": highlightItem && highlightItem.index === index && highlightItem.groupIndex === 1
					}'
					v-for='(user, index) in users'
				>
					<avatar-icon size='tiny' :user='user'></avatar-icon>
					<div class='search_box__results__title'>{{user.username}}</div>
				</div>
			</template>

		</div>
	</div>
</template>

<script>
	import AvatarIcon from './AvatarIcon';

	export default {
		name: 'SearchBox',
		props: ['placeholder', 'header-bar'],
		components: { AvatarIcon },
		data () {
			return {
				searchField: '',
				showResults: false,

				highlightItem: null,
				groups: ['threads', 'users'],

				threads: [
					{title: 'Thread', content: 'Body content here 123' },
					{ title: 'Some other', content: 'Loremp ipsum dolor sit amet' },
					{ title: 'What??', content: 'testtestt esttesttesttes ttestt esttest' }
				],
				users: [{ username: 'Username' }, { username: 'username' }, { username: 'username' }]
			}
		},
		methods: {
			setShowResults () {
				this.showResults = !!this.searchField.trim().length;
			},
			setKeyHighlight (e) {
				//Return if not up or down arrow
				if(![38, 40].includes(e.keyCode)) return;

				//Increment or decrement
				let sign = e.keyCode === 40 ? 1 : -1;

				if(this.highlightItem === null) {
					this.highlightItem = { groupIndex: 0, index: 0 };
					return;
				}

				//get length of current group
				//add or decrement
				//if less than 0...
				//if greater then group length...

				let currentGroupName = this.groups[this.highlightItem.groupIndex];
				let groupLength = this[currentGroupName].length;
				let updatedIndex = this.highlightItem.index + sign;

				//If index greater than number of items in that group
				if(groupLength === updatedIndex) {
					this.highlightItem.groupIndex = (this.highlightItem.groupIndex+1) % this.groups.length;
					this.highlightItem.index = 0;
				} else if (updatedIndex < 0) {
					this.highlightItem.groupIndex = Math.abs((this.highlightItem.groupIndex-1) % this.groups.length);

					let updatedGroupName = this.groups[this.highlightItem.groupIndex];

					this.highlightItem.index = this[updatedGroupName].length-1;
				} else {
					this.highlightItem.index = updatedIndex;
				}
			},
			goToSearch () {
				if(this.searchField.trim().length) {
					this.showResults = false;
					this.$router.push("/search/" + encodeURIComponent(this.searchField));
				}
			}
		},
		mounted () {
			document.body.addEventListener('click', e => {
				//If results box is showing, the root element is loaded and the click target
				//is not part of the search box, then hide the results box
				if(this.showResults && this.$refs.root && !this.$refs.root.contains(e.target)) {
					this.showResults = false;
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
			width: 150%;

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
					border-top: thin solid $color__gray--primary;
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
		}
	}


	@media (max-width: 950px) and (min-width: $breakpoint--tablet) {
		.search_box__field--header {
			width: 4rem;
		}
	}
</style>