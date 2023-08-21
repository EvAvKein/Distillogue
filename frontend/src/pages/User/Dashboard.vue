<template>
	<main>
		<nav aria-label="Dashboard navigation">
			<router-link
				v-for="page of pages"
				:to="{name: 'dashboard_' + page}"
				:inert="route.path.includes(page)"
				class="core_contentButton"
			>
				<img v-if="page === 'profile'" src="../../assets/userWithoutPfp.svg" alt="Non-descript person icon" />
				<img v-else-if="page === 'drafts'" src="../../assets/drafts.svg" alt="Paper tray icon" />
				<img v-else-if="page === 'presets'" src="../../assets/presets.svg" alt="Icon of stacked tabs with cogwheels" />
				<img v-else-if="page === 'contacts'" src="../../assets/contacts.svg" alt="Address book icon" />
				<img v-else-if="page === 'sessions'" src="../../assets/key.svg" alt="Key icon" />
				<!-- v-ifs instead of dynamic values due to vite limitations with dynamic src -->
				<span>{{ page }}</span>
			</router-link>
		</nav>
		<section id="dashboardPage">
			<router-view />
		</section>
	</main>
</template>

<script setup lang="ts">
	import {useRoute} from "vue-router";
	const route = useRoute();

	const pages = ["profile", "drafts", "presets", "contacts", "sessions"] as const;
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

	#dashboardPage {
		flex-grow: 1;
	}

	@media (min-width: 40em) {
		span {
			display: inline;
		}
	}
</style>
