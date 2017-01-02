<template>
	<div class='modal_window__overlay'>
		<div class='modal_window'>
			Placeholder content<br/>
			Placeholder content<br/>
			Placeholder content<br/>
			Placeholder content<br/>
			Placeholder content<br/>
			Placeholder content<br/>
			Placeholder content<br/>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'ModalWindow',
		props: ['showModal'],
		data () {
			return {

			}
		}
	}
</script>

<style lang='scss' scoped>
	.modal_window__overlay {
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: 0;
		left: 0;
	}
	.modal_window {
		width: 20rem;
		background-color: #fff;
	}
</style>