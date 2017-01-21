<template>
	<div class='route_container'>
		<header>Thread title</header>
		<input-editor name='thread'></input-editor>
		<div class='posts'>
			<div class='post'>
				<div class='post__meta_data'>
					<div class='post__avatar'>U</div>
					<div class='post__user'>Username</div>
					<div class='post__date'>17:34 21/01/17</div>
				</div>
				<div class='post__content'>
					Consectetur rhoncus a massa interdum quisque habitasse turpis est parturient arcu cum fusce id a eu odio ligula a praesent. Aliquam dis enim netus malesuada ridiculus convallis imperdiet nisi eu vestibulum imperdiet nibh a quam orci dignissim maecenas pretium lorem hac suspendisse hendrerit donec lacinia. Eu suspendisse sem diam nullam taciti dapibus lorem non euismod iaculis ante eros turpis parturient per. A diam auctor cras condimentum a aliquet odio egestas parturient condimentum ut tempus a massa a condimentum a a ullamcorper turpis a facilisi cubilia justo hendrerit adipiscing. Nascetur eu parturient purus dis rutrum placerat egestas adipiscing scelerisque odio penatibus a leo tristique risus eu mi a accumsan. 
					<br/><br/>
					Consectetur sagittis vulputate sit eget senectus mi nam curabitur cubilia sapien a habitant vestibulum suspendisse himenaeos ut a cubilia. Fames at a metus porttitor mi proin mollis lobortis proin id vulputate id vel libero malesuada nam id mattis justo sit tristique luctus taciti suspendisse.
				</div>
				<div class='post__actions'>
					<div class='post__reply'></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import InputEditor from '../InputEditor'

	export default {
		name: 'Thread',
		components: {
			InputEditor
		}
	}
</script>

<style lang='scss' scoped>
	@import '../../assets/scss/variables.scss';


</style>