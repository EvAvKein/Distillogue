<template>
	<section id="summariesFinder">
		<summariesSearch
			id="summariesSearch"
			:fetchAllOnMount="true"
			@fetchedSummaries="(response:PostSummary[]) => {summariesArray = response}"
		/>
		<div>
			<summariesContainer v-if="summariesArray && summariesArray.length" :summariesArray="summariesArray" />
		</div>
	</section>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import {PostSummary} from "../../../../../shared/objects/post";
	import summariesContainer from "./summariesContainer.vue";
	import summariesSearch from "./summariesSearch.vue";
	const summariesArray = ref<PostSummary[] | undefined>(undefined);
</script>

<style scoped>
	#summariesFinder {
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
