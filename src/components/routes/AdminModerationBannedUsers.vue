<template>
	<div class='admin_moderation'>
		<div class='admin_moderation__header'>
			<moderation-header selected-tab='bans'></moderation-header>
			<button class='button button--blue' @click='toggleShowAddNewBanModal'>Add new ban</button>
		</div>

		<table class='admin_moderation__table' v-if='bans.length'>
			<tr>
				<th>User</th>
				<th>Ban type</th>
				<th>Date banned</th>
				<th>Message</th>
				<th>Action</th>
			</tr>
			<tr v-for='(ban, $index) in bans'>
				<td>{{ban.User.username}}</td>
				<td>{{ban.type}}</td>
				<td>{{ban.createdAt | formatDate}}</td>
				<td>
					<template v-if='ban.message'>{{ban.message}}</template>
					<i v-else>No message given</i>
				</td>
				<td>
					<button
						class='button button--red'
						@click='deleteBan(ban, $index)'
					>
						Delete ban
					</button>
				</td>
			</tr>
		</table>

		<div class='admin_moderation__no_bans' v-else>
			<span class='fa fa-thumbs-up'></span>
			No banned users
		</div>

		<modal-window v-model='$store.state.moderation.showAddNewBanModal' width='30rem'>
			<div class='admin_moderation__add_new_ban_modal'>
				<h2>Ban or block a user</h2>
				<p>Search for the user to ban, then select the relevant ban type for the user</p>

				<div>
					<fancy-input
						placeholder='Username to ban'
						v-model='$store.state.moderation.username'
						width='15rem'
						:large='true'
					></fancy-input>
				</div>

				<div>
					<fancy-input
						placeholder='Message to user (optional)'
						v-model='$store.state.moderation.message'
						width='15rem' 
						:large='true'
					></fancy-input>
				</div>

				<div>
					<select-button
						:options='$store.state.moderation.options'
						name='test'
						v-model='$store.state.moderation.selectedOption'
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
	import ModerationHeader from '../ModerationHeader'

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
			ConfirmModal,
			ModerationHeader
		},
		data () {
			return {
				bans_: []
			}
		},
		computed: {
			bans () {
				return this.bans_.map(ban => {
					if(ban.ipBanned) {
						ban.type = 'IP banned'
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
				this.$store.commit(
					'moderation/setModal',
					!this.$store.state.moderation.showAddNewBanModal
				)
				this.$store.dispatch('moderation/clearModal')
			},
			addBan () {
				let store = this.$store.state.moderation

				let obj = { username: store.username }
				if(store.message.trim().length) {
					obj.message = store.message
				}
				if(store.selectedOption === 'both') {
					obj.canCreatePosts = false
					obj.canCreateThreads = false
				} else if(store.selectedOption === 'thread') {
					obj.canCreateThreads = false
				} else if(store.selectedOption === 'post') {
					obj.canCreatePosts = false
				} else {
					obj.ipBanned = true
				}

				this.axios
					.post('/api/v1/ban', obj)
					.then(res => {
						this.bans_.push(res.data)
						this.toggleShowAddNewBanModal()
						this.$store.dispatch('moderation/clearModal')
					})
					.catch(AjaxErrorHandler(this.$store))
			},
			deleteBan (ban, index) {
				this.axios
					.delete('/api/v1/ban/' + ban.id)
					.then(res => {
						this.bans_.splice(index, 1)
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
		padding: 2rem;
		padding-top: 1rem;


		@at-root #{&}__header {
			display: flex;
			justify-content: space-between;
			align-items: flex-end;

			button {
				margin-bottom: 1.2rem;
			}
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

		@at-root #{&}__no_bans {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding-top: 5rem;
			font-size: 2rem;
			user-select: none;
			cursor: default;
			transition: none;
			color: $color__gray--darkest;

			span {
				font-size: 4rem;
				color: $color__gray--darker;
			}
		}
	}
</style>