<template>
	<main>
		<h1>Distillogue</h1>
		<img src="../assets/logo.svg" alt="Distillogue's Logo: A chemistry flask, with bubbling liquids, hung on a stand" />

		<section>
			<notification
				:text="`DISCLAIMER: THIS SITE IS A DEMO
          This project is in very early development, and any data you submit here is public and temporary`"
				:desirablityStyle="false"
				:customDuration="null"
			/>
			<router-link class="core_backgroundButton" :to="{name: 'terms'}">For more info</router-link>
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
</style>
