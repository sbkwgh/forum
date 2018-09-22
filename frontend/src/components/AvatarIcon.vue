<template>
	<info-tooltip class='avatar_icon' :noEvents='user === null'>
		
		<template slot='content'>
			
			<template v-if='userData'>
				<div class='avatar_icon__header'>
					<div
						class='avatar_icon__icon avatar_icon__icon--small picture_circle'
						:style='{
							"background-color": proxyUser.color,
							"background-image": pictureURL,
						}'
						@click='goToUser'
					>
						{{letter}}
					</div>
					<div class='avatar_icon__header_info'>
						<span class='avatar_icon__username' @click.stop='goToUser'>{{proxyUser.username}}</span>
						<span class='avatar_icon__date'>User since {{proxyUser.createdAt | formatDate('date') }}</span>
					</div>
				</div>
				<div class='avatar_icon__description' v-if='proxyUser.description'>
					{{proxyUser.description}}
				</div>
			</template>

			<template v-else>Loading...</template>
		</template>

		<div
			slot='display'
			class='avatar_icon__icon picture_circle'
			:class='{"avatar_icon__icon--small": size === "small"}'
			:style='{
				"background-color": proxyUser.color,
				"background-image": pictureURL
			}'
			@click.stop='goToUser'
		>
			{{letter}}
		</div>

	</info-tooltip>
</template>

<script>
	import InfoTooltip from './InfoTooltip'
	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'AvatarIcon',
		props: ['user', 'size'],
		components: { InfoTooltip },
		data () {
			return {
				userData: null
			}
		},
		computed: {
			//So that you never access a null variable
			proxyUser () {
				if(this.userData) {
					//Data loaded via api 
					return this.userData;
				} else if (this.user) {
					//Data provided as a prop
					return this.user;
				}

				return {};
			},
			letter () {
				if(this.proxyUser.username) {
					return this.proxyUser.username[0].toUpperCase();
				} else {
					return '';
				}
			},
			pictureURL () {
				if(this.proxyUser.picture) {
					return "url(" + this.proxyUser.picture + ")";
				}
				
				return null;
			}
		},
		methods: {
			loadUser () {
				//If user is already loaded or no user provided as a prop
				if(this.userData || this.user === null) return;

				this.axios
					.get('/api/v1/user/' + this.proxyUser.username)
					.then((res) => {
						this.userData = res.data;
					})
					.catch(AjaxErrorHandler(this.$store));
			},
			goToUser () {
				if(this.user === null) return;

				this.$router.push('/user/' + this.user.username)
			}
		},
		mounted() { this.loadUser(); }
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
				font-size: 1.75rem;
				line-height: 2.5rem;
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
			color: $color__darkgray--primary;
			font-size: 0.9rem;
		}
		@at-root #{&}__description {
			margin-top: 0.25rem;
			font-size: 0.9rem;
		}
	}
</style>