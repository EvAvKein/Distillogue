<template>
	<main>
		<summariesSearch
			id="summariesSearch"
			:fetchAllOnMount="true"
			@fetchedSummaries="(response:PostSummary[]) => {summariesArray = response}"
		/>
		<div>
			<summariesContainer :summariesArray="summariesArray" />
		</div>
	</main>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import {PostSummary} from "../../../shared/objects/post";
	import summariesContainer from "../components/posts/browse/summariesContainer.vue";
	import summariesSearch from "../components/posts/browse/summariesSearch.vue";
	const summariesArray = ref<PostSummary[]>([]);
</script>

<style scoped>
	main {
		width: clamp(10em, 90vw, 45em);
		margin: auto;
		padding: 0.5em;
	}

	div {
		padding-inline: 0.5em;
	}

	#summariesSearch {
		font-size: 1.5em;
		border-bottom: 0.1em solid var(--textColor);
	}
</style>
