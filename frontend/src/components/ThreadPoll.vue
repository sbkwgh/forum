<template>
	<div class='poll'>
		<transition name='slide' mode='out-in'>
			<div class='poll__loading' key='loading' v-if='!poll'>
				<loading-icon :dark='true'></loading-icon>
			</div>
			<div key='poll' v-else>
				<div class='poll__question'>{{poll.question}}</div>

				<div class='poll__voting_view' v-if='view === "voting" && !poll.hasVoted'>
					<div class='poll__answers'>
						<div
							class='poll__answer'
							:class='{ "poll__answer--selected" : answer === selected }'
							v-for='answer in poll.PollAnswers'
							@click='selected = answer'
						>
							{{answer.answer}}
						</div>
					</div>
					<div class='poll__buttons'>
						<loading-button
							class='button--blue'
							:class='{ "button--disabled": !selected }'
							:loading='loading'
							@click='vote'
						>Vote now</loading-button>
						<button
							class='button button--borderless button--thin_text'
							@click='view = "results"'
						>View results</button>
					</div>
				</div>

				<div class='poll__results_view' v-else>
					<div class='poll__total_votes'>
						{{poll.totalVotes}}
						{{poll.totalVotes | pluralize('total vote')}}
					</div>

					<div class='poll__results'>
						<div class='poll__result' v-for='result in poll.PollAnswers'>
							<div>
								{{result.answer}}
								<span class='poll__result__info'>
									 &middot;
									{{result.PollVotes.length}} {{result.PollVotes.length | pluralize('vote')}}
									({{result.percent || 0}}%)
								</span>
							</div>
							<div class='poll__result__bar_outer'></div>
							<div class='poll__result__bar' :style='{ "width": (result.percent || 0) + "%" }'></div>
						</div>
					</div>

					<div class='poll__buttons' v-if='!poll.hasVoted'>
						<button class='button button--thin_text' @click='view = "voting"'>Back</button>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
	import LoadingIcon from './LoadingIcon'
	import LoadingButton from './LoadingButton'

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'ThreadPoll',
		props: ['id'],
		components: { LoadingIcon, LoadingButton },
		data () {
			return {
				poll: null,

				view: 'voting',
				selected: null,
				loading: false
			}
		},
		methods: {
			vote () {
				if(!this.$store.state.username) {
					this.$store.commit('setAccountTabs', 0)
					this.$store.commit('setAccountModalState', true)

					return
				}

				this.loading = true

				this.axios
					.post('/api/v1/poll/' + this.id, { answer: this.selected.answer })
					.then(res => {
						this.poll = res.data
						this.loading = false
						this.hasVoted = true
						this.view = 'results'
					})
					.catch(e => {
						this.loading = false
						AjaxErrorHandler(this.$store)(e)
					})
			}
		},
		mounted () {
			this.axios
				.get('/api/v1/poll/' + this.id)
				.then(res => this.poll = res.data)
				.catch(AjaxErrorHandler(this.$store))
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.poll {
		padding: 1rem;
		width: 80%;
		background-color: #fff;
		position: relative;
		margin-bottom: 2rem;
		border-radius: 0.25rem;
		border: thin solid $color__gray--darker;

		@at-root #{&}__loading {
			@include loading-overlay();
			opacity: 1;
		}

		@at-root #{&}__question {
			font-weight: bold;
			font-size: 1.125rem;
			word-break: break-all;
		}

		@at-root #{&}__answers, #{&}__results {
			margin: 1rem 0;
		}

		@at-root #{&}__answer {
			padding: 0.5rem 0.625rem;
			margin: 0.5rem 0;
			border: thin solid $color__gray--primary;
			border-radius: 0.125rem;
			cursor: pointer;
			transition: all 0.2s;
			position: relative;
			overflow: hidden;
			text-overflow: ellipsis;

			&::after {
				content: '';
				position: absolute;
				left: 0;
				top: 0;
				height: 100%;
				background-color: $color__blue--primary;
				width: 0rem;
				opacity: 0;
				border-radius: 0.125rem 0 0 0.125rem;

				transition: all 0.2s;
			}

			&:hover {
				box-shadow: 0 0.1rem 0.25rem 0 rgba(214, 214, 214, 0.5);
			}

			@at-root #{&}--selected {
				font-weight: bold;

				&::after {
					opacity: 1;
					width: 0.3rem;
				}
				&:hover {
					box-shadow: none;
				}
			}
		}
		@at-root #{&}__buttons {
			> * {
				margin-right: 0.5rem;
			}
		}

		@at-root #{&}__total_votes {
			color: $color__text--secondary;
			font-style: italic;
		}
		@at-root #{&}__result {
			margin: 0.5rem 0;
			word-break: break-all;

			@at-root #{&}__info {
				color: $color__text--secondary;
			}

			@at-root #{&}__bar_outer {
				width: 100%;
				border-radius: 1rem;
				height: 1rem;
				margin-top: 0.25rem;
				border: thin solid $color__blue--primary;

			}
			@at-root #{&}__bar {
				background-color: lighten($color__blue--primary, 15%);
				height: 1rem;
				border-radius: 1rem;
				position: relative;
				top: -1rem;
				margin-bottom: -1rem;
			}
		}
	}

	@include thread_mobile_breakpoint ('.poll');
</style>