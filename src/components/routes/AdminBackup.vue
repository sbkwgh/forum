<template>
	<div class='admin_backup'>
		<confirm-modal v-model='showDeleteModal' color='red' text='Delete backup'>
			Are you sure you want to delete this backup?
		</confirm-modal>

		<confirm-modal v-model='showRestoreModal' text='Restore backup'>
			The uploaded file does not match any previous backups - unless this backup is from
			a different forum instance, it is likely corrupted. <br/><br/>
			If the file is corrupted the backup restore will fail. Continue?
		</confirm-modal>		

		<h1 class='admin_backup__title'>Backup</h1>	

		<div class='category_widget__box'>
			<div class='category_widget__text'>
				<div class='admin_backup__header'>
					<div class='category_widget__text__title'>Previous backups</div>
					<div>
						<button class='button button--blue'>Backup now</button>
						<button class='button' @click='showRestoreModal = true'>Restore local backup</button>

					</div>
				</div>
				Listed below are previous backups and date created
			</div>
			<table>
				<tr>
					<th>Date created</th>
					<th>Size</th>
					<th>SHA-256 hash</th>
					<th>Actions</th>
				</tr>
				<tr>
					<td>{{new Date() | formatDate }}</td>
					<td>895 kb</td>
					<td>16cedf80ade01c62bdd1ae931d0492330c0b62bf294c08c095ce2fab21a9298d</td>
					<td>
						<button class='button button--thin_text'>Restore</button>
						<menu-button
							:options='[
								{ value: "Download" },
								{ value: "Delete", event: "delete-backup" }
							]'

							@delete-backup='showDeleteModal = true'
						>
							<button class='button button--borderless button--thin_text'>More options</button>
						</menu-button>
					</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<script>
	import MenuButton from '../MenuButton'
	import ConfirmModal from '../ConfirmModal'

	export default {
		name: 'AdminBackup',
		components: {
			MenuButton,
			ConfirmModal
		},
		data () {
			return {
				showDeleteModal: false,
				showRestoreModal: false
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.admin_backup {
		padding: 1rem 2rem;

		@at-root #{&}__title {
			margin: 0.5rem 0 1rem 0;
		}
		@at-root #{&}__header {
			display: flex;
			align-items: baseline;
			justify-content: space-between;

			button:first-child {
				margin-right: 0.5rem;
			}
		}

		table {
			width: 100%;
			border-collapse: collapse;

			th, td {
				text-align: left;
				padding: 0.5rem;
			}

			tr {
				border-bottom: thin solid $color__lightgray--primary;
			}

			.menu_button {
				display: inline-block;
				margin-left: 0.5rem;
			}
		}
	}
</style>