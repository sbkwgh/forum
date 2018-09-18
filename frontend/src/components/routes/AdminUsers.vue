<template>
	<div class='admin_users'>
		<h1 class='admin_users__header'>Users</h1>
		<div class='category_widget__box'>
			<div class='category_widget__text__title'>Filter users</div>
			<div class='admin_users__filters'>
				<fancy-input
					placeholder='Filter users'
					:large='true'
					v-model='search'
				></fancy-input>
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
						<sort-menu v-model='tableSort' column='username' display='Username'></sort-menu>
					</th>
					<th>
						Role
					</th>
					<th>
						<sort-menu v-model='tableSort' column='createdAt' display='Account created at'></sort-menu>
					</th>
					<th>
						<sort-menu v-model='tableSort' column='postCount' display='Posts count'></sort-menu>
					</th>
					<th>
						<sort-menu v-model='tableSort' column='threadCount' display='Threads count'></sort-menu>
					</th>
				</tr>
				<tr v-for='user in users'>
					<td>{{user.username}}</td>
					<td>{{user.admin ? "Admin" : "User"}}</td>
					<td>{{user.createdAt | formatDate}}</td>
					<td>{{user.postCount}}</td>
					<td>{{user.threadCount}}</td>
				</tr>
			</table>

			<transition name='fade' mode='out-in'>
				<loading-message key='loading' v-if='loading'></loading-message>
				<div class='overlay_message' v-if='!loading && !users.length'>
					No users found
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
	import SelectFilter from '../SelectFilter.vue';
	import SortMenu from '../SortMenu.vue';
	import FancyInput from '../FancyInput.vue';
	import LoadingMessage from '../LoadingMessage';

	import throttle from 'lodash.throttle';
	import AjaxErrorHandler from '../../assets/js/errorHandler';

	export default {
		name: 'AdminUsers',
		components: {
			FancyInput,
			SelectFilter,
			SortMenu,
			LoadingMessage
		},
		data () {
			return {
				search: '',
				users: [],

				loading: true,

				roleOptions: [
					{ name: 'Admins', value: 'admin' },
					{ name: 'Users', value: 'user' }
				],
				roleSelected: ['admin', 'user'],

				tableSort: {
					column: 'username',
					sort: 'desc'
				}
			}
		},
		methods: {
			fetchData () {
				let url = `/api/v1/user?sort=${this.tableSort.column}&order=${this.tableSort.sort}`;
				if(this.roleSelected.length === 1) {
					url += '&role=' + this.roleSelected[0];
				}
				if(this.search.length) {
					url += '&search=' + encodeURIComponent(this.search.trim());
				}

				let loading = true;
				setTimeout(() => {
					if(loading) {
						this.loading = true;
						this.users = [];
					}
				}, 200);
				this.axios
					.get(url)
					.then(res => {
						this.users = res.data;
						this.loading = loading = false;
					})
					.catch(e => {
						AjaxErrorHandler(this.$store)(e);
						this.loading = loading = false;
					});
			}
		},
		mounted () {
			this.fetchData();
		},
		watch: {
			tableSort: 'fetchData',
			roleSelected: 'fetchData',
			search: throttle(function (input) {
				this.fetchData();
			}, 200)
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

		.overlay_message {
			padding-top: 2rem;
			padding-bottom: 1rem;
		}
	}
</style>