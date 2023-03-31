<template>
	<section class="interactions">
		<section class="timestamps">
			<div>Posted: <timestamp :pastUnix="node.stats.timestamps.posted" /></div>
			<div v-if="node.stats.timestamps.interacted">
				Interacted: <timestamp :pastUnix="node.stats.timestamps.interacted" />
			</div>
		</section>
		<div class="interactable">
			<votes
				v-if="node.stats.votes"
				:interactionPath="nodePath"
				:voters="node.stats.votes"
				@interactionError="(errorText:string) => {interactionError = errorText}"
			/>
			<reply :locked="node.locked" :interactionPath="nodePath" class="replyButton" />
		</div>
		<notification v-model:text="interactionError" :desirablity-style="false" />
	</section>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import {Node} from "../../../../../../shared/objects/post";
	import timestamp from "../../../timestamp.vue";
	import votes from "./vote.vue";
	import reply from "./replyButton.vue";

	const props = defineProps<{
		node: Node;
		pathToNode: Node["id"][];
	}>();

	const nodePath = [...props.pathToNode, props.node.id];
	const interactionError = ref("");
</script>

<style scoped>
	.timestamps {
		font-size: 0.9em;
		margin-bottom: 0.25em;
		display: flex;
		flex-direction: row;
		text-align: center;
		gap: 1.5em;
	}

	.timestamps:has(div:nth-child(2)) {
		justify-content: space-between;
	}

	.interactable {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.5em;
	}

	.replyButton {
		margin: 0.5em 0.25em 0 auto;
	}
</style>
