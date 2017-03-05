<template>
	<info-tooltip class='avatar_icon' @hover='loadUser'>
		<template slot='content'>
			<template v-if='ajaxUser'>
				<div class='avatar_icon__header'>
					<div
						class='avatar_icon__icon avatar_icon__icon--small'
						:style='{ "background-color": user.color }'
						@click='goToUser'
					>
						{{user.username[0]}}
					</div>
					<div class='avatar_icon__header_info'>
						<span class='avatar_icon__username' @click='goToUser'>{{ajaxUser.username}}</span>
						<span class='avatar_icon__date'>Created: {{ajaxUser.createdAt | formatDate('date') }}</span>
					</div>
				</div>
				<div class='avatar_icon__description'>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				</div>
			</template>
			<template v-else>Loading...</template>
		</template>
		<div
			slot='display'
			class='avatar_icon__icon'
			:style='{ "background-color": user.color }'
			@click='goToUser'
		>
			{{user.username[0]}}
		</div>
	</info-tooltip>
</template>

<script>
	import InfoTooltip from './InfoTooltip'
	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'AvatarIcon',
		props: ['user'],
		components: { InfoTooltip },
		data () {
			return {
				ajaxUser: null
			}
		},
		methods: {
			loadUser () {
				if(this.ajaxUser) return

				this.axios
					.get('/api/v1/user/' + this.user.username)
					.then((res) => {
						this.ajaxUser = res.data
					})
					.catch(AjaxErrorHandler(this.$store))
			},
			goToUser () {
				this.$router.push('/user/' + this.user.username)
			}
		}
	}
</script>

<style lang='scss'>
	@import '../assets/scss/variables.scss';

	.avatar_icon {
		@at-root #{&}__icon {
			font-size: 0.7rem;
			margin-right: 0.25rem;
			color: rgba(0, 0, 0, 0.87);
		}

		@at-root #{&}__header {
			display: flex;
			align-items: center;
		}

		@at-root #{&}__icon {
			height: 3rem;
			width: 3rem;
			line-height: 3rem;
			cursor: pointer;
			@include text($font--role-emphasis, 2rem)
			text-align: center;
			border-radius: 100%;
			background-color: $color__gray--darkest;
			color: #fff;

			@at-root #{&}--small {
				height: 2.5rem;
				width: 2.5rem;
				font-size: 2rem;
				line-height: 2.25rem;
			}
		}
		@at-root #{&}__header_info {
			display: flex;
			flex-direction: column;
			height: 2.5rem;
		}
		@at-root #{&}__username {
			cursor: pointer;
		}
		@at-root #{&}__date {
			color: $color__gray--darkest;
			font-size: 0.9rem;
		}
		@at-root #{&}__description {
			margin-top: 0.25rem;
			font-size: 0.9rem;
		}
	}
</style>