<template>
	<div>
		<labelledInput
			id="postsSearch"
			:inputId="'summariesSearchInput'"
			:type="'search'"
			v-model="searchValue"
			@input="debounce(1000, fetchAndEmitPosts)"
		/>
		<p v-show="summariesDescription">
			{{ summariesDescription }}
		</p>
	</div>
</template>

<script setup lang="ts">
	import {ref, onMounted} from "vue";
	import {PostSummary} from "../../../../../shared/objects/post";
	import {apiFetch} from "../../../helpers/apiFetch";
	import {debounce} from "../../../helpers/debounce";
	import labelledInput from "../../labelledInput.vue";

	const props = defineProps<{
		searchValue?: string;
		fetchAllOnMount?: true;
		adminEndpoint?: true;
	}>();
	const emit = defineEmits(["update:searchValue", "fetchedSummaries"]);

	const searchValue = ref<string>(props.searchValue ?? "");
	const summariesDescription = ref<string>("");

	async function fetchAndEmitPosts() {
		emit("update:searchValue", searchValue.value);
		summariesDescription.value = "Fetching Posts...";

		const fetchResponse = await apiFetch(
			"GET",
			(props.adminEndpoint ? "/admin" : "") + "/posts?search=" + searchValue.value
		);
		if (fetchResponse.error) {
			summariesDescription.value = fetchResponse.error.message;
			return;
		}

		const fetchedPosts = fetchResponse.data as PostSummary[];
		summariesDescription.value = `${fetchedPosts.length} result${fetchedPosts.length !== 1 ? "s" : ""}${
			searchValue.value ? ` for "${searchValue.value}"` : ""
		}`;

		emit("fetchedSummaries", fetchedPosts);
	}

	onMounted(() => {
		if (props.fetchAllOnMount) {
			fetchAndEmitPosts();
		}
	});
</script>

<style scoped>
	p {
		font-size: 0.6em;
		margin: 0.4em;
	}
</style>
