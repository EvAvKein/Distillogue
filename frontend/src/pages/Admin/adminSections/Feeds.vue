<template>
	<section>
		<summariesSearch
			id="summariesSearch"
			:fetchAllOnMount="true"
			:adminEndpoint="true"
			@fetchedSummaries="(response:PostSummary[]) => {summariesArray = response}"
		/>
		<div>
			<summariesContainer :summariesArray="summariesArray" />
		</div>
	</section>
</template>

<script setup lang="ts">
	import {ref} from "vue";
	import {PostSummary} from "../../../../../shared/objects/post";
	import summariesContainer from "../../../components/posts/browse/summariesContainer.vue";
	import summariesSearch from "../../../components/posts/browse/summariesSearch.vue";
	const summariesArray = ref<PostSummary[]>([]);
</script>

<style scoped>
	section {
		font-size: 0.7em;
	}

	div {
		padding-inline: 0.5em;
	}

	#summariesSearch {
		font-size: 1.5em;
		border-bottom: 0.1em solid var(--textColor);
	}
</style>
