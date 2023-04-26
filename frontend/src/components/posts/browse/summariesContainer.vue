<template>
	<ol>
		<TransitionGroup name="posts">
			<li v-for="(summaryObject, i) in summariesArray" :key="summaryObject.id">
				<postSummary :summary="summaryObject" />
			</li>
		</TransitionGroup>
	</ol>
</template>

<script setup lang="ts">
	import {PostSummary} from "../../../../../shared/objects/post";
	import postSummary from "./summary.vue";

	defineProps<{
		summariesArray: PostSummary[];
	}>();
</script>

<style scoped>
	li + li {
		border-top: 0.15em solid var(--textColor);
	}

	.posts-enter-from,
	.posts-leave-to {
		opacity: 0;
		max-height: 0;
	}

	.posts-leave-from,
	.posts-enter-to {
		max-height: 5em;
		opacity: 1;
	}

	.posts-enter-active,
	.posts-leave-active {
		transition: all 400ms ease-out;
	}
</style>
