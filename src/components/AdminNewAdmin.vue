<template>
	<div class='admin_new_admin'>
		<modal-window v-model='showModal'>
			<div class='admin_new_admin__modal'>
				<fancy-input
					:value='link'
					placeholder='Admin login link'
					width='12.5rem'
					style='margin-bottom: 0.5rem;'
				></fancy-input>
				<button class='button button--modal' @click='toggleModal'>OK</button>
			</div>
		</modal-window>

		<div class='admin_new_admin__box'>
			<div class='admin_new_admin__text'>
				<div class='admin_new_admin__text__title'>Add other admin users</div>
				Click to generate a login link for a new admin account - this will expire after 24 hours
				
				<div v-if='!filteredAdmins'>Loading...</div>
				<div v-else>
					<strong v-if='filteredAdmins.length === 0'>There are no other admins</strong>
					<template v-else>
						Current admins are you,
						<span v-for='(admin, $index) in filteredAdmins'>
							<router-link :to='"/user/" + admin.username'>{{admin.username}}</router-link>
							<template v-if='$index !== filteredAdmins.length-1'>,</template>
						</span>
					</template>
				</div>
			</div>
			<loading-button :loading='loading' @click='getLink'>Generate link</loading-button>
		</div>
	</div>
</template>

<script>
	import ModalWindow from './ModalWindow'
	import FancyInput from './FancyInput'
	import LoadingButton from './LoadingButton'

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'AdminNewAdmin',
		components: {
			ModalWindow,
			FancyInput,
			LoadingButton
		},
		methods: {
			toggleModal () {
				this.showModal = !this.showModal
			},
			getLink () {
				this.axios
					.post('/api/v1/admin_token')
					.then(res => {
						this.link = window.location.origin + '/?token=' + res.data.token
						this.toggleModal()
					})
					.catch(AjaxErrorHandler(this.$store))
			}
		},
		data () {
			return {
				loading: false,
				showModal: false,
				link: '',
				admins: null
			}
		},
		computed: {
			filteredAdmins () {
				if(!this.admins) {
					return null
				} else {
					return this.admins.filter(a => {
						return a.username !== this.$store.state.username
					})
				}
			}
		},
		created () {
			this.axios
				.get('/api/v1/user?admin=true')
				.then(res => {
					this.admins = res.data
				})
				.catch(AjaxErrorHandler(this.$store))
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	@at-root .admin_new_admin {
		@at-root #{&}__modal {
			padding: 1rem;
		}

		@at-root #{&}__box {
			background-color: #fff;
			padding: 1.5rem;
			border-radius: 0.25rem;
			margin-bottom: 1rem;

			@extend .shadow_border;
		}

		@at-root #{&}__text {
			margin-bottom: 1rem;

			@at-root #{&}__title {
				margin-bottom: 0.5rem;
				font-weight: bold;
				font-size: 1.25rem;
			}
		}
	}
</style>