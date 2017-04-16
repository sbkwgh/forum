<template>
	<div class='notification_button'>
		<div
			class='notification_button__overlay'
			:class='{ "notification_button__overlay--show" : showMenu}'
			@click='setShowMenu(false)'
		></div>
		<button class='button notification_button__button' @click='setShowMenu(!showMenu)'>
			<span>Notifications</span>
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
					v-for='notification in notifications'
					class='notification_button__menu__item'
					:class='{
						"notification_button__menu__item--uninteracted": !notification.interacted
					}'

					@click='click(notification)'
				>

					<template v-if='notification.type === "mention"'>
						<div class='notification_button__menu__item__header'>
							<span>New mention</span>
							<span>
								<span class='notification_button__menu__item__header__date'>{{notification.createdAt | formatDate }}</span>
								<span
									class='notification_button__menu__item__header__close'
									@click.stop='deleteNotification(notification.id)'
								>&times;</span>
							</span>
						</div>
						<div>
							<span class='notification_button__menu__item__link'>
								{{notification.MentionNotification.User.username}}
							</span>
							wrote
							"{{notification.MentionNotification.Post.content | stripTags | truncate(50)}}"
						</div>
					</template>

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

				if(notification.type === 'mention') {
					this.$router.push('/p/' + notification.MentionNotification.Post.id)
				}

				this.setShowMenu(false)
			}
		},
		created () {
			this.getNotifications()

			socket.on('notification', notification => {
				this.unreadCount++
				this.notifications.unshift(notification)
			})
		},
		watch: {
			'$store.state.username': 'getNotifications'
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

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
			background-color: #fff;
			transform: rotate(45deg);
			position: absolute;
			box-shadow: 5px 5px 10px 0px rgba(0, 0, 0, 0.75);
			top: 2.4rem;
			border-radius: 0.125rem 0 0 0;
			border: 0.125rem solid $color__gray--primary;
			left: calc(50% - 1.414rem /2);
			z-index: 6;
		}
		@at-root #{&}__small_triangle {
			width: 0;
			left: calc(50% - 1.414rem / 2 - .125rem);
			height: 0;
			border-left: 0.625rem solid transparent;
			top: 2.4rem;
			border-right: 0.625rem solid transparent;
			border-bottom: 0.625rem solid #ffffff;
			position: absolute;
			z-index: 8;

			@at-root #{&}--empty {
				border-bottom-color: #fafafa;
			}
		}
		@at-root #{&}__menu {
			left: calc(-50% - 1.25rem);
			position: absolute;
			top: 2.9rem;
			background-color: #fff;
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
				&:last-child {
					border-bottom: none;
				}

				padding: 0.5rem;
				border-bottom: thin solid $color__gray--primary;
				cursor: default;

				transition: background-color 0.2s;

				&:hover {
					background-color: $color__lightgray--primary;
				}
				&:active {
					background-color: $color__lightgray--darker;
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
			padding-right: 2.5rem;

			@at-root #{&}__count {
				position: absolute;
				background-color: $color__blue--primary;
				line-height: 1;
				margin-left: 0.25rem;
				color: #fff;
				top: 0.35rem;
				right: 0.5rem;
				border-radius: 100%;
				height: 1rem;
				width: 1rem;
				display: inline-flex;
				align-items: center;
				padding: 0.75rem;
				font-size: 0.9rem;
				justify-content: center;

				transition: all 0.2s;

				@at-root #{&}--none {
					background-color: rgba(white, 0.75);
					font-weight: 300;
					color: initial;
					border: 0.0125rem solid $color__blue--darker;
					padding: calc(0.75rem - 4*0.0125rem);
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
</style>