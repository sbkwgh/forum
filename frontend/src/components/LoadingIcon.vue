<template>
	<div
		class='loading_icon'
		:class='{"loading_icon--dark": dark }'
	>
			<span></span>
			<span></span>
			<span></span>
	</div>
</template>

<script>
	export default {
		name: 'LoadingIcon',
		props: ['dark']
	}
</script>

<style lang='scss'>
	@import '../assets/scss/variables.scss';

	@keyframes loading {
		0% {
			transform: scale(0.75);
		}
		50% {
			transform: scale(1.25);
		}
		100% {
			transform: scale(0.75);
		}
	}

	.loading_icon {
		transition: all 0.2s;
		display: flex;
		justify-content: center;
		align-items: center;

		pointer-events: none;

		@at-root #{&}--dark {
			span {
				background-color: $color__darkgray--primary !important;
			}
		}

		span {
			height: 0.5rem;
			width: 0.5rem;
			display: inline-block;
			border-radius: 100%;
			background-color: rgba(256,256,256,0.9);
			animation-name: loading;
			animation-duration: 1s;
			animation-timing-function: linear;
			animation-iteration-count: infinite;
			margin: 0 0.25rem;

			&:nth-child(2n) { animation-delay: 0.333s; }
			&:nth-child(3n) { animation-delay: 0.666s; }
		}
	}
</style>
