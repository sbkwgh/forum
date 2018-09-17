<template>
	<div class='route_container not_found'>
		<h1 class='not_found__title'>404 - page not found</h1>

		<div class='not_found__box'>
			<p class='not_found__box--large_text'>
				The page you're looking for <strong>{{$route.fullPath}}</strong> doesn't exist.
			</p>
			<p>
				<router-link to='/' class='button'>Click to go home</router-link> <span>or</span>
				<search-box
					class='not_found__search_box'
					placeholder='Try a search'
				></search-box>
			</p>
		</div>
	</div>
</template>

<script>
	import SearchBox from '../SearchBox'

	export default {
		name: 'NotFound',
		components: { SearchBox }
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';
	@import '../../assets/scss/elementStyles.scss';

	.not_found {
		@at-root #{&}__title {
			font-family: $font--role-emphasis;
			font-size: 4rem;
			margin-top: 4rem;
			text-align: center;
		}

		@at-root #{&}__box {
			background-color: #fff;
			border-radius: 0.25rem;
			padding: 2rem;
			padding-top: 1rem;
			
			.button {
				margin-right: 0.5rem;
			}

			@at-root #{&}--large_text {
				font-size: 1.5rem;
			}
		}

		@at-root #{&}__search_box {
			display: inline-table;
			margin-left: 0.5rem
		}
	}

	@media (max-width: 525px) {
		.not_found {
			@at-root #{&}__title {
				font-size: 2.5rem;
			}

			@at-root #{&}__box {
				word-wrap: break-word;

				p:nth-child(2) {
					display: flex;
					flex-direction: column;
					align-items: center;

					span {
						margin: 0.5rem 0;
					}
				}
			}
		}
	}
</style>