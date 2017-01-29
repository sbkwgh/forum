<template>
	<div class='route_container'>
		<div class='h1'>Categories</div>
		<div class='index_categories'>
			<div
				class='index_category'
				@click='$router.push("/category/" + category.value.toLowerCase())'
				v-for='category in $store.state.meta.categories'
			>
				<div class='index_category__name'>{{category.name}}</div>
				<div>
					<div class='index_category__latest_post'>Latest post here</div>
					<div class='index_category__latest_post_date'>19:53</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import addFlexBoxChildren from '../../assets/js/flexBoxGridCorrect'

	export default {
		name: 'index',
		components: {},
		computed: {},
		methods: {},
		mounted () {
			addFlexBoxChildren('.index_categories', 'index_category');
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.index_categories {
		display: flex;
		overflow-y: auto;
		max-height: 100%;
		flex-wrap: wrap;
		justify-content: space-between;
		padding: 0.5rem 0px;
	}
	.index_category {
		background-color: rgba(76, 175, 80, 0.86);
		width: calc(100% / 4 - 1rem);
		height: 5rem;
		margin: 0.5rem;
		padding: 0.5rem;
		cursor: pointer;
		color: #fff;
		transition: filter 0.2s, transform 0.2s;

		&:hover {
			filter: brightness(0.8) contrast(130%);
		}
		&:active {
			transform: scale(0.96);
		}

		@at-root #{&}__name {
			@include text($font--role-default, 1.5rem);
		}
		@at-root #{&}__latest_post {
			@include text($font--role-default, 1rem);
		}
		@at-root #{&}__latest_post_date {
			color: $color__gray--darker;
			@include text($font--role-default, 1rem);
		}
	}
</style>