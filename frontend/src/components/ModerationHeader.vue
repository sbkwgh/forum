<template>
	<div class='moderation_header'>
		<h1 class='moderation_header__h1'>Moderation</h1>	
		<div class='moderation_header__tabs'>
			<div @click='$router.push("reports")' class='tab_button' :class='{
				"tab_button--selected": selectedTab === "reports" 
			}'>
				Reports
			</div>
			<div @click='$router.push("bans")' class='tab_button' :class='{
				"tab_button--selected": selectedTab === "bans"
			}'>
				Banned users
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'ModerationHeader',
		props: ['selected-tab']
	}
</script>

<style lang='scss' scoped>
	@import '../assets/scss/variables.scss';

	.moderation_header {
		@at-root #{&}__h1 {
			margin: 0.5rem 0;
		}
		@at-root #{&}__tabs {
			margin-bottom: 1rem;
			border-bottom: 0.2rem solid $color__gray--darker;
			width: 15rem;
		}
	}
</style>