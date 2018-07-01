<template>
	<div class='admin_general'>
		<h1 class='admin_general__header'>Users</h1>
	</div>
</template>

<script>
	export default {
		name: 'AdminUsers'
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.admin_general {
		padding: 1rem 2rem;

		@at-root #{&}__header {
			margin: 0.5rem 0 1rem 0;
		}
	}
</style>