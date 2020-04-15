<template>
	<div class='admin_users' ref='scrollElement'>
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
		<scroll-load
			class='category_widget__box'
			@loadNext='fetchData'
			:loading='loading'
			query-selector='.admin_users'
			:padding-bottom='100'
		>
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
				<tr v-for='user in users' :key='"user-row" + user.username'>
					<td class='admin_users__user_column'>
						<avatar-icon :user='user' size='small'></avatar-icon>
						<router-link :to='"/user/" + user.username'>{{user.username}}</router-link>
					</td>
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
		</scroll-load>
	</div>
</template>

<script>
	import SelectFilter from '../SelectFilter.vue';
	import SortMenu from '../SortMenu.vue';
	import FancyInput from '../FancyInput.vue';
	import LoadingMessage from '../LoadingMessage';
	import ScrollLoad from '../ScrollLoad';
	import AvatarIcon from '../AvatarIcon';

	import throttle from 'lodash.throttle';
	import AjaxErrorHandler from '../../assets/js/errorHandler';

	export default {
		name: 'AdminUsers',
		components: {
			FancyInput,
			SelectFilter,
			SortMenu,
			LoadingMessage,
			ScrollLoad,
			AvatarIcon
		},
		data () {
			return {
				search: '',
				users: [],

				loading: true,
				offset: 0,
				limit: 15,

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
				if(this.offset === null) return;

				let url = `/api/v1/user?
					sort=${this.tableSort.column}
					&order=${this.tableSort.sort}
					&offset=${this.offset}
				`;
				if(this.roleSelected.length === 1) {
					url += '&role=' + this.roleSelected[0];
				}
				if(this.search.length) {
					url += '&search=' + encodeURIComponent(this.search.trim());
				}

				this.loading = true;
				this.axios
					.get(url)
					.then(res => {
						this.users.push(...res.data);
						this.loading = /*loading =*/ false;

						//If returned data is less than the limit
						//then there must be no more pages to paginate
						if(res.data.length < this.limit) {
							this.offset = null;
						} else {
							this.offset+= this.limit;
						}
					})
					.catch(e => {
						AjaxErrorHandler(this.$store)(e);
						this.loading = /*loading =*/ false;
					});
			},
			resetFetchData () {
				this.offset = 0;
				this.users = [];

				this.fetchData();
			}
		},
		mounted () {
			this.fetchData();
		},
		watch: {
			tableSort: 'resetFetchData',
			roleSelected: 'resetFetchData',
			search: throttle(function () {
				this.resetFetchData();
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
		@at-root #{&}__user_column {
			display: flex;
			align-items: center;

			a {
				margin: 0 0.25rem;
			}
		}

		.overlay_message {
			padding-top: 2rem;
			padding-bottom: 1rem;
		}
	}
</style>