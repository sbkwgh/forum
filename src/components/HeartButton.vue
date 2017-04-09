<template>
	<label class='heart_button' :class='{"heart_button--unlikeable": !likeable}'>
		<input
			type='checkbox'
			:disabled='!likeable'
			:checked='liked'
			v-on:change="change"
		>
		<span class='fa'></span>
		<span class='heart_button__count'>{{likes}}</span>
	</label>
</template>

<script>
	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'HeartButton',
		props: ['post'],
		data () {
			return {
				changed: false,
				liked_: false
			}
		},
		computed: {
			likeable () {
				let postUsername = this.post.User ?
					this.post.User.username : 
					null

				return (
					this.$store.state.username &&
					postUsername !== this.$store.state.username
				)
			},
			likes: {
				get () {
					let likes = this.post.Likes.length

					if(this.changed) {
						return this.liked ? likes+1 : likes-1
					} else {
						return likes
					}
				}
			},
			liked: {
				get () {
					if(this.changed) {
						return this.liked_
					} else {
						return this.post.Likes.some(u => {
							return u.username === this.$store.state.username
						})
					}
				},
				set (val) {
					this.changed = true
					this.liked_ = val
				}
			}
		},
		methods: {
			change (e) {
				let liked = e.target.checked
				let id = this.post.id
				
				if(liked) {
					this.axios
						.put('/api/v1/post/' + id + '/like')
						.then(_ => this.liked = true)
						.catch((err) => {
							e.target.checked = !liked
							AjaxErrorHandler(this.$store)(err)
						})
				} else {
					this.axios
						.delete('/api/v1/post/' + id + '/like')
						.then(_ => this.liked = false)
						.catch((err) => {
							e.target.checked = !liked
							AjaxErrorHandler(this.$store)(err)
						})
				}
			}
		},
		watch: {
			//TODO: fix this subtle bug
			'$store.state.username': function() {
				this._liked = false
				this.$forceUpdate()
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.heart_button {
		cursor: pointer;
		@include user-select(none);

		@at-root #{&}--unlikeable {
			cursor: not-allowed;
		}

		input {
			display: none;
		}

		#{&}__count {
			position: relative;
			bottom: 0.0625rem;
		}

		span.fa {
			color: $color__gray--darkest;
			transition: text-shadow 0.2s, color 0.2s, filter 0.2s;
			font-size: 1.125rem;

			&:hover {
				filter: brightness(0.9);
			}

			&::before {
				content: "\f004";
			}
		}
		input:checked + span.fa {
			color: #E91E63;
		}
	}
</style>