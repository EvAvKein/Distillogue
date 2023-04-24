<template>
	<modalWrapper :activeByTruthiness="replyPath.nodePath" @deactivate="() => (replyPath.nodePath = null)">
		<form @submit.prevent>
			<editNode v-model:data="replyData" />
			<notification v-model:text="notifText" :desirablityStyle="false" />
			<button id="submitButton" type="button" class="core_backgroundButton" @click="submitReply">
				Reply
				{{
					typeof replyData.deletedDraftIndex === "number" ? ` (& delete draft ${replyData.deletedDraftIndex + 1})` : ""
				}}
			</button>
		</form>
	</modalWrapper>

	<section id="nodesContainer">
		<node :node="postObject.thread" :pathToNode="[]" />
	</section>
</template>

<script setup lang="ts">
	import {ref, provide} from "vue";
	import {Post, Node} from "../../../../../../shared/objects/post";
	import {NodeInteractionRequest, NodeCreationRequest} from "../../../../../../shared/objects/api";
	import {apiFetch} from "../../../../helpers/apiFetch";
	import node from "./node.vue";
	import modalWrapper from "../../../modalWrapper.vue";
	import editNode from "../../edit/editNode.vue";
	import notification from "../../../notification.vue";
	import {useRouter} from "vue-router";
	const router = useRouter();

	const props = defineProps<{
		postObject: Post;
	}>();

	const replyPath = ref<{nodePath: Node["id"][] | null}>({nodePath: null});
	provide("replyPath", replyPath);

	const replyData = ref<NodeCreationRequest>({
		title: "",
		body: "",
		deletedDraftIndex: undefined,
	});

	const notifText = ref("");

	async function submitReply() {
		const response = await apiFetch(
			"POST",
			"/posts/interactions",
			new NodeInteractionRequest(
				replyPath.value.nodePath!,
				"reply",
				new NodeCreationRequest(replyData.value.title, replyData.value.body, replyData.value.deletedDraftIndex)
			)
		);

		if (response.error) {
			notifText.value = response.error.message;
			return;
		}

		router.go(0);
	}
</script>

<style scoped>
	form {
		box-sizing: border-box;
		width: clamp(20em, 90vw, 50em);
		background-color: var(--backgroundSubColor);
		padding: 0.5em 0.5em;
		border-radius: 0.75em;
	}

	#submitButton {
		width: 100%;
	}

	#nodesContainer {
		padding: 0 0.5em 0;
		width: max-content;
		margin: auto;
	}
</style>
