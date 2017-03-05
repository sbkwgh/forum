<template>
	<div class='route_container'>
		<div class='user_header'>
			<div
				class='user_header__icon'
				:style='{ "background-color": null }'
			>
				U
			</div>
			<div class='user_header__info'>
				<span class='user_header__username'>Username</span>
				<span class='user_header__date'>Created: {{new Date() | formatDate('date') }}</span>
			</div>
			<div></div>
		</div>
		<div class='user_description'> 
			<p>
			Lorem ipsum dolor sit amet, vis ei nostrud numquam, mutat debet mediocritatem nam an. Mazim partem ea nam, id vitae docendi blandit vim. Cum in errem gloriatur moderatius, in elitr choro solet vel. Ex sit errem saepe, apeirian tractatos et pri.
			Minim accusamus ad nam.
			</p>
			<p>
			Quo ludus mucius feugiat no, et ubique meliore nominavi pro. Eos et dicat luptatum, at constituam voluptatibus pro. Pro eu iudicabit consulatu, nam ad ubique epicuri, vidit suavitate pri no. Duo ne erat deserunt, sea id argumentum persequeris.
			</p>
		</div>
		<div class='user_posts'>
			<div class='user_posts__title'>Posts by username</div>
			<div class='user_posts__post'>
				<div class='user_posts__post__header'>
					<div class='user_posts__post__thread'>Thread name</div>
					<div class='user_posts__post__date'>{{new Date() | formatDate('date')}}</div>
				</div>
				<div class='user_posts__post__content'>ContentContentContentContentContentContentContent<br/> ContentContentContentContentContentContentContent<br/> ContentContentContentContentContentContentContent<br/> ContentContentContentContentContentContentContent<br/> ContentContentContentContentContentContentContent<br/> </div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'user'
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';

	.user_header {
		display: flex;
		align-items: center;

		@at-root #{&}__icon {
			height: 4rem;
			width: 4rem;
			line-height: 4.25rem;
			@include text($font--role-emphasis, 3rem)
			text-align: center;
			border-radius: 100%;
			background-color: $color__gray--darkest;
			color: #fff;
		}
		@at-root #{&}__info {
			display: flex;
			flex-direction: column;
			margin-left: 1rem;
			height: 4rem;
		}
		@at-root #{&}__username {
			margin-top: -0.25rem;
			font-size: 2rem;
			font-weight: bold
		}
		@at-root #{&}__date {
			color: $color__gray--darkest;
			font-size: 1.5rem;
		}
	}
	.user_description {
		margin-left: 5rem;
		width: 75%;
	}
	.user_posts {
		width: calc(75% + 5rem);

		&:last-child {
			border-bottom: thin solid $color__gray--primary;
		}

		@at-root #{&}__title {
			font-size: 1.5rem;
			margin-bottom: 0.5rem;
		}
		@at-root #{&}__post {
			border-top: thin solid $color__gray--primary;
			padding: 1rem 0.5rem;
			margin: 0.5rem 0;

			@at-root #{&}__header {
				display: flex;
				justify-content: space-between;
				margin-bottom: 1rem;
			}
			@at-root #{&}__thread {
				cursor: pointer;
			}
			@at-root #{&}__date {
				color: $color__gray--darkest;
			}
		}
	}
</style>