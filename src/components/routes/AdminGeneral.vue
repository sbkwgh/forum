<template>
	<div class='admin_general'>
		<h1 class='admin_general__header'>General</h1>
		<admin-forum-info></admin-forum-info>
		<admin-new-admin></admin-new-admin>
		<admin-categories></admin-categories>	
	</div>
</template>

<script>
	import AdminCategories from '../AdminCategories'
	import AdminNewAdmin from '../AdminNewAdmin'
	import AdminForumInfo from '../AdminForumInfo'

	export default {
		name: 'AdminGeneral',
		components: {
			AdminCategories,
			AdminNewAdmin,
			AdminForumInfo
		}
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