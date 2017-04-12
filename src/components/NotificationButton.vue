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
					"notification_button__button__count--none": !count,
					"notification_button__button__count--two_figure": count > 9,
					"notification_button__button__count--three_figure": count > 99
				}'
			>{{countText}}</span>
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
				<div v-for='notification in notifications' class='notification_button__menu__item'>
					<div class='notification_button__menu__item__header'>
						<span>New mention</span>
						<span class='notification_button__menu__item__header__date'>{{new Date() | formatDate }}</span>
					</div>
					<div>
						<span class='notification_button__menu__item__link'>@John</span> wrote "Message here 123..."
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
	export default {
		name: 'NotificationButton',
		data () {
			return {
				count: 3,
				notifications: [],

				showMenu: false,
				emojis: ['😢', '🤷', '😘', '😒', '😔', '💩'],
				emojiIndex: Math.round(Math.random()*5)
			}
		},
		computed: {
			countText () {
				if(this.count > 99) {
					return '99+'
				} else {
					return this.count
				}
			}
		},
		methods: {
			setShowMenu (val) {
				this.showMenu = val

				if(!val) {
					setTimeout(_ => {
						this.emojiIndex++
					}, 200)
				}
			}
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

			&:last-child {
				border-bottom: none;
			}

			@at-root #{&}__item {
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