<template>
	<div class='admin_moderation'>
		<div class='admin_moderation__tabs'>
			<div class='tab_button' @click='$router.push("reports")'>Reports</div>
			<div class='tab_button tab_button--selected'>Banned users</div>
		</div>
		<div class='admin_moderation__header'>
			<div>
				Remove or edit banned users below, or add a new ban
			</div>
			<button class='button button--blue' @click='toggleShowAddNewBanModal'>Add new ban</button>
		</div>

		<table class='admin_moderation__table'>
			<tr>
				<th>User</th>
				<th>Ban type</th>
				<th>Date banned</th>
				<th>Message</th>
			</tr>
			<tr v-for='ban in bans'>
				<td>{{ban.User.username}}</td>
				<td>{{ban.type}}</td>
				<td>{{ban.createdAt | formatDate}}</td>
				<td>
					<template v-if='ban.message'>{{ban.message}}</template>
					<i v-else>No message given</i>
				</td>
			</tr>
		</table>

		<modal-window v-model='showAddNewBanModal' width='30rem'>
			<div class='admin_moderation__add_new_ban_modal'>
				<h2>Ban or block a user</h2>
				<p>Search for the user to ban, then select the relevant ban type for the user</p>

				<div>
					<fancy-input placeholder='Username to ban' v-model='username' width='15rem' :large='true'></fancy-input>
				</div>

				<div>
					<fancy-input placeholder='Message to user (optional)' v-model='message' width='15rem' :large='true'></fancy-input>
				</div>

				<div>
					<select-button
						:options='options'
						name='test'
						v-model='selectedOption'
					>
					</select-button>
				</div>

				<div>
					<button class='button button--modal' @click='toggleShowAddNewBanModal'>Cancel</button>
					<button class='button button--modal button--green' @click='addBan'>Add ban</button>
				</div>
			</div>
		</modal-window>
	</div>
</template>

<script>
	import TabView from '../TabView'
	import ModalWindow from '../ModalWindow'
	import FancyInput from '../FancyInput'
	import SelectButton from '../SelectButton'
	import MenuButton from '../MenuButton'
	import AvatarIcon from '../AvatarIcon'
	import ConfirmModal from '../ConfirmModal'

	import AjaxErrorHandler from '../../assets/js/errorHandler'

	export default {
		name: 'AdminDashboard',
		components: {
			TabView,
			ModalWindow,
			FancyInput,
			SelectButton,
			MenuButton,
			AvatarIcon,
			ConfirmModal
		},
		data () {
			return {
				showAddNewBanModal: false,
				username: '',
				message: '',
				options: [
					{ name: "Select a ban type", disabled: true },
					{ name: "Block user's known ip addresses", value: "ip" },
					{ name: "Ban from creating new threads", value: "thread"},
					{ name: "Ban from replying to threads", value: "post"},
					{ name: "Ban from creating threads and posting", value: "both"}
				],
				selectedOption: 0,

				bans_: []
			}
		},
		computed: {
			bans () {
				return this.bans_.map(ban => {
					if(ban.ipBlock) {
						ban.type = 'IP block'
					} else if (ban.canCreateThreads && !ban.canCreatePosts) {
						ban.type = 'Posting replies'
					} else if(ban.canCreatePosts && !ban.canCreateThreads) {
						ban.type = 'Creating threads'
					} else {
						ban.type = 'Posting replies and creating threads'
					}

					return ban
				})
			}
		},
		methods: {
			toggleShowAddNewBanModal () {
				this.showAddNewBanModal = !this.showAddNewBanModal
			},
			addBan () {
				let obj = { username: this.username }
				if(this.message.trim().length) {
					obj.message = this.message
				}
				if(this.selectedOption === 'both') {
					obj.canCreatePosts = false
					obj.canCreateThreads = false
				} else if(this.selectedOption === 'thread') {
					obj.canCreateThreads = false
				} else if(this.selectedOption === 'post') {
					obj.canCreatePosts = false
				}

				this.axios
					.post('/api/v1/ban', obj)
					.then(res => {
						this.bans_.push(res.data)
						this.toggleShowAddNewBanModal()
					})
					.catch(AjaxErrorHandler(this.$store))
			}
		},
		mounted () {
			this.$store.dispatch('setTitle', 'admin | moderation')
			this.axios
				.get('/api/v1/ban')
				.then(res => {
					this.bans_ = res.data
				})
				.catch(AjaxErrorHandler(this.$store))
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.admin_moderation {
		padding: 1rem;
		padding-top: 0.5rem;

		@at-root #{&}__tabs {
			margin-bottom: 1rem;
		}

		@at-root #{&}__header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		@at-root #{&}__add_new_ban_modal {
			padding: 1rem;

			h2 {
				padding: 0;
				margin: 0;
				margin-bottom: -0.5rem;
			}
		}

		@at-root #{&}__table {
			width: calc(100%);
			overflow: hidden;
			margin-top: 1rem;
			padding: 0.5rem;
			background-color: #fff;
			border-radius: 0.25rem;
			border-collapse: collapse;

			@extend .shadow_border;
			
			td, th {
				padding: 0.5rem;
			}
			th {
				text-align: left;
			}
			tr:nth-child(even) {
				background-color: $color__lightgray--darker;
			}
			
		}
	}
</style>