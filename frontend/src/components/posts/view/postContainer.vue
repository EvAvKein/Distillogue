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

	<section id="postInfoWrapper" :class="postInfoVisiblity ? 'visible' : ''">
		<div>
			<button
				id="postInfoWrapperButton"
				class="core_contentButton"
				aria-label="expand post info"
				@click="postInfoVisiblity = !postInfoVisiblity"
			>
				<div>V</div>
			</button>
		</div>
		<div aria-live="assertive" :aria-hidden="!postInfoVisiblity" :inert="!postInfoVisiblity">
			<postInfo
				:post="postObject"
				:moderationInputs="true"
				@postUpdate="(updatedPost:Post) => emit('update:postObject', updatedPost)"
			/>
		</div>
	</section>
</template>

<script setup lang="ts">
	import {ref, provide} from "vue";
	import {Post, Node} from "../../../../../shared/objects/post";
	import {NodeInteractionRequest, NodeCreationRequest} from "../../../../../shared/objects/api";
	import {apiFetch} from "../../../helpers/apiFetch";
	import node from "./node.vue";
	import modalWrapper from "../../modalWrapper.vue";
	import editNode from "../edit/editNode.vue";
	import notification from "../../notification.vue";
	import postInfo from "./postInfo.vue";
	import {useRouter} from "vue-router";
	const router = useRouter();

	const props = defineProps<{
		postObject: Post;
	}>();

	const emit = defineEmits(["update:postObject"]);

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

	const postInfoVisiblity = ref(false);
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

	#postInfoWrapper {
		--buttonSize: 2em;
		--transitionTime: 200ms;
		z-index: 925;
		overflow: hidden;
		position: fixed;
		height: 100vh;
		width: 100vw;
		overflow: auto;
		bottom: calc(-100% + var(--buttonSize));
		transition: bottom var(--transitionTime) ease-in-out;
	}
	#postInfoWrapper.visible {
		bottom: 0;
	}

	#postInfoWrapperButton {
		display: block;
		margin-left: auto;
		height: var(--buttonSize);
		width: var(--buttonSize);
		border-top-left-radius: 0.5em;
		text-align: center;
		background-color: var(--backgroundSubColor);
	}

	#postInfoWrapperButton div {
		height: 0.9em;
		transition: rotate var(--transitionTime) ease-in-out;
	}
	#postInfoWrapper:not(.visible) #postInfoWrapperButton div {
		rotate: 180deg;
	}

	#postInfoWrapper.visible div:nth-child(1) {
		backdrop-filter: blur(1rem);
	}

	#postInfoWrapper div:nth-child(2) {
		opacity: 0; /* to avoid the element from being momentarily visible on page load */
		height: calc(100vh - var(--buttonSize));
		background-color: var(--backgroundSubColor);
		transition: opacity 1ms var(--transitionTime);
	}

	#postInfoWrapper.visible div:nth-child(2) {
		opacity: 1;
		transition: opacity 1ms 1ms; /* 0 values caused the transition to not work, for whatever reason */
	}
</style>
