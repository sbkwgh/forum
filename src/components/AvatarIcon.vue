<template>
	<info-tooltip class='avatar_icon' @hover='loadUser'>
		<template slot='content'>
			<template v-if='ajaxUser'>
				{{ajaxUser.username}}
			</template>
			<template v-else>Loading...</template>
		</template>
		<div
			slot='display'
			class='avatar_icon__icon'
			:style='{ "background-color": user.color }'
			@click='$emit("click")'
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
					.get('/api/v1/user/' + this.user.id)
					.then((res) => {
						this.ajaxUser = res.data
					})
					.catch(AjaxErrorHandler(this.$store))
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

		@at-root #{&}__date  {
			display: inline-block;
			color: $color__gray--darkest;
			font-size: 0.8rem;
		}
		@at-root #{&}__username {
			display: inline-block;
			font-size: 0.9rem;
			color: #000;
		}

		@at-root #{&}__content {
			*:first-child, *:last-child {
				margin: 0;
			}
			p {
				margin: 0.25rem 0;
			}
		}

		@at-root #{&}__icon {
			height: 3rem;
			width: 3rem;
			line-height: 3rem;
			@include text($font--role-emphasis, 2rem)
			text-align: center;
			border-radius: 100%;
			background-color: $color__gray--darkest;
			color: #fff;
		}
	}
</style>