<template>
	<div class='overlay_message'>
		<span class='overlay_message__loading'>
			<loading-icon :dark='true'></loading-icon>
		</span>
		Loading...
	</div>
</template>

<script>
	import LoadingIcon from './LoadingIcon'

	export default {
		name: 'LoadingMessage',
		components: { LoadingIcon }
	}
</script>