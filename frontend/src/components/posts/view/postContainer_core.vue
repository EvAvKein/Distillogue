<template>
	<modalWrapper :activeByTruthiness="replyData.nodePath" @deactivate="() => (replyData.nodePath = null)">
		<div>
			<createReply :reply="replyData" />
		</div>
	</modalWrapper>

	<simpleLayout v-if="currentLayout === 'simple'" :postObject="postObject" />
	<!-- will later include v-else for other layouts, and some expandable menu for switching between layouts -->
</template>

<script setup lang="ts">
	import {ref, provide} from "vue";
	import {Node} from "../../../../../shared/objects/post";
	import modalWrapper from "../../modalWrapper.vue";
	import createReply from "../create/createNode.vue";

	import simpleLayout from "./simple/postContainer.vue";

	const props = defineProps<{
		postObject: Node;
	}>();

	type layout = "simple";
	const currentLayout = ref<layout>("simple");

	const replyData = ref<{nodePath: Node["id"][] | null}>({nodePath: null});
	provide("replyData", replyData);
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
