<template>
	<div class='notification_button'>
		<button class='button notification_button__button'>
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
	</div>
</template>

<script>
	export default {
		name: 'NotificationButton',
		data () {
			return {
				count: 3
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
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.notification_button {

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