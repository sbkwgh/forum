<template>
	<div class='heart_button'>
		<modal-window v-model='showModal' :close-button='true'>
			<div class='heart_button__modal'>
				<div class='heart_button__modal__header'>Likes</div>
				<div
					class='heart_button__modal__user'
					v-for='user in likes'
					@click='$router.push("/user/" + user.username)'
				>
					<avatar-icon
						:user='user'
						size='small'
					></avatar-icon>	
					<div class='heart_button__modal__username'>{{user.username}}</div>
				</div>

				<div class='heart_button__modal__empty' v-if='!likes.length'>
					No likes
				</div>
			</div>
		</modal-window>

		<span
			class='heart_button__heart fa'
			:class='{
				"heart_button__heart--unlikeable": !likeable,
				"heart_button__heart--liked": liked
			}'
			@click='changeLike'
		></span>
		<span class='heart_button__count' @click='showModal = true'>{{likes.length}}</span>
	</div>
</template>

<script>
	import ModalWindow from './ModalWindow'
	import AvatarIcon from './AvatarIcon'

	import AjaxErrorHandler from '../assets/js/errorHandler'

	export default {
		name: 'HeartButton',
		props: ['post'],
		components: {
			ModalWindow,
			AvatarIcon
		},
		data () {
			return {
				likes: this.post.Likes,
				showModal: false
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
			liked () {
				return this.likes.some(u => {
					return u.username === this.$store.state.username
				})
			}
		},
		methods: {
			getIndexOfUser () {
				let index

				for(let i = 0; i < this.likes.length; i++) {
					let user = this.likes[i]

					if(user.username === this.$store.state.username) {
						index = i
						break
					}
				}

				return index
			},
			changeLike (e) {
				let id = this.post.id

				if(!this.likeable) return

				if(!this.liked) {
					this.axios
						.put('/api/v1/post/' + id + '/like')
						.then(() => {
							return this.axios
								.get('/api/v1/user/' + this.$store.state.username)
						})
						.then(res => {
							this.likes.push(res.data)
						})
						.catch(AjaxErrorHandler(this.$store))
				} else {
					this.axios
						.delete('/api/v1/post/' + id + '/like')	
						.then(() => {
							this.likes.splice(this.getIndexOfUser(), 1)
						})
						.catch(AjaxErrorHandler(this.$store))
				}
			}
		}
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.heart_button {
		@at-root #{&}__modal {
			padding: 1rem;

			@at-root #{&}__header {
				font-size: 1.5rem;
				font-weight: bold;
				margin-bottom: 0.25rem;
			}
			@at-root #{&}__user {
				display: flex;
				align-items: centre;
				line-height: 2.2rem;
				max-height: 3rem;
				padding: 0.25rem;
				margin: 0 -0.25rem;
				border-bottom: solid thin $color__gray--primary;
				transition: background-color 0.2s;

				&:hover {
					background-color: $color__lightgray--primary;
				}

				&:last-child {
					border-bottom: none;
				}
			}
			@at-root #{&}__username {
				cursor: default;
				font-size: 1.25rem;
				margin-left: 0.5rem;
				margin-bottom: -0.4rem;
			}
			@at-root #{&}__empty {
				text-align: center;
				font-size: 1.5rem;
				user-select: none;
				cursor: default;
				color: $color__gray--darkest;
				font-style: italic;
				margin-bottom: 0.5rem;
			}
		}

		@at-root #{&}__count {
			@include user-select(none);

			cursor: default;
			font-size: 0.85rem;
			position: relative;
			bottom: 0.1rem;
		}

		@at-root #{&}__heart {
			@include user-select(none);

			cursor: pointer;
			color: $color__gray--darkest;
			transition: transform 0.2s, text-shadow 0.2s, color 0.2s, filter 0.2s;
			font-size: 1rem;

			&:hover {
				filter: brightness(0.9);
				transform: scale(1.1);
			}

			&::before {
				content: "\f004";
			}


			@at-root #{&}--liked {
				color: #E91E63;
			}
			@at-root #{&}--unlikeable {
				cursor: default;

				&:hover {
					filter: none;
					transform: none;
				}
			}
		}
	}
</style>