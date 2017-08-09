<template>
	<div class='admin_moderation'>
		<div class='admin_moderation__tabs'>
			<div class='tab_button tab_button--selected'>Reports</div>
			<div class='tab_button' @click='$router.push("bans")'>Banned users</div>
		</div>

		Below are posts reported by users - to remove the thread or block the user, click 'More options&hellip;'

		<confirm-modal v-model='removePostObj.showConfirmModal' @confirm='removePost' color='red'>
			Are you sure you want to remove this post?
		</confirm-modal>

		<div class='admin_moderation__reports' v-if='reports.length'>

			<div class='admin_moderation__report admin_moderation__report--header'>
				<div class='admin_moderation__report__post admin_moderation__report--cell_border admin_moderation__report--cell_border-hidden'>
					Post and thread reported
				</div>
				<div class='admin_moderation__report__reason admin_moderation__report--cell_border admin_moderation__report--cell_border-hidden'>Report reason</div>
				<div class='admin_moderation__report__flagged_by admin_moderation__report--cell_border admin_moderation__report--cell_border-hidden'>
					Reported by user
				</div>
				<div class='admin_moderation__report__actions'>
					Actions
				</div>
			</div>				

			<div class='admin_moderation__report' v-for='(report, $index) in reports'>
				<div class='admin_moderation__report__post admin_moderation__report--cell_border'>
					<div class='admin_moderation__report__post__header'>
						<div class='admin_moderation__report__post__thread'>{{report.Post.Thread.name}}</div>
						<div class='admin_moderation__report__post__user'>{{report.Post.User.username}}</div>
					</div>
					<div class='admin_moderation__report__post__content'>{{report.Post.content | stripTags | truncate(150)}}</div>
				</div>
				<div class='admin_moderation__report__reason admin_moderation__report--cell_border'>{{report.reason}}</div>
				<div class='admin_moderation__report__flagged_by admin_moderation__report--cell_border'>
					<avatar-icon class='admin_moderation__report__flagged_by__avatar' :user='report.FlaggedByUser'></avatar-icon>
					<div class='admin_moderation__report__flagged_by__text_info'>
						<div class='admin_moderation__report__flagged_by__user'>{{report.FlaggedByUser.username}}</div>
						<div class='admin_moderation__report__flagged_by__date'>{{report.createdAt| formatDate}}</div>
					</div>
				</div>
				<div class='admin_moderation__report__actions'>
					<button class='button button--red' @click='removePost(report, $index)'>Remove post</button>
					<menu-button
						@delete='deleteReport(report.id, $index)'
						@ban='banUser(report, $index)'
						:options='reportMenuOptions'
					>
						<button class='button'>More options&hellip;</button>
					</menu-button>
				</div>
			</div>
		</div>
		<div class='admin_moderation__no_reports' v-else>
			<span class='fa fa-thumbs-up'></span>
			No user reports
		</div>
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
				reportMenuOptions: [
					{ value: "Delete report", event: 'delete' },
					{ value: "Ban or block user", event: 'ban' },
					{ value: "Remove thread" }
				],
				reports: [],

				removePostObj: {
					showConfirmModal: false,
					report: null,
					index: null
				}
			}
		},
		methods: {
			deleteReport (id, index) {
				this.axios
					.delete('/api/v1/report/' + id)
					.then(_ => {
						this.reports.splice(index, 1)
					})
					.catch(AjaxErrorHandler(this.$store))
			},
			removePost (report, index) {
				if(report) {
					this.removePostObj.report = report
					this.removePostObj.index = index

					this.removePostObj.showConfirmModal = true
				} else {
					this.axios
						.delete('/api/v1/post/' + this.removePostObj.report.Post.id)
						.then(_ => {
							return this.axios.delete('/api/v1/report/' + this.removePostObj.report.id)
						})
						.then(_ => {
							this.reports.splice(this.removePostObj.index, 1)
						})
						.catch(AjaxErrorHandler(this.$store))
				}
			
			},
			banUser (report, index) {
				this.$router.push('bans')

				console.log(report)

				setTimeout(() => {
					this.$store.commit('moderation/setModal', true)
					this.$store.commit('moderation/setUsername', report.Post.User.username)
				}, 0)
			}
		},
		mounted () {
			this.$store.dispatch('setTitle', 'admin | moderation')

			this.axios
				.get('/api/v1/report')
				.then(res => {
					this.reports = res.data
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

		@at-root #{&}__reports {
			margin-top: 1rem;
			@extend .shadow_border;

			border-radius: 0.25rem;
			&> :first-child {
				border-radius: 0.25rem 0.25rem 0 0;
			}
			&> :last-child {
				border-radius: 0 0 0.25rem 0.25rem;
			}
		}
		@at-root #{&}__no_reports {
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


		@at-root #{&}__report {
			display: flex;
			background-color: #fff;
			border-bottom: thin solid $color__lightgray--primary;
			padding: 0.5rem;


			@at-root #{&}--header {
				font-weight: bold;
			}
			@at-root #{&}--cell_border {
				padding-right: 0.5rem;
				margin-right: 0.5rem;
				border-right: thin solid $color__lightgray--primary;

				@at-root #{&}-hidden {
					border-right-color: transparent;
				}
			}

			@at-root #{&}__post {
				width: 40%;

				@at-root #{&}__header {
					display: flex;
					justify-content: space-between;
				}
				@at-root #{&}__thread {
					font-size: 1rem;
					text-decoration: underline;
		
				}
				@at-root #{&}__content {

				}
			}
			@at-root #{&}__reason {
				width: 15%;
			}
			@at-root #{&}__flagged_by {
				width: 20%;
				display: flex;

			
				@at-root #{&}__text_info {
					margin-left: 0.5rem;
					display: flex;
					flex-direction: column;
				}
				@at-root #{&}__date {
					color: $color__darkgray--primary;
				}
			}
			@at-root #{&}__actions {
				width: 25%;
				display: flex;
				align-items: center;

				.button--red {
					margin-right: 0.5rem;
				}
			}
		}


		@at-root #{&}__header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>