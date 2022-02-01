<template>
  <div>
    <labelledInput id="postsSearch"
      :inputId="'postsSearchInput'"
      :type="'search'"
      v-model="searchValue"
      @input="debounce(fetchAndEmitPosts, 1000)"
    />
    <p v-show="summariesDescription">
      {{summariesDescription}}
    </p>
  </div>
</template>

<script setup lang="ts">
  import {ref, onMounted} from 'vue';
  import labelledInput from "./labelledInput.vue";
  import jsonFetch from "../helpers/jsonFetch";
  import debounce from "../helpers/debounce"

  const props = defineProps<{fetchOnMount?:boolean}>();
  const emit = defineEmits(["fetchedPosts"]);

  const searchValue = ref<string>("");

  type fetchedPosts = object[]|false|undefined;
  const summaries = ref<fetchedPosts>();
  const summariesDescription = ref<string>("");

  function setSummariesDescription(summaries:fetchedPosts) {
    if (summaries === undefined) {
      summariesDescription.value = "Fetching Posts...";
      return;
    };
    if (summaries === false) {
      summariesDescription.value = "Connection error: Failed to fetch posts :(";
      return;
    };
    summariesDescription.value = `${(summaries as object[]).length} result${(summaries as object[]).length == 1 ? "" : "s"}${searchValue.value ? ` for "${searchValue.value}"` : ""}`;
  };

  function fetchAndEmitPosts() {
    jsonFetch("/getPostSummaries", {filter: searchValue.value})
    .then((fetchResponse:fetchedPosts) => {
      summaries.value = fetchResponse;
      setSummariesDescription(summaries.value);
      emit('fetchedPosts', fetchResponse);
    })
  };

  onMounted(() => {
    if (props.fetchOnMount) {
      fetchAndEmitPosts()
    };
  });
</script>

<style scoped>
  p {
    font-size: 0.6em;
    margin: 0.4em;
  }
</style>