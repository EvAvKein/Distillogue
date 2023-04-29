<template>
	<main v-if="user.data?.permissions.admin">
		<nav aria-label="Admin navigation">
			<router-link
				v-for="page of pages"
				:to="{name: 'admin_' + page}"
				:inert="route.path.includes(page)"
				class="core_contentButton"
			>
				<img v-if="page === 'feeds'" src="../../assets/browse.svg" alt="Globe icon" />
				<!-- v-ifs instead of dynamic values due to vite limitations with dynamic src -->
				<span>{{ page }}</span>
			</router-link>
		</nav>
		<section id="adminPage">
			<router-view />
		</section>
	</main>
	<main v-else>
		<notification
			:text="'The page you attempted to visit is for administrators only'"
			:desirablityStyle="false"
			:customDuration="null"
		/>
	</main>
</template>

<script setup lang="ts">
	import {useUser} from "../../stores/user";
	import {useRoute} from "vue-router";
	import notification from "../../components/notification.vue";
	const user = useUser();
	const route = useRoute();

	const pages = ["feeds"] as const;
</script>

<style scoped>
	main {
		font-size: 1.5em;
		margin: 0 auto;
		padding: 1em;
		max-width: 70rem;
		display: flex;
		gap: 0.75em;
	}

	a {
		display: block;
		text-align: center;
		white-space: nowrap;
		font-weight: bold;
		padding: 0.4em;
	}

	img {
		height: 1.2em;
		vertical-align: bottom;
	}
	span {
		display: none;
		text-transform: capitalize;
		margin-left: 0.25em;
	}

	#adminPage {
		flex-grow: 1;
	}

	@media (min-width: 40em) {
		span {
			display: inline;
		}
	}
</style>
