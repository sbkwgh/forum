<template>
	<div class='widgets__top_posts'>
		

		<template v-if='data_.length'>
			<div
				class='widgets__top_posts__item'
				:class='"widgets__top_posts__item--" + $index'
				:key='"post-title-" + $index'
				v-for='(thread, $index) in data'
				@click='goToThread(thread)'
			>
				<div class='widgets__top_posts__item__number' v-if='thread.Thread'>{{$index + 1}}</div>
				<div class='widgets__top_posts__item__info'>
					<div class='widgets__top_posts__item__title'>
						<template v-if='thread.Thread'>{{thread.Thread.name}}</template>
					</div>
					<div class='widgets__top_posts__item__views' v-if='thread.Thread'>
						{{thread.pageViews}} {{thread.pageViews | pluralize('page view')}}
					</div>
				</div>
			</div>
		</template>

		<div class='widgets__top_posts__overlay widgets__top_posts__overlay--show' v-else>
			<div class='widgets__top_posts__overlay__message'>No threads today</div>
		</div>

		<div class='widgets__top_posts__overlay' :class='{ "widgets__top_posts__overlay--show" : loading }'>
			<loading-icon></loading-icon>
		</div>
	</div>
</template>

<script>
	import LoadingIcon from '../LoadingIcon'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'TopPosts',
		components: { LoadingIcon },
		data () {
			return {
				loading: true,

				data_: []
			}
		},
		computed: {
			data () {
				let ret = []

				for(let i = 0; i < 4; i++) {
					if(this.data_[i]) {
						ret.push(this.data_[i])
					} else {
						ret.push({})
					}
				}

				return ret
			}
		},
		methods: {
			goToThread (thread) {
				if(thread.Thread) {
					this.$router.push(
						'/thread/' +
						thread.Thread.slug + '/' +
						thread.Thread.id
					)
				}
			}
		},
		created () {
			this.axios
				.get('/api/v1/log/top-threads')
				.then(res => {
					this.data_ = res.data
					this.loading = false
				})
				.catch(AjaxErrorHandler(this.$store))
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.widgets__top_posts {
		background-color: #fff;
		width: 100%;
		height: 100%;
		overflow: auto;
		border-radius: 0.25rem 0.25rem 0 0;
		position: relative;


		@at-root #{&}__overlay {
			@include loading-overlay($color__gray--darkest, 0.25rem 0.25rem 0 0);
		}

		@at-root #{&}__item {
			display: flex;
			flex-direction: row;
			padding: 0.25rem 1rem;
			cursor: default;
			height: 25%;
			overflow: hidden;
			padding-top: 0.125rem;
			transition: filter 0.2s;

			&:hover {
				filter: brightness(0.9);
			}

			@for $i from 0 through 3 {
				@at-root #{&}--#{$i} {
					$alpha: null;

					@if $i == 3 {
						$alpha: 0.075;
					} @else {
						$alpha: 0.8 - ($i + 1) / 5
					}
					
					background-color: rgba(160, 160, 160, $alpha);
				}
			}

			@at-root #{&}__number {
				font-size: 1.75rem;
				font-family: $font--role-emphasis;
				margin-right: 1rem;
				width: 1rem;
				@include user-select(none);				
			}

			@at-root #{&}__title {
				font-size: 1.125rem;
				text-overflow: ellipsis;
				width: 13rem;
				cursor: pointer;
				white-space: nowrap;
				overflow: hidden;
			}

			@at-root #{&}__views {
				color: $color__text--secondary;
				font-size: 0.9rem;
				margin-top: -0.125rem;
			}
		}
	}
</style>