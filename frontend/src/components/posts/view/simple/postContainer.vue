<template>
	<modalWrapper :activeByTruthiness="replyPath.nodePath" @deactivate="() => (replyPath.nodePath = null)">
		<div>
			<createReply :reply="replyPath" />
		</div>
	</modalWrapper>

	<section id="nodesContainer">
		<node :node="postObject.thread" :pathToNode="[]" />
	</section>
</template>

<script setup lang="ts">
	import {ref, provide} from "vue";
	import {Post, Node} from "../../../../../../shared/objects/post";
	import node from "./node.vue";
	import modalWrapper from "../../../modalWrapper.vue";
	import createReply from "../../create/createNode.vue";

	const props = defineProps<{
		postObject: Post;
	}>();

	const replyPath = ref<{nodePath: Node["id"][] | null}>({nodePath: null});
	provide("replyPath", replyPath);
</script>

<style scoped>
	div {
		box-sizing: border-box;
		width: clamp(20em, 90vw, 50em);
		background-color: var(--backgroundSubColor);
		padding: 0.5em 0.25em;
		border-radius: 1em;
	}

	#nodesContainer {
		padding: 0 0.5em 0;
		width: max-content;
		margin: auto;
	}
</style>
