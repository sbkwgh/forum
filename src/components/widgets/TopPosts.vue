<template>
	<div class='widgets__top_posts'>
		<div class='widgets__top_posts__overlay' :class='{ "widgets__top_posts__overlay--show" : loading }'>
			<loading-icon></loading-icon>
		</div>

		<div
			class='widgets__top_posts__item'
			:class='"widgets__top_posts__item--" + $index'
			v-for='(thread, $index) in data'
		>
			<div class='widgets__top_posts__item__number' v-if='thread.title'>{{$index + 1}}</div>
			<div class='widgets__top_posts__item__info'>
				<div class='widgets__top_posts__item__title'>{{thread.title}}</div>
				<div class='widgets__top_posts__item__views' v-if='thread.title'>
					{{thread.views}} {{thread.views | pluralize('page view')}}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import LoadingIcon from '../LoadingIcon'

	export default {
		name: 'TopPosts',
		components: { LoadingIcon },
		data () {
			return {
				loading: false,

				data_: [
					{ title: 'Post title here', views: 20 },
					{ title: 'Another', views: 18 },
					{ title: 'Lorem ipsum dolor sit amet loremp', views: 10 }
				]
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
			@include loading-overlay(#2ecc71, 0.25rem 0.25rem 0 0);
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
					
					background-color: rgba(0, 222, 56, $alpha);
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