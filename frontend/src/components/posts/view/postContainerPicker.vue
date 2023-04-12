<template>
	<simpleLayout v-if="currentLayout === 'simple'" :postObject="postObject" />
	<!-- will later include v-else for other layouts, and some expandable menu for switching between layouts -->
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import {Post} from "../../../../../shared/objects/post";

	import simpleLayout from "./simple/postContainer.vue";

	const props = defineProps<{
		postObject: Post;
	}>();

	type layout = "simple";
	const currentLayout = ref<layout>("simple");
</script>

<style scoped>
	div {
		box-sizing: border-box;
		width: clamp(20em, 90vw, 50em);
		background-color: var(--backgroundSubColor);
		padding: 0.5em 0.25em;
		border-radius: 1em;
	}
</style>
