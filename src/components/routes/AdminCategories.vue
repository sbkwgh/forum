<template>
	<div class='admin_categories'>
		<h1 class='admin_categories__header'>Categories</h1>
	</div>
</template>

<script>
	export default {
		name: 'AdminCategories'
	}
</script>

<style lang='scss' scoped>
	.admin_categories {
		padding: 2rem;
		padding-top: 1rem;

		@at-root #{&}__header {
			margin: 0.5rem 0;
		}
	}
</style>