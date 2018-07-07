<template>
	<div class='admin_users'>
		<h1 class='admin_users__header'>Users</h1>
		<div class='category_widget__box'>
			<div class='admin_users__search'>
				<select-filter
					name='Username'
					:options='usernameOptions'
					v-model='usernameSelected'
				>
				</select-filter>
				<select-filter
					name='Role'
					:options='roleOptions'
					v-model='roleSelected'
				>
				</select-filter>
			</div>
			<table>
				<tr>
					<th>Username</th>
					<th>Role</th>
					<th>Account creation date</th>
					<th>Posts</th>
					<th>Threads</th>
				</tr>
			</table>
		</div>
	</div>
</template>

<script>
	import SelectFilter from '../SelectFilter.vue';
	import FancyInput from '../FancyInput.vue';
	export default {
		name: 'AdminUsers',
		components: {
			FancyInput,
			SelectFilter
		},
		data () {
			return {
				search: '',

				roleOptions: [
					{ name: 'Admins', value: 'admin' },
					{ name: 'Users', value: 'user' }
				],
				roleSelected: null,

				usernameOptions: [
					{ name: 'User1', value: 'admin' },
					{ name: 'User1', value: 'admin' },
					{ name: 'User1', value: 'admin' },
					{ name: 'User1', value: 'admin' },
					{ name: 'User1', value: 'admin' },
					{ name: 'User1', value: 'admin' },
					{ name: 'User1', value: 'admin' },
					{ name: 'User1', value: 'admin' },
					{ name: 'User1', value: 'admin' },
					{ name: 'User1', value: 'admin' },
					{ name: 'User2', value: 'admin' }
				],
				usernameSelected: null
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.admin_users {
		padding: 1rem 2rem;

		@at-root #{&}__header {
			margin: 0.5rem 0 1rem 0;
		}

		table {
			border-collapse: collapse;
			width: 100%;

			th {
				border-bottom: 0.125rem solid $color__gray--darker;
				padding: 0.25rem;
				text-align: left;
			}
		}
	}
</style>