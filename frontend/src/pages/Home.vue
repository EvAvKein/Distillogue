<template>
	<main>
		<h1>Distillogue</h1>
		<img src="../assets/logo.svg" alt="Distillogue's Logo: A chemistry flask, with bubbling liquids, hung on a stand" />

		<section>
			<router-link class="core_backgroundButton" :to="{name: 'about'}">About the project</router-link>
		</section>
	</main>
</template>

<script setup lang="ts">
	import notification from "../components/notification.vue";
</script>

<style scoped>
	main {
		font-size: clamp(0.7em, 2.5vw, 1.25em);
		max-width: 30em;
		margin-inline: auto;
		padding: 0 0.75em 0.75em;
	}

	h1 {
		font-size: 5em;
		text-align: center;
	}

	img {
		height: 12.5em;
		display: block;
		margin-inline: auto;
	}

	section {
		font-size: 1.25em;
	}
	a {
		display: block;
	}

	a + a {
		font-size: 0.8em;
		margin-top: 0.5em;
		text-align: center;
	}
</style>
