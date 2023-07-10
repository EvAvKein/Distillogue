<template>
	<section ref="nodeBranch" :class="'nodeBranch' + (central ? ' central' : '')">
		<section :id="central ? 'central' : undefined" :class="'node' + (expanded ? ' expanded' : '')">
			<h2 v-if="central" class="title">{{ node.title }}</h2>
			<button v-else class="core_contentButton titleButton" @click="() => (expanded = !expanded)">
				<h3 class="title">{{ node.title }}</h3>
			</button>
			<transition name="collapse">
				<section v-show="expanded" class="body">
					<p>{{ node.body }}</p>
					<interactions :node="node" :pathToNode="pathToNode" />
				</section>
			</transition>
		</section>

		<transition name="collapse">
			<section class="replies" v-show="node.replies.length && expanded">
				<button
					v-if="!central"
					class="repliesIndent core_backgroundButton"
					@click="() => (!central ? (expanded = !expanded) : null)"
				></button>
				<div v-else class="repliesIndent"></div>
				<node v-for="reply of node.replies" :node="reply" :pathToNode="nodePath" v-model:expanded="expanded" />
			</section>
		</transition>
	</section>
</template>

<script setup lang="ts">
	import {ref, Ref, watch} from "vue";
	import {Node as NodeObj} from "../../../../../../shared/objects/post"; // importing without renaming it causes vite to mix up this class (Node) with this component (node.vue, referenced in the template for recursion) and thus throw an error on runtime when trying to load a node with replies
	import interactions from "../nodeInteractions/interactions.vue";

	const props = defineProps<{
		node: NodeObj;
		pathToNode: NodeObj["id"][];
	}>();

	const central = !props.pathToNode.length;
	const nodePath = [...props.pathToNode, props.node.id];

	const expanded = ref(central) as Ref<boolean>;

	const nodeBranch = ref<HTMLElement | null>(null);
	watch(expanded, () => {
		setTimeout(() => nodeBranch.value?.scrollIntoView({inline: "start", behavior: "smooth"})); // without a timeout it executes before the UI expands, therefore failing to account for its expanded width
	});
</script>

<style>
	.titleButton {
		text-align: inherit;
		width: 100%;
	}
	h2,
	h3 {
		margin: 0;
	}

	p {
		white-space: pre-line;
		margin-bottom: 1em;
	}

	.replies {
		position: relative;
		padding: 0.5em 0 0 1.25em;
		margin: 0 0 0 1.05em;
	}

	.repliesIndent {
		position: absolute;
		top: 0;
		left: 0;
		height: calc(100% + 0.25em);
		width: 0.9em;
		padding: 0;
		background-color: var(--backgroundSubColor);
		border-radius: 0 0 0.5em 0.5em;
	}
	button.repliesIndent:hover,
	button.repliesIndent:focus,
	button.repliesIndent:active {
		opacity: 0.7;
	}

	.node {
		background-color: var(--backgroundSubColor);
		padding: 1em;
		border-radius: 1em;
		box-sizing: border-box;
		width: clamp(15em, 95vw, 40em);
		scroll-snap-align: start;
	}

	.node#central {
		font-size: 1.1em;
		margin-top: 0;
		max-width: 50em;
	}

	.node:not(#central) {
		max-width: 87.5vw;
	}

	.node h2 {
		font-size: 1.6em;
	}
	.node h3 {
		font-size: 1.5em;
	}

	.node > * + * {
		margin-top: 1.25em;
	}

	.nodeBranch + .nodeBranch {
		margin-top: 0.5em;
	}
</style>
