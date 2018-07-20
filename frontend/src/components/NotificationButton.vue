<template>
	<div class='notification_button'>
		<div
			class='notification_button__overlay'
			:class='{ "notification_button__overlay--show" : showMenu}'
			@click='setShowMenu(false)'
		></div>
		<button
			class='button notification_button__button'
			:class='{ "notification_button__button--shake": shake }'
			@click='setShowMenu(!showMenu)'
		>
			<span class='far fa-bell notification_button__button__icon'></span>
			<span
				class='notification_button__button__count'
				:class='{
					"notification_button__button__count--none": !unreadCount,
					"notification_button__button__count--two_figure": unreadCount > 9,
					"notification_button__button__count--three_figure": unreadCount > 99
				}'
			>{{unreadCountText}}</span>
		</button>
		<div
			class='notification_button__menu_group'
			:class='{ "notification_button__menu_group--show" : showMenu}'
		>
			<div class='notification_button__big_triangle'></div>
			<div
				class='notification_button__small_triangle'
				:class='{ "notification_button__small_triangle--empty": !notifications.length}'
			></div>
			<div class='notification_button__menu'>
				<div
					v-for='(notification, index) in notifications'
					v-if='notification.PostNotification.Post'
					class='notification_button__menu__item'
					:class='{
						"notification_button__menu__item--uninteracted": !notification.interacted,
						"notification_button__menu__item--no_border": index > 2
					}'

					@click='click(notification)'
				>

				<div class='notification_button__menu__item__header'>
					<span v-if='notification.type === "mention"'>New mention</span>
					<span v-else-if='notification.type === "reply"'>Reply to your post</span>
					<span>
						<span class='notification_button__menu__item__header__date'>{{notification.createdAt | formatDate }}</span>
						<span
							class='notification_button__menu__item__header__close'
							@click.stop='deleteNotification(notification.id)'
						>&times;</span>
					</span>
				</div>
				<div>
					<span v-if='isYouOrDeleted(notification.PostNotification.User)'>
						{{ notification.PostNotification.User ? 'You' : '[deleted]' }}
					</span>
					<span class='notification_button__menu__item__link' v-else>
						{{notification.PostNotification.User.username}}
					</span>

					wrote
					"{{notification.PostNotification.Post.content | stripTags | truncate(50)}}"
				</div>

				</div>
				<div class='notification_button__menu__empty' v-if='!notifications.length'>
					<span>{{emojis[emojiIndex % 6]}}</span>
					No notifications
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'NotificationButton',
		data () {
			return {
				unreadCount: 0,
				notifications: [],

				showMenu: false,
				shake: false,
				emojis: ['😢', '🤷', '😘', '😒', '😔', '💩'],
				emojiIndex: Math.round(Math.random()*5)
			}
		},
		computed: {
			unreadCountText () {
				if(this.unreadCount > 99) {
					return '99+'
				} else {
					return this.unreadCount
				}
			}
		},
		methods: {
			isYouOrDeleted (user) {
				return !user || user.username === this.$store.state.username
			},
			setShowMenu (val) {
				this.showMenu = val

				if(val) {
					this.resetUnreadCount()
				} else {
					setTimeout(_ => {
						this.emojiIndex++
					}, 200)
				}
			},
			getIndexById (id) {
				let index

				this.notifications.forEach((notification, i) => {
					if(notification.id === id) {
						index = i
					}
				})

				return index
			},
			getNotifications () {
				this.axios
					.get('/api/v1/notification')
					.then(res => {
						this.notifications = res.data.Notifications
						this.unreadCount = res.data.unreadCount
					})
					.catch(AjaxErrorHandler(this.$store))
			},
			resetUnreadCount () {
				this.axios
					.put('/api/v1/notification')
					.then(res => {
						this.unreadCount = 0
					})
					.catch(AjaxErrorHandler(this.$store))
			},
			deleteNotification (id) {
				let index = this.getIndexById(id)

				this.axios
					.delete('/api/v1/notification/' + id)
					.then(res => {
						this.notifications.splice(index, 1)
					})
					.catch(AjaxErrorHandler(this.$store))
			},
			setInteracted (id) {
				let index = this.getIndexById(id)
				let item = this.notifications[index]
				
				this.axios
					.put('/api/v1/notification/' + id)
					.then(res => {
						this.$set(
							this.notifications,
							index,
							Object.assign(item, { interacted: true })
						)
					})
					.catch(AjaxErrorHandler(this.$store))
			},
			click (notification) {
				if(!notification.interacted) {
					this.setInteracted(notification.id)
				}

				if(notification.type === 'mention' || notification.type === 'reply') {
					this.$router.push('/p/' + notification.PostNotification.Post.id)
				} else if(notification.type === 'reply') {
					this.$router.push('/p/' + notification.PostNotification.Post.id)
				}

				this.setShowMenu(false)
			}
		},
		created () {
			if(this.$store.state.username) this.getNotifications()

			socket.on('notification', notification => {
				this.unreadCount++
				this.notifications.unshift(notification)

				this.shake = true
				setTimeout(_ => {
					this.shake = false
				}, 1000)
			})
		},
		watch: {
			'$store.state.username': 'getNotifications'
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	@keyframes shake {
		0% {
			position: relative;
			left: 0;
		}
		25% {
			position: relative;
			left: -1rem;
		}
		75% {
			position: relative;
			left: 1rem;
		}
		100% {
			left: 0rem;
		}
	}

	.notification_button {
		position: relative;

		@at-root #{&}__overlay {
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			position: fixed;
			z-index: 5;
			pointer-events: none;

			@at-root #{&}--show {
				pointer-events: all;
			}
		}

		@at-root #{&}__menu_group {
			position: relative;
			top: -3rem;

			pointer-events: none;
			opacity: 0;
			transition: opacity 0.2s, top 0.2s;

			@at-root #{&}--show {
				pointer-events: all;
				opacity: 1;
				top: -2.5rem;
			}
		}

		@at-root #{&}__big_triangle {
			width: 1rem;
			height: 1rem;
			background-color: #fafafa;
			transform: rotate(45deg);
			position: absolute;
			box-shadow: 5px 5px 10px 0px rgba(0, 0, 0, 0.75);
			top: 2.4rem;
			border-radius: 0.125rem 0 0 0;
			border: 0.125rem solid $color__gray--primary;
			left: calc(50% - 1rem /2);
			z-index: 6;
		}
		@at-root #{&}__small_triangle {
			width: 0;
			left: calc(50% - 1rem / 2 - .125rem);
			height: 0;
			border-left: 0.625rem solid transparent;
			top: 2.4rem;
			border-right: 0.625rem solid transparent;
			border-bottom: 0.625rem solid #fafafa;
			position: absolute;
			z-index: 8;
		}
		@at-root #{&}__menu {
			left: calc(-50% - 1.25rem);
			position: absolute;
			top: 2.9rem;
			background-color: #fafafa;
			width: 20rem;
			border-radius: 0.25rem;
			border: 0.125rem solid $color__gray--darker;
			box-shadow: 0 7px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
			min-height: 8rem;
			max-height: 15rem;
			overflow-y: auto;
			z-index: 7;

			@at-root #{&}__empty {
				background-color: #fafafa;
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 2rem;
				height: 8rem;
				justify-content: center;
				font-size: 1rem;
				user-select: none;
				cursor: default;
				transition: none;
				color: $color__gray--darkest;

				span {
					font-size: 2rem;
					color: $color__gray--darker;
					margin-bottom: 0.5rem;
				}
			}

			@at-root #{&}__item {
				@at-root #{&}--no_border:last-child {
					border: none;
				}

				padding: 0.5rem;
				border-bottom: thin solid $color__gray--primary;
				cursor: default;
				background-color: #fff;

				transition: background-color 0.2s;

				&:hover {
					background-color: $color__lightgray--primary;
				}


				@at-root #{&}--uninteracted {
					background-color: rgba(13, 71, 161, 0.1);
					border-bottom-color: $color__gray--darkest;

					&:hover {
						background-color: rgba(13, 71, 161, 0.2);
					}
				}
				
				@at-root #{&}__link {
					font-weight: 400;
					cursor: pointer;
				}

				@at-root #{&}__header {
					display: flex;
					justify-content: space-between;
					font-size: 0.9rem;

					@at-root #{&}__date {
						color: $color__text--secondary;
					}
					@at-root #{&}__close {
						background-color: $color__gray--darkest;
						height: 0.9rem;
						width: 0.9rem;
						cursor: pointer;
						display: inline-flex;
						border-radius: 100%;
						margin-left: 0.25rem;
						align-items: center;
						justify-content: center;
						padding: 0;
						color: #fff;
						position: relative;
						top: 0.0625rem;
						line-height: 1;
						transition: all 0.2s;

						&:hover {
							filter: brightness(0.9);
						}
					}
				}
			}
		}

		@at-root #{&}__button {
			position: relative;
			height: 2.5rem;
			width: 2.5rem;
			transition: border 0.4s, padding 0.4s;

			@at-root #{&}--shake {
				animation-name: shake;
				animation-iteration-count: 4;
				animation-duration: 0.25s;
				animation-timing-function: ease-in-out;
			}

			@at-root #{&}__icon {
				font-size: 1.5rem;
				position: absolute;
				top: 0.35rem;
				left: 0.4rem;
			}

			@at-root #{&}__count {
				position: absolute;
				background-color: $color__blue--primary;
				line-height: 1;
				margin-left: 0.25rem;
				color: #fff;
				border-radius: 100%;
				height: 1rem;
				width: 1rem;
				display: inline-flex;
				align-items: center;
				padding: 0.75rem;
				font-size: 0.9rem;
				justify-content: center;
				left: 0.8rem;
				top: -0.2rem;

				transition: all 0.2s;

				@at-root #{&}--none {
					opacity: 0;
				}
				@at-root #{&}--two_figure {
					font-size: 0.8rem;
				}
				@at-root #{&}--three_figure {
					font-size: 0.7rem;
				}
			}
		}
	}

	@media (max-width: 600px) {
		.notification_button__menu_group {
			left: calc(3.5rem - 100vw);
			width: calc(100vw - 0.25rem);
		}
		.notification_button__menu {
			width: 100%;
			left: unset;
			right: unset !important;

		}
	}

	@media (max-width: 870px) {
		//Because the notification button is
		//actually a child of the hamburger menu
		//it 'pops up' when the overlay is showing
		//so we cover it with its own overlay
		//hacky but it works...
		.notification_button__button::before {
		 	content: '';
		 	position: absolute;
		 	top: 0;
		 	left: 0;
		 	pointer-events: none;
		 	opacity: 0;
		 	width: 100%;
		 	border-radius: 0.25rem;
		 	height: 100%;
		 	background-color: hsla(215, 13%, 25%, 0.5);
		 	transition: all 0.4s;
		}
		.header__group--show .notification_button {
			cursor: default;
			pointer-events: none;

			@at-root #{&}__button {
				border: none;

				&::before {
					opacity: 1;
				}
			}
		}

		.notification_button {
			position: fixed;
			right: 0.5rem;
			width: 2.4rem;
			top: 0.5rem;
			border-radius: 0.25rem;

			@at-root #{&}__button {
				border: none;

				span {
					top: 0.5rem;
				}
			}

			@at-root #{&}__menu_group {
				left: calc(3.5rem - 100vw);
				width: calc(100vw - 0.25rem);
			}

			@at-root #{&}__menu {
				left: unset;
				right: 0.5rem;

				@at-root #{&}__empty {
					font-weight: normal;
				}
			}

			@at-root #{&}__small_triangle {
				left: unset;
				right: 1.5rem;
			}
			@at-root #{&}__big_triangle {
				left: unset;
				right: 1.55rem;
			}
		}
	}
</style>