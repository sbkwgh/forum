<template>
	<div class='index'>
		<modal-window :showModal='showModal'>
			<tab-view :tabs='["Sign up", "Login"]'>
				<div slot='first'>
					text 1
				</div>
				<div slot='second'>
					text 2
				</div>
			</tab-view>
		</modal-window>


		<div class='thread_sorting'>
			<select-button style='margin-right: 1rem' v-model='selected' :options='categories'></select-button>
			<div class='button button--orange'>New</div>
			<div class='button'>Most active</div>
			<div class='button'>No replies</div>
		</div>
		<table class='threads'>
			<colgroup>
				<col span="1" style="width: 50%;">
				<col span="1" style="width: 22.5%;">
				<col span="1" style="width: 22.5%;">
				<col span="1" style="width: 5%;">
			</colgroup>
			<thead>
				<tr class='thread thread--header'>
					<th>Title</th>
					<th>Latest post</th>
					<th>Category</th>
					<th>Replies</th>
				</tr>
			</thead>
			<tbody>
				<tr class='thread'>
					<td>A thread title here........</td>
					<td>
						<div>User</div>
						<div>0201/2017 10:07</div>
					</td>
					<td>A category here</td>
					<td>29</td>
				</tr>
			</tbody>
		</div>
	</div>
</template>

<script>
	import SelectButton from '../SelectButton'
	import ModalWindow from '../ModalWindow'
	import TabView from '../TabView'

	export default {
		name: 'index',
		components: {
			SelectButton,
			ModalWindow,
			TabView
		},
		data () {
			var categories = [
				{ name: 'All categories', value: '1' },
				{ name: 'Photography', value: '1' },
				{ name: 'Baking', value: '1' },
				{ name: 'Maps', value: '1' }
			];

			return {
				selected: null,
				showModal: true,
				categories
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.index {
		width: 80%;
		margin: 0 auto;
		margin-top: 2rem;
	}

	.thread_sorting {
		margin-bottom: 1rem;
	}

	.threads {
		border-collapse: collapse;
	}

	.thread {
		background-color: #fff;
		padding: 0.5rem 0;
		cursor: default;
		text-align: left;
		transition: background-color 0.2s;

		&:hover {
			background-color: $color__lightgray--primary;
		}

		td, th {
			padding: 0 0.5rem;
		}

		@at-root #{&}--header {
			&:hover {
				background-color: #fff;
			}

			th {
				font-weight: 400;
				padding-bottom: 0.25rem;
				border-bottom: thin solid $color__lightgray--darkest;
			}
		}

		@at-root #{&}__section {
			padding: 0 0.5rem;
		}

		@at-root #{&}__user {
			display: inline-block;
		}
		@at-root #{&}__date {
			color: $color__text--secondary;
			display: inline-block;
		}
	}
</style>