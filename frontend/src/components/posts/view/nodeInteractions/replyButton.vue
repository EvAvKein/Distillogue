<template>
	<button @click="reply" :aria-label="locked ? 'Replies locked' : 'Reply'" class="core_contentButton">
		<img v-if="locked" src="../../../../assets/locked.svg" alt="Padlock icon" />
		<!-- would've used a ternary src attribute if vite compiled it appropriately -->
		<img v-else src="../../../../assets/reply.svg" alt="Speech bubble icon" />
	</button>
</template>

<script setup lang="ts">
	import {inject, Ref} from "vue";
	import {Node} from "../../../../../../shared/objects/post";
	import {useUser} from "../../../../stores/user";
	const user = useUser();

	const props = defineProps<{
		interactionPath: Node["id"][];
		locked?: true;
	}>();
	const emit = defineEmits(["interactionError", "replyToNode"]);
	const replyData = inject("replyData") as Ref<{nodePath: Node["id"][] | null}>;

	function reply() {
		if (props.locked) {
			emit("interactionError", "Replies locked");
			return;
		}

		if (!user.data) {
			emit("interactionError", "Must be logged in to reply");
			return;
		}

		replyData.value.nodePath = props.interactionPath;
	}
</script>

<style scoped>
	button {
		background-color: transparent;
		margin: 0;
		padding: 0;
	}
	button img {
		height: 1.8em;
	}
</style>
