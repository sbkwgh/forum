<template>
	<div class='admin_moderation'>
		<div class='admin_moderation__header'>
			<moderation-header selected-tab='bans'></moderation-header>
			<button class='button button--blue' @click='toggleShowAddNewBanModal'>Add new ban</button>
		</div>

		<transition name='fade' mode='out-in'>
			<loading-message v-if='!bans' key='loading'></loading-message>

			<table class='admin_moderation__table' v-else-if='bans.length' key='bans'>
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

			<div class='overlay_message' v-else key='no bans'>
				<span class='fa fa-thumbs-up'></span>
				No banned users
			</div>
		</transition>

		<modal-window v-model='$store.state.moderation.showAddNewBanModal' width='30rem'>
			<div class='admin_moderation__add_new_ban_modal'>
				<div
					class='admin_moderation__add_new_ban_modal__overlay'
					:class='{ "admin_moderation__add_new_ban_modal__overlay--show": loading }'
				>
					<loading-icon></loading-icon>
				</div>

				<h2>Ban or block a user</h2>
				<p>Search for the user to ban, then select the relevant ban type for the user</p>

				<form @submit.prevent='addBan'>
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
						<div
							class='button button--modal button--borderless'
							@click='toggleShowAddNewBanModal'
						>
							Cancel
						</div>
						<button
							class='button button--modal button--green'
							type='submit'
						>
							Add ban
						</button>
					</div>
				</form>
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
	import LoadingIcon from '../LoadingIcon'
	import LoadingMessage from '../LoadingMessage'

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
			ModerationHeader,
			LoadingIcon,
			LoadingMessage
		},
		data () {
			return {
				loading: false,
				bans_: null
			}
		},
		computed: {
			bans () {
				if(!this.bans_) return null

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

				this.loading = true

				this.axios
					.post('/api/v1/ban', obj)
					.then(res => {
						this.loading = false
						this.bans_.push(res.data)
						this.toggleShowAddNewBanModal()
						this.$store.dispatch('moderation/clearModal')
					})
					.catch(e => {
						this.loading = false
						AjaxErrorHandler(this.$store)(e)
					})
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

			@at-root #{&}__overlay {
				margin-left: -1rem;
				@include loading-overlay(rgba(0, 0, 0, 0.3), 0.125rem);
			}

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

			border: thin solid $color__gray--darker;
			
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