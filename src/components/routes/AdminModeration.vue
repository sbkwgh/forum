<template>
	<div class='admin_moderation'>
		
		<router-view></router-view>
	</div>
</template>

<script>
	export default {
		name: 'AdminModeration',
		data () {
			return {}
		},
		methods: {},
		mounted () {
			this.$store.dispatch('setTitle', 'admin | moderation')
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.admin_moderation {
		padding: 1rem;
		padding-top: 0.5rem;
	}
</style>