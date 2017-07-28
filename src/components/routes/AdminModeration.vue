<template>
	<div class='admin_moderation'>
		<tab-view
			:transparent='true'
			:padding='true'
			:tabs='["User reports", "Banned users"]'
			v-model='showTab'
		>
			<div slot='User reports' class='admin_moderation__tab'>test</div>
			<div slot='Banned users' class='admin_moderation__tab'>

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
						<td>{{ban.user}}</td>
						<td>{{ban.type}}</td>
						<td>{{ban.date | formatDate}}</td>
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
							<button class='button button--modal button--green'>Add ban</button>
						</div>
					</div>
				</modal-window>
			</div>
		</tab-view>
	</div>
</template>

<script>
	import TabView from '../TabView'
	import ModalWindow from '../ModalWindow'
	import FancyInput from '../FancyInput'
	import SelectButton from '../SelectButton'

	export default {
		name: 'AdminDashboard',
		components: {
			TabView,
			ModalWindow,
			FancyInput,
			SelectButton
		},
		data () {
			return {
				showTab: 0,
				showAddNewBanModal: false,
				username: '',
				message: '',
				options: [
					{ name: "Select a ban type", disabled: true },
					{ name: "Block user's known ip addresses", value: "ip" },
					{ name: "Ban from creating new threads", value: "thread"},
					{ name: "Ban from replying to threads", value: "post"}
				],
				selectedOption: 0,

				bans_: [
					{ user: 'john', type: 'ip', date: new Date(26, 6, 2017) },
					{ user: 'emma2', type: 'ip', date: new Date(), message: 'Malicious behaviour' },
					{ user: 'sdfghw33', type: 'thread', date: new Date(25, 6, 2017) },
					{ user: 'janine43_uk', type: 'ip', date: new Date(), message: 'Engaged in posting spam' },
					{ user: 'souuupl', type: 'post', date: new Date()},
					{ user: 'qertyoop', type: 'post', date: new Date(), message: 'Malicious behaviour' },
					{ user: 'test123', type: 'post', date: new Date() },
					{ user: '$pammm', type: 'ip', date: new Date(), message: 'Inappropriate content' }
				]
			}
		},
		computed: {
			bans () {
				return this.bans_.map(ban => {
					let type = ban.type

					if(type === 'ip') {
						ban.type = 'IP block'
					} else if (type === 'thread') {
						ban.type = 'New threads'
					} else {
						ban.type = 'New threads and replies'
					}

					return ban
				})
			}
		},
		methods: {
			toggleShowAddNewBanModal () {
				this.showAddNewBanModal = !this.showAddNewBanModal
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.admin_moderation {
		padding: 1rem;
		padding-top: 0.5rem;

		@at-root #{&}__tab {
			height: 100%;
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