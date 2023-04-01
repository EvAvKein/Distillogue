<template>
	<section id="nodesContainer">
		<node :node="postObject.thread" :pathToNode="[]" />
	</section>
</template>

<script setup lang="ts">
	import node from "./node.vue";
	import {Post} from "../../../../../../shared/objects/post";

	const props = defineProps<{
		postObject: Post;
	}>();
</script>

<style scoped>
	#nodesContainer {
		padding: 0 0.5em 0;
		width: max-content;
		margin: auto;
	}
</style>
