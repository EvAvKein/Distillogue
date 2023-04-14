<template>
	<main>
		<h3>Page Not Found!</h3>
		<button @click="() => router.go(-1)" class="core_borderButton">Back to previous page</button>
	</main>
</template>

<script setup lang="ts">
	import {useRouter} from "vue-router";
	const router = useRouter();
</script>

<style scoped>
	main {
		text-align: center;
	}

	h3 {
		font-size: 3em;
		margin-bottom: 0.25em;
	}
</style>
