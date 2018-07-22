<template>
	<div class='admin_users'>
		<h1 class='admin_users__header'>Users</h1>
		<div class='category_widget__box'>
			<div class='category_widget__text__title'>Filter users</div>
			<div class='admin_users__filters'>
				<select-filter
					name='Username'
					:options='usernameOptions'
					v-model='usernameSelected'
					search-placeholder='Filter users'
				>
				</select-filter>
				<select-filter
					name='Role'
					:options='roleOptions'
					v-model='roleSelected'
				>
				</select-filter>
			</div>
		</div>
		<div class='category_widget__box'>
			<table>
				<tr>
					<th>
						<sort-menu v-model='tableSort' column='username'></sort-menu>
					</th>
					<th>
						Role
					</th>
					<th>
						<sort-menu v-model='tableSort' column='date'></sort-menu>
					</th>
					<th>
						<sort-menu v-model='tableSort' column='posts'></sort-menu>
					</th>
					<th>
						<sort-menu v-model='tableSort' column='threads'></sort-menu>
					</th>
				</tr>
			</table>
		</div>
	</div>
</template>

<script>
	import SelectFilter from '../SelectFilter.vue';
	import SortMenu from '../SortMenu.vue';
	import FancyInput from '../FancyInput.vue';
	export default {
		name: 'AdminUsers',
		components: {
			FancyInput,
			SelectFilter,
			SortMenu
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
				],
				usernameSelected: null,

				tableSort: {
					column: 'username',
					sort: 'descending'
				}
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

		@at-root #{&}__filters {
			margin-bottom: 0.5rem;

			.select_filter {
				margin-right: 0.5rem;
			}
		}

		table {
			border-collapse: collapse;
			width: 100%;

			th {
				border-bottom: 0.125rem solid $color__gray--darker;
				padding: 0.5rem 0.75rem;
				text-align: left;
			}

			tr {
				cursor: default;
				
				&:first-child {
					background-color: #fff;
				}
				&:nth-child(odd) {
					background-color: lighten($color__gray--primary, 20%); 
				}
				&:nth-child(even) {
					background-color: $color__gray--primary;
				}
			}

			td {
				padding: 0.75rem;
			}
		}
	}
</style>