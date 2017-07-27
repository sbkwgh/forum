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
				<button class='button button--blue' @click='toggleShowAddNewBanModal'>Add new ban</button>

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
				selectedOption: 0
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
	.admin_moderation {
		padding-top: 0.5rem;

		@at-root #{&}__tab {
			height: 100%;
		}

		@at-root #{&}__add_new_ban_modal {
			padding: 1rem;

			h2 {
				padding: 0;
				margin: 0;
				margin-bottom: -0.5rem;
			}
		}
	}
</style>